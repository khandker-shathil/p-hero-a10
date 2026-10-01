"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { ImagePicker } from "@/components/image-picker"
import { uploadImage } from "@/lib/image-upload"
import { authClient } from "@/lib/auth-client"
import { CATEGORIES, TONES } from "@/lib/lesson-filters"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

const input =
  "mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground"
const emptyLesson = {
  title: "",
  description: "",
  category: "",
  emotionalTone: "",
  image: "",
  visibility: "private",
  accessLevel: "free",
}

export function LessonForm({ id }) {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const notify = useToast()
  const [lesson, setLesson] = useState(id ? null : emptyLesson)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const endpoint = id
    ? `/api/my-lessons/${encodeURIComponent(id)}`
    : "/api/my-lessons"
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    fetch(endpoint, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok)
          throw new Error(data.error || "Couldn’t load this lesson.")
        setLesson(data.lesson)
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message)
      })
    return () => controller.abort()
  }, [id, endpoint, attempt])

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid")
      notify(
        invalid?.validationMessage || "Complete all required fields.",
        "error"
      )
      invalid?.focus()
      return
    }
    const fields = new FormData(form)
    const body = Object.fromEntries(fields)
    const imageFile = fields.get("imageFile")
    delete body.imageFile
    body.accessLevel = fields.get("accessLevel") || lesson.accessLevel
    setBusy(true)
    try {
      if (imageFile?.size) body.image = await uploadImage(imageFile, "lesson")
      const response = await fetch(endpoint, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (response.status === 401)
        router.replace(
          `/login?returnTo=${encodeURIComponent(id ? `/dashboard/update-lesson/${id}` : "/dashboard/add-lesson")}`
        )
      if (!response.ok)
        throw new Error(data.error || "Couldn’t save the lesson.")
      notify(id ? "Lesson updated." : "Your lesson has been saved.")
      router.push("/dashboard/my-lessons")
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(false)
    }
  }
  if (error)
    return (
      <div role="alert" className="rounded-xl border p-8 text-center">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => {
            setError("")
            setAttempt((x) => x + 1)
          }}
        >
          Try again
        </Button>
      </div>
    )
  if (!lesson)
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 py-16"
      >
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading lesson…
      </div>
    )
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        {id ? "Update your lesson" : "What has life taught you?"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {id
          ? "Refine your reflection and choose how you want to share it."
          : "Capture an experience, a realization, or a little wisdom worth keeping."}
      </p>
      <div className="my-6 rounded-xl border bg-muted/30 p-4 text-sm">
        <p className="font-medium">{session?.user?.name}</p>
        <p className="mt-1 text-muted-foreground">{session?.user?.email}</p>
      </div>
      <form
        noValidate
        onSubmit={submit}
        aria-busy={busy}
        className="rounded-2xl border bg-card p-5 sm:p-8"
      >
        <fieldset disabled={busy} className="space-y-6">
          <label className="block text-sm font-medium">
            Lesson title
            <input
              name="title"
              required
              maxLength={160}
              defaultValue={lesson.title}
              placeholder="Give your lesson a meaningful title"
              className={input}
            />
          </label>
          <label className="block text-sm font-medium">
            Your story or insight
            <textarea
              name="description"
              required
              maxLength={20000}
              rows={9}
              defaultValue={lesson.description}
              placeholder="What happened? What did you learn? What would you tell someone going through the same thing?"
              className={`${input} resize-y`}
            />
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Category
              <select
                name="category"
                required
                defaultValue={lesson.category}
                className={input}
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {CATEGORIES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Emotional tone
              <select
                name="emotionalTone"
                required
                defaultValue={lesson.emotionalTone}
                className={input}
              >
                <option value="" disabled>
                  Choose a tone
                </option>
                {TONES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <ImagePicker
            kind="lesson"
            currentImage={lesson.image || ""}
            label="Lesson image (optional)"
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Visibility
              <select
                name="visibility"
                defaultValue={lesson.visibility}
                className={input}
              >
                <option value="private">Private — only you</option>
                <option value="public">
                  Public — shared with the community
                </option>
              </select>
            </label>
            <div
              title={
                !session?.user?.isPremium
                  ? "Upgrade to Premium to create paid lessons."
                  : undefined
              }
            >
              <label className="block text-sm font-medium">
                Access level
                <select
                  name="accessLevel"
                  defaultValue={lesson.accessLevel}
                  disabled={!session?.user?.isPremium}
                  className={input}
                  aria-describedby="access-help"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <p
                id="access-help"
                className="mt-2 text-xs text-muted-foreground"
              >
                {session?.user?.isPremium
                  ? "Premium lessons are available to premium members and you."
                  : "Upgrade to Premium to create paid lessons."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
            <Link
              href="/dashboard/my-lessons"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={busy}>
              {busy && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {busy ? "Saving…" : id ? "Save changes" : "Save lesson"}
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}
