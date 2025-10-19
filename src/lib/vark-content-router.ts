/**
 * VARK Content Router
 * Adaptive content delivery based on learning style preferences
 */

import type { VARKProfile, VARKDimension } from '@/data/vark-questions'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ContentType = 'visual' | 'aural' | 'text' | 'interactive'

export interface ContentVariant {
  type: ContentType
  priority: number
  component?: any // React component type
  url?: string
  duration?: number // For audio/video content
}

export interface AdaptiveContent {
  conceptId: string
  title: string
  variants: {
    visual?: ContentVariant
    aural?: ContentVariant
    text?: ContentVariant
    interactive?: ContentVariant
  }
}

export interface ContentRouterResult {
  primaryContent: ContentVariant
  alternativeContents: ContentVariant[]
  userCanToggle: boolean
  recommendations: string[]
}

// ============================================================================
// VARK THRESHOLDS
// ============================================================================

const VARK_THRESHOLDS = {
  HIGH: 0.35,      // Strong preference
  MODERATE: 0.25,  // Moderate preference
  LOW: 0.15        // Weak preference
} as const

// ============================================================================
// CONTENT ROUTER
// ============================================================================

/**
 * Routes content based on user's VARK profile
 * @param profile User's VARK learning style profile
 * @param content Available content variants
 * @returns Prioritized content with recommendations
 */
export function routeContent(
  profile: VARKProfile,
  content: AdaptiveContent
): ContentRouterResult {
  // Calculate priorities for each content type
  const priorities = calculateContentPriorities(profile)
  
  // Get available variants
  const availableVariants = Object.entries(content.variants)
    .filter(([_, variant]) => variant !== undefined)
    .map(([type, variant]) => ({
      ...variant!,
      type: mapDimensionToContentType(type as VARKDimension),
      priority: priorities[mapDimensionToContentType(type as VARKDimension)]
    }))
    .sort((a, b) => b.priority - a.priority)
  
  if (availableVariants.length === 0) {
    throw new Error(`No content variants available for concept: ${content.conceptId}`)
  }
  
  const primaryContent = availableVariants[0]
  const alternativeContents = availableVariants.slice(1)
  
  // Generate recommendations
  const recommendations = generateRecommendations(profile, primaryContent.type)
  
  return {
    primaryContent,
    alternativeContents,
    userCanToggle: alternativeContents.length > 0,
    recommendations
  }
}

/**
 * Calculate priority scores for each content type based on VARK profile
 */
function calculateContentPriorities(profile: VARKProfile): Record<ContentType, number> {
  return {
    visual: profile.visual,
    aural: profile.aural,
    text: profile.readwrite,
    interactive: profile.kinesthetic
  }
}

/**
 * Map VARK dimension to content type
 */
function mapDimensionToContentType(dimension: VARKDimension): ContentType {
  const mapping: Record<VARKDimension, ContentType> = {
    visual: 'visual',
    aural: 'aural',
    readwrite: 'text',
    kinesthetic: 'interactive'
  }
  return mapping[dimension]
}

/**
 * Generate personalized recommendations for content consumption
 */
function generateRecommendations(
  profile: VARKProfile,
  primaryContentType: ContentType
): string[] {
  const recommendations: string[] = []
  
  // High visual learners
  if (profile.visual >= VARK_THRESHOLDS.HIGH) {
    recommendations.push('Color-coded charts and infographics have been prioritized for you')
    if (primaryContentType === 'visual') {
      recommendations.push('Try taking screenshots or drawing your own diagrams to reinforce learning')
    }
  }
  
  // High aural learners
  if (profile.aural >= VARK_THRESHOLDS.HIGH) {
    recommendations.push('Audio explanations and voice-overs are available for this content')
    if (primaryContentType === 'aural') {
      recommendations.push('Consider discussing this concept with a friend or teaching it out loud')
    }
  }
  
  // High read/write learners
  if (profile.readwrite >= VARK_THRESHOLDS.HIGH) {
    recommendations.push('Detailed text guides and bullet-point summaries are provided')
    if (primaryContentType === 'text') {
      recommendations.push('Take comprehensive notes and rewrite key concepts in your own words')
    }
  }
  
  // High kinesthetic learners
  if (profile.kinesthetic >= VARK_THRESHOLDS.HIGH) {
    recommendations.push('Interactive mini-games and hands-on exercises are ready for you')
    if (primaryContentType === 'interactive') {
      recommendations.push('Practice with real-world examples and experiment with different scenarios')
    }
  }
  
  // Multimodal learners
  const highScores = Object.values(profile).filter(v => v >= VARK_THRESHOLDS.HIGH)
  if (highScores.length > 1) {
    recommendations.push('You benefit from multiple content types - all formats are available!')
  }
  
  return recommendations
}

// ============================================================================
// CONTENT ADAPTATION STRATEGIES
// ============================================================================

export interface ContentAdaptation {
  showVisualFirst: boolean
  autoPlayAudio: boolean
  showTextGuide: boolean
  prioritizeInteractive: boolean
  enableAudioFeedback: boolean
  useColorCoding: boolean
  provideDetailedText: boolean
  enableDragDrop: boolean
}

/**
 * Get content adaptation strategy based on VARK profile
 */
