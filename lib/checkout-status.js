export function checkoutStatus(session) {
  if (session?.mode !== "subscription") return "unavailable"
  if (session.status === "complete") {
    if (["paid", "no_payment_required"].includes(session.payment_status))
      return "success"
    return "pending"
  }
  return "incomplete"
}

export function validCheckoutId(value) {
  return (
    typeof value === "string" &&
    /^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(value) &&
    value.length <= 255
  )
}
