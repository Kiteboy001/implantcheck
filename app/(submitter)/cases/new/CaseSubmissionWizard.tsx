"use client"

import { useState, useCallback } from "react"
import { BcdisAssessmentForm, type AssessmentData } from "./BcdisAssessmentForm"
import { ASSESSMENT_STEPS, type StepId } from "@/app/actions/assessment-types"
import NewCaseForm from "./NewCaseForm"

type Reviewer = {
  id: string
  name: string | null
  email: string
  activeCases: number
}

interface Props {
  reviewers: Reviewer[]
  initialTier?: string
}

export default function CaseSubmissionWizard({ reviewers, initialTier }: Props) {
  const [currentStep, setCurrentStep] = useState<"assessment" | "upload">("assessment")
  const [assessmentStep, setAssessmentStep] = useState<StepId>("patient")
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({})
  const [startedUpload, setStartedUpload] = useState(false)

  const handleAssessmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked
        setAssessmentData((prev) => ({ ...prev, [name]: checked ? "true" : "false" }))
      } else {
        setAssessmentData((prev) => ({ ...prev, [name]: value }))
      }
    },
    []
  )

  const stepIndex = ASSESSMENT_STEPS.findIndex((s) => s.id === assessmentStep)

  const goToNextAssessmentStep = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex < ASSESSMENT_STEPS.length) {
      setAssessmentStep(ASSESSMENT_STEPS[nextIndex].id)
    } else {
      // All assessment steps complete — move to upload
      setCurrentStep("upload")
    }
  }

  const goToPrevAssessmentStep = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setAssessmentStep(ASSESSMENT_STEPS[prevIndex].id)
    }
  }

  // Progress percentage through all steps (assessment 3 + upload 1 = 4 total)
  const totalSteps = ASSESSMENT_STEPS.length + 1 // +1 for upload step
  const completedSteps = currentStep === "upload" ? ASSESSMENT_STEPS.length : stepIndex
  const progressPct = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-garamond)] text-3xl text-navy font-bold mb-2">
          Submit a Case
        </h1>
        <p className="text-muted">
          Complete the BCDIS assessment form and upload your files for expert review.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-medium">
            {currentStep === "assessment"
              ? `Step ${stepIndex + 1} of ${ASSESSMENT_STEPS.length} — ${ASSESSMENT_STEPS[stepIndex].label}`
              : `Step ${ASSESSMENT_STEPS.length + 1} — Upload & Submit`}
          </span>
          <span className="text-xs text-gold font-medium">{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {ASSESSMENT_STEPS.map((step) => {
            const isCompleted = currentStep === "upload" || ASSESSMENT_STEPS.indexOf(step) < stepIndex
            const isCurrent = currentStep === "assessment" && step.id === assessmentStep
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (isCompleted || (currentStep === "assessment" && ASSESSMENT_STEPS.indexOf(step) <= stepIndex)) {
                    setAssessmentStep(step.id)
                    setCurrentStep("assessment")
                  }
                }}
                className={`text-[10px] font-medium transition-colors ${
                  isCurrent
                    ? "text-gold"
                    : isCompleted
                    ? "text-green-600 cursor-pointer hover:underline"
                    : "text-muted/40"
                }`}
              >
                {isCompleted ? "✓" : `0${step.number}`} {step.label}
              </button>
            )
          })}
          <span
            className={`text-[10px] font-medium ${
              currentStep === "upload" ? "text-gold" : "text-muted/40"
            }`}
          >
            0{ASSESSMENT_STEPS.length + 1} Upload
          </span>
        </div>
      </div>

      {/* Assessment steps */}
      {currentStep === "assessment" && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <BcdisAssessmentForm
              data={assessmentData}
              onChange={handleAssessmentChange}
              currentStep={assessmentStep}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={goToPrevAssessmentStep}
              disabled={stepIndex === 0}
              className="px-5 py-2.5 border border-gray-200 text-navy rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={goToNextAssessmentStep}
              className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
            >
              {stepIndex < ASSESSMENT_STEPS.length - 1 ? "Next →" : "Continue to Upload →"}
            </button>
          </div>
        </>
      )}

      {/* Upload step — render NewCaseForm with assessment hidden fields */}
      {currentStep === "upload" && !startedUpload && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold mb-1">
              Assessment Complete
            </h3>
            <p className="text-sm text-muted mb-4">
              Your BCDIS assessment has been saved. Now select your tier and upload your files.
            </p>
            <button
              type="button"
              onClick={() => setStartedUpload(true)}
              className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
            >
              Continue to Upload
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentStep("assessment")
              setAssessmentStep("planning")
            }}
            className="text-sm text-gold hover:underline"
          >
            ← Back to assessment
          </button>
        </div>
      )}

      {currentStep === "upload" && startedUpload && (
        <div>
          {/* Hidden fields — inject assessment data into the form */}
          <style>{`
            .assessment-hidden-fields { display: none; }
          `}</style>

          <NewCaseForm
            reviewers={reviewers}
            initialTier={initialTier}
            assessmentData={assessmentData}
          />
        </div>
      )}
    </div>
  )
}
