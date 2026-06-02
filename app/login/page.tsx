"use client";

// Login page should always be fresh (no cache)
export const dynamic = "force-dynamic";

import { signIn, useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Automatically redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Error during sign-in. Please try again.");
      console.error("Error during sign-in:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/visti-image/background-login.png"
          alt="Login Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Centered Minimal Authentication Card */}
      <div className="relative z-10 w-full max-w-[28rem] px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 sm:p-12 shadow-2xl text-center space-y-8 border border-neutral-100/50">
          {/* Brand Identity */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#2d2d2d] tracking-tight">
              Vishti Store
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xs mx-auto">
              Exquisite Jewelry for Every Moment
            </p>
          </div>

          {/* Social Sign-in Trigger */}
          <div className="pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-gray-700 font-medium text-[15px] py-4 px-6 rounded-full shadow-xs hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
              ) : (
                <Image
                  src="/images/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="shrink-0 mr-1"
                />
              )}
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
