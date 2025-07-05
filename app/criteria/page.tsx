"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Settings, Plus, Edit, Trash2, GripVertical, Save, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"

export default function CriteriaPage() {

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<any>(null)

  const [criteria, setCriteria] = useState([
    {
      id: "1",
      name: "Technical Implementation",
      description: "Code architecture, best practices, and technical execution",
      weight: 30,
      maxScore: 10,
      isActive: true,
      order: 1,
    },
    {
      id: "2",
      name: "Code Quality",
      description: "Code readability, organization, and maintainability",
      weight: 25,
      maxScore: 10,
      isActive: true,
      order: 2,
    },
    {
      id: "3",
      name: "Documentation",
      description: "Quality and completeness of project documentation",
      weight: 20,
      maxScore: 10,
      isActive: true,
      order: 3,
    },
    {
      id: "4",
      name: "UI/UX Design",
      description: "User interface design and user experience",
      weight: 15,
      maxScore: 10,
      isActive: true,
      order: 4,
    },
    {
      id: "5",
      name: "Innovation",
      description: "Creative solutions and innovative approaches",
      weight: 10,
      maxScore: 10,
      isActive: true,
      order: 5,
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: 0,
    maxScore: 10,
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      weight: 0,
      maxScore: 10,
      isActive: true,
    })
    setEditingCriteria(null)
  }

  const handleEdit = (criterion: any) => {
    setEditingCriteria(criterion)
    setFormData({
      name: criterion.name,
      description: criterion.description,
      weight: criterion.weight,
      maxScore: criterion.maxScore,
      isActive: criterion.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Criteria name is required.")
      return
    }

    if (editingCriteria) {
      // Update existing criteria
      setCriteria((prev) => prev.map((c) => (c.id === editingCriteria.id ? { ...c, ...formData } : c)))
      toast.success("The evaluation criteria has been updated successfully.")
    } else {
      // Add new criteria
      const newCriteria = {
        id: Date.now().toString(),
        ...formData,
        order: criteria.length + 1,
      }
      setCriteria((prev) => [...prev, newCriteria])
      toast.success("New evaluation criteria has been added successfully.")
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id))
    toast.success("The evaluation criteria has been deleted.")
  }

  const toggleActive = (id: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)))
  }

  const getTotalWeight = () => {
    return criteria.filter((c) => c.isActive).reduce((sum, c) => sum + c.weight, 0)
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Evaluation Criteria</h1>
            <p className="text-muted-foreground">Manage and configure evaluation criteria</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCriteria ? "Edit Criteria" : "Add New Criteria"}</DialogTitle>
                <DialogDescription>
                  {editingCriteria
                    ? "Update the evaluation criteria details."
                    : "Create a new evaluation criteria for submissions."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Criteria Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Technical Implementation"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this criteria evaluates..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (%)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Max Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      value={formData.maxScore}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxScore: Number.parseInt(e.target.value) || 10 }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingCriteria ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Criteria List */}
          <div className="lg:col-span-3 space-y-4">
            {criteria.map((criterion, index) => (
              <Card key={criterion.id} className={!criterion.isActive ? "opacity-60" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="cursor-move mt-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{criterion.name}</h3>
                          <Badge variant={criterion.isActive ? "default" : "secondary"}>
                            {criterion.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{criterion.weight}% weight</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Max Score: {criterion.maxScore}</span>
                          <span>Order: {criterion.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={criterion.isActive} onCheckedChange={() => toggleActive(criterion.id)} />
                      <Button variant="outline" size="sm" onClick={() => handleEdit(criterion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(criterion.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {criteria.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No criteria defined</h3>
                    <p className="text-muted-foreground mb-4">Create your first evaluation criteria to get started.</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Criteria
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Criteria</span>
                  <span className="font-medium">{criteria.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium">{criteria.filter((c) => c.isActive).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span className={`font-medium ${getTotalWeight() === 100 ? "text-green-600" : "text-red-600"}`}>
                    {getTotalWeight()}%
                  </span>
                </div>
                {getTotalWeight() !== 100 && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">⚠️ Total weight should equal 100%</div>
                )}
              </CardContent>
            </Card>

            {/* Weight Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Distribution</CardTitle>
                <CardDescription>How criteria weights are distributed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {criteria
                  .filter((c) => c.isActive)
                  .map((criterion) => (
                    <div key={criterion.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{criterion.name}</span>
                        <span className="font-medium">{criterion.weight}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${criterion.weight}%` }} />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Reorder Criteria
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Save className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  )
}
