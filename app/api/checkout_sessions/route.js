import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request) {
  const origin = new URL(request.url).origin
  if (request.headers.get("origin") !== origin)
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 }
    )
  try {
    const apiServer = (
      process.env.API_SERVER_URL || "http://localhost:5005"
    ).replace(/\/$/, "")
    const response = await fetch(
      `${apiServer}/api/auth/get-session?disableCookieCache=true`,
      {
        headers: { cookie: request.headers.get("cookie") || "" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!response.ok)
      return NextResponse.json(
        { error: "Couldn’t verify your account. Please try again." },
        { status: 503 }
      )
    const account = await response.json()
    if (!account?.user)
      return NextResponse.redirect(`${origin}/login?returnTo=%2Fpricing`, 303)
    if (account.user.isPremium)
      return NextResponse.redirect(`${origin}/dashboard/profile`, 303)
    const userId = String(account.user.id)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price:
            process.env.STRIPE_PRICE_ID || "price_1ULz3MCaR1yXlvXbgF6eAhcr",
          quantity: 1,
        },
      ],
      mode: "subscription",
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      customer_email: account.user.email,
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    })
    return NextResponse.redirect(session.url, 303)
  } catch {
    return NextResponse.json(
      { error: "Couldn’t start Stripe checkout. Please try again." },
      { status: 502 }
    )
  }
}
