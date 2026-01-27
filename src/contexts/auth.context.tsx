"use client"

import type React from "react"
import { useContext, useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/api/services/auth.service"
import { getApiClient } from "@/api/clients"
import type { User, LoginRequest, RegisterRequest } from "@/types/api.types"
import { AuthContext, type AuthContextType } from "./auth.context-object"

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const TOKEN_EXPIRY_KEY = "token_expiry"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const permissionCache = useRef<Map<string, Promise<boolean>>>(new Map())

  // Store tokens in sessionStorage
  const storeTokens = useCallback((accessToken: string, refreshToken: string, expiresIn: number) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    const expiryTime = Date.now() + expiresIn * 1000
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

    // Set token in API client
    const apiClient = getApiClient()
    apiClient.setAuthToken(accessToken)
    
    // Clear permission cache on new token/login
    permissionCache.current.clear()
  }, [])

  // Clear tokens from storage
  const clearTokens = useCallback(() => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY)

    // Clear token from API client
    const apiClient = getApiClient()
    apiClient.setAuthToken(null)
    
    // Clear permission cache
    permissionCache.current.clear()
  }, [])

  // Get stored access token
  const getAccessToken = useCallback(() => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY)
  }, [])

  // Get stored refresh token
  const getRefreshToken = useCallback(() => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }, [])

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true
    return Date.now() >= Number.parseInt(expiryTime, 10)
  }, [])

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }
      const response = await authService.refreshToken(accessToken, refreshToken)
      storeTokens(response.accessToken, response.refreshToken, response.expiresIn)
      setUser(response.user)
      // Cache is cleared in storeTokens
      return response.accessToken
    } catch (error) {
      console.error("[Auth] Token refresh failed:", error)
      clearTokens()
      setUser(null)
      throw error
    }
  }, [getRefreshToken, storeTokens, clearTokens, getAccessToken])

  // Fetch current user data
  const fetchUserData = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      // Permissions in user object might have changed, but checkPermission checks distinct endpoint.
      // Safer to clear cache to ensure consistency.
      permissionCache.current.clear()
    } catch (error) {
      console.error("[Auth] Failed to fetch user data:", error)
      clearTokens()
      setUser(null)
    }
  }, [clearTokens])

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await authService.login(credentials)
        storeTokens(response.accessToken, response.refreshToken, response.expiresIn)
        setUser(response.user)
        navigate("/")
      } catch (error) {
        console.error("[Auth] Login failed:", error)
        throw error
      }
    },
    [storeTokens, navigate],
  )

  // Register function
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const response = await authService.register(data)
        storeTokens(response.accessToken, response.refreshToken, response.expiresIn)
        setUser(response.user)
        navigate("/")
      } catch (error) {
        console.error("[Auth] Registration failed:", error)
        throw error
      }
    },
    [storeTokens, navigate],
  )

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("[Auth] Logout API call failed:", error)
    }
    clearTokens()
    setUser(null)
    navigate("/login")
  }, [clearTokens, navigate])

  // Check permission
  const checkPermission = useCallback((module: string, action: string): Promise<boolean> => {
    const key = `${module}:${action}`.toLowerCase()
    
    // Return existing promise (resolved or pending) if found
    if (permissionCache.current.has(key)) {
      return permissionCache.current.get(key)!
    }

    // Create and cache the promise immediately to prevent duplicate flight
    const promise = authService.checkPermission(module, action)
      .then((response) => response.allowed)
      .catch((error) => {
        console.error("[Auth] Permission check failed:", error)
        // We could delete the key on error to allow retry, but for simplicity/stability we default to false
        return false
      })

    permissionCache.current.set(key, promise)
    return promise
  }, [])

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    await fetchUserData()
  }, [fetchUserData])

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (!accessToken || !refreshToken) {
        setIsLoading(false)
        return
      }

      // Set token in API client
      const apiClient = getApiClient()
      apiClient.setAuthToken(accessToken)

      // Check if token is expired
      if (isTokenExpired()) {
        try {
          await refreshAccessToken()
          await fetchUserData()
        } catch (error) {
          console.error("[Auth] Failed to refresh token on init:", error)
        }
      } else {
        await fetchUserData()
      }

      setIsLoading(false)
    }

    initAuth()
  }, [getAccessToken, getRefreshToken, isTokenExpired, refreshAccessToken, fetchUserData])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return

    const checkAndRefresh = async () => {
      const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
      if (!expiryTime) return

      const timeUntilExpiry = Number.parseInt(expiryTime, 10) - Date.now()
      // Refresh 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          await refreshAccessToken()
        } catch (error) {
          console.error("[Auth] Auto-refresh failed:", error)
        }
      }
    }

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000)
    return () => clearInterval(interval)
  }, [user, refreshAccessToken])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkPermission,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
