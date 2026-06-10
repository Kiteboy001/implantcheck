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
  const reportText = formData.get("reportText") as string

  if (!caseId || !decision || !reportText || reportText.trim().length === 0) {
    return { error: "Decision and review report are required" }
  }

  const userId = (session.user as any).id

  // Create the review — store the full report in overallFeedback
  await prisma.review.create({
    data: {
      caseId,
      reviewerId: userId,
      decision: decision as any,
      overallFeedback: reportText.trim(),
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
