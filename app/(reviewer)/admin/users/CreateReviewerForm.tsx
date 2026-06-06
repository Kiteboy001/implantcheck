"use client"

import { useActionState, useState } from "react"
import { createReviewer, type ManageUserState } from "@/app/actions/users"

const initialState: ManageUserState = {}

export function CreateReviewerForm({ existingReviewers }: { existingReviewers: { id: string; name: string | null; email: string }[] }) {
  const [state, formAction, isPending] = useActionState(createReviewer, initialState)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Reviewers ({existingReviewers.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-gold hover:text-gold-light font-medium"
        >
          {showForm ? "Cancel" : "+ Add Reviewer"}
        </button>
      </div>

      {existingReviewers.length > 0 && (
        <div className="space-y-2 mb-4">
          {existingReviewers.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-2 bg-warm-bg rounded-lg">
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold text-xs font-bold">
                {(r.name || r.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{r.name || r.email}</p>
                <p className="text-xs text-muted">{r.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form action={formAction} className="space-y-3 p-4 bg-warm-bg rounded-lg border border-gray-200">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Reviewer Account"}
          </button>
        </form>
      )}

      {existingReviewers.length === 0 && !showForm && (
        <p className="text-sm text-muted">No reviewers added yet. Click "+ Add Reviewer" to create accounts for implant specialists who will help review cases.</p>
      )}
    </div>
  )
}
