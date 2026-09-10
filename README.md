# Sultan Kudarat Research Journal of Education and Technology (SKRJET)

Production-ready multi-journal academic publishing system.

```
RESEARCHER
                              │
                              ▼
                            EDAS
                              │
                 Submission → Review → Decision
                              │
                           ACCEPTED
                              │
                              ▼
                    JOURNAL ADMIN PORTAL
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
          Metadata           PDF             DOI
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                         PUBLICATION
                              │
                              ▼
                     PUBLIC ARTICLE PAGE
                              │
                 ┌────────────┼─────────────┐
                 ▼            ▼             ▼
              Scholar       Crossref       ORCID
                 │
                 ▼
          GOOGLE SCHOLAR
```

Researchers submit through EDAS. After submission, review, and an accept decision, the article enters the journal admin portal. Editors complete metadata, the final PDF, and the DOI, then publish on this platform. The public article page exposes Scholar citation tags (for Google Scholar), the Crossref DOI, and author ORCID iDs.

## Stack

| Area | Choice |
| --- | --- |
| Frontend | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Supabase or Neon) |
| ORM | Prisma |
| Authentication | Auth.js (Credentials) |
| Storage | Supabase Storage (`local` or `s3` also supported) |
| Deployment | Vercel |
| Submission / review | EDAS |
| Publication | This platform |
| DOI | Crossref |
| Researcher identity | ORCID |
| Discoverability | Google Scholar + Google Search |

## Requirements

- Node.js 20+
- PostgreSQL 16+ (local Docker, Supabase, or Neon)
- Optional: Supabase Storage bucket (public for published PDFs)

This workspace is a XAMPP `htdocs` folder, but the application is not PHP. Apache is not required. Use `npm run dev` (port 3000) locally, or deploy to Vercel.

## Installation

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/Journal Scopus"
cp .env.example .env
# Set AUTH_SECRET to a long random value:
# openssl rand -base64 48
npm install
```

### PostgreSQL

**Docker**

```bash
docker compose up -d
```

**Homebrew**

```bash
brew install postgresql@16
brew services start postgresql@16
createdb journal_platform
```

Update `DATABASE_URL` in `.env` if your credentials differ. Hosted options:

- **Neon** — copy the connection string from the Neon console (`sslmode=require`).
- **Supabase PostgreSQL** — use the URI from Project Settings → Database. For Prisma migrations, prefer the direct (non-pooler) URL.

### Migrate, seed, and run

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Development accounts

These passwords exist only in seed data. Never use them in production.

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@sksu.edu.ph` | `DevPassword123!` |
| Editor-in-Chief | `eic@sksu.edu.ph` | `DevPassword123!` |
| Managing Editor | `managing@sksu.edu.ph` | `DevPassword123!` |
| Section Editor | `section@sksu.edu.ph` | `DevPassword123!` |
| Reviewer | `reviewer@sksu.edu.ph` | `DevPassword123!` |
| Author | `author@sksu.edu.ph` | `DevPassword123!` |

Seeded public content: [Sultan Kudarat Research Journal of Education and Technology](/journals/skrjet)

## Roles

- **Super Admin** — entire platform, system configuration, users, journals
- **Editor-in-Chief** — journal, issue approval, article approval, publishing
- **Managing Editor** — article records, metadata, publication schedule, final files
- **Section Editor** — articles in the assigned discipline
- **Author** — profile, ORCID, published articles, submissions
- **Reviewer** — invited by email; sign in at `/login`, then open review assignments
- **Reader** — search, view articles, download PDF

## Reviewer invites

Creating a user with **Email login details to this address** checked sends:

- the editorial login URL
- their email
- the temporary password you set

When a reviewer is assigned to a manuscript, they also get an assignment email with a link to `/admin/reviews/[assignmentId]`.

Development uses `EMAIL_MODE=mock` (messages are logged, not delivered). For production, set:

```bash
EMAIL_MODE=live
EMAIL_FROM="SKRJET <noreply@your-domain.edu>"
RESEND_API_KEY=re_xxx
```

## Configuration

