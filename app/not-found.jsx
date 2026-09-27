import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-semibold tracking-tighter text-muted-foreground/40">
          404
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 mb-8 text-sm leading-6 text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link href="/" className={buttonVariants()}>
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </main>
  )
}
