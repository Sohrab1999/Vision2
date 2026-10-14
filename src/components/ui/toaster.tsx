"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { announceToast, isAssertiveToast } from "@/lib/announcer"
import { useEffect, type ReactNode } from "react"

// Task 171 — one announcement per toast, fired by this dedicated child so
// the effect is keyed to a single mount (the map keys it by toast id).
// Error toasts («خطا» in the title) take the assertive channel — they must
// INTERRUPT a screen reader, not queue politely. Title stays first in the
// composed message; the description (if any) follows after an em-dash.
// Only STRING content is announced: the useToast type allows rich ReactNode
// titles, and screen-reader text for node trees is out of scope — every
// current call site passes plain strings (audit: 50/50).
function ToastAnnouncer({ id, title, description }: { id: string; title?: ReactNode; description?: ReactNode }) {
  const t = typeof title === "string" ? title : ""
  const d = typeof description === "string" ? description : undefined
  useEffect(() => {
    if (!t && !d) return
    announceToast(t, d, isAssertiveToast(t))
  }, [id, t, d])
  return null
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <ToastAnnouncer id={id} title={title} description={description} />
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}