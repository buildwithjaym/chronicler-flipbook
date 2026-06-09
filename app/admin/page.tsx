import { requireStaff } from "@/lib/auth/require-staff"

export default async function AdminPage() {
  const { profile } = await requireStaff("/admin")

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-primary">
        Welcome, {profile.full_name || profile.email}
      </h1>

      <p className="mt-2 text-muted-foreground">
        The Chronicler dashboard is ready.
      </p>
    </main>
  )
}