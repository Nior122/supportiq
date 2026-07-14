"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Adapted from shadcn/ui's toast pattern (Radix Toast + a Zustand store). We keep
 * this local instead of importing shadcn generated files verbatim so we can tune the
 * API (typed variants, dismiss-all) and avoid an extra dependency on `react-hot-toast`.
 *
 * Vitest policy: this store is pure state — no timers, no network — so it's directly
 * unit-testable. The `<Toaster>` UI consumes the store via this hook.
 */
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 4; // Avoid stacking 20 toasts on an error storm.
const TOAST_DURATION = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD: "ADD",
  DISMISS: "DISMISS",
  REMOVE: "REMOVE",
  UPDATE: "UPDATE",
} as const;

type Action =
  | { type: "ADD"; toast: ToasterToast }
  | { type: "UPDATE"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS"; id?: string }
  | { type: "REMOVE"; id?: string };

interface State {
  toasts: ToasterToast[];
}

let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return {
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE":
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };
    case "DISMISS": {
      const { id } = action;
      return {
        toasts: state.toasts.map((t) =>
          t.id === id || id === undefined ? { ...t, open: false } : t,
        ),
      };
    }
    case "REMOVE":
      return {
        toasts:
          action.id === undefined
            ? []
            : state.toasts.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  for (const l of listeners) l(memoryState);
}

type ToastOptions = Pick<
  ToasterToast,
  "variant" | "title" | "description" | "action" | "duration"
>;

export function toast(options: ToastOptions) {
  const id = genId();
  const dismiss = () => dispatch({ type: "DISMISS", id });

  dispatch({
    type: "ADD",
    toast: {
      ...options,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss; we keep a single timer per toast (no global scheduler).
  if (options.duration !== Infinity) {
    setTimeout(dismiss, options.duration ?? TOAST_DURATION);
  }

  return {
    id,
    dismiss,
    update: (patch: Partial<ToasterToast>) =>
      dispatch({ type: "UPDATE", toast: { ...patch, id } }),
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS", id }),
  };
}
