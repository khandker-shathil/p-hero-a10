import { LessonBrowser } from "@/components/lessons/lesson-browser"
import { parseLessonFilters, lessonSearchParams } from "@/lib/lesson-filters"

export const metadata = {
  title: "Public Lessons | Digital Life Lessons",
  description:
    "Explore community life lessons. Search by keyword, filter by category and emotional tone, and discover the most-saved reflections.",
}

export default async function PublicLessonsPage({ searchParams }) {
  const values = await searchParams
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") params.set(key, value)
  }
  const filters = parseLessonFilters(params)
  return (
    <LessonBrowser
      key={lessonSearchParams(filters).toString()}
      filters={filters}
    />
  )
}
