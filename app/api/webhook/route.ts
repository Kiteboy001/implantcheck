import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getStripe() {
  const Stripe = require("stripe")
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-05-27.dahlia",
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") || ""

  const stripe = getStripe()

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (e: any) {
    console.error("Webhook signature verification failed:", e.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const caseId = session.metadata?.caseId

    if (caseId) {
      try {
        const c = await prisma.case.findUnique({ where: { id: caseId } })
        if (c && c.paymentStatus === "UNPAID") {
          await prisma.case.update({
            where: { id: caseId },
            data: { paymentStatus: "PAID" },
          })
          console.log(`Payment confirmed for case ${caseId}`)
        }
      } catch (e) {
        console.error("Failed to update case payment status:", e)
      }
    }
  }

  return NextResponse.json({ received: true })
}
