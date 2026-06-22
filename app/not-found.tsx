import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-[(family-name:var(--font-garamond))] text-8xl text-navy font-bold mb-4">
          404
        </h1>
        <h2 className="font-[(family-name:var(--font-garamond))] text-2xl text-navy font-bold mb-2">
          Page not found
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
