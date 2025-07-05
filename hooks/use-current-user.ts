import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'EVALUATOR' | 'ADMIN'
}

export function useCurrentUser() {
  const { user, isSignedIn } = useUser()
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn || !user) {
      setDbUser(null)
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}`)
        if (response.ok) {
          const userData = await response.json()
          setDbUser(userData)
        } else {
          // If user doesn't exist in DB, create them
          const createResponse = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || 'Unknown User',
              role: 'STUDENT'
            }),
          })
          
          if (createResponse.ok) {
            const newUser = await createResponse.json()
            setDbUser(newUser)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [isSignedIn, user])

  return {
    user: dbUser,
    isSignedIn,
    isLoading,
    role: dbUser?.role || 'STUDENT'
  }
} 