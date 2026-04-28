import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  name?: string;
  phone?: string;
  service?: string;
  object?: string;
  source?: string;
  createdAt?: string;
  pageUrl?: string;
  website?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
};

type RateEntry = { startsAt: number; count: number };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const DEDUPE_MS = 30 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
const MAX_STORE_KEYS = 10_000;

const globalState = globalThis as typeof globalThis & {
  __leadRateLimit?: Map<string, RateEntry>;
  __leadDedupe?: Map<string, number>;
  __leadCleanupAt?: number;
};

const rateLimitStore = globalState.__leadRateLimit ?? new Map<string, RateEntry>();
globalState.__leadRateLimit = rateLimitStore;

const dedupeStore = globalState.__leadDedupe ?? new Map<string, number>();
globalState.__leadDedupe = dedupeStore;

function cleanupStores(now: number) {
  const last = globalState.__leadCleanupAt ?? 0;
  if (now - last < CLEANUP_INTERVAL_MS) return;
  globalState.__leadCleanupAt = now;

  for (const [ip, entry] of rateLimitStore) {
    if (now - entry.startsAt > WINDOW_MS * 2) rateLimitStore.delete(ip);
  }
  for (const [phone, ts] of dedupeStore) {
    if (now - ts > DEDUPE_MS) dedupeStore.delete(phone);
  }

  // Hard cap to avoid pathological memory growth.
  if (rateLimitStore.size > MAX_STORE_KEYS) {
    let i = 0;
    for (const key of rateLimitStore.keys()) {
      rateLimitStore.delete(key);
      i += 1;
      if (rateLimitStore.size <= MAX_STORE_KEYS) break;
      if (i > MAX_STORE_KEYS) break;
    }
  }
  if (dedupeStore.size > MAX_STORE_KEYS) {
    let i = 0;
    for (const key of dedupeStore.keys()) {
      dedupeStore.delete(key);
      i += 1;
      if (dedupeStore.size <= MAX_STORE_KEYS) break;
      if (i > MAX_STORE_KEYS) break;
    }
  }
}

function cleanString(value: unknown, maxLength = 500): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function getIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string, now: number): boolean {
  const current = rateLimitStore.get(ip);
  if (!current) {
    rateLimitStore.set(ip, { startsAt: now, count: 1 });
    return false;
  }
  if (now - current.startsAt > WINDOW_MS) {
    rateLimitStore.set(ip, { startsAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  rateLimitStore.set(ip, current);
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function isDuplicate(phone: string, now: number): boolean {
  const prev = dedupeStore.get(phone);
  dedupeStore.set(phone, now);
  if (!prev) return false;
  return now - prev < DEDUPE_MS;
}

function createRequestId(): string {
  return `dz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Escape user text for Telegram HTML parse_mode. */
function escapeTelegramHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendToGoogleSheets(data: Record<string, string>): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("GOOGLE_SCRIPT_WEBHOOK_URL is not configured");

  const controller = AbortSignal.timeout(8000);
  const response = await fetch(webhookUrl, {
    method: "POST",
    body: new URLSearchParams(data),
    cache: "no-store",
    signal: controller,
  });
  if (!response.ok) throw new Error(`Sheets webhook failed: ${response.status}`);
}

async function notifyTelegram(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const controller = AbortSignal.timeout(8000);
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    cache: "no-store",
    signal: controller,
  });
  if (!response.ok) throw new Error(`Telegram failed: ${response.status}`);
}

export async function POST(request: NextRequest) {
  const now = Date.now();
  cleanupStores(now);
  const ip = getIp(request);
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = cleanString(payload.name, 120);
  const phone = normalizePhone(cleanString(payload.phone, 40));
  const service = cleanString(payload.service, 120);
  const object = cleanString(payload.object, 120);
  const website = cleanString(payload.website, 120);
  const source = cleanString(payload.source || "Лендинг DryZone", 120);
  const createdAt = cleanString(payload.createdAt || new Date().toISOString(), 80);

  if (website) return NextResponse.json({ ok: true, ignored: "honeypot" }, { status: 200 });
  if (!name || !phone) return NextResponse.json({ ok: false, error: "name_and_phone_required" }, { status: 400 });
  if (phone.length < 10) return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  if (isRateLimited(ip, now)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  // Keep only a short debounce to prevent accidental double-click submits.
  if (isDuplicate(phone, now)) return NextResponse.json({ ok: false, error: "duplicate_recent_lead" }, { status: 409 });

  const requestId = createRequestId();
  const leadData: Record<string, string> = {
    requestId,
    createdAt,
    name,
    phone,
    service,
    object,
    source,
    pageUrl: cleanString(payload.pageUrl, 300),
    ip,
    userAgent: cleanString(request.headers.get("user-agent"), 400),
    utm_source: cleanString(payload.utm_source, 120),
    utm_medium: cleanString(payload.utm_medium, 120),
    utm_campaign: cleanString(payload.utm_campaign, 120),
    utm_term: cleanString(payload.utm_term, 120),
    utm_content: cleanString(payload.utm_content, 120),
    gclid: cleanString(payload.gclid, 200),
    fbclid: cleanString(payload.fbclid, 200),
    status: "new",
  };

  try {
    await sendToGoogleSheets(leadData);
    const safeName = escapeTelegramHtml(name);
    const safePhone = escapeTelegramHtml(phone);
    const safeService = escapeTelegramHtml(service || "-");
    const safeObject = escapeTelegramHtml(object || "-");
    await notifyTelegram(
      [
        "📩 <b>Нова заявка DryZone</b>",
        `ID: <code>${requestId}</code>`,
        `Ім’я: ${safeName}`,
        `Телефон: ${safePhone}`,
        `Послуга: ${safeService}`,
        `Об’єкт: ${safeObject}`,
      ].join("\n"),
    );
    return NextResponse.json({ ok: true, requestId }, { status: 200 });
  } catch (error) {
    console.error("lead_save_failed", { requestId, error: String(error) });
    return NextResponse.json({ ok: false, error: "storage_unavailable", requestId }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "POST, OPTIONS" },
  });
}
