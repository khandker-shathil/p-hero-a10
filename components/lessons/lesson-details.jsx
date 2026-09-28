"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Clock3,
  Flag,
  Heart,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  X,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useToast } from "@/components/toast-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar } from "@/components/lessons/lesson-card"

const reasons = [
  "Inappropriate content",
  "Spam or advertising",
  "Harassment or hate speech",
  "Misleading information",
  "Other",
]
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
}

export function LessonDetails({ id }) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const notify = useToast()
  const [state, setState] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(null)
  const [comment, setComment] = useState("")
  const [commentPage, setCommentPage] = useState(1)
  const [commentsVersion, setCommentsVersion] = useState(0)
  const [comments, setComments] = useState(null)
  const [commentsError, setCommentsError] = useState(false)
  const reportDialog = useRef(null)
  const endpoint = `/api/lessons/${encodeURIComponent(id)}`
  const userId = session?.user?.id
  const viewer = `${userId || "guest"}:${!!session?.user?.isPremium}`
  const login = `/login?returnTo=${encodeURIComponent(`/lessons/${encodeURIComponent(id)}`)}`
  const current = state?.viewer === viewer ? state : null
  const lesson = current?.lesson
  const hasLesson = !!lesson

  useEffect(() => {
    if (isPending) return
    if (!userId) {
      router.replace(login)
      return
    }
    const controller = new AbortController()
    fetch(endpoint, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace(login)
          return
        }
        if (!response.ok) {
          setState({ status: response.status, viewer })
          return
        }
        const data = await response.json()
        setState({ lesson: data.lesson, status: 200, viewer })
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ status: 503, viewer })
      })
    return () => controller.abort()
  }, [endpoint, userId, viewer, isPending, router, login, attempt])

  useEffect(() => {
    if (!hasLesson) return
    const controller = new AbortController()
    fetch(`${endpoint}/comments?page=${commentPage}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable")
        return response.json()
      })
      .then((data) => {
        setComments({ ...data, viewer })
        setCommentsError(false)
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCommentsError(true)
      })
    return () => controller.abort()
  }, [endpoint, hasLesson, commentPage, commentsVersion, viewer])

  async function mutate(path, method, body) {
    const response = await fetch(`${endpoint}/${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const data = await response.json()
    if (response.status === 401) router.replace(login)
    if (response.status === 403 || response.status === 404)
      setState({ status: response.status, viewer })
    if (!response.ok)
      throw new Error(data.error || "Something went wrong. Please try again.")
    return data
  }
  async function toggle(action) {
    if (busy) return
    setBusy(action)
    try {
      const stats = await mutate(
        action,
        action === "like" ? "POST" : lesson.saved ? "DELETE" : "PUT"
      )
      setState((previous) => ({
        ...previous,
        lesson: { ...previous.lesson, ...stats },
      }))
      if (action === "favorite")
        notify(
          stats.saved ? "Saved to your favorites." : "Removed from favorites."
        )
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(null)
    }
  }
  async function postComment(event) {
    event.preventDefault()
    if (!comment.trim()) return notify("Write a comment first.", "error")
    if (busy) return
    setBusy("comment")
    try {
      await mutate("comments", "POST", { text: comment })
      setComment("")
      setCommentPage(1)
      setComments(null)
      setCommentsVersion((x) => x + 1)
      notify("Comment posted.")
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(null)
    }
  }
  async function report(event) {
    event.preventDefault()
    if (busy) return
    const reason = new FormData(event.currentTarget).get("reason")
    setBusy("report")
    try {
      await mutate("reports", "POST", { reason })
      reportDialog.current?.close()
      notify("Report submitted. Thank you for helping keep the community safe.")
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(null)
    }
  }

  if (isPending || !userId || !current) return <Status>Loading lesson…</Status>
  if (current.status !== 200)
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        {current.status === 403 && (
          <LockKeyhole
            className="mx-auto mb-6 size-10 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <h1 className="text-3xl font-semibold tracking-tight">
          {current.status === 403
            ? "A little more wisdom awaits"
            : current.status === 404
              ? "Lesson not found"
              : "We couldn’t load this lesson"}
        </h1>
        <p className="mt-4 mb-7 text-sm leading-6 text-muted-foreground">
          {current.status === 403
            ? "This lesson is reserved for Premium members. Upgrade to read the full story."
            : current.status === 404
              ? "This lesson may have been removed or is not publicly available."
              : "Please try again in a moment."}
        </p>
        {current.status === 403 ? (
          <Link href="/pricing" className={buttonVariants()}>
            Upgrade to Premium
          </Link>
        ) : current.status === 404 ? (
          <Link href="/public-lessons" className={buttonVariants()}>
            Browse public lessons
          </Link>
        ) : (
          <Button
            onClick={() => {
              setState(null)
              setAttempt((x) => x + 1)
            }}
          >
            Try again
          </Button>
        )}
      </section>
    )
  const visibleComments =
    comments?.viewer === viewer && comments?.page === commentPage
      ? comments
      : null
  return (
    <article className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
      <Link
        href="/public-lessons"
        className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to public lessons
      </Link>
      <header className="mt-9 border-b pb-8">
        <div className="mb-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-accent px-3 py-1">
            {lesson.category}
          </span>
          <span className="rounded-full border px-3 py-1">
            {lesson.emotionalTone}
          </span>
          <span className="rounded-full border px-3 py-1 capitalize">
            {lesson.accessLevel}
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold tracking-tight break-words sm:text-5xl">
          {lesson.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(lesson.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="size-4" aria-hidden="true" />
            {lesson.readingMinutes} min read
          </span>
          <span className="capitalize">{lesson.visibility} lesson</span>
        </div>
      </header>
      <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {lesson.image && /^https?:\/\//i.test(lesson.image) && (
            <LessonImage src={lesson.image} title={lesson.title} />
          )}
          <div className="text-base leading-8 break-words whitespace-pre-wrap">
            {lesson.description}
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Last updated {formatDate(lesson.updatedAt)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 border-y py-5">
            <Button
              variant={lesson.liked ? "default" : "outline"}
              disabled={!!busy}
              aria-pressed={lesson.liked}
              onClick={() => toggle("like")}
            >
              <Heart
                className={lesson.liked ? "fill-current" : ""}
                aria-hidden="true"
              />
              {lesson.likesCount} {lesson.likesCount === 1 ? "like" : "likes"}
            </Button>
            <Button
              variant={lesson.saved ? "default" : "outline"}
              disabled={!!busy}
              aria-pressed={lesson.saved}
              onClick={() => toggle("favorite")}
            >
              <Bookmark
                className={lesson.saved ? "fill-current" : ""}
                aria-hidden="true"
              />
              {lesson.saved ? "Saved" : "Save"} · {lesson.savesCount}
            </Button>
            <Button
              variant="ghost"
              disabled={!!busy}
              onClick={() => reportDialog.current?.showModal()}
            >
              <Flag aria-hidden="true" />
              Report
            </Button>
            {busy && (
              <span
                role="status"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Saving…
              </span>
            )}
          </div>
          <section className="mt-10" aria-labelledby="comments-heading">
            <h2
              id="comments-heading"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              The conversation
              {visibleComments ? ` (${visibleComments.total})` : ""}
            </h2>
            <form onSubmit={postComment} className="mt-5">
              <label htmlFor="comment" className="mb-2 block text-sm">
                What did this lesson bring to mind?
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={4}
                disabled={busy === "comment"}
                placeholder="Share a thoughtful response…"
                className="w-full resize-y rounded-xl border bg-background p-4 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {comment.length}/2000
                </span>
                <Button type="submit" disabled={!!busy}>
                  {busy === "comment" ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </form>
            <div className="mt-8 space-y-5">
              {commentsError ? (
                <div role="status" className="text-sm text-muted-foreground">
                  Comments couldn’t load.{" "}
                  <button
                    className="underline"
                    onClick={() => {
                      setCommentsError(false)
                      setCommentsVersion((x) => x + 1)
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : !visibleComments ? (
                <Status compact>Loading comments…</Status>
              ) : !visibleComments.items.length ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Be the first to start the conversation.
                </p>
              ) : (
                visibleComments.items.map((item) => (
                  <article key={item.id} className="rounded-xl border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{item.name}</h3>
                      <time className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 text-sm leading-6 break-words whitespace-pre-wrap">
                      {item.text}
                    </p>
                  </article>
                ))
              )}
            </div>
            {visibleComments?.totalPages > 1 && (
              <nav
                aria-label="Comment pages"
                className="mt-5 flex items-center justify-between gap-3"
              >
                <Button
                  variant="outline"
                  disabled={commentPage === 1}
                  onClick={() => setCommentPage((x) => x - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs">
                  Page {commentPage} of {visibleComments.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={commentPage >= visibleComments.totalPages}
                  onClick={() => setCommentPage((x) => x + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
          </section>
        </div>
        <aside className="h-fit rounded-2xl border bg-muted/25 p-6">
          <p className="mb-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Behind the lesson
          </p>
          <Avatar name={lesson.author.name} image={lesson.author.image} />
          <h2 className="mt-4 text-lg font-semibold">{lesson.author.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lesson.author.totalLessons} public{" "}
            {lesson.author.totalLessons === 1 ? "lesson" : "lessons"} shared
          </p>
          <Link
            href={`/authors/${encodeURIComponent(lesson.author.id)}`}
            className={`${buttonVariants({ variant: "outline" })} mt-6 w-full`}
          >
            View all lessons
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
      <dialog
        ref={reportDialog}
        aria-labelledby="report-title"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="report-title" className="text-xl font-semibold">
            Report this lesson
          </h2>
          <button
            type="button"
            aria-label="Close report dialog"
            onClick={() => reportDialog.current.close()}
            className="rounded p-1 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Choose a reason below. A moderator will review your report.
        </p>
        <form onSubmit={report} className="mt-5">
          <label
            htmlFor="report-reason"
            className="mb-2 block text-sm font-medium"
          >
            Reason
          </label>
          <select
            id="report-reason"
            name="reason"
            className="h-11 w-full rounded-lg border bg-background px-3 text-sm"
          >
            {reasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reportDialog.current.close()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!!busy}>
              {busy === "report" ? "Submitting…" : "Submit report"}
            </Button>
          </div>
        </form>
      </dialog>
    </article>
  )
}

function Status({ children, compact = false }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-sm text-muted-foreground ${compact ? "py-8" : "min-h-[60vh]"}`}
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      {children}
    </div>
  )
}
function LessonImage({ src, title }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  // Lesson images may be hosted on user-provided URLs.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      className="mb-8 aspect-video w-full rounded-xl object-cover"
    />
  )
}
