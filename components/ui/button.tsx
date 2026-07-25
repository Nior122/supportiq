/**
 * SupportIQ UI Button - Premium AI Blue Rebrand
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-glow hover:bg-primary-dark",
        secondary:
          "border border-slate-300 bg-white text-primary hover:bg-slate-50 dark:bg-transparent dark:border-slate-700 dark:hover:bg-slate-800/50",
        outline:
          "border border-primary/20 bg-transparent text-primary hover:bg-primary/5",
        ghost: "hover:bg-primary/5 text-slate-600 dark:text-slate-400 hover:text-primary",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-ai-gradient-primary text-white shadow-glow hover:opacity-90 border-none",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
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
  },
);
Button.displayName = "Button";

export { Button };
