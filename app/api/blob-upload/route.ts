import { handleUpload } from "@vercel/blob/client"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()

    return NextResponse.json(
      await handleUpload({
        body: json,
        request,
        onBeforeGenerateToken: async (pathname: string) => {
          return {
            allowedContentTypes: [
              "application/octet-stream",
              "application/sla",
              "model/stl",
              "model/obj",
              "model/ply",
              "application/dicom",
              "image/png",
              "image/jpeg",
              "image/webp",
            ],
            maximumSizeInBytes: 512 * 1024 * 1024, // 512MB
            tokenPayload: JSON.stringify({ userId: (session.user as any).id }),
          }
        },
        onUploadCompleted: async ({ blob }: { blob: { url: string } }) => {
          console.log("Blob upload completed:", blob.url)
        },
      })
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 400 }
    )
  }
}
