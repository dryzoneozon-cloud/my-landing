import { HeaderClient } from "./header-client";
import { HeroClient, type HeroSlide } from "./hero-client";
import { FaqClient, type FaqItem } from "./faq-client";
import { LeadFormClient } from "./lead-form-client";
import Image from "next/image";

const LOGO_SRC = "/photo_2026-04-30_17-57-51.png";

const LIST_CHECK =
  "space-y-2 text-sm leading-relaxed text-slate-600 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.45rem] [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-slate-800";

const HERO_SLIDES: HeroSlide[] = [
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
];

const FAQS: FaqItem[] = [
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

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      <HeaderClient />

      <main className="flex-1">
        <HeroClient slides={HERO_SLIDES} />

        <section id="services" className="scroll-mt-24 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="mb-12 max-w-2xl border-l-2 border-slate-900/90 pl-5">
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
              <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] md:grid-cols-2">
                <article className="border-b border-slate-200 bg-zinc-50/60 p-8 md:border-b-0 md:border-r md:border-slate-200">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Етап 1</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Озонація</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Знищення бактерій і молекул запаху. Для стійких запахів і підготовки до фінішної обробки.
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900"
                  >
                    Заявка
                  </a>
                </article>
                <article className="bg-white p-8">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Етап 2</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Сухий туман</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Закріплення ефекту озонування, пом’якшення запаху озону, нейтральний «чистий» фон без різкої
                    хімії.
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900"
                  >
                    Заявка
                  </a>
                </article>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Автомобілі</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Компакт</p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">Міні, Smart, 2 двері</h4>
                    <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">1200 грн</p>
                    <ul className={`mt-5 ${LIST_CHECK}`}>
                      <li>Повне озонування салону</li>
                      <li>Прибирання сторонніх запахів</li>
                      <li>Фініш сухим туманом</li>
                    </ul>
                  </article>
                  <article className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.10)]">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Стандарт</p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">Хетчбеки, седани</h4>
                    <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">1500 грн</p>
                    <ul className={`mt-5 ${LIST_CHECK}`}>
                      <li>Глибоке озонування салону</li>
                      <li>Стійкі запахи та бактерії</li>
                      <li>Сухий туман</li>
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
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
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">1 кімната</p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">Базовий пакет</h4>
                    <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">3000 грн</p>
                    <ul className={`mt-5 ${LIST_CHECK}`}>
                      <li>Апарат, озонування</li>
                      <li>Провітрювання</li>
                      <li>Сухий туман за потреби</li>
                    </ul>
                  </article>
                  <article className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.10)]">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">2 кімнати</p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">Комплекс</h4>
                    <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">4000 грн</p>
                    <ul className={`mt-5 ${LIST_CHECK}`}>
                      <li>Кімнати, кухня, коридор</li>
                      <li>Побутові запахи</li>
                      <li>Фініш сухим туманом</li>
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
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
                <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Гаражі, підвали, офіси
                </h3>
                <article className="rounded-2xl border border-slate-200 bg-zinc-50/60 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
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
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <FaqClient items={FAQS} />
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-zinc-50/40 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-10">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Заявка</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Зв’яжемося протягом 10 хвилин і погодимо час виїзду.
              </p>
              <LeadFormClient />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-slate-200">
                <Image src={LOGO_SRC} alt="DryZone" fill sizes="48px" className="object-contain" />
              </span>
              <p className="font-medium text-slate-700">© 2026 DryZone</p>
            </div>
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

