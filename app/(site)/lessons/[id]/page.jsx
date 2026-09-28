import { LessonDetails } from "@/components/lessons/lesson-details"

export const metadata = {
  title: "Read a lesson | Digital Life Lessons",
  robots: { index: false, follow: false },
}

export default async function LessonPage({ params }) {
  const { id } = await params
  return <LessonDetails key={id} id={id} />
}
