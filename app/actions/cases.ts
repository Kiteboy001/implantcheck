"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type SubmitCaseState = { error?: string; success?: string }

export async function submitCase(
  prevState: SubmitCaseState,
  formData: FormData
): Promise<SubmitCaseState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const tier = formData.get("tier") as string
  const reviewerId = (formData.get("reviewerId") as string) || null
  const treatmentNotes = formData.get("treatmentNotes") as string
  const patientContext = formData.get("patientContext") as string
  let softwareUsed = (formData.get("softwareUsed") as string) || null
  // If "Other (specify)" selected, use the custom value instead
  if (softwareUsed === "_other") {
    const custom = (formData.get("softwareUsedCustom") as string) || null
    softwareUsed = custom || "Other (unspecified)"
  }

  // Parse uploaded file data (JSON string from UploadThing)
  const filesJson = formData.get("files") as string
  let files: { url: string; name: string; size: number; type: string }[] = []
  try {
    files = filesJson ? JSON.parse(filesJson) : []
  } catch {
    return { error: "Invalid file data" }
  }

  if (!tier || !treatmentNotes) {
    return { error: "Tier and treatment notes are required" }
  }

  if (files.length === 0) {
    return { error: "Please upload at least one file (STL, CBCT, or screenshot)" }
  }

  const tierValues = ["BASIC", "STANDARD", "COMPLEX", "PILOT_GUIDE"]
  if (!tierValues.includes(tier)) {
    return { error: "Invalid tier selected" }
  }

  const userId = (session.user as any).id

  const fileTypeMap: Record<string, string> = {
    "application/octet-stream": "STL",
    "application/dicom": "CBCT",
    "image/png": "SCREENSHOT",
    "image/jpeg": "SCREENSHOT",
    "image/webp": "SCREENSHOT",
    "model/stl": "STL",
    "model/obj": "OBJ",
    "model/ply": "PLY",
    "application/sla": "STL",
  }

  // If reviewer selected, start in UNDER_REVIEW; otherwise PENDING
  const initialStatus = reviewerId ? "UNDER_REVIEW" : "PENDING"

  const caseRecord = await prisma.case.create({
    data: {
      submitterId: userId,
      reviewerId: reviewerId || undefined,
      status: initialStatus as any,
      tier: tier as any,
      treatmentNotes,
      patientContext: patientContext || null,
      softwareUsed: softwareUsed || null,
      files: {
        create: files.map((f) => ({
          fileUrl: f.url,
          fileName: f.name,
          fileType: (fileTypeMap[f.type] || "OTHER") as any,
          fileSize: f.size,
        })),
      },
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/admin/cases")
  revalidatePath("/admin")

  // Save BCDIS assessment data if provided
  const assessmentFields = ["complaint","dentalHistory","medicallyFit","complicatingFactors","smoker","cigarettesPerDay","alcoholUnitsPerWeek","asaGrade","relevantHistory","extraOralTmj","extraOralLymph","extraOralSoft","extraOralSkin","intraOralFom","intraOralPalate","intraOralTongue","intraOralSulcus","bpeSextant1","bpeSextant2","bpeSextant3","bpeSextant4","bpeSextant5","bpeSextant6","oralHygiene","occlusionDetails","interArchSpace","specialTestsXrays","diagnosis1","diagnosis2","diagnosis3","discussedAlt","reportGiven","preOpInstructions","interarchDistance","interdentalSpace","biotype","papillae","complicatingAnatomy","anglesClass","overbite","overjet","guidanceRight","guidanceLeft","ovdFreewaySpace","cbctFindings","phase1Stabilisation","phase2MediumTerm","phase3LongTerm","implantPlanning","graftMaterial","ridgeDeficiencyType"]
  const hasAssessment = assessmentFields.some((f) => {
    const v = formData.get(f)
    return v && String(v).trim() !== "" && String(v) !== "undefined"
  })
  if (hasAssessment) {
    const pStr = (k: string) => { const v = formData.get(k) as string; return v?.trim() || undefined }
    const pInt = (k: string) => { const v = formData.get(k) as string; if (!v) return undefined; const n = parseInt(v, 10); return isNaN(n) ? undefined : n }
    const pFloat = (k: string) => { const v = formData.get(k) as string; if (!v) return undefined; const n = parseFloat(v); return isNaN(n) ? undefined : n }
    const pBool = (k: string) => { const v = formData.get(k) as string; if (v === "true") return true; if (v === "false") return false; return undefined }
    await prisma.assessment.create({
      data: {
        caseId: caseRecord.id,
        complaint: pStr("complaint"), dentalHistory: pStr("dentalHistory"),
        medicallyFit: pBool("medicallyFit"), complicatingFactors: pBool("complicatingFactors"),
        smoker: pBool("smoker"), cigarettesPerDay: pInt("cigarettesPerDay"),
        alcoholUnitsPerWeek: pInt("alcoholUnitsPerWeek"), asaGrade: pInt("asaGrade"),
        relevantHistory: pStr("relevantHistory"),
        extraOralTmj: pBool("extraOralTmj"), extraOralLymph: pBool("extraOralLymph"),
        extraOralSoft: pBool("extraOralSoft"), extraOralSkin: pBool("extraOralSkin"),
        intraOralFom: pBool("intraOralFom"), intraOralPalate: pBool("intraOralPalate"),
        intraOralTongue: pBool("intraOralTongue"), intraOralSulcus: pBool("intraOralSulcus"),
        bpeSextant1: pInt("bpeSextant1"), bpeSextant2: pInt("bpeSextant2"),
        bpeSextant3: pInt("bpeSextant3"), bpeSextant4: pInt("bpeSextant4"),
        bpeSextant5: pInt("bpeSextant5"), bpeSextant6: pInt("bpeSextant6"),
        oralHygiene: pStr("oralHygiene"), occlusionDetails: pStr("occlusionDetails"),
        interArchSpace: pStr("interArchSpace"), specialTestsXrays: pStr("specialTestsXrays"),
        diagnosis1: pStr("diagnosis1"), diagnosis2: pStr("diagnosis2"), diagnosis3: pStr("diagnosis3"),
        discussedAlt: pStr("discussedAlt"), reportGiven: pBool("reportGiven"),
        preOpInstructions: pBool("preOpInstructions"),
        interarchDistance: pFloat("interarchDistance"), interdentalSpace: pFloat("interdentalSpace"),
        biotype: pStr("biotype"), papillae: pStr("papillae"),
        complicatingAnatomy: pStr("complicatingAnatomy"), anglesClass: pStr("anglesClass"),
        overbite: pFloat("overbite"), overjet: pFloat("overjet"),
        guidanceRight: pStr("guidanceRight"), guidanceLeft: pStr("guidanceLeft"),
        ovdFreewaySpace: pStr("ovdFreewaySpace"), cbctFindings: pStr("cbctFindings"),
        phase1Stabilisation: pStr("phase1Stabilisation"), phase2MediumTerm: pStr("phase2MediumTerm"),
        phase3LongTerm: pStr("phase3LongTerm"), implantPlanning: pStr("implantPlanning"),
        graftMaterial: pStr("graftMaterial"), ridgeDeficiencyType: pStr("ridgeDeficiencyType"),
      },
    })
  }

  return { success: caseRecord.id }
}
