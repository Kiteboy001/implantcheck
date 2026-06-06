import { auth } from "@/auth"
import { head } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })

  try {
    const blob = await head(blobUrl)
    if (!blob) return NextResponse.json({ error: "File not found" }, { status: 404 })

    // Private blob stores require Authorization header with the read/write token
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const response = await fetch(blob.url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch blob (${response.status})` },
        { status: 500 }
      )
    }

    const headers = new Headers()
    headers.set("Content-Type", blob.contentType || "application/octet-stream")
    headers.set(
      "Content-Disposition",
      `attachment; filename="${blob.pathname.split("/").pop()}"`
    )
    headers.set("Content-Length", String(blob.size))

    return new NextResponse(response.body, { headers })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Download failed" }, { status: 500 })
  }
}
