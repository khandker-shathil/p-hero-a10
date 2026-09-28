import { LessonForm } from "@/components/dashboard/lesson-form"
export const metadata = { title: "Update Lesson | Digital Life Lessons" }
export default async function UpdateLessonPage({ params }) {
  const { id } = await params
  return <LessonForm key={id} id={id} />
}
