import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })

  // Vercel Blob public URLs are directly accessible — redirect the browser
  // rather than proxying through the server, which avoids fetch issues
  // in serverless environments and handles large files better.
  return NextResponse.redirect(blobUrl)
}
