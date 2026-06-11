import Link from "next/link"
import { BookOpenText } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function FlipbookNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef7f0_35%,#ffffff_75%)] px-4">
      <section className="max-w-md rounded-[2rem] border border-primary/10 bg-white/85 p-8 text-center shadow-2xl shadow-primary/10 backdrop-blur-md">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BookOpenText className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-black text-primary">
          Flipbook not available
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This issue may not be published yet, or its pages are not ready.
        </p>

        <Button asChild className="mt-6 rounded-full font-bold">
          <Link href="/">Back to Home</Link>
        </Button>
      </section>
    </main>
  )
}