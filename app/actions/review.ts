"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type ReviewState = { error?: string; success?: boolean }

export async function submitReview(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const caseId = formData.get("caseId") as string
  const decision = formData.get("decision") as string
  const caseSummary = (formData.get("caseSummary") as string) || null
  const sacClassification = (formData.get("sacClassification") as string) || null
  const implantPosition = (formData.get("implantPosition") as string) || null
  const angulation = (formData.get("angulation") as string) || null
  const anatomicalConsiderations = (formData.get("anatomicalConsiderations") as string) || null
  const prostheticConsiderations = (formData.get("prostheticConsiderations") as string) || null
  const riskFlags = (formData.get("riskFlags") as string) || null
  const recommendations = (formData.get("recommendations") as string) || null
  const overallFeedback = formData.get("overallFeedback") as string

  if (!caseId || !decision || !overallFeedback) {
    return { error: "Decision and overall feedback are required" }
  }

  const userId = (session.user as any).id

  // Create the review
  await prisma.review.create({
    data: {
      caseId,
      reviewerId: userId,
      decision: decision as any,
      caseSummary,
      sacClassification,
      implantPosition,
      angulation,
      anatomicalConsiderations,
      prostheticConsiderations,
      riskFlags,
      recommendations,
      overallFeedback,
    },
  })

  // Update case status based on decision
  const newStatus =
    decision === "APPROVED"
      ? "APPROVED"
      : decision === "NEEDS_REVISION"
      ? "NEEDS_REVISION"
      : "REJECTED"

  await prisma.case.update({
    where: { id: caseId },
    data: { status: newStatus },
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath("/admin/cases")
  revalidatePath("/admin")

  return { success: true }
}
