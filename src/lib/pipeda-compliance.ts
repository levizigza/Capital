import { EncryptionService } from './encryption'

export interface ConsentSettings {
  storeGameProgress: boolean
  shareAnonymousUsage: boolean
  receiveEducationalTips: boolean
  consentDate: string
  lastUpdated: string
  version: string
}

export interface UserPrivacyData {
  userId: string
  email?: string
  ageRange: 'under-13' | '13-17' | '18-plus'
  gradeLevel?: string
  parentEmail?: string
  parentConsentGiven?: boolean
  parentConsentDate?: string
  consent: ConsentSettings
  dataRetention: {
    accountCreated: string
    lastActive: string
    inactivityWarningDate?: string
    scheduledDeletion?: string
  }
}

export interface DataMinimizationInfo {
  collected: Array<{
    name: string
    purpose: string
    required: boolean
  }>
  notCollected: string[]
}

export interface AnonymousUsageData {
  eventId: string
  eventType: string
  timestamp: string
  sessionId: string
}

export class PIPEDAComplianceService {
  private static readonly CONSENT_VERSION = '1.0.0'
  private static readonly INACTIVITY_PERIOD = 2 * 365 * 24 * 60 * 60 * 1000
  private static readonly WARNING_PERIOD = 30 * 24 * 60 * 60 * 1000
  private static readonly DELETION_GRACE_PERIOD = 24 * 60 * 60 * 1000

  static getDataMinimizationInfo(): DataMinimizationInfo {
    return {
      collected: [
        {
          name: 'GitHub username',
          purpose: 'Account identification and authentication',
          required: true
        },
        {
          name: 'Age range (not birthdate)',
          purpose: 'Provide age-appropriate content and comply with child protection laws',
          required: true
        },
        {
          name: 'Grade level',
          purpose: 'Customize educational difficulty',
          required: false
        },
        {
          name: 'Learning preferences (VARK)',
          purpose: 'Personalize learning experience',
          required: false
        },
        {
          name: 'Game progress and scores',
          purpose: 'Track learning progress and achievements',
          required: false
        },
        {
          name: 'Email (encrypted)',
          purpose: 'Send account notifications and parent consent requests',
          required: false
        },
        {
          name: 'Parent email (for users under 13)',
          purpose: 'Obtain parental consent as required by law',
          required: true
        }
      ],
      notCollected: [
        'Full legal names',
        'Home addresses',
        'Phone numbers',
        'Social insurance numbers',
        'Exact birthdates',
        'Financial account numbers',
        'Credit card information',
        'Location data',
        'Device identifiers',
        'Biometric data'
      ]
    }
  }

  static createDefaultConsent(): ConsentSettings {
    return {
      storeGameProgress: false,
      shareAnonymousUsage: false,
      receiveEducationalTips: false,
      consentDate: '',
      lastUpdated: '',
      version: this.CONSENT_VERSION
    }
  }

  static async encryptEmail(email: string, userId: string): Promise<string> {
    return EncryptionService.encrypt(email, userId)
  }

  static async decryptEmail(encryptedEmail: string, userId: string): Promise<string> {
    return EncryptionService.decrypt(encryptedEmail, userId)
  }

  static async encryptVARKData(varkData: any, userId: string): Promise<string> {
    return EncryptionService.encryptObject(varkData, userId)
  }

  static async decryptVARKData(encryptedVARK: string, userId: string): Promise<any> {
    return EncryptionService.decryptObject(encryptedVARK, userId)
  }

  static async encryptGameProgress(progress: any, userId: string): Promise<string> {
    return EncryptionService.encryptObject(progress, userId)
  }

  static async decryptGameProgress(encryptedProgress: string, userId: string): Promise<any> {
    return EncryptionService.decryptObject(encryptedProgress, userId)
  }

  static checkInactivityStatus(lastActive: string): {
    isInactive: boolean
    needsWarning: boolean
    daysUntilDeletion: number
  } {
    const now = Date.now()
    const lastActiveTime = new Date(lastActive).getTime()
    const timeSinceActive = now - lastActiveTime

    const daysInactive = Math.floor(timeSinceActive / (24 * 60 * 60 * 1000))
    const warningThresholdDays = Math.floor((this.INACTIVITY_PERIOD - this.WARNING_PERIOD) / (24 * 60 * 60 * 1000))
    const deletionThresholdDays = Math.floor(this.INACTIVITY_PERIOD / (24 * 60 * 60 * 1000))

    return {
      isInactive: timeSinceActive >= this.INACTIVITY_PERIOD,
      needsWarning: daysInactive >= warningThresholdDays && daysInactive < deletionThresholdDays,
      daysUntilDeletion: Math.max(0, deletionThresholdDays - daysInactive)
    }
  }

  static scheduleDataDeletion(userData: UserPrivacyData): UserPrivacyData {
    const deletionDate = new Date()
    deletionDate.setTime(deletionDate.getTime() + this.DELETION_GRACE_PERIOD)

    return {
      ...userData,
      dataRetention: {
        ...userData.dataRetention,
        scheduledDeletion: deletionDate.toISOString()
      }
    }
  }

