"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Crown,
  LoaderCircle,
  Plus,
  TrendingUp,
  UserRound,
} from "lucide-react"
import { Avatar } from "@/components/lessons/lesson-card"
import { GrowthChart } from "@/components/dashboard/growth-chart"
import { Button, buttonVariants } from "@/components/ui/button"

const shortcuts = [
  {
    href: "/dashboard/add-lesson",
    label: "Add a lesson",
    description: "Capture something life has taught you.",
    Icon: Plus,
  },
  {
    href: "/dashboard/my-lessons",
    label: "My lessons",
    description: "Revisit and manage your reflections.",
    Icon: BookOpen,
  },
  {
    href: "/dashboard/my-favorites",
    label: "My favorites",
    description: "Return to the wisdom you’ve saved.",
    Icon: Bookmark,
  },
  {
    href: "/dashboard/profile",
    label: "My profile",
    description: "Update your name and photo.",
    Icon: UserRound,
  },
]
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
}

export function UserDashboard() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/dashboard", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json()
        if (response.status === 401)
          router.replace("/login?returnTo=%2Fdashboard")
        if (!response.ok)
          throw new Error(data.error || "Couldn’t load your dashboard.")
        setState({ data, attempt })
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ error: error.message, attempt })
      })
    return () => controller.abort()
  }, [attempt, router])
  const current = state?.attempt === attempt ? state : null
  if (!current)
    return (
      <p
        role="status"
        className="flex items-center justify-center gap-3 py-20 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading your dashboard…
      </p>
    )
  if (current.error)
    return (
      <div role="alert" className="rounded-xl border p-8">
        <p>{current.error}</p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </Button>
      </div>
    )
  const { user, stats, recentLessons, contributions } = current.data
  return (
    <section>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            key={user.image || user.name}
            name={user.name}
            image={user.image}
          />
          <div>
            <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Your space to reflect
            </p>
            <h1 className="text-3xl font-semibold tracking-tight break-words">
              Welcome back, {user.name}.
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border px-3 py-1 capitalize">
                {user.role}
              </span>
              {user.isPremium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  <Crown className="size-3.5" aria-hidden="true" />
                  Premium
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1">
                  Free plan
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/add-lesson"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus aria-hidden="true" />
          Add a lesson
        </Link>
      </header>
      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Lessons created", stats.lessonsCreated, BookOpen],
          ["Saved favorites", stats.lessonsSaved, Bookmark],
          [
            "Lessons in the last 30 days",
            stats.recentContributions,
            TrendingUp,
          ],
        ].map(([label, count, Icon]) => (
          <div key={label} className="rounded-xl border bg-card p-6">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-3 text-4xl font-semibold">{count}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <GrowthChart title="Your reflections" points={contributions} />
        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            Make time for a little growth
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your next insight doesn’t have to be big. Start wherever you are.
          </p>
          <nav
            aria-label="Dashboard shortcuts"
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
          >
            {shortcuts.map(({ href, label, description, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </section>
      </div>
      <section className="mt-10" aria-labelledby="recent-lessons-heading">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="recent-lessons-heading" className="text-xl font-semibold">
            Recently added lessons
          </h2>
          <Link
            href="/dashboard/my-lessons"
            className="text-sm font-medium underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        {recentLessons.length ? (
          <div className="divide-y rounded-xl border bg-card">
            {recentLessons.map((lesson) => (
              <article
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <h3 className="font-medium break-words">{lesson.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {lesson.category} · {formatDate(lesson.createdAt)} ·{" "}
                    <span className="capitalize">
                      {lesson.visibility} · {lesson.accessLevel}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/lessons/${encodeURIComponent(lesson.id)}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Read lesson <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <BookOpen
              className="mx-auto mb-4 size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="font-semibold">
              Your story starts with one lesson.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture an experience, a mistake, or a moment of gratitude.
            </p>
            <Link
              href="/dashboard/add-lesson"
              className={`${buttonVariants()} mt-5`}
            >
              Write your first lesson
            </Link>
          </div>
        )}
      </section>
    </section>
  )
}
