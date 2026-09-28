import { LoaderCircle } from "lucide-react"

export default function Loading() {
  return (
    <div
      role="status"
      className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground"
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      Loading public lessons…
    </div>
  )
}
