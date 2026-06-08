# ImplantCheck — Service Handover Checklist

## Current Setup

Everything currently runs under **Jaco's accounts**. To move to Dr Avik's accounts, here's exactly what needs to happen on each service.

---

## 1. Vercel — Hosting & Deployment

**What it does:** Hosts the Next.js app, auto-deploys on git push, handles the domain.

**Current:** Under Jaco's Vercel account, connected to `github.com/Kiteboy001/implantcheck`  
**Domain:** `implantcheck.vercel.app`

**What Avik needs to do:**

1. Create a free Vercel account at [vercel.com](https://vercel.com) (sign up with GitHub)
2. Import the GitHub repo after it's transferred to his account (see #2 below)
3. In the Vercel project settings, go to **Settings → Environment Variables** and add every variable from the `.env.example` list below
4. Redeploy — Vercel will auto-detect Next.js and configure everything

**Env vars to add in Vercel (Settings → Environment Variables):**
```
DATABASE_URL          (from Neon — #3 below)
NEXTAUTH_URL          (set to the production URL, e.g. https://implantcheck.vercel.app)
NEXTAUTH_SECRET       (generate: openssl rand -base64 32)
BLOB_READ_WRITE_TOKEN (from Vercel Blob — #4 below)
BLOB2_STORE_ID        (from Vercel Blob store setup)
RESEND_API_KEY        (from Resend — #5 below)
STRIPE_SECRET_KEY     (from Stripe — #6 below)
STRIPE_WEBHOOK_SECRET (from Stripe — #6 below)
NEXT_PUBLIC_URL       (same as NEXTAUTH_URL)
```

If Avik wants a custom domain (e.g. `app.implantcheck.co.uk`): Vercel → Settings → Domains → add domain, then add a CNAME record at his DNS provider.

---

## 2. GitHub — Source Code

**What it does:** Stores the code. Vercel deploys from here.

**Current:** `github.com/Kiteboy001/implantcheck`

**Option A — Transfer ownership (simplest):**  
Jaco transfers the repo to Avik's GitHub account (Settings → Danger Zone → Transfer ownership). Then reconnect Vercel.

**Option B — Clone & push fresh:**
1. Avik creates a new private repo on GitHub
2. Jaco pushes the code to the new repo
3. Avik connects Vercel to the new repo

---

## 3. Neon — PostgreSQL Database

**What it does:** Stores all data — users, cases, case files (metadata), reviews, tokens.

**Current:** A Neon PostgreSQL instance under Jaco's Neon account.  
**Connection string format:** `postgresql://user:password@host:5432/implantcheck?sslmode=require`

**What Avik needs to do:**

1. Create a free Neon account at [neon.tech](https://neon.tech)
2. Create a new project called `implantcheck`
3. Create a database called `implantcheck`
4. Copy the **connection string** (looks like the format above)
5. Add it as `DATABASE_URL` in Vercel's environment variables

**After the database is live**, Jaco will run the Prisma migration to create all tables:
```bash
npx prisma migrate deploy
```

**To migrate existing data** from Jaco's database to Avik's: Jaco can do a `pg_dump` export and `pg_restore` into Avik's Neon instance.

---

## 4. Vercel Blob — File Storage

**What it does:** Stores uploaded case files (STL/CBCT scans, screenshots). Files can be up to 512MB each.

**Current:** Under Jaco's Vercel account, using a store referenced by `BLOB2_STORE_ID`.

**What Avik needs to do:**

1. In his Vercel dashboard, go to **Storage → Blob** and create a new Blob store
2. Copy the `BLOB_READ_WRITE_TOKEN` — this is the main credential
3. The app uses a named store via `BLOB2_STORE_ID` — note the store ID from the Blob dashboard
4. Add both to Vercel environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `BLOB2_STORE_ID`

**Note:** Blob stores are tied to a Vercel project. If Avik's Blob store is in a different region, Jaco may need to update the upload code to match.

---

## 5. Resend — Email

**What it does:** Sends review report emails to implant dentists after their case is reviewed.

**Current:** Under Jaco's Resend account.  
**From address:** `ImplantCheck <reviews@implantcheck.co.uk>`  
**Recipients:** The submitter's email address (from the database)

**What Avik needs to do:**

1. Create a free Resend account at [resend.com](https://resend.com)
2. Generate an API key
3. Add the domain `implantcheck.co.uk` in Resend → Domains → Add Domain  
   (this verifies he owns it and allows sending from `@implantcheck.co.uk`)
4. Add DNS records Resend provides to his domain's DNS
5. Add `RESEND_API_KEY` to Vercel environment variables

**If Avik doesn't own `implantcheck.co.uk`**, he can:
- Register the domain first
- Or update the `FROM_EMAIL` in `lib/email.ts` to a domain he already owns

---

## 6. Stripe — Payments

**What it does:** Handles credit/debit card payments for case reviews.  
**Pricing:** Basic £95 / Standard £199 / Complex £295 / Pilot Guide £399  
**Webhook:** Notifies the app when a payment completes → marks case as "PAID"

**Current:** Under Jaco's Stripe account.

**What Avik needs to do:**

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to **Developers → API keys** and copy the **Secret key** (starts with `sk_live_`)
3. Add `STRIPE_SECRET_KEY` to Vercel environment variables
4. Set up a webhook endpoint:
   - In Stripe Dashboard → Developers → Webhooks → Add Endpoint
   - URL: `https://implantcheck.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel
5. Update the Stripe API version if needed (currently `2026-05-27.dahlia` in `app/api/checkout/route.ts`)

**To receive real payments**, Avik will need to complete Stripe's business verification (company details, bank account).

---

## 7. Domain Name

**What it does:** Gives the site a professional URL (not `.vercel.app`) and lets Resend send emails from `@implantcheck.co.uk`.

**Current:** Running on `implantcheck.vercel.app`. Email from address is `ImplantCheck <reviews@implantcheck.co.uk>`.

**What Avik needs:**

1. Register a domain if he doesn't already own one (e.g. `implantcheck.co.uk`)
   - Recommended registrars: [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), [Google Domains](https://domains.google)
   - `.co.uk` domains typically cost ~£6-10/year
2. Add the domain to **Vercel** — Project Settings → Domains → Add `implantcheck.co.uk`
3. Follow Vercel's DNS instructions (add a CNAME record pointing to `cname.vercel-dns.com`)
4. Add the domain to **Resend** — Domains → Add Domain → `implantcheck.co.uk`
5. Add Resend's DNS records (MX/SPF/DKIM) so emails don't land in spam
6. Update `NEXTAUTH_URL` in Vercel env vars to `https://implantcheck.co.uk`

If Avik wants the app on a subdomain (e.g. `app.implantcheck.co.uk`), the steps are the same — just swap the domain name.

---

## 8. NextAuth — Authentication

**What it does:** User login/signup system (email + password, no social login).

**What Avik needs:**

- `NEXTAUTH_SECRET` — a random string for session encryption. Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` — the production URL of the deployed app

No external account needed — this is self-contained within the app.

---

## Summary: What Avik Creates

| # | Service | Account Needed | Cost |
|---|---------|---------------|------|
| 1 | **Vercel** | vercel.com | Free (Hobby plan) |
| 2 | **GitHub** | github.com | Free |
| 3 | **Neon** | neon.tech | Free (0.5 GB included) |
| 4 | **Vercel Blob** | Part of Vercel account | Free (1 GB included) |
| 5 | **Resend** | resend.com | Free (100 emails/day) |
| 6 | **Stripe** | stripe.com | Free to sign up; ~1.5% + 20p per transaction |
| 7 | **Domain** | Any registrar | ~£6-10/year (.co.uk) |
| 8 | **NextAuth** | None (self-contained) | Free |

**Total monthly cost at launch:** ~£6-10/year for the domain. Everything else runs on free tiers. Stripe fees only apply when processing payments.

---

## What Jaco Does After Avik Sets Up

1. Transfer GitHub repo to Avik's account
2. Run `pg_dump` from old database → `pg_restore` to new Neon instance
3. Run `npx prisma migrate deploy` against the new database to create tables
4. Point Vercel to the new GitHub repo and trigger a deploy
5. Verify: signup → create case → upload file → checkout → receive email
