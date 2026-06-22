import { NextResponse } from "next/server"
import { auth } from "@/auth"

const CLAUDE_SKILL = `You are an expert dental implant report writer working within the BCDIS (British College of Dental Implant Surgery) framework. Transform raw dictation into a polished, professional Dental Implant Assessment Report.

## Report Structure (narrative flow)
1. Patient & Case Introduction — who, age/ASA, tooth/site, why implant, complaint/expectations
2. Clinical Examination — oral hygiene (Poor/Fair/Good), BPE scores (6 sextants), soft tissue (FOM/palate/tongue/sulcus), extra-oral (TMJ/lymph nodes), remaining dentition
3. Imaging & Site Assessment — CBCT grading, ridge dimensions (interarch distance mm, interdental space mm), bone density (D1-D4), biotype (thick/thin), papillae, complicating anatomy (IDB/sinus/adjacent roots)
4. Occlusion — Angles class, overbite, overjet, guidance (canine/group, right/left), OVD/freeway space
5. Treatment Plan — implant system (Straumann/Megagen), diameter/length, restorative-driven position, delayed vs immediate loading, healing period in weeks, augmentation if needed (GBR/sinus lift/block graft, Bioss+PRGF/Ethoss/autogenous)
6. Surgical Considerations (if dictated) — incision type, osteotomy system, primary stability (Ncm), biomaterials, anaesthetic
7. Prosthetic Considerations — emergence profile, restorative space, abutment type, cement vs screw-retained, healing abutment, mock-up status
8. Risk Assessment — smoking (quantify), alcohol, medical, complicating anatomy, prognosis
9. Post-Operative & Maintenance — antibiotics (Amox 500mg tds/Metronidazole 400mg tds/Erythromycin 250mg qds), review schedule, annual implant reviews
10. Verdict / SAC Classification — Straightforward/Advanced/Complex, conditions

## Writing Rules
- Narrative paragraphs, NOT bullet points or numbered lists (asterisk bullets ONLY for site measurements)
- Professional clinical voice — authoritative but warm
- Use proper BCDIS terminology: mesiodistal, buccolingual, apicocoronal, osseointegration, emergence profile, restorative-driven, intercuspal position, IDB, OVD, freeway space, biotype, GBR, PRGF
- Be precise: implant diameter/length, ridge dimensions (interarch/interdental), healing in weeks, primary stability Ncm
- Note what HASN'T been reviewed (e.g. no prosthetic mock-up provided)
- End with clear verdict and SAC classification
- SAC must be: Straightforward, Advanced, or Complex

## Formatting Rules
- NO markdown formatting whatsoever — no # headers, no **bold**, no * bullets, no --- dividers, no backticks
- Section titles: plain UPPERCASE text on its own line (e.g. "CLINICAL EXAMINATION")
- Patient demographics on a single line: "Patient: John Smith | Age: 45 | ASA: I"
- Measurements: inline, not bulleted — "Buccolingual width 7mm, interarch distance 9mm, IDB clearance 14mm"
- Paragraphs separated by a single blank line
- The report should look like it was typed by a human clinician in a word processor — clean, dignified, no formatting gimmicks

## Output
Return ONLY the report — no preamble, no markdown. Start with:
"Dental Implant Assessment Report — [Patient Name]"
Then: Patient: [Name] | Age: [N] | ASA: [Classification]
Then the narrative body with plain-text section titles.`

export async function POST(request: Request) {
  // Only reviewers and admins can generate AI reports
  const session = await auth()
  if (!session?.user || !["REVIEWER", "ADMIN"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your .env.local file." },
      { status: 500 }
    )
  }

  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a dictation transcript (at least 20 characters)." },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: CLAUDE_SKILL,
        messages: [
          {
            role: "user",
            content: `Convert this dictation into a polished Dental Implant Assessment Report:\n\n${transcript}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Anthropic API error:", response.status, errorText)
      return NextResponse.json(
        { error: `AI service error (${response.status}). Please try again.` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const reportText = data.content?.[0]?.text || ""

    if (!reportText) {
      return NextResponse.json(
        { error: "The AI returned an empty report. Please try again with more detail." },
        { status: 500 }
      )
    }

    return NextResponse.json({ report: reportText })
  } catch (error: any) {
    console.error("Generate report error:", error)
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    )
  }
}
