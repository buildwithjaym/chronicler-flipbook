import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpenText, CalendarDays, FileText } from "lucide-react"

import FlipbookViewer from "@/components/flipbook/flipbook-viewer"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type Issue = {
  id: string
  title: string
  slug: string
  volume: string | null
  issue_number: string | null
  academic_year: string | null
  description: string | null
  total_pages: number
  published_at: string | null
}

type IssuePage = {
  id: string
  page_number: number
  image_path: string
  thumbnail_path: string | null
  width: number | null
  height: number | null
}

const publicBucket = process.env.SUPABASE_PUBLIC_BUCKET || "public-issues"
const backHref = "/newsletters"

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: issue } = await supabase
    .from("issues")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (!issue) {
    return {
      title: "Issue Not Found | The Chronicler",
    }
  }

  return {
    title: issue.title,
    description:
      issue.description ||
      `Read ${issue.title} from The Chronicler digital publication.`,
  }
}

export default async function FlipbookPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .select(
      "id, title, slug, volume, issue_number, academic_year, description, total_pages, published_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<Issue>()

  if (issueError || !issue) {
    notFound()
  }

  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("id, page_number, image_path, thumbnail_path, width, height")
    .eq("issue_id", issue.id)
    .order("page_number", { ascending: true })

  if (pagesError || !pages?.length) {
    notFound()
  }

  const mappedPages = (pages as IssuePage[]).map((page) => {
    const imageUrl = supabase.storage
      .from(publicBucket)
      .getPublicUrl(page.image_path).data.publicUrl

    const thumbnailUrl = page.thumbnail_path
      ? supabase.storage.from(publicBucket).getPublicUrl(page.thumbnail_path)
          .data.publicUrl
      : imageUrl

    return {
      id: page.id,
      pageNumber: page.page_number,
      imageUrl,
      thumbnailUrl,
      width: page.width || 1500,
      height: page.height || 2121,
    }
  })

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef7f0_38%,#ffffff_78%)] text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-3 py-4 sm:px-5 lg:px-8">
        <header className="mb-4 rounded-[1.5rem] border border-primary/10 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={backHref}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Link>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <BookOpenText className="h-4 w-4" />
              Digital Issue
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl">
                {issue.title}
              </h1>

              {issue.description ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {issue.description}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:justify-end">
              <div className="rounded-2xl border border-primary/10 bg-white px-3 py-2">
                <span className="block font-bold text-foreground">
                  Vol {issue.volume || "-"}
                </span>
                <span>Volume</span>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white px-3 py-2">
                <span className="block font-bold text-foreground">
                  Issue {issue.issue_number || "-"}
                </span>
                <span>Issue No.</span>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white px-3 py-2">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {issue.academic_year || "-"}
                </span>
                <span>Academic Year</span>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white px-3 py-2">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {mappedPages.length}
                </span>
                <span>Pages</span>
              </div>
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1">
          <FlipbookViewer issue={issue} pages={mappedPages} />
        </section>
      </div>
    </main>
  )
}