"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, LoaderCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { LessonCard, Avatar } from "@/components/lessons/lesson-card"

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
