"use client"

import { useActionState } from "react"
import { assignReviewer, type ManageUserState } from "@/app/actions/users"

const initialState: ManageUserState = {}

export function ReviewerAssign({
  caseId,
  currentReviewerId,
  currentStatus,
  reviewerName,
}: {
  caseId: string
  currentReviewerId: string | null
  currentStatus: string
  reviewerName: string | null
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
        <div className="flex items-center justify-between mb-3">
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
      ) : (
        <p className="text-sm text-muted mb-3">No reviewer assigned yet.</p>
      )}
      <p className="text-xs text-muted">
        Reviewers can be managed in{" "}
        <a href="/admin/users" className="text-gold hover:underline">User Management</a>
      </p>
    </div>
  )
}
