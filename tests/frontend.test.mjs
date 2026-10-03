import test from "node:test"
import assert from "node:assert/strict"
import { safeReturnTo, loginDestination } from "../lib/auth-redirect.js"
import {
  parseLessonFilters,
  lessonSearchParams,
} from "../lib/lesson-filters.js"

test("login return URLs must stay inside the application", () => {
  for (const input of [
    null,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/\nevil.example",
  ])
    assert.equal(safeReturnTo(input), "/")
  assert.equal(safeReturnTo("/lessons/123"), "/lessons/123")
})
test("filters survive a URL round trip", () => {
  const filters = {
    q: "A & B",
    category: "Career",
    tone: "Gratitude",
    sort: "most-saved",
    page: 2,
  }
  assert.deepEqual(parseLessonFilters(lessonSearchParams(filters)), filters)
})
test("invalid filters and page values fall back safely", () => {
  assert.deepEqual(
    parseLessonFilters(
      new URLSearchParams({
        category: "invalid",
        tone: "invalid",
        page: "-9",
        sort: "invalid",
      })
    ),
    { q: "", category: "", tone: "", page: 1, sort: "newest" }
  )
})

test("login defaults to the right dashboard and preserves explicit destinations", () => {
  assert.equal(loginDestination("/", "user"), "/dashboard")
  assert.equal(loginDestination("/", "admin"), "/dashboard/admin")
  assert.equal(loginDestination("/lessons/123", "user"), "/lessons/123")
  assert.equal(
    loginDestination("/pricing/success?session_id=cs_test_abc", "user"),
    "/pricing/success?session_id=cs_test_abc"
  )
  assert.equal(loginDestination("https://evil.example", "user"), "/dashboard")
})
