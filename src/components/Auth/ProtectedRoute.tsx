import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireEmailVerified?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireEmailVerified = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }

  if (requireEmailVerified && user && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />
  }

  return <>{children}</>
}

