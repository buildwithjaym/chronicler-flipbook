import type { ReactNode } from "react"

import AdminShell from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { profile } = await requireAdmin("/admin")

  return <AdminShell profile={profile}>{children}</AdminShell>
}