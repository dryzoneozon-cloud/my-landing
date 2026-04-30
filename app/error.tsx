"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("app_error_boundary", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">DryZone</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Щось пішло не так</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Спробуйте оновити сторінку або повторити дію. Якщо помилка повторюється — напишіть нам, і ми швидко
        виправимо.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-slate-800"
        >
          Спробувати ще раз
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-900 transition hover:border-slate-400"
        >
          На головну
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-slate-500">
          Код: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
    </main>
  );
}

