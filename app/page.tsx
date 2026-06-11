import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Read The Chronicler through an interactive digital flipbook publication system.",
}

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_34%,#ffffff_72%)] px-4 py-10 text-foreground">
      {/* Background Glows */}
      <div
        aria-hidden="true"
        className="soft-glow pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="soft-glow pointer-events-none absolute bottom-10 right-8 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Grid Background Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Top Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-4 w-4" />
          Digital Newsletter Flipbook
        </div>

        {/* Logo Area */}
<div className="mb-6 flex flex-col items-center">
  <div className="logo-float relative">
    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-primary/10 bg-white p-4 shadow-2xl shadow-primary/10 sm:h-32 sm:w-32 lg:h-36 lg:w-36">
      <Image
        src="/logo.jpg"
        alt="The Chronicler Logo"
        width={128}
        height={128}
        className="h-full w-full rounded-full object-contain"
        priority
      />
    </div>

    {/* Messenger-style Online Indicator with glow/pulse */}
    <div
      aria-label="Online"
      className="online-dot absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-600 shadow-md"
    >
      <span className="h-3 w-3 rounded-full bg-green-400" />
    </div>
  </div>
</div>
        {/* Title */}
        <h1 className="text-3xl font-extrabold leading-snug text-primary sm:text-4xl md:text-5xl lg:text-6xl">
          The Chronicler Digital Publication System
        </h1>

        {/* Developer Credit */}
        <p className="mt-3 text-base font-medium text-foreground sm:text-lg">
          Developed by Jaymar Maruji
        </p>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:mt-5">
          Read official student publication issues online through a clean,
          mobile-friendly, interactive flipbook experience.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-7 shadow-lg shadow-primary/20"
          >
            <Link href="/issues/latest" className="inline-flex items-center gap-2">
              Read Latest Issue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-primary/20 bg-white/70 px-7 hover:bg-primary/5"
          >
            <Link href="/login">Staff Login</Link>
          </Button>
        </div>

        {/* Bottom Status */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-primary/10 backdrop-blur-md">
          <Wifi className="h-3.5 w-3.5 text-primary" />
          Live digital access for published issues
        </div>
      </section>
    </main>
  )
}