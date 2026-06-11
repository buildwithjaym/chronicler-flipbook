"use client"

import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import HTMLFlipBook from "react-pageflip"
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react"

import { Button } from "@/components/ui/button"

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

type FlipbookPageItem = {
  id: string
  pageNumber: number
  imageUrl: string
  thumbnailUrl: string
  width: number
  height: number
}

type FlipbookViewerProps = {
  issue: Issue
  pages: FlipbookPageItem[]
}

type FlipPageProps = {
  page: FlipbookPageItem
  zoom: number
}

const FlipBook = HTMLFlipBook as any

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(
  ({ page, zoom }, ref) => {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-white shadow-2xl"
        data-density="soft"
      >
        <div className="flex h-full w-full items-center justify-center bg-white">
          <img
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            loading={page.pageNumber <= 2 ? "eager" : "lazy"}
            className="h-full w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
            }}
            draggable={false}
          />
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
          {page.pageNumber}
        </div>
      </div>
    )
  }
)

FlipPage.displayName = "FlipPage"

function useViewportWidth() {
  const [width, setWidth] = useState(1200)

  useEffect(() => {
    function updateWidth() {
      setWidth(window.innerWidth)
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)

    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  return width
}

export default function FlipbookViewer({ issue, pages }: FlipbookViewerProps) {
  const bookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const viewportWidth = useViewportWidth()

  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isMobile = viewportWidth < 768

  const pageRatio = useMemo(() => {
    const firstPage = pages[0]
    if (!firstPage?.width || !firstPage?.height) return 1.414
    return firstPage.height / firstPage.width
  }, [pages])

  const pageWidth = useMemo(() => {
    if (isMobile) {
      return Math.min(360, Math.max(290, viewportWidth - 32))
    }

    return 520
  }, [isMobile, viewportWidth])

  const pageHeight = Math.round(pageWidth * pageRatio)

  useEffect(() => {
    audioRef.current = new Audio("/sounds/flip-page.mp3")
    audioRef.current.volume = 0.35
  }, [])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  function playFlipSound() {
    if (!soundEnabled) return

    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play().catch(() => {
      // Browser may block audio until user interaction.
    })
  }

  function getPageFlip() {
    return bookRef.current?.getPageFlip?.()
  }

  function goNext() {
    playFlipSound()
    getPageFlip()?.flipNext()
  }

  function goPrev() {
    playFlipSound()
    getPageFlip()?.flipPrev()
  }

  function goToPage(index: number) {
    playFlipSound()
    getPageFlip()?.turnToPage(index)
    setCurrentPage(index)
  }

  async function toggleFullscreen() {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen().catch(() => {})
    }
  }

  const issueInfo = [
    issue.volume,
    issue.issue_number,
    issue.academic_year,
  ].filter(Boolean)

  return (
    <div ref={containerRef} className="min-h-dvh overflow-hidden">
      <header className="border-b border-primary/10 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary">
              The Chronicler
            </p>

            <h1 className="text-2xl font-black tracking-tight text-primary sm:text-3xl">
              {issue.title}
            </h1>

            {issueInfo.length ? (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {issueInfo.join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setZoom((value) => Math.max(1, value - 0.1))}
              className="rounded-full"
            >
              −
            </Button>

            <span className="min-w-16 rounded-full bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">
              {Math.round(zoom * 100)}%
            </span>

            <Button
              type="button"
              variant="outline"
              onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}
              className="rounded-full"
            >
              +
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSoundEnabled((value) => !value)}
              className="rounded-full"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              Sound
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={toggleFullscreen}
              className="rounded-full"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Expand className="h-4 w-4" />
              )}
              Fullscreen
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_220px] lg:px-8">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center gap-3 rounded-full border border-primary/10 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={goPrev}
              disabled={currentPage <= 0}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <span className="text-sm font-black text-primary">
              Page {currentPage + 1} of {pages.length}
            </span>

            <Button
              type="button"
              size="sm"
              onClick={goNext}
              disabled={currentPage >= pages.length - 1}
              className="rounded-full"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full overflow-x-auto py-4">
            <div className="mx-auto flex w-fit justify-center">
              <FlipBook
                ref={bookRef}
                width={pageWidth}
                height={pageHeight}
                size="stretch"
                minWidth={280}
                maxWidth={pageWidth}
                minHeight={360}
                maxHeight={pageHeight}
                drawShadow
                flippingTime={850}
                usePortrait
                startZIndex={0}
                autoSize
                maxShadowOpacity={0.35}
                showCover={false}
                mobileScrollSupport
                className="flipbook"
                onFlip={(event: { data: number }) => {
                  setCurrentPage(event.data)
                  playFlipSound()
                }}
              >
                {pages.map((page) => (
                  <FlipPage key={page.id} page={page} zoom={zoom} />
                ))}
              </FlipBook>
            </div>
          </div>

          <div className="mt-3 flex w-full max-w-3xl gap-2 overflow-x-auto rounded-3xl border border-primary/10 bg-white/75 p-3 shadow-sm backdrop-blur-md lg:hidden">
            {pages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                onClick={() => goToPage(index)}
                className={`shrink-0 overflow-hidden rounded-xl border transition ${
                  currentPage === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-primary/10"
                }`}
              >
                <img
                  src={page.thumbnailUrl}
                  alt={`Thumbnail page ${page.pageNumber}`}
                  className="h-24 w-16 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[2rem] border border-primary/10 bg-white/80 p-4 shadow-xl shadow-primary/5 backdrop-blur-md">
            <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-primary">
              Pages
            </h2>

            <div className="grid max-h-[70dvh] grid-cols-2 gap-3 overflow-y-auto pr-1">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => goToPage(index)}
                  className={`overflow-hidden rounded-xl border text-left transition hover:border-primary ${
                    currentPage === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-primary/10"
                  }`}
                >
                  <img
                    src={page.thumbnailUrl}
                    alt={`Thumbnail page ${page.pageNumber}`}
                    className="aspect-[3/4] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="bg-white px-2 py-1 text-center text-xs font-bold text-primary">
                    {page.pageNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}