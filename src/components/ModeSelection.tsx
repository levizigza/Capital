import { motion } from 'framer-motion'
import { Plant, ChartBar, TrendUp } from '@phosphor-icons/react'
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
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-x-hidden relative bg-white">
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 ms-gradient-overlay"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center mb-6 sm:mb-8"
          >
            <h1 className="capital-logo text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="capital-logo-coin"><span>$</span></span>
              Capital
            </h1>
            <p className="capital-logo-tagline text-sm sm:text-base md:text-lg mt-2">
              Master Your Money
            </p>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ms-subtitle"
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
              className="relative p-8 sm:p-10 lg:p-12 h-full border transition-all duration-500 cursor-pointer group overflow-hidden bg-white ms-card"
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
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1 ms-accent-creative"
              />
              
              <div className="flex flex-col space-y-8 sm:space-y-10">
                {/* Icon - minimal, clean */}
                <div className="relative">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 ms-icon-bg-creative"
                  >
                    <Plant className="w-7 h-7 sm:w-8 sm:h-8 ms-icon-creative" weight="fill" />
                  </div>
                </div>
                
                {/* Content - refined typography */}
                <div className="space-y-5">
                  <div>
                    <h2 
                      className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 ms-card-title"
                    >
                      Creative Mode
                    </h2>
                    <p 
                      className="text-base sm:text-lg font-medium mb-4 ms-card-label"
                    >
                      Finance Garden
                    </p>
                    <p 
                      className="text-sm sm:text-base leading-relaxed ms-card-desc"
                    >
                      Watch your financial health bloom! Grow plants, unlock garden areas, and see your progress flourish in a beautiful living ecosystem.
                    </p>
                  </div>

                  {/* Features list - refined */}
                  <div className="space-y-3 pt-2">
                    {['Visual & narrative-driven', 'Growing plants & ecosystems', 'Metaphors & storytelling'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 ms-feature-text">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 ms-dot-creative"></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button - minimal Awwwards style */}
                <Button 
                  size="lg"
                  className="w-full min-h-[52px] text-base font-medium transition-all duration-300 pointer-events-none rounded-xl ms-card-btn"
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
              className="relative p-8 sm:p-10 lg:p-12 h-full border transition-all duration-500 cursor-pointer group overflow-hidden bg-white ms-card"
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
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1 ms-accent-structured"
              />
              
              <div className="flex flex-col space-y-8 sm:space-y-10">
                {/* Icon - minimal, clean */}
                <div className="relative">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 ms-icon-bg-structured"
                  >
                    <ChartBar className="w-7 h-7 sm:w-8 sm:h-8 ms-icon-structured" weight="fill" />
                  </div>
                </div>
                
                {/* Content - refined typography */}
                <div className="space-y-5">
                  <div>
                    <h2 
                      className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 ms-card-title"
                    >
                      Structured Mode
                    </h2>
                    <p 
                      className="text-base sm:text-lg font-medium mb-4 ms-card-label"
                    >
                      Analytics Dashboard
                    </p>
                    <p 
                      className="text-sm sm:text-base leading-relaxed ms-card-desc"
                    >
                      Track your progress with precision! View detailed charts, data tables, and performance metrics in a clean analytical interface.
                    </p>
                  </div>

                  {/* Features list - refined */}
                  <div className="space-y-3 pt-2">
                    {['Data-focused & analytical', 'Charts, tables & metrics', 'Numbers & statistics'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 ms-feature-text">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 ms-dot-structured"></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button - minimal Awwwards style */}
                <Button 
                  size="lg"
                  className="w-full min-h-[52px] text-base font-medium transition-all duration-300 pointer-events-none rounded-xl ms-card-btn"
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
          className="text-center text-sm mt-12 sm:mt-16 px-4 ms-footer"
        >
          Don't worry — you can switch modes anytime from settings
        </motion.p>
      </motion.div>
    </div>
  )
}
