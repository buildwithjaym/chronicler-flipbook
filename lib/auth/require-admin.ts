import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function requireAdmin(redirectPath = "/admin") {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect(`/login?redirectedFrom=${encodeURIComponent(redirectPath)}`)
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, email, role, status")
    .eq("id", user.id)
    .maybeSingle()

  const isAdmin = profile?.role === "admin" && profile?.status === "active"

  if (!isAdmin) {
    redirect("/login?error=unauthorized")
  }

  return {
    user,
    profile,
    supabase,
  }
}