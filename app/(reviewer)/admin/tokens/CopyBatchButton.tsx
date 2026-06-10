"use client"

import { useState } from "react"

export function CopyBatchButton({
  codes,
  count,
}: {
  codes: string[]
  count: number
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(codes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gold hover:text-gold-light font-medium"
    >
      {copied ? "✓ Copied!" : `Copy ${count} codes`}
    </button>
  )
}
