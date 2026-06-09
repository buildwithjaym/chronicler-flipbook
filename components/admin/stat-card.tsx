import type { ReactNode } from "react"

type StatCardProps = {
  title: string
  value: number | string
  description: string
  icon: ReactNode
}

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <p className="text-sm font-bold text-muted-foreground">{title}</p>

      <p className="mt-2 text-3xl font-black tracking-tight text-primary">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}