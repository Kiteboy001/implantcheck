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
  const overallFeedback = formData.get("overallFeedback") as string
  const implantPosition = formData.get("implantPosition") as string
  const angulation = formData.get("angulation") as string
  const riskFlags = formData.get("riskFlags") as string

  if (!caseId || !decision || !overallFeedback) {
    return { error: "Decision and feedback are required" }
  }

  const userId = (session.user as any).id

  // Create the review
  await prisma.review.create({
    data: {
      caseId,
      reviewerId: userId,
      decision: decision as any,
      overallFeedback,
      implantPosition: implantPosition || null,
      angulation: angulation || null,
      riskFlags: riskFlags || null,
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
