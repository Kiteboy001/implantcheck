"use client"

import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import Link from "next/link"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-[family-name:var(--font-garamond)] text-2xl font-bold text-navy">
              IMPLANT
            </span>
            <span className="font-[family-name:var(--font-garamond)] text-2xl font-bold text-gold">
              CHECK
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl text-navy font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-muted text-sm mb-8">
            Sign in to your ImplantCheck account
          </p>

          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-gold font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
