import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 py-10 sm:flex-row lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookOpen className="size-5" aria-hidden="true" />
            Digital Life Lessons
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            A place for the things life teaches us.
            <br />
            Reflect. Share. Grow.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-start gap-6 text-sm text-muted-foreground"
        >
          <Link
            href="/public-lessons"
            className="hover:text-foreground hover:underline"
          >
            Explore lessons
          </Link>
          <Link
            href="/dashboard/add-lesson"
            className="hover:text-foreground hover:underline"
          >
            Share a lesson
          </Link>
          <Link
            href="/register"
            className="hover:text-foreground hover:underline"
          >
            Join the community
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t px-6 py-5 text-xs text-muted-foreground lg:px-8">
        © {new Date().getFullYear()} Digital Life Lessons. Every experience has
        something to teach us.
      </div>
    </footer>
  )
}
