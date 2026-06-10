import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WaiverContent from "./WaiverContent"

export default async function WaiverPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { waiverAccepted: true },
  })

  // Already accepted — skip to dashboard
  if (user?.waiverAccepted) redirect("/dashboard")

  return <WaiverContent />
}
