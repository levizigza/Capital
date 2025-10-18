import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

const COLORS = [
  'oklch(0.65 0.20 350)',
  'oklch(0.70 0.18 75)',
  'oklch(0.55 0.15 145)',
  'oklch(0.60 0.22 290)',
  'oklch(0.70 0.15 200)',
  'oklch(0.65 0.15 65)',
]

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      const newParticles: Particle[] = []
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          rotation: Math.random() * 360,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 10 + 5,
          velocityX: (Math.random() - 0.5) * 15,
          velocityY: (Math.random() - 0.5) * 15 - 5,
        })
      }
      
      setParticles(newParticles)

      setTimeout(() => {
        setIsActive(false)
        setParticles([])
        onComplete?.()
      }, 3000)
    }
  }, [trigger, isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                rotate: particle.rotation,
                opacity: 1,
              }}
              animate={{
                x: particle.x + particle.velocityX * 100,
                y: particle.y + particle.velocityY * 100 + 500,
                rotate: particle.rotation + 720,
                opacity: 0,
              }}
              transition={{
                duration: 2.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
