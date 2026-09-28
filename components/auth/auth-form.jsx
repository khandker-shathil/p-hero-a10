"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { passwordError } from "@/lib/auth-validation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

const inputClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

export function AuthForm({ register = false, returnTo = "/" }) {
  const router = useRouter()
  const notify = useToast()
  const { data: session, isPending } = authClient.useSession()
  const [busy, setBusy] = useState(null)
  const [visible, setVisible] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (session?.user) router.replace(returnTo)
  }, [session?.user, router, returnTo])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) {
      notify("Google sign-in was not completed. Please try again.", "error")
    }
  }, [notify])

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid")
      notify(
        invalid?.validationMessage || "Please complete all required fields.",
        "error"
      )
      invalid?.focus()
      return
    }
    const fields = new FormData(form)
    const email = fields.get("email").trim()
    const name = fields.get("name")?.trim()
    const image = fields.get("image")?.trim()
    if (register) {
      if (!name) return notify("Please enter your name.", "error")
      const error = passwordError(password)
      if (error) return notify(error, "error")
      if (image && !/^https?:\/\//i.test(image))
        return notify("Photo URL must start with https:// or http://.", "error")
    }
    setBusy("email")
    try {
      const result = register
        ? await authClient.signUp.email({
            name,
            email,
            password,
            ...(image ? { image } : {}),
          })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        notify(
          result.error.message || "Unable to sign in. Please try again.",
          "error"
        )
        return
      }
      // Confirm the cookie-backed session before entering a protected route.
      const refreshed = await authClient.getSession({
        query: { disableCookieCache: true },
      })
      if (refreshed.error || !refreshed.data) {
        notify(
          "Your sign-in could not be confirmed. Please try logging in again.",
          "error"
        )
        return
      }
      authClient.hydrateSession(refreshed.data)
      notify(
        register
          ? "Your account is ready. Welcome to Digital Life Lessons!"
          : "You’re logged in. Welcome back!"
      )
      router.replace(returnTo)
    } catch {
      notify("Could not connect. Please try again in a moment.", "error")
    } finally {
      setBusy(null)
    }
  }

  async function googleSignIn() {
    if (busy) return
    setBusy("google")
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: returnTo,
        errorCallbackURL: `${register ? "/register" : "/login"}?error=google&returnTo=${encodeURIComponent(returnTo)}`,
      })
      if (result.error) {
        notify(
          result.error.message ||
            "Google sign-in is unavailable. Please use email instead.",
          "error"
        )
        setBusy(null)
      }
    } catch {
      notify("Could not start Google sign-in. Please try again.", "error")
      setBusy(null)
    }
  }

  if (isPending || session?.user)
    return (
      <div
        role="status"
        className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        {isPending ? "Loading…" : "Redirecting…"}
      </div>
    )

  return (
    <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-6xl items-center gap-16 px-6 py-12 lg:grid-cols-2 lg:px-8 lg:py-20">
      <div className="hidden lg:block">
        <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-accent">
          <BookOpen className="size-7" aria-hidden="true" />
        </div>
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          A little reflection. A lifetime of growth.
        </p>
        <h2 className="max-w-md text-5xl leading-tight font-semibold tracking-tight">
          Every experience has a lesson worth keeping.
        </h2>
        <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
          Make space for what life teaches you. Save your insights, share your
          story, and learn from others.
        </p>
        <div className="mt-10 space-y-4 text-sm">
          {[
            "Keep your lessons in one place",
            "Discover wisdom from the community",
            "Start your journey with a free account",
          ].map((text) => (
            <p key={text} className="flex items-center gap-3">
              <Check
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              {text}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {register ? "Start your next chapter" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {register
            ? "Create an account to collect and share life’s lessons."
            : "Log in to pick up where you left off."}
        </p>

        <Button
          type="button"
          variant="outline"
          disabled={!!busy}
          onClick={googleSignIn}
          className="mt-7 h-11 w-full"
        >
          {busy === "google" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          {busy === "google" ? "Connecting to Google…" : "Continue with Google"}
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          noValidate
          onSubmit={submit}
          className="space-y-4"
          aria-busy={!!busy}
        >
          <fieldset disabled={!!busy} className="space-y-4">
            {register && (
              <Field label="Full name" id="name">
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your name"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Email address" id="email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>
            {register && (
              <Field label="Photo URL (optional)" id="image">
                <input
                  id="image"
                  name="image"
                  type="url"
                  autoComplete="url"
                  placeholder="https://example.com/your-photo.jpg"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Password" id="password">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby={register ? "password-help" : undefined}
                  placeholder={
                    register ? "Create a password" : "Enter your password"
                  }
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {visible ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {register && (
                <p
                  id="password-help"
                  className="mt-2 text-xs leading-5 text-muted-foreground"
                >
                  At least 6 characters, including an uppercase and a lowercase
                  letter.
                </p>
              )}
            </Field>
            <Button
              type="submit"
              disabled={!!busy}
              className="mt-2 h-11 w-full"
            >
              {busy === "email" ? (
                <>
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {register ? "Creating account…" : "Logging in…"}
                </>
              ) : (
                <>
                  {register ? "Create account" : "Log in"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </fieldset>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {register ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={`${register ? "/login" : "/register"}?returnTo=${encodeURIComponent(returnTo)}`}
            className="rounded font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  )
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z"
      />
    </svg>
  )
}
