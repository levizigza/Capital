import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { SecurityService, type SessionData, type UserRole } from '@/lib/security'

interface GitHubUser {
  id: string
  login: string
  email?: string
  avatarUrl?: string
  isOwner?: boolean
}

interface UserProfile {
  githubUser: GitHubUser
  role: UserRole
  displayName: string
  assignedClasses?: string[]
  parentOf?: string[]
}

export function useAuth() {
  const [githubUser, setGitHubUser] = useState<GitHubUser | null>(null)
  const [userProfile, setUserProfile] = useKV<UserProfile | null>('user-auth-profile', null)
  const [session, setSession] = useKV<SessionData | null>('user-session', null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
  const initAuth = async (): Promise<void> => {
      try {
        const user = await window.spark.user()
        
        if (user && user.id) {
          const githubUserData: GitHubUser = {
            id: user.id.toString(),
            login: user.login,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isOwner: user.isOwner
          }
          
          setGitHubUser(githubUserData)
          
          if (!userProfile) {
            const newProfile: UserProfile = {
              githubUser: githubUserData,
              role: 'student',
              displayName: user.login,
              assignedClasses: []
            }
            setUserProfile(newProfile)
          } else {
            setUserProfile((prev): UserProfile => ({
              ...(prev || {
                githubUser: githubUserData,
                role: 'student',
                displayName: user.login,
                assignedClasses: []
              }),
              githubUser: githubUserData
            }))
          }
          
          if (!session || !SecurityService.isSessionActive(session)) {
            const newSession: SessionData = {
              userId: user.id.toString(),
              role: userProfile?.role || 'student',
              lastActivity: Date.now(),
              rememberMe: false,
              assignedClasses: userProfile?.assignedClasses || []
            }
            setSession(newSession)
          }
          
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
  }, [])

  useEffect(() => {
    if (!session || !isAuthenticated) return

    const activityInterval = setInterval(() => {
      if (!SecurityService.isSessionActive(session)) {
        handleLogout()
      }
    }, 60000)

    return () => clearInterval(activityInterval)
  }, [session, isAuthenticated])

  const updateActivity = (): void => {
    if (session && isAuthenticated) {
      setSession((prevSession): SessionData | null => {
        if (!prevSession) return null
        return SecurityService.updateActivity(prevSession)
      })
    }
  }

  const setRememberMe = (remember: boolean): void => {
    if (session) {
      setSession((prevSession): SessionData | null => {
        if (!prevSession) return null
        return {
          ...prevSession,
          rememberMe: remember
        }
      })
    }
  }

  const changeRole = (newRole: UserRole): void => {
    if (userProfile && session) {
      setUserProfile((prev): UserProfile | null => {
        if (!prev) return null
        return {
          ...prev,
          role: newRole
        }
      })
      setSession((prev): SessionData | null => {
        if (!prev) return null
        return {
          ...prev,
          role: newRole
        }
      })
    }
  }

  const assignClasses = (classes: string[]): void => {
    if (userProfile && session) {
      setUserProfile((prev): UserProfile | null => {
        if (!prev) return null
        return {
          ...prev,
          assignedClasses: classes
        }
      })
      setSession((prev): SessionData | null => {
        if (!prev) return null
        return {
          ...prev,
          assignedClasses: classes
        }
      })
    }
  }

  const handleLogout = (): void => {
    setSession(null)
    setIsAuthenticated(false)
    SecurityService.clearSensitiveData()
    window.location.reload()
  }

  const canAccessStudentData = (targetStudentId: string, studentClasses?: string[]): boolean => {
    if (!session || !userProfile) return false
    
    return SecurityService.canAccessStudentData(
      session.role,
      session.userId,
      targetStudentId,
      studentClasses,
      session.assignedClasses
    )
  }

  const checkRateLimit = (): boolean => {
    if (!session) return false
    return SecurityService.checkRateLimit(session.userId)
  }

  return {
    githubUser,
    userProfile,
    session,
    isLoading,
    isAuthenticated,
    updateActivity,
    setRememberMe,
    changeRole,
    assignClasses,
    handleLogout,
    canAccessStudentData,
    checkRateLimit,
    permissions: session ? SecurityService.getRolePermissions(session.role) : null
  }
}
