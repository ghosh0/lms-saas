// =============================================================================
// Button component — Modern Black & Emerald Green Dark Theme
// =============================================================================
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-black font-semibold hover:bg-emerald-400 active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] border border-emerald-400/40",
        destructive:
          "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-[0.98] shadow-sm",
        outline:
          "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800/80 hover:text-emerald-400 hover:border-emerald-500/40 backdrop-blur-sm",
        secondary:
          "bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700",
        ghost:
          "hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-100",
        link:
          "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
