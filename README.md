# Supabase Next.js Chatbot with Credits

A Next.js 16 + Supabase starter project featuring a metered chatbot: every account starts with 10 free credits, every message costs 1 credit, and balances persist per-user in Supabase across devices and sessions.

Built on top of [Vercel's `with-supabase` example](https://github.com/vercel/next.js/tree/canary/examples/with-supabase).

## Features

- **Authentication** — sign up, login, logout, password reset (via Supabase Auth)
- **Per-user credit system** — 10 free credits on signup, 1 credit deducted per chatbot message, enforced atomically in the database
- **Chatbot** — powered by Gemini 2.5 Flash Lite
- **Persistent sessions** — credit balance and login state survive logout/login and device changes
- **Route protection** — `/chatbot` requires authentication; unauthenticated visitors are redirected to login

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth & DB | Supabase (Postgres + Supabase Auth) |
| Styling | Tailwind CSS + shadcn/ui |
| Language | TypeScript |
| AI | Google Gemini 2.5 Flash Lite |

## Project Structure

```
app/
├── auth/                 # Login, sign-up, password reset, email confirm
├── chatbot/
│   ├── layout.tsx        # Nav bar wrapper (username, logout, theme)
│   └── page.tsx           # Chat UI, protected route
├── api/chat/route.ts     # Auth check → credit deduction (RPC) → Gemini call
├── layout.tsx             # Root layout, fonts, ThemeProvider, bfcache guard
└── page.tsx                # Home page

components/
├── ui/                    # shadcn/ui primitives
├── site-nav.tsx           # Shared nav bar (used on home + chatbot)
├── auth-button.tsx        # Server component: shows user email + logout, or sign in/up
├── login-form.tsx / sign-up-form.tsx / logout-button.tsx
├── chat-interface.tsx     # Client-side chat UI, credit display, message handling
└── bfcache-guard.tsx      # Forces reload on back/forward cache restore

lib/
├── supabase/
│   ├── client.ts          # Browser Supabase client
│   ├── server.ts          # Server Supabase client
│   └── proxy.ts            # updateSession() — used by root proxy.ts
├── credits.ts              # getUserCredits() helper
└── utils.ts                 # cn() helper, hasEnvVars check

proxy.ts                    # Next.js 16 request interceptor (formerly middleware.ts)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Get Supabase values from **Project Settings → API**. Get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey).

> `GEMINI_API_KEY` has no `NEXT_PUBLIC_` prefix on purpose — it's server-only and never reaches the browser.

### 3. Set up the database

Run this in Supabase's **SQL Editor**:

```sql
-- Credits table
create table credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  credits_count int not null default 10,
  user_email text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_credits_user_id on credits(user_id);

alter table credits enable row level security;

create policy "Users can read their own credits"
  on credits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own credits row"
  on credits for insert
  with check (auth.uid() = user_id);

-- Atomic decrement — prevents race conditions and negative balances
create or replace function decrement_credit(p_user_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  new_balance int;
begin
  update credits
  set credits_count = credits_count - 1,
      updated_at = now()
  where user_id = p_user_id and credits_count > 0
  returning credits_count into new_balance;

  if new_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  return new_balance;
end;
$$;

-- Auto-create a credits row (10 free credits) on signup
create or replace function handle_new_user_credits()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.credits (user_id, credits_count, user_email)
  values (new.id, 10, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function handle_new_user_credits();
```

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## How the Credit System Works

1. On signup, a database trigger creates a `credits` row with `credits_count = 10`.
2. Sending a chatbot message calls `POST /api/chat`, which:
   - Verifies the user is authenticated
   - Calls `decrement_credit(user_id)` via RPC — an atomic Postgres function that fails safely if the balance is already 0 (no negative balances, no race conditions from rapid clicks)
   - Calls Gemini for a response
   - Returns the reply plus the new balance
3. Balances live in Supabase, not browser storage, so they persist across logout/login and across devices.

## Notes on This Next.js 16 Project

- **`proxy.ts`, not `middleware.ts`** — Next.js 16 renamed the root request-interceptor file and its exported function (`proxy` instead of `middleware`). This project's `proxy.ts` calls `updateSession()` from `lib/supabase/proxy.ts` to refresh the session and redirect unauthenticated requests, and also sets `Cache-Control: no-store` to avoid serving stale authenticated pages from cache.
- **`export const instant = false`** on `app/chatbot/page.tsx` — this project has Cache Components enabled, which requires routes to be prerenderable by default. Since `/chatbot` reads live session data, it's explicitly opted out of prerendering.
- **`components/bfcache-guard.tsx`** — forces a reload if a page is restored from the browser's back-forward cache, so logout/login state is never shown stale via the back button.

## Known Limitations / Next Steps

- Email confirmation is currently **disabled** in this Supabase project for easier local testing. Re-enable it under **Authentication → Providers → Email** before shipping to real users, and configure custom SMTP (Resend, SendGrid, etc.) — Supabase's default email sender is rate-limited and not meant for production.
- No "buy more credits" flow yet — credits are currently a fixed one-time grant of 10 per account.
