# Linkbox

A private bookmark manager (Tuckii/Pocket-style) backed by Supabase — links, collections,
and tags synced across devices.

## Stack

- React + Vite + TypeScript + Tailwind CSS v4
- Supabase (Auth, Postgres with RLS, Realtime, Edge Functions)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase project's URL and anon key:
   ```bash
   cp .env.example .env
   ```
3. Apply the database schema — paste `supabase/migrations/00000000000000_init.sql` into your
   Supabase project's SQL Editor, or via the CLI:
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
4. Deploy the metadata-fetch Edge Function (powers auto title/description/thumbnail on save):
   ```bash
   npx supabase functions deploy fetch-metadata
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

## Features

- Email/password and magic-link auth, gated access
- Paste-to-save with server-side Open Graph metadata fetch
- Collections, tags, instant search, multi-select bulk actions
- Link detail view with notes and editing
- JSON export/import for backup
- Realtime sync across tabs/devices
- Dark/light mode, mobile-responsive layout
