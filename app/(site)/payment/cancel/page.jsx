import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, CircleX, Crown } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: "Checkout canceled | Digital Life Lessons",
  robots: { index: false, follow: false },
}

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-xs font-medium">
          <Crown className="size-4" aria-hidden="true" /> Your Premium journey
        </span>
        <div className="mx-auto mt-8 flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <CircleX className="size-10" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Checkout canceled
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          No rush. Keep growing at your pace.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          You’ve returned from checkout without completing your upgrade here.
          You can revisit Premium whenever you’re ready.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50 via-card to-card shadow-sm dark:from-amber-950/30">
        <div className="border-b p-6 sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-semibold">
            <BookOpen
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            There’s still plenty to discover
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Explore free public lessons, save the insights that stay with you,
            and keep writing your own reflections.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className={buttonVariants({ size: "lg", className: "flex-1" })}
            >
              <ArrowLeft aria-hidden="true" /> Return to pricing
            </Link>
            <Link
              href="/public-lessons"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "flex-1",
              })}
            >
              Explore lessons <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Already completed a payment? Check your{" "}
            <Link
              href="/dashboard/profile"
              className="font-medium text-foreground underline underline-offset-4"
            >
              membership status
            </Link>{" "}
            before starting another checkout.
          </p>
        </div>
      </div>
    </section>
  )
}
