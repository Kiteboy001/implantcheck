"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export type ManageUserState = { error?: string; success?: string }

export async function createReviewer(
  prevState: ManageUserState,
  formData: FormData
): Promise<ManageUserState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") return { error: "Only admins can create reviewers" }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "A user with this email already exists" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, passwordHash, role: "REVIEWER" },
  })

  revalidatePath("/admin/users")
  return { success: `Reviewer ${name} created` }
}

export async function changeUserRole(
  prevState: ManageUserState,
  formData: FormData
): Promise<ManageUserState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") return { error: "Only admins can change roles" }

  const userId = formData.get("userId") as string
  const newRole = formData.get("newRole") as string

  if (!userId || !newRole) return { error: "User ID and role are required" }
  if (!["SUBMITTER", "REVIEWER"].includes(newRole)) return { error: "Invalid role" }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, role: true } })
  if (!user) return { error: "User not found" }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as any },
  })

  revalidatePath("/admin/users")
  return { success: `${user.name || user.email} is now a ${newRole.toLowerCase()}` }
}

export async function assignReviewer(
  prevState: ManageUserState,
  formData: FormData
): Promise<ManageUserState> {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const caseId = formData.get("caseId") as string
  const reviewerId = formData.get("reviewerId") as string

  if (!caseId) return { error: "Case ID is required" }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      reviewerId: reviewerId || null,
      status: reviewerId ? "UNDER_REVIEW" : "PENDING",
    },
  })

  revalidatePath("/admin/cases")
  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath("/admin")
  return { success: reviewerId ? "Reviewer assigned" : "Reviewer unassigned" }
}
