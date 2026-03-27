'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext } from '@/hooks/use-auth'
import { STORAGE_KEYS } from '@/lib/constants'
import type { User } from '@/lib/types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading: isLoading,
        login,
        logout,
        isAdmin: currentUser?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}