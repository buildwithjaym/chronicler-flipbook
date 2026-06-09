import {
  BookOpenText,
  Clock3,
  FileText,
  Layers3,
  UploadCloud,
} from "lucide-react"

import { requireAdmin } from "@/lib/auth/require-admin"
import IssueUploadForm from "@/components/admin/issue-upload-form"
import LogoutButton from "@/components/logout-button"

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "border-slate-200 bg-slate-50 text-slate-700",
    processing: "border-amber-200 bg-amber-50 text-amber-700",
    published: "border-green-200 bg-green-50 text-green-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  )
}

export default async function AdminPage() {
  const { profile, supabase } = await requireAdmin("/admin")

  const { data: issues } = await supabase
    .from("issues")
    .select(
      "id, title, slug, status, total_pages, volume, issue_number, academic_year, created_at, updated_at"
    )
    .order("created_at", { ascending: false })

  const totalIssues = issues?.length || 0
  const processingIssues =
    issues?.filter((issue) => issue.status === "processing").length || 0
  const publishedIssues =
    issues?.filter((issue) => issue.status === "published").length || 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_34%,#ffffff_72%)] px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <BookOpenText className="h-4 w-4" />
              Chronicler Admin
            </div>

            <h1 className="text-3xl font-black tracking-tight text-primary">
              Publication Dashboard
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {profile.full_name || profile.email}
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-md">
            <FileText className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Total Issues
            </p>
            <p className="mt-2 text-3xl font-black text-primary">
              {totalIssues}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-md">
            <Clock3 className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Processing
            </p>
            <p className="mt-2 text-3xl font-black text-primary">
              {processingIssues}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-md">
            <Layers3 className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Published
            </p>
            <p className="mt-2 text-3xl font-black text-primary">
              {publishedIssues}
            </p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <IssueUploadForm />

          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur-md">
            <div className="border-b border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <UploadCloud className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-black tracking-tight text-primary">
                Uploaded Issues
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Track uploaded PDFs and their conversion status.
              </p>
            </div>

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
                  {issues?.length ? (
                    issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="border-b border-primary/10 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">
                            {issue.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {issue.slug}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={issue.status} />
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {issue.total_pages}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {issue.academic_year || "—"}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        No uploaded issues yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}