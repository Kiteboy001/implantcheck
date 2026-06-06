"use client"

import { useActionState } from "react"
import { assignReviewer, type ManageUserState } from "@/app/actions/users"

const initialState: ManageUserState = {}

type Reviewer = {
  id: string
  name: string | null
  email: string
  role: string
}

export function ReviewerAssign({
  caseId,
  currentReviewerId,
  currentStatus,
  reviewerName,
  reviewers,
}: {
  caseId: string
  currentReviewerId: string | null
  currentStatus: string
  reviewerName: string | null
  reviewers: Reviewer[]
}) {
  const [, formAction, isPending] = useActionState(assignReviewer, initialState)

  if (currentStatus === "APPROVED" || currentStatus === "REJECTED") {
    if (!reviewerName) return null
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Reviewer
        </h3>
        <p className="text-sm text-navy font-medium">{reviewerName}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        Assigned Reviewer
      </h3>
      {reviewerName ? (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-navy font-medium">{reviewerName}</p>
            <form action={formAction}>
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="reviewerId" value="" />
              <button
                type="submit"
                disabled={isPending}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Unassign
              </button>
            </form>
          </div>
          {/* Reassign dropdown */}
          <form action={formAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <select
              name="reviewerId"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) e.currentTarget.form?.requestSubmit()
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
            >
              <option value="" disabled>Reassign to...</option>
              {reviewers
                .filter((r) => r.id !== currentReviewerId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.email} {r.role === "ADMIN" ? "(Admin)" : ""}
                  </option>
                ))}
            </select>
          </form>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-3">No reviewer assigned yet.</p>
          <form action={formAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <select
              name="reviewerId"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) e.currentTarget.form?.requestSubmit()
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
            >
              <option value="" disabled>Assign a reviewer...</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || r.email} {r.role === "ADMIN" ? "(Admin)" : ""}
                </option>
              ))}
            </select>
          </form>
        </>
      )}
      <p className="text-xs text-muted mt-3">
        Manage reviewers in{" "}
        <a href="/admin/users" className="text-gold hover:underline">User Management</a>
      </p>
    </div>
  )
}
