# Life Tracker by ADNAN

A highly visual, offline-first Progressive Web App (PWA) designed to track life progress through the lens of Memento Mori, while managing weekly objectives and daily core habits.

Built with a clean, dark-mode (zinc and indigo) UI, backed by Supabase for accounts and cloud sync, and engineered to keep working without an internet connection.

## ✨ Core Features

- **The Life Grid** — a visual representation of a 60-year lifespan (Age 0 to 60), color-coded by weekly score.
- **The Log (Action Center)** — weekly objective, score, and up to 10 customizable daily habits.
- **Insights Dashboard** — streaks, average score, and totals.
- **Accounts + Cloud Sync** — email/password or Google sign-in; data lives in Postgres (Supabase), not just on one device.
- **Offline-first** — installable PWA (`vite-plugin-pwa`); changes made offline are cached locally and synced automatically once back online.
- **Import/Export** — manual JSON backup/restore, in addition to automatic cloud sync.

## 🛠️ Tech Stack

- React 19 + Vite
- Tailwind CSS
- Supabase (Postgres + Auth) for accounts and data storage
- `vite-plugin-pwa` for offline support and installability

## 🔧 Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a free project, then grab your **Project URL** and **anon/public key** from *Project Settings → API*.

### 2. Enable Google sign-in (optional)
In Supabase: *Authentication → Providers → Google*. You'll need a Google OAuth Client ID/Secret from the [Google Cloud Console](https://console.cloud.google.com/) (OAuth consent screen + Web application credentials). Add your Supabase callback URL as an authorized redirect URI — Supabase shows you the exact URL to use on that same settings page.

### 3. Run the database schema
Open *SQL Editor* in your Supabase project and run the contents of `supabase/schema.sql`. This creates the data table and Row Level Security policies (so each user can only ever access their own data).

### 4. Configure environment variables
```bash
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 5. Install and run
```bash
npm install
npm run dev
```

### 6. Deploy (Netlify)
Add the same two environment variables in *Site settings → Environment variables* on Netlify, then deploy as usual. Build command: `npm run build`, publish directory: `dist`.

## 🔒 Security notes

- Data access is enforced by **Postgres Row Level Security**, not by hiding the API key — the anon key is safe to have in a public repo.
- Never commit `.env` (already gitignored) or your Supabase **service_role** key anywhere in client code — only the anon key belongs in the frontend.
- Passwords are handled entirely by Supabase Auth; this app never stores or sees raw passwords.

---

Developed by Adnan — conceptualized and shipped as a milestone project during a rigorous 300-day technical and personal development challenge.
