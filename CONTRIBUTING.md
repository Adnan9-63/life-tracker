# Contributing to Life Tracker

Thanks for your interest in improving Life Tracker! Start with an existing issue, or discuss larger changes in a new issue. Check open pull requests to avoid duplicate work and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- [Node.js](https://nodejs.org/) (Vite 8 requires Node.js 20.19+ or 22.12+; use a supported LTS release)
- A free [Supabase](https://supabase.com) account
- Git

## Fork & Clone

1. Click **Fork** at the top-right of the repository to create your own copy.
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/life-tracker.git
   cd life-tracker
   ```

3. Add the upstream remote so you can stay in sync:

   ```bash
   git remote add upstream https://github.com/Adnan9-63/life-tracker.git
   git fetch upstream
   ```

4. Create a branch for your work:

   ```bash
   git switch -c fix/short-description
   ```

## Install Dependencies

```bash
npm install
```

> **Note:** If you encounter peer dependency conflicts during clean install (matching [CI](.github/workflows/ci.yml)), use:
> ```bash
> npm ci --legacy-peer-deps
> ```

## Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL Editor**, run the contents of `supabase/schema.sql` to create the data table and Row Level Security policies.
3. (Optional) Enable Google sign-in under *Authentication -> Providers -> Google*.
4. Copy the environment template and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   *(In PowerShell, use `Copy-Item .env.example .env` instead of `cp`.)*

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from *Project Settings -> API*.

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal. Stop the server with `Ctrl+C`.

## Check Your Changes

From the repository root, run:

```bash
npm test
npm run lint
npm run build
npm run preview
git diff --check
```

- `npm test` runs the unit and regression test suite.
- `npm run lint` verifies code style and catches common issues.
- `npm run build` verifies that the production bundle compiles cleanly.
- `npm run preview` serves the production build locally.
- For UI changes, test both desktop and narrow mobile layouts, and include before/after screenshots without personal data.

## Submit a Pull Request

Keep one focused change per branch. Review your diff, then stage only your files:

```bash
git add path/to/changed-file
git commit -m "fix: describe the change"
git push -u origin fix/short-description
```

Open a PR from your fork's branch to this repository's `main` branch:
- Fill in the [PR template](.github/pull_request_template.md).
- Use `Fixes #NUMBER` when the change fully resolves an issue.
- List the checks you ran and describe your testing.
- Address review feedback with commits on the same branch.

### 🔒 Security Reminders

Do not commit `.env`, service-role keys, credentials, or personal habit data. Only the public/anon Supabase key belongs in client configuration; see the [README security notes](README.md#-security-notes).

Thank you for contributing!
