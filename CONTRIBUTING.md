# Contributing to Life Tracker

Start with an existing issue, or discuss larger changes in a new issue. Check open
pull requests to avoid duplicate work and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Local setup

Install Node.js and npm. Vite 8 requires Node.js 20.19+ or 22.12+; use a supported
LTS release satisfying that requirement.

Fork [Life Tracker](https://github.com/Adnan9-63/life-tracker) on GitHub, then:

```bash
git clone https://github.com/YOUR_USERNAME/life-tracker.git
cd life-tracker
git remote add upstream https://github.com/Adnan9-63/life-tracker.git
git switch -c fix/short-description
npm ci --legacy-peer-deps
cp .env.example .env
```

The install command matches [CI](.github/workflows/ci.yml). In PowerShell, use
`Copy-Item .env.example .env` instead of `cp`.

Follow the [README setup](README.md#-setup) to create your own Supabase project and
apply [the database schema](supabase/schema.sql). Fill in `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in `.env`. Google sign-in is optional. Use test data rather
than production accounts. Installing dependencies alone does not configure auth.

```bash
npm run dev
```

Open the local URL printed by Vite. Stop the server with Ctrl+C.

## Check your change

From the repository root:

```bash
npm run lint
npm run build
npm run preview
git diff --check
```

Preview serves the production build locally. There is currently no `npm test`
script; manually check the behavior you changed. For UI changes, test desktop and
narrow mobile layouts and include screenshots without personal information.
Report existing unrelated lint errors separately instead of hiding them.

## Submit a pull request

Keep one focused change per branch. Review the diff, then stage only your files:

```bash
git add path/to/changed-file
git commit -m "fix: describe the change"
git push -u origin fix/short-description
```

Open a PR from your fork's branch to this repository's `main` branch. Fill in the
[PR template](.github/pull_request_template.md), use `Fixes #NUMBER` when the change
fully resolves an issue, and list the checks you actually ran. Explain any checks
you could not run. Address review feedback with commits on the same branch.

Do not commit `.env`, service-role keys, credentials or personal habit data. Only
the public/anon Supabase key belongs in client configuration; see the
[README security notes](README.md#-security-notes).
