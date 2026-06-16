"use client"

import { useActionState, useState, useRef, useEffect } from "react"
import { submitReview, type ReviewState } from "@/app/actions/review"

const initialState: ReviewState = {}

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function ReviewForm({ caseId }: { caseId: string }) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState)
  const [reportText, setReportText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSupported, setRecordingSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setRecordingSupported(!!SpeechRecognition)
  }, [])

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-GB"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " "
        }
      }
      setReportText((prev) => prev + final)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  async function handleGenerate() {
    if (!reportText.trim() || reportText.trim().length < 20) {
      setGenerateError("Please dictate or type at least a few sentences before generating the report.")
      return
    }

    setIsGenerating(true)
    setGenerateError("")

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: reportText }),
      })

      const data = await response.json()

      if (!response.ok) {
        setGenerateError(data.error || "Failed to generate report.")
        return
      }

      setReportText(data.report)
    } catch (e: any) {
      setGenerateError(e.message || "Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-green-800 font-medium">Review submitted successfully</p>
        <p className="text-green-600 text-sm mt-1">The submitter will be notified.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold">
          Submit Review
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-navy/5 text-navy font-medium">
          AI-Assisted
        </span>
      </div>
      <p className="text-sm text-muted mb-5">
        Dictate or type your review naturally. The AI will structure it into a polished report following Dr. Dandapat&apos;s style.
      </p>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="caseId" value={caseId} />
        <input type="hidden" name="reportText" value={reportText} />

        {/* Dictation area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-navy">
              Dictate Your Review <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {recordingSupported && (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-warm-bg text-navy border border-gray-200 hover:border-gold/30"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a2.5 2.5 0 00-2.5 2.5v4a2.5 2.5 0 005 0v-4A2.5 2.5 0 008 1z" />
                    <path d="M3.5 7a4.5 4.5 0 009 0h-9z" />
                  </svg>
                  {isRecording ? "Stop" : "Record"}
                </button>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || reportText.trim().length < 20}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-navy rounded-lg text-xs font-semibold hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6" strokeLinecap="round" />
                  <path d="M8 10l2-2-2-2M8 8H2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isGenerating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={16}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-y font-['Inter',sans-serif] leading-relaxed"
            placeholder={`Dictate or type your review naturally. For example:

"So this is Mr Smith, 62 years old, ASA I. He's missing an upper right first molar after an extraction about 2 years ago. Oral hygiene is good, BPE 1s and 2s. CBCT shows about 8mm ridge width, 12mm height, D2 bone quality. I'm thinking a 4.5 by 10mm implant, standard loading, heal for about 3-4 months. Non-smoker, no bruxism. Good prognosis — straightforward case..."

The AI will structure this into a professional Dental Implant Assessment Report.`}
          />
        </div>

        {generateError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{generateError}</p>
          </div>
        )}

        {/* Decision */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Decision <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
              <input
                type="radio"
                name="decision"
                value="APPROVED"
                required
                className="accent-green-600"
              />
              <span className="text-sm font-medium text-body">Approve</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
              <input
                type="radio"
                name="decision"
                value="NEEDS_REVISION"
                className="accent-red-600"
              />
              <span className="text-sm font-medium text-body">Needs Revision</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors has-[:checked]:border-gray-500 has-[:checked]:bg-gray-50">
              <input
                type="radio"
                name="decision"
                value="REJECTED"
                className="accent-gray-600"
              />
              <span className="text-sm font-medium text-body">Reject</span>
            </label>
          </div>
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || reportText.trim().length === 0}
          className="w-full px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
