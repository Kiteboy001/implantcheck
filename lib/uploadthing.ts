import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

export const ourFileRouter = {
  caseFile: f({
    "application/octet-stream": { maxFileSize: "256MB", maxFileCount: 10 },
    "application/dicom": { maxFileSize: "512MB", maxFileCount: 5 },
    "image/png": { maxFileSize: "16MB", maxFileCount: 10 },
    "image/jpeg": { maxFileSize: "16MB", maxFileCount: 10 },
    "image/webp": { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: (session.user as any).id as string }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.name, "by user", metadata.userId)
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
