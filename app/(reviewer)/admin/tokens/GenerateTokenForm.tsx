"use client"

import { useActionState } from "react"
import { generateToken, type GenerateTokenState } from "@/app/actions/tokens"

const initialState: GenerateTokenState = {}

const tiers = [
  { value: "BASIC", label: "Basic Check (£95)" },
  { value: "STANDARD", label: "Standard (£199)" },
  { value: "COMPLEX", label: "Complex (£295)" },
  { value: "PILOT_GUIDE", label: "Pilot Guide (£399)" },
]

export function GenerateTokenForm() {
  const [state, formAction, isPending] = useActionState(generateToken, initialState)

  return (
    <div>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-navy mb-1">Tier</label>
          <select
            name="tier"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors bg-white"
          >
            <option value="">Select tier…</option>
            {tiers.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-[2] min-w-[250px]">
          <label className="block text-sm font-medium text-navy mb-1">
            Notes <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="notes"
            placeholder="e.g. Cohort 3 student token"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Generating..." : "Generate Token"}
        </button>
      </form>

      {state.success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-800 font-medium mb-2">Token generated!</p>
          <div className="flex items-center gap-3">
            <code className="px-3 py-1.5 bg-white border border-green-200 rounded-lg text-lg font-mono text-navy font-bold tracking-wider">
              {state.success.code}
            </code>
            <span className="text-sm text-green-700">{state.success.tier}</span>
          </div>
          <p className="text-xs text-muted mt-2">
            Copy this code and share it with your student. They can use it at checkout instead of paying.
          </p>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}
    </div>
  )
}
