// =============================================================================
// Dashboard Page — Modern Black & Emerald Marketplace & Curriculum (Zero Emojis)
// =============================================================================

import Script from "next/script";
import { CourseCatalog } from "@/components/CourseCatalog";
import { Navbar } from "@/components/Navbar";
import { PlusCircle, Coins } from "lucide-react";
import { getLessonsAction, getCurrentUserAction } from "@/actions/lessons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [lessonsResult, userResult] = await Promise.all([
    getLessonsAction(),
    getCurrentUserAction(),
  ]);

  const lessons = lessonsResult.success && lessonsResult.data ? lessonsResult.data : [];
  const user = userResult.success && userResult.data ? userResult.data : null;
  const isAdmin = user?.role === "admin";

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 relative overflow-hidden flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Navbar />

      {/* Ambient lighting & subtle grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-zinc-800/80">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {user ? `Welcome back, ${user.name}` : "AI Learning Studio"}
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl leading-relaxed">
                {isAdmin
                  ? "Learn with real-time AI teachers or publish unlimited courses across the curriculum."
                  : "Learn with real-time AI teachers or publish your own courses. 1 live course = 5 credits. Sell created courses at any price you want."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/courses/create">
                <Button className="font-mono text-xs">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  {isAdmin ? "Create Course" : "Create Course (5 Cr)"}
                </Button>
              </Link>
              {!isAdmin && (
                <Link href="/credits">
                  <Button variant="outline" className="font-mono text-xs">
                    <Coins className="w-4 h-4 mr-1.5 text-emerald-400" />
                    Buy Credits
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Course Catalog with Search & Subject Filter */}
        <CourseCatalog initialLessons={lessons} />
      </div>
    </main>
  );
}
