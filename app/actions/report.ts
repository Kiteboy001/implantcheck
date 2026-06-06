"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { resend, FROM_EMAIL } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type ReportState = { error?: string; success?: string }

function buildReportHtml(data: {
  caseRef: string
  submitterName: string
  submitterEmail: string
  tier: string
  software: string
  submittedDate: string
  reviewerName: string
  reviewDate: string
  decision: string
  implantPosition?: string | null
  angulation?: string | null
  riskFlags?: string | null
  overallFeedback: string
}): string {
  const decisionColor =
    data.decision === "APPROVED" ? "#16a34a" :
    data.decision === "NEEDS_REVISION" ? "#dc2626" : "#6b7280"

  const decisionLabel =
    data.decision === "APPROVED" ? "APPROVED" :
    data.decision === "NEEDS_REVISION" ? "NEEDS REVISION" : "REJECTED"

  const tierPricing: Record<string, string> = {
    BASIC: "£95", STANDARD: "£199", COMPLEX: "£295", PILOT_GUIDE: "£399",
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Inter', -apple-system, sans-serif; background: #FBF8F2; padding: 40px; margin: 0;">
<div style="max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

  <!-- Header -->
  <div style="background: #001B3D; padding: 32px; text-align: center;">
    <h1 style="color: #A6893B; font-family: Georgia, serif; font-size: 24px; margin: 0 0 4px;">IMPLANT<span style="color: #fff;">CHECK</span></h1>
    <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0;">Treatment Plan Review Report</p>
  </div>

  <!-- Meta -->
  <div style="padding: 24px 32px; border-bottom: 1px solid #f3f4f6;">
    <table style="width: 100%; font-size: 13px; color: #4B5563;">
      <tr>
        <td style="padding: 4px 0; color: #6B7280;">Case Reference</td>
        <td style="padding: 4px 0; font-weight: 600; color: #001B3D;">#${data.caseRef}</td>
        <td style="padding: 4px 0; color: #6B7280;">Date</td>
        <td style="padding: 4px 0;">${data.submittedDate}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7280;">Submitter</td>
        <td style="padding: 4px 0;">${data.submitterName}</td>
        <td style="padding: 4px 0; color: #6B7280;">Tier</td>
        <td style="padding: 4px 0;">${data.tier} (${tierPricing[data.tier] || ""})</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7280;">Software</td>
        <td style="padding: 4px 0;">${data.software}</td>
        <td style="padding: 4px 0; color: #6B7280;">Reviewer</td>
        <td style="padding: 4px 0;">${data.reviewerName}</td>
      </tr>
    </table>
  </div>

  <!-- Decision badge -->
  <div style="padding: 24px 32px; text-align: center;">
    <span style="display: inline-block; background: ${decisionColor}15; color: ${decisionColor}; font-size: 14px; font-weight: 700; padding: 8px 20px; border-radius: 20px; border: 1px solid ${decisionColor}30;">
      ${decisionLabel}
    </span>
  </div>

  <!-- Sections -->
  <div style="padding: 0 32px 24px;">

    ${data.implantPosition ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #001B3D; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">1. Implant Positioning</h3>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.implantPosition}</p>
    </div>` : ""}

    ${data.angulation ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #001B3D; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">2. Angulation</h3>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.angulation}</p>
    </div>` : ""}

    ${data.riskFlags ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #001B3D; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">3. Risk Assessment</h3>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.riskFlags}</p>
    </div>` : ""}

    <div style="margin-bottom: 20px;">
      <h3 style="color: #001B3D; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">4. Overall Feedback</h3>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.overallFeedback}</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #FBF8F2; padding: 24px 32px; border-top: 1px solid #f3f4f6;">
    <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px;">
      Reviewed by <strong style="color: #001B3D;">${data.reviewerName}</strong> on ${data.reviewDate}
    </p>
    <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
      ImplantCheck — Plan Better. Place Better. | ADIMPLANT.COM LTD
    </p>
  </div>
</div>
</body>
</html>`
}

export async function emailReport(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const reviewId = formData.get("reviewId") as string
  if (!reviewId) return { error: "Review ID is required" }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      case: {
        include: {
          submitter: { select: { name: true, email: true } },
        },
      },
      reviewer: { select: { name: true, email: true } },
    },
  })

  if (!review) return { error: "Review not found" }

  const caseData = review.case
  const tierLabels: Record<string, string> = {
    BASIC: "Basic Check", STANDARD: "Standard", COMPLEX: "Complex", PILOT_GUIDE: "Pilot Guide",
  }

  const html = buildReportHtml({
    caseRef: caseData.id.slice(0, 8).toUpperCase(),
    submitterName: caseData.submitter.name || caseData.submitter.email,
    submitterEmail: caseData.submitter.email,
    tier: tierLabels[caseData.tier] || caseData.tier,
    software: caseData.softwareUsed || "Not specified",
    submittedDate: new Date(caseData.createdAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    }),
    reviewerName: review.reviewer.name || review.reviewer.email,
    reviewDate: new Date(review.createdAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    }),
    decision: review.decision,
    implantPosition: review.implantPosition,
    angulation: review.angulation,
    riskFlags: review.riskFlags,
    overallFeedback: review.overallFeedback,
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: caseData.submitter.email,
      replyTo: review.reviewer.email,
      subject: `ImplantCheck Review — ${review.decision === "APPROVED" ? "Approved" : review.decision === "NEEDS_REVISION" ? "Needs Revision" : "Rejected"} (#${caseData.id.slice(0, 8)})`,
      html,
    })

    revalidatePath(`/admin/cases/${caseData.id}`)
    return { success: "Report emailed to submitter" }
  } catch (err: any) {
    return { error: err.message || "Failed to send email" }
  }
}
