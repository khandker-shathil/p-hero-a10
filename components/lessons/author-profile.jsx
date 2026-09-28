"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Avatar, LessonCard } from "./lesson-card"
import { Button } from "@/components/ui/button"

export function AuthorProfile({ id }) {
  const { data: session, isPending } = authClient.useSession()
  const viewer = `${session?.user?.id || "guest"}:${!!session?.user?.isPremium}`
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (isPending) return
    const controller = new AbortController()
    fetch(`/api/authors/${encodeURIComponent(id)}?page=${page}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            response.status === 404
              ? "Author not found."
              : "Couldn’t load this author. Please try again."
          )
        return response.json()
      })
      .then((result) => {
        setData({ ...result, viewer, requestedPage: page })
        setError("")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [id, page, viewer, isPending, attempt])
  const current =
    data?.viewer === viewer && data?.requestedPage === page ? data : null
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <Link
        href="/public-lessons"
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        Back to public lessons
      </Link>
      {error ? (
        <div role="alert" className="py-16 text-center">
          <p>{error}</p>
          <Button
            className="mt-5"
            onClick={() => {
              setError("")
              setAttempt((x) => x + 1)
            }}
          >
            Try again
          </Button>
        </div>
      ) : !current || isPending ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-20"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading author…
        </div>
      ) : (
        <>
          <header className="my-10 rounded-2xl border bg-muted/30 p-8">
            <Avatar name={current.author.name} image={current.author.image} />
            <h1 className="mt-5 text-3xl font-semibold">
              {current.author.name}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {current.total} public lessons shared with the community
            </p>
          </header>
          <h2 className="mb-6 text-xl font-semibold">Lessons, newest first</h2>
          {current.items.length ? (
            <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
              {current.items.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} saved />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              This author hasn’t shared any public lessons yet.
            </p>
          )}
          {current.totalPages > 1 && (
            <nav
              aria-label="Author lesson pages"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                disabled={current.page === 1}
                onClick={() => setPage(current.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                {current.page} / {current.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={current.page >= current.totalPages}
                onClick={() => setPage(current.page + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
