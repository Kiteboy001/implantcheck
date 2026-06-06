import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function getStripe() {
  const Stripe = require("stripe")
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-05-27.dahlia",
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { caseId, pricePence, tierLabel } = await req.json()

  if (!caseId || !pricePence) {
    return NextResponse.json({ error: "Missing caseId or pricePence" }, { status: 400 })
  }

  // Verify case belongs to this user and is unpaid
  const c = await prisma.case.findUnique({ where: { id: caseId } })
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 })
  if (c.submitterId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not your case" }, { status: 403 })
  }
  if (c.paymentStatus !== "UNPAID") {
    return NextResponse.json({ error: "Already paid" }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3333"

  try {
    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `ImplantCheck — ${tierLabel || "Case Review"}`,
              description: "Expert implant treatment plan review",
            },
            unit_amount: pricePence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/cases/${caseId}?payment=success`,
      cancel_url: `${baseUrl}/cases/${caseId}/checkout?payment=cancelled`,
      metadata: {
        caseId,
        userId: (session.user as any).id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (e: any) {
    console.error("Stripe checkout error:", e)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
