import { motion } from 'framer-motion'

interface GameIllustrationProps {
  type: 'lemonade-stand' | 'budget-runner' | 'market-tycoon' | 'debt-dash' | 'coin-catcher' | 'investment-tower' | 'credit-defender' | 'business-builder'
  className?: string
  animate?: boolean
}

export function GameIllustration({ type, className = "w-full h-full", animate = true }: GameIllustrationProps) {
  const containerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  const illustrations = {
    'lemonade-stand': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="40" y="120" width="120" height="60" fill="oklch(0.95 0.08 70)" stroke="oklch(0.75 0.15 60)" strokeWidth="3" />
          <rect x="40" y="90" width="120" height="8" fill="oklch(0.85 0.12 65)" />
          <polygon points="100,60 40,90 160,90" fill="oklch(0.90 0.10 70)" stroke="oklch(0.75 0.15 60)" strokeWidth="2" />
          <motion.g variants={floatVariants} animate={animate ? "animate" : "initial"}>
            <rect x="70" y="130" width="60" height="40" rx="4" fill="oklch(0.95 0.15 80)" stroke="oklch(0.80 0.18 75)" strokeWidth="2" />
            <circle cx="100" cy="145" r="15" fill="oklch(0.98 0.10 85)" opacity="0.6" />
            <circle cx="95" cy="150" r="12" fill="oklch(0.95 0.12 80)" opacity="0.7" />
            <circle cx="105" cy="150" r="12" fill="oklch(0.95 0.12 80)" opacity="0.7" />
            <path d="M 80 160 Q 85 162 90 160 Q 95 158 100 160 Q 105 162 110 160 Q 115 158 120 160" stroke="oklch(0.85 0.15 75)" strokeWidth="2" fill="none" />
          </motion.g>
          <text x="100" y="105" textAnchor="middle" fill="oklch(0.35 0.15 60)" fontSize="16" fontWeight="bold">
            Lemonade
          </text>
          <circle cx="85" cy="140" r="4" fill="oklch(0.95 0.20 85)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="115" cy="138" r="3" fill="oklch(0.95 0.20 85)">
            <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </motion.g>
      </svg>
    ),
    'budget-runner': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="20" y="140" width="160" height="20" fill="oklch(0.45 0.15 100)" />
          <rect x="30" y="130" width="25" height="10" fill="oklch(0.60 0.12 90)" />
          <rect x="70" y="130" width="30" height="10" fill="oklch(0.60 0.12 90)" />
          <rect x="120" y="130" width="20" height="10" fill="oklch(0.60 0.12 90)" />
          
          <motion.g
            animate={animate ? {
              x: [-10, 0, -10],
              transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
            } : {}}
          >
            <rect x="80" y="90" width="20" height="35" rx="2" fill="oklch(0.70 0.20 280)" />
            <circle cx="90" cy="80" r="12" fill="oklch(0.75 0.18 275)" />
            <rect x="84" y="125" width="5" height="15" fill="oklch(0.65 0.22 285)" />
            <rect x="97" y="125" width="5" height="15" fill="oklch(0.65 0.22 285)" />
            <rect x="75" y="95" width="8" height="12" rx="1" fill="oklch(0.75 0.18 280)" />
            <rect x="103" y="100" width="8" height="10" rx="1" fill="oklch(0.75 0.18 280)" />
          </motion.g>

          <motion.g
            animate={animate ? {
              x: [150, -50],
              transition: { duration: 3, repeat: Infinity, ease: "linear" }
            } : {}}
          >
            <rect x="140" y="110" width="25" height="20" rx="3" fill="oklch(0.85 0.15 65)" stroke="oklch(0.75 0.18 60)" strokeWidth="2" />
            <text x="152" y="123" textAnchor="middle" fill="oklch(0.40 0.18 65)" fontSize="12" fontWeight="bold">$</text>
          </motion.g>

          <motion.path
            d="M 180 50 Q 185 55 180 60"
            stroke="oklch(0.80 0.15 200)"
            strokeWidth="2"
            fill="none"
            animate={animate ? {
              opacity: [0, 1, 0],
              transition: { duration: 2, repeat: Infinity }
            } : {}}
          />
        </motion.g>
      </svg>
    ),
    'coin-catcher': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="60" y="140" width="80" height="12" rx="6" fill="oklch(0.50 0.20 280)" />
          <rect x="65" y="135" width="70" height="8" fill="oklch(0.60 0.18 285)" />
          
          {[
            { x: 80, delay: 0, dur: 2 },
            { x: 110, delay: 0.5, dur: 2.2 },
            { x: 140, delay: 1, dur: 1.8 },
          ].map((coin, i) => (
            <motion.g
              key={i}
              animate={animate ? {
                y: [0, 120],
                opacity: [1, 1, 0],
                rotate: [0, 360],
                transition: {
                  duration: coin.dur,
                  repeat: Infinity,
                  delay: coin.delay,
                  ease: "easeIn"
                }
              } : {}}
            >
              <circle cx={coin.x} cy="30" r="12" fill="oklch(0.90 0.18 75)" stroke="oklch(0.80 0.20 70)" strokeWidth="2" />
              <circle cx={coin.x} cy="30" r="8" fill="none" stroke="oklch(0.80 0.20 70)" strokeWidth="1.5" />
              <text x={coin.x} y="35" textAnchor="middle" fill="oklch(0.70 0.20 70)" fontSize="12" fontWeight="bold">$</text>
            </motion.g>
          ))}

          <motion.g
            animate={animate ? {
              x: [-3, 3, -3],
              transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            } : {}}
          >
            <path d="M 80 150 L 120 150 L 115 155 L 85 155 Z" fill="oklch(0.65 0.22 285)" />
          </motion.g>

          <circle cx="100" cy="170" r="8" fill="oklch(0.90 0.18 75)">
            <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
          </circle>
        </motion.g>
      </svg>
    ),
    'market-tycoon': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="40" y="140" width="120" height="40" fill="oklch(0.40 0.15 240)" />
          <rect x="40" y="135" width="120" height="8" fill="oklch(0.50 0.12 240)" />
          
          {[
            { x: 55, h: 30 },
            { x: 75, h: 45 },
            { x: 95, h: 25 },
            { x: 115, h: 50 },
            { x: 135, h: 35 }
          ].map((bar, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y={135 - bar.h}
              width="12"
              height={bar.h}
              fill={i % 2 === 0 ? "oklch(0.65 0.20 145)" : "oklch(0.65 0.22 25)"}
              initial={{ height: 0 }}
              animate={animate ? {
                height: [0, bar.h, bar.h * 0.9, bar.h],
                y: [135, 135 - bar.h, 135 - bar.h * 0.9, 135 - bar.h],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }
              } : {}}
            />
          ))}

          <motion.polyline
            points="52,115 72,95 92,105 112,70 132,80"
            stroke="oklch(0.75 0.20 285)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={animate ? {
              pathLength: [0, 1],
              transition: { duration: 2, repeat: Infinity }
            } : {}}
          />

          <text x="100" y="30" textAnchor="middle" fill="oklch(0.40 0.15 240)" fontSize="18" fontWeight="bold">
            STOCK
          </text>
          <motion.polygon
            points="140,60 145,70 135,70"
            fill="oklch(0.65 0.20 145)"
            animate={animate ? {
              y: [-2, 2, -2],
              transition: { duration: 1.5, repeat: Infinity }
            } : {}}
          />
        </motion.g>
      </svg>
    ),
    'debt-dash': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="20" y="140" width="160" height="20" fill="oklch(0.50 0.15 25)" />
          
          <motion.g
            animate={animate ? {
              x: [-20, 0, -20],
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            } : {}}
          >
            <circle cx="80" cy="115" r="18" fill="oklch(0.70 0.20 350)" />
            <circle cx="80" cy="115" r="12" fill="oklch(0.75 0.18 355)" />
            <rect x="74" y="133" width="5" height="7" fill="oklch(0.65 0.22 345)" />
            <rect x="87" y="133" width="5" height="7" fill="oklch(0.65 0.22 345)" />
            <rect x="70" y="110" width="8" height="10" fill="oklch(0.75 0.18 350)" />
            <rect x="88" y="110" width="8" height="10" fill="oklch(0.75 0.18 350)" />
          </motion.g>

          <motion.g
            animate={animate ? {
              x: [200, -50],
              transition: { duration: 4, repeat: Infinity, ease: "linear", delay: 0.5 }
            } : {}}
          >
            <rect x="130" y="100" width="35" height="30" rx="4" fill="oklch(0.60 0.22 25)" stroke="oklch(0.50 0.25 20)" strokeWidth="2" />
            <rect x="135" y="105" width="25" height="5" fill="oklch(0.70 0.20 25)" />
            <text x="147" y="122" textAnchor="middle" fill="oklch(0.95 0 0)" fontSize="10" fontWeight="bold">DEBT</text>
          </motion.g>

          <motion.path
            d="M 40 80 Q 60 70 80 75 T 120 70 T 160 75"
            stroke="oklch(0.60 0.22 25)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            animate={animate ? {
              strokeDashoffset: [0, -10],
              transition: { duration: 1, repeat: Infinity, ease: "linear" }
            } : {}}
          />

          <text x="100" y="50" textAnchor="middle" fill="oklch(0.40 0.22 25)" fontSize="16" fontWeight="bold">
            Escape!
          </text>
        </motion.g>
      </svg>
    ),
    'investment-tower': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="60" y="150" width="80" height="30" fill="oklch(0.50 0.15 240)" />
          
          {[
            { y: 120, width: 70, color: "oklch(0.65 0.18 220)" },
            { y: 95, width: 60, color: "oklch(0.70 0.16 230)" },
            { y: 75, width: 50, color: "oklch(0.75 0.14 240)" },
            { y: 60, width: 40, color: "oklch(0.80 0.12 250)" }
          ].map((block, i) => (
            <motion.rect
              key={i}
              x={100 - block.width / 2}
              y={block.y}
              width={block.width}
              height={20}
              rx="2"
              fill={block.color}
              stroke="oklch(0.40 0.15 240)"
              strokeWidth="2"
              initial={{ y: block.y + 50, opacity: 0 }}
              animate={animate ? {
                y: block.y,
                opacity: 1,
                transition: {
                  delay: i * 0.3,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }
              } : {}}
            />
          ))}

          <motion.polygon
            points="100,40 110,60 90,60"
            fill="oklch(0.90 0.18 75)"
            initial={{ scale: 0 }}
            animate={animate ? {
              scale: [0, 1.2, 1],
              rotate: [0, 10, 0],
              transition: {
                delay: 1.2,
                duration: 0.6,
                type: "spring"
              }
            } : {}}
          />

          <motion.circle
            cx="100"
            cy="30"
            r="15"
            fill="none"
            stroke="oklch(0.90 0.18 75)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={animate ? {
              scale: [0, 1.5, 0],
              opacity: [0, 0.6, 0],
              transition: {
                delay: 1.2,
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1
              }
            } : {}}
          />
        </motion.g>
      </svg>
    ),
    'credit-defender': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="50" y="80" width="100" height="65" rx="8" fill="oklch(0.65 0.20 280)" />
          <rect x="50" y="95" width="100" height="15" fill="oklch(0.55 0.22 275)" />
          <rect x="60" y="115" width="35" height="8" rx="4" fill="oklch(0.80 0.15 280)" />
          <rect x="60" y="128" width="50" height="6" rx="3" fill="oklch(0.75 0.17 280)" />
          
          <circle cx="120" cy="125" r="10" fill="oklch(0.80 0.18 280)" />
          <circle cx="135" cy="125" r="10" fill="oklch(0.80 0.18 280)" />
          <circle cx="127.5" cy="125" r="6" fill="oklch(0.90 0.15 280)" />

          <motion.path
            d="M 100 40 L 100 70 L 80 80 L 120 80 L 100 70 Z"
            fill="oklch(0.70 0.20 145)"
            stroke="oklch(0.60 0.22 140)"
            strokeWidth="2"
            initial={{ y: -20, opacity: 0 }}
            animate={animate ? {
              y: 0,
              opacity: 1,
              transition: { duration: 0.6, delay: 0.3 }
            } : {}}
          />

          {[
            { x: 70, delay: 0 },
            { x: 100, delay: 0.3 },
            { x: 130, delay: 0.6 }
          ].map((spark, i) => (
            <motion.circle
              key={i}
              cx={spark.x}
              cy="60"
              r="4"
              fill="oklch(0.90 0.18 75)"
              animate={animate ? {
                y: [0, -10, 0],
                opacity: [1, 0.5, 1],
                scale: [1, 1.5, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  delay: spark.delay
                }
              } : {}}
            />
          ))}

          <text x="100" y="165" textAnchor="middle" fill="oklch(0.95 0 0)" fontSize="14" fontWeight="bold">
            850
          </text>
        </motion.g>
      </svg>
    ),
    'business-builder': (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g variants={containerVariants} initial="initial" animate={animate ? "animate" : "initial"} whileHover="hover">
          <rect x="60" y="100" width="80" height="70" fill="oklch(0.70 0.15 30)" />
          <rect x="60" y="90" width="80" height="10" fill="oklch(0.75 0.13 30)" />
          <polygon points="100,60 60,90 140,90" fill="oklch(0.80 0.12 35)" stroke="oklch(0.65 0.17 25)" strokeWidth="2" />
          
          {[
            { x: 72, y: 110 },
            { x: 92, y: 110 },
            { x: 112, y: 110 },
            { x: 72, y: 130 },
            { x: 92, y: 130 },
            { x: 112, y: 130 },
          ].map((window, i) => (
            <motion.rect
              key={i}
              x={window.x}
              y={window.y}
              width="12"
              height="12"
              fill="oklch(0.90 0.10 75)"
              initial={{ opacity: 0 }}
              animate={animate ? {
                opacity: [0, 1],
                transition: { delay: i * 0.1, duration: 0.3 }
              } : {}}
            >
              <animate attributeName="fill" values="oklch(0.90 0.10 75);oklch(0.95 0.08 80);oklch(0.90 0.10 75)" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
            </motion.rect>
          ))}

          <rect x="90" y="145" width="20" height="25" fill="oklch(0.40 0.15 30)" />

          <motion.path
            d="M 140 70 L 150 65 L 155 75 L 145 80 Z"
            fill="oklch(0.95 0.15 80)"
            animate={animate ? {
              rotate: [0, 10, 0],
              transition: { duration: 2, repeat: Infinity }
            } : {}}
            style={{ transformOrigin: "147px 72px" }}
          />

          <motion.circle
            cx="100"
            cy="50"
            r="20"
            fill="none"
            stroke="oklch(0.85 0.15 75)"
            strokeWidth="3"
            initial={{ scale: 0 }}
            animate={animate ? {
              scale: [0, 1.3, 0],
              opacity: [0, 0.8, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }
            } : {}}
          />
        </motion.g>
      </svg>
    )
  }

  return illustrations[type] || null
}
