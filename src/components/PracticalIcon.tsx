import { motion } from 'framer-motion'

interface PracticalIconProps {
  type: 'piggy-bank' | 'bar-chart' | 'trophy' | 'wallet' | 'clipboard' | 'receipt' | 'trend-up' | 'coins'
  className?: string
  animate?: boolean
}

export function PracticalIcon({ type, className = "w-full h-full", animate = true }: PracticalIconProps) {
  const iconVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const icons = {
    'piggy-bank': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <circle cx="60" cy="60" r="40" fill="oklch(0.95 0.05 35)" />
          <ellipse cx="60" cy="65" rx="32" ry="22" fill="oklch(0.80 0.12 35)" />
          <ellipse cx="60" cy="50" rx="35" ry="25" fill="oklch(0.85 0.10 35)" />
          <circle cx="50" cy="45" r="3" fill="oklch(0.25 0 0)" />
          <ellipse cx="38" cy="68" rx="6" ry="10" fill="oklch(0.75 0.14 35)" />
          <ellipse cx="82" cy="68" rx="6" ry="10" fill="oklch(0.75 0.14 35)" />
          <path d="M 60 35 Q 50 30 45 32 Q 40 34 42 38 Q 44 42 50 40 Q 56 38 60 35 Z" fill="oklch(0.82 0.11 35)" />
          <rect x="56" y="38" width="20" height="6" rx="3" fill="oklch(0.30 0 0)" opacity="0.3" />
          <path d="M 70 50 Q 85 48 90 52 Q 92 54 88 56 Q 84 58 70 55 Z" fill="oklch(0.80 0.12 35)" />
        </motion.g>
      </svg>
    ),
    'bar-chart': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <rect x="20" y="70" width="15" height="25" rx="2" fill="oklch(0.60 0.20 220)">
            <animate attributeName="height" values="25;40;25" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y" values="70;55;70" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="40" y="50" width="15" height="45" rx="2" fill="oklch(0.65 0.18 240)">
            <animate attributeName="height" values="45;55;45" dur="2.3s" repeatCount="indefinite" />
            <animate attributeName="y" values="50;40;50" dur="2.3s" repeatCount="indefinite" />
          </rect>
          <rect x="60" y="35" width="15" height="60" rx="2" fill="oklch(0.70 0.16 260)">
            <animate attributeName="height" values="60;70;60" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="35;25;35" dur="2.5s" repeatCount="indefinite" />
          </rect>
          <rect x="80" y="25" width="15" height="70" rx="2" fill="oklch(0.75 0.14 280)">
            <animate attributeName="height" values="70;80;70" dur="2.7s" repeatCount="indefinite" />
            <animate attributeName="y" values="25;15;25" dur="2.7s" repeatCount="indefinite" />
          </rect>
          <line x1="15" y1="95" x2="105" y2="95" stroke="oklch(0.40 0 0)" strokeWidth="2" />
          <line x1="15" y1="15" x2="15" y2="95" stroke="oklch(0.40 0 0)" strokeWidth="2" />
        </motion.g>
      </svg>
    ),
    'trophy': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <path d="M 40 30 L 35 50 Q 35 58 45 58 L 40 30" fill="oklch(0.85 0.15 70)" />
          <path d="M 80 30 L 85 50 Q 85 58 75 58 L 80 30" fill="oklch(0.85 0.15 70)" />
          <rect x="42" y="25" width="36" height="38" rx="4" fill="oklch(0.90 0.18 65)" />
          <path d="M 50 63 L 50 75 Q 50 78 53 78 L 67 78 Q 70 78 70 75 L 70 63" fill="oklch(0.85 0.15 70)" />
          <rect x="45" y="78" width="30" height="8" rx="4" fill="oklch(0.80 0.20 60)" />
          <circle cx="60" cy="45" r="8" fill="oklch(0.95 0.08 80)" />
          <path d="M 60 35 L 62 42 L 69 42 L 63 47 L 65 54 L 60 49 L 55 54 L 57 47 L 51 42 L 58 42 Z" fill="oklch(0.98 0.05 90)" />
        </motion.g>
      </svg>
    ),
    'wallet': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <rect x="25" y="40" width="70" height="50" rx="6" fill="oklch(0.45 0.15 30)" />
          <rect x="28" y="43" width="64" height="5" fill="oklch(0.55 0.12 30)" />
          <rect x="70" y="55" width="20" height="20" rx="10" fill="oklch(0.60 0.10 30)" />
          <circle cx="85" cy="65" r="4" fill="oklch(0.85 0.10 65)" />
          <path d="M 30 35 Q 28 35 28 38 L 28 43 L 92 43 L 92 38 Q 92 35 90 35 Z" fill="oklch(0.50 0.13 30)" />
        </motion.g>
      </svg>
    ),
    'clipboard': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <rect x="30" y="25" width="60" height="70" rx="4" fill="oklch(0.92 0.02 240)" stroke="oklch(0.50 0 0)" strokeWidth="2" />
          <rect x="45" y="18" width="30" height="12" rx="3" fill="oklch(0.65 0.15 240)" />
          <rect x="40" y="45" width="40" height="3" rx="1.5" fill="oklch(0.70 0.10 240)" />
          <rect x="40" y="55" width="35" height="3" rx="1.5" fill="oklch(0.75 0.08 240)" />
          <rect x="40" y="65" width="30" height="3" rx="1.5" fill="oklch(0.80 0.06 240)" />
          <rect x="40" y="75" width="38" height="3" rx="1.5" fill="oklch(0.75 0.08 240)" />
        </motion.g>
      </svg>
    ),
    'receipt': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <path d="M 35 20 L 85 20 L 85 100 L 80 95 L 75 100 L 70 95 L 65 100 L 60 95 L 55 100 L 50 95 L 45 100 L 40 95 L 35 100 Z" fill="oklch(0.97 0 0)" stroke="oklch(0.50 0 0)" strokeWidth="1.5" />
          <rect x="42" y="30" width="36" height="2" rx="1" fill="oklch(0.40 0 0)" />
          <rect x="42" y="38" width="30" height="2" rx="1" fill="oklch(0.50 0 0)" />
          <rect x="42" y="46" width="25" height="2" rx="1" fill="oklch(0.50 0 0)" />
          <rect x="42" y="54" width="32" height="2" rx="1" fill="oklch(0.50 0 0)" />
          <rect x="42" y="62" width="28" height="2" rx="1" fill="oklch(0.50 0 0)" />
          <line x1="40" y1="72" x2="80" y2="72" stroke="oklch(0.40 0 0)" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="42" y="78" width="20" height="3" rx="1.5" fill="oklch(0.30 0 0)" />
        </motion.g>
      </svg>
    ),
    'trend-up': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <polyline
            points="20,90 35,75 50,80 65,55 80,60 95,30"
            fill="none"
            stroke="oklch(0.65 0.20 145)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate attributeName="stroke-dasharray" values="0 200;200 0" dur="2s" repeatCount="indefinite" />
          </polyline>
          <polygon points="95,30 95,40 85,30" fill="oklch(0.65 0.20 145)" />
          <circle cx="20" cy="90" r="3" fill="oklch(0.70 0.18 145)" />
          <circle cx="35" cy="75" r="3" fill="oklch(0.70 0.18 145)" />
          <circle cx="50" cy="80" r="3" fill="oklch(0.70 0.18 145)" />
          <circle cx="65" cy="55" r="3" fill="oklch(0.70 0.18 145)" />
          <circle cx="80" cy="60" r="3" fill="oklch(0.70 0.18 145)" />
          <circle cx="95" cy="30" r="3" fill="oklch(0.70 0.18 145)" />
        </motion.g>
      </svg>
    ),
    'coins': (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          variants={iconVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
        >
          <ellipse cx="50" cy="55" rx="22" ry="22" fill="oklch(0.85 0.18 70)" stroke="oklch(0.75 0.20 65)" strokeWidth="2" />
          <ellipse cx="50" cy="55" rx="16" ry="16" fill="none" stroke="oklch(0.75 0.20 65)" strokeWidth="1.5" />
          <path d="M 50 45 L 50 65 M 45 50 Q 48 48 50 48 Q 53 48 53 50 Q 53 52 50 52 Q 47 52 47 54 Q 47 56 50 56 Q 53 56 55 58" stroke="oklch(0.75 0.20 65)" strokeWidth="2" strokeLinecap="round" />
          
          <ellipse cx="70" cy="65" rx="22" ry="22" fill="oklch(0.90 0.16 75)" stroke="oklch(0.80 0.18 70)" strokeWidth="2" />
          <ellipse cx="70" cy="65" rx="16" ry="16" fill="none" stroke="oklch(0.80 0.18 70)" strokeWidth="1.5" />
          <path d="M 70 55 L 70 75 M 65 60 Q 68 58 70 58 Q 73 58 73 60 Q 73 62 70 62 Q 67 62 67 64 Q 67 66 70 66 Q 73 66 75 68" stroke="oklch(0.80 0.18 70)" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </svg>
    )
  }

  return icons[type] || null
}
