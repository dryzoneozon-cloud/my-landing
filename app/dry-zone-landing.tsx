"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HERO_SLIDES = [
  {
    bg: "linear-gradient(165deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
    badge: "Озонація · сухий туман · виїзд",
    title: "Глибока озонація салону авто без зайвої хімії",
    text: "Професійна обробка озоном з виїздом по Києву. Чисте повітря та свіжий салон уже за 30 хвилин.",
  },
  {
    bg: "linear-gradient(165deg, #111827 0%, #1f2937 50%, #111827 100%)",
    badge: "Комплекс для авто та приміщень",
    title: "Озон + сухий туман — стійкий результат",
    text: "Спочатку нейтралізуємо джерело запаху, потім м’яко закріплюємо ефект і повертаємо приємний аромат салону чи квартири.",
  },
  {
    bg: "linear-gradient(165deg, #0c1222 0%, #1a2332 50%, #0c1222 100%)",
    badge: "Квартири · офіси · гаражі",
    title: "Виїзд і прозорий прайс телефоном",
    text: "Підбираємо сценарій під площу й тип задачі. Вартість фіксуємо наперед — без сюрпризів на об’єкті.",
  },
] as const;

/** Автоперемикання слайдів hero (мс). 10–30 с: за замовчуванням ~22 с */
const HERO_SLIDE_INTERVAL_MS = 22_000;

const LIST_CHECK =
  "space-y-2 text-sm leading-relaxed text-slate-600 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.45rem] [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-slate-800";

const FAQS: { q: string; a: string }[] = [
  {
    q: "У чому різниця між озонуванням і сухим туманом?",
    a: "Озонування знищує бактерії й саму причину запаху. Сухий туман закріплює результат і надає приємний аромат.",
  },
  {
    q: "Чи можна замовити лише сухий туман для авто?",
    a: "Завжди радимо комплекс. Саме озонування плюс сухий туман гарантують повне прибирання запаху, а не лише тимчасове маскування.",
  },
  {
    q: "Від чого залежить ціна обробки авто?",
    a: "Від розміру салону. Для джипів і мінівенів потрібно більше часу й більша витрата якісних рідин, ніж для компактних авто.",
  },
  {
    q: "Скільки часу займає чистка салону авто?",
    a: "Зазвичай уся процедура, включно з фінальним провітрюванням, займає близько 1 години.",
  },
  {
    q: "Скільки триває обробка квартири?",
    a: "Сам апарат може працювати від кількох годин до доби залежно від проблеми. Майстер на об'єкті сумарно близько години (привезти, увімкнути, забрати й провітрити).",
  },
  {
    q: "Чи можна перебувати в приміщенні під час роботи апарату?",
    a: "Ні, це небезпечно. Під час активної фази озонування в приміщенні не має бути людей і тварин.",
  },
  {
    q: "Чи знищує озонування цвіль?",
    a: "Озон добре знищує спори в повітрі й запах сирості. Але самі вогнища грибка ми попередньо обробляємо спеціальною хімією.",
  },
  {
    q: "Чи виїжджаєте в гаражі, підвали чи офіси?",
    a: "Так. Беремо в роботу будь-які приміщення. Вартість розраховуємо індивідуально після оцінки площі та масштабу проблеми.",
  },
  {
    q: "Що робити, якщо вдома розбився градусник?",
    a: "Не збирайте ртуть пилососом! Проводимо професійну демеркуризацію (нейтралізацію ртути). Послуга від 2500 грн за один розбитий градусник.",
  },
  {
    q: "Навіщо ви так детально розпитуєте про проблему телефоном?",
    a: "Щоб одразу назвати остаточну й точну ціну за роботу. Ми не змінюємо вартість після приїзду на об'єкт.",
  },
  {
    q: "Чи можна здешевити обробку багатокімнатної квартири?",
    a: "Так. Щоб майстру не їздити кілька разів, можемо налаштувати апарат на таймер, а ви (або ваші працівники) самостійно переставите його з кімнати в кімнату.",
  },
];

function getTracking() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || "",
    gclid: params.get("gclid") || "",
    fbclid: params.get("fbclid") || "",
  };
}

