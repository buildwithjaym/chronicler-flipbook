import type { Metadata } from "next"
import NewsletterBrowser from "@/components/readers/newsletter-browser"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Newsletters",
  description:
    "Browse and read published issues of The Chronicler digital newsletter.",
}

type PublishedIssue = {
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

type FirstPage = {
  issue_id: string
  page_number: number
  thumbnail_path: string | null
  image_path: string
}

const publicBucket = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET || "public-issues"

export default async function NewslettersPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase
    .from("issues")
    .select(
      "id, title, slug, volume, issue_number, academic_year, description, total_pages, published_at"
    )
    .eq("status", "published")
    .gt("total_pages", 0)
    .order("published_at", { ascending: false, nullsFirst: false })

  const publishedIssues = (issues || []) as PublishedIssue[]
  const issueIds = publishedIssues.map((issue) => issue.id)

  let firstPages: FirstPage[] = []

  if (issueIds.length > 0) {
    const { data: pageData } = await supabase
      .from("pages")
      .select("issue_id, page_number, thumbnail_path, image_path")
      .in("issue_id", issueIds)
      .eq("page_number", 1)

    firstPages = (pageData || []) as FirstPage[]
  }

  const coverMap = new Map(
    firstPages.map((page) => {
      const coverPath = page.thumbnail_path || page.image_path
      const coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${publicBucket}/${coverPath}`
      return [page.issue_id, coverUrl]
    })
  )

  const mappedIssues = publishedIssues.map((issue, index) => ({
    ...issue,
    coverUrl: coverMap.get(issue.id) || null,
    isLatest: index === 0,
  }))

  return <NewsletterBrowser issues={mappedIssues} />
}