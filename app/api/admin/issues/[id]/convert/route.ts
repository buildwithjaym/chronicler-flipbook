import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { convertIssuePdfToWebp } from "@/lib/pdf/convert-issue-pdf"

export const runtime = "nodejs"
export const maxDuration = 300

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

async function requireAdminApi() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      ),
    }
  }

  const adminSupabase = createAdminClient()

  const { data: profile, error: profileError } = await adminSupabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle()

  if (
    profileError ||
    profile?.role !== "admin" ||
    profile?.status !== "active"
  ) {
    return {
      error: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    }
  }

  return {
    user,
    adminSupabase,
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdminApi()

    if (auth.error) {
      return auth.error
    }

    const { id } = await context.params

    const { data: issue, error: issueError } = await auth.adminSupabase
      .from("issues")
      .select("id, title, slug, pdf_path, status")
      .eq("id", id)
      .maybeSingle()

    if (issueError || !issue) {
      return NextResponse.json(
        { error: "Issue not found." },
        { status: 404 }
      )
    }

    if (!issue.pdf_path) {
      return NextResponse.json(
        { error: "This issue has no uploaded PDF file." },
        { status: 400 }
      )
    }

    const converted = await convertIssuePdfToWebp({
      adminSupabase: auth.adminSupabase,
      issueId: issue.id,
      pdfPath: issue.pdf_path,
    })

    return NextResponse.json({
      success: true,
      issue: converted.issue,
      totalPages: converted.totalPages,
      message: `PDF converted into ${converted.totalPages} pages.`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected conversion error."

    return NextResponse.json(
      {
        success: false,
        stage: "conversion",
        error: message,
      },
      { status: 500 }
    )
  }
}