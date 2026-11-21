"use client";

// =============================================================================
// Navbar — Modern Black & Emerald Header with Live Credit Counter & Auth State
// =============================================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Coins, PlusCircle, LogIn, LogOut, BookOpen, Layers, Radio } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/dashboard");
    router.refresh();
  };

  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = userRole === "admin";
  const credits = (session?.user as unknown as { credits?: number })?.credits ?? 0;

  return (
    <nav className="border-b border-zinc-900 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            AI Learning Studio
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1 font-mono text-xs">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/dashboard"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum
          </Link>

          <Link
            href="/courses/create"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/courses/create"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {isAdmin ? "Create Course" : "Create Course (5 Credits)"}
          </Link>

          {!isAdmin && (
            <Link
              href="/credits"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === "/credits"
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Buy Credits
            </Link>
          )}
        </div>

        {/* Right Section: Credits & Auth */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Credit Balance Pill (Only for regular users, hidden for admin) */}
              {!isAdmin && (
                <Link
                  href="/credits"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-950 border border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
                  title="Click to top up credits"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{credits}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Credits</span>
                </Link>
              )}

              {/* User Name & Sign Out */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                {(session?.user as unknown as { role?: string })?.role === "admin" && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-400 font-semibold uppercase">
                    Admin
                  </span>
                )}
                <span className="max-w-[120px] truncate">{session.user.name}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : isPending ? (
            <div className="w-20 h-8 rounded-lg bg-zinc-900 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-mono text-xs">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-mono text-xs">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

