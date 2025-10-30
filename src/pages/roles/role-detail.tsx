"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { rolesService } from "@/api/services/roles.service"
import type { Role } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"
import { formatDateTime } from "@/lib/utils"

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchRole = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await rolesService.getRoleById(id)
      setRole(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch role")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [id])

  const handleRoleUpdated = () => {
    setIsEditDialogOpen(false)
    fetchRole()
  }

  const handleRoleDeleted = () => {
    navigate("/roles")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Link>
        </Button>
        <div className="text-center py-8 text-destructive">{error || "Role not found"}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{role.name}</h1>
        {role.description && <p className="text-muted-foreground mt-1">{role.description}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Basic details about this role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role Name</label>
              <p className="text-base text-foreground mt-1">{role.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role ID</label>
              <p className="text-base text-foreground mt-1 font-mono text-sm">{role.id}</p>
            </div>
            {role.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base text-foreground mt-1">{role.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            {role.permissions && role.permissions.length > 0
              ? `This role has ${role.permissions.length} permission(s)`
              : "No permissions assigned to this role"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role.permissions && role.permissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {role.permissions.map((permission) => (
                <div key={permission.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {permission.action}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm text-foreground">{permission.resource}</p>
                  {permission.description && (
                    <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No permissions assigned to this role</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Role creation and update information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="text-base text-foreground mt-1">{formatDateTime(role.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-base text-foreground mt-1">{formatDateTime(role.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <EditRoleDialog
          role={role}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleRoleUpdated}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteRoleDialog
          role={role}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleRoleDeleted}
        />
      )}
    </div>
  )
}
