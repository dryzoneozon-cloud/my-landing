"use client";

import { useEffect, useRef, useState } from "react";

export function HeaderClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerOnLight, setHeaderOnLight] = useState(false);
  const headerOnLightRef = useRef(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      const next = window.scrollY > 8;
      if (next !== headerOnLightRef.current) {
        headerOnLightRef.current = next;
        setHeaderOnLight(next);
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        tickingRef.current = false;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-header"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${
        headerOnLight ? "border-slate-200 bg-white" : "border-white/10 bg-slate-950"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6">
        <a
          href="#"
          className={`shrink-0 text-[15px] font-semibold tracking-tight ${
            headerOnLight ? "text-slate-900" : "text-white"
          }`}
        >
          Dry<span className={headerOnLight ? "text-slate-600" : "text-slate-400"}>Zone</span>
        </a>

        <nav
          className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 text-[13px] font-medium uppercase tracking-wider md:flex ${
            headerOnLight ? "text-slate-600" : "text-slate-300"
          }`}
          aria-label="Головна навігація"
        >
          <a className={`transition ${headerOnLight ? "hover:text-slate-900" : "hover:text-white"}`} href="#services">
            Послуги
          </a>
          <a className={`transition ${headerOnLight ? "hover:text-slate-900" : "hover:text-white"}`} href="#faq">
            FAQ
          </a>
          <a className={`transition ${headerOnLight ? "hover:text-slate-900" : "hover:text-white"}`} href="#contact">
            Контакти
          </a>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <a
            className={`text-[13px] font-medium tabular-nums transition ${
              headerOnLight ? "text-slate-700 hover:text-slate-900" : "text-slate-200 hover:text-white"
            }`}
            href="tel:+380633469005"
          >
            +38 (063) 346-90-05
          </a>
          <a
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium uppercase tracking-wide transition ${
              headerOnLight
                ? "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                : "border border-white/30 text-white hover:border-white/60"
            }`}
            href="#contact"
          >
            Заявка
          </a>
        </div>

        <button
          type="button"
          className={`inline-flex border p-2 md:hidden ${
            headerOnLight ? "border-slate-300 text-slate-800" : "border-white/25 text-white"
          }`}
          aria-label="Відкрити меню"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav
        className={`border-t border-slate-200 bg-white px-4 py-3 md:hidden ${mobileOpen ? "" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-800">
          <a href="#services" className="font-medium uppercase tracking-wide" onClick={() => setMobileOpen(false)}>
            Послуги
          </a>
          <a href="#faq" className="font-medium uppercase tracking-wide" onClick={() => setMobileOpen(false)}>
            FAQ
          </a>
          <a href="#contact" className="font-medium uppercase tracking-wide" onClick={() => setMobileOpen(false)}>
            Контакти
          </a>
          <a className="border-t border-slate-200 pt-3 font-medium tabular-nums text-slate-900" href="tel:+380633469005">
            +38 (063) 346-90-05
          </a>
        </div>
      </nav>
    </header>
  );
}