export function getContentAdaptation(profile: VARKProfile): ContentAdaptation {
  return {
    // Visual adaptations
    showVisualFirst: profile.visual >= VARK_THRESHOLDS.HIGH,
    useColorCoding: profile.visual >= VARK_THRESHOLDS.MODERATE,
    
    // Aural adaptations
    autoPlayAudio: profile.aural >= VARK_THRESHOLDS.HIGH,
    enableAudioFeedback: profile.aural >= VARK_THRESHOLDS.MODERATE,
    
    // Read/Write adaptations
    showTextGuide: profile.readwrite >= VARK_THRESHOLDS.HIGH,
    provideDetailedText: profile.readwrite >= VARK_THRESHOLDS.MODERATE,
    
    // Kinesthetic adaptations
    prioritizeInteractive: profile.kinesthetic >= VARK_THRESHOLDS.HIGH,
    enableDragDrop: profile.kinesthetic >= VARK_THRESHOLDS.MODERATE
  }
}

// ============================================================================
// CONTENT PRESENTATION HELPERS
// ============================================================================

/**
 * Get icon for content type
 */
export function getContentTypeIcon(type: ContentType): string {
  const icons: Record<ContentType, string> = {
    visual: '👁️',
    aural: '🔊',
    text: '📝',
    interactive: '🎮'
  }
  return icons[type]
}

/**
 * Get label for content type
 */
export function getContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    visual: 'Visual',
    aural: 'Audio',
    text: 'Text',
    interactive: 'Interactive'
  }
  return labels[type]
}

/**
 * Get description for content type
 */
export function getContentTypeDescription(type: ContentType): string {
  const descriptions: Record<ContentType, string> = {
    visual: 'Charts, diagrams, and infographics',
    aural: 'Audio explanations and discussions',
    text: 'Detailed guides and written content',
    interactive: 'Hands-on activities and games'
  }
  return descriptions[type]
}

// ============================================================================
// LEARNING PATH OPTIMIZATION
// ============================================================================

/**
 * Suggest optimal learning sequence based on VARK profile
 */
export function suggestLearningSequence(
  profile: VARKProfile,
  availableContentTypes: ContentType[]
): ContentType[] {
  const priorities = calculateContentPriorities(profile)
  
  return availableContentTypes
    .sort((a, b) => priorities[b] - priorities[a])
}

/**
 * Calculate estimated engagement time based on learning style and content type
 */
export function estimateEngagementTime(
  profile: VARKProfile,
  contentType: ContentType,
  baseMinutes: number
): number {
  const alignment = calculateContentPriorities(profile)[contentType]
  
  // Higher alignment = faster comprehension
  const efficiencyMultiplier = 1 + (alignment * 0.5)
  
  return Math.round(baseMinutes / efficiencyMultiplier)
}

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

export interface LearningAnalytics {
  preferredContentType: ContentType
  contentTypeUsage: Record<ContentType, number>
  averageEngagementTime: Record<ContentType, number>
  completionRates: Record<ContentType, number>
}

/**
 * Analyze learning patterns to refine VARK profile
 */
export function analyzeLearningPatterns(
  analytics: LearningAnalytics
): Partial<VARKProfile> {
  const usage = analytics.contentTypeUsage
  const totalUsage = Object.values(usage).reduce((sum, count) => sum + count, 0)
  
  if (totalUsage === 0) return {}
  
  return {
    visual: usage.visual / totalUsage,
    aural: usage.aural / totalUsage,
    readwrite: usage.text / totalUsage,
    kinesthetic: usage.interactive / totalUsage
  }
}

/**
 * Suggest VARK profile adjustments based on behavior
 */
export function suggestProfileAdjustments(
  currentProfile: VARKProfile,
  analytics: LearningAnalytics
): {
  suggested: Partial<VARKProfile>
  confidence: number
  reasoning: string[]
} {
  const behaviorProfile = analyzeLearningPatterns(analytics)
  const reasoning: string[] = []
  
  // Calculate difference between stated and revealed preferences
  let totalDifference = 0
  Object.keys(currentProfile).forEach(key => {
    const dimension = key as keyof VARKProfile
    const stated = currentProfile[dimension]
    const revealed = behaviorProfile[dimension] || 0
    const diff = Math.abs(stated - revealed)
    totalDifference += diff
    
    if (diff > 0.15) {
      const contentType = mapDimensionToContentType(dimension)
      if (revealed > stated) {
        reasoning.push(
          `You engage more with ${contentType} content than expected. Consider adjusting your ${dimension} preference.`
        )
      } else {
        reasoning.push(
          `You engage less with ${contentType} content than expected. Your ${dimension} preference might be overestimated.`
        )
      }
    }
  })
  
  // Confidence based on amount of data and consistency
  const totalInteractions = Object.values(analytics.contentTypeUsage)
    .reduce((sum, count) => sum + count, 0)
  const confidence = Math.min(totalInteractions / 50, 1) * (1 - totalDifference / 4)
  
  return {
    suggested: behaviorProfile,
    confidence,
    reasoning
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  routeContent,
  getContentAdaptation,
  getContentTypeIcon,
  getContentTypeLabel,
  getContentTypeDescription,
  suggestLearningSequence,
  estimateEngagementTime,
  analyzeLearningPatterns,
  suggestProfileAdjustments
}
