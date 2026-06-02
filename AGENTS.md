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
├── layout.tsx        # Root layout (fonts, metadata)
├── page.tsx          # Landing page
├── auth/
│   ├── login/        # Login page
│   └── signup/       # Registration page
├── dashboard/        # Submitter dashboard (protected)
│   └── cases/
│       ├── new/      # New case submission
│       └── [id]/     # Case detail
└── admin/            # Reviewer dashboard (protected)
    └── cases/
        └── [id]/     # Case review
```

## Prisma 7 Reminders

- `datasource db { url }` is NOT in schema.prisma — it's in `prisma.config.ts`
- `import { PrismaClient } from "@/src/generated/prisma/client"` + `PrismaPg` adapter
- Never use old `import { PrismaClient } from "@prisma/client"` path

## Deployment

- Hosted on Vercel, connected to GitHub: `github.com/Kiteboy001/implantcheck`
- PostgreSQL: Neon or Supabase
- File storage: UploadThing or Vercel Blob
