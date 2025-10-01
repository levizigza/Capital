/**
 * VARK Learning Style Adaptation System
 * Handles Visual, Aural, Read/Write, and Kinesthetic learning preferences
 * Adapts content delivery and game mechanics based on learning style
 */

export interface VARKProfile {
  visual: number    // 0-1
  aural: number     // 0-1
  readWrite: number // 0-1
  kinesthetic: number // 0-1
  dominant: 'visual' | 'aural' | 'readWrite' | 'kinesthetic' | 'multimodal'
  confidence: number // 0-1, how confident we are in this assessment
}

export interface VARKQuestion {
  id: string
  question: string
  options: {
    text: string
    style: 'visual' | 'aural' | 'readWrite' | 'kinesthetic'
    weight: number
  }[]
}

export interface ContentAdaptation {
  priorityOrder: ('visual' | 'aural' | 'readWrite' | 'kinesthetic')[]
  visualElements: {
    useCharts: boolean
    useInfographics: boolean
    useAnimations: boolean
    useColorCoding: boolean
    useSpatialLayout: boolean
  }
  auralElements: {
    useNarration: boolean
    useSoundEffects: boolean
    useMusic: boolean
    useVerbalInstructions: boolean
    useDiscussion: boolean
  }
  textElements: {
    useDetailedText: boolean
    useBulletPoints: boolean
    useStepByStep: boolean
    useGlossary: boolean
    useWrittenSummary: boolean
  }
  kinestheticElements: {
    useMotionControls: boolean
    useHandsOnActivities: boolean
    useRealWorldSimulation: boolean
    usePhysicalMetaphors: boolean
    useBreakoutSessions: boolean
  }
}

export class VARKSystem {
  private profile: VARKProfile | null = null
  private adaptationRules: ContentAdaptation | null = null
  private learningHistory: { [key: string]: number } = {} // Track performance by modality
  private isAdaptive = true

  constructor() {
    this.loadSavedProfile()
  }

  private varkQuestions: VARKQuestion[] = [
    {
      id: 'money_learning',
      question: 'When learning about money management, you prefer to:',
      options: [
        { text: 'See charts, graphs, and visual examples', style: 'visual', weight: 1.0 },
        { text: 'Listen to explanations and discussions', style: 'aural', weight: 1.0 },
        { text: 'Read detailed guides and take notes', style: 'readWrite', weight: 1.0 },
        { text: 'Try hands-on budgeting exercises', style: 'kinesthetic', weight: 1.0 }
      ]
    },
    {
      id: 'problem_solving',
      question: 'When solving a financial problem, you tend to:',
      options: [
        { text: 'Draw diagrams or create visual maps', style: 'visual', weight: 0.9 },
        { text: 'Talk through the problem out loud', style: 'aural', weight: 0.9 },
        { text: 'Write lists and organize information', style: 'readWrite', weight: 0.9 },
        { text: 'Use real money or physical tools', style: 'kinesthetic', weight: 0.9 }
      ]
    },
    {
      id: 'memory_retention',
      question: 'You best remember financial concepts when:',
      options: [
        { text: 'You can picture them in your mind', style: 'visual', weight: 1.0 },
        { text: 'You hear them explained repeatedly', style: 'aural', weight: 1.0 },
        { text: 'You write them down and review notes', style: 'readWrite', weight: 1.0 },
        { text: 'You practice them through activities', style: 'kinesthetic', weight: 1.0 }
      ]
    },
    {
      id: 'instruction_preference',
      question: 'When learning a new financial app or tool, you prefer:',
      options: [
        { text: 'Screenshots and visual tutorials', style: 'visual', weight: 0.8 },
        { text: 'Video tutorials with narration', style: 'aural', weight: 0.8 },
        { text: 'Written step-by-step instructions', style: 'readWrite', weight: 0.8 },
        { text: 'Interactive demos you can try', style: 'kinesthetic', weight: 0.8 }
      ]
    },
    {
      id: 'concentration',
      question: 'You concentrate best when:',
      options: [
        { text: 'Everything is visually organized and clean', style: 'visual', weight: 0.7 },
        { text: 'You can listen to background music or sounds', style: 'aural', weight: 0.7 },
        { text: 'You have written materials to reference', style: 'readWrite', weight: 0.7 },
        { text: 'You can move around or use your hands', style: 'kinesthetic', weight: 0.7 }
      ]
    },
    {
      id: 'study_method',
      question: 'When studying for a financial literacy test, you would:',
      options: [
        { text: 'Create colorful charts and mind maps', style: 'visual', weight: 0.9 },
        { text: 'Record yourself reading and play it back', style: 'aural', weight: 0.9 },
        { text: 'Make detailed written summaries', style: 'readWrite', weight: 0.9 },
        { text: 'Create practice scenarios and role-play', style: 'kinesthetic', weight: 0.9 }
      ]
    },
    {
      id: 'explanation_preference',
      question: 'You understand budget allocation best through:',
      options: [
        { text: 'Pie charts and bar graphs', style: 'visual', weight: 1.0 },
        { text: 'Verbal explanations with examples', style: 'aural', weight: 1.0 },
        { text: 'Written breakdowns with percentages', style: 'readWrite', weight: 1.0 },
        { text: 'Physical sorting of money into jars', style: 'kinesthetic', weight: 1.0 }
      ]
    },
    {
      id: 'mistake_learning',
      question: 'When you make a financial mistake, you learn best by:',
      options: [
        { text: 'Seeing a visual comparison of right vs wrong', style: 'visual', weight: 0.8 },
        { text: 'Having someone explain what went wrong', style: 'aural', weight: 0.8 },
        { text: 'Writing a reflection about the experience', style: 'readWrite', weight: 0.8 },
        { text: 'Immediately trying a corrected approach', style: 'kinesthetic', weight: 0.8 }
      ]
    }
  ]

