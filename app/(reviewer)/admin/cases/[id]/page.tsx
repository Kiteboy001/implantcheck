import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
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

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      submitter: { select: { name: true, email: true, gdcNumber: true } },
      files: true,
      reviews: {
        include: {
          reviewer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!caseData) notFound()

  // Fetch assigned reviewer if there is one
  let assignedReviewer = null
  if (caseData.reviewerId) {
    assignedReviewer = await prisma.user.findUnique({
      where: { id: caseData.reviewerId },
      select: { id: true, name: true, email: true },
    })
  }

  // Fetch available reviewers for assignment dropdown
  const reviewers = await prisma.user.findMany({
    where: { role: { in: ['REVIEWER', 'ADMIN'] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })

  const tierPricing: Record<string, string> = {
    BASIC: "£95",
    STANDARD: "£199",
    COMPLEX: "£295",
    PILOT_GUIDE: "£399",
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/admin" className="hover:text-navy transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/cases" className="hover:text-navy transition-colors">
          Cases
        </Link>
        <span>/</span>
        <span className="text-navy font-medium">
          {caseData.submitter.name || caseData.submitter.email}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content — left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case header */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-[(family-name:var(--font-garamond))] text-2xl text-navy font-bold mb-2">
                  Case Review
                </h1>
                <p className="text-sm text-muted">
                  Submitted{" "}
                  {new Date(caseData.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                  caseData.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : caseData.status === "UNDER_REVIEW"
                    ? "bg-blue-100 text-blue-800"
                    : caseData.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : caseData.status === "NEEDS_REVISION"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabels[caseData.status]}
              </span>
            </div>

            {/* Treatment notes */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Treatment Notes
              </h3>
              <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">
                {caseData.treatmentNotes || "No treatment notes provided."}
              </p>
            </div>

            {caseData.patientContext && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Patient Context
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  {caseData.patientContext}
                </p>
              </div>
            )}

            {caseData.softwareUsed && (
              <div>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Planning Software
                </h3>
                <p className="text-body text-sm">{caseData.softwareUsed}</p>
              </div>
            )}
          </div>

          {/* Uploaded files */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
              Uploaded Files
            </h2>
            {caseData.files.length === 0 ? (
              <p className="text-muted text-sm">No files uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {caseData.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-warm-bg rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-navy/5 flex items-center justify-center text-xs text-navy font-medium">
                        {file.fileType}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-muted">
                          {(file.fileSize / (1024 * 1024)).toFixed(1)} MB ·{" "}
                          {new Date(file.uploadedAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/api/download?url=${encodeURIComponent(file.fileUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold hover:text-gold-light font-medium transition-colors"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing reviews */}
          {caseData.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
                Reviews
              </h2>
              <div className="space-y-4">
                {caseData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-warm-bg rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {review.reviewer.name || review.reviewer.email}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          review.decision === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : review.decision === "NEEDS_REVISION"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {review.decision === "APPROVED"
                          ? "Approved"
                          : review.decision === "NEEDS_REVISION"
                          ? "Needs Revision"
                          : "Rejected"}
                      </span>
                    </div>
                    {review.implantPosition && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted mb-1">
                          Implant Position
                        </p>
                        <p className="text-sm text-body">
                          {review.implantPosition}
                        </p>
                      </div>
                    )}
                    {review.angulation && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted mb-1">
                          Angulation
                        </p>
                        <p className="text-sm text-body">{review.angulation}</p>
                      </div>
                    )}
                    {review.riskFlags && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted mb-1">
                          Risk Flags
                        </p>
                        <p className="text-sm text-body">{review.riskFlags}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-muted mb-1">
                        Overall Feedback
                      </p>
                      <p className="text-sm text-body whitespace-pre-wrap">
                        {review.overallFeedback}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-muted">Email report (simplified)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review form */}
          {caseData.status !== "APPROVED" && caseData.status !== "REJECTED" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
                Submit Review
              </h2>
              <p className="text-sm text-muted">Review form (simplified — useActionState issue)</p>
            </div>
          )}
        </div>

        {/* Sidebar — right 1/3 */}
        <div className="space-y-4">
          {/* Submitter info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Submitter
            </h3>
            <p className="text-sm font-medium text-navy mb-1">
              {caseData.submitter.name || "—"}
            </p>
            <p className="text-xs text-muted mb-1">{caseData.submitter.email}</p>
            {caseData.submitter.gdcNumber && (
              <p className="text-xs text-muted">
                GDC: {caseData.submitter.gdcNumber}
              </p>
            )}
          </div>

          {/* Reviewer assignment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Assigned Reviewer
            </h3>
            <p className="text-sm text-muted">Reviewer assignment (simplified)</p>
          </div>

          {/* Case details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Case Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tier</span>
                <span className="text-navy font-medium">
                  {tierLabels[caseData.tier]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Price</span>
                <span className="text-navy font-medium">
                  {tierPricing[caseData.tier]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Files</span>
                <span className="text-navy font-medium">
                  {caseData.files.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="text-navy font-medium">
                  {statusLabels[caseData.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/cases"
                className="block w-full text-center px-4 py-2.5 border border-gray-200 text-body rounded-lg text-sm font-medium hover:border-gold/20 hover:text-navy transition-colors"
              >
                ← Back to Cases
              </Link>
              {caseData.files.length > 0 && (
                <button
                  onClick={() => {
                    caseData.files.forEach((f) => window.open(`/api/download?url=${encodeURIComponent(f.fileUrl)}`, "_blank"))
                  }}
                  className="block w-full text-center px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  Download All Files
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
