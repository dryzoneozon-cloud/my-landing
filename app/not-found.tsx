import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">DryZone</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Сторінку не знайдено</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Можливо, посилання застаріло або сторінка була переміщена.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-slate-800"
        >
          На головну
        </Link>
      </div>
    </main>
  );
}

