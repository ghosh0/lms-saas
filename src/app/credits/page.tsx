"use client";

// =============================================================================
// Credits Store — Modern Black & Emerald Tiered Purchase with Razorpay
// =============================================================================

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CREDIT_TIERS, CreditTier } from "@/lib/razorpay";
import {
  Coins,
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Radio,
} from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function CreditsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const userCredits = (session?.user as unknown as { credits?: number })?.credits ?? 0;
  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  const handleBuyTier = async (tier: CreditTier) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoadingTier(tier.id);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Create order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREDITS",
          tierId: tier.id,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // 2. Open Razorpay Modal
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout SDK is not loaded yet. Please refresh.");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Learning Studio",
        description: `Purchase ${tier.credits} Course Creation Credits`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || session.user.name,
          email: orderData.user?.email || session.user.email,
        },
        theme: {
          color: "#10b981", // Emerald green
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify payment signature on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                type: "CREDITS",
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setSuccessMsg(`Payment confirmed! ${tier.credits} credits added to your balance.`);
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } catch (vErr: unknown) {
            console.error("Verification error:", vErr);
            setError(vErr instanceof Error ? vErr.message : "Verification failed.");
          } finally {
            setLoadingTier(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingTier(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
        setError(resp.error?.description || "Payment failed or was canceled.");
        setLoadingTier(null);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error("[CreditsPage] Order error:", err);
      setError(err instanceof Error ? err.message : "Unable to initiate payment.");
      setLoadingTier(null);
    }
  };

  const tiersList = Object.values(CREDIT_TIERS);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 relative overflow-hidden flex flex-col">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />

      <Navbar />

      {/* Ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Radio className="w-1.5 h-1.5 animate-pulse" />
            1 LIVE COURSE = 5 CREDITS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Creator Credits Store
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 leading-relaxed">
            Acquire credits to create and deploy autonomous AI live courses. Sell created courses to other students at any price you choose.
          </p>

          {/* Current Balance Bar */}
          {session?.user && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)] font-mono">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Current Balance:</span>
              <span className="text-base font-bold text-white">
                {isAdmin ? "Unlimited (Admin)" : `${userCredits} Credits`}
              </span>
              {!isAdmin && (
                <span className="text-[10px] text-zinc-500">({Math.floor(userCredits / 5)} Courses Available)</span>
              )}
            </div>
          )}
        </div>

        {/* Admin Unlimited Banner */}
        {isAdmin && (
          <div className="max-w-xl mx-auto mb-12 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Administrator Access Active</h3>
            <p className="text-sm text-zinc-400 mb-6">
              You have administrator privileges with unlimited credits. You do not need to purchase credits to create courses or access the curriculum.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="font-mono text-xs">
              Return to Curriculum
            </Button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-8 max-w-xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-8 max-w-xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 3 Pricing Tiers Grid (Only for regular users) */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiersList.map((tier) => {
            const isPopular = tier.popular;
            const coursesCount = Math.floor(tier.credits / 5);

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${
                  isPopular
                    ? "bg-zinc-950 border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                    : "bg-zinc-950/70 border border-zinc-800 hover:border-emerald-500/50"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{tier.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {tier.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl md:text-4xl font-extrabold text-white">₹{tier.amountInRupees}</span>
                    <span className="text-xs text-zinc-500 font-mono">INR</span>
                  </div>

                  <p className="text-xs text-emerald-400 font-mono mb-6">
                    ₹{(tier.amountInRupees / tier.credits).toFixed(2)} per credit
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-3 pt-4 border-t border-zinc-900 text-xs text-zinc-300 font-mono mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white">{tier.credits} Total Credits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Create {coursesCount} Live Courses</span>
                    </li>
                    {tier.bonusCredits > 0 ? (
                      <li className="flex items-center gap-2 text-emerald-400">
                        <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">+{tier.bonusCredits} Free Bonus Credits</span>
                      </li>
                    ) : (
                      <li className="flex items-center gap-2 text-zinc-500">
                        <Check className="w-4 h-4 text-zinc-600 shrink-0" />
                        <span>Standard Allocation</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Full Marketplace Selling Rights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>PDF Notes Upload Access</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => handleBuyTier(tier)}
                  disabled={loadingTier !== null}
                  variant={isPopular ? "default" : "outline"}
                  className="w-full py-6 font-semibold"
                >
                  {loadingTier === tier.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Gateway...
                    </span>
                  ) : (
                    <span className="flex items-center justify-between w-full">
                      <span>Get {tier.credits} Credits</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        )}

        {/* Security / Razorpay info banner */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Encrypted payment gateway powered by Razorpay. Credits are added to your balance immediately upon confirmation.</span>
          </div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest shrink-0">100% SECURE CHECKOUT</span>
        </div>
      </main>
    </div>
  );
}

