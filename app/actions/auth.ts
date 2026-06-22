"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  gdcNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{5,8}$/.test(v), "GDC number must be 5–8 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signup(_prev: any, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    gdcNumber: (formData.get("gdcNumber") as string) || undefined,
    password: formData.get("password"),
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, gdcNumber, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "An account with this email already exists" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, passwordHash, gdcNumber, role: "SUBMITTER" },
  })

  // Auto-sign-in after signup
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (err: any) {
    // Sign-in can fail even after successful user creation (NextAuth session timing).
    // Fall back to login redirect rather than crashing to blank page.
    console.error("Auto-sign-in after signup failed:", err.message)
    redirect("/auth/login?registered=true")
  }

  redirect("/dashboard")
}

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export async function login(_prev: any, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (err: any) {
    if (err?.type === "CredentialsSignin") {
      return { error: "Invalid email or password" }
    }
    throw err
  }

  // Redirect based on role
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  })

  if (user?.role === "ADMIN" || user?.role === "REVIEWER") {
    redirect("/admin")
  }

  redirect("/dashboard")
}

export async function logout() {
  await signOut({ redirect: false })
  redirect("/")
}
