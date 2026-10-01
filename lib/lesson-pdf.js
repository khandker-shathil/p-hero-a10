const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]
  )

export function lessonPrintDocument(lesson) {
  const date = new Date(lesson.createdAt)
  const published = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(lesson.title)} - Digital Life Lessons</title><style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #202020; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.65; }
    .brand { font-size: 9pt; letter-spacing: 2px; text-transform: uppercase; color: #555; }
    h1 { font-size: 26pt; line-height: 1.2; margin: 18pt 0 12pt; overflow-wrap: anywhere; }
    .meta { color: #555; font-size: 10pt; overflow-wrap: anywhere; }
    header { border-bottom: 1px solid #ccc; padding-bottom: 16pt; margin-bottom: 20pt; }
    .story { white-space: pre-wrap; overflow-wrap: anywhere; orphans: 3; widows: 3; }
    footer { border-top: 1px solid #ccc; margin-top: 24pt; padding-top: 10pt; color: #555; font-size: 9pt; }
  </style></head><body><header><div class="brand">Digital Life Lessons</div><h1>${escape(lesson.title)}</h1><div class="meta">By ${escape(lesson.author?.name || "Community member")}${published ? ` | ${escape(published)}` : ""}</div><div class="meta">${escape(lesson.category)} | ${escape(lesson.emotionalTone)} | ${escape(lesson.visibility)} | ${escape(lesson.accessLevel)}</div></header><main class="story">${escape(lesson.description)}</main><footer>Reflect. Share. Grow.</footer></body></html>`
}

export async function printLesson(lesson) {
  const frame = document.createElement("iframe")
  frame.title = "Lesson PDF preview"
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText =
    "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0"
  const loaded = new Promise((resolve, reject) => {
    frame.onload = resolve
    frame.onerror = () => reject(new Error("Could not prepare the PDF."))
  })
  frame.srcdoc = lessonPrintDocument(lesson)
  document.body.appendChild(frame)
  try {
    await loaded
    await frame.contentDocument.fonts.ready
    const cleanup = () => frame.remove()
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true })
    frame.contentWindow.focus()
    frame.contentWindow.print()
    // Some browsers don't dispatch afterprint for an iframe.
    setTimeout(cleanup, 300000)
  } catch (error) {
    frame.remove()
    throw error
  }
}
