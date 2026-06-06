"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ── Types ─────────────────────────────────────────────────────

export type GenerateTokenState = { error?: string; success?: { code: string; tier: string } }

export type RedeemTokenState = { error?: string; success?: string }

// ── Generate token (admin only) ───────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I/O/0/1 for readability
  const segments = [4, 4] // e.g. "IC-A7B3-X9K2"
  const parts: string[] = ["IC"]

  for (const len of segments) {
    let seg = ""
    for (let i = 0; i < len; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
    }
    parts.push(seg)
  }

  return parts.join("-")
}

export async function generateToken(
  prevState: GenerateTokenState,
  formData: FormData
): Promise<GenerateTokenState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const role = (session.user as any).role
  if (role !== "ADMIN") return { error: "Only admins can generate tokens" }

  const tier = formData.get("tier") as string
  const notes = (formData.get("notes") as string) || null

  const validTiers = ["BASIC", "STANDARD", "COMPLEX", "PILOT_GUIDE"]
  if (!validTiers.includes(tier)) return { error: "Invalid tier selected" }

  // Generate unique code with collision retry
  let code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const existing = await prisma.token.findUnique({ where: { code } })
    if (!existing) break
    code = generateCode()
    attempts++
  }
  if (attempts >= 5) return { error: "Could not generate a unique code — please try again" }

  const token = await prisma.token.create({
    data: {
      code,
      tier: tier as any,
      createdById: (session.user as any).id,
      notes,
    },
  })

  revalidatePath("/admin/tokens")

  return { success: { code: token.code, tier: token.tier } }
}

// ── Redeem token (submitters) ─────────────────────────────────

export async function redeemToken(
  prevState: RedeemTokenState,
  formData: FormData
): Promise<RedeemTokenState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const code = (formData.get("code") as string)?.trim().toUpperCase()
  const caseId = formData.get("caseId") as string

  if (!code || !caseId) return { error: "Token code and case ID are required" }

  // Find token
  const token = await prisma.token.findUnique({ where: { code } })
  if (!token) return { error: "Invalid token code" }
  if (token.isUsed) return { error: "This token has already been used" }

  // Find case
  const c = await prisma.case.findUnique({ where: { id: caseId } })
  if (!c) return { error: "Case not found" }
  if (c.submitterId !== (session.user as any).id) return { error: "This is not your case" }
  if (c.paymentStatus !== "UNPAID") return { error: "This case is already paid" }

  // Token tier must match case tier
  if (token.tier !== c.tier) {
    const tierLabels: Record<string, string> = {
      BASIC: "Basic Check (£95)",
      STANDARD: "Standard (£199)",
      COMPLEX: "Complex (£295)",
      PILOT_GUIDE: "Pilot Guide (£399)",
    }
    return { error: `This token is for ${tierLabels[token.tier] || token.tier}, but your case is ${tierLabels[c.tier] || c.tier}` }
  }

  // Redeem
  await prisma.token.update({
    where: { id: token.id },
    data: {
      isUsed: true,
      usedById: (session.user as any).id,
      usedCaseId: caseId,
      usedAt: new Date(),
    },
  })

  await prisma.case.update({
    where: { id: caseId },
    data: { paymentStatus: "TOKEN_REDEEMED" },
  })

  revalidatePath(`/cases/${caseId}`)
  revalidatePath("/admin/tokens")

  return { success: "Token redeemed successfully! Your case is now in the review queue." }
}

// ── Revoke token (admin only) ──────────────────────────────────

export type RevokeTokenState = { error?: string; success?: string }

export async function revokeToken(
  prevState: RevokeTokenState,
  formData: FormData
): Promise<RevokeTokenState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const role = (session.user as any).role
  if (role !== "ADMIN") return { error: "Only admins can revoke tokens" }

  const tokenId = formData.get("tokenId") as string
  if (!tokenId) return { error: "Token ID is required" }

  const token = await prisma.token.findUnique({ where: { id: tokenId } })
  if (!token) return { error: "Token not found" }
  if (token.isUsed) return { error: "Cannot revoke a token that has already been used" }

  await prisma.token.delete({ where: { id: tokenId } })

  revalidatePath("/admin/tokens")

  return { success: "Token revoked" }
}
