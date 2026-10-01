"use client"

import { useState, useSyncExternalStore } from "react"
import {
  FacebookShareButton,
  FacebookIcon,
  XShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share"
import { Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"

const subscribe = () => () => {}
const getOrigin = () => window.location.origin
const getServerOrigin = () => ""

export function LessonShare({ lesson }) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin)
  const [manualCopy, setManualCopy] = useState(false)
  const notify = useToast()
  if (lesson.visibility !== "public") return null
  const url = `${origin}/lessons/${encodeURIComponent(lesson.id)}`
  const style =
    "flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      notify("Lesson link copied.")
    } catch {
      setManualCopy(true)
    }
  }
  return (
    <section
      aria-label="Share this lesson"
      className="mt-5 rounded-xl border bg-muted/20 p-4"
    >
      <p className="mb-3 text-sm font-medium">Pass this lesson along</p>
      {origin && (
        <div className="flex flex-wrap items-center gap-3">
          <FacebookShareButton
            url={url}
            resetButtonStyle={false}
            className={style}
            aria-label="Share lesson on Facebook"
          >
            <FacebookIcon size={28} round aria-hidden="true" />
            Facebook
          </FacebookShareButton>
          <XShareButton
            url={url}
            title={lesson.title}
            resetButtonStyle={false}
            className={style}
            aria-label="Share lesson on X"
          >
            <XIcon size={28} round aria-hidden="true" />X
          </XShareButton>
          <LinkedinShareButton
            url={url}
            title={lesson.title}
            resetButtonStyle={false}
            className={style}
            aria-label="Share lesson on LinkedIn"
          >
            <LinkedinIcon size={28} round aria-hidden="true" />
            LinkedIn
          </LinkedinShareButton>
          <Button variant="outline" onClick={copyLink}>
            <LinkIcon aria-hidden="true" />
            Copy link
          </Button>
        </div>
      )}
      {manualCopy && (
        <label className="mt-3 block text-xs text-muted-foreground">
          Copy this link:
          <input
            aria-label="Lesson link"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            className="mt-2 w-full rounded-md border bg-background p-2 text-sm text-foreground"
          />
        </label>
      )}
      {lesson.accessLevel === "premium" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Readers need Premium access to open this lesson.
        </p>
      )}
    </section>
  )
}
