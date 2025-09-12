"use client"

import { useAuth } from '@/contexts/auth-context'
import { LoginForm } from './login-form'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/10 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}