  static cancelDataDeletion(userData: UserPrivacyData): UserPrivacyData {
    return {
      ...userData,
      dataRetention: {
        ...userData.dataRetention,
        scheduledDeletion: undefined,
        lastActive: new Date().toISOString()
      }
    }
  }

  static async deleteUserData(userId: string): Promise<void> {
    const keysToDelete = [
      'user-profile',
      'game-scores',
      'user-session',
      'user-auth-profile',
      'accessibility-settings',
      'banking-data',
      'vark-profile',
      'consent-settings',
      'privacy-data',
      'last-saved'
    ]

    for (const key of keysToDelete) {
      try {
        await window.spark.kv.delete(key)
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error)
      }
    }

    localStorage.clear()
  }

  static createAnonymousUsageEvent(
    eventType: string,
    sessionId: string
  ): AnonymousUsageData {
    return {
      eventId: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: new Date().toISOString(),
      sessionId
    }
  }

  static async logAnonymousEvent(event: AnonymousUsageData): Promise<void> {
    const events = await window.spark.kv.get<AnonymousUsageData[]>('anonymous-events') || []
    events.push(event)
    
    if (events.length > 1000) {
      events.shift()
    }
    
    await window.spark.kv.set('anonymous-events', events)
  }

  static requiresParentalConsent(ageRange: string): boolean {
    return ageRange === 'under-13'
  }

  static isConsentValid(consent: ConsentSettings): boolean {
    if (!consent.consentDate) return false
    
    if (consent.version !== this.CONSENT_VERSION) {
      return false
    }

    const consentAge = Date.now() - new Date(consent.consentDate).getTime()
    const oneYear = 365 * 24 * 60 * 60 * 1000
    
    return consentAge < oneYear
  }

  static getPrivacyPolicyContent(): {
    title: string
    sections: Array<{
      heading: string
      content: string[]
    }>
  } {
    return {
      title: 'Privacy & Your Data',
      sections: [
        {
          heading: 'What We Collect & Why',
          content: [
            'We only collect the minimum information needed for your learning experience:',
            '• Your GitHub username - to identify your account',
            '• Your age range (not exact birthday) - to show age-appropriate content',
            '• Your grade level - to match difficulty to your skill',
            '• Your learning style preferences - to personalize lessons',
            '• Your game scores and progress - to track your improvement',
            '',
            'We DO NOT collect your full name, address, phone number, or any financial information.'
          ]
        },
        {
          heading: 'How We Protect Your Information',
          content: [
            'Your data security is our top priority:',
            '• All data sent over the internet uses HTTPS encryption (the lock icon in your browser)',
            '• Sensitive information like email addresses are encrypted using AES-256 (military-grade encryption)',
            '• Your learning style results are stored encrypted',
            '• Game progress is encrypted before storage',
            '• We never store passwords - GitHub handles your login securely',
            '• All data stays on your device - we don\'t send it to other servers'
          ]
        },
        {
          heading: 'Your Rights & Control',
          content: [
            'You have complete control over your data:',
            '• View all data we have about you anytime in Settings',
            '• Export your progress as a file you can keep',
            '• Correct any information that\'s wrong',
            '• Delete all your data permanently with one click',
            '• Withdraw consent anytime - your data will be deleted within 24 hours',
            '• For users under 13, parents control these decisions'
          ]
        },
        {
          heading: 'Who Can See Your Data',
          content: [
            'We limit access to protect your privacy:',
            '• Students can only see their own information',
            '• Teachers can see data for students in their assigned classes only',
            '• Parents can view their children\'s progress',
            '• We never sell or share your data with advertisers',
            '• We never share your data with other companies',
            '• Anonymous statistics (like "100 users played today") help us improve the app'
          ]
        },
        {
          heading: 'Data Retention & Deletion',
          content: [
            'We automatically clean up old accounts:',
            '• Inactive accounts (not used for 2 years) will be deleted',
            '• You\'ll receive a warning email 30 days before deletion',
            '• You can prevent deletion by simply logging in',
            '• When you delete your account, we erase:',
            '  - All game progress and scores',
            '  - Learning style results',
            '  - Any saved preferences',
            '• We keep anonymous statistics (no names) to improve the app'
          ]
        },
        {
          heading: 'If Something Goes Wrong',
          content: [
            'We take data breaches seriously:',
            '• We monitor for any security issues constantly',
            '• If your data is ever accessed improperly, we will:',
            '  - Email you within 24 hours',
            '  - Tell you exactly what happened',
            '  - Explain what information was affected',
            '  - Describe what we\'re doing to fix it',
            '  - Offer help to protect your account'
          ]
        },
        {
          heading: 'Questions or Concerns',
          content: [
            'We\'re here to help!',
            '• If you have questions about your privacy, contact us through GitHub',
            '• You can request a copy of all your data',
            '• You can ask us to correct incorrect information',
            '• You can file a complaint with the Privacy Commissioner of Canada if you\'re not satisfied',
            '',
            'This policy follows Canadian PIPEDA laws to protect your privacy.'
          ]
        }
      ]
    }
  }
}
