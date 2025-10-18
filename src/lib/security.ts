export interface SecurityConfig {
  sessionTimeout: number
  maxInputLength: number
  rateLimit: {
    maxRequests: number
    windowMs: number
  }
}

export const SECURITY_CONFIG: SecurityConfig = {
  sessionTimeout: 30 * 60 * 1000,
  maxInputLength: 1000,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60 * 1000
  }
}

export type UserRole = 'student' | 'teacher' | 'parent'

export interface SessionData {
  userId: string
  role: UserRole
  lastActivity: number
  rememberMe: boolean
  assignedClasses?: string[]
}

export class SecurityService {
  private static requestLog: Map<string, number[]> = new Map()

  static sanitizeInput(input: string): string {
    if (!input) return ''
    
    const trimmed = input.trim().slice(0, SECURITY_CONFIG.maxInputLength)
    
    return trimmed
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length <= 254
  }

  static validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
  }

  static checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const userRequests = this.requestLog.get(userId) || []
    
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < SECURITY_CONFIG.rateLimit.windowMs
    )
    
    if (recentRequests.length >= SECURITY_CONFIG.rateLimit.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requestLog.set(userId, recentRequests)
    
    return true
  }

  static isSessionActive(session: SessionData | null): boolean {
    if (!session) return false
    
    const now = Date.now()
    const timeSinceActivity = now - session.lastActivity
    
    if (session.rememberMe) {
      return timeSinceActivity < 30 * 24 * 60 * 60 * 1000
    }
    
    return timeSinceActivity < SECURITY_CONFIG.sessionTimeout
  }

  static updateActivity(session: SessionData): SessionData {
    return {
      ...session,
      lastActivity: Date.now()
    }
  }

  static canAccessStudentData(
    requesterRole: UserRole,
    requesterId: string,
    targetStudentId: string,
    studentClasses?: string[],
    teacherClasses?: string[]
  ): boolean {
    if (requesterRole === 'student') {
      return requesterId === targetStudentId
    }
    
    if (requesterRole === 'teacher') {
      if (!studentClasses || !teacherClasses) return false
      return studentClasses.some(cls => teacherClasses.includes(cls))
    }
    
    if (requesterRole === 'parent') {
      return true
    }
    
    return false
  }

  static getRolePermissions(role: UserRole) {
    const permissions = {
      student: {
        canViewOwnData: true,
        canViewOtherStudents: false,
        canEditSettings: true,
        canManageClasses: false,
        canExportData: true
      },
      teacher: {
        canViewOwnData: true,
        canViewOtherStudents: true,
        canEditSettings: true,
        canManageClasses: true,
        canExportData: true
      },
      parent: {
        canViewOwnData: true,
        canViewOtherStudents: true,
        canEditSettings: false,
        canManageClasses: false,
        canExportData: true
      }
    }
    
    return permissions[role]
  }

  static clearSensitiveData() {
    this.requestLog.clear()
  }
}
