"use client"

import type React from "react"

import { useState } from "react"
import { permissionsService } from "@/api/services/permissions.service"
import type { CreatePermissionRequest } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreatePermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePermissionDialog({ open, onOpenChange, onSuccess }: CreatePermissionDialogProps) {
  const [formData, setFormData] = useState<CreatePermissionRequest>({
    resource: "",
    action: "",
    description: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof CreatePermissionRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await permissionsService.createPermission({
        ...formData,
        description: formData.description || undefined,
      })
      onSuccess()
      setFormData({ resource: "", action: "", description: "" })
    } catch (err: any) {
      setError(err.message || "Failed to create permission")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>Add a new permission to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="resource">Resource *</Label>
              <Input
                id="resource"
                value={formData.resource}
                onChange={(e) => handleChange("resource", e.target.value)}
                required
                disabled={isLoading}
                placeholder="e.g., users, roles, permissions"
              />
              <p className="text-xs text-muted-foreground">The resource this permission applies to</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Input
                id="action"
                value={formData.action}
                onChange={(e) => handleChange("action", e.target.value)}
                required
                disabled={isLoading}
                placeholder="e.g., read, write, delete, manage"
              />
              <p className="text-xs text-muted-foreground">The action that can be performed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isLoading}
                placeholder="Describe what this permission allows..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
