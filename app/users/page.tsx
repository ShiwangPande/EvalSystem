"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, UserCheck, UserX, Mail, Calendar, MoreHorizontal, Plus, Loader2, AlertCircle, Shield, User, GraduationCap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'EVALUATOR' | 'ADMIN'
  createdAt: string
  evaluations?: Array<{
    id: string
    isCompleted: boolean
  }>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users')
        
        if (!response.ok) {
          throw new Error(`Failed to load users: ${response.status}`)
        }
        
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError(error instanceof Error ? error.message : 'Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "EVALUATOR":
        return "secondary"
      case "STUDENT":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin"
      case "EVALUATOR":
        return "Evaluator"
      case "STUDENT":
        return "Student"
      default:
        return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getEvaluationsCount = (user: User) => {
    return user.evaluations?.length || 0
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ))
      
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    } finally {
      setUpdatingRole(null)
    }
  }

  const stats = [
    {
      title: "Total Users",
      value: users.length.toString(),
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Evaluators",
      value: users.filter((u) => u.role === "EVALUATOR").length.toString(),
      icon: UserCheck,
      description: "Evaluation staff",
    },
    {
      title: "Students",
      value: users.filter((u) => u.role === "STUDENT").length.toString(),
      icon: Users,
      description: "Student accounts",
    },
    {
      title: "Admins",
      value: users.filter((u) => u.role === "ADMIN").length.toString(),
      icon: UserCheck,
      description: "Administrators",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/users/promote-admin', { method: 'POST' })
                  if (response.ok) {
                    window.location.reload()
                  }
                } catch (err) {
                  console.error('Error promoting to admin:', err)
                }
              }}
              variant="outline"
            >
              Promote to Admin (Development)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button className="w-full lg:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">All Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="group flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-xl hover:bg-muted/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-medium">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-base truncate">{user.name}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <Mail className="h-3 w-3" />
                          </div>
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            <Calendar className="h-3 w-3" />
                          </div>
                          <span className="truncate">Joined {formatDate(user.createdAt)}</span>
                        </div>
                        {user.role === "EVALUATOR" && (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-muted rounded">
                              <UserCheck className="h-3 w-3" />
                            </div>
                            <span className="truncate">{getEvaluationsCount(user)} evaluations</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={updatingRole === user.id} className="h-9 w-9 p-0">
                          {updatingRole === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Role: {getRoleDisplayName(user.role)}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.id, 'ADMIN')}
                          disabled={user.role === 'ADMIN'}
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.id, 'EVALUATOR')}
                          disabled={user.role === 'EVALUATOR'}
                          className="flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          Make Evaluator
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.id, 'STUDENT')}
                          disabled={user.role === 'STUDENT'}
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Make Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  )
}
