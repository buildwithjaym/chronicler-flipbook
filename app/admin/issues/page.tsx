import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
} from "lucide-react"

import EmptyState from "@/components/admin/empty-state"
import IssueRowActions from "@/components/admin/issue-row-actions"
import IssueUploadForm from "@/components/admin/issue-upload-form"
import StatCard from "@/components/admin/stat-card"
import StatusBadge from "@/components/admin/status-badge"
import { createClient } from "@/lib/supabase/server"

type Issue = {
  id: string
  title: string
  slug: string
  status: string
  total_pages: number
  volume: string | null
  issue_number: string | null
  academic_year: string | null
  description: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ConversionState({ issue }: { issue: Issue }) {
  if (issue.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        <AlertCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    )
  }

  if (issue.total_pages > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ready
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Needs conversion
    </span>
  )
}

export default async function AdminIssuesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("issues")
    .select(
      "id, title, slug, status, total_pages, volume, issue_number, academic_year, description, created_at, updated_at, published_at"
    )
    .order("created_at", { ascending: false })

  const issues = (data || []) as Issue[]

  const totalIssues = issues.length
  const readyIssues = issues.filter((issue) => issue.total_pages > 0).length
  const publishedIssues = issues.filter(
    (issue) => issue.status === "published"
  ).length
  const needsConversion = issues.filter(
    (issue) => issue.total_pages === 0 && issue.status !== "failed"
  ).length

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-md">
        <p className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
          Issues
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary">
              Manage PDF Issues
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload PDFs, edit issue metadata, track conversion readiness, and
              control what readers can access.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            Next step: PDF → images → flipbook
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Issues"
          value={totalIssues}
          description="All uploaded PDF records"
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          title="Needs Conversion"
          value={needsConversion}
          description="PDF uploaded, pages not generated"
          icon={<Clock3 className="h-5 w-5" />}
        />

        <StatCard
          title="Ready"
          value={readyIssues}
          description="Has generated flipbook pages"
          icon={<Layers3 className="h-5 w-5" />}
        />

        <StatCard
          title="Published"
          value={publishedIssues}
          description="Visible to readers"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </section>

      <section id="upload">
        <IssueUploadForm />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur-md">
        <div className="border-b border-primary/10 p-6">
          <h2 className="text-xl font-black tracking-tight text-primary">
            Issue Library
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            All uploaded issues and their current flipbook preparation status.
          </p>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState
              title="Unable to load issues"
              description={error.message || "The issue library could not be loaded."}
            />
          </div>
        ) : issues.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-primary/10 bg-primary/5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Conversion</th>
                    <th className="px-5 py-4">Pages</th>
                    <th className="px-5 py-4">Issue Info</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="border-b border-primary/10 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-foreground">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {issue.slug}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={issue.status} />
                      </td>

                      <td className="px-5 py-4">
                        <ConversionState issue={issue} />
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {issue.total_pages}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        <p>{issue.academic_year || "No academic year"}</p>
                        <p className="text-xs">
                          {issue.volume || "No volume"} ·{" "}
                          {issue.issue_number || "No issue no."}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(issue.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <IssueRowActions issue={issue} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {issues.map((issue) => (
                <article
                  key={issue.id}
                  className="rounded-[1.5rem] border border-primary/10 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-foreground">
                        {issue.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {issue.slug}
                      </p>
                    </div>

                    <StatusBadge status={issue.status} />
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-primary/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-muted-foreground">
                        Conversion
                      </span>
                      <ConversionState issue={issue} />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-muted-foreground">
                        Pages
                      </span>
                      <span className="font-black text-primary">
                        {issue.total_pages}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-muted-foreground">
                        Academic Year
                      </span>
                      <span className="text-right font-medium">
                        {issue.academic_year || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-muted-foreground">
                        Issue
                      </span>
                      <span className="text-right font-medium">
                        {issue.volume || "No volume"} ·{" "}
                        {issue.issue_number || "No issue no."}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-muted-foreground">
                        Created
                      </span>
                      <span className="text-right font-medium">
                        {formatDate(issue.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <IssueRowActions issue={issue} />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No issues found"
              description="Upload a PDF above. Once uploaded, it will appear here and wait for PDF-to-image conversion."
            />
          </div>
        )}
      </section>
    </div>
  )
}