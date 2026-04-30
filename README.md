This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Lead architecture

- Frontend form submits to `POST /api/lead`
- Server validates and normalizes data
- Anti-spam: honeypot, rate limit, duplicate phone check
- Server forwards lead to Google Sheets webhook
- Optional Telegram alerts on new lead

### Note on Vercel deployments

The current rate limit / dedupe logic is implemented in-memory in the API route. This is fine as a minimal anti-spam measure, but on Vercel (serverless / multiple instances) it is **best-effort** and can be bypassed by distributing requests across instances or after cold starts. If you need stronger protection later, add a shared store (KV/Redis) or a CAPTCHA/Turnstile.

### `index.html`

`index.html` in the repository root is a legacy static prototype. The real Next.js app is served from the `app/` directory (`app/page.tsx`).

### Environment

Copy `.env.example` into `.env.local` and fill values:

```bash
cp .env.example .env.local
```

- `GOOGLE_SCRIPT_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)
