"use client"

import { useUser } from "@clerk/nextjs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, LogIn } from "lucide-react"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>
  }

  // If user is not signed in, show sign-in prompt
  if (!isSignedIn) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <Alert className="mb-6">
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              You need to be signed in to access this page.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // User is signed in, render children
  return <>{children}</>
} 