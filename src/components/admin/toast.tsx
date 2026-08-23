"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Toasts for /admin.
 *
 * The panel used to confirm a save by doing nothing visible: the write went
 * through, revalidatePath fired, router.refresh() re-rendered the same values,
 * and the only way to know it worked was to open the public page. Errors were
 * slightly better — a small red line inside the form — but a Cloudinary upload
 * finishing had no signal at all.
 *
 * So: every write and every upload now says what happened, where it went, and
 * whether it is actually visible on the site.
 */

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
};

type Push = (t: Omit<Toast, "id">) => void;

const ToastContext = createContext<Push | null>(null);

/** Errors stay until dismissed — they usually need reading twice. */
const DISMISS_MS: Record<ToastKind, number | null> = {
  success: 4000,
  info: 5000,
  error: null,
};

export function useToast(): Push {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used inside <ToastProvider>");
  return push;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<Push>(
    (t) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { ...t, id }]);
      const ms = DISMISS_MS[t.kind];
      if (ms) setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );

  // `push` is stable, so this never re-renders consumers unnecessarily.
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // aria-live so a save is announced, not just drawn.
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:w-[22rem]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto w-full rounded-xl border bg-card p-3 shadow-lg",
              t.kind === "error"
                ? "border-destructive/40"
                : t.kind === "success"
                  ? "border-foreground/25"
                  : "border-border"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn(
                  "mt-1 size-1.5 shrink-0 rounded-full",
                  t.kind === "error"
                    ? "bg-destructive"
                    : t.kind === "success"
                      ? "bg-foreground"
                      : "bg-muted-foreground"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{t.title}</p>
                {t.detail ? (
                  <p className="mt-0.5 break-words text-[11px] leading-snug text-muted-foreground">
                    {t.detail}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 px-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
