export default function FlipbookLoading() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef7f0_35%,#ffffff_75%)] px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-32 animate-pulse rounded-[2rem] bg-primary/10" />
        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="h-[720px] animate-pulse rounded-[2rem] bg-primary/10" />
          <div className="hidden h-[720px] animate-pulse rounded-[2rem] bg-primary/10 lg:block" />
        </div>
      </div>
    </main>
  )
}