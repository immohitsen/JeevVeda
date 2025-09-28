"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'

export interface User {
  id: string
  fullName: string
  email: string
  gender: string
  dateOfBirth: string
  height: number
  weight: number
  familyHistory: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get('/api/users/me')
      
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch user:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          // Token expired or invalid - user needs to login again
          setUser(null)
          setError('Authentication expired')
        } else {
          setError('Failed to load user data')
        }
      } else {
        setError('Failed to load user data')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = () => {
    fetchUser()
  }

  const logout = async () => {
    try {
      await axios.get('/api/users/logout')
      setUser(null)
      // Redirect to login page could be handled by the calling component
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
    error,
    refreshUser,
    logout,
    isAuthenticated: !!user
  }
}
