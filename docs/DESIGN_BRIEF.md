# ImplantCheck — Design Brief & Implementation Plan

> **For Hermes:** Use `subagent-driven-development` skill to implement this plan task-by-task.
> **Sister project:** Implant Diploma Platform (`~/implant-diploma-platform`) — same stack, same conventions.

**Goal:** A web platform where implantologists submit treatment plans (STL files, CBCT scans, planning screenshots) for expert review by Dr. Avik Dandapat, and receive structured feedback on implant positioning, angulation, and overall treatment plan quality.

**Owned by:** ADIMPLANT.COM LTD (Company No. 06431009)  
**Trademark:** UK00004379448 (filed 27/04/2026)  
**Reviewer:** Dr. Avik Dandapat  
**Repo:** `github.com/Kiteboy001/implantcheck`  
**Live URL:** TBD (Vercel)  
**Stack:** Next.js 16 + Tailwind CSS 4 + Prisma 7 + NextAuth v5 + PostgreSQL (Neon) + file storage

---

## Brand

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Navy Blue | `#001B3D` | `bg-navy`, `text-navy`, `border-navy` | Primary — hero sections, nav, CTAs |
| Gold | `#A6893B` | `bg-gold`, `text-gold`, `border-gold` | Accent — highlights, badges, links |
| Warm BG | `#FBF8F2` | `bg-warm-bg` | Section backgrounds |
| Body | `#4B5563` | `text-body` | Body text |
| Muted | `#6B7280` | `text-muted` | Secondary text |

**Fonts:** EB Garamond (headings), Inter (body)  
**Tagline:** "PLAN BETTER. PLACE BETTER."  
**Subtitle:** "EXPERT IMPLANT PLANNING. CONFIDENCE IN EVERY CASE."

---

## User Roles

### 1. Implantologist (Submitter)
- Creates account with GDC number
- Submits treatment plans: uploads STL files, CBCT scans, planning screenshots, and treatment notes
- Views review status and feedback on their cases
- Can revise and resubmit based on feedback

### 2. Reviewer (Dr. Avik Dandapat / admin)
- Sees queue of pending cases
- Reviews submitted files and treatment notes
- Writes structured feedback: implant position assessment, angulation comments, risk flags, overall recommendation
- Marks cases as approved / needs revision / rejected

### 3. Admin
- Manages users, cases, pricing
- Dashboard with metrics

---

## User Flows

### Flow A: Implantologist Submits a Case
```
Landing → Sign Up (GDC number) → Dashboard → "New Case"
→ Upload STL + CBCT + Screenshots + Treatment Notes
→ Submit → View case status (Pending → Under Review → Reviewed)
→ Receive feedback → Optionally revise & resubmit
```

### Flow B: Reviewer Evaluates a Case
```
Login → Admin Dashboard → Pending Cases queue
→ Open case → View files + notes
→ Write feedback (structured form)
→ Mark: Approved / Needs Revision / Rejected
→ Submitter notified (email)
```

### Flow C: Revision Loop
```
Submitter receives "Needs Revision" feedback
→ Views specific comments
→ Uploads revised files + response
→ Reviewer re-evaluates
→ Approved or further revision
```

---

## Data Model

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | |
| email | String | Unique |
| password_hash | String | bcrypt |
| gdc_number | String? | Optional, 5-8 digits |
| role | Role enum | SUBMITTER, REVIEWER, ADMIN |
| created_at | DateTime | |
| updated_at | DateTime | |

### Case
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| submitter_id | String | FK → User |
| tier | CaseTier | BASIC (£95), STANDARD (£199), COMPLEX (£295) |
| status | CaseStatus | PENDING, UNDER_REVIEW, APPROVED, NEEDS_REVISION, REVISED |
| patient_context | Text? | Anonymised — age range, edentulous site, medical notes (NO PII) |
| treatment_notes | Text | Implantologist's plan description |
| software_used | String? | e.g. "Blue Sky Bio", "coDiagnostiX" |
| created_at | DateTime | |
| updated_at | DateTime | |

### CaseFile
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| case_id | String | FK → Case |
| file_url | String | UploadThing / Vercel Blob URL |
| file_name | String | Original filename |
| file_type | FileType | STL, CBCT, SCREENSHOT, OTHER |
| file_size | Int | Bytes |
| uploaded_at | DateTime | |

### Review
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| case_id | String | FK → Case |
| reviewer_id | String | FK → User |
| decision | ReviewDecision | APPROVED, NEEDS_REVISION, REJECTED |
| implant_position | Text? | Comments on implant positioning |
| angulation | Text? | Comments on angulation |
| risk_flags | Text? | Anatomical or prosthetic risks identified |
| overall_feedback | Text | Summary and recommendations |
| created_at | DateTime | |
| updated_at | DateTime | |

