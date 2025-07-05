"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Loader2
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { AdminGuard } from '@/components/admin-guard'
import { toast } from 'sonner'

interface Criteria {
  id: string
  name: string
  description?: string
  weight: number
  maxScore: number
  order: number
  isActive: boolean
}

export default function CriteriaManagementPage() {
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: 1.0,
    maxScore: 10,
    order: 0
  })

  useEffect(() => {
    fetchCriteria()
  }, [])

  const fetchCriteria = async () => {
    try {
      const response = await fetch('/api/criteria')
      if (!response.ok) throw new Error('Failed to fetch criteria')
      const data = await response.json()
      setCriteria(data)
    } catch (error) {
      toast.error('Failed to load criteria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingCriteria ? `/api/criteria/${editingCriteria.id}` : '/api/criteria'
      const method = editingCriteria ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save criteria')

      toast.success(editingCriteria ? 'Criteria updated' : 'Criteria created')
      setIsDialogOpen(false)
      resetForm()
      fetchCriteria()
    } catch (error) {
      toast.error('Failed to save criteria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (criteria: Criteria) => {
    setEditingCriteria(criteria)
    setFormData({
      name: criteria.name,
      description: criteria.description || "",
      weight: criteria.weight,
      maxScore: criteria.maxScore,
      order: criteria.order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/criteria/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete criteria')

      toast.success('Criteria deleted')
      fetchCriteria()
    } catch (error) {
      toast.error('Failed to delete criteria')
    }
  }

  const resetForm = () => {
    setEditingCriteria(null)
    setFormData({
      name: "",
      description: "",
      weight: 1.0,
      maxScore: 10,
      order: 0
    })
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

  return (
    <AdminGuard>
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Criteria Management</h1>
              <p className="text-muted-foreground text-lg">
                Manage evaluation criteria and scoring standards
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Criteria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCriteria ? 'Edit Criteria' : 'Add New Criteria'}
                  </DialogTitle>
                  <DialogDescription>
                    Define evaluation criteria with name, description, weight, and maximum score.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxScore">Max Score</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        min="1"
                        value={formData.maxScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingCriteria ? 'Update' : 'Create'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Criteria List */}
          <div className="grid gap-4">
            {criteria.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No criteria defined</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first evaluation criteria.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Criteria
                  </Button>
                </CardContent>
              </Card>
            ) : (
              criteria.map((criterion) => (
                <Card key={criterion.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{criterion.name}</h3>
                          <Badge variant={criterion.isActive ? "default" : "secondary"}>
                            {criterion.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {criterion.description && (
                          <p className="text-sm text-muted-foreground">
                            {criterion.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Weight: {criterion.weight}</span>
                          <span>Max Score: {criterion.maxScore}</span>
                          <span>Order: {criterion.order}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(criterion)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Criteria</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{criterion.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(criterion.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
    </AdminGuard>
  )
} 