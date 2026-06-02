# ImplantCheck

**Expert implant planning review.** Submit your STL files and CBCT scans for evaluation by Dr. Avik Dandapat.

> "Plan better. Place better." — Confidence in every case.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Prisma 7** + PostgreSQL (Neon/Supabase)
- **NextAuth v5** (credentials auth)
- **UploadThing** (file storage)
- **Resend** (email)
- **Vercel** (deployment)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, UPLOADTHING_TOKEN, RESEND_API_KEY

# Set up the database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
# → http://localhost:3000
```

## Project Status

- [x] Landing page
- [ ] Authentication (login/signup)
- [ ] Submitter dashboard
- [ ] Case submission form
- [ ] Admin review dashboard
- [ ] File upload integration
- [ ] Email notifications
- [ ] Payment integration

## Brand

| Token | Hex |
|-------|-----|
| Navy Blue | `#001B3D` |
| Gold | `#A6893B` |

Trademark: UK00004379448 — ADIMPLANT.COM LTD
