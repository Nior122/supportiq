/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Card is the workhorse surface (rounded-xl, hairline border, soft shadow) that every
 * dashboard widget + form wraps in. We expose semantic sub-components (Header/Title/
 * Description/Content/Footer) so the assembly reads like a document, and screen
 * readers can articulate the card structure. Keeping styles on these primitives means
 * a margin inconsistency can't drift between pages.
 *
 * The `interactive` prop adds hover lift + border highlight — used on clickable cards
 * like the bot list (the user intuitively understands the whole card is tappable).
 */
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-card",
      interactive &&
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
