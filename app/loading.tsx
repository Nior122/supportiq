/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Root loading state shown during the very first navigation. Most surfaces have
 * their own loading.tsx nested deeper — this is the outer fallback.
 */
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
