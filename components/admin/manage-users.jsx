"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AdminTable,
  cell,
  DataState,
  PageHeading,
  Pagination,
  useAdminAction,
  useAdminData,
} from "@/components/admin/shared"

export function AdminUsers() {
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const refresh = () => setVersion((value) => value + 1)
  const { data, error } = useAdminData(`users?page=${page}`, version)
  const { act, busy } = useAdminAction(refresh)
  return (
    <section>
      <PageHeading title="Manage users">
        View community members and grant admin access to trusted users.
      </PageHeading>
      <DataState data={data} error={error} retry={refresh}>
        {data && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} accounts
            </p>
            <AdminTable
              headings={["Name", "Email", "Role", "Lessons created", "Action"]}
              empty={!data.items.length}
            >
              {data.items.map((user) => (
                <tr key={user.id}>
                  <td className={cell}>{user.name || "Community member"}</td>
                  <td className={`${cell} break-all`}>{user.email}</td>
                  <td className={`${cell} capitalize`}>{user.role}</td>
                  <td className={cell}>{user.totalLessons}</td>
                  <td className={cell}>
                    {user.role === "admin" ? (
                      <span className="text-muted-foreground">Admin</span>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          act(
                            `users/${encodeURIComponent(user.id)}/role`,
                            "PATCH",
                            { role: "admin" },
                            `Give ${user.email} full admin access to users, lessons, and reports?`
                          )
                        }
                      >
                        Promote to admin
                      </Button>
                    )}
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
