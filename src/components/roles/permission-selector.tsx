"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { permissionsService } from "@/api/services/permissions.service"
import { rolesService } from "@/api/services/roles.service"
import type { Permission } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Circle, Plus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleApiError, getErrorMessage } from "@/lib/error-handling"

interface PermissionSelectorProps {
  readonly roleId: string
  readonly initialPermissions?: Permission[]
  readonly onPermissionsChange?: (permissions: Permission[]) => void
  readonly readonly?: boolean
}

export function PermissionSelector({
  roleId,
  initialPermissions = [],
  onPermissionsChange,
  readonly = false,
}: PermissionSelectorProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(
    new Set(initialPermissions.map(p => p.id))
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModule, setFilterModule] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Use ref to store callback to avoid it being in dependency arrays
  const onPermissionsChangeRef = useRef(onPermissionsChange)
  useEffect(() => {
    onPermissionsChangeRef.current = onPermissionsChange
  }, [onPermissionsChange])

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, Permission[]> = {}
    allPermissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = []
      }
      grouped[permission.module].push(permission)
    })
    return grouped
  }, [allPermissions])

  // Get unique modules for filter dropdown
  const modules = useMemo(() => {
    return Array.from(new Set(allPermissions.map(p => p.module))).sort((a, b) => a.localeCompare(b))
  }, [allPermissions])

  // Filter permissions based on search and module filter
  const filteredPermissions = useMemo(() => {
    let filtered = allPermissions

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.module.toLowerCase().includes(term) ||
          p.action.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      )
    }

    if (filterModule) {
      filtered = filtered.filter(p => p.module === filterModule)
    }

    return filtered
  }, [allPermissions, searchTerm, filterModule])

  // Track if we've loaded data to prevent multiple loads
  const hasLoadedRef = useRef(false)
  
  // Load all permissions and current role permissions
  useEffect(() => {
    // Reset loaded flag when roleId changes
    if (hasLoadedRef.current && roleId) {
      hasLoadedRef.current = false
    }
    
    const loadData = async () => {
      // Prevent multiple simultaneous loads
      if (hasLoadedRef.current) return
      hasLoadedRef.current = true
      
      setIsLoading(true)
      setError(null)
      try {
        const [allPerms, rolePerms] = await Promise.all([
          permissionsService.getPermissions(),
          rolesService.getRolePermissions(roleId),
        ])
        setAllPermissions(allPerms)
        setSelectedPermissionIds(new Set(rolePerms.map(p => p.id)))
        // Don't call onPermissionsChange here - it will cause infinite loops
        // The parent component will get updated permissions when user toggles them
      } catch (err: unknown) {
        const apiError = handleApiError(err)
        setError(getErrorMessage(apiError, "Failed to load permissions"))
        hasLoadedRef.current = false // Reset on error so we can retry
      } finally {
        setIsLoading(false)
      }
    }

    if (roleId && !hasLoadedRef.current) {
      loadData()
    }
    // Only depend on roleId - onPermissionsChange should not trigger reloads
  }, [roleId])

  const handleAssignPermission = async (permissionId: string) => {
    if (readonly || isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Add permission (assign)
      await rolesService.addPermissionToRole(roleId, permissionId)
      
      const newSelectedIds = new Set(selectedPermissionIds)
      newSelectedIds.add(permissionId)
      setSelectedPermissionIds(newSelectedIds)
      
      // Update the permissions list for callback
      const updatedPermissions = allPermissions.filter(p => newSelectedIds.has(p.id))
      if (onPermissionsChangeRef.current) {
        onPermissionsChangeRef.current(updatedPermissions)
      }

      setSuccessMessage("Permission assigned successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      // Show detailed error message including status code if available
      const errorMsg = apiError.statusCode 
        ? `Failed to assign permission (${apiError.statusCode}): ${apiError.message || "Unknown error"}`
        : getErrorMessage(apiError, "Failed to assign permission")
      setError(errorMsg)
      console.error("Error assigning permission:", apiError)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnassignPermission = async (permissionId: string) => {
    if (readonly || isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Remove permission (unassign)
      await rolesService.removePermissionFromRole(roleId, permissionId)
      
      const newSelectedIds = new Set(selectedPermissionIds)
      newSelectedIds.delete(permissionId)
      setSelectedPermissionIds(newSelectedIds)
      
      // Update the permissions list for callback
      const updatedPermissions = allPermissions.filter(p => newSelectedIds.has(p.id))
      if (onPermissionsChangeRef.current) {
        onPermissionsChangeRef.current(updatedPermissions)
      }

      setSuccessMessage("Permission unassigned successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      // Show detailed error message including status code if available
      const errorMsg = apiError.statusCode 
        ? `Failed to unassign permission (${apiError.statusCode}): ${apiError.message || "Unknown error"}`
        : getErrorMessage(apiError, "Failed to unassign permission")
      setError(errorMsg)
      if (import.meta.env.DEV) {
        console.error("Error unassigning permission:", {
          roleId,
          permissionId,
          error: apiError,
          statusCode: apiError.statusCode,
          message: apiError.message
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectAllInModule = async (module: string) => {
    if (readonly || isSaving) return

    const modulePermissions = permissionsByModule[module] || []
    const allSelected = modulePermissions.every(p => selectedPermissionIds.has(p.id))

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const promises = modulePermissions.map(permission => {
        const isSelected = selectedPermissionIds.has(permission.id)
        if (allSelected && isSelected) {
          // Remove all
          return rolesService.removePermissionFromRole(roleId, permission.id)
        } else if (!allSelected && !isSelected) {
          // Add all
          return rolesService.addPermissionToRole(roleId, permission.id)
        }
        return Promise.resolve()
      })

      await Promise.all(promises)

      const newSelectedIds = new Set(selectedPermissionIds)
      if (allSelected) {
        modulePermissions.forEach(p => newSelectedIds.delete(p.id))
      } else {
        modulePermissions.forEach(p => newSelectedIds.add(p.id))
      }

      setSelectedPermissionIds(newSelectedIds)
      
      const updatedPermissions = allPermissions.filter(p => newSelectedIds.has(p.id))
      if (onPermissionsChangeRef.current) {
        onPermissionsChangeRef.current(updatedPermissions)
      }

      setSuccessMessage(allSelected ? "All permissions removed from module" : "All permissions added to module")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      setError(getErrorMessage(apiError, "Failed to update permissions"))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions by module, action, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={readonly}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={readonly}
            aria-label="Filter by module"
            title="Filter by module"
          >
            <option value="">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions grouped by module */}
      {Object.keys(permissionsByModule)
        .filter(module => {
          if (filterModule) return module === filterModule
          if (searchTerm) {
            return permissionsByModule[module].some(p => {
              const term = searchTerm.toLowerCase()
              return (
                p.module.toLowerCase().includes(term) ||
                p.action.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term)
              )
            })
          }
          return true
        })
        .map(module => {
          const modulePermissions = permissionsByModule[module].filter(p =>
            filteredPermissions.some(fp => fp.id === p.id)
          )
          const allSelected = modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissionIds.has(p.id))

          return (
            <Card key={module}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{module}</CardTitle>
                    <CardDescription>
                      {modulePermissions.length} permission{modulePermissions.length === 1 ? "" : "s"}
                    </CardDescription>
                  </div>
                  {!readonly && modulePermissions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAllInModule(module)}
                      disabled={isSaving}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {modulePermissions.map(permission => {
                    const isSelected = selectedPermissionIds.has(permission.id)
                    return (
                      <div
                        key={permission.id}
                        className={`flex items-start justify-between p-3 rounded-lg border ${
                          isSelected ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                                {permission.action}
                              </Badge>
                            </div>
                            {permission.description && (
                              <p className="text-sm text-muted-foreground">{permission.description}</p>
                            )}
                          </div>
                        </div>
                        {!readonly && (
                          <div className="flex-shrink-0 ml-2">
                            {isSelected ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnassignPermission(permission.id)}
                                disabled={isSaving}
                                className="text-destructive hover:text-destructive"
                                title="Unassign permission"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignPermission(permission.id)}
                                disabled={isSaving}
                                title="Assign permission"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {modulePermissions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No permissions match your filters
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}

      {Object.keys(permissionsByModule).filter(module => {
        if (filterModule) return module === filterModule
        if (searchTerm) {
          return permissionsByModule[module].some(p => {
            const term = searchTerm.toLowerCase()
            return (
              p.module.toLowerCase().includes(term) ||
              p.action.toLowerCase().includes(term) ||
              (p.description && p.description.toLowerCase().includes(term))
            )
          })
        }
        return true
      }).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No permissions found matching your criteria
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        <strong>{selectedPermissionIds.size}</strong> of <strong>{allPermissions.length}</strong> permissions selected
      </div>
    </div>
  )
}
