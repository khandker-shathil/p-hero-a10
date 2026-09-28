import { AuthForm } from "@/components/auth/auth-form"
import { safeReturnTo } from "@/lib/auth-redirect"

export const metadata = { title: "Log in | Digital Life Lessons" }

export default async function AuthPage({ searchParams }) {
  const { returnTo } = await searchParams
  return <AuthForm returnTo={safeReturnTo(returnTo)} />
}
