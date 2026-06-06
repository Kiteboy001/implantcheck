import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

export const ourFileRouter = {
  caseFile: f({
    blob: { maxFileSize: "512MB", maxFileCount: 10 },
    image: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: (session.user as any).id as string }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Detect file type from extension
      const ext = file.name.split(".").pop()?.toLowerCase() || ""
      const typeMap: Record<string, string> = {
        stl: "STL", obj: "OBJ", ply: "PLY",
        dcm: "CBCT", dicom: "CBCT",
        png: "SCREENSHOT", jpg: "SCREENSHOT", jpeg: "SCREENSHOT", webp: "SCREENSHOT",
      }
      const detectedType = typeMap[ext] || "OTHER"
      console.log(`Upload: ${file.name} (${detectedType}) by user ${metadata.userId}`)
      return { uploadedBy: metadata.userId, detectedType }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
