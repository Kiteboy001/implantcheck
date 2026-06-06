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

  const caseRecord = await prisma.case.create({
    data: {
      submitterId: userId,
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

  return { success: caseRecord.id }
}
