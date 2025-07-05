"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function TestAdminPage() {
  const { user } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      checkUserStatus()
    }
  }, [user])

  const checkUserStatus = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      // First ensure user exists
      await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || 'Unknown User'
        })
      })

      // Then get user data
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        throw new Error('Failed to fetch user data')
      }
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
            <p className="text-muted-foreground">Please sign in to test admin promotion.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Test Automatic Admin Promotion
              </CardTitle>
              <CardDescription>
                Verify that users in INITIAL_ADMIN_IDS get admin role automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your User ID: <code className="bg-muted px-1 rounded">{user.id}</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  Name: {user.fullName || user.firstName || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {user.primaryEmailAddress?.emailAddress || 'No email'}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Checking user status...</span>
                </div>
              ) : userData ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      User data retrieved successfully!
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Database User Info:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>ID:</strong> {userData.id}</p>
                      <p><strong>Name:</strong> {userData.name}</p>
                      <p><strong>Email:</strong> {userData.email}</p>
                      <p><strong>Role:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          userData.role === 'ADMIN' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {userData.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  {userData.role === 'ADMIN' ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription>
                        ✅ Success! You have been automatically promoted to ADMIN role.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        ❌ You are not an admin. Check if your user ID is in INITIAL_ADMIN_IDS.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={checkUserStatus} variant="outline" className="w-full">
                    Refresh Status
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 