"use client"

import { useActionState, useState } from "react"
import { redeemToken, type RedeemTokenState } from "@/app/actions/tokens"
import { useRouter } from "next/navigation"

const redeemInitialState: RedeemTokenState = {}

interface CheckoutFormProps {
  caseId: string
  tierLabel: string
  tierPrice: string
  pricePence: number
}

export function CheckoutForm({ caseId, tierLabel, tierPrice, pricePence }: CheckoutFormProps) {
  const router = useRouter()
  const [tab, setTab] = useState<"card" | "token">("card")
  const [redeemState, redeemAction, isRedeeming] = useActionState(redeemToken, redeemInitialState)
  const [isStripeLoading, setIsStripeLoading] = useState(false)

  async function handleStripeCheckout() {
    setIsStripeLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, pricePence, tierLabel }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to start checkout")
      }
    } catch (e: any) {
      alert(e.message || "Something went wrong")
    } finally {
      setIsStripeLoading(false)
    }
  }

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
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab("card")}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
            tab === "card"
              ? "text-navy border-b-2 border-gold bg-gold/[0.03]"
              : "text-muted hover:text-body"
          }`}
        >
          💳 Pay with Card
        </button>
        <button
          onClick={() => setTab("token")}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
            tab === "token"
              ? "text-navy border-b-2 border-gold bg-gold/[0.03]"
              : "text-muted hover:text-body"
          }`}
        >
          🎟️ Redeem a Token
        </button>
      </div>

      {/* Card tab */}
      {tab === "card" && (
        <div className="p-6">
          <p className="text-sm text-muted mb-4">
            You will be redirected to Stripe to complete your payment securely.
          </p>
          <div className="flex items-center justify-between p-4 bg-warm-bg rounded-xl mb-4">
            <div>
              <p className="text-sm font-medium text-navy">{tierLabel}</p>
              <p className="text-xs text-muted">One-time payment</p>
            </div>
            <span className="text-lg font-bold text-navy">{tierPrice}</span>
          </div>
          <button
            onClick={handleStripeCheckout}
            disabled={isStripeLoading}
            className="w-full px-6 py-4 bg-navy text-white rounded-xl font-semibold text-base hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {isStripeLoading ? "Redirecting to Stripe..." : `Pay ${tierPrice} with Card`}
          </button>
          <p className="text-xs text-muted/60 text-center mt-3">
            Secured by Stripe. We do not store your card details.
          </p>
        </div>
      )}

      {/* Token tab */}
      {tab === "token" && (
        <div className="p-6">
          <p className="text-sm text-muted mb-4">
            Enter the token code provided by your course administrator to redeem your free review.
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
              className="w-full px-6 py-4 bg-gold text-white rounded-xl font-semibold text-base hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isRedeeming ? "Redeeming…" : "Redeem Token"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
