import { auth } from "@/auth"
import { get } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })

  try {
    const result = await get(blobUrl, { access: "private" })
    if (!result) return NextResponse.json({ error: "File not found" }, { status: 404 })

    const { stream, blob } = result

    const headers = new Headers()
    headers.set("Content-Type", blob.contentType || "application/octet-stream")
    headers.set(
      "Content-Disposition",
      `attachment; filename="${blob.pathname.split("/").pop()}"`
    )
    headers.set("Content-Length", String(blob.size))

    return new NextResponse(stream, { headers })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Download failed" }, { status: 500 })
  }
}
