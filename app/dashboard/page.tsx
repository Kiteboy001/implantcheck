import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Nav */}
      <nav className="bg-gray-400 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-[family-name:var(--font-garamond)] text-xl font-bold text-navy">
                IMPLANT
              </span>
              <span className="font-[family-name:var(--font-garamond)] text-xl font-bold text-gold">
                CHECK
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-600 hover:text-navy transition-colors font-medium"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-garamond)] text-3xl text-navy font-bold mb-2">
              My Cases
            </h1>
            <p className="text-muted">
              Submit and track your treatment plan reviews
            </p>
          </div>
          <Link
            href="/cases/new"
            className="px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
          >
            + New Case
          </Link>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-garamond)] text-xl text-navy font-bold mb-2">
            No cases yet
          </h2>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Submit your first treatment plan for expert review by Dr. Avik Dandapat.
          </p>
          <Link
            href="/cases/new"
            className="inline-block px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors"
          >
            Submit Your First Case
          </Link>
        </div>
      </main>
    </div>
  )
}
