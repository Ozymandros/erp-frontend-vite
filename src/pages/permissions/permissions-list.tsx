"use client"

import { useState, useEffect } from "react"
import { permissionsService } from "@/api/services/permissions.service"
import type { Permission, PaginatedResponse } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { CreatePermissionDialog } from "@/components/permissions/create-permission-dialog"
import { EditPermissionDialog } from "@/components/permissions/edit-permission-dialog"
import { DeletePermissionDialog } from "@/components/permissions/delete-permission-dialog"
import { formatDateTime } from "@/lib/utils"
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling"
import { PermissionFilterHeader } from "@/components/permissions/permission-filter-header"

export function PermissionsListPage() {
  const [permissions, setPermissions] = useState<PaginatedResponse<Permission> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({ search: "", role: "" })
  const [page, setPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)

  const fetchPermissions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await permissionsService.getPermissionsPaginated({
        page,
        pageSize: 10,
        search: filters.search || undefined,
      })
      setPermissions(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch permissions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [page, filters])

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handlePermissionCreated = () => {
    setIsCreateDialogOpen(false)
    fetchPermissions()
  }

  const handlePermissionUpdated = () => {
    setEditingPermission(null)
    fetchPermissions()
  }

  const handlePermissionDeleted = () => {
    setDeletingPermission(null)
    fetchPermissions()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage system permissions and access controls</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Permissions</CardTitle>
          <CardDescription>A list of all permissions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <PermissionFilterHeader filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : permissions && permissions.items.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.items.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Badge variant="secondary">{permission.module}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.action}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">{permission.description || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(permission.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingPermission(permission)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingPermission(permission)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, permissions.total)} of {permissions.total}{" "}
                  permissions
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= permissions.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No permissions found. Create your first permission to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePermissionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handlePermissionCreated}
      />

      {editingPermission && (
        <EditPermissionDialog
          permission={editingPermission}
          open={!!editingPermission}
          onOpenChange={(open) => !open && setEditingPermission(null)}
          onSuccess={handlePermissionUpdated}
        />
      )}

      {deletingPermission && (
        <DeletePermissionDialog
          permission={deletingPermission}
          open={!!deletingPermission}
          onOpenChange={(open) => !open && setDeletingPermission(null)}
          onSuccess={handlePermissionDeleted}
        />
      )}
    </div>
  )
}
