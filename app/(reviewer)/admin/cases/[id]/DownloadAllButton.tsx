"use client"

type File = { id: string; fileUrl: string; fileName: string }

export function DownloadAllButton({ files }: { files: File[] }) {
  if (files.length === 0) return null

  const downloadAll = () => {
    files.forEach((f) =>
      window.open(
        `/api/download?url=${encodeURIComponent(f.fileUrl)}`,
        "_blank"
      )
    )
  }

  return (
    <button
      onClick={downloadAll}
      className="block w-full text-center px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
    >
      Download All Files
    </button>
  )
}