### Pricing

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Basic Check** | £95 | Single implant case — full STL/CBCT review with written feedback |
| **Standard** | £199 | 2–4 implant case — comprehensive review with detailed treatment plan feedback |
| **Complex** | £295 | 4+ implants, high complexity — full review, detailed plan, and a Zoom consultation call with Dr. Dandapat |

Pricing is hardcoded for v1 and displayed statically on the landing page and case submission form. The submitter selects their tier during case submission. Payment integration (Stripe) is a future phase — v1 operates on invoice/trust basis.

---

## Route Architecture

```
app/
├── layout.tsx                    # Root layout (fonts, global nav)
├── page.tsx                      # Landing page (already built ✅)
├── globals.css                   # Tailwind + brand tokens
│
├── auth/
│   ├── login/page.tsx            # Sign in
│   └── signup/page.tsx           # Register (GDC number field)
├── actions/auth.ts               # Server actions: signup, login, logout
│
├── (submitter)/                  # Route group — implantologist views
│   ├── layout.tsx                # Submitter nav (grey bar)
│   ├── dashboard/page.tsx        # My cases list + "New Case" button
│   ├── cases/
│   │   ├── new/page.tsx          # Upload form (multi-file, notes)
│   │   └── [id]/page.tsx         # Case detail: files, status, reviews
│   └── settings/page.tsx         # Profile, GDC number
│
├── (reviewer)/                   # Route group — reviewer/admin views
│   ├── layout.tsx                # Reviewer nav (grey bar)
│   ├── admin/page.tsx            # Dashboard: pending count, metrics
│   ├── admin/cases/
│   │   ├── page.tsx              # All cases queue (filterable)
│   │   └── [id]/page.tsx         # Review form + file viewer
│   └── admin/users/page.tsx      # User management
│
└── api/
    └── upload/route.ts           # UploadThing file handler
```

---

## File Storage

**Provider:** UploadThing (free tier: 2GB, generous for STL/CBCT files)

**File types accepted:**
- `.stl` — 3D model files (binary and ASCII)
- `.dcm` — DICOM / CBCT scans
- `.png`, `.jpg` — Planning screenshots
- `.pdf` — Optional: treatment plan PDF exports

**Max file size per upload:** 100MB (STL/CBCT files can be large)

**Pitfall:** No STL/DICOM in-browser viewer in v1 — files are download-only. A 3D viewer (Three.js) is a future enhancement.

---

## Implementation Plan

### Phase 0: Foundation (Prisma + Auth)

#### Task 0.1: Set up Prisma 7 schema
**Files:** `prisma/schema.prisma`, `prisma.config.ts`, `src/generated/`

Write the complete Prisma schema with User, Case, CaseFile, Review models plus NextAuth tables (Account, Session, VerificationToken).

Install deps and generate client. Create singleton `lib/prisma.ts` with `PrismaPg` adapter.

```bash
npm install @prisma/client @prisma/adapter-pg
npm install prisma --save-dev
# Write schema, create prisma.config.ts
npx prisma generate
```

**Verification:** `npx prisma generate` succeeds, `import { PrismaClient } from "@/src/generated/prisma/client"` resolves.

#### Task 0.2: Configure NextAuth v5 with credentials
**Files:** `auth.ts`, `app/actions/auth.ts`, `proxy.ts`

