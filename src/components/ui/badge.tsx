// =============================================================================
// Badge component — Modern Black & Emerald Green Dark Theme
// =============================================================================
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
  {
    variants: {
      variant: {
        default:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-300",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-400",
        outline:
          "border-zinc-800 text-zinc-400 bg-black/40",
        success:
          "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
