export function safeReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return "/"
  return value
}

export function loginDestination(returnTo, role) {
  const target = safeReturnTo(returnTo)
  return target === "/"
    ? role === "admin"
      ? "/dashboard/admin"
      : "/dashboard"
    : target
}
