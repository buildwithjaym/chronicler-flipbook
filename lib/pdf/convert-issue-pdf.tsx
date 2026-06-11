import sharp from "sharp"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Canvas, CanvasRenderingContext2D } from "canvas"

type AdminSupabase = ReturnType<typeof createAdminClient>

type ConvertIssuePdfParams = {
  adminSupabase: AdminSupabase
  issueId: string
  pdfPath: string
}

type PageRow = {
  issue_id: string
  page_number: number
  image_path: string
  thumbnail_path: string
  width: number
  height: number
}

const FULL_PAGE_WIDTH = 1500
const THUMBNAIL_WIDTH = 320

function padPageNumber(pageNumber: number) {
  return String(pageNumber).padStart(3, "0")
}

function getPublicBucket() {
  return process.env.SUPABASE_PUBLIC_BUCKET || "public-issues"
}

function getPrivateBucket() {
  return process.env.SUPABASE_PRIVATE_BUCKET || "private-uploads"
}

// Node canvas factory for PDF.js rendering
async function createCanvasFactoryClass() {
  const CanvasModule = await import("canvas")

  class NodeCanvasFactory {
    create(width: number, height: number): { canvas: Canvas; context: CanvasRenderingContext2D } {
      const canvas = CanvasModule.createCanvas(width, height)
      const context = canvas.getContext("2d")
      return { canvas, context }
    }
    reset(canvasAndContext: { canvas: Canvas; context: CanvasRenderingContext2D }, width: number, height: number) {
      canvasAndContext.canvas.width = width
      canvasAndContext.canvas.height = height
    }
    destroy(canvasAndContext: { canvas: Canvas; context: CanvasRenderingContext2D }) {
      canvasAndContext.canvas.width = 0
      canvasAndContext.canvas.height = 0
      canvasAndContext.canvas = null as any
      canvasAndContext.context = null as any
    }
  }

  return { NodeCanvasFactory }
}

// List objects in Supabase storage
async function listStorageObjects(adminSupabase: AdminSupabase, bucket: string, folder: string) {
  const { data, error } = await adminSupabase.storage.from(bucket).list(folder, { limit: 1000 })
  if (error || !data) return []
  return data.filter((item) => item.name).map((item) => `${folder}/${item.name}`)
}

// Clear previously generated pages & thumbnails
async function clearExistingGeneratedAssets(adminSupabase: AdminSupabase, issueId: string) {
  const publicBucket = getPublicBucket()
  await adminSupabase.from("pages").delete().eq("issue_id", issueId)

  const pageObjects = await listStorageObjects(adminSupabase, publicBucket, `${issueId}/pages`)
  const thumbnailObjects = await listStorageObjects(adminSupabase, publicBucket, `${issueId}/thumbnails`)
  const objectsToRemove = [...pageObjects, ...thumbnailObjects]

  if (objectsToRemove.length > 0) {
    await adminSupabase.storage.from(publicBucket).remove(objectsToRemove)
  }
}

// Main PDF → WebP conversion function
export async function convertIssuePdfToWebp({ adminSupabase, issueId, pdfPath }: ConvertIssuePdfParams) {
  let loadingTask: any = null
  let pdfDocument: any = null

  const publicBucket = getPublicBucket()
  const privateBucket = getPrivateBucket()

  try {
    await adminSupabase.from("issues").update({ status: "processing", conversion_error: null, total_pages: 0 }).eq("id", issueId)
    await clearExistingGeneratedAssets(adminSupabase, issueId)

    // Download PDF
    const { data: pdfBlob, error: downloadError } = await adminSupabase.storage.from(privateBucket).download(pdfPath)
    if (downloadError || !pdfBlob) throw new Error(downloadError?.message || "Unable to download PDF.")
    const pdfData = new Uint8Array(await pdfBlob.arrayBuffer())

    // Load PDF.js and Canvas factory
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const { NodeCanvasFactory } = await createCanvasFactoryClass()
    const canvasFactory = new NodeCanvasFactory()

    loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      disableFontFace: false,
      useSystemFonts: true,
      disableWorker: true,
      CanvasFactory: NodeCanvasFactory as any,
    })

    pdfDocument = await loadingTask.promise
    const totalPages = pdfDocument.numPages
    const pageRows: PageRow[] = []

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 2 }) // scale higher for better quality

      const width = Math.ceil(viewport.width)
      const height = Math.ceil(viewport.height)
      const canvasAndContext = canvasFactory.create(width, height)

      await page.render({ canvasContext: canvasAndContext.context, viewport, intent: "display" }).promise

      const pngBuffer = canvasAndContext.canvas.toBuffer("image/png")

      // Full-size WebP
      const fullWebpBuffer = await sharp(pngBuffer).resize({ width: FULL_PAGE_WIDTH }).webp({ quality: 90 }).toBuffer()
      const metadata = await sharp(fullWebpBuffer).metadata()

      // Thumbnail WebP
      const thumbBuffer = await sharp(pngBuffer).resize({ width: THUMBNAIL_WIDTH }).webp({ quality: 60 }).toBuffer()

      const paddedPage = padPageNumber(pageNumber)
      const imagePath = `${issueId}/pages/page-${paddedPage}.webp`
      const thumbnailPath = `${issueId}/thumbnails/thumb-${paddedPage}.webp`

      const { error: pageUploadError } = await adminSupabase.storage.from(publicBucket).upload(imagePath, fullWebpBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      })
      if (pageUploadError) throw new Error(`Page ${pageNumber} upload failed: ${pageUploadError.message}`)

      const { error: thumbUploadError } = await adminSupabase.storage.from(publicBucket).upload(thumbnailPath, thumbBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      })
      if (thumbUploadError) throw new Error(`Thumbnail ${pageNumber} upload failed: ${thumbUploadError.message}`)

      pageRows.push({
        issue_id: issueId,
        page_number: pageNumber,
        image_path: imagePath,
        thumbnail_path: thumbnailPath,
        width: metadata.width || width,
        height: metadata.height || height,
      })

      page.cleanup()
      canvasFactory.destroy(canvasAndContext)
    }

    if (!pageRows.length) throw new Error("No PDF pages were generated.")

    const { error: insertError } = await adminSupabase.from("pages").insert(pageRows)
    if (insertError) throw new Error(insertError.message)

    const { data: updatedIssue, error: issueUpdateError } = await adminSupabase
      .from("issues")
      .update({ status: "draft", total_pages: totalPages, conversion_error: null })
      .eq("id", issueId)
      .select("id, title, slug, status, total_pages, volume, issue_number, academic_year, created_at, updated_at")
      .single()
    if (issueUpdateError) throw new Error(issueUpdateError.message)

    return { issue: updatedIssue, totalPages }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected conversion error."
    await adminSupabase.from("issues").update({ status: "failed", conversion_error: message }).eq("id", issueId)
    throw new Error(message)
  } finally {
    if (pdfDocument) await pdfDocument.destroy?.()
    if (loadingTask) await loadingTask.destroy?.()
  }
}