import type { Metadata } from "next"
import { Suspense } from "react"
import { ShieldCheck } from "lucide-react"
import LoginForm from "./login-form"

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Login page for The Chronicler publication staff.",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="soft-glow pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="soft-glow pointer-events-none absolute bottom-10 right-8 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Staff Access
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Login to The Chronicler
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Access the publication dashboard to manage issues, uploads, and
            digital flipbook content.
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  )
}