import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/slugify"
import { convertIssuePdfToWebp, createCanvasFactoryClass } from "@/lib/pdf/convert-issue-pdf"

export const runtime = "nodejs"
export const maxDuration = 300

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin" || profile?.status !== "active") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const formData = await request.formData()
    const title = String(formData.get("title") || "").trim()
    const volume = String(formData.get("volume") || "").trim()
    const issueNumber = String(formData.get("issueNumber") || "").trim()
    const academicYear = String(formData.get("academicYear") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const pdf = formData.get("pdf")

    if (!title) return NextResponse.json({ error: "Issue title is required." }, { status: 400 })
    if (!(pdf instanceof File)) return NextResponse.json({ error: "PDF file is required." }, { status: 400 })
    if (pdf.type !== "application/pdf") return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 })
    if (pdf.size > MAX_FILE_SIZE) return NextResponse.json({ error: "PDF is too large. Max 50MB." }, { status: 400 })

    const adminSupabase = createAdminClient()
    const issueId = crypto.randomUUID()
    const slug = `${slugify(title)}-${issueId.slice(0, 8)}`
    const pdfPath = `${issueId}/original.pdf`
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer())
    const privateBucket = process.env.SUPABASE_PRIVATE_BUCKET || "private-uploads"

    const { error: uploadError } = await adminSupabase.storage.from(privateBucket).upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    })
    if (uploadError) return NextResponse.json({ stage: "storage_upload", error: uploadError.message }, { status: 500 })

    const { data: issue, error: issueError } = await adminSupabase
      .from("issues")
      .insert({
        id: issueId,
        title,
        slug,
        volume: volume || null,
        issue_number: issueNumber || null,
        academic_year: academicYear || null,
        description: description || null,
        pdf_path: pdfPath,
        status: "processing",
        total_pages: 0,
        conversion_error: null,
        created_by: user.id,
      })
      .select("id, title, slug, status, total_pages, volume, issue_number, academic_year, created_at")
      .single()

    if (issueError) {
      await adminSupabase.storage.from(privateBucket).remove([pdfPath])
      return NextResponse.json({ stage: "issue_insert", error: issueError.message }, { status: 500 })
    }

    try {
      const converted = await convertIssuePdfToWebp({ adminSupabase, issueId, pdfPath })
      return NextResponse.json({
        success: true,
        issue: converted.issue,
        totalPages: converted.totalPages,
        message: `PDF uploaded and converted into ${converted.totalPages} pages.`,
      })
    } catch (conversionError) {
      return NextResponse.json({
        success: false,
        stage: "conversion",
        issue,
        error: conversionError instanceof Error ? conversionError.message : "PDF uploaded but conversion failed.",
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected upload error." }, { status: 500 })
  }
}