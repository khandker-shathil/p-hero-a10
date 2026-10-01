"use client"

import { useState } from "react"
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

function GrowthChart({ title, points }) {
  const max = Math.max(1, ...points.map((point) => point.count))
  const total = points.reduce((sum, point) => sum + point.count, 0)
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{total} new</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Daily additions · last 30 days · UTC
      </p>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-label={`${title}: ${total} new in the last 30 days. Daily values are listed below.`}
        className="mt-6 w-full text-primary"
      >
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1="38"
              x2="590"
              y1={200 - fraction * 180}
              y2={200 - fraction * 180}
              stroke="currentColor"
              opacity="0.12"
            />
            <text
              x="30"
              y={204 - fraction * 180}
              textAnchor="end"
              fontSize="12"
              fill="currentColor"
            >
              {Math.round(max * fraction)}
            </text>
          </g>
        ))}
        {points.map((point, index) => (
          <rect
            key={point.date}
            x={42 + index * 18}
            y={200 - (point.count / max) * 180}
            width="12"
            height={(point.count / max) * 180}
            rx="2"
            fill="currentColor"
          >
            <title>
              {point.date}: {point.count}
            </title>
          </rect>
        ))}
        <text x="38" y="226" fontSize="12" fill="currentColor">
          {points[0]?.date}
        </text>
        <text
          x="590"
          y="226"
          textAnchor="end"
          fontSize="12"
          fill="currentColor"
        >
          {points.at(-1)?.date}
        </text>
      </svg>
      {!total && (
        <p className="text-xs text-muted-foreground">
          No activity during this period.
        </p>
      )}
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-muted-foreground">
          View daily values
        </summary>
        <div className="mt-3 max-h-48 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Date (UTC)</th>
                <th className="text-right">New</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date}>
                  <td className="py-1">{point.date}</td>
                  <td className="text-right">{point.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
