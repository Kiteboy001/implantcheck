export type AssessmentState = {
  error?: string
  success?: string // case ID on success
}

export const ASSESSMENT_STEPS = [
  { id: "patient", label: "Patient & History", number: 1 },
  { id: "examination", label: "Examination", number: 2 },
  { id: "planning", label: "Planning", number: 3 },
] as const

export type StepId = (typeof ASSESSMENT_STEPS)[number]["id"]
