"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, LoaderCircle, LockKeyhole } from "lucide-react"
import { CATEGORIES, TONES } from "@/lib/lesson-filters"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

const selectStyle =
  "mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"

export function MyFavorites() {
  const router = useRouter()
  const notify = useToast()
  const [filters, setFilters] = useState({ category: "", tone: "", page: 1 })
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [version, setVersion] = useState(0)
  const [removing, setRemoving] = useState(null)
  const query = new URLSearchParams(filters).toString()
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/my-favorites?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json()
        if (response.status === 401)
          router.replace("/login?returnTo=%2Fdashboard%2Fmy-favorites")
        if (!response.ok)
          throw new Error(data.error || "Couldn’t load your favorites.")
        setResult({ ...data, query })
        setError("")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [query, version, router])
  const data = result?.query === query ? result : null
  function changeFilter(key, value) {
    setError("")
    setFilters((current) => ({ ...current, [key]: value, page: 1 }))
  }
  function reset() {
    setError("")
    setFilters({ category: "", tone: "", page: 1 })
  }
  async function remove(lesson) {
    if (removing) return
    setRemoving(lesson.id)
    try {
      const response = await fetch(
        `/api/my-favorites/${encodeURIComponent(lesson.id)}`,
        { method: "DELETE" }
      )
      const data = await response.json()
      if (response.status === 401)
        router.replace("/login?returnTo=%2Fdashboard%2Fmy-favorites")
      if (!response.ok)
        throw new Error(data.error || "Couldn’t remove this favorite.")
      notify("Removed from favorites.")
      setResult(null)
      setVersion((value) => value + 1)
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setRemoving(null)
    }
  }
  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Favorites
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Keep the lessons that speak to you close, and return to them
            whenever you need.
          </p>
        </div>
        <Link
          href="/public-lessons"
          className={buttonVariants({ variant: "outline" })}
        >
          Explore lessons
        </Link>
      </div>
      <div className="mb-7 grid items-end gap-4 rounded-xl border bg-card p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-medium">
          Category
          <select
            value={filters.category}
            onChange={(event) => changeFilter("category", event.target.value)}
            className={selectStyle}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Emotional tone
          <select
            value={filters.tone}
            onChange={(event) => changeFilter("tone", event.target.value)}
            className={selectStyle}
          >
            <option value="">All emotions</option>
            {TONES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          className="h-11"
          disabled={!filters.category && !filters.tone}
          onClick={reset}
        >
          Clear filters
        </Button>
      </div>
      {error ? (
        <div role="alert" className="rounded-xl border p-8 text-center">
          <p>{error}</p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setError("")
              setResult(null)
              setVersion((value) => value + 1)
            }}
          >
            Try again
          </Button>
        </div>
      ) : !data ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-20 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading your favorites…
        </div>
      ) : !data.items.length ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <Bookmark
            className="mx-auto mb-5 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">
            {filters.category || filters.tone
              ? "No favorites match these filters"
              : "Your collection starts with one lesson"}
          </h2>
          <p className="mt-3 mb-6 text-sm text-muted-foreground">
            {filters.category || filters.tone
              ? "Try a different category or emotional tone."
              : "Save a lesson from its details page to find it here."}
          </p>
          {filters.category || filters.tone ? (
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          ) : (
            <Link href="/public-lessons" className={buttonVariants()}>
              Browse lessons
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Your saved lessons with category, emotional tone, date saved,
                and actions
              </caption>
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  {[
                    "Lesson",
                    "Category",
                    "Emotional tone",
                    "Saved",
                    "Actions",
                  ].map((title) => (
                    <th
                      key={title}
                      scope="col"
                      className="px-4 py-4 font-medium whitespace-nowrap"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((lesson) => (
                  <tr key={lesson.id} className="border-b last:border-0">
                    <td className="max-w-80 min-w-52 px-4 py-5">
                      <p className="font-medium break-words">{lesson.title}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        {lesson.locked && (
                          <LockKeyhole className="size-3" aria-hidden="true" />
                        )}
                        {!lesson.available
                          ? "Deleted or no longer accessible"
                          : lesson.locked
                            ? "Premium — upgrade to read"
                            : lesson.accessLevel === "premium"
                              ? "Premium"
                              : "Free"}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-xs whitespace-nowrap">
                      {lesson.category || "—"}
                    </td>
                    <td className="px-4 py-5 text-xs whitespace-nowrap">
                      {lesson.emotionalTone || "—"}
                    </td>
                    <td className="px-4 py-5 text-xs whitespace-nowrap text-muted-foreground">
                      {lesson.savedAt &&
                      !Number.isNaN(new Date(lesson.savedAt).getTime())
                        ? new Date(lesson.savedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        {lesson.available && (
                          <Link
                            href={`/lessons/${encodeURIComponent(lesson.id)}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            See details
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!!removing}
                          onClick={() => remove(lesson)}
                          aria-label={`Remove ${lesson.title} from favorites`}
                        >
                          {removing === lesson.id ? "Removing…" : "Remove"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p role="status" className="text-sm text-muted-foreground">
              {data.total} saved {data.total === 1 ? "lesson" : "lessons"}
              {filters.category || filters.tone ? " matching your filters" : ""}
            </p>
            {data.totalPages > 1 && (
              <nav
                aria-label="Favorites pages"
                className="flex items-center gap-3"
              >
                <Button
                  variant="outline"
                  disabled={data.page <= 1 || !!removing}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: data.page - 1,
                    }))
                  }
                >
                  Previous
                </Button>
                <span className="text-sm">
                  {data.page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={data.page >= data.totalPages || !!removing}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: data.page + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </nav>
            )}
          </div>
        </>
      )}
    </section>
  )
}
