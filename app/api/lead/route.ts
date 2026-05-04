import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

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

// Valid options for strict validation
const VALID_SERVICES = ["Сухий туман", "Озонація", "Комплекс"];
const VALID_OBJECTS = ["Авто", "Квартира", "Гараж/офіс"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==========================================
// Fallback In-Memory Stores
// ==========================================
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

function isMemoryRateLimited(ip: string, now: number): boolean {
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

function isMemoryDuplicate(phone: string, now: number): boolean {
  const prev = dedupeStore.get(phone);
  dedupeStore.set(phone, now);
  if (!prev) return false;
  return now - prev < DEDUPE_MS;
}

// ==========================================
// Upstash Redis Setup (if available)
// ==========================================
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
    : null;

const ratelimit = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS_PER_WINDOW, "1 h"),
    analytics: false,
  })
  : null;

async function checkRateLimitAndDedupe(
  ip: string,
  phone: string,
  now: number
): Promise<{ limited: boolean; duplicate: boolean }> {
  if (ratelimit && redis) {
    // Redis-based validation for Serverless
    const { success } = await ratelimit.limit(`rl_${ip}`);
    if (!success) return { limited: true, duplicate: false };

    const dedupeKey = `dedupe_${phone}`;
    const isDuplicate = await redis.get(dedupeKey);
    if (isDuplicate) return { limited: false, duplicate: true };

    await redis.set(dedupeKey, "1", { px: DEDUPE_MS });
    return { limited: false, duplicate: false };
  } else {
    // Graceful fallback to memory store
    return {
      limited: isMemoryRateLimited(ip, now),
      duplicate: isMemoryDuplicate(phone, now),
    };
  }
}

// ==========================================
// Helpers
// ==========================================

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

  if (!botToken || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Skipping Telegram notification.");
    return;
  }

  const controller = AbortSignal.timeout(8000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
      cache: "no-store",
      signal: controller,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Telegram API failed: ${response.status} - ${text}`);
      // Not throwing error here to ensure client still gets 200 OK since Sheets likely succeeded
    }
  } catch (error) {
    console.error("Telegram network/fetch error:", error);
  }
}

// ==========================================
// Handlers
// ==========================================

export async function POST(request: NextRequest) {
  const now = Date.now();
  cleanupStores(now);
  const ip = getIp(request);
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400, headers: corsHeaders });
  }

  const name = cleanString(payload.name, 120);
  const phone = normalizePhone(cleanString(payload.phone, 40));
  const service = cleanString(payload.service, 120);
  const object = cleanString(payload.object, 120);
  const website = cleanString(payload.website, 120);
  const source = cleanString(payload.source || "Лендинг DryZone", 120);
  const createdAt = cleanString(payload.createdAt || new Date().toISOString(), 80);

  // Honeypot check
  if (website) return NextResponse.json({ ok: true, ignored: "honeypot" }, { status: 200, headers: corsHeaders });

  // Basic validation
  if (!name || !phone) return NextResponse.json({ ok: false, error: "name_and_phone_required" }, { status: 400, headers: corsHeaders });
  if (phone.length < 10) return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400, headers: corsHeaders });

  // Strict Enum Validation
  if (service && !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ ok: false, error: "invalid_service" }, { status: 400, headers: corsHeaders });
  }
  if (object && !VALID_OBJECTS.includes(object)) {
    return NextResponse.json({ ok: false, error: "invalid_object" }, { status: 400, headers: corsHeaders });
  }

  // Rate Limiting & Deduplication (Redis or Memory)
  const { limited, duplicate } = await checkRateLimitAndDedupe(ip, phone, now);

  if (limited) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers: corsHeaders });
  if (duplicate) return NextResponse.json({ ok: false, error: "duplicate_recent_lead" }, { status: 409, headers: corsHeaders });

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

    return NextResponse.json({ ok: true, requestId }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("lead_save_failed", { requestId, error: String(error) });
    return NextResponse.json({ ok: false, error: "storage_unavailable", requestId }, { status: 502, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
