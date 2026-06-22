"use client"

import { useState } from "react"
import { ASSESSMENT_STEPS, type StepId } from "@/app/actions/assessment-types"

// ── Shared field helpers ──────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-navy">{label}</h3>
      {children}
    </div>
  )
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {rows > 1 ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

function Checkbox({
  label,
  name,
  checked,
  onChange,
}: {
  label: string
  name: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-body">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-gold w-4 h-4 rounded"
      />
      {label}
    </label>
  )
}

function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <span className="block text-xs font-medium text-muted mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
              value === opt.value
                ? "border-gold bg-gold/10 text-navy font-medium"
                : "border-gray-200 text-muted hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

function NumberInput({
  label,
  name,
  value,
  onChange,
  unit,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  unit?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{unit}</span>
        )}
      </div>
    </div>
  )
}

// ── BPE Hex Diagram ───────────────────────────────────────────
// Replicates the hexagonal BPE scoring chart from the BCDIS form

function BpeHex({ values, onChange }: { values: Record<string, string>; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const sextants = [
    { id: "bpeSextant1", label: "1", row: 1, col: 2 }, // upper right
    { id: "bpeSextant2", label: "2", row: 1, col: 3 }, // upper anterior
    { id: "bpeSextant3", label: "3", row: 1, col: 4 }, // upper left
    { id: "bpeSextant4", label: "4", row: 2, col: 2 }, // lower right
    { id: "bpeSextant5", label: "5", row: 2, col: 3 }, // lower anterior
    { id: "bpeSextant6", label: "6", row: 2, col: 4 }, // lower left
  ]

  return (
    <div className="inline-block">
      <span className="block text-xs font-medium text-muted mb-2">BPE Scores (0–4, * for furcation)</span>
      <div className="grid grid-cols-[auto_repeat(3,52px)] gap-1">
        <div /> {/* spacer */}
        <div className="text-[10px] text-muted text-center">Upper R</div>
        <div className="text-[10px] text-muted text-center">Upper A</div>
        <div className="text-[10px] text-muted text-center">Upper L</div>
        <div className="text-[10px] text-muted text-center self-center pr-2">Lower R</div>
        {sextants.slice(3).map((s) => (
          <input
            key={s.id}
            name={s.id}
            value={values[s.id] || ""}
            onChange={onChange}
            maxLength={2}
            placeholder={s.label}
            className="w-[48px] h-[44px] text-center border border-gray-200 rounded-lg text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />
        ))}
        <div className="text-[10px] text-muted text-center self-center pr-2">Lower L</div>
        {sextants.slice(0, 3).map((s) => (
          <input
            key={s.id}
            name={s.id}
            value={values[s.id] || ""}
            onChange={onChange}
            maxLength={2}
            placeholder={s.label}
            className="w-[48px] h-[44px] text-center border border-gray-200 rounded-lg text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />
        ))}
      </div>
    </div>
  )
}

// ── Main Assessment Form ──────────────────────────────────────

export type AssessmentData = Record<string, string>

interface Props {
  data: AssessmentData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  currentStep: StepId
}

export function BcdisAssessmentForm({ data, onChange, currentStep }: Props) {
  const g = (name: string) => data[name] || ""
  const c = (name: string) => data[name] === "true"
  const h = onChange

  return (
    <div className="space-y-6">
      {currentStep === "patient" && (
        <>
          <FieldGroup label="Patient & History">
            <TextField label="Chief complaint and expectations of treatment outcomes" name="complaint" value={g("complaint")} onChange={h} placeholder="e.g. Patient is missing upper right first molar, wishes to restore with implant..." rows={3} />
            <TextField label="Social / Dental history" name="dentalHistory" value={g("dentalHistory")} onChange={h} placeholder="Relevant dental and social history..." rows={3} />
          </FieldGroup>

          <FieldGroup label="Medical History">
            <div className="flex flex-wrap gap-4">
              <Checkbox label="Medically fit for surgery" name="medicallyFit" checked={c("medicallyFit")} onChange={h} />
              <Checkbox label="Complicating medical factors" name="complicatingFactors" checked={c("complicatingFactors")} onChange={h} />
            </div>
            <TextField label="Relevant medical details" name="relevantHistory" value={g("relevantHistory")} onChange={h} placeholder="Any relevant medical conditions, allergies, medications..." rows={2} />
          </FieldGroup>

          <FieldGroup label="Social History">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Checkbox label="Smoker" name="smoker" checked={c("smoker")} onChange={h} />
                {c("smoker") && (
                  <div className="mt-2 ml-6">
                    <NumberInput label="Cigarettes per day" name="cigarettesPerDay" value={g("cigarettesPerDay")} onChange={h} />
                  </div>
                )}
              </div>
              <NumberInput label="Alcohol units per week" name="alcoholUnitsPerWeek" value={g("alcoholUnitsPerWeek")} onChange={h} />
            </div>
            <RadioGroup
              label="ASA Grade"
              name="asaGrade"
              value={g("asaGrade")}
              onChange={h}
              options={[
                { value: "1", label: "ASA 1 — Normal healthy patient" },
                { value: "2", label: "ASA 2 — Mild systemic disease" },
                { value: "3", label: "ASA 3 — Severe systemic disease" },
                { value: "4", label: "ASA 4 — Life-threatening" },
              ]}
            />
          </FieldGroup>
        </>
      )}

      {currentStep === "examination" && (
        <>
          <FieldGroup label="Extra-Oral Examination">
            <div className="flex flex-wrap gap-4">
              <Checkbox label="TMJ" name="extraOralTmj" checked={c("extraOralTmj")} onChange={h} />
              <Checkbox label="Lymph nodes" name="extraOralLymph" checked={c("extraOralLymph")} onChange={h} />
              <Checkbox label="Soft tissues" name="extraOralSoft" checked={c("extraOralSoft")} onChange={h} />
              <Checkbox label="Skin" name="extraOralSkin" checked={c("extraOralSkin")} onChange={h} />
            </div>
          </FieldGroup>

          <FieldGroup label="Intra-Oral Soft Tissues">
            <div className="flex flex-wrap gap-4">
              <Checkbox label="FOM" name="intraOralFom" checked={c("intraOralFom")} onChange={h} />
              <Checkbox label="Palate" name="intraOralPalate" checked={c("intraOralPalate")} onChange={h} />
              <Checkbox label="Tongue" name="intraOralTongue" checked={c("intraOralTongue")} onChange={h} />
              <Checkbox label="Sulcus" name="intraOralSulcus" checked={c("intraOralSulcus")} onChange={h} />
            </div>
          </FieldGroup>

          <FieldGroup label="Periodontal BPE">
            <BpeHex values={data} onChange={h} />
          </FieldGroup>

          <FieldGroup label="Oral Hygiene">
            <RadioGroup
              label=""
              name="oralHygiene"
              value={g("oralHygiene")}
              onChange={h}
              options={[
                { value: "POOR", label: "Poor" },
                { value: "FAIR", label: "Fair" },
                { value: "GOOD", label: "Good" },
              ]}
            />
          </FieldGroup>

          <FieldGroup label="Occlusion">
            <TextField label="Occlusion scheme details" name="occlusionDetails" value={g("occlusionDetails")} onChange={h} placeholder="e.g. Class I occlusion, canine guidance..." rows={2} />
            <RadioGroup
              label="Inter-arch space"
              name="interArchSpace"
              value={g("interArchSpace")}
              onChange={h}
              options={[
                { value: "ADEQUATE", label: "Adequate" },
                { value: "INADEQUATE", label: "Inadequate" },
              ]}
            />
          </FieldGroup>

          <FieldGroup label="Special Tests">
            <TextField label="X-rays / CT Scan notes" name="specialTestsXrays" value={g("specialTestsXrays")} onChange={h} placeholder="BWs, CT scan findings, LCPA area and report..." rows={2} />
          </FieldGroup>

          <FieldGroup label="Diagnosis">
            <div className="space-y-2">
              <input name="diagnosis1" value={g("diagnosis1")} onChange={h} placeholder="Diagnosis 1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" />
              <input name="diagnosis2" value={g("diagnosis2")} onChange={h} placeholder="Diagnosis 2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" />
              <input name="diagnosis3" value={g("diagnosis3")} onChange={h} placeholder="Diagnosis 3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" />
            </div>
          </FieldGroup>

          <FieldGroup label="Alternative Treatment Discussion">
            <RadioGroup
              label="Discussed alternative treatment"
              name="discussedAlt"
              value={g("discussedAlt")}
              onChange={h}
              options={[
                { value: "DENTURE", label: "Denture" },
                { value: "BRIDGE", label: "Bridge" },
              ]}
            />
            <div className="flex gap-4">
              <Checkbox label="Report given & consent obtained" name="reportGiven" checked={c("reportGiven")} onChange={h} />
              <Checkbox label="Pre-op instructions given" name="preOpInstructions" checked={c("preOpInstructions")} onChange={h} />
            </div>
          </FieldGroup>
        </>
      )}

      {currentStep === "planning" && (
        <>
          <FieldGroup label="Ridge Dimensions">
            <div className="grid sm:grid-cols-2 gap-4">
              <NumberInput label="Interarch distance" name="interarchDistance" value={g("interarchDistance")} onChange={h} unit="mm" />
              <NumberInput label="Interdental space" name="interdentalSpace" value={g("interdentalSpace")} onChange={h} unit="mm" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <RadioGroup
                label="Biotype"
                name="biotype"
                value={g("biotype")}
                onChange={h}
                options={[
                  { value: "THICK", label: "Thick" },
                  { value: "THIN", label: "Thin" },
                ]}
              />
              <RadioGroup
                label="Papillae"
                name="papillae"
                value={g("papillae")}
                onChange={h}
                options={[
                  { value: "PRESENT", label: "Present" },
                  { value: "ABSENT", label: "Absent" },
                ]}
              />
            </div>
            <TextField label="Complicating anatomy (IDB, Sinus, Adjacent roots)" name="complicatingAnatomy" value={g("complicatingAnatomy")} onChange={h} placeholder="Describe any complicating anatomical features..." rows={2} />
          </FieldGroup>

          <FieldGroup label="Occlusion">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Angle's class" name="anglesClass" value={g("anglesClass")} onChange={h} placeholder="e.g. Class I" rows={1} />
              <NumberInput label="Overbite (OB)" name="overbite" value={g("overbite")} onChange={h} unit="mm" />
              <NumberInput label="Overjet (OJ)" name="overjet" value={g("overjet")} onChange={h} unit="mm" />
              <TextField label="OVD / Freeway space" name="ovdFreewaySpace" value={g("ovdFreewaySpace")} onChange={h} placeholder="e.g. 3mm" rows={1} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Guidance — Right" name="guidanceRight" value={g("guidanceRight")} onChange={h} placeholder="e.g. Canine guidance" rows={1} />
              <TextField label="Guidance — Left" name="guidanceLeft" value={g("guidanceLeft")} onChange={h} placeholder="e.g. Group function" rows={1} />
            </div>
          </FieldGroup>

          <FieldGroup label="CBCT Report">
            <TextField label="CBCT findings" name="cbctFindings" value={g("cbctFindings")} onChange={h} placeholder="Summarise CBCT findings — bone quality, ridge dimensions, anatomical considerations..." rows={3} />
          </FieldGroup>

          <FieldGroup label="Treatment Planning">
            <div className="space-y-3">
              <TextField label="Phase 1 — Stabilisation" name="phase1Stabilisation" value={g("phase1Stabilisation")} onChange={h} placeholder="Perio (OHI, TBI, SP, RSD), caries, occlusal tests, wax ups, diagnostic aids..." rows={3} />
              <TextField label="Phase 2 — Medium Term" name="phase2MediumTerm" value={g("phase2MediumTerm")} onChange={h} placeholder="Implant placement, grafting procedures..." rows={2} />
              <TextField label="Phase 3 — Long Term" name="phase3LongTerm" value={g("phase3LongTerm")} onChange={h} placeholder="Restoration, maintenance, recall patterns..." rows={2} />
            </div>
          </FieldGroup>

          <FieldGroup label="Implant Planning">
            <RadioGroup
              label="Approach"
              name="implantPlanning"
              value={g("implantPlanning")}
              onChange={h}
              options={[
                { value: "DELAYED", label: "Delayed placement" },
                { value: "IMMEDIATE", label: "Immediate replacement" },
                { value: "AUGMENTATION", label: "Augmentation required" },
              ]}
            />
            <RadioGroup
              label="Graft material (if applicable)"
              name="graftMaterial"
              value={g("graftMaterial")}
              onChange={h}
              options={[
                { value: "BIOSS_PRGF", label: "Bioss + PRGF" },
                { value: "ETHOSS", label: "Ethoss graft" },
                { value: "AUTOGENOUS", label: "Autogenous graft" },
                { value: "BLOCK", label: "Block biotiss" },
              ]}
            />
            <TextField label="Ridge deficiency type" name="ridgeDeficiencyType" value={g("ridgeDeficiencyType")} onChange={h} placeholder="Describe ridge deficiency classification..." rows={1} />
          </FieldGroup>
        </>
      )}
    </div>
  )
}
