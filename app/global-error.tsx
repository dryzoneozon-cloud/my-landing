"use client";

import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("app_global_error_boundary", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="uk" className="h-full scroll-smooth antialiased">
      <body className="min-h-full font-sans">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center px-6 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">DryZone</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Критична помилка</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Виникла помилка на сторінці. Спробуйте повторити або повернутися на головну.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-slate-800"
            >
              Спробувати ще раз
            </button>
            <a
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-900 transition hover:border-slate-400"
            >
              На головну
            </a>
          </div>
          {error.digest ? (
            <p className="mt-6 text-xs text-slate-500">
              Код: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

