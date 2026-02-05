"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { rolesService } from "@/api/services/roles.service"
import type { Role, User, Permission } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2, Users, Shield } from "lucide-react"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"
import { PermissionSelector } from "@/components/roles/permission-selector"
import { formatDateTime } from "@/lib/utils"
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling"
import { usePermission } from "@/hooks/use-permissions"

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role | null>(null)
  const [usersInRole, setUsersInRole] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Permissions
  const canUpdate = usePermission("Roles", "Update")
  const canDelete = usePermission("Roles", "Delete")
  const canReadUsers = usePermission("Users", "Read")

  const fetchRole = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await rolesService.getRoleById(id)
      setRole(data)
    } catch (error: unknown) {
      const apiError = handleApiError(error)
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("role"))
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch role"))
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const fetchUsersInRole = useCallback(async () => {
    if (!role?.name) return
    setIsLoadingUsers(true)
    try {
      const users = await rolesService.getUsersInRole(role.name)
      setUsersInRole(users)
    } catch (error: unknown) {
      // Silently fail - users section is optional
      console.error("Failed to fetch users in role:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }, [role?.name])

  useEffect(() => {
    fetchRole()
  }, [fetchRole])

  useEffect(() => {
    if (role?.name && canReadUsers) {
      fetchUsersInRole()
    }
  }, [role?.name, canReadUsers, fetchUsersInRole])

  const handlePermissionsChange = useCallback((permissions: Permission[]) => {
    // Use functional update to avoid dependency on role
    setRole(prevRole => {
      if (prevRole) {
        return { ...prevRole, permissions }
      }
      return prevRole
    })
  }, [])

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

  const renderUsersContent = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (usersInRole.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-4">
          No users have this role assigned. Assign roles to users from the{" "}
          <Link to="/users" className="text-primary hover:underline">
            Users page
          </Link>
          .
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {usersInRole.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/users/${u.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {u.username}
                </Link>
                {u.isAdmin && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{u.email}</p>
              {(u.firstName || u.lastName) && (
                <p className="text-sm text-muted-foreground">
                  {u.firstName} {u.lastName}
                </p>
              )}
            </div>
            <Badge variant={u.isActive ? "default" : "destructive"}>
              {u.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        ))}
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
          {canUpdate && (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
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
              <span className="text-sm font-medium text-muted-foreground block">Role Name</span>
              <p className="text-base text-foreground mt-1">{role.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground block">Role ID</span>
              <p className="text-base text-foreground mt-1 font-mono text-sm">{role.id}</p>
            </div>
            {role.description && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-muted-foreground block">Description</span>
                <p className="text-base text-foreground mt-1">{role.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Permissions</CardTitle>
          </div>
          <CardDescription>
            Manage permissions assigned to this role. Select or deselect permissions to update the role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {id && (
            <PermissionSelector
              roleId={id}
              initialPermissions={role.permissions || []}
              onPermissionsChange={handlePermissionsChange}
              readonly={!canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {canReadUsers && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Users with this Role</CardTitle>
            </div>
            <CardDescription>
              {usersInRole.length > 0
                ? `${usersInRole.length} user(s) have this role assigned`
                : "No users currently have this role assigned"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderUsersContent()}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Role creation and update information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground block">Created At</span>
            <p className="text-base text-foreground mt-1">{formatDateTime(role.createdAt)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground block">Last Updated</span>
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
