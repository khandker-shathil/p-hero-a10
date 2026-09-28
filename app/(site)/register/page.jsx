import { AuthForm } from "@/components/auth/auth-form"
import { safeReturnTo } from "@/lib/auth-redirect"

export const metadata = { title: "Create an account | Digital Life Lessons" }

export default async function AuthPage({ searchParams }) {
  const { returnTo } = await searchParams
  return <AuthForm register returnTo={safeReturnTo(returnTo)} />
}
