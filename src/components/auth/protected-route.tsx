"use client"

import React from "react"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredResource?: string
  requiredAction?: string
}

export function ProtectedRoute({ children, requiredResource, requiredAction }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkPermission } = useAuth()
  const location = useLocation()
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const verifyPermission = async () => {
      if (requiredResource && requiredAction) {
        const allowed = await checkPermission(requiredResource, requiredAction)
        setHasPermission(allowed)
      } else {
        setHasPermission(true)
      }
    }

    if (isAuthenticated && !isLoading) {
      verifyPermission()
    }
  }, [isAuthenticated, isLoading, requiredResource, requiredAction, checkPermission])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredResource && requiredAction && hasPermission === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this module. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  if (hasPermission === null && requiredResource && requiredAction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
