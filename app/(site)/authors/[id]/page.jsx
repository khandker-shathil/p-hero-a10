import { AuthorProfile } from "@/components/lessons/author-profile"
export const metadata = { title: "Author | Digital Life Lessons" }
export default async function AuthorPage({ params }) {
  const { id } = await params
  return <AuthorProfile key={id} id={id} />
}
