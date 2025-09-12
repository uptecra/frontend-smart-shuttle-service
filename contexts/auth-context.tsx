"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  username: string
  email: string
  role: string
  company_id: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>('fake-token')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check for existing user on app load
    const storedUser = localStorage.getItem('fakeUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('fakeUser')
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Fake authentication logic
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo credentials
      if (username === 'admin' && password === 'admin123') {
        const fakeUser: User = {
          id: 1,
          username: 'admin',
          email: 'admin@zorlu.com',
          role: 'admin',
          company_id: 1
        }
        
        setUser(fakeUser)
        localStorage.setItem('fakeUser', JSON.stringify(fakeUser))
        setIsLoading(false)
        return true
      } else if (username === 'user' && password === 'user123') {
        const fakeUser: User = {
          id: 2,
          username: 'user',
          email: 'user@zorlu.com',
          role: 'user',
          company_id: 1
        }
        
        setUser(fakeUser)
        localStorage.setItem('fakeUser', JSON.stringify(fakeUser))
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    // Kullanıcı bilgilerini temizle
    setUser(null)
    setToken(null)
    
    // LocalStorage'dan kullanıcı bilgilerini kaldır
    localStorage.removeItem('fakeUser')
    localStorage.removeItem('authToken')
    
    // State'i sıfırla
    setIsLoading(false)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
