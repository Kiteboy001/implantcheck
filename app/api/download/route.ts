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

    // For private stores, the CDN URL doesn't accept Bearer tokens.
    // Use the Vercel Blob API directly: https://blob.vercel-storage.com/<path>?token=<token>
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 })

    const apiUrl = new URL(blob.pathname, "https://blob.vercel-storage.com")
    apiUrl.searchParams.set("token", token)

    const response = await fetch(apiUrl.toString())

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