  getQuestions(): VARKQuestion[] {
    return this.varkQuestions
  }

  calculateProfile(responses: { questionId: string, selectedOption: number }[]): VARKProfile {
    const scores = {
      visual: 0,
      aural: 0,
      readWrite: 0,
      kinesthetic: 0
    }

    let totalWeight = 0

    responses.forEach(response => {
      const question = this.varkQuestions.find(q => q.id === response.questionId)
      if (question && question.options[response.selectedOption]) {
        const option = question.options[response.selectedOption]
        scores[option.style] += option.weight
        totalWeight += option.weight
      }
    })

    // Normalize scores to 0-1 range
    const normalizedScores = {
      visual: scores.visual / totalWeight,
      aural: scores.aural / totalWeight,
      readWrite: scores.readWrite / totalWeight,
      kinesthetic: scores.kinesthetic / totalWeight
    }

    // Determine dominant style
    const maxScore = Math.max(...Object.values(normalizedScores))
    const dominantStyles = Object.entries(normalizedScores)
      .filter(([_, score]) => score === maxScore)
      .map(([style, _]) => style)

    let dominant: VARKProfile['dominant']
    if (dominantStyles.length > 1 || maxScore < 0.4) {
      dominant = 'multimodal'
    } else {
      dominant = dominantStyles[0] as VARKProfile['dominant']
    }

    // Calculate confidence based on how distinct the dominant style is
    const sortedScores = Object.values(normalizedScores).sort((a, b) => b - a)
    const confidence = sortedScores[0] - sortedScores[1]

    this.profile = {
      ...normalizedScores,
      dominant,
      confidence: Math.min(1, confidence * 2) // Scale confidence
    }

    this.generateAdaptationRules()
    this.saveProfile()

    return this.profile
  }

  private generateAdaptationRules() {
    if (!this.profile) return

    // Create priority order based on scores
    const priorityOrder = Object.entries(this.profile)
      .filter(([key, _]) => ['visual', 'aural', 'readWrite', 'kinesthetic'].includes(key))
      .sort(([_, a], [__, b]) => (b as number) - (a as number))
      .map(([key, _]) => key) as ('visual' | 'aural' | 'readWrite' | 'kinesthetic')[]

    this.adaptationRules = {
      priorityOrder,
      visualElements: {
        useCharts: this.profile.visual > 0.3,
        useInfographics: this.profile.visual > 0.4,
        useAnimations: this.profile.visual > 0.5,
        useColorCoding: this.profile.visual > 0.2,
        useSpatialLayout: this.profile.visual > 0.3
      },
      auralElements: {
        useNarration: this.profile.aural > 0.3,
        useSoundEffects: this.profile.aural > 0.4,
        useMusic: this.profile.aural > 0.2,
        useVerbalInstructions: this.profile.aural > 0.5,
        useDiscussion: this.profile.aural > 0.6
      },
      textElements: {
        useDetailedText: this.profile.readWrite > 0.4,
        useBulletPoints: this.profile.readWrite > 0.3,
        useStepByStep: this.profile.readWrite > 0.5,
        useGlossary: this.profile.readWrite > 0.3,
        useWrittenSummary: this.profile.readWrite > 0.4
      },
      kinestheticElements: {
        useMotionControls: this.profile.kinesthetic > 0.4,
        useHandsOnActivities: this.profile.kinesthetic > 0.5,
        useRealWorldSimulation: this.profile.kinesthetic > 0.3,
        usePhysicalMetaphors: this.profile.kinesthetic > 0.4,
        useBreakoutSessions: this.profile.kinesthetic > 0.2
      }
    }
  }

