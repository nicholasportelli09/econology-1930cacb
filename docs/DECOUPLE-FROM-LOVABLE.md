# Decoupling Econology from Lovable

> Goal: be able to **cancel the Lovable subscription** without breaking the live app (Vercel frontend + Supabase backend), and without changing the frontend UI.
>
> **Status: DO NOT CANCEL YET.** The backend and AI features currently die if you cancel. Work through the phases below first, verify, then cancel.

---

## What is actually tied to Lovable

There are **three independent ties**, plus cosmetic/build tooling.

| # | Tie | Where | Breaks on cancel? |
|---|-----|-------|-------------------|
| 1 | **Supabase backend** (DB, auth, 25 edge functions) — project `rzwijdlukameiowfbtil`, provisioned by Lovable Cloud | everything server-side | 🔴 Yes — total backend loss |
| 2 | **AI gateway** `LOVABLE_API_KEY` | ~11 edge functions (`chat`, `market-insights`, `economic-news`, `summarize-article`, `portfolio-from-image`, `daily-notifications`, `youtube-videos`, `send-digest`, `auth-email-hook`, `preview-transactional-email`, `handle-email-suppression`) | 🔴 Yes — all AI features |
| 3 | **Email relay** `LOVABLE_SEND_URL` | `process-email-queue` | 🟠 Yes — outbound email queue (Resend already partly used) |
| — | Dev/build tooling: `lovable-tagger`, `mcpPlugin()` in `vite.config.ts`, private-registry lockfiles | build only | 🟢 No (cosmetic) |
| — | Dead code: `src/integrations/lovable/` (`@lovable.dev/cloud-auth-js`) — unused | — | 🟢 No |

What is **already independent**: Vercel hosting; auth calls (`supabase.auth.*` direct); the MCP server (runs on your Supabase edge function, validates Supabase JWTs; `@lovable.dev/mcp-js` is a normal public-npm lib); analytics (self-hosted in the `analytics_events` table).

---

## The make-or-break question: can you get your data OUT of the Lovable-managed Supabase?

Because you've only ever touched the DB through Lovable, the project lives in **Lovable's** Supabase org. Before anything else, find out what Lovable gives you:

- [ ] In the Lovable project settings, look for **"Connect Supabase" / "Export" / database credentials / a Postgres connection string**. Newer Lovable exposes the underlying Supabase; older tiers may not.
- [ ] If you can get the **direct Postgres connection string** (host, port 5432/6543, db, user, password) → a full `pg_dump` migration is possible (best case).
- [ ] If you **cannot** get direct DB access → you'll rebuild schema from the `supabase/migrations/` in this repo and re-enter data; **auth users (and their passwords) may not be portable** without DB access — plan for password resets / re-signups.

👉 This step decides whether migration is "clean copy" or "rebuild + user re-onboarding." Do it first.

---

## Phase 1 — Stand up your own Supabase project
- [ ] Create a new project in **your own** Supabase account. Pick the same region as now if you know it (lower latency, no data-residency surprise).
- [ ] Save: new **project ref**, **URL**, **anon/publishable key**, **service_role key**, and the **DB password**.
- [ ] Install the Supabase CLI and `supabase link` to the new project.

