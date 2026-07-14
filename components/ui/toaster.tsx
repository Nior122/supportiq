"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The mount point that reconciles our `useToast` state store with the Radix Toast
 * viewport. Rendered once from `<AppProviders>` (providers.tsx); every other
 * component calls `toast({...})` to enqueue, and this component visually renders the
 * queue. Keeping it small means it's always in sync with the store.
 */
import { useToast } from "@/hooks/use-toast";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map((t) => {
        const { id, title, description, variant, action, ...rest } = t;
        return (
          <Toast key={id} variant={variant ?? "default"} {...rest}>
            <div className="flex flex-col gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
