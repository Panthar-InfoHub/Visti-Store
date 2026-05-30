"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { siteConfig } from "@/site.config";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const { error } = await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-20 flex items-center justify-center px-4 min-h-[60vh]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xs rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center items-center mx-auto mb-6 relative rounded-lg w-44 h-12">
            <Image
              src={siteConfig.logo.path}
              alt={siteConfig.logo.alt}
              fill
              className="object-contain"
            />
          </div>

          {!emailSent ? (
            <>
              {/* Headings */}
              <h1 className="text-3xl font-bold text-center text-foreground mb-2 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-center font-semibold text-muted-foreground mb-8 text-sm">
                No worries, we&apos;ll send you reset instructions
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6">
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-8">
                  We&apos;ve sent a password reset link to <br />
                  <span className="font-semibold text-foreground">{email}</span>
                </p>

                <div className="space-y-4">
                  <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
                    Try Another Email
                  </Button>

                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
