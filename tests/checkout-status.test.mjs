import test from "node:test"
import assert from "node:assert/strict"
import { checkoutStatus, validCheckoutId } from "../lib/checkout-status.js"

test("only completed and settled subscription sessions show confirmation", () => {
  const session = {
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
  }
  assert.equal(checkoutStatus(session), "success")
  assert.equal(
    checkoutStatus({ ...session, payment_status: "no_payment_required" }),
    "success"
  )
  assert.equal(
    checkoutStatus({ ...session, payment_status: "unpaid" }),
    "pending"
  )
  assert.equal(checkoutStatus({ ...session, status: "open" }), "incomplete")
  assert.equal(checkoutStatus({ ...session, status: "expired" }), "incomplete")
  assert.equal(checkoutStatus({ ...session, mode: "payment" }), "unavailable")
  assert.equal(checkoutStatus(null), "unavailable")
})
test("rejects missing, repeated, malformed and oversized session IDs", () => {
  for (const id of [
    undefined,
    ["cs_test_abc"],
    "../../secret",
    "cs_test_a?x=1",
    "cs_" + "a".repeat(260),
  ])
    assert.equal(validCheckoutId(id), false)
  assert.equal(validCheckoutId("cs_test_abc123"), true)
  assert.equal(validCheckoutId("cs_live_abc123"), true)
})
