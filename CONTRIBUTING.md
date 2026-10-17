# Contributing to Life Tracker

Thanks for your interest in improving Life Tracker! This guide explains how to fork, clone, install, and run the project locally so you can start contributing.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- A free [Supabase](https://supabase.com) account
- Git

## Fork & Clone

1. Click **Fork** at the top-right of the repository to create your own copy.
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-username>/life-tracker.git
   cd life-tracker
   ```

3. Add the upstream remote so you can stay in sync:

   ```bash
   git remote add upstream https://github.com/Adnan9-63/life-tracker.git
   git fetch upstream
   ```

## Install Dependencies

```bash
npm install
```

## Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL Editor**, run the contents of `supabase/schema.sql` to create the data table and Row Level Security policies.
3. (Optional) Enable Google sign-in under *Authentication -> Providers -> Google*.
4. Copy the environment template and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from *Project Settings -> API*.

## Run Locally

```bash
npm run dev
```

The app will be served at the local dev URL printed in your terminal.

## Making Changes

1. Create a branch for your work:

   ```bash
   git checkout -b my-feature
   ```

2. Make your changes and commit them.
3. Push to your fork:

   ```bash
   git push origin my-feature
   ```

4. Open a Pull Request against `Adnan9-63/life-tracker:main` and describe what you changed and why.

## Before Opening a PR

- Keep changes focused and minimal.
- Follow the existing React + Tailwind conventions in the codebase.
- Run `npm run build` to confirm your changes compile.

Thank you for contributing!
