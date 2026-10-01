"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  AdminTable,
  cell,
  DataState,
  PageHeading,
  Pagination,
  useAdminAction,
  useAdminData,
} from "@/components/admin/shared"

export function AdminReports() {
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [selected, setSelected] = useState(null)
  const refresh = () => setVersion((value) => value + 1)
  const { data, error } = useAdminData(`reports?page=${page}`, version)
  const { act, busy } = useAdminAction(refresh)
  return (
    <section>
      <PageHeading title="Reported lessons">
        Reports are grouped by lesson. Inspect the reasons before deleting
        content or clearing its reports.
      </PageHeading>
      <DataState data={data} error={error} retry={refresh}>
        {data && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} reported lessons
            </p>
            <AdminTable
              headings={["Lesson title", "Report count", "Reasons", "Actions"]}
              empty={!data.items.length}
            >
              {data.items.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={`${cell} min-w-48 font-medium`}>
                    {lesson.title}
                  </td>
                  <td className={cell}>{lesson.reportCount}</td>
                  <td className={cell}>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => setSelected(lesson)}
                    >
                      View reasons
                    </Button>
                  </td>
                  <td className={cell}>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/update-lesson/${encodeURIComponent(lesson.id)}`}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Review lesson
                      </Link>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          act(
                            `reports/${encodeURIComponent(lesson.id)}`,
                            "DELETE",
                            null,
                            `Ignore all reports for “${lesson.title}”? The lesson will stay live.`
                          )
                        }
                      >
                        Ignore
                      </Button>
                      <Button
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
                        Delete lesson
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
      {selected && (
        <ReportDialog
          key={selected.id}
          lesson={selected}
          close={() => setSelected(null)}
        />
      )}
    </section>
  )
}
function ReportDialog({ lesson, close }) {
  const dialog = useRef(null)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const { data, error } = useAdminData(
    `reports/${encodeURIComponent(lesson.id)}?page=${page}`,
    version
  )
  useEffect(() => {
    const node = dialog.current
    if (!node.open) node.showModal()
  }, [])
  return (
    <dialog
      ref={dialog}
      onCancel={close}
      onClose={close}
      aria-labelledby="report-modal-title"
      className="fixed inset-0 m-auto max-h-[85svh] w-[min(95vw,48rem)] overflow-y-auto rounded-2xl border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="report-modal-title" className="text-xl font-semibold">
            Report reasons
          </h2>
          <p className="mt-2 text-sm break-words text-muted-foreground">
            {lesson.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close report reasons"
          onClick={() => dialog.current.close()}
        >
          <X />
        </Button>
      </div>
      <DataState
        data={data}
        error={error}
        retry={() => setVersion((value) => value + 1)}
      >
        {data && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} reports
            </p>
            <ul className="space-y-4">
              {data.items.map((report) => (
                <li key={report.id} className="rounded-lg border p-4">
                  <p className="font-medium">{report.reason}</p>
                  <p className="mt-2 text-sm break-words">
                    {report.reporterName}
                  </p>
                  <p className="mt-1 text-xs break-all text-muted-foreground">
                    {report.reporterEmail || "Email unavailable"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {report.timestamp &&
                    !Number.isNaN(new Date(report.timestamp).getTime())
                      ? new Date(report.timestamp).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </li>
              ))}
            </ul>
            {!data.items.length && (
              <p className="py-6 text-sm text-muted-foreground">
                These reports have been cleared.
              </p>
            )}
            <Pagination data={data} setPage={setPage} />
          </>
        )}
      </DataState>
    </dialog>
  )
}
