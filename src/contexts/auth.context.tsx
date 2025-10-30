"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/api/services/auth.service"
import { getApiClient } from "@/api/clients"
import type { User, LoginRequest, RegisterRequest } from "@/types/api.types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (resource: string, action: string) => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const TOKEN_EXPIRY_KEY = "token_expiry"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Store tokens in sessionStorage
  const storeTokens = useCallback((accessToken: string, refreshToken: string, expiresIn: number) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    const expiryTime = Date.now() + expiresIn * 1000
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

    // Set token in API client
    const apiClient = getApiClient()
    apiClient.setAuthToken(accessToken)
  }, [])

  // Clear tokens from storage
  const clearTokens = useCallback(() => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY)

    // Clear token from API client
    const apiClient = getApiClient()
    apiClient.setAuthToken(null)
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
      const response = await authService.refreshToken(refreshToken)
      storeTokens(response.accessToken, response.refreshToken, response.expiresIn)
      setUser(response.user)
      return response.accessToken
    } catch (error) {
      console.error("[Auth] Token refresh failed:", error)
      clearTokens()
      setUser(null)
      throw error
    }
  }, [getRefreshToken, storeTokens, clearTokens])

  // Fetch current user data
  const fetchUserData = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
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
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (error) {
        console.error("[Auth] Logout API call failed:", error)
      }
    }
    clearTokens()
    setUser(null)
    navigate("/login")
  }, [getRefreshToken, clearTokens, navigate])

  // Check permission
  const checkPermission = useCallback(async (resource: string, action: string): Promise<boolean> => {
    try {
      const response = await authService.checkPermission(resource, action)
      return response.allowed
    } catch (error) {
      console.error("[Auth] Permission check failed:", error)
      return false
    }
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
