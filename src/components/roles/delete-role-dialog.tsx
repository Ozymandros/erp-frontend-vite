"use client"

import { useState } from "react"
import { rolesService } from "@/api/services/roles.service"
import type { Role } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeleteRoleDialogProps {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteRoleDialog({ role, open, onOpenChange, onSuccess }: DeleteRoleDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await rolesService.deleteRole(role.id)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this role? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Role Name:</span> {role.name}
            </p>
            {role.description && (
              <p className="text-sm">
                <span className="font-medium">Description:</span> {role.description}
              </p>
            )}
            {role.permissions && role.permissions.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Permissions:</span> {role.permissions.length}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
