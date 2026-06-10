"use client"

import { useActionState, useState } from "react"
import { generateTokens, type GenerateTokenState } from "@/app/actions/tokens"

const initialState: GenerateTokenState = {}

const tiers = [
  { value: "BASIC", label: "Basic Check (£95)" },
  { value: "STANDARD", label: "Standard (£199)" },
  { value: "COMPLEX", label: "Complex (£295)" },
  { value: "PILOT_GUIDE", label: "Pilot Guide (£399)" },
]

const batchSizes = [
  { value: 1, label: "1 token" },
  { value: 5, label: "5 tokens" },
  { value: 10, label: "10 tokens" },
  { value: 25, label: "25 tokens" },
  { value: 50, label: "50 tokens" },
]

function downloadCSV(tokens: { code: string; tier: string }[], notes: string) {
  const tierLabels: Record<string, string> = {
    BASIC: "Basic Check (£95)",
    STANDARD: "Standard (£199)",
    COMPLEX: "Complex (£295)",
    PILOT_GUIDE: "Pilot Guide (£399)",
  }

  const header = "Code,Tier,Batch Notes"
  const rows = tokens.map((t) => `${t.code},${tierLabels[t.tier] || t.tier},"${notes}"`)
  const csv = [header, ...rows].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `implantcheck-tokens-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function copyAll(tokens: { code: string }[]) {
  const text = tokens.map((t) => t.code).join("\n")
  await navigator.clipboard.writeText(text)
}

export function GenerateTokenForm() {
  const [state, formAction, isPending] = useActionState(generateTokens, initialState)
  const [copied, setCopied] = useState(false)
  const [batchLabel, setBatchLabel] = useState("")

  async function handleCopy() {
    if (!state.success) return
    await copyAll(state.success.tokens)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Tier */}
          <div className="flex-1 min-w-[180px]">
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

          {/* Batch size */}
          <div className="w-[140px]">
            <label className="block text-sm font-medium text-navy mb-1">Quantity</label>
            <select
              name="count"
              defaultValue="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors bg-white"
            >
              {batchSizes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Batch label */}
          <div className="flex-[2] min-w-[220px]">
            <label className="block text-sm font-medium text-navy mb-1">
              Batch Label <span className="text-muted font-normal">(cohort name)</span>
            </label>
            <input
              type="text"
              name="notes"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder="e.g. Cohort 4 — March 2026"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
            />
          </div>

          {/* Generate button */}
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-50 shrink-0"
          >
            {isPending ? "Generating..." : "Generate Tokens"}
          </button>
        </div>
      </form>

      {/* Success display */}
      {state.success && (
        <div className="mt-4 p-5 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-green-800 font-medium">
                {state.success.count} token{state.success.count !== 1 ? "s" : ""} generated
              </p>
              {batchLabel && (
                <p className="text-xs text-green-700 mt-0.5">Batch: {batchLabel}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-green-300 text-green-800 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy All"}
              </button>
              <button
                onClick={() => downloadCSV(state.success!.tokens, batchLabel)}
                className="px-3 py-1.5 bg-white border border-green-300 text-green-800 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Token code list */}
          <div className="grid gap-1.5 max-h-64 overflow-y-auto">
            {state.success.tokens.map((t, i) => (
              <div
                key={t.code}
                className="flex items-center gap-3 px-3 py-2 bg-white border border-green-100 rounded-lg"
              >
                <span className="text-xs text-muted w-6 text-right shrink-0">{i + 1}.</span>
                <code className="flex-1 text-sm font-mono text-navy font-bold tracking-wider">
                  {t.code}
                </code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(t.code)
                  }}
                  className="text-xs text-gold hover:text-gold-light font-medium shrink-0"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted mt-3">
            Share these codes with your students. Each student redeems one code at checkout instead of paying.
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
