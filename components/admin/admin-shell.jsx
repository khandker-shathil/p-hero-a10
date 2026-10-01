"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { buttonVariants } from "@/components/ui/button"
import { DataState } from "@/components/admin/shared"

const links = [
  ["Overview", ""],
  ["Manage users", "/manage-users"],
  ["Manage lessons", "/manage-lessons"],
  ["Reported lessons", "/reported-lessons"],
  ["Admin profile", "/profile"],
]

export function AdminShell({ children }) {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()
  const [access, setAccess] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const identity = `${session?.user?.id}:${pathname}:${attempt}`
  const isAdmin = session?.user?.role === "admin"
  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController()
    fetch("/api/admin/access", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok)
          throw new Error(body.error || "Couldn’t verify admin access.")
        setAccess({ identity, allowed: true })
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setAccess({ identity, error: error.message })
      })
    return () => controller.abort()
  }, [identity, isAdmin])
  if (!isAdmin)
    return (
      <div role="alert" className="rounded-xl border p-8">
        <h1 className="text-xl font-semibold">Admin access required</h1>
        <p className="mt-3">
          Log in with an admin account to use this workspace.
        </p>
        <Link href="/dashboard/profile" className="mt-4 inline-block underline">
          Back to your profile
        </Link>
      </div>
    )
  const current = access?.identity === identity ? access : null
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-5" aria-hidden="true" />
          Administration
        </p>
        <Link
          href="/dashboard/my-lessons"
          className="text-sm underline underline-offset-4"
        >
          My workspace
        </Link>
      </div>
      <nav
        aria-label="Admin navigation"
        className="mb-8 flex flex-wrap gap-2 border-b pb-6"
      >
        {links.map(([label, suffix]) => {
          const href = `/dashboard/admin${suffix}`
          return (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={buttonVariants({
                variant: pathname === href ? "default" : "outline",
              })}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <DataState
        data={current?.allowed}
        error={current?.error}
        retry={() => setAttempt((value) => value + 1)}
      >
        {current?.allowed && children}
      </DataState>
    </>
  )
}
