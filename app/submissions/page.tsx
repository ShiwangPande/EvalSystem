"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  User, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  FileText,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { useSubmissions } from '@/hooks/use-submissions'

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const { submissions, isLoading, error } = useSubmissions({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined
  })

  const getStatusBadge = (submission: any) => {
    const completedEvaluations = submission.evaluations.filter((e: any) => e.isCompleted).length
    const totalEvaluations = submission.evaluations.length
    
    if (totalEvaluations === 0) {
      return <Badge variant="outline" className="border-orange-200 text-orange-700"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
    } else if (completedEvaluations === totalEvaluations) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Review</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return submissions.filter(submission => {
      const completedEvaluations = submission.evaluations.filter((e: any) => e.isCompleted).length
      const totalEvaluations = submission.evaluations.length
      
      if (status === "pending") return totalEvaluations === 0
      if (status === "completed") return completedEvaluations === totalEvaluations && totalEvaluations > 0
      if (status === "in-review") return completedEvaluations < totalEvaluations && totalEvaluations > 0
      return false
    }).length
  }

  const getAverageScore = (submission: any) => {
    const completedEvaluations = submission.evaluations.filter((e: any) => e.isCompleted && e.totalScore !== null)
    if (completedEvaluations.length === 0) return null
    
    const totalScore = completedEvaluations.reduce((sum: number, e: any) => sum + (e.totalScore || 0), 0)
    return (totalScore / completedEvaluations.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
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
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Submissions
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Manage and review all student submissions
              </p>
            </div>
            <Button asChild className="w-full lg:w-auto">
              <Link href="/submissions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Submission
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-xl md:text-2xl font-bold">{submissions.length}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-xl md:text-2xl font-bold">{getStatusCount('pending')}</p>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Review</p>
                    <p className="text-xl md:text-2xl font-bold">{getStatusCount('in-review')}</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-xl md:text-2xl font-bold">{getStatusCount('completed')}</p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions by title, description, or student name..."
                    className="pl-10 h-11"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[180px] h-11">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-11">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium mb-3">No submissions found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by creating your first submission"
                    }
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button asChild size="lg">
                      <Link href="/submissions/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Submission
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300 border-0 shadow-md">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <CardTitle className="text-lg md:text-xl">{submission.title}</CardTitle>
                          {getAverageScore(submission) && (
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                              <Star className="w-4 h-4 fill-current" />
                              {getAverageScore(submission)}/10
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-sm md:text-base leading-relaxed">
                          {submission.description}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(submission)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="font-medium truncate">{submission.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <Calendar className="h-3 w-3" />
                          </div>
                          <span className="truncate">{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <Users className="h-3 w-3" />
                          </div>
                          <span className="truncate">{submission.evaluations.length} evaluators</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <BarChart3 className="h-3 w-3" />
                          </div>
                          <span className="truncate">6 criteria</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                          <Link href={`/submissions/${submission.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        {submission.evaluations.length === 0 && (
                          <Button size="sm" asChild className="w-full sm:w-auto">
                            <Link href={`/evaluations/${submission.id}`}>
                              <Edit className="mr-1 h-4 w-4" />
                              Evaluate
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}