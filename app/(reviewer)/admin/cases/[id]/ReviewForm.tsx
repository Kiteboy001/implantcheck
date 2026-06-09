"use client"

import { useActionState } from "react"
import { submitReview, type ReviewState } from "@/app/actions/review"

const initialState: ReviewState = {}

const sacOptions = [
  { value: "", label: "— Select classification —" },
  { value: "Straightforward", label: "Straightforward — routine case, low risk" },
  { value: "Advanced", label: "Advanced — moderate complexity, some risk factors" },
  { value: "Complex", label: "Complex — high complexity, multiple risk factors" },
]

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
      <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-1">
        Submit Review
      </h2>
      <p className="text-sm text-muted mb-6">
        Complete each section of the templated report. Dictate or type your assessment.
      </p>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="caseId" value={caseId} />

        {/* 1. Case Summary */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            1. Case Summary
          </label>
          <textarea
            name="caseSummary"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Brief overview of the treatment plan: which teeth/sites, implant system proposed, key clinical context..."
          />
        </div>

        {/* 2. SAC Classification */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            2. SAC Classification (ITI Framework)
          </label>
          <select
            name="sacClassification"
            defaultValue=""
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors bg-white"
          >
            {sacOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1">
            Straightforward = routine single implant, good bone, no grafting. Advanced = moderate complexity, some grafting or sinus lift. Complex = full arch, extensive grafting, compromised anatomy.
          </p>
        </div>

        {/* 3. Implant Positioning */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            3. Implant Positioning
          </label>
          <textarea
            name="implantPosition"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Assess each implant's position: mesiodistal spacing, buccolingual placement, apicocoronal depth, proximity to adjacent teeth/implants (min 1.5mm from adjacent teeth, 3mm between implants)..."
          />
        </div>

        {/* 4. Angulation */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            4. Angulation Analysis
          </label>
          <textarea
            name="angulation"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Assess angulation relative to planned restoration: mesiodistal and buccolingual tilt, restorative-driven placement, screw-access channel trajectory, any need for angulated abutments..."
          />
        </div>

        {/* 5. Anatomical Considerations */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            5. Anatomical Considerations
          </label>
          <textarea
            name="anatomicalConsiderations"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Nerve proximity (IAN, mental nerve, lingual nerve), sinus proximity and membrane integrity, bone quality (D1-D4), ridge morphology, adjacent root proximity, vital structures..."
          />
        </div>

        {/* 6. Prosthetic Considerations */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            6. Prosthetic Considerations
          </label>
          <textarea
            name="prostheticConsiderations"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Emergence profile, restorative space (interocclusal clearance), crown-to-implant ratio, abutment type recommendations, cement vs screw-retained, soft tissue considerations..."
          />
        </div>

        {/* 7. Risk Assessment */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            7. Risk Assessment
          </label>
          <textarea
            name="riskFlags"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Flag any risks: surgical (nerve damage, perforation, bleeding), prosthetic (aesthetic compromise, occlusal overload), patient factors (smoking, bruxism, diabetes, bisphosphonates), short-term and long-term concerns..."
          />
        </div>

        {/* 8. Recommendations */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            8. Recommendations
          </label>
          <textarea
            name="recommendations"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Specific adjustments needed: reposition implant X, reduce angulation, add grafting, change implant diameter/length, alternative treatment approach, additional diagnostics needed (CBCT with different FOV)..."
          />
        </div>

        {/* 9. Overall Feedback & Verdict */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">
            9. Overall Feedback &amp; Verdict <span className="text-red-500">*</span>
          </label>
          <textarea
            name="overallFeedback"
            rows={4}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
            placeholder="Your overall assessment and summary of the treatment plan. This is the key section the submitter will read..."
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
