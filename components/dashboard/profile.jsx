"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Bookmark, Crown, LoaderCircle } from "lucide-react"
import { ImagePicker } from "@/components/image-picker"
import { uploadImage } from "@/lib/image-upload"
import { authClient } from "@/lib/auth-client"
import { Avatar, LessonCard } from "@/components/lessons/lesson-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

const inputClass =
  "mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground"

export function Profile({ admin = false }) {
  const router = useRouter()
  const notify = useToast()
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/profile?page=${page}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json()
        if (response.status === 401)
          router.replace("/login?returnTo=%2Fdashboard%2Fprofile")
        if (!response.ok)
          throw new Error(data.error || "Couldn’t load your profile.")
        setResult({ ...data, requestedPage: page })
        setError("")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [page, version, router])

  async function save(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid")
      notify(
        invalid?.validationMessage || "Check your profile details.",
        "error"
      )
      invalid?.focus()
      return
    }
    const values = new FormData(form)
    const name = values.get("name").trim()
    const imageFile = values.get("imageFile")
    if (!name) return notify("Please enter your display name.", "error")
    setBusy(true)
    try {
      const image = imageFile?.size
        ? await uploadImage(imageFile)
        : values.get("image")
      const updated = await authClient.updateUser({
        name,
        image: image || null,
      })
      if (updated.error)
        throw new Error(
          updated.error.message || "Couldn’t update your profile."
        )
      setResult((current) => ({
        ...current,
        user: { ...current.user, name, image: image || null },
      }))
      notify("Profile updated.")
      const refreshed = await authClient
        .getSession({
          query: { disableCookieCache: true },
        })
        .catch(() => null)
      if (refreshed?.data) authClient.hydrateSession(refreshed.data)
      setVersion((value) => value + 1)
    } catch (error) {
      notify(
        error.message || "Couldn’t save your profile. Please try again.",
        "error"
      )
    } finally {
      setBusy(false)
    }
  }

  if (error)
    return (
      <div role="alert" className="rounded-xl border p-8 text-center">
        <p>{error}</p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => {
            setError("")
            setVersion((value) => value + 1)
          }}
        >
          Try again
        </Button>
      </div>
    )
  if (!result)
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 py-20 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading your profile…
      </div>
    )
  const { user, stats, publicLessons } = result
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">
        {admin ? "Admin Profile" : "My Profile"}
      </h1>
      <p className="mt-3 mb-8 text-sm text-muted-foreground">
        A little about you, and the wisdom you’ve shared along the way.
      </p>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border bg-muted/25 p-6 sm:p-8">
          <Avatar
            key={user.image || user.name}
            name={user.name}
            image={user.image}
          />
          <h2 className="mt-5 text-2xl font-semibold break-words">
            {user.name}
          </h2>
          <p className="mt-2 text-sm break-all text-muted-foreground">
            {user.email}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border bg-background px-3 py-1 text-xs capitalize">
              {user.role}
            </span>
            {user.isPremium ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <Crown className="size-3.5" aria-hidden="true" />
                Premium ⭐
              </span>
            ) : (
              <span className="rounded-full border bg-background px-3 py-1 text-xs">
                Free plan
              </span>
            )}
          </div>
          <dl className="mt-7 grid grid-cols-2 gap-4 border-t pt-6">
            <div>
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="size-4" aria-hidden="true" />
                Lessons created
              </dt>
              <dd className="mt-2 text-3xl font-semibold">
                {stats.lessonsCreated}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bookmark className="size-4" aria-hidden="true" />
                Lessons saved
              </dt>
              <dd className="mt-2 text-3xl font-semibold">
                {stats.lessonsSaved}
              </dd>
            </div>
          </dl>
        </div>
        <form
          noValidate
          onSubmit={save}
          aria-busy={busy}
          className="rounded-2xl border bg-card p-6 sm:p-8"
        >
          <h2 className="mb-6 text-xl font-semibold">Edit your profile</h2>
          <fieldset disabled={busy} className="space-y-5">
            <label className="block text-sm font-medium">
              Display name
              <input
                key={`name-${user.name}`}
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={user.name}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                value={user.email}
                disabled
                className={inputClass}
              />
              <span className="mt-2 block text-xs font-normal text-muted-foreground">
                Your account email cannot be changed here.
              </span>
            </label>
            <ImagePicker
              key={`image-${user.image}`}
              currentImage={user.image || ""}
              label="Profile photo"
            />
            <div className="flex justify-end border-t pt-5">
              <Button type="submit" disabled={busy}>
                {busy && (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
      <section className="mt-12" aria-labelledby="public-lessons-heading">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="public-lessons-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              My public lessons
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {publicLessons.total} shared{" "}
              {publicLessons.total === 1 ? "lesson" : "lessons"}, newest first.
            </p>
          </div>
          <Link
            href="/dashboard/add-lesson"
            className={buttonVariants({ variant: "outline" })}
          >
            Add a lesson
          </Link>
        </div>
        {result.requestedPage !== page ? (
          <div
            role="status"
            className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground"
          >
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            Loading lessons…
          </div>
        ) : publicLessons.items.length ? (
          <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicLessons.items.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} saved />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              You haven’t shared any public lessons yet.
            </p>
            <Link
              href="/dashboard/my-lessons"
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
            >
              Manage your lessons
            </Link>
          </div>
        )}
        {publicLessons.totalPages > 1 && (
          <nav
            aria-label="Profile lesson pages"
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Button
              variant="outline"
              disabled={
                publicLessons.page <= 1 || result.requestedPage !== page
              }
              onClick={() => setPage(publicLessons.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              {publicLessons.page} / {publicLessons.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={
                publicLessons.page >= publicLessons.totalPages ||
                result.requestedPage !== page
              }
              onClick={() => setPage(publicLessons.page + 1)}
            >
              Next
            </Button>
          </nav>
        )}
      </section>
    </section>
  )
}
