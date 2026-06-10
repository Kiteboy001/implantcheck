import { prisma } from "@/lib/prisma"
import NewCaseForm from "./NewCaseForm"

const VALID_TIERS = ["BASIC", "STANDARD", "COMPLEX", "PILOT_GUIDE"]

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier } = await searchParams
  const initialTier = tier && VALID_TIERS.includes(tier.toUpperCase()) ? tier.toUpperCase() : undefined

  // Fetch available reviewers for the selection dropdown
  const reviewers = await prisma.user.findMany({
    where: { role: { in: ["REVIEWER", "ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { assignedCases: { where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } } } },
    },
    orderBy: { name: "asc" },
  })

  const reviewersWithWorkload = reviewers.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    activeCases: r._count.assignedCases,
  }))

  return <NewCaseForm reviewers={reviewersWithWorkload} initialTier={initialTier} />
}
