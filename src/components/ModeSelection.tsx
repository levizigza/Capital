import { motion } from 'framer-motion'
import { Plant, ChartBar, Sparkle, TrendUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { LearningMode } from '@/App'
import { useThrottledCallback } from '@/hooks/use-debounced-callback'

interface ModeSelectionProps {
  onSelectMode: (mode: LearningMode) => void
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const handleSelectMode = useThrottledCallback((mode: LearningMode) => {
    onSelectMode(mode)
  }, 500)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden relative bg-white">
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, oklch(0.96 0.01 280 / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.96 0.01 200 / 0.2) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl w-full relative z-10"
      >
        {/* Awwwards-style header with extreme whitespace */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8"
            style={{ 
              letterSpacing: '-0.04em',
              lineHeight: '1.05',
              color: 'oklch(0.15 0.01 240)',
              fontWeight: 700
            }}
          >
            FinanceQuest Pro
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ 
              color: 'oklch(0.45 0.01 240)',
              letterSpacing: '-0.01em',
              fontWeight: 400
            }}
          >
            Choose your learning adventure: grow a financial garden or master the data dashboard
          </motion.p>
        </div>

        {/* Cards with Awwwards spacing and minimal design */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
          >
            <Card 
              className="relative p-8 sm:p-10 lg:p-12 h-full border transition-all duration-500 cursor-pointer group overflow-hidden bg-white"
              style={{
                borderColor: 'oklch(0.92 0.01 240)',
                borderRadius: '1.5rem',
                boxShadow: '0 1px 3px oklch(0.15 0.01 240 / 0.06)'
              }}
              onClick={() => handleSelectMode('creative')}
              onTouchStart={() => handleSelectMode('creative')}
              role="button"
              tabIndex={0}
              aria-label="Select Creative Mode - Finance Garden"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectMode('creative')
                }
              }}
            >
              {/* Minimal top accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1" 
                style={{ background: 'oklch(0.55 0.18 145)' }}
              />
              
              <div className="flex flex-col space-y-8 sm:space-y-10">
                {/* Icon - minimal, clean */}
                <div className="relative">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: 'oklch(0.55 0.18 145 / 0.08)'
                    }}
                  >
                    <Plant className="w-7 h-7 sm:w-8 sm:h-8" weight="fill" style={{ color: 'oklch(0.45 0.18 145)' }} />
                  </div>
                </div>
                
                {/* Content - refined typography */}
                <div className="space-y-5">
                  <div>
                    <h2 
                      className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3"
                      style={{ 
                        color: 'oklch(0.20 0.01 240)',
                        letterSpacing: '-0.03em',
                        lineHeight: '1.1'
                      }}
                    >
                      Creative Mode
                    </h2>
                    <p 
                      className="text-base sm:text-lg font-medium mb-4"
                      style={{ 
                        color: 'oklch(0.45 0.01 240)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Finance Garden
                    </p>
                    <p 
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ 
                        color: 'oklch(0.50 0.01 240)',
                        lineHeight: '1.7'
                      }}
                    >
                      Watch your financial health bloom! Grow plants, unlock garden areas, and see your progress flourish in a beautiful living ecosystem.
                    </p>
                  </div>

                  {/* Features list - refined */}
                  <div className="space-y-3 pt-2">
                    {['Visual & narrative-driven', 'Growing plants & ecosystems', 'Metaphors & storytelling'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3" style={{ color: 'oklch(0.50 0.01 240)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'oklch(0.55 0.18 145)' }}></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button - minimal Awwwards style */}
                <Button 
                  size="lg"
                  className="w-full min-h-[52px] text-base font-medium transition-all duration-300 pointer-events-none rounded-xl"
                  style={{
                    background: 'oklch(0.20 0.01 240)',
                    color: 'white',
                    letterSpacing: '-0.01em'
                  }}
                  tabIndex={-1}
                >
                  <Plant className="w-5 h-5 mr-2" weight="fill" />
                  Start Growing
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
          >
            <Card 
              className="relative p-8 sm:p-10 lg:p-12 h-full border transition-all duration-500 cursor-pointer group overflow-hidden bg-white"
              style={{
                borderColor: 'oklch(0.92 0.01 240)',
                borderRadius: '1.5rem',
                boxShadow: '0 1px 3px oklch(0.15 0.01 240 / 0.06)'
              }}
              onClick={() => handleSelectMode('structured')}
              onTouchStart={() => handleSelectMode('structured')}
              role="button"
              tabIndex={0}
              aria-label="Select Structured Mode - Analytics Dashboard"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectMode('structured')
                }
              }}
            >
              {/* Minimal top accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1" 
                style={{ background: 'oklch(0.45 0.15 250)' }}
              />
              
              <div className="flex flex-col space-y-8 sm:space-y-10">
                {/* Icon - minimal, clean */}
                <div className="relative">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: 'oklch(0.45 0.15 250 / 0.08)'
                    }}
                  >
                    <ChartBar className="w-7 h-7 sm:w-8 sm:h-8" weight="fill" style={{ color: 'oklch(0.35 0.15 250)' }} />
                  </div>
                </div>
                
                {/* Content - refined typography */}
                <div className="space-y-5">
                  <div>
                    <h2 
                      className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3"
                      style={{ 
                        color: 'oklch(0.20 0.01 240)',
                        letterSpacing: '-0.03em',
                        lineHeight: '1.1'
                      }}
                    >
                      Structured Mode
                    </h2>
                    <p 
                      className="text-base sm:text-lg font-medium mb-4"
                      style={{ 
                        color: 'oklch(0.45 0.01 240)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Analytics Dashboard
                    </p>
                    <p 
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ 
                        color: 'oklch(0.50 0.01 240)',
                        lineHeight: '1.7'
                      }}
                    >
                      Track your progress with precision! View detailed charts, data tables, and performance metrics in a clean analytical interface.
                    </p>
                  </div>

                  {/* Features list - refined */}
                  <div className="space-y-3 pt-2">
                    {['Data-focused & analytical', 'Charts, tables & metrics', 'Numbers & statistics'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3" style={{ color: 'oklch(0.50 0.01 240)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'oklch(0.45 0.15 250)' }}></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button - minimal Awwwards style */}
                <Button 
                  size="lg"
                  className="w-full min-h-[52px] text-base font-medium transition-all duration-300 pointer-events-none rounded-xl"
                  style={{
                    background: 'oklch(0.20 0.01 240)',
                    color: 'white',
                    letterSpacing: '-0.01em'
                  }}
                  tabIndex={-1}
                >
                  <TrendUp className="w-5 h-5 mr-2" weight="fill" />
                  View Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-sm mt-12 sm:mt-16 px-4"
          style={{ 
            color: 'oklch(0.55 0.01 240)',
            letterSpacing: '-0.005em'
          }}
        >
          Don't worry — you can switch modes anytime from settings
        </motion.p>
      </motion.div>
    </div>
  )
}
