"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Bookmark, LockKeyhole, Users } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function LessonCard({ lesson, saved }) {
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

export function Avatar({ name, image }) {
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
