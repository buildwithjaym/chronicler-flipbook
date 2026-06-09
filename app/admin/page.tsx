import Link from "next/link"
import { Clock3, FileText, Layers3, UploadCloud } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import EmptyState from "@/components/admin/empty-state"
import StatCard from "@/components/admin/stat-card"
import StatusBadge from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase
    .from("issues")
    .select(
      "id, title, slug, status, total_pages, academic_year, created_at, updated_at"
    )
    .order("created_at", { ascending: false })

  const totalIssues = issues?.length || 0
  const processingIssues =
    issues?.filter((issue) => issue.status === "processing").length || 0
  const publishedIssues =
    issues?.filter((issue) => issue.status === "published").length || 0

  const recentIssues = issues?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              Admin Dashboard
            </p>

            <h1 className="text-3xl font-black tracking-tight text-primary">
              Publication Control Center
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload, track, edit, and prepare PDF issues for flipbook
              conversion.
            </p>
          </div>

          <Button asChild className="rounded-full font-bold shadow-lg shadow-primary/20">
            <Link href="/admin/issues#upload">
              <UploadCloud className="h-4 w-4" />
              Upload PDF
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Issues"
          value={totalIssues}
          description="All uploaded publication records"
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          title="Processing"
          value={processingIssues}
          description="Waiting for PDF-to-flipbook conversion"
          icon={<Clock3 className="h-5 w-5" />}
        />

        <StatCard
          title="Published"
          value={publishedIssues}
          description="Visible to readers"
          icon={<Layers3 className="h-5 w-5" />}
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-primary/10 p-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-primary">
              Recent Issues
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest uploaded PDF issues.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/issues">View All</Link>
          </Button>
        </div>

        {recentIssues.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-primary/10 bg-primary/5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Pages</th>
                  <th className="px-5 py-4">Academic Year</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {recentIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-primary/10 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">{issue.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {issue.slug}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={issue.status} />
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {issue.total_pages}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {issue.academic_year || "—"}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No issues uploaded yet"
              description="Start by uploading your first PDF issue. It will be stored privately first and prepared for conversion."
              action={
                <Button asChild className="rounded-full font-bold">
                  <Link href="/admin/issues#upload">Upload First PDF</Link>
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  )
}