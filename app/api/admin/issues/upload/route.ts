import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/slugify"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin" || profile?.status !== "active") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    const title = String(formData.get("title") || "").trim()
    const volume = String(formData.get("volume") || "").trim()
    const issueNumber = String(formData.get("issueNumber") || "").trim()
    const academicYear = String(formData.get("academicYear") || "").trim()
    const description = String(formData.get("description") || "").trim()

    const pdf = formData.get("pdf")

    if (!title) {
      return NextResponse.json(
        { error: "Issue title is required." },
        { status: 400 }
      )
    }

    if (!(pdf instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required." },
        { status: 400 }
      )
    }

    if (pdf.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      )
    }

    if (pdf.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "PDF is too large. Maximum allowed size is 50MB." },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    const issueId = crypto.randomUUID()
    const safeSlug = slugify(title)
    const slug = `${safeSlug}-${issueId.slice(0, 8)}`
    const pdfPath = `${issueId}/original.pdf`

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer())

    const privateBucket =
      process.env.SUPABASE_PRIVATE_BUCKET || "private-uploads"

    const { error: uploadError } = await adminSupabase.storage
      .from(privateBucket)
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

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
        created_by: user.id,
      })
      .select(
        "id, title, slug, status, volume, issue_number, academic_year, created_at"
      )
      .single()

    if (issueError) {
      await adminSupabase.storage.from(privateBucket).remove([pdfPath])

      return NextResponse.json(
        { error: issueError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      issue,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}