import { createContext } from "react"
import type { User, LoginRequest, RegisterRequest, Permission } from "@/types/api.types"

export interface AuthContextType {
  user: User | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  checkApiPermission: (module: string, action: string) => Promise<boolean>
  hasPermission: (module: string, action: string) => boolean
  refreshUserData: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
