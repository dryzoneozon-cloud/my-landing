"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: string };

export function FaqClient({ items }: { items: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {items.map((item, i) => {
        const open = openFaq === i;
        return (
          <div key={item.q} className="border-b border-slate-200 last:border-b-0">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-6 px-4 py-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-900 sm:px-5 sm:py-4 sm:text-[15px]"
              onClick={() => setOpenFaq(open ? null : i)}
              aria-expanded={open}
            >
              <span className="pr-4">{item.q}</span>
              <span className="shrink-0 tabular-nums text-slate-400">{open ? "−" : "+"}</span>
            </button>
            <div
              className={`grid text-slate-600 transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-relaxed sm:px-5">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

