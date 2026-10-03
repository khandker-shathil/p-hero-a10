"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, LoaderCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function ActivatePremium({ sessionId }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState(null)
  const key = `${sessionId}:${attempt}`
  const current = state?.key === key ? state : null
  useEffect(() => {
    const controller = new AbortController()
    async function activate() {
      try {
        const response = await fetch("/api/billing/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) {
          setState({
            key,
            error:
              result.error || "Couldn’t activate Premium. Please try again.",
            login: response.status === 401,
          })
          return
        }
        const refreshed = await authClient.getSession({
          query: { disableCookieCache: true },
        })
        if (!refreshed.data?.user?.isPremium)
          throw new Error(
            "Premium is saved, but your session hasn’t refreshed yet. Try again to refresh it."
          )
        authClient.hydrateSession(refreshed.data)
        if (!controller.signal.aborted) setState({ key, active: true })
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key,
            error:
              error.message || "Couldn’t activate Premium. Please try again.",
          })
      }
    }
    activate()
    return () => controller.abort()
  }, [sessionId, key])
  if (!current)
    return (
      <p role="status" className="mt-6 flex items-center gap-2 text-sm">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Activating your Premium access…
      </p>
    )
  if (current.active)
    return (
      <p
        role="status"
        className="mt-6 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle className="size-5" aria-hidden="true" />
        Premium is active. You can now read and create premium lessons.
      </p>
    )
  return (
    <div role="alert" className="mt-6 rounded-lg border p-4">
      <p className="text-sm">{current.error}</p>
      {current.login ? (
        <Link
          className="mt-3 inline-block text-sm underline"
          href={`/login?returnTo=${encodeURIComponent(`/pricing/success?session_id=${sessionId}`)}`}
        >
          Log in to activate
        </Link>
      ) : (
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
