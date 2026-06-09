export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="h-40 animate-pulse rounded-[2rem] bg-primary/10" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-[1.5rem] bg-primary/10" />
        <div className="h-36 animate-pulse rounded-[1.5rem] bg-primary/10" />
        <div className="h-36 animate-pulse rounded-[1.5rem] bg-primary/10" />
      </div>

      <div className="h-96 animate-pulse rounded-[2rem] bg-primary/10" />
    </div>
  )
}