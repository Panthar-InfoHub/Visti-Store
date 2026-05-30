"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { siteConfig } from "@/site.config";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);
      const { error } = await resetPassword({
        newPassword: formData.password,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      setResetSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if token is present
  if (!token) {
    return (
      <main className="py-20 flex items-center justify-center px-4 min-h-[60vh]">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xs rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 md:p-10 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

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

          {!resetSuccess ? (
            <>
              {/* Headings */}
              <h1 className="text-3xl font-bold text-center text-foreground mb-2 tracking-tight">
                Reset Password
              </h1>
              <p className="text-center font-semibold text-muted-foreground mb-8 text-sm">
                Enter your new password below
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Password Reset Successfully!
                </h1>
                <p className="text-muted-foreground mb-8">
                  Your password has been reset successfully. You can now sign in with your new
                  password.
                </p>

                <Link href="/login">
                  <Button className="w-full">Continue to Login</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="py-20 flex items-center justify-center px-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
