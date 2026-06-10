"use client"

import { useState } from "react"
import { acceptWaiver } from "@/app/actions/waiver"
import { useRouter } from "next/navigation"

const WAIVER_TEXT = `ImplantCheck Expert Opinion Service
Terms of Use, Disclaimer & Vicarious Liability Waiver
British College of Dental Implant Surgery (BCDIS)
Version 1.0  |  Effective Date: 2025

1. Introduction and Preamble

1.1 These Terms of Use, Disclaimer and Vicarious Liability Waiver ("Terms") govern the use of the ImplantCheck remote expert opinion service ("the Service") operated by the British College of Dental Implant Surgery ("BCDIS"), a professional body supporting excellence in implant dentistry in the United Kingdom.

1.2 The Service facilitates the provision of written expert clinical opinions on implant dentistry cases submitted electronically by registered dental professionals. These Terms set out the rights, obligations, and limitations of liability of all parties involved.

1.3 These Terms constitute a legally binding agreement between BCDIS, the Expert, and the Requesting Clinician. In the event of any conflict between these Terms and any other documentation, these Terms shall prevail.

2. Nature of the Service

2.1 The ImplantCheck Service provides registered dental professionals with access to written expert peer clinical commentary on implant dentistry cases submitted via the online platform. The Service is strictly a professional-to-professional consultation mechanism and does not constitute direct patient care or clinical treatment.

2.2 The Expert Opinion is based solely and exclusively upon the digital materials uploaded by the Requesting Clinician to the ImplantCheck platform, which may include, but are not limited to: cone beam computed tomography (CBCT) scan data, clinical photographs, stereolithography (STL) digital scan files, clinical history and patient records, and treatment planning documentation.

2.3 The Expert has not and will not, in connection with any case submitted through this Service: (a) physically examined the Patient; (b) conducted any direct or remote consultation with the Patient; (c) reviewed any documentation not submitted through the platform; or (d) engaged in any form of treatment relationship with the Patient.

2.4 The Expert Opinion is a professional technical commentary covering matters including, without limitation: implant positioning and angulation; implant sizing, dimensions, and specification; placement approach and surgical technique considerations; prosthetic planning considerations; and clinical risk factors identifiable from the submitted materials.

2.5 The Expert Opinion is provided as peer professional guidance to assist the Requesting Clinician in their independent clinical decision-making. It does not constitute a diagnosis, treatment recommendation, or clinical directive to the Patient.

2.6 All Expert Opinions are delivered in accordance with the Faculty of General Dental Practice (FGDP) UK Guidelines for Implant Dentistry, as current at the time of the opinion, and in line with the standards expected of a responsible body of specialist implant dental practitioners.

3. Disclaimer of Clinical Responsibility

3.1 The Expert assumes no clinical, professional, ethical, or legal responsibility whatsoever for the Patient named or described in any case submitted through the ImplantCheck platform. The provision of an Expert Opinion does not create, and shall not be construed as creating, any clinician-patient relationship between the Expert and the Patient.

3.2 The Requesting Clinician retains sole, full, and undivided professional, ethical, and legal responsibility for: (a) all clinical decisions made in respect of the Patient; (b) the treatment planning and delivery of any dental implant treatment; (c) the obtaining and maintenance of valid informed consent from the Patient; (d) compliance with all applicable professional, regulatory, and statutory obligations; and (e) all outcomes and sequelae arising from the treatment of the Patient.

3.3 The Expert Opinion must not be shared directly with the Patient, communicated to the Patient, or presented to the Patient in any form as a standalone clinical recommendation without appropriate professional qualification, interpretation, and contextualisation by the Requesting Clinician.

3.4 The Requesting Clinician is solely responsible for determining the weight and relevance to be accorded to the Expert Opinion in the context of their own clinical assessment of the Patient. The Expert Opinion does not override or supersede the independent clinical judgement of the Requesting Clinician.

4. Vicarious Liability Waiver

4.1 The Expert shall not be vicariously liable for any clinical outcome, adverse event, complication, patient harm, or legal claim of any nature arising directly or indirectly from: (a) the treatment or non-treatment of any Patient in connection with a case submitted through the Service; (b) the Requesting Clinician's application of, reliance upon, interpretation of, or departure from an Expert Opinion; or (c) any act or omission of the Requesting Clinician in the course of treating any Patient.

4.2 The Requesting Clinician hereby agrees to fully and unconditionally indemnify and hold harmless both the Expert and BCDIS from and against any and all claims, demands, actions, proceedings, costs (including reasonable legal costs), damages, losses, and liabilities of any kind arising from or related to the Requesting Clinician's use or misuse of an Expert Opinion.

4.3 Notwithstanding any other provision of these Terms, the Expert's total financial liability to the Requesting Clinician shall, in all circumstances, be strictly limited to the fee paid by the Requesting Clinician for the specific Expert Opinion in question. This limitation shall apply except only in cases of gross negligence or wilful misconduct on the part of the Expert, as determined by a court of competent jurisdiction.

4.4 Nothing in these Terms shall be construed as excluding or limiting any liability that cannot be excluded or limited under applicable English law.

5. Data Protection and Confidentiality

5.1 All patient data submitted through the ImplantCheck platform must be fully anonymised or appropriately pseudonymised in accordance with the requirements of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, prior to upload. Patient names, NHS numbers, full dates of birth, and any other direct identifiers must not be included in submitted materials.

5.2 The Requesting Clinician warrants and represents that they have obtained valid, specific, and informed consent from the Patient for the sharing of clinical data, imaging, and records with a third-party remote specialist for the purpose of obtaining an expert opinion.

5.3 BCDIS acts as data controller in respect of personal data processed through the ImplantCheck platform. All personal data will be processed in accordance with the BCDIS Privacy Policy and applicable data protection legislation.

6. Regulatory Compliance and Professional Standing

6.1 The Requesting Clinician warrants that, at the time of submitting any case through the Service, they are: (a) a qualified dental professional holding an appropriate dental qualification recognised in the United Kingdom; (b) registered in good standing with the General Dental Council (GDC) of the United Kingdom; and (c) not subject to any interim order, suspension, erasure, or other restriction imposed by the GDC.

6.2 The Service is strictly available to registered dental professionals only. It must not be accessed or used by lay persons, unregistered individuals, or any person who does not satisfy the requirements set out in Clause 6.1.

7. Governing Law and Jurisdiction

7.1 These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the law of England and Wales.

7.2 The parties irrevocably agree that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.

8. Acceptance and Digital Acknowledgment

8.1 By accepting these Terms and submitting a case through the ImplantCheck platform, the Requesting Clinician confirms, represents, and warrants that they have read these Terms in full, understand their content and legal effect, and agree to be bound by them.

8.2 The digital acceptance checkbox below forms a binding part of these Terms. Completion of that checkbox shall be treated as equivalent to a handwritten signature for all legal purposes.

© British College of Dental Implant Surgery 2025 — All Rights Reserved`

