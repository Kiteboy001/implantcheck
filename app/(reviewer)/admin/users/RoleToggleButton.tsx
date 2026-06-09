"use client"

import { useActionState } from "react"
import { changeUserRole, type ManageUserState } from "@/app/actions/users"

const initialState: ManageUserState = {}

export function RoleToggleButton({ userId, currentRole, userName }: { userId: string; currentRole: string; userName: string }) {
  const [state, formAction, isPending] = useActionState(changeUserRole, initialState)

  if (currentRole === "SUBMITTER") {
    return (
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="newRole" value="REVIEWER" />
        {state.error && <p className="text-xs text-red-600 mb-1">{state.error}</p>}
        {state.success && <p className="text-xs text-green-600 mb-1">{state.success}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="text-xs text-gold hover:text-gold-light font-medium disabled:opacity-50"
        >
          {isPending ? "Promoting..." : `Make Reviewer`}
        </button>
      </form>
    )
  }

  return null
}
