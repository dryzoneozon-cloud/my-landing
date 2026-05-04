"use client";

import { useState } from "react";

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

export function LeadFormClient() {
  const [leadStatus, setLeadStatus] = useState<{ text: string; tone: "muted" | "ok" | "err" }>({
    text: "",
    tone: "muted",
  });
  const [submitting, setSubmitting] = useState(false);

  async function onLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const service = String(fd.get("service") || "").trim();
    const objectType = String(fd.get("object") || "").trim();
    const website = String(fd.get("website") || "").trim();

    if (!name || !phone) {
      setLeadStatus({ text: "Будь ласка, вкажіть ім’я та телефон.", tone: "err" });
      return;
    }

    const payload = {
      name,
      phone,
      service,
      object: objectType,
      website,
      source: "Лендинг DryZone",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      createdAt: new Date().toISOString(),
      ...getTracking(),
    };

    setSubmitting(true);
    setLeadStatus({ text: "Надсилаємо замовлення...", tone: "muted" });

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
        text: `Замовлення надіслано. Номер: ${result.requestId}.`,
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
        invalid_service: "Обрана недопустима послуга.",
        invalid_object: "Обраний недопустимий об'єкт.",
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
    <>
      <form
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-stretch"
        noValidate
        onSubmit={onLeadSubmit}
      >
        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="lead-name">
            Ім’я
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            placeholder="Ім’я"
            autoComplete="name"
            className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="lead-phone">
            Телефон
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            required
            placeholder="Телефон"
            autoComplete="tel"
            className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="lead-service">
            Послуга
          </label>
          <select
            id="lead-service"
            name="service"
            className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            defaultValue="Комплекс"
          >
            <option value="Сухий туман">Сухий туман</option>
            <option value="Озонація">Озонація</option>
            <option value="Комплекс">Комплекс</option>
            <option value="Демеркуризація">Демеркуризація</option>
          </select>
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="lead-object">
            Об’єкт
          </label>
          <select
            id="lead-object"
            name="object"
            className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            defaultValue="Авто"
          >
            <option value="Авто">Авто</option>
            <option value="Квартира">Квартира</option>
            <option value="Гараж/офіс">Гараж/офіс</option>
          </select>
        </div>
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
    </>
  );
}

