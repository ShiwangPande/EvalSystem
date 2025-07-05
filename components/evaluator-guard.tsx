"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2 } from "lucide-react"

interface EvaluatorGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function EvaluatorGuard({ children, fallback }: EvaluatorGuardProps) {
  const { role, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (role !== 'EVALUATOR' && role !== 'ADMIN') {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <GraduationCap className="h-4 w-4" />
          <AlertDescription>
            Access denied. Evaluator or Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
} 