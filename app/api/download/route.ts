import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })

  try {
    // Public blobs can be fetched directly — no auth needed
    const response = await fetch(blobUrl)
    if (!response.ok) {
      return NextResponse.json(
        { error: `Download failed (${response.status})` },
        { status: response.status }
      )
    }

    const disposition = response.headers.get("content-disposition")
    const filename = disposition
      ? disposition.split("filename=").pop()?.replace(/"/g, "")
      : "download"

    const headers = new Headers()
    headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream")
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    const length = response.headers.get("content-length")
    if (length) headers.set("Content-Length", length)

    return new NextResponse(response.body, { headers })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Download failed" }, { status: 500 })
  }
}
