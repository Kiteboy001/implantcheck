import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const role = (session.user as any).role
  if (role !== "REVIEWER" && role !== "ADMIN") {
    redirect("/dashboard")
  }

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { waiverAccepted: true },
  })

  // Waiver page is outside this route group — no redirect loop risk
  if (!user?.waiverAccepted) {
    redirect("/waiver")
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin">
                <img src="/logo-horizontal.jpg" alt="ImplantCheck" className="h-10 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link
                  href="/admin"
                  className="text-sm text-navy font-medium hover:text-gold transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/cases"
                  className="text-sm text-body hover:text-navy transition-colors"
                >
                  Cases
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm text-body hover:text-navy transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/tokens"
                  className="text-sm text-body hover:text-navy transition-colors"
                >
                  Tokens
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-body hover:text-navy transition-colors font-medium"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
