"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HeroSlide = {
  bg: string;
  badge: string;
  title: string;
  text: string;
};

/** Автоперемикання слайдів hero (мс). 10–30 с: за замовчуванням ~22 с */
const HERO_SLIDE_INTERVAL_MS = 22_000;

export function HeroClient({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRefs = useRef<(HTMLElement | null)[]>([]);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setHeroRef = useCallback((index: number) => (el: HTMLElement | null) => {
    heroRefs.current[index] = el;
  }, []);

  const animateHeroContent = useCallback(() => {
    heroRefs.current.forEach((el, index) => {
      if (!el) return;
      el.classList.remove("animate-fade-in-up");
      el.style.animationDelay = `${index * 120}ms`;
      // eslint-disable-next-line no-void
      void el.offsetWidth;
      el.classList.add("animate-fade-in-up");
    });
  }, []);

  const restartSlider = useCallback(() => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    slideTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, HERO_SLIDE_INTERVAL_MS);
  }, [slides.length]);

  useEffect(() => {
    animateHeroContent();
  }, [activeSlide, animateHeroContent]);

  useEffect(() => {
    restartSlider();
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [restartSlider]);

  return (
    <section id="hero" className="relative min-h-screen scroll-mt-24 pt-[4.5rem]">
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.bg}
            className={`hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out ${
              idx === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: slide.bg }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl items-end px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20">
        <div className="max-w-xl text-white">
          <p
            ref={setHeroRef(0)}
            className="hero-animated mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 opacity-0"
          >
            {slides[activeSlide].badge}
          </p>
          <h1
            ref={setHeroRef(1)}
            className="hero-animated mb-5 text-3xl font-semibold leading-[1.15] tracking-tight opacity-0 sm:text-4xl md:text-[2.65rem]"
          >
            {slides[activeSlide].title}
          </h1>
          <p
            ref={setHeroRef(2)}
            className="hero-animated mb-10 max-w-md text-[15px] font-normal leading-relaxed text-slate-300 opacity-0"
          >
            {slides[activeSlide].text}
          </p>
          <div ref={setHeroRef(3)} className="hero-animated flex flex-wrap gap-3 opacity-0">
            <a
              href="#contact"
              className="rounded-xl border border-white bg-white px-5 py-2.5 text-[13px] font-medium uppercase tracking-wide text-slate-900 transition hover:bg-slate-100"
            >
              Заявка
            </a>
            <a
              href="#services"
              className="rounded-xl border border-white/35 px-5 py-2.5 text-[13px] font-medium uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/5"
            >
              Прайс
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.badge}
            type="button"
            className={`h-px transition-all duration-300 ${
              idx === activeSlide ? "w-10 bg-white" : "w-4 bg-white/35 hover:bg-white/50"
            }`}
            aria-label={`Слайд ${idx + 1}`}
            onClick={() => {
              setActiveSlide(idx);
              restartSlider();
            }}
          />
        ))}
      </div>
    </section>
  );
}

