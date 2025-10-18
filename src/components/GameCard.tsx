import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Clock, Trophy } from '@phosphor-icons/react'

interface GameCardProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  category: 'savings' | 'investing' | 'credit' | 'business' | 'general'
  isLocked?: boolean
  onSelect: () => void
  backgroundColor?: string
  illustration?: React.ReactNode
}

const categoryColors = {
  savings: 'from-emerald-400 to-green-500',
  investing: 'from-blue-400 to-indigo-500',
  credit: 'from-purple-400 to-pink-500',
  business: 'from-orange-400 to-red-500',
  general: 'from-cyan-400 to-blue-500'
}

const categoryIllustrations = {
  savings: (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <circle cx="60" cy="60" r="35" fill="currentColor" opacity="0.2" />
      <rect x="45" y="40" width="30" height="35" rx="4" fill="currentColor" opacity="0.3" />
      <rect x="50" y="35" width="20" height="5" rx="2" fill="currentColor" opacity="0.4" />
      <circle cx="60" cy="58" r="8" fill="currentColor" opacity="0.5" />
      <rect x="58" y="50" width="4" height="16" fill="currentColor" opacity="0.6" />
    </svg>
  ),
  investing: (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <polyline
        points="20,80 35,65 50,70 65,50 80,55 95,35"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.4"
      />
      <circle cx="35" cy="65" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="70" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="65" cy="50" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="80" cy="55" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="95" cy="35" r="5" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  credit: (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <rect x="20" y="40" width="80" height="50" rx="6" fill="currentColor" opacity="0.3" />
      <rect x="20" y="50" width="80" height="10" fill="currentColor" opacity="0.5" />
      <rect x="30" y="70" width="20" height="4" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="30" y="78" width="35" height="4" rx="2" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <rect x="35" y="55" width="15" height="35" fill="currentColor" opacity="0.3" />
      <rect x="52.5" y="40" width="15" height="50" fill="currentColor" opacity="0.4" />
      <rect x="70" y="25" width="15" height="65" fill="currentColor" opacity="0.5" />
      <path d="M 30 95 L 90 95" stroke="currentColor" strokeWidth="3" opacity="0.4" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <circle cx="60" cy="60" r="30" fill="currentColor" opacity="0.2" />
      <path
        d="M 60 35 L 65 50 L 80 50 L 68 60 L 73 75 L 60 65 L 47 75 L 52 60 L 40 50 L 55 50 Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}

export default function GameCard({
  title,
  description,
  icon,
  difficulty,
  estimatedTime,
  category,
  isLocked = false,
  onSelect,
  illustration
}: GameCardProps) {
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Hard: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <motion.div
      whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className="relative"
    >
      <Card
        className={`h-full cursor-pointer overflow-hidden border-2 transition-all ${
          isLocked
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:shadow-2xl hover:border-primary/50'
        }`}
        onClick={() => !isLocked && onSelect()}
      >
        <div className={`relative h-32 bg-gradient-to-br ${categoryColors[category]} overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center text-white opacity-30">
            {illustration || categoryIllustrations[category]}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          <div className="absolute top-4 left-4 text-white">
            <div className="text-4xl mb-1">{icon}</div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={`${difficultyColors[difficulty]} border`}>
              {difficulty}
            </Badge>
          </div>

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Lock size={48} className="text-white" weight="fill" />
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={16} />
              <span className="capitalize">{category}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLocked && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10" />
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(var(--primary-rgb), 0)',
                '0 0 0 4px rgba(var(--primary-rgb), 0.1)',
                '0 0 0 0 rgba(var(--primary-rgb), 0)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
