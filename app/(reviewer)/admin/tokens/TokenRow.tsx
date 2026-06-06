"use client"

import { useActionState } from "react"
import { revokeToken, type RevokeTokenState } from "@/app/actions/tokens"

interface TokenData {
  id: string
  code: string
  tier: string
  isUsed: boolean
  usedByName: string | null
  usedCaseId: string | null
  creatorName: string
  notes: string | null
  createdAt: string
}

const revokeInitialState: RevokeTokenState = {}

export function TokenRow({ token }: { token: TokenData }) {
  const [state, formAction, isPending] = useActionState(revokeToken, revokeInitialState)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-warm-bg transition-colors items-center">
      {/* Code */}
      <div className="md:col-span-2">
        <code className="text-sm font-mono text-navy font-bold tracking-wider">
          {token.code}
        </code>
      </div>

      {/* Tier */}
      <div className="md:col-span-2">
        <span className="text-sm text-body">{token.tier}</span>
      </div>

      {/* Status */}
      <div className="md:col-span-1">
        {token.isUsed ? (
          <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-800">
            Redeemed
          </span>
        ) : (
          <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-800">
            Available
          </span>
        )}
      </div>

      {/* Used By */}
      <div className="md:col-span-2">
        {token.usedByName ? (
          <div>
            <p className="text-sm text-body">{token.usedByName}</p>
            {token.usedCaseId && (
              <a
                href={`/admin/cases/${token.usedCaseId}`}
                className="text-xs text-gold hover:underline"
              >
                View case →
              </a>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted italic">—</span>
        )}
      </div>

      {/* Created */}
      <div className="md:col-span-2">
        <p className="text-sm text-body">{token.creatorName}</p>
        <p className="text-xs text-muted">{token.createdAt}</p>
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <span className="text-sm text-muted">
          {token.notes || <span className="italic">—</span>}
        </span>
      </div>

      {/* Revoke */}
      <div className="md:col-span-1">
        {!token.isUsed && (
          <form action={formAction}>
            <input type="hidden" name="tokenId" value={token.id} />
            <button
              type="submit"
              disabled={isPending}
              className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {isPending ? "Revoking…" : "Revoke"}
            </button>
          </form>
        )}
        {state.error && (
          <p className="text-xs text-red-600 mt-1">{state.error}</p>
        )}
      </div>
    </div>
  )
}
