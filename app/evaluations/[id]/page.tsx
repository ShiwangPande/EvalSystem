"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Send, FileText, User, Calendar, Star, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [submission, setSubmission] = useState<{
    id: string
    title: string
    description: string
    student: {
      id: string
      name: string
      email: string
    }
    fileUrl?: string
    fileName?: string
    fileSize?: number
    createdAt: string
  } | null>(null)
  const [criteria, setCriteria] = useState<Array<{
    id: string
    name: string
    description: string
    weight: number
    maxScore: number
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch submission details
        const submissionResponse = await fetch(`/api/submissions/${id}`)
        if (!submissionResponse.ok) {
          throw new Error(`Failed to load submission: ${submissionResponse.status}`)
        }
        const submissionData = await submissionResponse.json()
        setSubmission(submissionData)

        // Fetch criteria
        const criteriaResponse = await fetch('/api/criteria')
        if (!criteriaResponse.ok) {
          throw new Error(`Failed to load criteria: ${criteriaResponse.status}`)
        }
        const criteriaData = await criteriaResponse.json()
        setCriteria(criteriaData)

        // Check if user has already evaluated this submission
        const existingEvaluationResponse = await fetch(`/api/evaluations?submissionId=${id}`)
        if (existingEvaluationResponse.ok) {
          const existingEvaluations = await existingEvaluationResponse.json()
          const userEvaluation = existingEvaluations.find((evaluation: any) => evaluation.isCompleted)
          
          if (userEvaluation) {
            // Load existing evaluation data
            const criteriaScores: Record<string, number> = {}
            const criteriaFeedback: Record<string, string> = {}
            
            userEvaluation.criteriaEvaluations.forEach((ce: any) => {
              criteriaScores[ce.criteriaId] = ce.score
              criteriaFeedback[ce.criteriaId] = ce.feedback || ''
            })
            
            setEvaluation({
              criteriaScores,
              criteriaFeedback,
              overallFeedback: userEvaluation.feedback || '',
              isCompleted: userEvaluation.isCompleted
            })
          } else {
            // Initialize empty evaluation state
            setEvaluation(prev => ({
              ...prev,
              criteriaScores: criteriaData.reduce(
                (acc: Record<string, number>, criterion: any) => ({
                  ...acc,
                  [criterion.id]: 0,
                }),
                {} as Record<string, number>,
              ),
              criteriaFeedback: criteriaData.reduce(
                (acc: Record<string, string>, criterion: any) => ({
                  ...acc,
                  [criterion.id]: "",
                }),
                {} as Record<string, string>,
              ),
            }))
          }
        } else {
          // Initialize empty evaluation state if fetch fails
          setEvaluation(prev => ({
            ...prev,
            criteriaScores: criteriaData.reduce(
              (acc: Record<string, number>, criterion: any) => ({
                ...acc,
                [criterion.id]: 0,
              }),
              {} as Record<string, number>,
            ),
            criteriaFeedback: criteriaData.reduce(
              (acc: Record<string, string>, criterion: any) => ({
                ...acc,
                [criterion.id]: "",
              }),
              {} as Record<string, string>,
            ),
          }))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const [evaluation, setEvaluation] = useState({
    criteriaScores: {} as Record<string, number>,
    criteriaFeedback: {} as Record<string, string>,
    overallFeedback: "",
    isCompleted: false,
  })

  const updateCriteriaScore = (criteriaId: string, score: number) => {
    setEvaluation((prev) => ({
      ...prev,
      criteriaScores: {
        ...prev.criteriaScores,
        [criteriaId]: score,
      },
    }))
  }

  const updateCriteriaFeedback = (criteriaId: string, feedback: string) => {
    setEvaluation((prev) => ({
      ...prev,
      criteriaFeedback: {
        ...prev.criteriaFeedback,
        [criteriaId]: feedback,
      },
    }))
  }

  const calculateWeightedScore = () => {
    return criteria.reduce((total, criterion) => {
      const score = evaluation.criteriaScores[criterion.id] || 0
      return total + (score * criterion.weight) / 100
    }, 0)
  }

  const getCompletionProgress = () => {
    const completedCriteria = criteria.filter(
      (criterion) =>
        evaluation.criteriaScores[criterion.id] > 0 && evaluation.criteriaFeedback[criterion.id].trim() !== "",
    ).length
    return (completedCriteria / criteria.length) * 100
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Your evaluation progress has been saved.")
    setIsSaving(false)
  }

  const handleSubmitEvaluation = async () => {
    if (!submission) {
      toast.error("Submission not found")
      return
    }

    const completedCriteria = criteria.filter(
      (criterion) =>
        evaluation.criteriaScores[criterion.id] > 0 && evaluation.criteriaFeedback[criterion.id].trim() !== "",
    ).length

    if (completedCriteria < criteria.length) {
      toast.error("Please complete all criteria before submitting.")
      return
    }

    if (!evaluation.overallFeedback.trim()) {
      toast.error("Please provide overall feedback before submitting.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          criteriaScores: evaluation.criteriaScores,
          criteriaFeedback: evaluation.criteriaFeedback,
          overallFeedback: evaluation.overallFeedback,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit evaluation')
      }

      toast.success(evaluation.isCompleted ? "The evaluation has been updated successfully." : "The evaluation has been completed and submitted successfully.")
      router.push("/evaluations")
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit evaluation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {evaluation.isCompleted ? 'Update Evaluation' : 'Evaluate Submission'}
            </h1>
            <p className="text-muted-foreground">
              {evaluation.isCompleted 
                ? 'Update your existing evaluation and feedback' 
                : 'Provide detailed evaluation and feedback'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/evaluations">Back to Evaluations</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-red-500 text-lg font-medium">Error Loading Data</div>
            <p className="text-muted-foreground text-center max-w-md">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : submission ? (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Submission Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {submission.title}
                  </CardTitle>
                  <CardDescription>{submission.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                      <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Student:</span>
                    <span>{submission.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>
                  </div>
                </CardContent>
              </Card>

            {/* Evaluation Criteria */}
            <div className="space-y-6">
              {criteria.map((criterion, index) => (
                <Card key={criterion.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{criterion.name}</CardTitle>
                        <CardDescription>{criterion.description}</CardDescription>
                      </div>
                      <Badge variant="outline">Weight: {criterion.weight}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Score: {evaluation.criteriaScores[criterion.id] || 0}/{criterion.maxScore}
                        </label>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{evaluation.criteriaScores[criterion.id] || 0}/10</span>
                        </div>
                      </div>
                      <Slider
                        value={[evaluation.criteriaScores[criterion.id] || 0]}
                        onValueChange={(value) => updateCriteriaScore(criterion.id, value[0])}
                        max={criterion.maxScore}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feedback</label>
                      <Textarea
                        placeholder={`Provide detailed feedback for ${criterion.name.toLowerCase()}...`}
                        value={evaluation.criteriaFeedback[criterion.id] || ""}
                        onChange={(e) => updateCriteriaFeedback(criterion.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Overall Feedback
                </CardTitle>
                <CardDescription>Provide comprehensive feedback about the entire submission</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your overall assessment, highlighting strengths, areas for improvement, and general observations..."
                  value={evaluation.overallFeedback}
                  onChange={(e) => setEvaluation((prev) => ({ ...prev, overallFeedback: e.target.value }))}
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Score Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{calculateWeightedScore().toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Weighted Score / 10</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {criteria.map((criterion) => (
                    <div key={criterion.id} className="flex justify-between text-sm">
                      <span className="truncate">{criterion.name}</span>
                      <span className="font-medium">
                        {(evaluation.criteriaScores[criterion.id] || 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{Math.round(getCompletionProgress())}%</span>
                  </div>
                  <Progress value={getCompletionProgress()} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Criteria completed</span>
                    <span>
                      {
                        criteria.filter(
                          (c) => evaluation.criteriaScores[c.id] > 0 && evaluation.criteriaFeedback[c.id].trim() !== "",
                        ).length
                      }
                      /{criteria.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall feedback</span>
                    <span className={evaluation.overallFeedback.trim() ? "text-green-600" : "text-muted-foreground"}>
                      {evaluation.overallFeedback.trim() ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            {submission.fileUrl && submission.fileName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Submission File
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{submission.fileName}</p>
                      {submission.fileSize && (
                        <p className="text-muted-foreground">
                          {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={submission.fileUrl} download={submission.fileName}>
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleSubmitEvaluation} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {evaluation.isCompleted ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {evaluation.isCompleted ? 'Update Evaluation' : 'Submit Evaluation'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Submission not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
