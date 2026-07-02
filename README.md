# ✦ Magnet Vault ✦

A React + Vite torrent magnet-link manager, backed directly by **Appwrite**
(TablesDB + auto-generated REST API), deployed as a static site on
**Appwrite Sites**. The frontend talks to Appwrite straight from the browser
using the `appwrite` web SDK — no custom backend server required.

## Quick start

```bash
npm install
cp .env.example .env   # paste your Appwrite endpoint, project, database & table IDs
npm run dev             # Vite dev server on :5173
```

## 1. Set up Appwrite

**Option A — Appwrite Console (manual)**

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io) (or use a
   self-hosted instance).
2. Go to **Databases → Create database**, name it (e.g. `magnet-vault-db`),
   and copy its **Database ID**.
3. Inside that database, **Create table** named `links`, and copy its
   **Table ID**.
4. Add two columns to the `links` table:
   - `title` — string/varchar, size `1000`, required
   - `magnet` — string/varchar, size `4000`, required

   (Appwrite adds `$id` and `$createdAt` automatically — no need to create
   an id or timestamp column yourself.)
5. In the table's **Settings → Permissions**, turn **Row-level security
   off**, then add table-level permissions for role **Any**: `Create`,
   `Read`, `Delete`. This is suitable for a single-user / personal vault —
   see the note below if you want to lock it down with Appwrite Auth
   instead.
6. Go to **Overview → Add platform → Web app**, and register your dev
   (`localhost`) and production hostnames.
7. Go to **Settings → API keys / Overview** and copy the **Project ID** and
   your API **endpoint** (e.g. `https://fra.cloud.appwrite.io/v1`).

**Option B — Appwrite CLI**

The included `appwrite.config.json` describes the same database/table
schema declaratively. With the [Appwrite CLI](https://appwrite.io/docs/tooling/command-line/installation)
installed and logged in:

```bash
appwrite init project        # link this folder to your Appwrite project
appwrite push tables --all --force
```

Edit the `<PROJECT_ID>` / `<REGION>` placeholders in `appwrite.config.json`
first, and update the `databaseId`/`$id` fields if you rename the resources.

### Locking it down (optional)

The table permissions above (`create/read/delete` for role **Any**) mirror
an open, public API key — anyone with your project ID can read and write.
If you want a private vault, add Appwrite Auth, scope the permissions to
`Role.user(...)` instead of `Role.any()`, and enable row security so each
row can carry its own owner-based permissions.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_APPWRITE_ENDPOINT=https://<REGION>.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=magnet-vault-db
VITE_APPWRITE_TABLE_ID=links
```

These are safe to expose to the browser — the project ID isn't secret, and
access is controlled by the table permissions configured above. Never put
an Appwrite **API key** (as opposed to the project ID) in frontend code.

## 3. Deploy to Appwrite Sites

**Option A — Git integration (recommended)**

1. Push this repo to GitHub/GitLab.
2. In the Appwrite Console: **Sites → Create site → Connect a repository**,
   pick this repo/branch.
3. Framework: **Other** (static). Build command: `npm run build`, output
   directory: `dist` (already set in `appwrite.config.json`).
4. Under the site's **Settings → Environment variables**, add
   `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`,
   `VITE_APPWRITE_DATABASE_ID`, and `VITE_APPWRITE_TABLE_ID`.
5. Deploy. Appwrite builds and serves the site from its global CDN.

**Option B — Appwrite CLI**

```bash
npm install -g appwrite-cli
appwrite login
appwrite init project
appwrite push sites --site-id magnet-vault --with-variables
```

(Put the same `VITE_APPWRITE_*` values in a `.env` file at the project root
before running `--with-variables`, per the CLI's site-variable workflow.)

`appwrite.config.json` already configures the install command, build
command, output directory (`dist`), and a `fallbackFile` of `index.html` so
client-side routing works as an SPA.

## Data model

Table: `links` (in database `magnet-vault-db`)

| Column      | Type            |
| ----------- | --------------- |
| $id         | string (PK)     |
| title       | varchar(1000)   |
| magnet      | varchar(4000)   |
| $createdAt  | datetime (auto) |

## What changed vs. the Netlify/Supabase version

- Removed `src/supabaseClient.ts`, `supabase/schema.sql`, and
  `netlify.toml` — there's no Supabase project or Netlify build config
  anymore.
- Added `src/appwriteClient.ts`, which wraps the `appwrite` web SDK's
  `Client` and `TablesDB` services.
- The frontend now calls Appwrite's `TablesDB` service (`listRows`,
  `createRow`, `deleteRow`) directly from the browser instead of Supabase's
  Postgres REST API. Row listing paginates in pages of 100 (Appwrite's
  per-request limit) to mirror the old "list everything" behavior.
- Deployment target: **Appwrite Sites** static hosting
  (`appwrite.config.json`) instead of Netlify.
- Database: **Appwrite TablesDB** (Postgres-backed under the hood, exposed
  as tables/rows/columns) instead of Supabase Postgres/RLS.
- Dependency: `appwrite` (web SDK) instead of `@supabase/supabase-js`.
