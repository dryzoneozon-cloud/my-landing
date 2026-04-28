export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </main>
  );
}

