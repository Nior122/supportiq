/**
 * SupportIQ UI Badge - Premium AI Rebrand
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/5 text-primary shadow-sm",
        secondary: "border-secondary/20 bg-secondary/5 text-secondary shadow-sm",
        success: "border-green-500/20 bg-green-500/5 text-green-500 shadow-sm",
        warning: "border-yellow-500/20 bg-yellow-500/5 text-yellow-500 shadow-sm",
        destructive: "border-destructive/20 bg-destructive/5 text-destructive shadow-sm",
        outline: "border-border bg-background text-foreground shadow-sm",
        gradient: "border-none bg-ai-gradient text-white shadow-glow",
      },
    },
    defaultVariants: { variant: "default" },
  },
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
