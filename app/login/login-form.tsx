"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type UserRole = "pending" | "staff" | "editor" | "admin"
type UserStatus = "pending" | "active" | "disabled"

type StaffProfile = {
  role: UserRole
  status: UserStatus
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const redirectedFrom = searchParams.get("redirectedFrom")
  const routeError = searchParams.get("error")

  const safeRedirect =
    redirectedFrom &&
    redirectedFrom.startsWith("/") &&
    !redirectedFrom.startsWith("//")
      ? redirectedFrom
      : "/admin"

  const displayError =
    errorMessage ||
    (routeError === "unauthorized"
      ? "Your account is not authorized to access the staff dashboard."
      : "")

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()

    setErrorMessage("")
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error || !data.user) {
      setErrorMessage("Invalid email or password. Please try again.")
      setIsLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", data.user.id)
      .maybeSingle<StaffProfile>()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      setErrorMessage("No staff profile was found for this account.")
      setIsLoading(false)
      return
    }

    if (profile.status === "pending") {
      await supabase.auth.signOut()
      setErrorMessage("Your staff account is still pending activation.")
      setIsLoading(false)
      return
    }

    if (profile.status === "disabled") {
      await supabase.auth.signOut()
      setErrorMessage("This staff account has been disabled.")
      setIsLoading(false)
      return
    }

    const allowedRoles: UserRole[] = ["admin", "editor", "staff"]

    if (!allowedRoles.includes(profile.role)) {
      await supabase.auth.signOut()
      setErrorMessage("This account is not allowed to access the dashboard.")
      setIsLoading(false)
      return
    }

    router.push(safeRedirect)
    router.refresh()
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white/85 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="mb-6 rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-4 sm:p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-primary">
            Staff Login
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your authorized staff credentials to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-foreground"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="email"
                type="email"
                placeholder="staff@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                className="h-12 w-full rounded-full border border-primary/15 bg-white px-11 text-sm font-medium outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
                className="h-12 w-full rounded-full border border-primary/15 bg-white px-11 pr-12 text-sm font-medium outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {displayError ? (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
            >
              {displayError}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-12 w-full rounded-full font-bold shadow-xl shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying access...
              </>
            ) : (
              "Enter Dashboard"
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-primary/10" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Staff Only
          </span>
          <div className="h-px flex-1 bg-primary/10" />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}