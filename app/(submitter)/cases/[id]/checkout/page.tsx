import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { CheckoutForm } from "./CheckoutForm"

const tierLabels: Record<string, { label: string; price: string; pricePence: number }> = {
  BASIC: { label: "Basic Check", price: "£95", pricePence: 9500 },
  STANDARD: { label: "Standard", price: "£199", pricePence: 19900 },
  COMPLEX: { label: "Complex", price: "£295", pricePence: 29500 },
  PILOT_GUIDE: { label: "Pilot Guide", price: "£399", pricePence: 39900 },
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { id } = await params

  const c = await prisma.case.findUnique({
    where: { id },
    include: { files: { select: { fileName: true } } },
  })

  if (!c) notFound()
  if (c.submitterId !== (session.user as any).id) redirect("/dashboard")
  if (c.paymentStatus !== "UNPAID") redirect(`/cases/${id}`)

  const tierInfo = tierLabels[c.tier] || { label: c.tier, price: "—", pricePence: 0 }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-garamond)] text-3xl text-navy font-bold mb-2">
          Checkout
        </h1>
        <p className="text-muted">
          Complete your payment to submit your case for expert review.
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-garamond)] text-lg text-navy font-bold mb-4">
          Order Summary
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Tier</span>
            <span className="text-navy font-medium">{tierInfo.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Files</span>
            <span className="text-navy font-medium">{c.files.length} file{c.files.length !== 1 ? "s" : ""}</span>
          </div>
          {c.softwareUsed && (
            <div className="flex justify-between">
              <span className="text-muted">Software</span>
              <span className="text-navy font-medium">{c.softwareUsed}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="text-navy font-semibold">Total</span>
            <span className="text-navy font-bold text-lg">{tierInfo.price}</span>
          </div>
        </div>
      </div>

      {/* Payment options */}
      <CheckoutForm caseId={id} tierLabel={tierInfo.label} tierPrice={tierInfo.price} pricePence={tierInfo.pricePence} />
    </div>
  )
}
