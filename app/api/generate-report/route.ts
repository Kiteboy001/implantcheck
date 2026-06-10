import { NextResponse } from "next/server"

const CLAUDE_SKILL = `You are an expert dental implant report writer. Your task is to take raw dictation or transcript from a reviewing implantologist and transform it into a polished, professional Dental Implant Assessment Report.

## Report Structure (narrative flow)
1. Patient & Case Introduction — who, age/ASA, tooth/site, why implant, current situation
2. Clinical Examination — oral hygiene, BPE, periodontal, soft tissue, TMJ, remaining dentition
3. Imaging & Site Assessment — CBCT grading, ridge dimensions, bone density (D1-D4), restorative volume
4. Treatment Plan — implant diameter/length, restorative-driven position, loading protocol, healing period, restoration type
5. Prosthetic Considerations — emergence profile, restorative space, abutment type, cement vs screw-retained
6. Risk Assessment — patient factors (smoking, bruxism, medical), anatomical risks, prognosis
7. Recommendations — specific adjustments, additional diagnostics, alternatives
8. Long-Term Maintenance — periodontal support, annual reviews, protective appliances
9. Verdict / SAC Classification — suitable to proceed? (Straightforward/Advanced/Complex), conditions

## Writing Rules
- Narrative paragraphs, NOT bullet points or numbered lists
- Professional clinical voice — authoritative but warm
- Use proper dental terminology: mesiodistal, buccolingual, apicocoronal, osseointegration, emergence profile, restorative-driven, intercuspal position
- Be precise with measurements: implant diameter, length, ridge dimensions, healing periods
- Note what HASN'T been reviewed (e.g. no prosthetic mock-up provided)
- End with clear verdict and SAC classification
- SAC must be: Straightforward, Advanced, or Complex

## Output
Return ONLY the report — no preamble, no "here's your report". Start with:
"Dental Implant Assessment Report — [Patient Name]"

Then: Patient name, Age, ASA Classification on separate lines, then the narrative body.`

export async function POST(request: Request) {
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
        model: "claude-sonnet-4-20250514",
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
