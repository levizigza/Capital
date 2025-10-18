import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
  color?: string
  delay?: number
}

export function ScoreRing({ 
  score, 
  maxScore = 100, 
  size = 120, 
  strokeWidth = 8,
  color = '#8b5cf6',
  delay = 0
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100))
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500
      const steps = 60
      const increment = percentage / steps
      let current = 0
      
      const interval = setInterval(() => {
        current += increment
        if (current >= percentage) {
          setAnimatedScore(percentage)
          clearInterval(interval)
        } else {
          setAnimatedScore(current)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.5, type: "spring" }}
        >
          {Math.round(animatedScore)}%
        </motion.span>
        <motion.span
          className="text-xs text-muted-foreground uppercase tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8 }}
        >
          Match
        </motion.span>
      </div>
    </div>
  )
}
