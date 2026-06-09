import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type AllowedRole = "admin" | "editor" | "staff"

export async function requireStaff(redirectPath = "/admin") {
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

  const allowedRoles: AllowedRole[] = ["admin", "editor", "staff"]

  const isAllowed =
    profile?.status === "active" &&
    allowedRoles.includes(profile.role as AllowedRole)

  if (!isAllowed) {
    redirect("/login?error=unauthorized")
  }

  return {
    user,
    profile,
    supabase,
  }
}