import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Clock, Trophy } from '@phosphor-icons/react'
import { GameIllustration } from '@/components/GameIllustration'

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
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <circle cx="60" cy="60" r="35" fill="currentColor" opacity="0.15" />
      <rect x="45" y="38" width="30" height="38" rx="4" fill="currentColor" opacity="0.25" />
      <rect x="48" y="33" width="24" height="6" rx="3" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="58" r="10" fill="currentColor" opacity="0.4" />
      <rect x="58" y="48" width="4" height="20" fill="currentColor" opacity="0.5" />
      <rect x="50" y="56" width="20" height="4" fill="currentColor" opacity="0.5" />
      <circle cx="52" cy="46" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="68" cy="46" r="2" fill="currentColor" opacity="0.3" />
      <path d="M 50,68 Q 60,72 70,68" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
    </svg>
  ),
  investing: (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <rect x="20" y="90" width="8" height="25" fill="currentColor" opacity="0.25" />
      <rect x="32" y="75" width="8" height="40" fill="currentColor" opacity="0.3" />
      <rect x="44" y="60" width="8" height="55" fill="currentColor" opacity="0.35" />
      <rect x="56" y="45" width="8" height="70" fill="currentColor" opacity="0.4" />
      <rect x="68" y="30" width="8" height="85" fill="currentColor" opacity="0.45" />
      <rect x="80" y="20" width="8" height="95" fill="currentColor" opacity="0.5" />
      <polyline
        points="24,86 36,71 48,56 60,41 72,26 84,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="84,16 84,24 76,16" fill="currentColor" opacity="0.6" />
    </svg>
  ),
  credit: (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <rect x="15" y="35" width="90" height="55" rx="8" fill="currentColor" opacity="0.2" />
      <rect x="15" y="48" width="90" height="12" fill="currentColor" opacity="0.4" />
      <rect x="25" y="68" width="25" height="6" rx="3" fill="currentColor" opacity="0.3" />
      <rect x="25" y="78" width="40" height="5" rx="2" fill="currentColor" opacity="0.25" />
      <circle cx="85" cy="73" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="95" cy="73" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="90" cy="73" r="5" fill="currentColor" opacity="0.5" />
      <rect x="18" y="38" width="20" height="7" rx="2" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <rect x="30" y="45" width="60" height="50" fill="currentColor" opacity="0.2" />
      <rect x="30" y="35" width="60" height="10" fill="currentColor" opacity="0.3" />
      <polygon points="60,20 30,35 90,35" fill="currentColor" opacity="0.35" />
      <rect x="40" y="55" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="54" y="55" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="68" y="55" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="40" y="72" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="54" y="72" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="68" y="72" width="12" height="15" fill="currentColor" opacity="0.25" />
      <rect x="50" y="75" width="20" height="20" fill="currentColor" opacity="0.4" />
      <rect x="55" y="85" width="3" height="10" fill="currentColor" opacity="0.3" />
      <rect x="62" y="85" width="3" height="10" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <circle cx="60" cy="60" r="35" fill="currentColor" opacity="0.15" />
      <circle cx="60" cy="60" r="25" fill="currentColor" opacity="0.2" />
      <path
        d="M 60 30 L 65 48 L 83 48 L 69 59 L 74 77 L 60 66 L 46 77 L 51 59 L 37 48 L 55 48 Z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

export default function GameCard({
  id,
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

  const gameIllustrationMap: Record<string, 'lemonade-stand' | 'budget-runner' | 'market-tycoon' | 'debt-dash' | 'coin-catcher' | 'investment-tower' | 'credit-defender' | 'business-builder'> = {
    'lemonade-boss': 'lemonade-stand',
    'pixel-budget-runner': 'budget-runner',
    'market-tycoon': 'market-tycoon',
    'debt-dash': 'debt-dash',
    'coin-catcher': 'coin-catcher',
    'budget-balancer': 'budget-runner',
    'investment-climber': 'investment-tower',
    'credit-defender': 'credit-defender',
    'credit-card-memory': 'credit-defender',
    'business-builder': 'business-builder',
    'compound-growth': 'investment-tower'
  }

  const illustrationType = gameIllustrationMap[id]

  return (
    <motion.div
      whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className="relative group"
    >
      <Card
        className={`h-full cursor-pointer overflow-hidden border-2 transition-all ${
          isLocked
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:shadow-2xl hover:border-primary/50'
        }`}
        onClick={() => !isLocked && onSelect()}
        role="button"
        aria-label={`Play ${title} - ${difficulty} difficulty, ${estimatedTime}`}
        tabIndex={isLocked ? -1 : 0}
        onKeyDown={(e) => {
          if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <div className={`relative h-36 bg-gradient-to-br ${categoryColors[category]} overflow-hidden`}>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {illustrationType ? (
              <div className="w-full h-full p-4">
                <GameIllustration type={illustrationType} animate={!isLocked} />
              </div>
            ) : illustration ? (
              illustration
            ) : (
              categoryIllustrations[category]
            )}
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {!isLocked && (
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          )}
          
          <div className="absolute top-4 left-4 text-white">
            <motion.div 
              className="text-4xl mb-1"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={`${difficultyColors[difficulty]} border shadow-sm`}>
              {difficulty}
            </Badge>
          </div>

          {isLocked && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Lock size={48} className="text-white drop-shadow-lg" weight="fill" />
              </motion.div>
            </motion.div>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl leading-tight">{title}</CardTitle>
          <CardDescription className="line-clamp-2 leading-relaxed">{description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={16} weight="duotone" />
              <span className="font-medium">{estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy size={16} weight="duotone" />
              <span className="capitalize font-medium">{category}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLocked && (
        <>
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10" />
          </motion.div>
          
          <motion.div
            className="absolute -inset-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{
              background: [
                `radial-gradient(circle at 0% 0%, ${categoryColors[category].split(' ')[0].replace('from-', 'rgb(var(--')}30 0%, transparent 50%)`,
                `radial-gradient(circle at 100% 100%, ${categoryColors[category].split(' ')[1].replace('to-', 'rgb(var(--')}30 0%, transparent 50%)`,
                `radial-gradient(circle at 0% 0%, ${categoryColors[category].split(' ')[0].replace('from-', 'rgb(var(--')}30 0%, transparent 50%)`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </>
      )}
    </motion.div>
  )
}
