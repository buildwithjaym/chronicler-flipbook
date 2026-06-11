import type { Metadata } from "next"
import { notFound } from "next/navigation"

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: issue } = await supabase
    .from("issues")
    .select("title, description, academic_year")
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
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef7f0_35%,#ffffff_75%)] text-foreground">
      <FlipbookViewer issue={issue} pages={mappedPages} />
    </main>
  )
}