export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="mx-auto min-h-screen max-w-7xl px-4 py-16 md:px-6">
      <p className="sr-only">Loading page</p>
      <div className="surface-card h-10 w-40 animate-pulse rounded-full" />
      <div className="mt-8 h-28 max-w-3xl animate-pulse rounded-[30px] bg-surface-elevated" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="surface-card h-64 animate-pulse rounded-[30px]" />
        <div className="surface-card h-64 animate-pulse rounded-[30px]" />
      </div>
    </main>
  );
}
