import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  NEEDS_REVISION: "Needs Revision",
  REVISED: "Revised",
  REJECTED: "Rejected",
}

const tierLabels: Record<string, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  COMPLEX: "Complex",
  PILOT_GUIDE: "Pilot Guide",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id

  const cases = await prisma.case.findMany({
    where: { submitterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      files: { select: { id: true } },
      reviews: { select: { id: true } },
    },
  })

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <img src="/logo-horizontal.jpg" alt="ImplantCheck" className="h-10 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm text-navy font-medium hover:text-gold transition-colors"
                >
                  My Cases
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-body hover:text-navy transition-colors font-medium"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-1">
              My Cases
            </h1>
            <p className="text-muted">
              {cases.length} case{cases.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <Link
            href="/cases/new"
            className="px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
          >
            + New Case
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h2 className="font-[(family-name:var(--font-garamond))] text-xl text-navy font-bold mb-2">
              No cases yet
            </h2>
            <p className="text-muted mb-6 max-w-sm mx-auto">
              Submit your first treatment plan for expert review by Dr. Avik Dandapat.
            </p>
            <Link
              href="/cases/new"
              className="inline-block px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              Submit Your First Case
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gold/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-navy">
                          {tierLabels[c.tier]}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            c.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : c.status === "UNDER_REVIEW"
                              ? "bg-blue-100 text-blue-800"
                              : c.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : c.status === "NEEDS_REVISION"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusLabels[c.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {c.files.length} file{c.files.length !== 1 ? "s" : ""}
                        {c.reviews.length > 0 && ` · ${c.reviews.length} review${c.reviews.length !== 1 ? "s" : ""}`}
                        {" · "}
                        {new Date(c.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-gold text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
