import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  Compass,
  HeartHandshake,
  Sprout,
} from "lucide-react"
import { Hero } from "@/components/home/hero"
import { CommunitySections } from "@/components/home/community-sections"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: "Digital Life Lessons — Reflect, share, grow",
  description:
    "Preserve life's lessons, discover meaningful perspectives, and grow with a community of thoughtful people.",
}

const benefits = [
  {
    icon: BookOpen,
    title: "Remember what matters",
    text: "Give your hard-earned insights a home, so they’re there when you need them most.",
  },
  {
    icon: Compass,
    title: "Find a fresh perspective",
    text: "Step into someone else’s experience and discover another way to look at your own.",
  },
  {
    icon: Sprout,
    title: "Notice your growth",
    text: "Reflect on the small moments. Over time, they tell the story of how far you’ve come.",
  },
  {
    icon: HeartHandshake,
    title: "Help someone forward",
    text: "What you’ve learned could be exactly what another person needs to hear today.",
  },
]

export default function Page() {
  return (
    <>
      <Hero />
      <CommunitySections>
        <section
          className="border-y bg-[#f5f5ef] dark:bg-[#1b211c]"
          aria-labelledby="benefits-heading"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                More than a collection of stories
              </p>
              <h2
                id="benefits-heading"
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Why learning from life matters
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Experience teaches us. Reflection helps us carry the lesson
                forward.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <article
                  key={title}
                  className="rounded-2xl border bg-background/70 p-6"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <Icon
                      className="size-6 text-emerald-800 dark:text-emerald-300"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </CommunitySections>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="rounded-2xl bg-[#233d30] px-6 py-12 text-center text-white sm:px-12">
          <p className="text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
            Your next chapter starts here
          </p>
          <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            You have a story.
            <br />
            Someone needs its lesson.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/75">
            Start with one moment, one realization, one thing you wish you’d
            known sooner.
          </p>
          <Link
            href="/dashboard/add-lesson"
            className={`${buttonVariants({ variant: "secondary", size: "lg" })} mt-7`}
          >
            Share your first lesson
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
