"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HERO_BACKGROUNDS = [
  "linear-gradient(120deg, #0f172a, #1e293b)",
  "linear-gradient(120deg, #0b3b3b, #134e4a)",
  "linear-gradient(120deg, #111827, #1f2937)",
];

const TRUST_STATS = [
  {
    value: "10 000+",
    label: "клиентов",
    hint: "Обработали салоны и помещения за время работы сервиса",
  },
  {
    value: "30 мин",
    label: "на авто",
    hint: "Типичный цикл озонирования и финиша под стандартный седан",
  },
  {
    value: "100%",
    label: "фикс прайс",
    hint: "Стоимость согласуем заранее и не повышаем по приезду",
  },
  {
    value: "Киев",
    label: "и область",
    hint: "Выезд мастера в удобное для вас окно",
  },
] as const;

const FAQS: { q: string; a: string }[] = [
  {
    q: "В чем разница между озонированием и сухим туманом?",
    a: "Озонирование уничтожает бактерии и саму причину запаха. Сухой туман закрепляет результат и придает приятный аромат.",
  },
  {
    q: "Можно ли заказать только сухой туман для авто?",
    a: "Мы всегда рекомендуем комплекс. Только озонирование плюс сухой туман гарантируют полное удаление запаха, а не просто его временную маскировку.",
  },
  {
    q: "От чего зависит цена на обработку машины?",
    a: "От размера салона. Для джипов и минивэнов требуется больше времени и больший расход качественных американских жидкостей, чем для компактных авто.",
  },
  {
    q: "Сколько времени занимает чистка салона авто?",
    a: "Обычно вся процедура, включая финальное проветривание, занимает около 1 часа.",
  },
  {
    q: "Сколько времени длится обработка квартиры?",
    a: "Сам аппарат может работать от нескольких часов до суток, в зависимости от проблемы. При этом мастер находится на объекте суммарно около часа (привезти, включить, забрать и проветрить).",
  },
  {
    q: "Можно ли находиться в помещении во время работы аппарата?",
    a: "Нет, это небезопасно. Во время активной фазы озонирования в помещении не должно быть людей и животных.",
  },
  {
    q: "Убивает ли озонирование плесень?",
    a: "Озон отлично уничтожает споры в воздухе и запах сырости. Но сами очаги грибка мы предварительно обрабатываем специальной химией.",
  },
  {
    q: "Выезжаете ли вы в гаражи, подвалы или офисы?",
    a: "Да. Мы берем в работу любые помещения. Стоимость рассчитывается индивидуально после оценки площади и масштаба проблемы.",
  },
  {
    q: "Что делать, если дома разбился градусник?",
    a: "Не собирайте ртуть пылесосом! Мы проводим профессиональную демеркуризацию помещений (нейтрализацию ртути). Услуга стоит от 2500 грн за один разбитый градусник.",
  },
  {
    q: "Зачем вы так подробно расспрашиваете о проблеме по телефону?",
    a: "Чтобы сразу назвать вам окончательную и точную цену за работу. Мы не меняем стоимость по приезду на объект.",
  },
  {
    q: "Можно ли удешевить обработку многокомнатной квартиры?",
    a: "Да. Чтобы мастеру не приходилось ездить несколько раз, мы можем настроить аппарат по таймеру, а вы (или ваши рабочие) самостоятельно переставите его из комнаты в комнату.",
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
  /** После прокрутки шапка на светлом фоне; вверху страницы — над тёмным hero, нужен светлый текст */
  const [headerOnLight, setHeaderOnLight] = useState(false);

  const headerBarRef = useRef<HTMLDivElement>(null);
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
      setActiveSlide((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 6000);
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
    const syncHeader = () => {
      const bar = headerBarRef.current;
      if (!bar) return;
      const elevated = window.scrollY > 12;
      setHeaderOnLight(elevated);
      if (elevated) {
        bar.classList.remove("border-white/15", "bg-slate-950/45");
        bar.classList.add("bg-white/92", "backdrop-blur-md", "shadow-soft");
      } else {
        bar.classList.remove("bg-white/92", "backdrop-blur-md", "shadow-soft");
        bar.classList.add("border-white/15", "bg-slate-950/45");
      }
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    return () => window.removeEventListener("scroll", syncHeader);
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
      setLeadStatus({ text: "Пожалуйста, заполните имя и телефон.", tone: "err" });
      return;
    }

    const payload = {
      name,
      phone,
      service,
      website,
      source: "DryZone landing",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      createdAt: new Date().toISOString(),
      ...getTracking(),
    };

    setSubmitting(true);
    setLeadStatus({ text: "Отправляем заявку...", tone: "muted" });

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
        text: `Заявка отправлена. Номер: ${result.requestId}.`,
        tone: "ok",
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : "submit_failed";
      const map: Record<string, string> = {
        rate_limited: "Слишком много попыток. Повторите чуть позже.",
        duplicate_recent_lead: "Похоже, вы только что уже отправили заявку. Проверьте Telegram/таблицу.",
        storage_unavailable: "Сервис заявок временно недоступен. Попробуйте через 1-2 минуты.",
        invalid_phone: "Проверьте номер телефона и попробуйте снова.",
        name_and_phone_required: "Укажите имя и телефон.",
        invalid_json: "Ошибка отправки данных. Обновите страницу и попробуйте снова.",
      };
      setLeadStatus({
        text: map[code] || "Не удалось отправить заявку. Попробуйте еще раз.",
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      <header id="site-header" className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={headerBarRef}
            className="relative mt-3 flex items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 backdrop-blur-md transition-colors duration-300 md:px-6"
          >
            <a
              href="#"
              className={`relative z-10 shrink-0 text-lg font-semibold tracking-tight transition-colors ${
                headerOnLight ? "text-slate-900" : "text-white drop-shadow-sm"
              }`}
            >
              Dry
              <span className={headerOnLight ? "text-brand-600" : "text-teal-300"}>Zone</span>
            </a>

            <nav
              className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm font-semibold md:flex ${
                headerOnLight ? "text-slate-700" : "text-white/95"
              }`}
              aria-label="Основная навигация"
            >
              <a
                className={`transition ${headerOnLight ? "hover:text-slate-950" : "hover:text-white"}`}
                href="#services"
              >
                Услуги
              </a>
              <a
                className={`transition ${headerOnLight ? "hover:text-slate-950" : "hover:text-white"}`}
                href="#trust"
              >
                О нас
              </a>
              <a
                className={`transition ${headerOnLight ? "hover:text-slate-950" : "hover:text-white"}`}
                href="#faq"
              >
                FAQ
              </a>
              <a
                className={`transition ${headerOnLight ? "hover:text-slate-950" : "hover:text-white"}`}
                href="#contact"
              >
                Контакты
              </a>
            </nav>

            <div className="relative z-10 hidden shrink-0 items-center gap-3 md:flex">
              <a
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  headerOnLight
                    ? "border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white"
                    : "border-white/55 text-white hover:bg-white/15"
                }`}
                href="tel:+380991234567"
              >
                +38 (099) 123-45-67
              </a>
              <a
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  headerOnLight
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
                href="#contact"
              >
                Заказать
              </a>
            </div>

            <button
              type="button"
              className={`inline-flex rounded-lg border p-2 md:hidden ${
                headerOnLight
                  ? "border-slate-200 text-slate-800"
                  : "border-white/50 text-white hover:bg-white/10"
              }`}
              aria-label="Открыть меню"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav
            className={`mt-2 rounded-2xl bg-white p-4 shadow-soft md:hidden ${mobileOpen ? "" : "hidden"}`}
            id="mobile-menu"
          >
            <div className="flex flex-col gap-3 text-sm">
              <a href="#services" onClick={() => setMobileOpen(false)}>
                Услуги
              </a>
              <a href="#trust" onClick={() => setMobileOpen(false)}>
                О нас
              </a>
              <a href="#faq" onClick={() => setMobileOpen(false)}>
                FAQ
              </a>
              <a href="#contact" onClick={() => setMobileOpen(false)}>
                Контакты
              </a>
              <a className="pt-1 font-semibold text-brand-600" href="tel:+380991234567">
                +38 (099) 123-45-67
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="relative min-h-screen pt-24">
          <div className="absolute inset-0">
            {HERO_BACKGROUNDS.map((bg, idx) => (
              <div
                key={bg}
                className={`hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                  idx === activeSlide ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: bg }}
              />
            ))}
          </div>

          <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <p
                ref={setHeroRef(0)}
                className="hero-animated mb-4 inline-flex rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide text-white/90 opacity-0"
              >
                Удаляем запахи, бактерии и аллергены
              </p>
              <h1
                ref={setHeroRef(1)}
                className="hero-animated mb-6 text-4xl font-semibold leading-tight opacity-0 sm:text-5xl md:text-6xl"
              >
                Глубокая озонация салона авто без лишней химии
              </h1>
              <p
                ref={setHeroRef(2)}
                className="hero-animated mb-9 max-w-xl text-base text-slate-100 opacity-0 sm:text-lg"
              >
                Профессиональная обработка озоном с выездом по Киеву. Чистый воздух и свежий салон уже через 30 минут.
              </p>
              <div ref={setHeroRef(3)} className="hero-animated flex flex-wrap gap-3 opacity-0">
                <a
                  href="#contact"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Оставить заявку
                </a>
                <a
                  href="#services"
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Посмотреть услуги
                </a>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {HERO_BACKGROUNDS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`rounded-full transition-all ${
                  idx === activeSlide ? "h-2.5 w-8 bg-white" : "h-2.5 w-2.5 bg-white/50"
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

        <section id="services" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <p className="mb-3 text-sm font-medium text-brand-600">Услуги и цены</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Прозрачный прайс под ваш тип помещения
            </h2>
            <p className="mt-4 text-slate-600">
              Фиксированная стоимость для популярных сценариев и индивидуальная оценка для больших объектов.
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="mb-5 text-2xl font-semibold tracking-tight">Автомобили</h3>
              <div className="grid gap-6 lg:grid-cols-3">
                <article className="rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Быстро и эффективно
                    </span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">Мини и Компакт (Smart, 2 двери)</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">1200 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Полное озонирование салона</li>
                    <li>Устранение посторонних запахов</li>
                    <li>Финишная обработка сухим туманом</li>
                  </ul>
                </article>
                <article className="rounded-2xl bg-white p-7 shadow-soft ring-1 ring-brand-500/20 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">Популярно</span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">Хэтчбеки и Седаны</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">1500 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Глубокое озонирование салона</li>
                    <li>Нейтрализация стойких запахов и бактерий</li>
                    <li>Обработка сухим туманом для приятного аромата</li>
                  </ul>
                </article>
                <article className="rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Максимальный эффект
                    </span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">Джипы и Минивэны</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">2000 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Усиленное озонирование большого объема салона</li>
                    <li>Удаление сложных запахов (включая плесень и грибок)</li>
                    <li>Премиум-обработка сухим туманом</li>
                  </ul>
                </article>
              </div>
            </div>
            <div>
              <h3 className="mb-5 text-2xl font-semibold tracking-tight">Квартиры</h3>
              <div className="grid gap-6 lg:grid-cols-3">
                <article className="rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Базовый комфорт
                    </span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">1-комнатная квартира</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">3000 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Установка и работа аппарата для озонирования</li>
                    <li>Проветривание помещения</li>
                    <li>Нейтрализация запаха озона сухим туманом (по необходимости)</li>
                  </ul>
                </article>
                <article className="rounded-2xl bg-white p-7 shadow-soft ring-1 ring-brand-500/20 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">Оптимально</span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">2-комнатная квартира</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">4000 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Комплексное озонирование комнат, кухни и коридора</li>
                    <li>Устранение въевшихся бытовых запахов</li>
                    <li>Финишная обработка сухим туманом для свежести</li>
                  </ul>
                </article>
                <article className="rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Выгодное предложение
                    </span>
                  </div>
                  <h4 className="mb-3 text-xl font-semibold">3-комнатная квартира</h4>
                  <p className="mb-5 text-3xl font-semibold text-slate-900">5000 грн</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Глубокая очистка воздуха на большой площади</li>
                    <li>Уничтожение бактерий, аллергенов и запахов</li>
                    <li>Закрепление результата сухим туманом</li>
                  </ul>
                </article>
              </div>
            </div>
            <div>
              <h3 className="mb-5 text-2xl font-semibold tracking-tight">Гаражи, подвалы и офисы</h3>
              <article className="rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    Индивидуальный подход
                  </span>
                  <span className="text-sm font-semibold text-slate-500">индивидуальная оценка</span>
                </div>
                <h4 className="mb-3 text-xl font-semibold">Очистка гаражей, подвалов и офисов</h4>
                <p className="mb-5 text-3xl font-semibold text-slate-900">от 2000 грн</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Выезд и точный просчет стоимости под объем помещения</li>
                  <li>Мощная обработка озоном от запахов сырости, грибка или химикатов</li>
                  <li>Дополнительная обработка сухим туманом по договоренности</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section
          id="trust"
          className="border-y border-slate-200/80 bg-gradient-to-b from-slate-100/90 to-slate-50 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-sm font-medium text-brand-600">Нам доверяют</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Почему тысячи клиентов выбирают DryZone
              </h2>
              <p className="mt-4 text-slate-600">
                Цифры и факты о сервисе: скорость, прозрачность и масштаб работы без лишних обещаний.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_STATS.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <p className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-600">{item.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.hint}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium text-brand-600">FAQ</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Часто задаваемые вопросы</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <article key={item.q} className="rounded-2xl bg-white p-5 shadow-soft">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-base font-medium sm:text-lg">{item.q}</span>
                    <span className="text-2xl leading-none text-slate-400">{open ? "−" : "+"}</span>
                  </button>
                  <div
                    className={`grid text-slate-600 transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="pt-4 pb-1 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 shadow-softer sm:p-10">
            <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">Оставьте заявку</h2>
            <p className="mb-7 text-slate-600">Свяжемся с вами в течение 10 минут и подберем удобное время обработки.</p>
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
              noValidate
              onSubmit={onLeadSubmit}
            >
              <label className="sr-only" htmlFor="lead-name">
                Имя
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                required
                placeholder="Ваше имя"
                autoComplete="name"
                className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
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
                className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
              />
              <label className="sr-only" htmlFor="lead-service">
                Услуга
              </label>
              <select
                id="lead-service"
                name="service"
                className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                defaultValue="Автомобили"
              >
                <option value="Автомобили">Автомобили</option>
                <option value="Квартиры">Квартиры</option>
                <option value="Гаражи, подвалы и офисы">Гаражи, подвалы и офисы</option>
              </select>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[48px] rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 lg:col-span-1"
              >
                Отправить
              </button>
            </form>
            <p className={`mt-4 min-h-[1.25rem] text-sm ${statusClass}`} aria-live="polite">
              {leadStatus.text}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>© 2026 DryZone. Все права защищены.</p>
          <a href="tel:+380991234567" className="transition hover:text-slate-700">
            +38 (099) 123-45-67
          </a>
        </div>
      </footer>
    </div>
  );
}
