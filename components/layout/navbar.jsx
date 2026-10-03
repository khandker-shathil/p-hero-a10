"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Crown,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { label: "Home", href: "/" },
  { label: "Public Lessons", href: "/public-lessons" },
  { label: "Add Lesson", href: "/dashboard/add-lesson" },
  { label: "My Lessons", href: "/dashboard" },
]

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function Navbar() {
  const pathname = usePathname()
  // Remount the disclosures on navigation, including browser back/forward.
  return <NavbarContent key={pathname} pathname={pathname} />
}

function NavbarContent({ pathname }) {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState("")
  const accountRef = useRef(null)
  const mobileButtonRef = useRef(null)
  const headerRef = useRef(null)

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!accountRef.current?.contains(event.target) && accountRef.current) {
        accountRef.current.open = false
      }
      if (!headerRef.current?.contains(event.target)) setMobileOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key !== "Escape") return
      if (accountRef.current?.open) {
        accountRef.current.open = false
        accountRef.current.querySelector("summary")?.focus()
      } else if (mobileOpen) {
        setMobileOpen(false)
        mobileButtonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [mobileOpen])

  async function signOut() {
    setSigningOut(true)
    setError("")
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error("Sign out failed")
      if (accountRef.current) accountRef.current.open = false
      setMobileOpen(false)
      router.push("/")
      router.refresh()
    } catch {
      setError("Could not sign out. Please try again.")
    } finally {
      setSigningOut(false)
    }
  }

  function navigationLink({ href, label }) {
    const active =
      href === "/"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          focusStyle,
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
      >
        {label}
      </Link>
    )
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md"
    >
      <a
        href="#main-content"
        className={cn(
          "absolute top-2 left-4 z-50 -translate-y-24 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground focus:translate-y-0",
          focusStyle
        )}
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Digital Life Lessons home"
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-lg",
            focusStyle
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm leading-tight font-semibold tracking-tight sm:text-base">
            Digital Life
            <span className="block text-xs font-normal tracking-[0.18em] text-muted-foreground uppercase">
              Lessons
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {links.map(navigationLink)}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user &&
            (user.isPremium ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 sm:inline-flex dark:bg-amber-950 dark:text-amber-200">
                <Crown className="size-3.5" aria-hidden="true" />
                Premium
              </span>
            ) : (
              <Link
                href="/pricing"
                className={cn(
                  "hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground xl:inline-flex",
                  focusStyle
                )}
              >
                <Crown className="size-4" aria-hidden="true" />
                Upgrade
              </Link>
            ))}

          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle color theme"
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground",
              focusStyle
            )}
          >
            <Sun className="hidden size-4.5 dark:block" aria-hidden="true" />
            <Moon className="size-4.5 dark:hidden" aria-hidden="true" />
          </button>

          {isPending ? (
            <span
              role="status"
              className="flex size-10 items-center justify-center"
            >
              <LoaderCircle
                className="size-5 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">Loading account</span>
            </span>
          ) : user ? (
            <details ref={accountRef} className="relative">
              <summary
                aria-label="Account options"
                className={cn(
                  "flex cursor-pointer list-none items-center gap-1.5 rounded-full [&::-webkit-details-marker]:hidden",
                  focusStyle
                )}
              >
                <Avatar key={user.image || user.name} user={user} />
                <ChevronDown
                  className="hidden size-3.5 text-muted-foreground sm:block"
                  aria-hidden="true"
                />
              </summary>
              <div className="absolute top-full right-0 mt-3 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
                <div className="mb-1 border-b px-3 py-3">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-accent",
                    focusStyle
                  )}
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  Profile
                </Link>
                <Link
                  href={
                    user.role === "admin" ? "/dashboard/admin" : "/dashboard"
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-accent",
                    focusStyle
                  )}
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                </Link>
                {user.isPremium ? (
                  <p className="flex items-center gap-2 px-3 py-2.5 text-sm">
                    <Crown className="size-4" aria-hidden="true" />
                    Premium member
                  </p>
                ) : (
                  <Link
                    href="/pricing"
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-accent",
                      focusStyle
                    )}
                  >
                    <Crown className="size-4" aria-hidden="true" />
                    Upgrade to Premium
                  </Link>
                )}
                <div className="mt-1 border-t pt-1">
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={signOut}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-accent disabled:opacity-50",
                      focusStyle
                    )}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Log out"}
                  </button>
                </div>
              </div>
            </details>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 px-4"
                )}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants(), "h-10 gap-2 px-4")}
              >
                Sign up
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          <button
            ref={mobileButtonRef}
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg hover:bg-accent lg:hidden",
              focusStyle
            )}
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!mobileOpen}
        className="border-t px-4 py-4 lg:hidden"
      >
        <div className="flex flex-col gap-1">{links.map(navigationLink)}</div>
        {user?.isPremium && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <Crown className="size-3.5" aria-hidden="true" />
            Premium member
          </span>
        )}
        {!isPending && !user && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline" })}
            >
              Log in
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Sign up
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
        {user && !user.isPremium && (
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-4 w-full"
            )}
          >
            <Crown className="size-4" aria-hidden="true" />
            Upgrade to Premium
          </Link>
        )}
      </nav>
      {error && (
        <div
          role="alert"
          className="fixed top-24 right-4 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border bg-popover p-4 text-sm shadow-lg"
        >
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss notification"
            className={cn("rounded p-1", focusStyle)}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </header>
  )
}

function Avatar({ user }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-accent text-sm font-semibold">
      {user.image && !failed ? (
        // Profile images can come from arbitrary OAuth or user-provided hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        user.name?.trim().charAt(0).toUpperCase() || (
          <UserRound className="size-4" aria-hidden="true" />
        )
      )}
    </span>
  )
}
