"use client"

import { useActionState } from "react"
import { redeemToken, type RedeemTokenState } from "@/app/actions/tokens"
import { useRouter } from "next/navigation"

const redeemInitialState: RedeemTokenState = {}

interface CheckoutFormProps {
  caseId: string
  tierLabel: string
  tierPrice: string
  pricePence: number
}

export function CheckoutForm({ caseId, tierLabel, tierPrice }: CheckoutFormProps) {
  const router = useRouter()
  const [redeemState, redeemAction, isRedeeming] = useActionState(redeemToken, redeemInitialState)

  if (redeemState.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-navy font-bold mb-2">
          Token Redeemed!
        </h2>
        <p className="text-muted mb-6">{redeemState.success}</p>
        <button
          onClick={() => router.push(`/cases/${caseId}`)}
          className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
        >
          View My Case
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gold/[0.03]">
        <h2 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold">
          🎟️ Redeem Your Token
        </h2>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-warm-bg rounded-xl mb-6">
          <div>
            <p className="text-sm font-medium text-navy">{tierLabel}</p>
            <p className="text-xs text-muted">Token-covered review</p>
          </div>
          <span className="text-lg font-bold text-navy">{tierPrice}</span>
        </div>

        <p className="text-sm text-muted mb-4">
          Enter the token code provided by Dr. Dandapat to activate your case for review.
        </p>

        <form action={redeemAction} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Token Code
            </label>
            <input
              type="text"
              name="code"
              required
              placeholder="IC-XXXX-XXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono text-navy tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
              autoComplete="off"
            />
          </div>

          {redeemState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{redeemState.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isRedeeming}
            className="w-full px-6 py-4 bg-navy text-white rounded-xl font-semibold text-base hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {isRedeeming ? "Redeeming…" : "Redeem Token"}
          </button>
        </form>
      </div>
    </div>
  )
}
