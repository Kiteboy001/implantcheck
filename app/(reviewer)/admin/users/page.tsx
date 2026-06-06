import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CreateReviewerForm } from "./CreateReviewerForm"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/admin")

  const reviewers = await prisma.user.findMany({
    where: { role: "REVIEWER" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })

  // Get workload stats
  const reviewerWorkloads = await Promise.all(
    reviewers.map(async (r) => {
      const count = await prisma.case.count({
        where: { reviewerId: r.id, status: { in: ["PENDING", "UNDER_REVIEW"] } },
      })
      return { ...r, activeCases: count }
    })
  )

  const submitters = await prisma.user.findMany({
    where: { role: "SUBMITTER" },
    select: { id: true, name: true, email: true, _count: { select: { submittedCases: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[(family-name:var(--font-garamond))] text-3xl text-navy font-bold mb-1">
            User Management
          </h1>
          <p className="text-muted">
            Manage reviewers and view submitters
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reviewers */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <CreateReviewerForm existingReviewers={reviewers} />

          {reviewerWorkloads.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Active Workload
              </h4>
              <div className="space-y-2">
                {reviewerWorkloads.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-sm text-body">{r.name || r.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.activeCases > 3 ? "bg-red-100 text-red-800" :
                      r.activeCases > 0 ? "bg-amber-100 text-amber-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {r.activeCases} active case{r.activeCases !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submitters */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Submitters ({submitters.length})
          </h3>
          {submitters.length === 0 ? (
            <p className="text-sm text-muted">No submitters registered yet.</p>
          ) : (
            <div className="space-y-3">
              {submitters.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-warm-bg rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-navy">{s.name || "—"}</p>
                    <p className="text-xs text-muted">{s.email}</p>
                  </div>
                  <span className="text-xs text-muted">
                    {s._count.submittedCases} case{s._count.submittedCases !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
