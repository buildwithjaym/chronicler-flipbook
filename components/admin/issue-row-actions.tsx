"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Edit3,
  Loader2,
  MoreHorizontal,
  Send,
  Trash2,
  Undo2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Issue = {
  id: string
  title: string
  slug: string
  status: string
  total_pages: number
  volume: string | null
  issue_number: string | null
  academic_year: string | null
  description: string | null
}

type IssueRowActionsProps = {
  issue: Issue
}

export default function IssueRowActions({ issue }: IssueRowActionsProps) {
  const router = useRouter()

  const [editOpen, setEditOpen] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [title, setTitle] = useState(issue.title)
  const [volume, setVolume] = useState(issue.volume || "")
  const [issueNumber, setIssueNumber] = useState(issue.issue_number || "")
  const [academicYear, setAcademicYear] = useState(issue.academic_year || "")
  const [description, setDescription] = useState(issue.description || "")

  const isBusy = Boolean(busyAction)
  const canPublish = issue.total_pages > 0

  function openEditModal() {
    setTitle(issue.title)
    setVolume(issue.volume || "")
    setIssueNumber(issue.issue_number || "")
    setAcademicYear(issue.academic_year || "")
    setDescription(issue.description || "")
    setEditOpen(true)
  }

  async function updateIssue(payload: Record<string, unknown>) {
    setBusyAction("update")

    try {
      const response = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error("Update failed", {
          description: result?.error || "Unable to update this issue.",
        })
        return
      }

      toast.success("Issue updated", {
        description: "The issue details were saved successfully.",
      })

      setEditOpen(false)
      router.refresh()
    } catch {
      toast.error("Network error", {
        description: "Unable to connect to the server.",
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function deleteIssue() {
    const confirmed = window.confirm(
      `Delete "${issue.title}"? This will remove the issue record and uploaded assets.`
    )

    if (!confirmed) return

    setBusyAction("delete")

    try {
      const response = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "DELETE",
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error("Delete failed", {
          description: result?.error || "Unable to delete this issue.",
        })
        return
      }

      toast.success("Issue deleted", {
        description: `"${issue.title}" was removed successfully.`,
      })

      router.refresh()
    } catch {
      toast.error("Network error", {
        description: "Unable to connect to the server.",
      })
    } finally {
      setBusyAction(null)
    }
  }

  function publishIssue() {
    if (!canPublish) {
      toast.warning("Cannot publish yet", {
        description:
          "Convert the PDF into flipbook pages before publishing this issue.",
      })
      return
    }

    updateIssue({ status: "published" })
  }

  const publishLabel =
    issue.status === "published" ? "Set Draft" : "Publish"

  const publishIcon =
    issue.status === "published" ? (
      <Undo2 className="h-3.5 w-3.5" />
    ) : (
      <Send className="h-3.5 w-3.5" />
    )

  const actionButtons = (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={openEditModal}
        disabled={isBusy}
        className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </Button>

      <Button
        type="button"
        size="sm"
        disabled={isBusy || (issue.status !== "published" && !canPublish)}
        onClick={() =>
          issue.status === "published"
            ? updateIssue({ status: "draft" })
            : publishIssue()
        }
        className="rounded-full"
        title={
          canPublish || issue.status === "published"
            ? publishLabel
            : "Convert PDF pages first"
        }
      >
        {busyAction === "update" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          publishIcon
        )}
        {publishLabel}
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isBusy}
        onClick={deleteIssue}
        className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        {busyAction === "delete" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Delete
      </Button>
    </>
  )

  return (
    <>
      <div className="hidden justify-end gap-2 sm:flex">
        {actionButtons}
      </div>

      <div className="flex justify-end sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              className="rounded-full"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={openEditModal}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={issue.status !== "published" && !canPublish}
              onClick={() =>
                issue.status === "published"
                  ? updateIssue({ status: "draft" })
                  : publishIssue()
              }
            >
              {issue.status === "published" ? (
                <Undo2 className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {publishLabel}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={deleteIssue}
              className="text-red-700 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-2rem)] overflow-y-auto rounded-[2rem] border-primary/10 bg-white p-0 shadow-2xl sm:max-w-2xl">
          <DialogHeader className="border-b border-primary/10 bg-primary/5 px-5 py-5 sm:px-6">
            <DialogTitle className="text-2xl font-black text-primary">
              Edit Issue
            </DialogTitle>

            <DialogDescription>
              Update the publication metadata for this uploaded PDF.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-5 p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault()

              updateIssue({
                title,
                volume,
                issue_number: issueNumber,
                academic_year: academicYear,
                description,
              })
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                Issue Title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                disabled={isBusy}
                className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Volume
                </label>

                <input
                  value={volume}
                  onChange={(event) => setVolume(event.target.value)}
                  placeholder="Vol. 1"
                  disabled={isBusy}
                  className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Issue No.
                </label>

                <input
                  value={issueNumber}
                  onChange={(event) => setIssueNumber(event.target.value)}
                  placeholder="Issue 1"
                  disabled={isBusy}
                  className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Academic Year
                </label>

                <input
                  value={academicYear}
                  onChange={(event) => setAcademicYear(event.target.value)}
                  placeholder="2026-2027"
                  disabled={isBusy}
                  className="h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Optional issue description"
                disabled={isBusy}
                className="w-full resize-none rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setEditOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isBusy}
                className="rounded-full font-bold shadow-lg shadow-primary/20"
              >
                {busyAction === "update" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}