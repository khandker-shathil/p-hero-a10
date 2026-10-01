"use client"

import { useState } from "react"
import Link from "next/link"
import { CATEGORIES } from "@/lib/lesson-filters"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  AdminTable,
  cell,
  DataState,
  PageHeading,
  Pagination,
  Stats,
  useAdminAction,
  useAdminData,
} from "@/components/admin/shared"

export function AdminLessons() {
  const [filters, setFilters] = useState({
    category: "",
    visibility: "",
    flags: "",
  })
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const refresh = () => setVersion((value) => value + 1)
  const query = new URLSearchParams({ ...filters, page: String(page) })
  const { data, error } = useAdminData(`lessons?${query}`, version)
  const { act, busy } = useAdminAction(refresh)
  return (
    <section>
      <PageHeading title="Manage lessons">
        Review every lesson, choose featured content, and moderate inappropriate
        material.
      </PageHeading>
      <fieldset disabled={busy} className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["category", "Category", CATEGORIES],
          ["visibility", "Visibility", ["public", "private"]],
          ["flags", "Reports", ["flagged", "unflagged"]],
        ].map(([name, label, options]) => (
          <label key={name} className="text-sm font-medium">
            {label}
            <select
              value={filters[name]}
              onChange={(event) => {
                setFilters({ ...filters, [name]: event.target.value })
                setPage(1)
              }}
              className="mt-2 block w-full rounded-lg border bg-background p-3 capitalize"
            >
              <option value="">All {label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
      <DataState data={data} error={error} retry={refresh}>
        {data && (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Platform totals, across all filters
            </p>
            <Stats
              items={[
                ["Public lessons", data.stats.publicLessons],
                ["Private lessons", data.stats.privateLessons],
                ["Flagged lessons", data.stats.flaggedLessons],
              ]}
            />
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} matching lessons
            </p>
            <AdminTable
              headings={[
                "Lesson",
                "Visibility",
                "Reports",
                "Status",
                "Actions",
              ]}
              empty={!data.items.length}
            >
              {data.items.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={`${cell} min-w-48`}>
                    <p className="font-medium break-words">{lesson.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lesson.category} · {lesson.accessLevel}
                    </p>
                  </td>
                  <td className={`${cell} capitalize`}>{lesson.visibility}</td>
                  <td className={cell}>{lesson.reportCount}</td>
                  <td className={cell}>
                    <p>{lesson.isReviewed ? "Reviewed" : "Awaiting review"}</p>
                    {lesson.isFeatured && (
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Featured
                      </p>
                    )}
                  </td>
                  <td className={cell}>
                    <div className="flex min-w-56 flex-wrap gap-2">
                      <Link
                        href={`/dashboard/update-lesson/${encodeURIComponent(lesson.id)}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Review / edit
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          busy ||
                          (!lesson.isFeatured && lesson.visibility !== "public")
                        }
                        onClick={() =>
                          act(
                            `lessons/${encodeURIComponent(lesson.id)}`,
                            "PATCH",
                            { isFeatured: !lesson.isFeatured }
                          )
                        }
                      >
                        {lesson.isFeatured ? "Unfeature" : "Feature"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          act(
                            `lessons/${encodeURIComponent(lesson.id)}`,
                            "PATCH",
                            { isReviewed: !lesson.isReviewed }
                          )
                        }
                      >
                        {lesson.isReviewed
                          ? "Mark unreviewed"
                          : "Mark reviewed"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                          act(
                            `lessons/${encodeURIComponent(lesson.id)}`,
                            "DELETE",
                            null,
                            `Permanently delete “${lesson.title}” and all its comments, favorites, and reports?`
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
            <Pagination data={data} setPage={setPage} busy={busy} />
          </>
        )}
      </DataState>
    </section>
  )
}
