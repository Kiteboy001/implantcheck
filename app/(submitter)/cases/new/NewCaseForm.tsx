"use client"

import { useActionState, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { submitCase, type SubmitCaseState } from "@/app/actions/cases"
import { validateUpload } from "@/app/actions/upload"
import { upload } from "@vercel/blob/client"

const initialState: SubmitCaseState = {}

// Tier definitions with their specific data requirements
const tiers = [
  {
    value: "BASIC",
    label: "Basic Check",
    price: "£95",
    desc: "Single implant — full STL/CBCT review with written feedback",
    requirements: {
      fileTypes: {
        stl: { label: "STL Files", desc: "Your implant planning STL exports", required: true, minCount: 1, recommendedCount: 2, accept: ".stl,.obj,.ply" },
        cbct: { label: "CBCT Slices", desc: "Key CBCT cross-sections showing bone quality", required: false, minCount: 0, recommendedCount: 2, accept: ".dcm,.dicom,.png,.jpg,.jpeg" },
        screenshots: { label: "Planning Screenshots", desc: "Screenshots from your planning software", required: false, minCount: 0, recommendedCount: 2, accept: ".png,.jpg,.jpeg,.webp" },
      },
      treatmentNotes: { required: true, detail: "brief", label: "Brief — describe the implant position and your reasoning" },
      patientContext: { required: false },
      softwareUsed: { required: false },
    },
    turnaround: "48 hours",
  },
  {
    value: "STANDARD",
    label: "Standard",
    price: "£199",
    desc: "2–4 implants — comprehensive review with detailed plan feedback",
    requirements: {
      fileTypes: {
        stl: { label: "STL Files", desc: "All implant planning STL exports", required: true, minCount: 2, recommendedCount: 3, accept: ".stl,.obj,.ply" },
        cbct: { label: "CBCT Scans", desc: "CBCT slices or full volume showing implant sites", required: true, minCount: 1, recommendedCount: 3, accept: ".dcm,.dicom,.png,.jpg,.jpeg" },
        screenshots: { label: "Planning Screenshots", desc: "Key views from your planning software", required: true, minCount: 1, recommendedCount: 3, accept: ".png,.jpg,.jpeg,.webp" },
      },
      treatmentNotes: { required: true, detail: "standard", label: "Detailed — describe implant positions, bone quality, surgical approach" },
      patientContext: { required: false },
      softwareUsed: { required: true },
    },
    turnaround: "36 hours",
  },
  {
    value: "COMPLEX",
    label: "Complex",
    price: "£295",
    desc: "4+ implants — full review with 1-on-1 Zoom consultation",
    requirements: {
      fileTypes: {
        stl: { label: "STL Files", desc: "All implant and restoration STL exports", required: true, minCount: 2, recommendedCount: 4, accept: ".stl,.obj,.ply" },
        cbct: { label: "Full CBCT Volume", desc: "Complete CBCT DICOM dataset or key slices", required: true, minCount: 1, recommendedCount: 5, accept: ".dcm,.dicom,.png,.jpg,.jpeg" },
        screenshots: { label: "Planning Views", desc: "All views from Blue Sky Bio or your planning software", required: true, minCount: 2, recommendedCount: 4, accept: ".png,.jpg,.jpeg,.webp" },
        dicom: { label: "DICOM Dataset", desc: "Raw DICOM files for 3D analysis (optional)", required: false, minCount: 0, recommendedCount: 0, accept: ".dcm,.dicom" },
      },
      treatmentNotes: { required: true, detail: "comprehensive", label: "Comprehensive — full treatment plan with implant positions, bone assessment, surgical and prosthetic considerations" },
      patientContext: { required: true },
      softwareUsed: { required: true },
    },
    turnaround: "24 hours",
  },
  {
    value: "PILOT_GUIDE",
    label: "Pilot Guide",
    price: "£399",
    desc: "Collaborative surgical guide — downloadable STL ready to print",
    requirements: {
      fileTypes: {
        stl: { label: "STL Files", desc: "All implant planning and restoration STL exports", required: true, minCount: 3, recommendedCount: 5, accept: ".stl,.obj,.ply" },
        cbct: { label: "Full CBCT Volume", desc: "Complete CBCT DICOM dataset for guide design", required: true, minCount: 1, recommendedCount: 5, accept: ".dcm,.dicom,.png,.jpg,.jpeg" },
        screenshots: { label: "Planning Views", desc: "All views from your planning software", required: true, minCount: 3, recommendedCount: 5, accept: ".png,.jpg,.jpeg,.webp" },
        dicom: { label: "DICOM Dataset", desc: "Raw DICOM files for surgical guide design", required: true, minCount: 1, recommendedCount: 3, accept: ".dcm,.dicom" },
        surgicalGuide: { label: "Surgical Guide STL", desc: "Your draft surgical guide STL export", required: false, minCount: 0, recommendedCount: 1, accept: ".stl,.obj,.ply" },
        opposingArch: { label: "Opposing Arch Data", desc: "Opposing arch STL or scan data", required: false, minCount: 0, recommendedCount: 1, accept: ".stl,.obj,.ply,.png,.jpg,.jpeg" },
      },
      treatmentNotes: { required: true, detail: "exhaustive", label: "Exhaustive — detailed surgical guide plan, implant positions, collaborative design notes, bite registration details" },
      patientContext: { required: true },
      softwareUsed: { required: true },
    },
    turnaround: "5–7 working days",
  },
]

const tierData = Object.fromEntries(tiers.map((t) => [t.value, t])) as Record<string, (typeof tiers)[number]>

type UploadedFile = { url: string; name: string; size: number; type: string }
type Reviewer = {
  id: string
  name: string | null
  email: string
  activeCases: number
}

// Map file extensions to type keys
function detectFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  if (["stl", "obj", "ply"].includes(ext)) return "stl"
  if (["dcm", "dicom"].includes(ext)) return "dicom"
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "screenshots"
  return "stl" // fallback
}

