import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "@/components/logout-button"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/10 backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                Admin Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary">
                Welcome, Chronicler Staff
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as {user.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </section>
    </main>
  )
}