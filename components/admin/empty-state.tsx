import type { ReactNode } from "react"
import { FileText } from "lucide-react"

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-primary/20 bg-white/70 px-6 py-12 text-center shadow-sm backdrop-blur-md">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-black text-primary">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}