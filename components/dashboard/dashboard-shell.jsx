"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircle, Plus, BookOpen } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { buttonVariants } from "@/components/ui/button"

export function DashboardShell({ children }) {
  const { data: session, isPending } = authClient.useSession()
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (!isPending && !session?.user)
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
  }, [isPending, session?.user, pathname, router])
  if (isPending || !session?.user)
    return (
      <div
        role="status"
        className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading your workspace…
      </div>
    )
  return (
    <div key={session.user.id} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Lesson management"
        className="mb-8 flex flex-wrap gap-3 border-b pb-6"
      >
        <Link
          href="/dashboard/my-lessons"
          aria-current={
            pathname === "/dashboard/my-lessons" ? "page" : undefined
          }
          className={buttonVariants({
            variant:
              pathname === "/dashboard/my-lessons" ? "default" : "outline",
          })}
        >
          <BookOpen aria-hidden="true" />
          My Lessons
        </Link>
        <Link
          href="/dashboard/add-lesson"
          aria-current={
            pathname === "/dashboard/add-lesson" ? "page" : undefined
          }
          className={buttonVariants({
            variant:
              pathname === "/dashboard/add-lesson" ? "default" : "outline",
          })}
        >
          <Plus aria-hidden="true" />
          Add Lesson
        </Link>
      </nav>
      {children}
    </div>
  )
}
