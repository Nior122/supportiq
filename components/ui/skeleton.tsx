/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Pure CSS shimmer placeholder for loading states. No client-side JS needed.
 * The `.skeleton` class (globals.css) handles the shimmer animation; this component
 * just applies a height/width + the class so usage is `<Skeleton className="h-8 w-48" />`.
 */
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
