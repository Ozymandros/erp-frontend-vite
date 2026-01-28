"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { usersService } from "@/api/services/users.service"
import { rolesService } from "@/api/services/roles.service"
import type { Role } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Circle, Plus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleApiError, getErrorMessage } from "@/lib/error-handling"

interface RoleSelectorProps {
  userId: string
  initialRoles?: Role[]
  onRolesChange?: (roles: Role[]) => void
  readonly?: boolean
}

export function RoleSelector({
  userId,
  initialRoles = [],
  onRolesChange,
  readonly = false,
}: RoleSelectorProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [selectedRoleNames, setSelectedRoleNames] = useState<Set<string>>(
    new Set(initialRoles.map(r => r.name))
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Use ref to store callback to avoid it being in dependency arrays
  const onRolesChangeRef = useRef(onRolesChange)
  useEffect(() => {
    onRolesChangeRef.current = onRolesChange
  }, [onRolesChange])

  // Track if we've loaded data for this userId
  const hasLoadedRef = useRef<string | null>(null)

  // Load all roles and user's current roles
  useEffect(() => {
    const loadData = async () => {
      // Prevent multiple simultaneous loads for the same userId
      if (hasLoadedRef.current === userId) {
        return
      }
      hasLoadedRef.current = userId

      setIsLoading(true)
      setError(null)

      try {
        // Load all available roles
        const [allRolesData] = await Promise.all([
          rolesService.getRoles(),
        ])
        
        setAllRoles(allRolesData)
        
        // Update selected roles based on initialRoles prop
        if (initialRoles.length > 0) {
          setSelectedRoleNames(new Set(initialRoles.map(r => r.name)))
        } else {
          // If no initial roles provided, fetch user's current roles
          try {
            const userRoles = await usersService.getUserRoles(userId)
            setSelectedRoleNames(new Set(userRoles.map(r => r.name)))
          } catch (err) {
            // If fetching fails, just use empty set
            console.warn("Failed to fetch user roles:", err)
            setSelectedRoleNames(new Set())
          }
        }
      } catch (err: unknown) {
        const apiError = handleApiError(err)
        setError(getErrorMessage(apiError, "Failed to load roles"))
        console.error("Error loading roles:", apiError)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  // Update selected roles when initialRoles prop changes
  useEffect(() => {
    if (initialRoles.length > 0) {
      setSelectedRoleNames(new Set(initialRoles.map(r => r.name)))
    }
  }, [initialRoles])

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!searchTerm) return allRoles
    
    const term = searchTerm.toLowerCase()
    return allRoles.filter(role => {
      return (
        role.name.toLowerCase().includes(term) ||
        (role.description && role.description.toLowerCase().includes(term))
      )
    })
  }, [allRoles, searchTerm])

  const handleAssignRole = async (roleName: string) => {
    if (readonly || isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Assign role to user
      await usersService.assignRole(userId, roleName)
      
      const newSelectedNames = new Set(selectedRoleNames)
      newSelectedNames.add(roleName)
      setSelectedRoleNames(newSelectedNames)
      
      // Update the roles list for callback
      const updatedRoles = allRoles.filter(r => newSelectedNames.has(r.name))
      if (onRolesChangeRef.current) {
        onRolesChangeRef.current(updatedRoles)
      }

      setSuccessMessage("Role assigned successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      const errorMsg = apiError.statusCode 
        ? `Failed to assign role (${apiError.statusCode}): ${apiError.message || "Unknown error"}`
        : getErrorMessage(apiError, "Failed to assign role")
      setError(errorMsg)
      if (import.meta.env.DEV) {
        console.error("Error assigning role:", {
          userId,
          roleName,
          error: apiError,
          statusCode: apiError.statusCode,
          message: apiError.message
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnassignRole = async (roleName: string) => {
    if (readonly || isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Remove role from user (unassign)
      await usersService.removeRole(userId, roleName)
      
      const newSelectedNames = new Set(selectedRoleNames)
      newSelectedNames.delete(roleName)
      setSelectedRoleNames(newSelectedNames)
      
      // Update the roles list for callback
      const updatedRoles = allRoles.filter(r => newSelectedNames.has(r.name))
      if (onRolesChangeRef.current) {
        onRolesChangeRef.current(updatedRoles)
      }

      setSuccessMessage("Role unassigned successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      const errorMsg = apiError.statusCode 
        ? `Failed to unassign role (${apiError.statusCode}): ${apiError.message || "Unknown error"}`
        : getErrorMessage(apiError, "Failed to unassign role")
      setError(errorMsg)
      if (import.meta.env.DEV) {
        console.error("Error unassigning role:", {
          userId,
          roleName,
          error: apiError,
          statusCode: apiError.statusCode,
          message: apiError.message
        })
      }
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

      {/* Search Control */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={readonly}
        />
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
          <CardDescription>
            Assign or unassign roles to this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRoles.map(role => {
              const isSelected = selectedRoleNames.has(role.name)
              return (
                <div
                  key={role.id}
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
                          {role.name}
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                  </div>
                  {!readonly && (
                    <div className="flex-shrink-0 ml-2">
                      {isSelected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignRole(role.name)}
                          disabled={isSaving}
                          className="text-destructive hover:text-destructive"
                          title="Unassign role"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignRole(role.name)}
                          disabled={isSaving}
                          title="Assign role"
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
          {filteredRoles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No roles match your search
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        <strong>{selectedRoleNames.size}</strong> of <strong>{allRoles.length}</strong> roles assigned
      </div>
    </div>
  )
}
