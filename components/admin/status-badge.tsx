type StatusBadgeProps = {
  status: string
}

const statusStyles: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  processing: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-green-200 bg-green-50 text-green-700",
  failed: "border-red-200 bg-red-50 text-red-700",
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {status}
    </span>
  )
}