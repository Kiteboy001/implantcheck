"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"
import { submitCase, type SubmitCaseState } from "@/app/actions/cases"

const initialState: SubmitCaseState = {}

const tiers = [
  { value: "BASIC", label: "Basic Check", price: "£95", desc: "Single implant — full STL/CBCT review with written feedback" },
  { value: "STANDARD", label: "Standard", price: "£199", desc: "2–4 implants — comprehensive review with detailed plan feedback" },
  { value: "COMPLEX", label: "Complex", price: "£295", desc: "4+ implants — full review + Zoom consultation" },
  { value: "PILOT_GUIDE", label: "Pilot Guide", price: "£399", desc: "Collaborative surgical guide — downloadable STL ready to print" },
]

type UploadedFile = { url: string; name: string; size: number; type: string }

export default function NewCasePage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitCase, initialState)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState("")
  const [selectedTier, setSelectedTier] = useState("")

  if (state.success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-[(family-name:var(--font-garamond))] text-2xl text-navy font-bold mb-2">
            Case Submitted!
          </h2>
          <p className="text-muted mb-6">
            Your treatment plan has been submitted for review. Dr. Dandapat will review it shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
            >
              View My Cases
            </button>
            <button
              onClick={() => router.push(`/cases/${state.success}`)}
              className="px-6 py-2.5 border border-navy text-navy rounded-lg font-semibold hover:bg-navy hover:text-white transition-colors"
            >
              View Case
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-2">
          Submit a Case
        </h1>
        <p className="text-muted">
          Upload your STL files, CBCT scans, and treatment notes for expert review.
        </p>
      </div>

      <form action={formAction} className="space-y-8">
        {/* Tier selection */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
            Select Tier
          </h2>
          <div className="grid gap-3">
            {tiers.map((tier) => (
              <label
                key={tier.value}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTier === tier.value
                    ? "border-gold bg-gold/5"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.value}
                  required
                  className="accent-gold"
                  onChange={(e) => setSelectedTier(e.target.value)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy">{tier.label}</span>
                    <span className="text-xs text-gold font-medium">{tier.price}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{tier.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Treatment notes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
            Treatment Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Treatment Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                name="treatmentNotes"
                rows={4}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
                placeholder="Describe your treatment plan: implant positions, bone quality, surgical approach, prosthetic considerations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Patient Context <span className="text-muted font-normal">(anonymised — no PII)</span>
              </label>
              <textarea
                name="patientContext"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
                placeholder="Age range, edentulous site, relevant medical history..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Planning Software
              </label>
              <input
                type="text"
                name="softwareUsed"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
                placeholder="e.g. Blue Sky Bio, coDiagnostiX"
              />
            </div>
          </div>
        </div>

        {/* File uploads */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">
            Upload Files
          </h2>
          <p className="text-sm text-muted mb-4">
            Upload STL, PLY, OBJ, DICOM/CBCT scans, and planning screenshots from Blue Sky Bio, coDiagnostiX, or any planning software.
          </p>

          {/* Drop zone */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gold/30 hover:bg-gold/[0.02] transition-all mb-4">
            <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm text-muted mb-1">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-xs text-muted/60">
              STL, PLY, OBJ (up to 256MB) · DICOM (up to 512MB) · PNG, JPEG (up to 16MB)
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-warm-bg rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-mono">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span className="text-sm text-navy truncate max-w-[300px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles(files => files.filter((_, j) => j !== i))}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="hidden" name="files" value={JSON.stringify(uploadedFiles)} />

          <UploadButton<OurFileRouter, "caseFile">
            endpoint="caseFile"
            onClientUploadComplete={(res) => {
              const newFiles: UploadedFile[] = res.map((r) => ({
                url: r.ufsUrl,
                name: r.name,
                size: r.size,
                type: r.type,
              }))
              setUploadedFiles((prev) => [...prev, ...newFiles])
              setUploadError("")
            }}
            onUploadError={(error) => {
              setUploadError(error.message)
            }}
            className="ut-button:bg-navy ut-button:text-white ut-button:rounded-lg ut-button:px-5 ut-button:py-2.5 ut-button:text-sm ut-button:font-semibold ut-button:hover:bg-navy-light ut-button:transition-colors ut-allowed-content:text-muted ut-allowed-content:text-xs"
          />

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}

          {uploadedFiles.length === 0 && (
            <p className="mt-3 text-xs text-muted">
              Supported: STL, OBJ, PLY (up to 256MB) · DICOM/CBCT (up to 512MB) · PNG, JPEG (up to 16MB)
            </p>
          )}
        </div>

        {/* Error */}
        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-4 bg-navy text-white rounded-xl font-semibold text-base hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Case for Review"}
        </button>
      </form>
    </div>
  )
}
