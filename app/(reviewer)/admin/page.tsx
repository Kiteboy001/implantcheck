import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await auth()

  const [totalCases, pending, underReview, approved, needsRevision, recentCases] =
    await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: "PENDING" } }),
      prisma.case.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.case.count({ where: { status: "APPROVED" } }),
      prisma.case.count({ where: { status: "NEEDS_REVISION" } }),
      prisma.case.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          submitter: { select: { name: true, email: true } },
        },
      }),
    ])

  const stats = [
    { label: "Pending", count: pending, color: "bg-amber-100 text-amber-800", href: "/admin/cases?status=PENDING" },
    { label: "Under Review", count: underReview, color: "bg-blue-100 text-blue-800", href: "/admin/cases?status=UNDER_REVIEW" },
    { label: "Approved", count: approved, color: "bg-green-100 text-green-800", href: "/admin/cases?status=APPROVED" },
    { label: "Needs Revision", count: needsRevision, color: "bg-red-100 text-red-800", href: "/admin/cases?status=NEEDS_REVISION" },
  ]

  const tierLabels: Record<string, string> = {
    BASIC: "Basic",
    STANDARD: "Standard",
    COMPLEX: "Complex",
    PILOT_GUIDE: "Pilot Guide",
  }

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    NEEDS_REVISION: "Needs Revision",
    REVISED: "Revised",
    REJECTED: "Rejected",
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-garamond)] text-3xl text-navy font-bold mb-1">
            Admin Dashboard
          </h1>
          <p className="text-muted">
            {totalCases} total case{totalCases !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link
          href="/admin/cases"
          className="px-5 py-2.5 bg-navy text-white rounded-lg font-semibold text-sm hover:bg-navy-light transition-colors"
        >
          View All Cases →
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gold/20 transition-all"
          >
            <p className="text-3xl font-bold text-navy font-[family-name:var(--font-garamond)] mb-1">
              {stat.count}
            </p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.color}`}>
              {stat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold">
            Recent Submissions
          </h2>
        </div>
        {recentCases.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted">No cases submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-warm-bg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {c.submitter.name || c.submitter.email}
                    </p>
                    <p className="text-xs text-muted">
                      {tierLabels[c.tier]} ·{" "}
                      {new Date(c.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  c.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : c.status === "UNDER_REVIEW"
                    ? "bg-blue-100 text-blue-800"
                    : c.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : c.status === "NEEDS_REVISION"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {statusLabels[c.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