Create `auth.ts` with PrismaAdapter, credentials provider, JWT callbacks propagating `id` and `role`. Create server actions for signup (validate email/password/GDC, hash with bcrypt) and login. Create `proxy.ts` exporting `auth` as proxy.

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs zod
npm install @types/bcryptjs --save-dev
```

**Verification:** Server starts without errors, `signIn("credentials", ...)` works in test.

#### Task 0.3: Create auth pages
**Files:** `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/actions/auth.ts`

Client components with `useActionState`. Signup form: Name, Email, GDC Number (optional, 5-8 digits), Password, Confirm Password. Login form: Email, Password. Both redirect to dashboard on success.

**Verification:** Can register a new user, login, and reach dashboard page (even if empty).

### Phase 1: Case Submission

#### Task 1.1: Set up UploadThing
**Files:** `app/api/uploadthing/core.ts`, `app/api/uploadthing/route.ts`, `lib/uploadthing.ts`

Configure UploadThing with file router accepting STL, DICOM, PNG, JPG, PDF. Set max file size to 100MB.

```bash
npm install uploadthing @uploadthing/react
```

**Verification:** UploadThing dev server starts, test upload via curl returns file URL.

#### Task 1.2: Build "New Case" form
**Files:** `app/(submitter)/cases/new/page.tsx`, `app/components/CaseUploadForm.tsx`

Multi-part form:
1. Patient context (anonymised — age range, site, notes — NO names/IDs)
2. Treatment notes (text area — describe your plan)
3. Software used (text input)
4. File uploads (STL, CBCT, screenshots) via UploadThing dropzone component
5. Submit button

Client component with React Hook Form + Zod validation.

**Verification:** Form validates, files upload, case record created in DB.

#### Task 1.3: Build submitter dashboard
**Files:** `app/(submitter)/dashboard/page.tsx`, `app/(submitter)/layout.tsx`

Server component: fetch current user's cases, display as cards with status badges (PENDING 🟡, UNDER_REVIEW 🔵, APPROVED 🟢, NEEDS_REVISION 🟠). "New Case" button prominent. Layout with grey nav bar, "My Cases" / "Settings" links, sign out.

**Verification:** Dashboard shows cases after submission, status badges correct.

#### Task 1.4: Build case detail page
**Files:** `app/(submitter)/cases/[id]/page.tsx`

Server component: case info, files list with download links, review history. If status is NEEDS_REVISION, show "Revise & Resubmit" button → opens revision form (same as new case but linked to original).

**Verification:** Navigate from dashboard → case detail, see files and reviews.

### Phase 2: Review System

#### Task 2.1: Build reviewer dashboard
**Files:** `app/(reviewer)/layout.tsx`, `app/(reviewer)/admin/page.tsx`

Role-gated layout (only REVIEWER/ADMIN roles). Dashboard: pending count, recent activity, quick links to case queue.

**Verification:** Submitter gets redirected; reviewer/admin sees dashboard.

#### Task 2.2: Build case queue
**Files:** `app/(reviewer)/admin/cases/page.tsx`

Table of all cases with columns: submitter name, date, status, files count. Filterable by status. Click through to review page. Sort by date (oldest pending first).

**Verification:** Queue shows all cases, filters work, links to review page.

#### Task 2.3: Build review form
**Files:** `app/(reviewer)/admin/cases/[id]/page.tsx`, `app/components/ReviewForm.tsx`

Two-panel layout:
- **Left:** Case files (download links), treatment notes, patient context
- **Right:** Review form with fields for implant position, angulation, risk flags, overall feedback, and decision radio (Approved / Needs Revision / Rejected)

Server action to create/update Review record and update Case status.

**Verification:** Review form submits, case status updates, submitter sees new review on their case detail.

### Phase 3: Polish & Deploy

#### Task 3.1: Email notifications
**Files:** `lib/email.ts`, `app/actions/notify.ts`

Send email to submitter when review is completed. Use Resend (same as Implant Diploma Platform).

```bash
npm install resend
```

**Verification:** Review submission triggers email to submitter.

#### Task 3.2: Deploy to Vercel + Neon
- Create Neon database
- Set Vercel env vars (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, UPLOADTHING_SECRET, UPLOADTHING_APP_ID, RESEND_API_KEY)
- Push schema to Neon: `npx prisma db push`
- Connect Vercel to GitHub repo
- Deploy

**Verification:** Production URL loads, signup works, file upload works, review flow end-to-end.

#### Task 3.3: Add SVG logo
Replace text-based "IMPLANT CHECK" logo with the actual SVG logo from the trademark filing. Update nav bar and any other logo instances.

**Verification:** Logo renders correctly at all breakpoints.

---

## Future Phases (v2+)

- **3D STL viewer** — Three.js-based in-browser preview of implant positions
- **Stripe payments** — Pay-per-case before submission
- **Bulk pricing** — Discounts for clinics submitting multiple cases
- **Revision history** — Track iterations of a case through multiple reviews
- **Analytics** — Reviewer dashboard with throughput metrics
- **Hermes AI agent** — Coach bot for implantologists (similar to Implant Diploma)

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Pay-per-case, no subscription | Client preference — low barrier to entry |
| UploadThing for file storage | Free tier sufficient, simpler than AWS S3 |
| No in-browser STL viewer in v1 | Keeps scope manageable; files are download-only |
| Single reviewer (Dr. Dandapat) | No multi-reviewer assignment system needed |
| No patient PII | Regulatory simplification — implantologists keep patient data |
| Same stack as Implant Diploma Platform | Shared conventions, reusable patterns |
| Grey nav bar | User preference for logo contrast |

---

## Development Conventions

- **UI changes:** Use `patch()` for targeted edits, NOT `write_file` for whole-page rewrites
- **Prisma 7:** No `datasource url` in schema.prisma — use `prisma.config.ts`
- **Imports:** `import { PrismaClient } from "@/src/generated/prisma/client"`
- **Auth:** `import { auth } from "@/auth"` for server pages, `useSession()` for client
- **Nav bar:** Always `bg-gray-400` — user preference
- **Brand tokens:** Navy `#001B3D` (not steel blue `#2D5A79`), Gold `#A6893B`
