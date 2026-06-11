"use client"

import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function IssueUploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState("")
  const [volume, setVolume] = useState("")
  const [issueNumber, setIssueNumber] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [description, setDescription] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage("")
    setSuccessMessage("")

    if (!pdfFile) {
      setErrorMessage("Please select a PDF file.")
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("volume", volume)
    formData.append("issueNumber", issueNumber)
    formData.append("academicYear", academicYear)
    formData.append("description", description)
    formData.append("pdf", pdfFile)

    setIsUploading(true)

    const response = await fetch("/api/admin/issues/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    setIsUploading(false)

    if (!response.ok) {
      setErrorMessage(result.error || "Upload failed.")
      return
    }

    setSuccessMessage("PDF uploaded and converted successfully.")

    setTitle("")
    setVolume("")
    setIssueNumber("")
    setAcademicYear("")
    setDescription("")
    setPdfFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    router.refresh()
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur-md">
      <div className="border-b border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-black tracking-tight text-primary">
          Upload New Issue
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Upload a PDF. The system will store it privately first, then prepare
          it for PDF-to-flipbook conversion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Issue Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Example: The Chronicler Volume 1 Issue 1"
            className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Volume</label>
            <input
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              placeholder="Vol. 1"
              className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Issue No.</label>
            <input
              value={issueNumber}
              onChange={(event) => setIssueNumber(event.target.value)}
              placeholder="Issue 1"
              className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Academic Year</label>
            <input
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              placeholder="2026-2027"
              className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional short description for this issue."
            rows={3}
            className="w-full resize-none rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">PDF File</label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-8 text-center transition hover:bg-primary/10"
          >
            <FileText className="mb-3 h-8 w-8 text-primary" />

            <span className="text-sm font-bold text-foreground">
              {pdfFile ? pdfFile.name : "Click to choose PDF"}
            </span>

            <span className="mt-1 text-xs text-muted-foreground">
              PDF only. Recommended test size: under 50MB.
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              setPdfFile(file || null)
            }}
          />
        </div>

        {errorMessage ? (
          <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isUploading}
          className="h-12 w-full rounded-full font-bold shadow-xl shadow-primary/20"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading and converting PDF...
            </>
          ) : (
            "Upload PDF"
          )}
        </Button>
      </form>
    </div>
  )
}