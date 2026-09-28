"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, LoaderCircle, Plus } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useToast } from "@/components/toast-provider"
import { Button, buttonVariants } from "@/components/ui/button"

export function MyLessons() {
  const { data: session } = authClient.useSession()
  const notify = useToast()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState(null)
  const [selected, setSelected] = useState(null)
  const dialog = useRef(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/my-lessons?page=${page}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json()
        if (response.status === 401)
          router.replace("/login?returnTo=%2Fdashboard%2Fmy-lessons")
        if (!response.ok)
          throw new Error(result.error || "Couldn’t load your lessons.")
        setData(result)
        setError("")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [page, version, router])
  function reload() {
    setData(null)
    setError("")
    setVersion((x) => x + 1)
  }
  async function update(lesson, body, method = "PATCH") {
    if (busy) return
    setBusy(lesson.id)
    try {
      const response = await fetch(
        `/api/my-lessons/${encodeURIComponent(lesson.id)}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          ...(body ? { body: JSON.stringify(body) } : {}),
        }
      )
      const result = await response.json()
      if (response.status === 401)
        router.replace("/login?returnTo=%2Fdashboard%2Fmy-lessons")
      if (!response.ok)
        throw new Error(result.error || "Couldn’t update your lesson.")
      notify(method === "DELETE" ? "Lesson deleted." : "Lesson updated.")
      if (method === "DELETE") {
        dialog.current?.close()
        setSelected(null)
        reload()
      } else
        setData((current) => ({
          ...current,
          items: current.items.map((item) =>
            item.id === lesson.id ? { ...item, ...body } : item
          ),
        }))
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(null)
    }
  }
  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Lessons</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your reflections, all in one place. Decide what to keep private and
            what to share.
          </p>
        </div>
        <Link href="/dashboard/add-lesson" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Add a lesson
        </Link>
      </div>
      {error ? (
        <div role="alert" className="rounded-xl border p-8 text-center">
          <p>{error}</p>
          <Button className="mt-5" variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : !data ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-20 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading your lessons…
        </div>
      ) : !data.items.length ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <BookOpen
            className="mx-auto mb-4 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">
            Your first lesson starts here
          </h2>
          <p className="mt-3 mb-6 text-sm text-muted-foreground">
            Save a moment, a realization, or something you wish you’d known
            sooner.
          </p>
          <Link href="/dashboard/add-lesson" className={buttonVariants()}>
            Write a lesson
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Your lessons, visibility, access level, engagement, and
                management actions
              </caption>
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  {[
                    "Lesson",
                    "Created",
                    "Visibility",
                    "Access",
                    "Likes / saves",
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
                    <td className="max-w-72 min-w-52 px-4 py-5">
                      <p className="font-medium break-words">{lesson.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.category} · {lesson.emotionalTone}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-xs whitespace-nowrap text-muted-foreground">
                      {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-4 py-5">
                      <select
                        aria-label={`Visibility for ${lesson.title}`}
                        value={lesson.visibility}
                        disabled={!!busy}
                        onChange={(event) =>
                          update(lesson, { visibility: event.target.value })
                        }
                        className="rounded-lg border bg-background px-2 py-2 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <span
                        title={
                          !session?.user?.isPremium
                            ? "Upgrade to Premium to change access levels."
                            : undefined
                        }
                      >
                        <select
                          aria-label={`Access level for ${lesson.title}`}
                          value={lesson.accessLevel}
                          disabled={!!busy || !session?.user?.isPremium}
                          onChange={(event) =>
                            update(lesson, { accessLevel: event.target.value })
                          }
                          className="rounded-lg border bg-background px-2 py-2 text-xs disabled:opacity-60"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </span>
                    </td>
                    <td className="px-4 py-5 text-xs whitespace-nowrap">
                      {lesson.likesCount} likes / {lesson.savesCount} saves
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          Details
                        </Link>
                        <Link
                          href={`/dashboard/update-lesson/${lesson.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!!busy}
                          onClick={() => {
                            setSelected(lesson)
                            dialog.current?.showModal()
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {data.total} {data.total === 1 ? "lesson" : "lessons"}
            </p>
            {data.totalPages > 1 && (
              <nav
                aria-label="My lessons pages"
                className="flex items-center gap-3"
              >
                <Button
                  variant="outline"
                  disabled={data.page <= 1 || !!busy}
                  onClick={() => {
                    setData(null)
                    setPage(data.page - 1)
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  {data.page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={data.page >= data.totalPages || !!busy}
                  onClick={() => {
                    setData(null)
                    setPage(data.page + 1)
                  }}
                >
                  Next
                </Button>
              </nav>
            )}
          </div>
        </>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 id="delete-title" className="text-xl font-semibold">
          Delete this lesson?
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          “{selected?.title}” and its comments, favorites, and reports will be
          permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={() => dialog.current.close()}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!!busy || !selected}
            onClick={() => update(selected, null, "DELETE")}
          >
            {busy ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </dialog>
    </section>
  )
}
