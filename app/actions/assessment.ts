"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { AssessmentState } from "@/app/actions/assessment-types"

// ── Save assessment (upsert — create or update) ─────────────────

export async function saveAssessment(
  prevState: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const caseId = formData.get("caseId") as string
  if (!caseId) return { error: "Missing case ID" }

  // Verify ownership
  const c = await prisma.case.findUnique({ where: { id: caseId } })
  if (!c) return { error: "Case not found" }
  if (c.submitterId !== (session.user as any).id) {
    return { error: "Not your case" }
  }

  // Parse numeric fields safely
  const pInt = (key: string) => {
    const v = formData.get(key) as string
    if (!v) return undefined
    const n = parseInt(v, 10)
    return isNaN(n) ? undefined : n
  }
  const pFloat = (key: string) => {
    const v = formData.get(key) as string
    if (!v) return undefined
    const n = parseFloat(v)
    return isNaN(n) ? undefined : n
  }
  const pBool = (key: string) => {
    const v = formData.get(key) as string
    if (v === "true") return true
    if (v === "false") return false
    return undefined
  }
  const pStr = (key: string) => {
    const v = formData.get(key) as string
    return v?.trim() || undefined
  }

  const data = {
    // Section 1: Patient & History
    complaint: pStr("complaint"),
    dentalHistory: pStr("dentalHistory"),
    medicallyFit: pBool("medicallyFit"),
    complicatingFactors: pBool("complicatingFactors"),
    smoker: pBool("smoker"),
    cigarettesPerDay: pInt("cigarettesPerDay"),
    alcoholUnitsPerWeek: pInt("alcoholUnitsPerWeek"),
    asaGrade: pInt("asaGrade"),
    relevantHistory: pStr("relevantHistory"),

    // Section 2: Examination
    extraOralTmj: pBool("extraOralTmj"),
    extraOralLymph: pBool("extraOralLymph"),
    extraOralSoft: pBool("extraOralSoft"),
    extraOralSkin: pBool("extraOralSkin"),
    intraOralFom: pBool("intraOralFom"),
    intraOralPalate: pBool("intraOralPalate"),
    intraOralTongue: pBool("intraOralTongue"),
    intraOralSulcus: pBool("intraOralSulcus"),
    bpeSextant1: pInt("bpeSextant1"),
    bpeSextant2: pInt("bpeSextant2"),
    bpeSextant3: pInt("bpeSextant3"),
    bpeSextant4: pInt("bpeSextant4"),
    bpeSextant5: pInt("bpeSextant5"),
    bpeSextant6: pInt("bpeSextant6"),
    oralHygiene: pStr("oralHygiene"),
    occlusionDetails: pStr("occlusionDetails"),
    interArchSpace: pStr("interArchSpace"),
    specialTestsXrays: pStr("specialTestsXrays"),
    diagnosis1: pStr("diagnosis1"),
    diagnosis2: pStr("diagnosis2"),
    diagnosis3: pStr("diagnosis3"),
    discussedAlt: pStr("discussedAlt"),
    reportGiven: pBool("reportGiven"),
    preOpInstructions: pBool("preOpInstructions"),

    // Section 3: Planning
    interarchDistance: pFloat("interarchDistance"),
    interdentalSpace: pFloat("interdentalSpace"),
    biotype: pStr("biotype"),
    papillae: pStr("papillae"),
    complicatingAnatomy: pStr("complicatingAnatomy"),
    anglesClass: pStr("anglesClass"),
    overbite: pFloat("overbite"),
    overjet: pFloat("overjet"),
    guidanceRight: pStr("guidanceRight"),
    guidanceLeft: pStr("guidanceLeft"),
    ovdFreewaySpace: pStr("ovdFreewaySpace"),
    cbctFindings: pStr("cbctFindings"),
    phase1Stabilisation: pStr("phase1Stabilisation"),
    phase2MediumTerm: pStr("phase2MediumTerm"),
    phase3LongTerm: pStr("phase3LongTerm"),
    implantPlanning: pStr("implantPlanning"),
    graftMaterial: pStr("graftMaterial"),
    ridgeDeficiencyType: pStr("ridgeDeficiencyType"),
  }

  try {
    await prisma.assessment.upsert({
      where: { caseId },
      create: { caseId, ...data },
      update: data,
    })

    revalidatePath(`/cases/${caseId}`)
    revalidatePath("/dashboard")

    return { success: caseId }
  } catch (err: any) {
    console.error("Assessment save error:", err)
    return { error: "Failed to save assessment. Please try again." }
  }
}
