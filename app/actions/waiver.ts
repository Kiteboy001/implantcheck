"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function acceptWaiver() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id

  await prisma.user.update({
    where: { id: userId },
    data: {
      waiverAccepted: true,
      waiverAcceptedAt: new Date(),
    },
  })

  revalidatePath("/waiver")
  revalidatePath("/dashboard")
}
