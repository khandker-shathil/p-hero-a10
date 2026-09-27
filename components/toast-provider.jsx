"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { CheckCircle2, CircleAlert, X } from "lucide-react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const notify = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timeout)
  }, [toast])
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed right-4 bottom-6 z-50 max-w-sm"
      >
        {toast && (
          <div className="flex items-start gap-3 rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
            {toast.type === "error" ? (
              <CircleAlert
                className="size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            )}
            <p>{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
              className="rounded focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
