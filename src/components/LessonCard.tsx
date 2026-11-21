"use client";

// =============================================================================
// LessonCard — Modern Black & Emerald Dashboard Card with Marketplace & Notes
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  BookOpen,
  ArrowUpRight,
  FlaskConical,
  Landmark,
  Sigma,
  Sparkles,
  FileText,
  User,
  IndianRupee,
  Lock,
  Loader2,
  Atom,
  Cpu,
  LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  durationMins: number;
  priceInRupees?: number;
  creatorId?: string | null;
  creator?: {
    id: string;
    name: string;
    role?: string | null;
  } | null;
  pdfUrl?: string | null;
  pdfName?: string | null;
  isCreator?: boolean;
  isPurchased?: boolean;
  hasAccess?: boolean;
}

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Chemistry: FlaskConical,
  "World History": Landmark,
  Mathematics: Sigma,
  Physics: Atom,
  "Computer Science": Cpu,
};

export function LessonCard({
  id,
  title,
  description,
  subject,
  gradeLevel,
  durationMins,
  priceInRupees = 0,
  creator,
  pdfUrl,
  pdfName,
  isCreator = false,
  isPurchased = false,
  hasAccess = true,
}: LessonCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as unknown as { role?: string })?.role === "admin";
  const userHasAccess = hasAccess || isAdmin;

  const IconComponent = SUBJECT_ICONS[subject] ?? Sparkles;
  const isFree = priceInRupees === 0;

  const handleAction = async () => {
      if (userHasAccess) {
        router.push(`/room/${id}`);
        return;
      }

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setPurchasing(true);
      setError(null);

      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "COURSE",
            lessonId: id,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to create order.");
        }

        if (data.free) {
          router.push(`/room/${id}`);
          return;
        }

        if (!window.Razorpay) {
          throw new Error("Razorpay checkout is loading. Please retry in a moment.");
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "AI Learning Studio",
          description: `Enroll in ${title}`,
          order_id: data.orderId,
          prefill: {
            name: data.user?.name || session.user.name,
            email: data.user?.email || session.user.email,
          },
          theme: {
            color: "#10b981",
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                type: "COURSE",
                lessonId: id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            router.push(`/room/${id}`);
            router.refresh();
          },
          modal: {
            ondismiss: () => {
              setPurchasing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
          setError(resp.error?.description || "Payment failed.");
          setPurchasing(false);
        });
        rzp.open();
      } catch (err: unknown) {
        console.error("[LessonCard] Checkout error:", err);
        setError(err instanceof Error ? err.message : "Payment error");
        setPurchasing(false);
      }
    };

    return (
    <Card className="flex flex-col border-zinc-800/80 bg-zinc-950/70 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all duration-300 group relative overflow-hidden">
      {/* Top emerald edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:text-emerald-300 group-hover:bg-emerald-950/20 transition-all duration-200">
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Price Pill */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                isFree || isAdmin
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 bg-zinc-900 text-white"
              }`}
            >
              {isFree ? "FREE" : isAdmin ? `₹${priceInRupees} (Admin Free)` : `₹${priceInRupees}`}
            </span>

            <Badge variant="secondary" className="text-[11px] font-mono">
              {subject}
            </Badge>
          </div>
        </div>

        <CardTitle className="text-lg font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors duration-200 leading-snug">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {/* Creator & Notes info */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900 text-xs text-zinc-400 font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <User className="w-3.5 h-3.5" />
              {creator?.role === "admin"
                ? `Admin: ${creator.name}`
                : creator?.name
                ? `By ${creator.name}`
                : "Studio Curriculum"}
            </span>

            <div className="flex items-center gap-1.5">
              {creator?.role === "admin" && (
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 font-mono">
                  Admin
                </span>
              )}
              {isCreator && (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 font-mono">
                  You Created
                </span>
              )}
            </div>
          </div>

          {/* PDF Notes badge if uploaded */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400/90 hover:text-emerald-300 hover:underline mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px]">{pdfName || "Course Notes (PDF)"}</span>
            </a>
          )}

          {/* Metadata pills */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-zinc-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500/80" />
              {gradeLevel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500/80" />
              {durationMins} min
            </span>
          </div>
        </div>

        {error && <p className="text-[11px] font-mono text-rose-400 mt-2">{error}</p>}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full justify-between group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          onClick={handleAction}
          disabled={purchasing}
          variant={userHasAccess ? "default" : "outline"}
        >
          {purchasing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : userHasAccess ? (
            <>
              <span>Enter Voice Room</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Unlock Course (₹{priceInRupees})
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card >
  );
}
