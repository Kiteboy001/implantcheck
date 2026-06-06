import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { GenerateTokenForm } from "./GenerateTokenForm"
import { TokenRow } from "./TokenRow"

const tierLabels: Record<string, string> = {
  BASIC: "Basic Check (£95)",
  STANDARD: "Standard (£199)",
  COMPLEX: "Complex (£295)",
  PILOT_GUIDE: "Pilot Guide (£399)",
}

export default async function AdminTokensPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/admin")

  const tokens = await prisma.token.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true, email: true } },
      usedBy: { select: { name: true, email: true } },
      usedCase: { select: { id: true } },
    },
  })

  const unusedCount = tokens.filter((t) => !t.isUsed).length
  const usedCount = tokens.filter((t) => t.isUsed).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-garamond)] text-3xl text-navy font-bold mb-1">
            Token Management
          </h1>
          <p className="text-muted">
            {tokens.length} total · {unusedCount} unused · {usedCount} redeemed
          </p>
        </div>
      </div>

      {/* Generate new token */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold mb-4">
          Generate New Token
        </h2>
        <GenerateTokenForm />
      </div>

      {/* Token list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold">
            All Tokens
          </h2>
        </div>

        {tokens.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted">No tokens generated yet.</p>
            <p className="text-sm text-muted/60 mt-1">
              Generate your first token above to distribute to students.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-warm-bg border-b border-gray-100 text-xs font-semibold text-muted uppercase tracking-wider">
              <div className="col-span-2">Code</div>
              <div className="col-span-2">Tier</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Used By</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Notes</div>
              <div className="col-span-1"></div>
            </div>

            {/* Token rows */}
            <div className="divide-y divide-gray-50">
              {tokens.map((token) => (
                <TokenRow
                  key={token.id}
                  token={{
                    id: token.id,
                    code: token.code,
                    tier: tierLabels[token.tier] || token.tier,
                    isUsed: token.isUsed,
                    usedByName: token.usedBy?.name || token.usedBy?.email || null,
                    usedCaseId: token.usedCase?.id || null,
                    creatorName: token.createdBy.name || token.createdBy.email,
                    notes: token.notes,
                    createdAt: new Date(token.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
