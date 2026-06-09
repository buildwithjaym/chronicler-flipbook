import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login?error=admin_required");

  return <AdminClient adminName={profile.full_name || profile.email || user.email || "Admin"} />;
}
