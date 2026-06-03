&lt;!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
&lt;!-- END:nextjs-agent-rules -->

# ImplantCheck Platform

**Stack:** Next.js 16 (App Router, Turbopack) + Tailwind CSS 4 + Prisma 7 + NextAuth v5 + PostgreSQL

## Brand

- **Navy Blue:** `#001B3D` → `bg-navy`, `text-navy` — primary colour
- **Gold:** `#A6893B` → `bg-gold`, `text-gold` — accent colour
- **Heading font:** EB Garamond → `font-[(family-name:var(--font-garamond))]`
- **Body font:** Inter → `font-[(family-name:var(--font-inter))]`

## Project Conventions

- **UI changes:** Use `patch()` for targeted edits, NOT `write_file` for whole-page rewrites
- **Nav bar:** Grey background (`bg-gray-400`) for logo contrast — user preference
- **Logo:** Text-based "IMPLANT" (navy) + "CHECK" (gold) in EB Garamond until SVG logo is provided

## Architecture

```
app/
├── layout.tsx                    # Root layout (fonts, metadata)
├── page.tsx                      # Landing page (already built ✅)
├── globals.css                   # Tailwind + brand tokens
│
├── auth/
│   ├── login/page.tsx            # Sign in
│   └── signup/page.tsx           # Register (GDC number field)
├── actions/auth.ts               # Server actions: signup, login, logout
│
├── (submitter)/                  # Route group — implant dentist views
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

## Data Model

- **User** — id, name, email, password_hash, gdc_number (optional), role (SUBMITTER/REVIEWER/ADMIN)
- **Case** — id, submitter_id, tier (BASIC/STANDARD/COMPLEX), status (PENDING→UNDER_REVIEW→APPROVED/NEEDS_REVISION), patient_context, treatment_notes, software_used
- **CaseFile** — id, case_id, file_url (UploadThing), file_name, file_type (STL/CBCT/SCREENSHOT), file_size
- **Review** — id, case_id, reviewer_id, decision, implant_position, angulation, risk_flags, overall_feedback
- **Pricing:** Basic Check £95 (single implant), Standard £199 (2–4 implants with plan), Complex £295 (4+ implants + Zoom call). Hardcoded v1, Stripe in v2.

## Design Brief

Full design brief and phased implementation plan: `docs/DESIGN_BRIEF.md`

## Prisma 7 Reminders

- `datasource db { url }` is NOT in schema.prisma — it's in `prisma.config.ts`
- `import { PrismaClient } from "@/src/generated/prisma/client"` + `PrismaPg` adapter
- Never use old `import { PrismaClient } from "@prisma/client"` path

## Deployment

- Hosted on Vercel, connected to GitHub: `github.com/Kiteboy001/implantcheck`
- PostgreSQL: Neon or Supabase
- File storage: UploadThing or Vercel Blob
