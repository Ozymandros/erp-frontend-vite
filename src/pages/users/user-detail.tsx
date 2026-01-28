"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { usersService } from "@/api/services/users.service"
import type { User, Role } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { RoleSelector } from "@/components/users/role-selector"
import { usePermission } from "@/hooks/use-permissions"
import { formatDateTime } from "@/lib/utils"

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Permissions
  const canUpdate = usePermission("Users", "Update")
  const canDelete = usePermission("Users", "Delete")

  const fetchUser = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await usersService.getUserById(id)
      setUser(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch user")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Scroll to roles section if hash is #roles
  useEffect(() => {
    if (window.location.hash === "#roles") {
      setTimeout(() => {
        const element = document.getElementById("manage-roles")
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }, [user])

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false)
    fetchUser()
  }

  const handleUserDeleted = () => {
    navigate("/users")
  }

  const handleRolesChange = useCallback((roles: Role[]) => {
    // Update user state with new roles
    setUser(prevUser => {
      if (!prevUser) return null
      return { ...prevUser, roles }
    })
    // Optionally refresh full user data to get latest permissions
    fetchUser()
  }, [fetchUser])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="text-center py-8 text-destructive">{error || "User not found"}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
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
        <h1 className="text-3xl font-bold text-foreground">{user.username}</h1>
        <p className="text-muted-foreground mt-1">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>User account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-base text-foreground mt-1">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base text-foreground mt-1">{user.email}</p>
            </div>
            {user.firstName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                <p className="text-base text-foreground mt-1">{user.firstName}</p>
              </div>
            )}
            {user.lastName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <p className="text-base text-foreground mt-1">{user.lastName}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-base text-foreground mt-1 font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card id="manage-roles">
        <CardHeader>
          <CardTitle>Manage Roles</CardTitle>
          <CardDescription>
            {canUpdate 
              ? "Assign or unassign roles to this user" 
              : "View and manage roles (read-only - requires Users.Update permission)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleSelector
            userId={user.id}
            initialRoles={user.roles || []}
            onRolesChange={handleRolesChange}
            readonly={!canUpdate}
          />
        </CardContent>
      </Card>

      {/* Assigned Roles & Permissions View */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Assigned roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {user.roles && user.roles.length > 0 ? (
            <div className="space-y-4">
              {user.roles?.map((role) => (
                <div key={role.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      {role.description && <p className="text-sm text-muted-foreground mt-1">{role.description}</p>}
                    </div>
                  </div>
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions?.map((permission) => (
                          <Badge key={permission.id} variant="secondary">
                            {permission.module}:{permission.action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No roles assigned</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Account creation and update information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="text-base text-foreground mt-1">{formatDateTime(user.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-base text-foreground mt-1">{formatDateTime(user.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <EditUserDialog
          user={user}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleUserUpdated}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteUserDialog
          user={user}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleUserDeleted}
        />
      )}
    </div>
  )
}
