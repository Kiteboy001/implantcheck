"use client"

import { useActionState } from "react"
import { submitReview, type ReviewState } from "@/app/actions/review"

const initialState: ReviewState = {}

export function ReviewForm({ caseId }: { caseId: string }) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState)

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-green-800 font-medium">Review submitted successfully</p>
        <p className="text-green-600 text-sm mt-1">The submitter will be notified.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
        Submit Review
      </h2>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="caseId" value={caseId} />

        {/* Implant position */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Implant Positioning
          </label>
          <textarea
            name="implantPosition"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Comment on implant position, depth, proximity to vital structures..."
          />
        </div>

        {/* Angulation */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Angulation
          </label>
          <textarea
            name="angulation"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Comment on mesiodistal and buccolingual angulation..."
          />
        </div>

        {/* Risk flags */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Risk Flags
          </label>
          <textarea
            name="riskFlags"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Flag any anatomical risks, prosthetic concerns, or complications..."
          />
        </div>

        {/* Overall feedback */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Overall Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            name="overallFeedback"
            rows={4}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Your overall assessment and recommendations for the treatment plan..."
          />
        </div>

        {/* Decision */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Decision <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
              <input
                type="radio"
                name="decision"
                value="APPROVED"
                required
                className="accent-green-600"
              />
              <span className="text-sm font-medium text-body">Approve</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
              <input
                type="radio"
                name="decision"
                value="NEEDS_REVISION"
                className="accent-red-600"
              />
              <span className="text-sm font-medium text-body">Needs Revision</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors has-[:checked]:border-gray-500 has-[:checked]:bg-gray-50">
              <input
                type="radio"
                name="decision"
                value="REJECTED"
                className="accent-gray-600"
              />
              <span className="text-sm font-medium text-body">Reject</span>
            </label>
          </div>
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