## Phase 2 — Schema + data
- [ ] Apply schema: `supabase db push` (uses the 20 files in `supabase/migrations/`). Confirm extensions come up: `pg_net`, `pg_cron`, `supabase_vault`, `pgmq`, `pgcrypto`.
- [ ] Data: if you have the old connection string → `pg_dump --data-only` (public schema) from old → restore to new. Otherwise export per-table from the Lovable UI.
- [ ] **Auth users**: if you have old DB access, dump/restore the `auth.users` + `auth.identities` tables (preserves passwords + Google links). If not, users re-sign-up / reset password.
- [ ] Recreate **cron jobs** (`pg_cron`) and **vault secrets** (values aren't in migrations — e.g. `email_queue_service_role_key`).
- [ ] Check for **Storage buckets** (the `portfolio-from-image` feature may use one) and recreate + copy objects.

## Phase 3 — Redeploy edge functions
- [ ] `supabase functions deploy` for all 25 functions in `supabase/functions/`.
- [ ] Re-apply per-function `verify_jwt` from `supabase/config.toml`.
- [ ] Set secrets on the new project (see Phase 4 for the Lovable ones):
  - `FINNHUB_API_KEY`, `NEWSAPI_API_KEY`, `RESEND_API_KEY`, `INTERNAL_FUNCTION_SECRET`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` (auto-provided by Supabase for functions, but confirm)

## Phase 4 — Replace the Lovable AI gateway + email relay  ← the big decoupling work
- [ ] **Pick an AI provider** to replace `LOVABLE_API_KEY`. Lovable's gateway is OpenAI-compatible, so options:
  - OpenRouter (drop-in, many models) — smallest code change
  - OpenAI / Anthropic / Google Gemini direct
- [ ] In each of the ~11 functions: swap the base URL + auth header + model names from Lovable's gateway to the chosen provider. Add a new secret (e.g. `AI_API_KEY`).
- [ ] Replace `LOVABLE_SEND_URL` in `process-email-queue` with a direct **Resend** send (you already have `RESEND_API_KEY` wired in `send-digest`/`news-webhook` — reuse that path).

## Phase 5 — Auth reconfiguration (new project)
- [ ] **Google OAuth**: in Google Cloud console, add authorized redirect URI `https://<NEW_REF>.supabase.co/auth/v1/callback`; put the client ID/secret into new project → Auth → Providers → Google.
- [ ] **Custom email hook**: re-register `auth-email-hook` as the Auth "Send Email" hook (this is what renders the templates in `supabase/functions/_shared/email-templates/`).
- [ ] Set **Site URL** + redirect allow-list to `https://econology.app` (+ Vercel preview domains).
- [ ] Confirm email OTP / verification flow (signup uses a 6-digit code).

## Phase 6 — Repoint the app
- [ ] `.env`: update `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY` to the new project.
- [ ] MCP issuer: `src/lib/mcp/index.ts` reads `VITE_SUPABASE_PROJECT_ID`, so it follows `.env`. Update the generated `supabase/functions/mcp/index.ts` (hardcoded `projectRef`) + `.lovable/mcp/manifest.json` issuer to the new ref, and redeploy the `mcp` function.
- [ ] Update the **Vercel** env vars to the new Supabase values; redeploy.
- [ ] Re-point any external MCP clients to the new issuer/URL.

## Phase 7 — Verify end-to-end, THEN cancel
- [ ] Email signup + OTP verify, Google login, lesson/data reads+writes, AI tutor chat, news/insights, email digest, MCP tools.
- [ ] Confirm `econology.app` serves the new backend.
- [ ] ✅ Only now: **cancel Lovable.**

---

## Parallel track — frontend-safe code cleanup (no migration needed)
These reduce Lovable surface with zero UI impact and can be done immediately:
- [x] Delete dead `src/integrations/lovable/index.ts` + remove `@lovable.dev/cloud-auth-js` dep
- [x] Remove `lovable-tagger` + `componentTagger()` from `vite.config.ts`
- [x] Fix SEO/JSON-LD URLs `econology.lovable.app` → `econology.app` (`Index.tsx`, `Learn.tsx`, `Lesson.tsx`)
- [x] Standardize on the public-npm `package-lock.json`; delete `bun.lock`, `bun.lockb`, `yarn.lock`
- [x] "Own" the MCP: removed `mcpPlugin()` from `vite.config.ts` and re-labeled the banner in `supabase/functions/mcp/index.ts`, so the Lovable Vite plugin no longer regenerates it. (It was actively corrupting the file on Windows builds — regenerating a broken `import mcp from "npm:C:\Users\...\src\lib\mcp\index.ts"` specifier that would crash the deployed function.) The committed 408-line bundle is the source of truth; re-bundle manually if you change `src/lib/mcp/`.

## Open decisions
- **AI provider** for Phase 4 (OpenRouter vs OpenAI/Anthropic/Gemini)?
- Can you obtain **direct Postgres access** to the current project from Lovable (decides Phase 2 difficulty)?
