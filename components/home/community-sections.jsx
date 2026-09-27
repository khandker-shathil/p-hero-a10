"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  LockKeyhole,
  LoaderCircle,
  Users,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function CommunitySections({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/home", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unavailable")
        return response.json()
      })
      .then(setData)
      .catch((error) => {
        if (error.name !== "AbortError") setError(true)
      })
    return () => controller.abort()
  }, [attempt])
  function state(empty, text) {
    if (error)
      return (
        <div
          role="status"
          className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            We couldn’t load community lessons right now.
          </p>
          <button
            className="mt-4 rounded text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setError(false)
              setAttempt(attempt + 1)
            }}
          >
            Try again
          </button>
        </div>
      )
    if (!data)
      return (
        <div
          role="status"
          className="flex items-center justify-center gap-3 rounded-2xl border py-16 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading community insights…
        </div>
      )
    if (empty)
      return (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <BookOpen
            className="mx-auto mb-4 size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">There’s a story waiting to be shared.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text}
          </p>
          <Link
            href="/dashboard/add-lesson"
            className="mt-5 inline-block rounded text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Share a lesson
          </Link>
        </div>
      )
    return null
  }
  return (
    <>
      <section
        className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
        aria-labelledby="featured-heading"
      >
        <SectionHeading
          id="featured-heading"
          eyebrow="Worth a moment of your time"
          title="Featured life lessons"
          description="Thoughtful reflections, handpicked to help you see things a little differently."
        />
        {state(
          !data?.featured?.length,
          "Featured reflections will appear here as our editors discover lessons worth highlighting."
        ) || (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.featured.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </section>
      {children}
      <section
        className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
        aria-labelledby="contributors-heading"
      >
        <SectionHeading
          id="contributors-heading"
          eyebrow="The people behind the perspective"
          title="Top contributors of the week"
          description="Celebrating the voices sharing the most public lessons over the last seven days."
          link={false}
        />
        {state(
          !data?.contributors?.length,
          "A new week, a fresh page. Share a public lesson to become part of this week’s conversation."
        ) || (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.contributors.map((person, i) => (
              <article
                key={person.id}
                className="flex items-center gap-4 rounded-xl border p-5"
              >
                <Avatar name={person.name} image={person.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{person.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {person.lessonCount}{" "}
                    {person.lessonCount === 1 ? "lesson" : "lessons"} this week
                  </p>
                </div>
                <span className="self-start text-xs text-muted-foreground">
                  0{i + 1}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="border-y bg-muted/25" aria-labelledby="saved-heading">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            id="saved-heading"
            eyebrow="Keep the good ones close"
            title="Most saved lessons"
            description="The insights our community returns to, again and again."
          />
          {state(
            !data?.mostSaved?.length,
            "As readers save their favorite lessons, the most-loved reflections will find a home here."
          ) || (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.mostSaved.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} saved />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function SectionHeading({ id, eyebrow, title, description, link = true }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {link && (
        <Link
          href="/public-lessons"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse all lessons
          <ArrowUpRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function LessonCard({ lesson, saved }) {
  const { data: session } = authClient.useSession()
  const premium = lesson.accessLevel === "premium"
  const locked =
    premium &&
    !session?.user?.isPremium &&
    session?.user?.id !== lesson.creatorId
  const date = new Date(lesson.createdAt)
  return (
    <article className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-center justify-between gap-2">
        <span className="rounded-full bg-accent px-3 py-1 text-xs">
          {lesson.category || "Life lessons"}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {premium ? "Premium" : "Free"}
        </span>
      </div>
      <h3 className="line-clamp-2 text-xl leading-7 font-semibold tracking-tight">
        {lesson.title}
      </h3>
      {locked ? (
        <div className="relative mt-4 flex min-h-24 items-center justify-center overflow-hidden rounded-lg bg-muted">
          <span
            aria-hidden="true"
            className="text-sm text-muted-foreground blur-sm select-none"
          >
            A moment of insight. A new perspective.
            <br />A lesson to carry with you.
          </span>
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/65 px-2 text-center text-xs font-medium">
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            Premium lesson — upgrade to view
          </span>
        </div>
      ) : (
        <p className="mt-4 line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">
          {lesson.description ||
            "Open this lesson to discover the full reflection."}
        </p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {lesson.emotionalTone || "Reflection"}
        {!Number.isNaN(date.getTime()) &&
          ` · ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`}
      </p>
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 border-t pt-4">
          <Avatar name={lesson.creatorName} image={lesson.creatorImage} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {lesson.creatorName}
          </span>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="size-3.5" aria-hidden="true" />
              {lesson.savesCount}
              <span className="sr-only">saves</span>
            </span>
          )}
        </div>
        <Link
          href={
            locked ? (session ? "/pricing" : "/login") : `/lessons/${lesson.id}`
          }
          className={`${buttonVariants({ variant: "outline" })} mt-5 w-full`}
        >
          {locked ? "Unlock premium" : "See details"}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function Avatar({ name, image }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-medium">
      {image && !failed ? (
        // User profile photos can be hosted on arbitrary OAuth or user-provided hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        name?.charAt(0).toUpperCase() || (
          <Users className="size-4" aria-hidden="true" />
        )
      )}
    </span>
  )
}
