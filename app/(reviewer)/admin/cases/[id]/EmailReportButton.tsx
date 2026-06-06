"use client"

import { useActionState } from "react"
import { emailReport, type ReportState } from "@/app/actions/report"

const initialState: ReportState = {}

export function EmailReportButton({ reviewId }: { reviewId: string }) {
  const [state, formAction, isPending] = useActionState(emailReport, initialState)

  if (state.success) {
    return (
      <p className="text-sm text-green-600 font-medium text-center py-2">
        ✓ {state.success}
      </p>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="reviewId" value={reviewId} />
      {state.error && (
        <p className="text-sm text-red-600 mb-2">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full text-center px-4 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
      >
        {isPending ? "Sending..." : "📧 Email Report to Submitter"}
      </button>
    </form>
  )
}
