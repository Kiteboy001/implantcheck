"use client"

import { useActionState, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { submitCase, type SubmitCaseState } from "@/app/actions/cases"
import { uploadFile } from "@/app/actions/upload"

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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | File[]) {
    setIsUploading(true)
    setUploadError("")

    const fileArray = Array.from(files)
    const newFiles: UploadedFile[] = []

    for (const file of fileArray) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const result = await uploadFile(formData)
        if ("error" in result && result.error) {
          setUploadError(result.error)
          break
        }
        if ("success" in result && result.file) {
          newFiles.push(result.file)
        }
      } catch (e: any) {
        setUploadError(e.message || "Upload failed")
        break
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
    setIsUploading(false)

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

  const acceptFormats = ".stl,.obj,.ply,.dcm,.dicom,.png,.jpg,.jpeg,.webp"

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-2">Submit a Case</h1>
        <p className="text-muted">Upload your STL files, CBCT scans, and treatment notes for expert review.</p>
      </div>

      <form action={formAction} className="space-y-8">
        {/* Tier selection */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">Select Tier</h2>
          <div className="grid gap-3">
            {tiers.map((tier) => (
              <label key={tier.value} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTier === tier.value ? "border-gold bg-gold/5" : "border-gray-100 hover:border-gray-200"}`}>
                <input type="radio" name="tier" value={tier.value} required className="accent-gold" onChange={(e) => setSelectedTier(e.target.value)} />
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
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">Treatment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Treatment Notes <span className="text-red-500">*</span></label>
              <textarea name="treatmentNotes" rows={4} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none" placeholder="Describe your treatment plan: implant positions, bone quality, surgical approach, prosthetic considerations..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Patient Context <span className="text-muted font-normal">(anonymised — no PII)</span></label>
              <textarea name="patientContext" rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none" placeholder="Age range, edentulous site, relevant medical history..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Planning Software</label>
              <select
                name="softwareUsed"
                defaultValue=""
                onChange={(e) => {
                  const customInput = document.getElementById('custom-software') as HTMLInputElement
                  if (customInput) customInput.style.display = e.target.value === '_other' ? 'block' : 'none'
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

        {/* File uploads */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-4">Upload Files</h2>
          <p className="text-sm text-muted mb-4">Upload STL, PLY, OBJ, DICOM/CBCT scans, and planning screenshots from Blue Sky Bio, coDiagnostiX, or any planning software.</p>

          {/* Drop zone */}
          <label htmlFor="file-upload" onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }} onDrop={handleDrop} className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gold/30 hover:bg-gold/[0.02] transition-all mb-4 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            {isUploading ? (
              <p className="text-sm text-gold font-medium animate-pulse">Uploading...</p>
            ) : (
              <>
                <p className="text-sm text-muted mb-1">Drag and drop your files here, or click to browse</p>
                <p className="text-xs text-muted/60">STL, PLY, OBJ (up to 512MB) · DICOM (up to 512MB) · PNG, JPEG (up to 16MB)</p>
              </>
            )}
          </label>

          <input id="file-upload" ref={fileInputRef} type="file" multiple accept={acceptFormats} onChange={handleFileChange} className="hidden" />

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-warm-bg rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted shrink-0">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <span className="text-sm text-navy truncate">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => setUploadedFiles(files => files.filter((_, j) => j !== i))} className="text-red-500 text-sm hover:text-red-700 shrink-0 ml-3">Remove</button>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <label htmlFor="file-upload" className={`inline-block px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
              {isUploading ? "Uploading..." : "+ Add More Files"}
            </label>
          )}

          <input type="hidden" name="files" value={JSON.stringify(uploadedFiles)} />
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        </div>

        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <button type="submit" disabled={isPending || isUploading} className="w-full px-6 py-4 bg-navy text-white rounded-xl font-semibold text-base hover:bg-navy-light transition-colors disabled:opacity-50">
          {isPending ? "Submitting..." : "Submit Case for Review"}
        </button>
      </form>
    </div>
  )
}
