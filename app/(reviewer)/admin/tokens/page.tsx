import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { GenerateTokenForm } from "./GenerateTokenForm"
import { TokenRow } from "./TokenRow"
import { CopyBatchButton } from "./CopyBatchButton"

const tierLabels: Record<string, string> = {
  BASIC: "Basic Check (£95)",
  STANDARD: "Standard (£199)",
  COMPLEX: "Complex (£295)",
  PILOT_GUIDE: "Pilot Guide (£399)",
}

// Group tokens by batch for cohort-style display
function groupByBatch(tokens: any[]) {
  const batches = new Map<string, { tokens: any[]; notes: string | null; createdAt: Date }>()

  for (const t of tokens) {
    const key = t.batchId || t.id // unbatched tokens get their own group
    if (!batches.has(key)) {
      batches.set(key, { tokens: [], notes: t.notes, createdAt: t.createdAt })
    }
    batches.get(key)!.tokens.push(t)
  }

  return Array.from(batches.entries()).map(([batchId, group]) => ({
    batchId,
    ...group,
    usedCount: group.tokens.filter((t: any) => t.isUsed).length,
    totalCount: group.tokens.length,
  }))
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
  const batches = groupByBatch(tokens)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-1">
            Token Management
          </h1>
          <p className="text-muted">
            {tokens.length} total · {unusedCount} unused · {usedCount} redeemed · {batches.length} batch{batches.length !== 1 ? "es" : ""}
          </p>
        </div>
      </div>

      {/* Generate new tokens */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
          Generate Tokens
        </h2>
        <GenerateTokenForm />
      </div>

      {/* Token batches */}
      <div className="space-y-6">
        {batches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-muted">No tokens generated yet.</p>
            <p className="text-sm text-muted/60 mt-1">
              Generate your first batch above to distribute to students.
            </p>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.batchId} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Batch header */}
              <div className="px-6 py-3 bg-warm-bg border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-[(family-name:var(--font-garamond))] text-sm text-navy font-bold">
                    {batch.notes || "Unlabelled Batch"}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {batch.totalCount} token{batch.totalCount !== 1 ? "s" : ""}
                    {" · "}{batch.usedCount} used · {batch.totalCount - batch.usedCount} available
                    {" · "}
                    {new Date(batch.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Batch quick actions */}
                <div className="flex items-center gap-2">
                  <CopyBatchButton
                  codes={batch.tokens.map((t: any) => t.code)}
                  count={batch.totalCount}
                />
                </div>
              </div>

              {/* Column headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-gray-50/50 border-b border-gray-50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <div className="col-span-3">Code</div>
                <div className="col-span-2">Tier</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Used By</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">Notes</div>
                <div className="col-span-1"></div>
              </div>

              {/* Token rows */}
              <div className="divide-y divide-gray-50">
                {batch.tokens.map((token: any) => (
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
