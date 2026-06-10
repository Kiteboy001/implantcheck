"use server"

// Lightweight validation — actual upload happens client-side via @vercel/blob/client
// This just validates the completed upload metadata before storing

import { auth } from "@/auth"
import { redirect } from "next/navigation"

const ALLOWED_EXTS = ["stl", "obj", "ply", "dcm", "dicom", "png", "jpg", "jpeg", "webp", "bsb"]
const MAX_FILE_SIZE = 512 * 1024 * 1024 // 512MB

export type UploadedFileMeta = {
  url: string
  name: string
  size: number
  type: string
}

export async function validateUpload(file: UploadedFileMeta) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  if (!ALLOWED_EXTS.includes(ext)) {
    return { error: `Unsupported file type: .${ext}` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: `File too large. Maximum size is 512MB.` }
  }

  const typeMap: Record<string, string> = {
    stl: "STL", obj: "OBJ", ply: "PLY",
    dcm: "CBCT", dicom: "CBCT",
    png: "SCREENSHOT", jpg: "SCREENSHOT", jpeg: "SCREENSHOT", webp: "SCREENSHOT",
  }

  return {
    success: true,
    file: {
      url: file.url,
      name: file.name,
      size: file.size,
      type: typeMap[ext] || "OTHER",
    },
  }
}