See `.env.example`. Important variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — session signing key, at least 32 characters
- `APP_URL` — canonical public origin
- `EMAIL_MODE` — `mock` or `live` (Resend)
- `STORAGE_DRIVER` — `local`, `s3`, or `supabase`
- `STORAGE_LOCAL_PATH` — default `.storage`
- `S3_*` — required when `STORAGE_DRIVER=s3`
- `EDAS_MODE` — `mock`, `manual`, or `live`
- Upload size limits and metric dedupe window

## File storage

Uploads are never trusted from the client filename or `Content-Type`. The server sniffs magic bytes, checks allowed extensions, and writes to an opaque storage key.

- Development: files land in `.storage/` and are served from `/api/files/...`
- Production: set `STORAGE_DRIVER=s3` plus endpoint, bucket, and credentials. MinIO, AWS S3, Cloudflare R2, and Garage all work if they speak the S3 API.
- Published PDFs are also available at stable article URLs: `/journals/{slug}/articles/{articleSlug}/pdf`

## Peer review

Journals use a **single-blind** process matching the JTET-style workflow:

1. Submission and initial screening
2. Assignment of reviewers (Editor-in-Chief or Associate Editor)
3. Single-blind review (reviewers see authors; authors do not see reviewers)
4. Reviewer recommendations (accept, revise, or reject)
5. Editorial decision by the Editor-in-Chief
6. Author response and revision
7. Final decision and publication

Public policy: `/journals/{slug}/peer-review`  
Editorial desk: `/admin/review`  
Reviewer inbox: `/admin/reviews`  
Author submissions: `/admin/submissions`

When an article has an EDAS Paper ID, submission, reviewer recommendations, and editorial decisions are also recorded through the EDAS adapter (`mock`, `manual`, or `live`). That does not replace the in-app single-blind process.

## Publishing workflow

1. Managing Editor or Section Editor creates a draft and completes the seven-step wizard.
2. Submit for approval.
3. Editor-in-Chief or Super Admin approves.
4. The same roles publish. Publication is blocked until title, abstract, journal, issue, authors, one corresponding author, publication date, keyword, final PDF, valid page range, and EIC approval are present.
5. Published articles are read-only for ordinary editors. Corrections by EIC/Super Admin are audit-logged.

## Tests

```bash
npm test
npm run typecheck
npm run lint
```

Critical coverage includes authentication helpers, RBAC, wizard/publish validation, DOI/ORCID checks, file-signature restrictions, Scholar citation tags, search helpers, metric dedupe, Crossref, and storage URL helpers.

## Deployment

**Vercel** is the production host. Set these environment variables in the project settings:

1. `DATABASE_URL` — Neon or Supabase PostgreSQL (pooled URL is fine for the app; use a direct URL for `prisma migrate deploy` if the host requires it).
2. `AUTH_SECRET` — unique secret, 32+ characters. `AUTH_URL` and `APP_URL` must be the public HTTPS origin.
3. `STORAGE_DRIVER=supabase` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`. Keep the bucket public for published PDFs so Google Scholar can fetch `citation_pdf_url`.
4. `CROSSREF_MODE=live` and Crossref depositor credentials when membership is active; `mock` until then.
5. `ORCID_MODE=live` to resolve names from the public ORCID API.
6. `GOOGLE_SITE_VERIFICATION` from Google Search Console.
7. `npx prisma migrate deploy` against the hosted database, then deploy. Do not run `db:seed` in production.

Local development can keep `STORAGE_DRIVER=local` and Docker PostgreSQL.

## Project layout

- `prisma/schema.prisma` — data model and enums
- `src/auth.ts` — Auth.js Credentials provider
- `src/app/api` — REST route handlers (`/api/authjs` is Auth.js)
- `src/lib/auth` — sessions, passwords, RBAC, rate limits
- `src/lib/services` — journals, issues, articles, files, search, metrics
- `src/lib/storage` — local, S3, and Supabase Storage adapters
- `src/lib/edas` — EDAS adapter
- `src/lib/doi` — Crossref DOI registration
- `src/lib/orcid.ts` — ORCID public-record lookup
- `src/lib/scholar.ts` — Google Scholar citation tags
- `src/components/ui` — shadcn/ui primitives
- `src/app/journals` — public HTML article, issue, and journal pages
- `src/app/admin` — editorial UI including the article wizard

