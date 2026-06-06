"use server"

import { put } from "@vercel/blob"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

const MAX_FILE_SIZE = 512 * 1024 * 1024 // 512MB

export async function uploadFile(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  if (file.size > MAX_FILE_SIZE) {
    return { error: `File too large. Maximum size is 512MB.` }
  }

  // Detect file type from extension
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const allowedExts = ["stl", "obj", "ply", "dcm", "dicom", "png", "jpg", "jpeg", "webp"]
  if (!allowedExts.includes(ext)) {
    return { error: `Unsupported file type: .${ext}` }
  }

  try {
    const blob = await put(`cases/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: false,
      storeId: process.env.BLOB2_STORE_ID,
    })

    const typeMap: Record<string, string> = {
      stl: "STL", obj: "OBJ", ply: "PLY",
      dcm: "CBCT", dicom: "CBCT",
      png: "SCREENSHOT", jpg: "SCREENSHOT", jpeg: "SCREENSHOT", webp: "SCREENSHOT",
    }

    return {
      success: true,
      file: {
        url: blob.url,
        name: file.name,
        size: file.size,
        type: typeMap[ext] || "OTHER",
      },
    }
  } catch (err: any) {
    return { error: err.message || "Upload failed" }
  }
}