export function DryZoneLanding() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [leadStatus, setLeadStatus] = useState<{ text: string; tone: "muted" | "ok" | "err" }>({
    text: "",
    tone: "muted",
  });
  const [submitting, setSubmitting] = useState(false);
  const [headerOnLight, setHeaderOnLight] = useState(false);

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
      void el.offsetWidth;
      el.classList.add("animate-fade-in-up");
    });
  }, []);

  const restartSlider = useCallback(() => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    slideTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    animateHeroContent();
  }, [activeSlide, animateHeroContent]);

  useEffect(() => {
    restartSlider();
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [restartSlider]);

  useEffect(() => {
    const onScroll = () => setHeaderOnLight(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function onLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const service = String(fd.get("service") || "").trim();
    const website = String(fd.get("website") || "").trim();

    if (!name || !phone) {
      setLeadStatus({ text: "Будь ласка, вкажіть ім’я та телефон.", tone: "err" });
      return;
    }

    const payload = {
      name,
      phone,
      service,
      website,
      source: "Лендинг DryZone",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      createdAt: new Date().toISOString(),
      ...getTracking(),
    };

    setSubmitting(true);
    setLeadStatus({ text: "Надсилаємо заявку...", tone: "muted" });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        requestId?: string;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "submit_failed");
      }
      form.reset();
      setLeadStatus({
        text: `Заявку надіслано. Номер: ${result.requestId}.`,
        tone: "ok",
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : "submit_failed";
      const map: Record<string, string> = {
        rate_limited: "Забагато спроб. Спробуйте трохи пізніше.",
        duplicate_recent_lead: "Схоже, ви щойно вже надсилали заявку. Перевірте Telegram або таблицю.",
        storage_unavailable: "Сервіс заявок тимчасово недоступний. Спробуйте за 1–2 хвилини.",
        invalid_phone: "Перевірте номер телефону й спробуйте ще раз.",
        name_and_phone_required: "Вкажіть ім’я та телефон.",
        invalid_json: "Помилка надсилання даних. Оновіть сторінку й спробуйте ще раз.",
      };
      setLeadStatus({
        text: map[code] || "Не вдалося надіслати заявку. Спробуйте ще раз.",
        tone: "err",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const statusClass =
    leadStatus.tone === "ok"
      ? "text-emerald-600"
      : leadStatus.tone === "err"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-slate-900 antialiased">
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

      <main className="flex-1">
        <section id="hero" className="relative min-h-screen scroll-mt-24 pt-[4.5rem]">
          <div className="absolute inset-0">
            {HERO_SLIDES.map((slide, idx) => (
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
                {HERO_SLIDES[activeSlide].badge}
              </p>
              <h1
                ref={setHeroRef(1)}
                className="hero-animated mb-5 text-3xl font-semibold leading-[1.15] tracking-tight opacity-0 sm:text-4xl md:text-[2.65rem]"
              >
                {HERO_SLIDES[activeSlide].title}
              </h1>
              <p
                ref={setHeroRef(2)}
                className="hero-animated mb-10 max-w-md text-[15px] font-normal leading-relaxed text-slate-300 opacity-0"
              >
                {HERO_SLIDES[activeSlide].text}
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
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
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

        <section id="services" className="scroll-mt-24 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="mb-12 max-w-2xl border-l-2 border-slate-900 pl-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Послуги та ціни</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Прозорий прайс під тип приміщення
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Фіксована вартість для типових сценаріїв; великі об’єкти — після короткого опису задачі телефоном.
            </p>
          </div>

          <div id="formats" className="mb-16 scroll-mt-24">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Технології</h3>
            <div className="grid overflow-hidden rounded-2xl border border-slate-200 md:grid-cols-2">
              <article className="border-b border-slate-200 bg-zinc-50/50 p-8 md:border-b-0 md:border-r md:border-slate-200">
                <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Етап 1</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Озонація</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Знищення бактерій і молекул запаху. Для стійких запахів і підготовки до фінішної обробки.
                </p>
                <a href="#contact" className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900">
                  Заявка
                </a>
              </article>
              <article className="p-8">
                <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Етап 2</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Сухий туман</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Закріплення ефекту озонування, пом’якшення запаху озону, нейтральний «чистий» фон без різкої хімії.
                </p>
                <a href="#contact" className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900">
                  Заявка
                </a>
              </article>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Автомобілі</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Компакт</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Міні, Smart, 2 двері</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">1200 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Повне озонування салону</li>
                    <li>Прибирання сторонніх запахів</li>
                    <li>Фініш сухим туманом</li>
                  </ul>
                </article>
                <article className="rounded-2xl border-2 border-slate-900 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Стандарт</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Хетчбеки, седани</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">1500 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Глибоке озонування салону</li>
                    <li>Стійкі запахи та бактерії</li>
                    <li>Сухий туман</li>
                  </ul>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Об’єм</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Джипи, мінівени</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">2000 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Посилене озонування</li>
                    <li>Складні запахи, цвіль</li>
                    <li>Преміум-фініш</li>
                  </ul>
                </article>
              </div>
            </div>
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Квартири</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">1 кімната</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Базовий пакет</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">3000 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Апарат, озонування</li>
                    <li>Провітрювання</li>
                    <li>Сухий туман за потреби</li>
                  </ul>
                </article>
                <article className="rounded-2xl border-2 border-slate-900 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">2 кімнати</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Комплекс</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">4000 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Кімнати, кухня, коридор</li>
                    <li>Побутові запахи</li>
                    <li>Фініш сухим туманом</li>
                  </ul>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">3 кімнати</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-900">Повна площа</h4>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">5000 грн</p>
                  <ul className={`mt-5 ${LIST_CHECK}`}>
                    <li>Очищення повітря</li>
                    <li>Бактерії, алергени</li>
                    <li>Закріплення туманом</li>
                  </ul>
                </article>
              </div>
            </div>
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Гаражі, підвали, офіси</h3>
              <article className="rounded-2xl border border-slate-200 bg-zinc-50/50 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-base font-semibold text-slate-900">Індивідуальний розрахунок</h4>
                  <span className="text-sm text-slate-500">за оглядом об’єкта</span>
                </div>
                <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">від 2000 грн</p>
                <ul className={`mt-5 ${LIST_CHECK}`}>
                  <li>Виїзд, оцінка об’єму</li>
                  <li>Озон: сирість, грибок, хімія</li>
                  <li>Дод. туман — окремо</li>
                </ul>
              </article>
            </div>
          </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-zinc-50">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Питання</h2>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Часті запитання</p>
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {FAQS.map((item, i) => {
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
          </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="max-w-2xl rounded-2xl border border-slate-200 bg-zinc-50/30 p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Заявка</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Зв’яжемося протягом 10 хвилин і погодимо час виїзду.
            </p>
            <form
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
              noValidate
              onSubmit={onLeadSubmit}
            >
              <label className="sr-only" htmlFor="lead-name">
                Ім’я
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                required
                placeholder="Ім’я"
                autoComplete="name"
                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
              <label className="sr-only" htmlFor="lead-phone">
                Телефон
              </label>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                required
                placeholder="Телефон"
                autoComplete="tel"
                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
              <label className="sr-only" htmlFor="lead-service">
                Послуга
              </label>
              <select
                id="lead-service"
                name="service"
                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                defaultValue="Автомобілі"
              >
                <option value="Автомобілі">Автомобілі</option>
                <option value="Квартири">Квартири</option>
                <option value="Гаражі, підвали та офіси">Гаражі, підвали та офіси</option>
              </select>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1"
              >
                Надіслати
              </button>
            </form>
            <p className={`mt-4 min-h-[1.25rem] text-sm ${statusClass}`} aria-live="polite">
              {leadStatus.text}
            </p>
          </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-medium text-slate-700">© 2026 DryZone</p>
            <a href="tel:+380633469005" className="font-medium text-slate-700 transition hover:text-slate-900">
              +38 (063) 346-90-05
            </a>
          </div>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
            Київ та область · виїзд майстра · заявка онлайн без зобов’язань
          </p>
        </div>
      </footer>
    </div>
  );
}
