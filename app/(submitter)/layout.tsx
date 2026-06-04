import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SubmitterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <img src="/logo-horizontal.jpg" alt="ImplantCheck" className="h-10 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm text-navy font-medium hover:text-gold transition-colors"
                >
                  My Cases
                </Link>
                <Link
                  href="/cases/new"
                  className="text-sm text-body hover:text-navy transition-colors"
                >
                  New Case
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
