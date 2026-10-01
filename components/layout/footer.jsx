import Link from "next/link"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const groups = [
  {
    title: "Discover",
    links: [
      ["Home", "/"],
      ["Public lessons", "/public-lessons"],
      ["Go Premium", "/pricing"],
    ],
  },
  {
    title: "Your lessons",
    links: [
      ["Add a lesson", "/dashboard/add-lesson"],
      ["My lessons", "/dashboard/my-lessons"],
      ["My favorites", "/dashboard/my-favorites"],
    ],
  },
  {
    title: "Your account",
    links: [
      ["My profile", "/dashboard/profile"],
      ["Log in", "/login"],
      ["Create an account", "/register"],
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 border-b py-9 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Your experience could be someone’s next lesson.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Take a moment to reflect. Share something worth remembering.
            </p>
          </div>
          <Link
            href="/dashboard/add-lesson"
            className={buttonVariants({
              variant: "outline",
              className: "shrink-0",
            })}
          >
            Share a lesson <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpen className="size-5" aria-hidden="true" />
              Digital Life Lessons
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              A place for the things life teaches us. Keep your reflections,
              discover new perspectives, and grow with the community.
            </p>
            <p className="mt-5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Reflect. Share. Grow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map(({ title, links }) => (
              <nav key={title} aria-label={`Footer: ${title}`}>
                <h3 className="mb-4 text-sm font-semibold">{title}</h3>
                <ul className="space-y-3">
                  {links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t py-5 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Digital Life Lessons. All rights
            reserved.
          </p>
          <p>Every experience has something to teach us.</p>
        </div>
      </div>
    </footer>
  )
}
