import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ARCHETYPES, type ArchetypeId } from '@/data/archetype-questions'
import { Sparkle, TrendUp } from '@phosphor-icons/react'

interface ArchetypeCardProps {
  primaryArchetype: ArchetypeId
  secondaryArchetype: ArchetypeId | null
  variant?: 'compact' | 'full'
}

export default function ArchetypeCard({ primaryArchetype, secondaryArchetype, variant = 'full' }: ArchetypeCardProps) {
  const primaryData = ARCHETYPES[primaryArchetype]
  const secondaryData = secondaryArchetype ? ARCHETYPES[secondaryArchetype] : null

  if (variant === 'compact') {
    return (
      <Card className="border-2 shadow-md" style={{ borderColor: primaryData.color.primary + '40' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: primaryData.color.primary + '20' }}
            >
              {primaryData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{primaryData.name}</h3>
                {secondaryData && (
                  <Badge variant="outline" className="text-xs">
                    +{secondaryData.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{primaryData.tagline}</p>
              <p className="text-xs italic text-muted-foreground mt-1 line-clamp-1">"{primaryData.motto}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 shadow-lg overflow-hidden" style={{ borderColor: primaryData.color.primary }}>
      <div 
        className="h-2"
        style={{ 
          background: `linear-gradient(90deg, ${primaryData.color.primary}, ${primaryData.color.secondary}, ${primaryData.color.accent})`
        }}
      />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: primaryData.color.primary + '20' }}
            >
              {primaryData.icon}
            </div>
            <div>
              <CardTitle className="text-2xl mb-1">{primaryData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{primaryData.tagline}</p>
              {secondaryData && (
                <Badge variant="outline" className="mt-2">
                  Secondary: {secondaryData.name} {secondaryData.icon}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <blockquote 
            className="text-base font-medium italic border-l-4 pl-4 py-2"
            style={{ borderColor: primaryData.color.primary }}
          >
            "{primaryData.motto}"
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1">
              <Sparkle weight="fill" className="text-yellow-500" size={16} />
              Top Strengths
            </h4>
            <ul className="space-y-1">
              {primaryData.strengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1">
              <TrendUp weight="bold" size={16} />
              Growth Focus
            </h4>
            <ul className="space-y-1">
              {primaryData.growthZones.slice(0, 3).map((zone, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="mt-0.5">→</span>
                  <span>{zone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Ideal Learning Style</h4>
          <div className="flex flex-wrap gap-1.5">
            {primaryData.preferredLearning.slice(0, 4).map((learning, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {learning}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
