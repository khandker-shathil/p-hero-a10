"use client"

import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

export function useAdminData(path, version = 0) {
  const [state, setState] = useState(null)
  const key = `${path}:${version}`
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/admin/${path}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok)
          throw new Error(body.error || "Couldn’t load this page.")
        setState({ key, data: body })
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ key, error: error.message })
      })
    return () => controller.abort()
  }, [path, key])
  return state?.key === key ? state : {}
}

export function useAdminAction(refresh) {
  const [busy, setBusy] = useState(false)
  const notify = useToast()
  async function act(path, method, body, confirmation) {
    if (busy || (confirmation && !window.confirm(confirmation))) return false
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
      refresh()
      return true
    } catch (error) {
      notify(error.message, "error")
      return false
    } finally {
      setBusy(false)
    }
  }
  return { busy, act }
}
export function DataState({ data, error, retry, children }) {
  if (error)
    return (
      <div role="alert" className="rounded-xl border p-6">
        <p>{error}</p>
        <Button onClick={retry} variant="outline" className="mt-4">
          Try again
        </Button>
      </div>
    )
  if (!data)
    return (
      <p
        role="status"
        className="flex items-center gap-2 py-12 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading…
      </p>
    )
  return children
}
export function PageHeading({ title, children }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{children}</p>
    </header>
  )
}
export function Pagination({ data, setPage, busy = false }) {
  if (!data || data.totalPages <= 1) return null
  return (
    <nav
      aria-label="Results pages"
      className="mt-6 flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        disabled={busy || data.page <= 1}
        onClick={() => setPage(data.page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm">
        {data.page} / {data.totalPages}
      </span>
      <Button
        variant="outline"
        disabled={busy || data.page >= data.totalPages}
        onClick={() => setPage(data.page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
export function Stats({ items }) {
  return (
    <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(([label, count]) => (
        <div key={label} className="rounded-xl border bg-card p-5">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-3 text-3xl font-semibold">{count}</dd>
        </div>
      ))}
    </dl>
  )
}
export const cell = "px-4 py-4 text-left align-top"
export function AdminTable({ headings, children, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {headings.map((label) => (
              <th key={label} scope="col" className={cell}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {empty ? (
            <tr>
              <td
                colSpan={headings.length}
                className="p-10 text-center text-muted-foreground"
              >
                No results found.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}
