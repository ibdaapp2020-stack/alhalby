# STORE‑STARTER — Setup Guide

A clean Firebase‑ready storefront + admin template. Clone it once, run through the five steps below, and you have a brand‑new store with its own data, logo, and theme — zero code changes.

---

## 1 · Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | ≥ 22 |
| npm | ≥ 10 |
| Firebase account | — |
| (optional) Firebase CLI | `npm i -g firebase-tools` for `firestore:deploy` |

---

## 2 · Clone & install

```bash
git clone <this-repo> my-store
cd my-store
npm install
```

The template ships with:

- Next.js 15 + React 19 + Tailwind v4
- Firebase client + Admin SDK
- Tri‑lingual UI (Hebrew / Arabic / English, RTL‑aware)
- Full admin suite (products, categories, modifier groups, orders, customers, banners, settings, users, printer)
- PWA shell (service worker, offline, install prompt)
- Zero products, zero categories, zero demo data, zero prior‑tenant branding.

---

## 3 · Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Enable the services the store uses:
   - **Build → Authentication** → *Sign‑in method* → Email/Password → Enable.
   - **Build → Firestore Database** → *Create database* (production mode, pick a region close to your customers).
   - **Build → Storage** → *Get started* (same region).
3. **Project Settings → General → Your apps → `</>`** → Register a web app → copy the config.
4. **Project Settings → Service accounts → Generate new private key** → download the JSON. Keep it safe; this is the Admin SDK credential.

---

## 4 · Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in **four blocks** (everything else is optional).

### 4.1 Client SDK — from the web app config

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4.2 Admin SDK — pick ONE of three options

**Option A — paste the service‑account PEM fields (recommended for production):**
```env
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@YOUR_PROJECT.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Option B — one‑line JSON:**
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...", ...}
```

**Option C — dev convenience:** drop the downloaded JSON at the repo root as `.firebase-admin-key.json`. The file is already gitignored and never ships to production builds.

### 4.3 Firebase CLI project id

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with the project id you created in step 3.

### 4.4 First admin user

```env
ADMIN_BOOTSTRAP_EMAIL=you@example.com
ADMIN_BOOTSTRAP_PASSWORD=ChangeMeNow!
ADMIN_BOOTSTRAP_NAME=Owner
```

The first API call automatically creates this user with role `Admin` if the `users` collection is empty. **Change the password after first login.**

---

## 5 · Deploy Firestore security rules

Rules live in `firestore.rules`. Push them once:

```bash
npx firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

(or run the preconfigured npm script after updating `.firebaserc`: `npm run firebase:deploy-rules`.)

---

## 6 · Run the store

```bash
npm run dev
```

Open `http://localhost:3000`:

- `/` — storefront. Shows the "We're setting up the store for you" placeholder until you add products.
- `/admin` — admin portal. Redirects to `/admin/login`. Sign in with the bootstrap email + password from step 4.4.

Set your brand under **Admin → Settings**:
- Store name
- Logo (upload to Firebase Storage)
- Hero / share image
- Primary + accent colors
- Phone, address, hours
- Currency, SEO description

Changes take effect live via the TenantProvider — no restart needed.

---

## 7 · Build the catalog

In **Admin → Categories** add top‑level groupings (e.g. *Beverages*, *Pastries*, *Specials*).
In **Admin → Products** add items — each supports:
- Images (uploaded to Firebase Storage)
- Price, cost, availability, "popular" / "new" flags
- Modifier groups (sizes, add‑ons, removals) attached per product
- Hebrew / Arabic / English copy with auto‑translation

Everything the storefront shows is read live from Firestore — no code deploys for content updates.

---

## 8 · Deploy to Vercel

1. Push the repo to GitHub / GitLab.
2. On Vercel → **Add New Project** → import the repo.
3. Vercel will ask for environment variables — paste the same values from `.env.local`. Do **not** check "expose to browser" for any `FIREBASE_ADMIN_*` or `BREVO_*` key.
4. Deploy. The first `/api/auth/bootstrap` call will create your admin user on the live site.

> ⚠️ Vercel's filesystem is read‑only. The `.firebase-admin-key.json` fallback does **not** work there — you must set `FIREBASE_ADMIN_CLIENT_EMAIL` + `FIREBASE_ADMIN_PRIVATE_KEY` (or `FIREBASE_SERVICE_ACCOUNT_JSON`) in Vercel's env panel.

---

## 9 · Optional modules

Each is OFF by default on a fresh clone. Enable per‑tenant via Firestore `settings/app.features.*`:

| Flag | Enables |
| --- | --- |
| `banners` | Hero banner wizard in Admin |
| `qrLinks` | QR card generator for menu / order links |
| `pdfMenuBuilder` | Printable A4 PDF menu designer |
| `aiAssistant` | Chatbot widget on the storefront |
| `businessRules` | Automation / pricing rules module |
| `mediaLibrary` | Shared media picker in Admin |
| `menuDisplay` | Public read‑only `/menu-display` route |

---

## 10 · Local thermal printer (optional)

The template includes a cloud **print‑jobs** queue and a local **print agent** (see `printer-agent-standalone/`). Default state is OFF (`PRINT_AUTO_NEW_ORDERS=false`). Follow `printer-agent-standalone/README.md` on the restaurant PC to install the Windows agent.

---

## 11 · What NOT to commit

Already in `.gitignore`:

```
.env
.env*.local
.firebase-admin-key.json
```

Also keep service‑account JSONs out of chat screenshots, support tickets, and public repos. If you leak one, rotate it in **Firebase Console → Project Settings → Service Accounts** immediately.

---

## 12 · Project scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest unit tests |
| `npm run seed` | Opt‑in Firestore seed (requires populated `scripts/data/products.json`) |
| `npm run firebase:deploy-rules` | Push `firestore.rules` |
| `npm run email:test` | Send a Brevo test email |

---

Happy shipping. If something is unclear, open an issue on the fork — the goal is: clone → `.env.local` → `npm run dev` → selling.
