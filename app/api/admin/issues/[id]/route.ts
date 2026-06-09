import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdminApi()

    if (auth.error) return auth.error

    const { id } = await context.params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (typeof body.title === "string") {
      const title = body.title.trim()

      if (!title) {
        return NextResponse.json(
          { error: "Issue title is required." },
          { status: 400 }
        )
      }

      updateData.title = title
    }

    if (typeof body.volume === "string") {
      updateData.volume = body.volume.trim() || null
    }

    if (typeof body.issue_number === "string") {
      updateData.issue_number = body.issue_number.trim() || null
    }

    if (typeof body.academic_year === "string") {
      updateData.academic_year = body.academic_year.trim() || null
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim() || null
    }

    if (typeof body.status === "string") {
      const allowedStatuses = ["draft", "processing", "published", "failed"]

      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid issue status." },
          { status: 400 }
        )
      }

      if (body.status === "published") {
        const { data: existingIssue, error: existingIssueError } =
          await auth.adminSupabase
            .from("issues")
            .select("total_pages")
            .eq("id", id)
            .single()

        if (existingIssueError || !existingIssue) {
          return NextResponse.json(
            { error: "Issue not found." },
            { status: 404 }
          )
        }

        if (!existingIssue.total_pages || existingIssue.total_pages < 1) {
          return NextResponse.json(
            {
              error:
                "Cannot publish yet. Convert the PDF into flipbook pages first.",
            },
            { status: 400 }
          )
        }

        updateData.published_at = new Date().toISOString()
      }

      if (body.status === "draft") {
        updateData.published_at = null
      }

      updateData.status = body.status
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      )
    }

    const { data: issue, error: updateError } = await auth.adminSupabase
      .from("issues")
      .update(updateData)
      .eq("id", id)
      .select(
        "id, title, slug, status, total_pages, volume, issue_number, academic_year, description, updated_at"
      )
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      issue,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected update error."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function listStorageObjects(
  adminSupabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  folder: string
) {
  const { data, error } = await adminSupabase.storage.from(bucket).list(folder, {
    limit: 1000,
  })

  if (error || !data) return []

  return data
    .filter((item) => item.name)
    .map((item) => `${folder}/${item.name}`)
}

async function removeIssueAssets(
  adminSupabase: ReturnType<typeof createAdminClient>,
  issueId: string
) {
  const privateBucket =
    process.env.SUPABASE_PRIVATE_BUCKET || "private-uploads"
  const publicBucket = process.env.SUPABASE_PUBLIC_BUCKET || "public-issues"

  await adminSupabase.storage
    .from(privateBucket)
    .remove([`${issueId}/original.pdf`])

  const publicObjects = [
    ...(await listStorageObjects(
      adminSupabase,
      publicBucket,
      `${issueId}/pages`
    )),
    ...(await listStorageObjects(
      adminSupabase,
      publicBucket,
      `${issueId}/thumbnails`
    )),
  ]

  if (publicObjects.length > 0) {
    await adminSupabase.storage.from(publicBucket).remove(publicObjects)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdminApi()

    if (auth.error) return auth.error

    const { id } = await context.params

    const { data: existingIssue, error: existingIssueError } =
      await auth.adminSupabase
        .from("issues")
        .select("id")
        .eq("id", id)
        .maybeSingle()

    if (existingIssueError || !existingIssue) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 })
    }

    await removeIssueAssets(auth.adminSupabase, id)

    const { error: deleteError } = await auth.adminSupabase
      .from("issues")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected delete error."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}