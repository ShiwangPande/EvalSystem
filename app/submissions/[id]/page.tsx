"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'

interface Submission {
  id: string
  title: string
  description: string
  categoryId?: string
  createdAt: string
  student: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
  }
  files: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    fileType?: string
  }>
  evaluations: Array<{
    id: string
    totalScore: number | null
    isCompleted: boolean
    evaluator: {
      id: string
      name: string
    }
  }>
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSubmission()
  }, [params.id])

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch submission')
      }
      const data = await response.json()
      setSubmission(data)
    } catch (err) {
      setError('Failed to load submission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/submissions/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete submission')
      }

      router.push('/submissions')
    } catch (err) {
      setError('Failed to delete submission')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = () => {
    if (!submission) return null
    
    const completedEvaluations = submission.evaluations.filter(e => e.isCompleted).length
    const totalEvaluations = submission.evaluations.length
    
    if (totalEvaluations === 0) {
      return <Badge variant="outline" className="border-orange-200 text-orange-700"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
    } else if (completedEvaluations === totalEvaluations) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
    }
  }

  const getAverageScore = () => {
    if (!submission) return null
    
    const completedEvaluations = submission.evaluations.filter(e => e.isCompleted && e.totalScore !== null)
    if (completedEvaluations.length === 0) return null
    
    const totalScore = completedEvaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0)
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

  if (error || !submission) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Alert>
              <AlertDescription>{error || 'Submission not found'}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === submission.student.id

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/submissions">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Submissions
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{submission.title}</h1>
                <p className="text-muted-foreground">
                  Submission by {submission.student.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/submissions/${submission.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your submission.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {submission.description}
                  </p>
                </CardContent>
              </Card>

              {/* File Attachments */}
              {submission.files && submission.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Files ({submission.files.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {submission.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{file.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                {file.fileType && ` • ${file.fileType.toUpperCase()}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                Preview
                              </a>
                            </Button>
                            <Button size="sm" asChild>
                              <a href={file.fileUrl} download={file.fileName}>
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Evaluations */}
              <Card>
                <CardHeader>
                  <CardTitle>Evaluations</CardTitle>
                  <CardDescription>
                    {submission.evaluations.length === 0 
                      ? "No evaluations yet" 
                      : `${submission.evaluations.length} evaluation(s)`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submission.evaluations.length === 0 ? (
                    <p className="text-muted-foreground">This submission hasn't been evaluated yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {submission.evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{evaluation.evaluator.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {evaluation.isCompleted ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Completed</span>
                                  {evaluation.totalScore && (
                                    <>
                                      <span>•</span>
                                      <span className="font-medium">{evaluation.totalScore}/10</span>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 text-orange-500" />
                                  <span>In Progress</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/evaluations/${submission.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{submission.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {getAverageScore() && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Average Score: {getAverageScore()}/10
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href={`/evaluations/${submission.id}`}>
                        Evaluate Submission
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
