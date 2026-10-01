"use client"

import { useState } from "react"
import { Download, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"
import { printLesson } from "@/lib/lesson-pdf"

export function LessonExport({ lesson }) {
  const [busy, setBusy] = useState(false)
  const notify = useToast()
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await printLesson(lesson)
          } catch {
            notify("Couldn’t open the print dialog. Please try again.", "error")
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )}
        {busy ? "Preparing…" : "Export PDF"}
      </Button>
      <span className="text-xs text-muted-foreground">
        Choose “Save as PDF” in the print dialog.
      </span>
    </div>
  )
}
