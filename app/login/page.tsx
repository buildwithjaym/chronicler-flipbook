import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import {
  BookOpenText,
  Layers3,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import LoginForm from "./login-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Staff Login | The Chronicler",
  description: "Secure staff login for The Chronicler publication dashboard.",
}

export default async function LoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle()

    const isActiveStaff =
      profile?.status === "active" &&
      ["admin", "editor", "staff"].includes(profile.role)

    if (isActiveStaff) {
      redirect("/admin")
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_34%,#ffffff_72%)] px-4 py-8 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Staff Access
          </div>

          <h1 className="max-w-2xl text-5xl font-black tracking-tight text-primary xl:text-6xl">
            The Chronicler Control Room
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            Manage publication issues, digital flipbooks, uploaded assets, and
            staff-only editorial workflows from one secure dashboard.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-3xl border border-primary/10 bg-white/75 p-5 shadow-xl shadow-primary/5 backdrop-blur-md">
              <Newspaper className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm font-bold text-foreground">
                Issue Management
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Organize publication releases and archive entries.
              </p>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-white/75 p-5 shadow-xl shadow-primary/5 backdrop-blur-md">
              <BookOpenText className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm font-bold text-foreground">
                Flipbook Control
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Prepare pages, thumbnails, and reader-ready layouts.
              </p>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-white/75 p-5 shadow-xl shadow-primary/5 backdrop-blur-md">
              <Layers3 className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm font-bold text-foreground">
                Staff Workflow
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Keep publishing tasks controlled and role-based.
              </p>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-white/75 p-5 shadow-xl shadow-primary/5 backdrop-blur-md">
              <LockKeyhole className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm font-bold text-foreground">
                Secure Access
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Only active staff accounts can enter the dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
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

          <div className="mb-4 hidden items-center justify-center gap-2 rounded-full border border-primary/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur-md lg:inline-flex">
            <Sparkles className="h-4 w-4" />
            Secure Publication Portal
          </div>

          <Suspense
            fallback={
              <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
                <div className="h-72 animate-pulse rounded-3xl bg-primary/10" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}