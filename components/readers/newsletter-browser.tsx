"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, BookOpenText, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type NewsletterIssue = {
  id: string
  title: string
  slug: string
  volume: string | null
  issue_number: string | null
  academic_year: string | null
  description: string | null
  total_pages: number
  published_at: string | null
  coverUrl: string | null
  isLatest: boolean
}

type NewsletterBrowserProps = {
  issues: NewsletterIssue[]
}

export default function NewsletterBrowser({ issues }: NewsletterBrowserProps) {
  const [query, setQuery] = useState("")
  const [filteredIssues, setFilteredIssues] = useState(issues)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setFilteredIssues(
      issues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(value.toLowerCase()) ||
          (issue.volume?.toLowerCase().includes(value.toLowerCase()) ?? false) ||
          (issue.issue_number?.toLowerCase().includes(value.toLowerCase()) ?? false) ||
          (issue.academic_year?.toLowerCase().includes(value.toLowerCase()) ?? false)
      )
    )
  }

  return (
    <main className="min-h-screen bg-[#f5faf6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-black text-primary">
          The Chronicler Reader Library
        </h1>
        <div className="relative w-full sm:max-w-md flex-shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title, volume, issue, or year..."
            className="w-full rounded-full border border-gray-300 px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={query}
            onChange={handleSearch}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Card Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredIssues.length === 0 && (
          <p className="text-center text-muted-foreground col-span-full">
            No newsletters found.
          </p>
        )}

        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden hover:shadow-lg transition hover:scale-[1.02]"
          >
            {/* Cover */}
            <div className="relative aspect-[3/4] bg-gray-100">
              {issue.coverUrl ? (
                <img
                  src={issue.coverUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpenText className="h-12 w-12 text-primary/30" />
                </div>
              )}
              {issue.isLatest && (
                <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">
                  Latest
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-semibold line-clamp-2">{issue.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1 line-clamp-3">
                {issue.description || "No description available."}
              </p>
              <div className="mt-3 flex flex-wrap justify-between text-xs text-muted-foreground gap-1">
                <span>Vol {issue.volume || "-"}</span>
                <span>Issue {issue.issue_number || "-"}</span>
                <span>{issue.academic_year || "-"}</span>
              </div>
              <Button asChild className="mt-3 w-full rounded-full text-sm">
                <Link href={`/flipbook/${issue.slug}`} className="flex items-center justify-center gap-1">
                  View Newsletter
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}