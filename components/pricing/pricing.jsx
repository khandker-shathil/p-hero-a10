"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Check, Crown, CreditCard } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, buttonVariants } from "@/components/ui/button"

const freeFeatures = [
  "Read free public lessons",
  "Create your own free lessons",
  "Keep lessons private or share them publicly",
  "Save favorites and join the conversation",
]
const premiumFeatures = [
  "Everything included in Free",
  "Read premium public lessons",
  "Create lessons with premium access",
  "Premium badge on your profile",
]

const comparison = [
  [
    "Lessons you can create",
    "Unlimited free lessons",
    "Unlimited free or premium lessons",
  ],
  ["Public and private visibility", true, true],
  ["Read free public lessons", true, true],
  ["Read other authors’ premium public lessons", false, true],
  ["Create premium lessons", false, true],
  ["Favorites, likes, and comments", true, true],
  ["Export accessible lessons as PDF", true, true],
  ["Premium profile badge", false, true],
]

export function Pricing() {
  const { data: session, isPending } = authClient.useSession()
  const premium = !!session?.user?.isPremium

  return (
    <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-xs font-medium">
          <Crown className="size-4" aria-hidden="true" /> A little more room to
          grow
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          More perspectives.
          <br />
          More lessons for life.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Start with the everyday wisdom of our community. Go Premium to explore
          more stories and share more of your own.
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border bg-card p-7 sm:p-8">
          <BookOpen
            className="mb-5 size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build your habit of reflection.
          </p>
          <p className="mt-7 text-4xl font-semibold">
            $0{" "}
            <span className="text-sm font-normal text-muted-foreground">
              to get started
            </span>
          </p>
          <Features items={freeFeatures} />
          {isPending ? (
            <Button disabled variant="outline" className="mt-auto w-full">
              Loading your plan…
            </Button>
          ) : session ? (
            <Link
              href="/public-lessons"
              className={buttonVariants({
                variant: "outline",
                className: "mt-auto w-full",
              })}
            >
              Browse lessons
            </Link>
          ) : (
            <Link
              href="/register"
              className={buttonVariants({
                variant: "outline",
                className: "mt-auto w-full",
              })}
            >
              Start for free <ArrowRight />
            </Link>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No payment required.
          </p>
        </article>

        <article className="relative flex flex-col rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-50 via-card to-card p-7 shadow-sm sm:p-8 dark:from-amber-950/30">
          <span className="absolute top-6 right-6 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            {premium ? "Your current plan" : "Go deeper"}
          </span>
          <Crown
            className="mb-5 size-7 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">Premium</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlock more of the community’s wisdom.
          </p>
          <p className="mt-7 text-3xl font-semibold">
            $5.99{" "}
            <span className="text-sm font-normal text-muted-foreground">
              USD · subscription
            </span>
          </p>
          <Features items={premiumFeatures} />
          {isPending ? (
            <Button disabled className="mt-auto w-full">
              Loading your plan…
            </Button>
          ) : premium ? (
            <Link
              href="/public-lessons"
              className={buttonVariants({ className: "mt-auto w-full" })}
            >
              Explore your lessons <ArrowRight />
            </Link>
          ) : (
            <a
              href="#checkout"
              className={buttonVariants({ className: "mt-auto w-full" })}
            >
              View upgrade details <ArrowRight />
            </a>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {premium
              ? "Your premium access is active."
              : "Continue to Stripe to subscribe."}
          </p>
        </article>
      </div>

      <section
        aria-labelledby="comparison-heading"
        className="mx-auto mt-12 max-w-4xl"
      >
        <h2
          id="comparison-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Find the plan that fits your journey
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Keep reflecting for free, or unlock more perspectives with Premium.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full table-fixed text-left text-xs sm:text-sm">
            <caption className="sr-only">
              Free and Premium plan feature comparison
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="w-2/5 p-3 font-semibold sm:p-5">
                  Features
                </th>
                <th
                  scope="col"
                  className="p-3 text-center font-semibold sm:p-5"
                >
                  Free
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    $0
                  </span>
                </th>
                <th
                  scope="col"
                  className="bg-amber-50/70 p-3 text-center font-semibold sm:p-5 dark:bg-amber-950/20"
                >
                  <span className="inline-flex items-center gap-1">
                    <Crown className="size-4" aria-hidden="true" />
                    Premium
                  </span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    $5.99 USD subscription
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {comparison.map(([feature, free, paid]) => (
                <tr key={feature}>
                  <th scope="row" className="p-3 font-medium sm:p-5">
                    {feature}
                  </th>
                  <td className="p-3 text-center sm:p-5">
                    <ComparisonValue value={free} />
                  </td>
                  <td className="bg-amber-50/70 p-3 text-center sm:p-5 dark:bg-amber-950/20">
                    <ComparisonValue value={paid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Private lessons stay private on both plans. Premium access applies to
          lessons shared publicly. Review your subscription’s billing schedule
          on Stripe before paying.
        </p>
      </section>

      {!premium && (
        <section
          id="checkout"
          aria-labelledby="checkout-heading"
          className="mx-auto mt-10 max-w-4xl scroll-mt-24 rounded-2xl border bg-muted/20 p-7 sm:p-8"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <CreditCard
                className="mb-4 size-6 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 id="checkout-heading" className="text-xl font-semibold">
                Your upgrade
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Subscribe to Premium for $5.99 USD. Review your billing schedule
                and payment details on Stripe before confirming.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Your subscription unlocks premium public lessons and lets you
                create lessons with premium access.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3 border-b pb-4 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Crown className="size-4" aria-hidden="true" /> Premium access
                </span>
                <span>$5.99 USD</span>
              </div>
              <p className="mt-4 text-sm break-all text-muted-foreground">
                {session?.user
                  ? `Account: ${session.user.email}`
                  : "Sign in to subscribe with your account."}
              </p>
              <form
                action="/api/checkout_sessions"
                method="POST"
                className="mt-5"
              >
                <section aria-label="Stripe checkout">
                  <Button
                    type="submit"
                    disabled={isPending || !session?.user}
                    className="w-full"
                    aria-describedby="payment-status"
                  >
                    {isPending ? "Loading your account…" : "Checkout"}
                  </Button>
                </section>
              </form>
              <p
                id="payment-status"
                className="mt-3 text-center text-xs text-muted-foreground"
              >
                Continue to Stripe to review and confirm your subscription.
              </p>
              {!isPending && !session && (
                <Link
                  href="/login?returnTo=%2Fpricing"
                  className="mt-4 block text-center text-sm font-medium underline underline-offset-4"
                >
                  Sign in to your account
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto mt-14 max-w-4xl">
        <h2 className="mb-5 text-xl font-semibold">A few things to know</h2>
        {[
          [
            "Can I keep using the free plan?",
            "Yes. You can read free public lessons, create free lessons, and save your favorites without upgrading.",
          ],
          [
            "Does Premium unlock private lessons?",
            "No. Private lessons stay private. Premium gives you access to premium lessons that their authors have shared publicly.",
          ],
          [
            "How do I subscribe?",
            "Sign in, then select Checkout. You’ll continue to Stripe to review the $5.99 USD subscription and its billing schedule before confirming payment.",
          ],
        ].map(([question, answer]) => (
          <details key={question} className="border-b py-5">
            <summary className="cursor-pointer rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
              {question}
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Features({ items }) {
  return (
    <ul className="my-8 space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6">
          <Check
            className="mt-1 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

function ComparisonValue({ value }) {
  if (value === true)
    return (
      <span className="inline-flex flex-col items-center gap-1 text-emerald-700 dark:text-emerald-300">
        <Check className="size-4" aria-hidden="true" />
        <span className="text-xs">Included</span>
      </span>
    )
  if (value === false)
    return <span className="text-xs text-muted-foreground">Not included</span>
  return <span className="leading-5">{value}</span>
}
