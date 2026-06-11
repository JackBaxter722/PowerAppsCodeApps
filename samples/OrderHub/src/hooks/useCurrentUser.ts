// Reads the Power Apps app/user context (signed-in user, app + environment ids,
// session) once and caches it. Used by the header avatar/popover and telemetry.

import { useQuery } from '@tanstack/react-query'
import { getContext } from '@microsoft/power-apps/app'

export function useCurrentContext() {
  return useQuery({
    queryKey: ['power-context'],
    queryFn: getContext,
    staleTime: Infinity,
    retry: false,
  })
}

export interface CurrentUser {
  fullName: string
  initials: string
  userPrincipalName?: string
  objectId?: string
  tenantId?: string
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function useCurrentUser(): CurrentUser {
  const { data } = useCurrentContext()
  const user = data?.user
  const fullName = user?.fullName?.trim() || 'Signed-out user'
  return {
    fullName,
    initials: toInitials(fullName),
    userPrincipalName: user?.userPrincipalName,
    objectId: user?.objectId,
    tenantId: user?.tenantId,
  }
}
