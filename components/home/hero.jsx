"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Sprout,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const slides = [
  {
    label: "Your life. Your lessons.",
    title: "Some lessons deserve to stay with you.",
    description:
      "Turn everyday experiences into lasting wisdom. A quiet space to reflect, share what you’ve learned, and grow together.",
    note: "You don’t have to have it all figured out to take the next step.",
    category: "Personal growth",
    prompt: "What did today teach you?",
  },
  {
    label: "A little perspective goes a long way.",
    title: "Someone else’s story could change yours.",
    description:
      "Explore honest reflections on careers, relationships, and starting over. Find a little perspective for wherever life has brought you.",
    note: "Listening to another person’s story can open a door in your own.",
    category: "Relationships",
    prompt: "Whose story stayed with you?",
  },
  {
    label: "Make room for reflection.",
    title: "Small reflections. Meaningful growth.",
    description:
      "Keep your insights close, save the lessons you love, and build a personal collection of wisdom you can return to.",
    note: "Progress is easier to see when you pause to notice how far you’ve come.",
    category: "Mindset",
    prompt: "What are you learning to appreciate?",
  },
]

export function Hero() {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()
  const slide = slides[index]
  return (
    <section
      aria-label="Discover Digital Life Lessons"
      aria-roledescription="carousel"
      className="overflow-hidden border-b bg-[#f5f5ef] dark:bg-[#1b211c]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:py-24">
        <div>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-h-80 sm:min-h-72 lg:min-h-88"
          >
            <motion.div
              key={index}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase">
                <span className="size-2 rounded-full bg-emerald-700 dark:bg-emerald-400" />
                {slide.label}
              </p>
              <h1 className="max-w-xl text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                {slide.description}
              </p>
            </motion.div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/public-lessons"
              className={buttonVariants({ size: "lg" })}
            >
              Explore lessons
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/add-lesson"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Write your first lesson
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <button
              aria-label="Previous slide"
              onClick={() => setIndex((index + 2) % 3)}
              className="rounded-full border p-2.5 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex gap-2">
              {slides.map((item, i) => (
                <button
                  key={item.label}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={index === i ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className="flex h-8 items-center rounded px-1 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-foreground" : "w-2 bg-foreground/25"}`}
                  />
                </button>
              ))}
            </div>
            <button
              aria-label="Next slide"
              onClick={() => setIndex((index + 1) % 3)}
              className="rounded-full border p-2.5 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowRight className="size-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              0{index + 1} / 03
            </span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md px-3 py-6 sm:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto aspect-square rounded-full border border-foreground/10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full border border-foreground/10"
          />
          <div className="relative rotate-[-3deg] rounded-2xl border bg-background p-7 shadow-xl sm:p-9">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="tracking-widest uppercase">
                A moment of perspective
              </span>
              <Bookmark className="size-4" aria-hidden="true" />
            </div>
            <span
              aria-hidden="true"
              className="mt-6 block font-serif text-7xl leading-none text-emerald-800 dark:text-emerald-300"
            >
              “
            </span>
            <p className="min-h-36 font-serif text-3xl leading-tight">
              {slide.note}
            </p>
            <div className="mt-8 border-t pt-5">
              <span className="rounded-full bg-accent px-3 py-1 text-xs">
                {slide.category}
              </span>
              <p className="mt-4 text-xs text-muted-foreground">
                A reflection to get you started
              </p>
            </div>
          </div>
          <div className="relative -mt-2 ml-6 flex rotate-2 items-center gap-3 rounded-xl border bg-[#e4eadb] p-4 text-[#263927] shadow-sm dark:bg-[#293c2b] dark:text-[#e4eadb]">
            <Sprout className="size-6 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{slide.prompt}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
