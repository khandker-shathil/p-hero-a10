"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Users,
  Flag,
  Crown,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

export function AdminDashboard() {
  const { data: session } = authClient.useSession()
  if (session?.user?.role !== "admin")
    return (
      <div role="alert" className="rounded-xl border p-8">
        <h1 className="text-xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account does not have access to the admin dashboard.
        </p>
        <Link href="/dashboard/profile" className="mt-4 inline-block underline">
          Back to your profile
        </Link>
      </div>
    )
  return <AdminWorkspace key={session.user.id} />
}

function AdminWorkspace() {
  const notify = useToast()
  const [tab, setTab] = useState("lessons")
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const key = `${tab}:${page}:${version}`
  const current = data?.key === key ? data : null
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const results = await Promise.all(
          ["/api/admin/overview", `/api/admin/${tab}?page=${page}`].map(
            async (url) => {
              const response = await fetch(url, {
                signal: controller.signal,
                cache: "no-store",
              })
              const body = await response.json()
              if (!response.ok)
                throw new Error(
                  body.error || "Couldn’t load the admin dashboard."
                )
              return body
            }
          )
        )
        setData({ key, stats: results[0], list: results[1] })
        setError("")
      } catch (error) {
        if (error.name !== "AbortError") setError(error.message)
      }
    }
    load()
    return () => controller.abort()
  }, [tab, page, key])
  async function action(path, method, body, confirmation) {
    if (busy || (confirmation && !window.confirm(confirmation))) return
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.error || "Couldn’t complete that action.")
      notify(result.message)
      setVersion((value) => value + 1)
    } catch (error) {
      notify(error.message, "error")
    } finally {
      setBusy(false)
    }
  }
  return (
    <section>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Administration
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Community overview
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Manage lessons and help keep the community thoughtful and welcoming.
      </p>
      {error ? (
        <div role="alert" className="mt-8 rounded-xl border p-6">
          <p>{error}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setError("")
              setVersion((value) => value + 1)
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["users", "Users", Users],
              ["lessons", "Lessons", BookOpen],
              ["reports", "Open reports", Flag],
              ["premiumUsers", "Premium members", Crown],
            ].map(([field, label, Icon]) => (
              <div key={field} className="rounded-xl border bg-card p-5">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {current ? current.stats[field] : "—"}
                </p>
              </div>
            ))}
          </div>
          <nav
            aria-label="Admin sections"
            className="mb-6 flex flex-wrap gap-3"
          >
            {["lessons", "reports", "users"].map((value) => (
              <Button
                key={value}
                disabled={busy}
                variant={tab === value ? "default" : "outline"}
                aria-pressed={tab === value}
                onClick={() => {
                  setTab(value)
                  setPage(1)
                }}
                className="capitalize"
              >
                {value === "reports" ? "Reported lessons" : value}
              </Button>
            ))}
          </nav>
          {!current ? (
            <p role="status" className="flex items-center gap-2 py-12">
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
              Loading dashboard…
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {current.list.total} {tab}
              </p>
              {!current.list.items.length ? (
                <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                  {tab === "reports"
                    ? "No reports to review."
                    : "Nothing here yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {current.list.items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between gap-5 rounded-xl border bg-card p-5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <h2 className="font-semibold break-words">
                          {tab === "users"
                            ? item.name || "Community member"
                            : item.title}
                        </h2>
                        <p className="mt-2 text-sm break-words text-muted-foreground">
                          {tab === "users"
                            ? item.email
                            : tab === "reports"
                              ? item.reason
                              : `${item.category} · ${item.visibility} · ${item.accessLevel}`}
                        </p>
                        {tab === "users" && (
                          <p className="mt-2 text-xs capitalize">
                            {item.role || "user"} ·{" "}
                            {item.isPremium ? "Premium" : "Free"}
                          </p>
                        )}
                        {tab === "lessons" && item.isFeatured && (
                          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">
                            Featured
                          </span>
                        )}
                      </div>
                      {tab !== "users" && (
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Link
                            href={`/dashboard/update-lesson/${encodeURIComponent(tab === "reports" ? item.lessonId : item.id)}`}
                            className={buttonVariants({ variant: "outline" })}
                          >
                            Review / edit
                          </Link>
                          {tab === "lessons" ? (
                            <>
                              <Button
                                variant="outline"
                                disabled={
                                  busy ||
                                  (!item.isFeatured &&
                                    item.visibility !== "public")
                                }
                                onClick={() =>
                                  action(
                                    `lessons/${encodeURIComponent(item.id)}`,
                                    "PATCH",
                                    { isFeatured: !item.isFeatured }
                                  )
                                }
                              >
                                {item.isFeatured ? "Unfeature" : "Feature"}
                              </Button>
                              <Button
                                variant="destructive"
                                disabled={busy}
                                onClick={() =>
                                  action(
                                    `lessons/${encodeURIComponent(item.id)}`,
                                    "DELETE",
                                    null,
                                    `Permanently delete “${item.title}” and its comments, favorites, and reports?`
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                action(
                                  `reports/${encodeURIComponent(item.id)}`,
                                  "DELETE",
                                  null,
                                  "Dismiss this report? The lesson will remain available."
                                )
                              }
                            >
                              Dismiss report
                            </Button>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {current.list.totalPages > 1 && (
                <nav
                  aria-label="Admin pages"
                  className="mt-6 flex items-center justify-center gap-4"
                >
                  <Button
                    variant="outline"
                    disabled={busy || current.list.page <= 1}
                    onClick={() => setPage(current.list.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    {current.list.page} / {current.list.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={
                      busy || current.list.page >= current.list.totalPages
                    }
                    onClick={() => setPage(current.list.page + 1)}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
