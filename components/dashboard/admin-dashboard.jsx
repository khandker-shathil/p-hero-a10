"use client"

import { useState } from "react"
import { GrowthChart } from "@/components/dashboard/growth-chart"
import {
  DataState,
  PageHeading,
  Stats,
  useAdminData,
} from "@/components/admin/shared"

export function AdminDashboard() {
  const [version, setVersion] = useState(0)
  const { data, error } = useAdminData("overview", version)
  return (
    <section>
      <PageHeading title="Platform overview">
        Platform-wide activity. Growth and contributor rankings cover the last
        30 days; dates use UTC.
      </PageHeading>
      <DataState
        data={data}
        error={error}
        retry={() => setVersion((value) => value + 1)}
      >
        {data && (
          <>
            <Stats
              items={[
                ["Total users", data.users],
                ["Public lessons", data.publicLessons],
                ["Reported lessons", data.flaggedLessons],
                ["Today’s new lessons", data.todayLessons],
              ]}
            />
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <GrowthChart title="Lesson growth" points={data.growth.lessons} />
              <GrowthChart title="User growth" points={data.growth.users} />
            </div>
            <section className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold">
                Most active contributors
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ranked by lessons created in the last 30 days, including private
                lessons.
              </p>
              {data.contributors.length ? (
                <ol className="mt-6 divide-y">
                  {data.contributors.map((user, index) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <span className="min-w-0 break-words">
                        <span className="mr-3 text-muted-foreground">
                          {index + 1}.
                        </span>
                        {user.name}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {user.count} {user.count === 1 ? "lesson" : "lessons"}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  No new lessons in the last 30 days.
                </p>
              )}
            </section>
          </>
        )}
      </DataState>
    </section>
  )
}
