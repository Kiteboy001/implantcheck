import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

const tiers = [
  {
    value: "BASIC",
    label: "Basic Check",
    price: "£95",
    sub: "per case",
    desc: "Single implant — full STL/CBCT review with written feedback",
    features: [
      "Full STL & CBCT review",
      "Written feedback report",
      "Implant position analysis",
      "Angulation assessment",
      "Revision review included",
      "48-hour turnaround",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
        {/* Magnifying glass over dental arch */}
        <path d="M20 44C20 44 24 20 32 20C40 20 44 44 44 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="46" cy="46" r="12" stroke="currentColor" strokeWidth="2.5" />
        <line x1="54" y1="54" x2="58" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "STANDARD",
    label: "Standard",
    price: "£199",
    sub: "per case",
    desc: "2–4 implants — comprehensive review with detailed plan feedback",
    popular: true,
    features: [
      "Everything in Basic",
      "Treatment plan review",
      "Prosthetic considerations",
      "Detailed plan feedback",
      "Anatomical assessment",
      "36-hour priority turnaround",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
        {/* Clipboard with dental focus */}
        <rect x="18" y="8" width="28" height="48" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 8V4a2 2 0 012-2h12a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 24h16M24 32h16M24 40h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 36l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" />
      </svg>
    ),
  },
  {
    value: "COMPLEX",
    label: "Complex",
    price: "£295",
    sub: "per case",
    desc: "4+ implants — full review with 1-on-1 Zoom consultation",
    features: [
      "Everything in Standard",
      "High-complexity analysis",
      "Full treatment plan evaluation",
      "1-on-1 Zoom consultation",
      "All planning software views",
      "24-hour expedited turnaround",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
        {/* Zoom consultation + depth */}
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="32" r="4" stroke="currentColor" strokeWidth="2.5" />
        {/* People nodes */}
        <circle cx="14" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="44" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M18 22l10 8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M46 40l-10-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: "PILOT_GUIDE",
    label: "Pilot Guide",
    price: "£399",
    sub: "per case",
    desc: "Collaborative surgical guide — downloadable STL ready to print",
    features: [
      "Everything in Complex",
      "Co-designed surgical guide",
      "Collaborative planning session",
      "Downloadable STL for print",
      "Full DICOM integration",
      "5-7 day comprehensive turnaround",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
        {/* Surgical guide — precision crosshair + implant */}
        <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="32" r="4" stroke="currentColor" strokeWidth="2.5" />
        <line x1="10" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="36" y1="32" x2="54" y2="32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="32" y1="10" x2="32" y2="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="32" y1="36" x2="32" y2="54" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Implant post */}
        <rect x="30" y="28" width="4" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id
  const userName = session.user?.name || session.user?.email || "there"

  const cases = await (prisma as any).case.findMany({
    where: { submitterId: userId },
    include: { reviews: { select: { id: true, decision: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div>
      {/* Welcome + summary */}
      <div className="mb-10">
        <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-muted">
          Submit a new implant treatment plan for expert review, or check your existing cases below.
        </p>
      </div>

      {/* Tier selection cards */}
      <h2 className="font-[(family-name:var(--font-garamond))] text-xl text-navy font-bold mb-1">
        Start a New Review
      </h2>
      <p className="text-sm text-muted mb-6">
        Choose the tier that matches your case complexity. Each tier asks for different diagnostic data so the reviewer can give you the right level of feedback.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {tiers.map((tier) => (
          <div
            key={tier.value}
            className={`relative bg-white rounded-xl border-2 flex flex-col ${
              tier.popular
                ? "border-gold shadow-[0_0_0_1px_var(--color-gold)] shadow-md"
                : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
            } transition-all`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-white text-xs font-semibold rounded-full">
                MOST POPULAR
              </div>
            )}

            <div className="p-5 flex flex-col flex-1">
              {/* Icon */}
              <div className="text-gold mb-4">{tier.icon}</div>

              {/* Name + price */}
              <h3 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold">
                {tier.label}
              </h3>
              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span className="text-2xl text-navy font-bold">{tier.price}</span>
                <span className="text-xs text-muted">{tier.sub}</span>
              </div>
              <p className="text-xs text-muted mb-4">{tier.desc}</p>

              {/* Feature list */}
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-body">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/cases/new?tier=${tier.value}`}
                className={`block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  tier.popular
                    ? "bg-navy text-white hover:bg-navy-light"
                    : "border-2 border-navy text-navy hover:bg-navy hover:text-white"
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      {cases && cases.length > 0 && (
        <div>
          <h2 className="font-[(family-name:var(--font-garamond))] text-xl text-navy font-bold mb-4">
            Your Recent Cases
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Case</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Tier</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-warm-bg/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-navy font-medium">
                      {c.treatmentNotes?.slice(0, 60) || "Untitled case"}…
                    </td>
                    <td className="px-5 py-3.5 text-sm text-body">
                      {c.tier === "BASIC" ? "Basic" : c.tier === "STANDARD" ? "Standard" : c.tier === "COMPLEX" ? "Complex" : "Pilot Guide"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        c.status === "UNDER_REVIEW" ? "bg-blue-100 text-blue-800" :
                        c.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        c.status === "NEEDS_REVISION" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {c.status === "PENDING" ? "Pending" :
                         c.status === "UNDER_REVIEW" ? "Under Review" :
                         c.status === "APPROVED" ? "Approved" :
                         c.status === "NEEDS_REVISION" ? "Needs Revision" :
                         c.status === "REVISED" ? "Revised" : c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/cases/${c.id}`}
                        className="text-sm text-gold hover:text-gold-light font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/cases"
              className="text-sm text-gold hover:text-gold-light font-medium transition-colors"
            >
              View all cases →
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!cases || cases.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-navy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-1">
            No cases yet
          </h3>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Choose a tier above to submit your first treatment plan for expert implant review.
          </p>
        </div>
      )}
    </div>
  )
}
