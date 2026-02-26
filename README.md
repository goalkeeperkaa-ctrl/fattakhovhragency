# FATTAKHOV HR Agency — website

Landing + content blocks for HR/AI consulting.

## Stack
- React 19 + Vite
- Tailwind CSS v4
- Vercel (static + serverless function `/api/lead`)

## Local run
1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and fill values.
3. Run dev server:
   ```bash
   npm run dev
   ```

## Environment variables
- `LEAD_WEBHOOK_URL` — primary destination where lead form data is sent from `/api/lead`
- `TG_BOT_TOKEN` + `TG_CHAT_ID` — fallback delivery to Telegram if webhook is not set (also receives webhook failure alerts)
- `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` — optional Cloudflare Turnstile protection
- `VITE_ADMIN_ENABLED` — `true/false`, toggles admin UI button
- `ADMIN_PANEL_TOKEN` — required for article write operations in `/api/articles`
- `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_BRANCH` — optional but recommended persistence for articles via GitHub file updates (works on Vercel)
- `APP_URL` — public URL

## Production checks
```bash
npm run lint
npm run build
```

## Notes
- Admin panel is disabled by default in production.
- Lead form is connected to `/api/lead` (no fake alert submit).
- `vercel.json` keeps `/api/*` routes and rewrites all other routes to SPA.
