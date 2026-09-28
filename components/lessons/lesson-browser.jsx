"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  LoaderCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { LessonCard } from "@/components/lessons/lesson-card"
import { CATEGORIES, TONES, lessonSearchParams } from "@/lib/lesson-filters"
import { authClient } from "@/lib/auth-client"

const inputStyle =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function LessonBrowser({ filters }) {
  const router = useRouter()
  const [transitioning, startTransition] = useTransition()
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const { data: session, isPending } = authClient.useSession()
  const query = lessonSearchParams(filters).toString()
  const viewer = `${session?.user?.id || "guest"}:${!!session?.user?.isPremium}`
  useEffect(() => {
    if (isPending) return
    const controller = new AbortController()
    fetch(`/api/lessons?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("We couldn’t load lessons. Please try again.")
        return response.json()
      })
      .then((data) => {
        setError("")
        setResult({ ...data, viewer })
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [query, attempt, viewer, isPending])
  const current = result?.viewer === viewer ? result : null
  const loading = !error && (!current || isPending || transitioning)
  const hasFilters = !!(filters.q || filters.category || filters.tone)

  function navigate(next) {
    startTransition(() =>
      router.push(`/public-lessons?${lessonSearchParams(next)}`, {
        scroll: false,
      })
    )
  }
  function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    navigate({
      q: values.get("q").trim(),
      category: values.get("category"),
      tone: values.get("tone"),
      sort: values.get("sort"),
      page: 1,
    })
  }
  function retry() {
    setError("")
    setResult(null)
    setAttempt(attempt + 1)
  }

  return (
    <div>
      <header className="border-b bg-[#f5f5ef] dark:bg-[#1b211c]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            <BookOpen className="size-4" aria-hidden="true" />
            Wisdom, shared
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A little perspective for your journey.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Explore real experiences, quiet realizations, and lessons worth
            carrying forward. Find a story that meets you where you are.
          </p>
        </div>
      </header>
      <section
        className="mx-auto max-w-7xl px-6 py-10 lg:px-8"
        aria-label="Browse public lessons"
      >
        <form
          onSubmit={submit}
          className="rounded-2xl border bg-card p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Find your next lesson
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="block text-xs font-medium">
              Search lessons
              <div className="relative mt-2">
                <Search
                  className="absolute top-3.5 left-3 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  name="q"
                  type="search"
                  maxLength={100}
                  defaultValue={filters.q}
                  placeholder="A title, a thought, a keyword…"
                  className={`${inputStyle} pl-9`}
                />
              </div>
            </label>
            <label className="block text-xs font-medium">
              Category
              <select
                name="category"
                defaultValue={filters.category}
                className={`${inputStyle} mt-2`}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              Emotional tone
              <select
                name="tone"
                defaultValue={filters.tone}
                className={`${inputStyle} mt-2`}
              >
                <option value="">All emotions</option>
                {TONES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              Sort by
              <select
                name="sort"
                defaultValue={filters.sort}
                className={`${inputStyle} mt-2`}
              >
                <option value="newest">Newest first</option>
                <option value="most-saved">Most saved</option>
              </select>
            </label>
            <Button
              type="submit"
              disabled={transitioning}
              className="h-11 px-5"
            >
              {transitioning ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              Search
            </Button>
          </div>
          {(hasFilters || filters.sort !== "newest") && (
            <Link
              href="/public-lessons"
              className="mt-4 inline-block rounded text-xs text-muted-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear all filters
            </Link>
          )}
        </form>
        <div className="my-7 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {hasFilters ? "Your search results" : "Explore the collection"}
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {loading
              ? "Finding lessons…"
              : current && !error
                ? `${current.total} ${current.total === 1 ? "lesson" : "lessons"}${filters.q ? ` matching “${filters.q}”` : " to explore"}`
                : ""}
          </p>
        </div>
        <div aria-busy={loading}>
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-dashed py-16 text-center"
            >
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={retry} variant="outline" className="mt-5">
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div
              role="status"
              className="flex min-h-72 items-center justify-center gap-3 text-sm text-muted-foreground"
            >
              <LoaderCircle
                className="size-5 animate-spin"
                aria-hidden="true"
              />
              Loading lessons…
            </div>
          ) : current?.items.length ? (
            <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
              {current.items.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} saved />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
              <BookOpen
                className="mx-auto mb-5 size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold">
                {hasFilters
                  ? "No lessons match just yet"
                  : "The first story starts with you"}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {hasFilters
                  ? "Try a different keyword or broaden your filters."
                  : "Public lessons will appear here as our community shares them."}
              </p>
              <Link
                href={hasFilters ? "/public-lessons" : "/dashboard/add-lesson"}
                className={`${buttonVariants({ variant: "outline" })} mt-6`}
              >
                {hasFilters ? "Reset filters" : "Share a lesson"}
              </Link>
            </div>
          )}
        </div>
        {!loading && !error && current?.total > 0 && (
          <nav
            aria-label="Lesson pages"
            className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
          >
            <p className="text-sm text-muted-foreground">
              Showing {(current.page - 1) * current.pageSize + 1}–
              {Math.min(current.page * current.pageSize, current.total)} of{" "}
              {current.total}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={current.page <= 1}
                onClick={() => navigate({ ...filters, page: current.page - 1 })}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Previous
              </Button>
              <span aria-current="page" className="text-sm">
                {current.page} / {current.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={current.page >= current.totalPages}
                onClick={() => navigate({ ...filters, page: current.page + 1 })}
              >
                Next
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        )}
      </section>
    </div>
  )
}