// SVG icons for file type cards
function StlIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14l4-4 4 4M16 10v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CbctIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="19" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="11" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ScreenshotIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="3" y="5" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 22l7-7 5 5 4-4 10 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DicomIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <rect x="3" y="5" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 13h12M10 17h8M10 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="11" r="1.5" fill="currentColor" />
    </svg>
  )
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <circle cx="16" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="14" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="14" x2="29" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="4" x2="16" y2="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ArchIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <path d="M8 26C8 26 10 10 16 10C22 10 24 26 24 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  stl: <StlIcon />,
  cbct: <CbctIcon />,
  screenshots: <ScreenshotIcon />,
  dicom: <DicomIcon />,
  surgicalGuide: <GuideIcon />,
  opposingArch: <ArchIcon />,
}

export default function NewCaseForm({
  reviewers,
  initialTier,
}: {
  reviewers: Reviewer[]
  initialTier?: string
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitCase, initialState)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState("")
  const [selectedTier, setSelectedTier] = useState(initialTier || "")
  const [selectedReviewer, setSelectedReviewer] = useState("")
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map()) // fileName → progress %
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentTier = tierData[selectedTier]
  const fileTypes = currentTier ? Object.entries(currentTier.requirements.fileTypes) : []

  // Count uploaded files per type
  const uploadedByType: Record<string, number> = {}
  uploadedFiles.forEach((f) => {
    const type = detectFileType(f.name)
    uploadedByType[type] = (uploadedByType[type] || 0) + 1
  })

  const isUploading = uploadingFiles.size > 0
  const acceptFormats = ".stl,.obj,.ply,.dcm,.dicom,.png,.jpg,.jpeg,.webp"

  // Client-side direct upload to Vercel Blob — no server body limits
  async function handleFiles(files: FileList | File[]) {
    setUploadError("")

    const fileArray = Array.from(files)
    const newFiles: UploadedFile[] = []

    for (const file of fileArray) {
      // Mark as uploading
      setUploadingFiles((prev) => new Map(prev).set(file.name, 0))

      try {
        // Upload directly from browser to Vercel Blob
        const blob = await upload(`cases/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
          allowedContentTypes: ["*/*"],
          multipart: true,
          onUploadProgress: (progress: { percentage: number }) => {
            setUploadingFiles((prev) => {
              const next = new Map(prev)
              next.set(file.name, progress.percentage)
              return next
            })
          },
        })

        // Validate the completed upload via server action
        const validation = await validateUpload({
          url: blob.url,
          name: file.name,
          size: file.size,
          type: file.type,
        })

        if ("error" in validation && validation.error) {
          setUploadError(validation.error)
          setUploadingFiles((prev) => {
            const next = new Map(prev)
            next.delete(file.name)
            return next
          })
          continue
        }

        if ("success" in validation && validation.file) {
          newFiles.push(validation.file)
        }

        // Remove from uploading
        setUploadingFiles((prev) => {
          const next = new Map(prev)
          next.delete(file.name)
          return next
        })
      } catch (e: any) {
        setUploadError(e.message || "Upload failed. Please try again.")
        setUploadingFiles((prev) => {
          const next = new Map(prev)
          next.delete(file.name)
          return next
        })
        break
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

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
            Case Created!
          </h2>
          <p className="text-muted mb-6">
            Your case has been saved. Please complete the payment to submit it for review.
          </p>
          <button onClick={() => router.push(`/cases/${state.success}/checkout`)} className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors">
            Proceed to Checkout →
          </button>
        </div>
      </div>
    )
  }

  const hasReviewers = reviewers.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-2">Submit a Case</h1>
        <p className="text-muted">Upload your files and treatment notes for expert review.</p>
      </div>

      <form action={formAction} className="space-y-8">
        {/* ── Tier Selection ── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-1">Select Tier</h2>
          <p className="text-sm text-muted mb-4">
            Each tier requires different diagnostic data. Higher tiers unlock more comprehensive reviews.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {tiers.map((tier) => (
              <label
                key={tier.value}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTier === tier.value
                    ? "border-gold bg-gold/5 shadow-sm"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.value}
                  required
                  checked={selectedTier === tier.value}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="accent-gold mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy">{tier.label}</span>
                    <span className="text-xs text-gold font-medium">{tier.price}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{tier.desc}</p>
                  <p className="text-xs text-muted/60 mt-1">⌛ {tier.turnaround}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Tier-specific data requirements (shown after tier is selected) ── */}
        {currentTier && (
          <>
            {/* File type checklist */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold">
                  Upload Files
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
                  {currentTier.label}
                </span>
              </div>
              <p className="text-sm text-muted mb-5">
                Your reviewer needs these files for this tier. Upload each type to complete your submission.
              </p>

              {/* File type cards */}
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {fileTypes.map(([key, ft]) => {
                  const count = uploadedByType[key] || 0
                  const isMet = ft.required ? count >= ft.minCount : count >= ft.recommendedCount
                  const isRequired = ft.required

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isMet
                          ? "border-green-200 bg-green-50/30"
                          : isRequired && count === 0
                          ? "border-amber-200 bg-amber-50/30"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 ${isMet ? "text-green-600" : isRequired ? "text-amber-500" : "text-navy/30"}`}>
                          {fileTypeIcons[key] || <CbctIcon />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-navy">{ft.label}</h4>
                            {isRequired && <span className="text-[10px] text-red-500 font-semibold uppercase">Required</span>}
                            {!isRequired && <span className="text-[10px] text-muted font-medium uppercase">Recommended</span>}
                          </div>
                          <p className="text-xs text-muted mt-0.5">{ft.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-medium ${isMet ? "text-green-600" : "text-amber-600"}`}>
                              {count} uploaded
                            </span>
                            {isRequired && (
                              <span className="text-xs text-muted">· need at least {ft.minCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Drop zone */}
              <label
                htmlFor="file-upload"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "copy"
                }}
                onDrop={handleDrop}
                className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gold/30 hover:bg-gold/[0.02] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                {isUploading ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gold font-medium">Uploading...</p>
                    {Array.from(uploadingFiles.entries()).map(([name, pct]) => (
                      <div key={name} className="flex items-center gap-3 max-w-xs mx-auto">
                        <span className="text-xs text-muted truncate flex-1 text-left">{name}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-gold rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gold font-medium w-8 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted mb-1">Drag and drop your files here, or click to browse</p>
                    <p className="text-xs text-muted/60">STL, PLY, OBJ (up to 512MB) · DICOM (up to 512MB) · PNG, JPEG (up to 16MB)</p>
                    <p className="text-xs text-gold/60 mt-1">Files upload directly — no compression needed</p>
                  </>
                )}
              </label>

              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptFormats}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-warm-bg rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted shrink-0">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        <span className="text-sm text-navy truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((files) => files.filter((_, j) => j !== i))}
                        className="text-red-500 text-sm hover:text-red-700 shrink-0 ml-3"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <label
                    htmlFor="file-upload"
                    className={`inline-block px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors cursor-pointer ${
                      isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    + Add More Files
                  </label>
                </div>
              )}

              <input type="hidden" name="files" value={JSON.stringify(uploadedFiles)} />
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Treatment Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">Treatment Details</h2>
              <div className="space-y-4">
                {/* Treatment Notes */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">
                    Treatment Notes <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted mb-2">{currentTier.requirements.treatmentNotes.label}</p>
                  <textarea
                    name="treatmentNotes"
                    rows={currentTier.requirements.treatmentNotes.detail === "exhaustive" ? 6 : 4}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
                    placeholder="Describe your treatment plan: implant positions, bone quality, surgical approach, prosthetic considerations..."
                  />
                </div>

                {/* Patient Context */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">
                    Patient Context{" "}
                    {currentTier.requirements.patientContext ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-muted font-normal">(recommended)</span>
                    )}
                  </label>
                  <textarea
                    name="patientContext"
                    rows={2}
                    required={currentTier.requirements.patientContext.required}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
                    placeholder="Age range, edentulous site, relevant medical history (anonymised — no PII)..."
                  />
                </div>

                {/* Planning Software */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">
                    Planning Software{" "}
                    {currentTier.requirements.softwareUsed ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-muted font-normal">(optional)</span>
                    )}
                  </label>
                  <select
                    name="softwareUsed"
                    defaultValue=""
                    onChange={(e) => {
                      const customInput = document.getElementById("custom-software") as HTMLInputElement
                      if (customInput) customInput.style.display = e.target.value === "_other" ? "block" : "none"
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors bg-white"
                  >
                    <option value="">Select your planning software…</option>
                    <option value="Blue Sky Bio">Blue Sky Bio</option>
                    <option value="coDiagnostiX">coDiagnostiX (Dental Wings)</option>
                    <option value="NobelClinician">NobelClinician</option>
                    <option value="DTX Studio Implant">DTX Studio Implant (Nobel Biocare)</option>
                    <option value="SimPlant">SimPlant (Dentsply Sirona)</option>
                    <option value="RealGUIDE">RealGUIDE (3DIEMME)</option>
                    <option value="exoplan">exoplan (exocad)</option>
                    <option value="Implant Studio">Implant Studio (3Shape)</option>
                    <option value="SMOP">SMOP (Swissmeda)</option>
                    <option value="360dps">360dps</option>
                    <option value="Galileos">Galileos Implant (Sirona)</option>
                    <option value="GuideMia">GuideMia</option>
                    <option value="_other">Other (specify)</option>
                  </select>
                  <input
                    id="custom-software"
                    type="text"
                    name="softwareUsedCustom"
                    placeholder="Please specify your software…"
                    className="hidden mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reviewer selection */}
        {hasReviewers && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">Select Reviewer</h2>
            <p className="text-sm text-muted mb-3">
              Choose the implant specialist who will review your treatment plan. If you don&apos;t have a preference, leave it unselected and an admin will assign one.
            </p>
            <div className="grid gap-2">
              <label
                className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReviewer === "" ? "border-gray-200 bg-gray-50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="reviewerId"
                  value=""
                  checked={selectedReviewer === ""}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  className="accent-gold"
                />
                <span className="text-sm text-muted">No preference — assign automatically</span>
              </label>
              {reviewers.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedReviewer === r.id ? "border-gold bg-gold/5" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="reviewerId"
                    value={r.id}
                    checked={selectedReviewer === r.id}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="accent-gold"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy">{r.name || r.email}</span>
                      {r.activeCases > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                          {r.activeCases} active case{r.activeCases !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{r.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {currentTier && (
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="w-full px-6 py-4 bg-navy text-white rounded-xl font-semibold text-base hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Case for Review"}
          </button>
        )}
      </form>
    </div>
  )
}
