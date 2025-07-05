import { useState, useEffect } from 'react'

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
    evaluator: {
      id: string
      name: string
    }
  }>
}

interface UseSubmissionsOptions {
  status?: string
  search?: string
}

export function useSubmissions(options: UseSubmissionsOptions = {}) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.append('status', options.status)
      if (options.search) params.append('search', options.search)

      const response = await fetch(`/api/submissions?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const createSubmission = async (submissionData: { title: string; description: string }) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create submission')
      }

      const newSubmission = await response.json()
      setSubmissions(prev => [newSubmission, ...prev])
      return newSubmission
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create submission')
    }
  }

  const updateSubmission = async (id: string, submissionData: { title: string; description: string }) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update submission')
      }

      const updatedSubmission = await response.json()
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? updatedSubmission : sub)
      )
      return updatedSubmission
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update submission')
    }
  }

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete submission')
      }

      setSubmissions(prev => prev.filter(sub => sub.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete submission')
    }
  }

  const getSubmission = async (id: string): Promise<Submission> => {
    try {
      const response = await fetch(`/api/submissions/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch submission')
      }

      return await response.json()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch submission')
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [options.status, options.search])

  return {
    submissions,
    isLoading,
    error,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    getSubmission,
    refetch: fetchSubmissions
  }
} 