"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  User, 
  Calendar, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { EvaluatorGuard } from '@/components/evaluator-guard'

interface Evaluation {
  id: string
  submission: {
    id: string
    title: string
    description: string
    student: {
      id: string
      name: string
      email: string
    }
    createdAt: string
  }
  totalScore: number | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/evaluations')
        
        if (!response.ok) {
          throw new Error(`Failed to load evaluations: ${response.status}`)
        }
        
        const data = await response.json()
        setEvaluations(data)
      } catch (error) {
        console.error('Error fetching evaluations:', error)
        setError(error instanceof Error ? error.message : 'Failed to load evaluations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluations()
  }, [])

  const getStatusBadge = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    } else {
      return <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        In Progress
      </Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <EvaluatorGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Evaluations
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Review and evaluate student submissions
            </p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button asChild className="w-full lg:w-auto">
              <Link href="/submissions">
                <Plus className="h-4 w-4 mr-2" />
                View Submissions
              </Link>
            </Button>
          </div>
        </div>

        {/* Evaluations List */}
        {evaluations.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-3">No evaluations yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You haven't been assigned any evaluations yet. Check back later or contact an administrator.
              </p>
              <Button asChild size="lg">
                <Link href="/submissions">View Available Submissions</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="text-lg md:text-xl font-semibold">{evaluation.submission.title}</h3>
                        <div className="flex-shrink-0">
                          {getStatusBadge(evaluation)}
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                        {evaluation.submission.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="truncate">{evaluation.submission.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <Calendar className="h-3 w-3" />
                          </div>
                          <span className="truncate">Submitted {formatDate(evaluation.submission.createdAt)}</span>
                        </div>
                        {evaluation.totalScore !== null && (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-yellow-500/10 rounded">
                              <Star className="h-3 w-3 text-yellow-500" />
                            </div>
                            <span className="font-medium">{evaluation.totalScore.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex w-full lg:w-auto">
                      <Button asChild className="w-full lg:w-auto">
                        <Link href={`/evaluations/${evaluation.submission.id}`}>
                          {evaluation.isCompleted ? 'View Evaluation' : 'Start Evaluation'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </EvaluatorGuard>
  )
}