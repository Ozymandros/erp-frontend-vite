"use client"

import { useState } from "react"
import { permissionsService } from "@/api/services/permissions.service"
import type { Permission } from "@/types/api.types"
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

interface DeletePermissionDialogProps {
  readonly permission: Permission;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function DeletePermissionDialog({ permission, open, onOpenChange, onSuccess }: DeletePermissionDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await permissionsService.deletePermission(permission.id)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete permission")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Permission</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this permission? This action cannot be undone and may affect roles that use
            this permission.
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
              <span className="font-medium">Resource:</span> {permission.module}
            </p>
            <p className="text-sm">
              <span className="font-medium">Action:</span> {permission.action}
            </p>
            {permission.description && (
              <p className="text-sm">
                <span className="font-medium">Description:</span> {permission.description}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
