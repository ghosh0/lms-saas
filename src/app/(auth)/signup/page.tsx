"use client";

// =============================================================================
// Sign Up Page — Email + Password & Google OAuth (Modern Black & Emerald)
// =============================================================================

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Radio, Lock, Mail, User as UserIcon, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email + Password Sign Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }

    setLoadingEmail(true);
    setError(null);

    const res = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    setLoadingEmail(false);

    if (res.error) {
      setError(res.error.message || "Failed to create account");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  // Google OAuth Sign Up
  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setError(null);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      console.error("[SignUp] Google error:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign up.");
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Join AI Learning Studio</h1>
          <p className="text-sm text-zinc-400 mt-1">Sign up to start learning & creating live AI courses</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingEmail}
            className="w-full py-5 text-sm font-semibold border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 flex items-center justify-center gap-3 transition-all"
          >
            {loadingGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Sign up with Google</span>
          </Button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative px-3 bg-zinc-950 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Or sign up with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all font-sans"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="w-full mt-2 py-5 font-semibold font-mono text-xs"
            >
              {loadingEmail ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Register Account</span> <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href={callbackUrl !== "/dashboard" ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <SignUpForm />
    </Suspense>
  );
}
