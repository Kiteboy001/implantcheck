import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
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

export default async function SubmitterCasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { id } = await params
  const userId = (session.user as any).id

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      files: true,
      reviews: {
        include: {
          reviewer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!caseData) notFound()
  if (caseData.submitterId !== userId) redirect("/dashboard")

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/dashboard" className="hover:text-navy transition-colors">
          My Cases
        </Link>
        <span>/</span>
        <span className="text-navy font-medium">Case Details</span>
      </div>

      {/* Payment banner — only for unpaid cases */}
      {caseData.paymentStatus === "UNPAID" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Payment Required</p>
              <p className="text-xs text-amber-700">
                Complete your payment to submit this case for expert review.
              </p>
            </div>
          </div>
          <Link
            href={`/cases/${caseData.id}/checkout`}
            className="px-5 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors shrink-0"
          >
            Complete Payment →
          </Link>
        </div>
      )}

      {/* Payment success banner (when returning from Stripe) */}
      {caseData.paymentStatus === "PAID" && caseData.status === "PENDING" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Payment received — entering review queue</p>
              <p className="text-xs text-blue-700">
                Your case will be assigned to a reviewer shortly. Refresh the page if the status hasn't updated yet.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status banner */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-[(family-name:var(--font-garamond))] text-2xl text-navy font-bold mb-2">
                  Treatment Plan
                </h1>
                <p className="text-sm text-muted">
                  Submitted{" "}
                  {new Date(caseData.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
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

            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Your Treatment Notes
              </h3>
              <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">
                {caseData.treatmentNotes}
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
              <p className="text-muted text-sm">No files.</p>
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
                          {(file.fileSize / (1024 * 1024)).toFixed(1)} MB
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

          {/* Review feedback */}
          {caseData.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
                Review Feedback
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
                          Reviewed by {review.reviewer.name || "Dr. Avik Dandapat"}
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
                    <div className="space-y-4">
                      {review.caseSummary && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            1. Case Summary
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">
                            {review.caseSummary}
                          </p>
                        </div>
                      )}
                      {review.sacClassification && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            2. SAC Classification
                          </p>
                          <p className="text-sm text-body">
                            {review.sacClassification}
                          </p>
                        </div>
                      )}
                      {review.implantPosition && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            3. Implant Position
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">
                            {review.implantPosition}
                          </p>
                        </div>
                      )}
                      {review.angulation && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            4. Angulation
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">{review.angulation}</p>
                        </div>
                      )}
                      {review.anatomicalConsiderations && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            5. Anatomical Considerations
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">
                            {review.anatomicalConsiderations}
                          </p>
                        </div>
                      )}
                      {review.prostheticConsiderations && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            6. Prosthetic Considerations
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">
                            {review.prostheticConsiderations}
                          </p>
                        </div>
                      )}
                      {review.riskFlags && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            7. Risk Assessment
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">{review.riskFlags}</p>
                        </div>
                      )}
                      {review.recommendations && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">
                            8. Recommendations
                          </p>
                          <p className="text-sm text-body whitespace-pre-wrap">
                            {review.recommendations}
                          </p>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waiting state */}
          {caseData.reviews.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-1">
                Awaiting Review
              </h3>
              <p className="text-muted text-sm">
                Dr. Dandapat will review your treatment plan and provide feedback here.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
                <span className="text-muted">Status</span>
                <span className="text-navy font-medium">
                  {statusLabels[caseData.status]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Files</span>
                <span className="text-navy font-medium">
                  {caseData.files.length}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-2.5 border border-gray-200 text-body rounded-lg text-sm font-medium hover:border-gold/20 hover:text-navy transition-colors"
            >
              ← Back to My Cases
            </Link>
            <Link
              href="/cases/new"
              className="block w-full text-center px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
            >
              Submit Another Case
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