  getProfile(): VARKProfile | null {
    return this.profile
  }

  getAdaptationRules(): ContentAdaptation | null {
    return this.adaptationRules
  }

  updateFromPerformance(modality: 'visual' | 'aural' | 'readWrite' | 'kinesthetic', performance: number) {
    if (!this.isAdaptive || !this.profile) return

    // Track performance by modality
    this.learningHistory[modality] = (this.learningHistory[modality] || 0) * 0.8 + performance * 0.2

    // Adjust profile based on performance (mild adaptation)
    const adjustment = (performance - 0.5) * 0.1 // Small adjustment factor
    
    if (adjustment > 0) {
      this.profile[modality] = Math.min(1, this.profile[modality] + adjustment)
      
      // Slightly reduce other modalities to maintain balance
      const others = (['visual', 'aural', 'readWrite', 'kinesthetic'] as const).filter(m => m !== modality)
      others.forEach(other => {
        this.profile![other] = Math.max(0, this.profile![other] - adjustment / 3)
      })
    }

    this.generateAdaptationRules()
    this.saveProfile()
  }

  shouldUseMotionControls(): boolean {
    return this.adaptationRules?.kinestheticElements.useMotionControls ?? false
  }

  shouldUseNarration(): boolean {
    return this.adaptationRules?.auralElements.useNarration ?? false
  }

  shouldUseDetailedText(): boolean {
    return this.adaptationRules?.textElements.useDetailedText ?? false
  }

  shouldUseVisualCharts(): boolean {
    return this.adaptationRules?.visualElements.useCharts ?? true
  }

  getPrimaryModality(): 'visual' | 'aural' | 'readWrite' | 'kinesthetic' | 'multimodal' {
    return this.profile?.dominant ?? 'multimodal'
  }

  getContentPriority(): ('visual' | 'aural' | 'readWrite' | 'kinesthetic')[] {
    return this.adaptationRules?.priorityOrder ?? ['visual', 'kinesthetic', 'aural', 'readWrite']
  }

  adaptGameInterface(baseInterface: any): any {
    if (!this.adaptationRules) return baseInterface

    return {
      ...baseInterface,
      showCharts: this.adaptationRules.visualElements.useCharts,
      showAnimations: this.adaptationRules.visualElements.useAnimations,
      useColorCoding: this.adaptationRules.visualElements.useColorCoding,
      enableNarration: this.adaptationRules.auralElements.useNarration,
      enableSoundEffects: this.adaptationRules.auralElements.useSoundEffects,
      showDetailedText: this.adaptationRules.textElements.useDetailedText,
      enableMotionControls: this.adaptationRules.kinestheticElements.useMotionControls,
      usePhysicalMetaphors: this.adaptationRules.kinestheticElements.usePhysicalMetaphors
    }
  }

  reset() {
    this.profile = null
    this.adaptationRules = null
    this.learningHistory = {}
    this.clearSavedProfile()
  }

  setAdaptive(adaptive: boolean) {
    this.isAdaptive = adaptive
  }

  private saveProfile() {
    if (this.profile && typeof localStorage !== 'undefined') {
      localStorage.setItem('vark_profile', JSON.stringify(this.profile))
      localStorage.setItem('vark_adaptation', JSON.stringify(this.adaptationRules))
    }
  }

  private loadSavedProfile() {
    if (typeof localStorage !== 'undefined') {
      const savedProfile = localStorage.getItem('vark_profile')
      const savedAdaptation = localStorage.getItem('vark_adaptation')
      
      if (savedProfile) {
        try {
          this.profile = JSON.parse(savedProfile)
        } catch (e) {
          console.warn('Failed to load saved VARK profile')
        }
      }

      if (savedAdaptation) {
        try {
          this.adaptationRules = JSON.parse(savedAdaptation)
        } catch (e) {
          console.warn('Failed to load saved VARK adaptation rules')
        }
      }
    }
  }

  private clearSavedProfile() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('vark_profile')
      localStorage.removeItem('vark_adaptation')
    }
  }
}