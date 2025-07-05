"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Star, 
  Users, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { AuthGuard } from '@/components/auth-guard'

interface Submission {
  id: string
  title: string
  description: string
  createdAt: string
  student: {
    id: string
    name: string
    email: string
  }
  evaluations: Array<{
    id: string
    totalScore: number | null
    isCompleted: boolean
  }>
}

interface DashboardStats {
  totalSubmissions: number
  pendingEvaluations: number
  activeEvaluators: number
  averageScore: number
  completedEvaluations: number
  totalCriteria: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingEvaluations: 0,
    activeEvaluators: 0,
    averageScore: 0,
    completedEvaluations: 0,
    totalCriteria: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ensure user exists in database when dashboard loads
  useEffect(() => {
    if (user) {
      fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || user.firstName || 'Unknown User',
        }),
      }).catch(error => {
        console.error('Error creating user:', error)
        // Don't show this error to the user as it's not critical
      })
    }
  }, [user])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch submissions
        const submissionsResponse = await fetch('/api/submissions')
        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions')
        }
        const submissionsData = await submissionsResponse.json()
        
        // Create a clean copy of the data
        const cleanSubmissions = Array.isArray(submissionsData) 
          ? submissionsData.map(submission => ({
              ...submission,
              student: submission.student ? { ...submission.student } : null,
              evaluations: Array.isArray(submission.evaluations) 
                ? submission.evaluations.map((evaluation: any) => ({ ...evaluation }))
                : []
            }))
          : []
        setSubmissions(cleanSubmissions)

        // Fetch criteria for stats
        const criteriaResponse = await fetch('/api/criteria')
        const criteriaData = criteriaResponse.ok ? await criteriaResponse.json() : []

        // Calculate stats
        const totalSubmissions = cleanSubmissions.length
        const pendingEvaluations = cleanSubmissions.filter(s => 
          s.evaluations && s.evaluations.length === 0
        ).length
        const completedEvaluations = cleanSubmissions.filter(s => 
          s.evaluations && s.evaluations.length > 0 && s.evaluations.every((e: any) => e.isCompleted)
        ).length
        
        // Calculate average score
        const allScores: number[] = []
        cleanSubmissions.forEach(s => {
          if (s.evaluations && Array.isArray(s.evaluations)) {
            s.evaluations.forEach((e: any) => {
              if (e.isCompleted && e.totalScore !== null) {
                allScores.push(e.totalScore)
              }
            })
          }
        })
        const averageScore = allScores.length > 0 
          ? Number((allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1))
          : 0

        // Get unique evaluators
        const evaluatorIds: string[] = []
        cleanSubmissions.forEach(s => {
          if (s.evaluations && Array.isArray(s.evaluations)) {
            s.evaluations.forEach((e: any) => {
              evaluatorIds.push(e.id)
            })
          }
        })
        const uniqueEvaluators = new Set(evaluatorIds).size

        setStats({
          totalSubmissions,
          pendingEvaluations,
          activeEvaluators: uniqueEvaluators,
          averageScore,
          completedEvaluations,
          totalCriteria: criteriaData.length
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData()
    }
  }, [user])

    const getStatusBadge = (submission: Submission) => {
    const evaluations = submission.evaluations || []
    const completedEvaluations = evaluations.filter(e => e.isCompleted).length
    const totalEvaluations = evaluations.length
    
    if (totalEvaluations === 0) {
      return <Badge variant="outline" className="border-orange-200 text-orange-700">
        <AlertCircle className="w-3 h-3 mr-1" />Pending
      </Badge>
    } else if (completedEvaluations === totalEvaluations) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />Completed
      </Badge>
    } else {
      return <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />In Progress
      </Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours} hours ago`
      if (diffInHours < 48) return '1 day ago'
      return `${Math.floor(diffInHours / 24)} days ago`
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Welcome back! Here's an overview of your evaluation system.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/submissions">
                  <FileText className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/submissions/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Submission
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">{stats.totalSubmissions}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  +3 from last week
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">{stats.pendingEvaluations}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Evaluators</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">{stats.activeEvaluators}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">{stats.averageScore}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of 10 points</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Submissions */}
            <Card className="xl:col-span-2 border-0 shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Recent Submissions</CardTitle>
                    <CardDescription>Latest submissions awaiting evaluation</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
                    <Link href="/submissions">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions.slice(0, 5).map((submission: Submission) => (
                  <div key={submission.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/50 hover:shadow-md transition-all duration-300">
                    <div className="space-y-2 sm:space-y-1 mb-3 sm:mb-0">
                      <p className="font-medium text-base">{submission.title}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {submission.student?.name || 'Unknown Student'}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {getStatusBadge(submission)}
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <Link href={`/submissions/${submission.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-medium mb-2">No submissions yet</p>
                    <p className="text-sm">Create your first submission to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">System Overview</CardTitle>
                <CardDescription>Current system status and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Total Criteria</span>
                    <span className="text-muted-foreground text-sm font-mono">{stats.totalCriteria}</span>
                  </div>
                  <Progress value={stats.totalCriteria > 0 ? 100 : 0} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Completed Evaluations</span>
                    <span className="text-muted-foreground text-sm font-mono">{stats.completedEvaluations}/{stats.totalSubmissions}</span>
                  </div>
                  <Progress 
                    value={stats.totalSubmissions > 0 ? (stats.completedEvaluations / stats.totalSubmissions) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Average Score</span>
                    <span className="text-muted-foreground text-sm font-mono">{stats.averageScore}/10</span>
                  </div>
                  <Progress value={stats.averageScore * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 group hover:shadow-md transition-all duration-300" asChild>
                  <Link href="/submissions/new">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <PlusCircle className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-medium">New Submission</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 group hover:shadow-md transition-all duration-300" asChild>
                  <Link href="/evaluations">
                    <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <span className="font-medium">Start Evaluation</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 group hover:shadow-md transition-all duration-300" asChild>
                  <Link href="/criteria">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="font-medium">Manage Criteria</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 group hover:shadow-md transition-all duration-300" asChild>
                  <Link href="/users">
                    <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="font-medium">User Management</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      </AuthGuard>
  )
}