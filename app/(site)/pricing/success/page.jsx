import { ActivatePremium } from "@/components/pricing/activate-premium"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CircleCheck,
  Clock3,
  Crown,
  CreditCard,
  CircleAlert,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { checkoutStatus, validCheckoutId } from "@/lib/checkout-status"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Checkout confirmation | Digital Life Lessons",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

const messages = {
  success: {
    title: "A new chapter starts here.",
    label: "Checkout confirmed",
    description:
      "Thank you for subscribing to Premium. Stripe has confirmed your checkout. Keep discovering the lessons that help you grow.",
    Icon: CircleCheck,
  },
  pending: {
    title: "Your payment is processing.",
    label: "Confirmation pending",
    description:
      "Your checkout is complete, but Stripe is still processing the payment. Check again shortly; there’s no need to pay twice.",
    Icon: Clock3,
  },
  incomplete: {
    title: "Checkout isn’t complete yet.",
    label: "Payment not confirmed",
    description:
      "This checkout has not been completed or has expired. Return to pricing when you’re ready to continue.",
    Icon: CircleAlert,
  },
  unavailable: {
    title: "We couldn’t confirm this checkout.",
    label: "Confirmation unavailable",
    description:
      "We couldn’t verify a completed subscription from this link. If you just paid, check again shortly before starting another checkout.",
    Icon: CircleAlert,
  },
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const { session_id: id } = await searchParams
  let status = "unavailable"
  const valid = validCheckoutId(id)
  if (valid) {
    try {
      const { stripe } = await import("@/lib/stripe")
      const session = await stripe.checkout.sessions.retrieve(
        id,
        {},
        { timeout: 10000, maxNetworkRetries: 0 }
      )
      status = checkoutStatus(session)
    } catch {
      // Keep provider errors and customer data out of the page.
    }
  }
  const { title, label, description, Icon } = messages[status]
  const success = status === "success"
  return (
    <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-xs font-medium">
          <Crown className="size-4" aria-hidden="true" />
          Your Premium journey
        </span>
        <div
          className={`mx-auto mt-8 flex size-20 items-center justify-center rounded-full ${success ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"}`}
        >
          <Icon className="size-10" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50 via-card to-card shadow-sm dark:from-amber-950/30">
        <div className="border-b p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <Crown className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Digital Life Lessons Premium
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A little more room to grow.
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
            {[
              ["Plan", "Premium subscription"],
              ["Checkout", label],
              ["Payment provider", "Stripe"],
            ].map(([name, value]) => (
              <div key={name}>
                <dt className="text-xs text-muted-foreground">{name}</dt>
                <dd className="mt-2 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4" aria-hidden="true" />
            Included with Premium
          </h3>
          <ul className="mt-4 space-y-3">
            {[
              "Discover premium public lessons",
              "Share your own lessons with premium access",
              "Show your Premium profile badge",
            ].map((text) => (
              <li key={text} className="flex gap-3 text-sm">
                <Check
                  className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
          {success && <ActivatePremium sessionId={id} />}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {success ? (
              <>
                <Link
                  href="/public-lessons"
                  className={buttonVariants({
                    size: "lg",
                    className: "flex-1",
                  })}
                >
                  Explore lessons <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "flex-1",
                  })}
                >
                  View my profile
                </Link>
              </>
            ) : (
              <>
                {valid && status !== "incomplete" && (
                  <a
                    href={`/pricing/success?session_id=${encodeURIComponent(id)}`}
                    className={buttonVariants({
                      size: "lg",
                      className: "flex-1",
                    })}
                  >
                    Check again
                  </a>
                )}
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "flex-1",
                  })}
                >
                  <ArrowLeft aria-hidden="true" />
                  Back to pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <CreditCard className="size-4" aria-hidden="true" />
        Payments handled by Stripe.
      </p>
    </section>
  )
}