export default function WaiverContent() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleAccept() {
    if (!accepted) {
      setError("You must accept the Terms of Use to continue.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await acceptWaiver()
      router.push("/dashboard")
    } catch (e: any) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-[(family-name:var(--font-garamond))] text-2xl text-navy font-bold mb-2">
            Terms of Use & Liability Waiver
          </h1>
          <p className="text-muted text-sm">
            Please read and accept these terms before using ImplantCheck.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-h-[60vh] overflow-y-auto shadow-sm">
          <div className="text-sm text-body leading-relaxed whitespace-pre-wrap font-['Inter',sans-serif]">
            {WAIVER_TEXT}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked)
                setError("")
              }}
              className="mt-0.5 accent-gold w-4 h-4"
            />
            <div>
              <p className="text-sm font-medium text-navy">
                I have read and accept the Terms of Use, Disclaimer & Vicarious Liability Waiver
              </p>
              <p className="text-xs text-muted mt-1">
                By checking this box, I confirm that I am a registered dental professional in good standing with the GDC (or equivalent regulatory body) and agree to be bound by these Terms. This digital acceptance forms a binding legal agreement equivalent to a handwritten signature.
              </p>
            </div>
          </label>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleAccept}
            disabled={!accepted || submitting}
            className="mt-5 w-full px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Accept & Continue"}
          </button>
        </div>
      </main>
    </div>
  )
}
