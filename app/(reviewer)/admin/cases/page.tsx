import { prisma } from "@/lib/prisma"
import Link from "next/link"

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

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  NEEDS_REVISION: "bg-red-100 text-red-800",
  REVISED: "bg-purple-100 text-purple-800",
  REJECTED: "bg-gray-100 text-gray-600",
}

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams

  const cases = await prisma.case.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    orderBy: [
      { status: "asc" }, // PENDING first
      { createdAt: "asc" }, // oldest first within each status
    ],
    include: {
      submitter: { select: { name: true, email: true } },
      files: { select: { id: true } },
    },
  })

  const statusCounts = await prisma.case.groupBy({
    by: ["status"],
    _count: { status: true },
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-1">
            Cases
          </h1>
          <p className="text-muted">
            {cases.length} case{cases.length !== 1 ? "s" : ""}
            {statusFilter ? ` — ${statusLabels[statusFilter] || statusFilter}` : " total"}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/cases"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter
              ? "bg-navy text-white"
              : "bg-white text-body border border-gray-200 hover:border-gold/20"
          }`}
        >
          All
        </Link>
        {["PENDING", "UNDER_REVIEW", "APPROVED", "NEEDS_REVISION"].map(
          (status) => (
            <Link
              key={status}
              href={`/admin/cases?status=${status}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-navy text-white"
                  : "bg-white text-body border border-gray-200 hover:border-gold/20"
              }`}
            >
              {statusLabels[status]}
            </Link>
          )
        )}
      </div>

      {/* Cases table */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-muted mb-2">
            {statusFilter
              ? `No ${statusLabels[statusFilter]?.toLowerCase() || statusFilter} cases`
              : "No cases submitted yet"}
          </p>
          {!statusFilter && (
            <p className="text-sm text-muted/60">
              Cases will appear here once implant dentists submit their treatment plans.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-warm-bg border-b border-gray-100 text-xs font-semibold text-muted uppercase tracking-wider">
            <div className="col-span-3">Submitter</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Files</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-50">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-warm-bg transition-colors items-center"
              >
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-navy">
                    {c.submitter.name || "—"}
                  </p>
                  <p className="text-xs text-muted">{c.submitter.email}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-body">{tierLabels[c.tier]}</span>
                </div>
                <div className="md:col-span-2">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                    {statusLabels[c.status]}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted">
                    {c.files.length} file{c.files.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="md:col-span-1 text-right">
                  <span className="text-gold text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
