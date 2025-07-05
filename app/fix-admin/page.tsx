"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function FixAdminPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const checkAndFixUser = async () => {
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch('/api/admin/check-user')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check user')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Please sign in to access admin fix.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fix Admin User Issue
              </CardTitle>
              <CardDescription>
                Check and create the admin user if it doesn't exist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Target User ID: <code className="bg-muted px-1 rounded">user_2zSsXcOz5ZAKmZcDBnpVJaiAZ6L</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  Current User: <code className="bg-muted px-1 rounded">{user.id}</code>
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={checkAndFixUser} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Check and Fix Admin User
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Target User:</h4>
                  <div className="bg-muted p-3 rounded">
                    <p><strong>ID:</strong> {result.targetUser.id}</p>
                    <p><strong>Name:</strong> {result.targetUser.name}</p>
                    <p><strong>Email:</strong> {result.targetUser.email}</p>
                    <p><strong>Role:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{result.targetUser.role}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Environment:</h4>
                  <div className="bg-muted p-3 rounded">
                    <p><strong>INITIAL_ADMIN_IDS:</strong> {result.environment.INITIAL_ADMIN_IDS || 'Not set'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">All Users ({result.allUsers.length}):</h4>
                  <div className="space-y-2">
                    {result.allUsers.map((user: any, index: number) => (
                      <div key={user.id} className="bg-muted p-3 rounded">
                        <p><strong>{index + 1}.</strong> {user.name} ({user.email})</p>
                        <p className="text-sm">Role: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{user.role}</span> | Created: {new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 