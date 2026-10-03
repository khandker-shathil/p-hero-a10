export function GrowthChart({ title, points }) {
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
