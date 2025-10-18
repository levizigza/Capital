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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"
        aria-hidden="true"
      />
      
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, oklch(0.55 0.20 280 / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, oklch(0.68 0.16 200 / 0.1) 0%, transparent 50%)`
        }}
        aria-hidden="true"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-6xl w-full relative z-10"
      >
        <div className="text-center mb-8 sm:mb-12 px-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-accent mb-4 sm:mb-6 shadow-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-accent-light rounded-2xl sm:rounded-3xl animate-pulse opacity-75" />
            <Sparkle className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" weight="fill" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight px-2"
            style={{ letterSpacing: '-0.03em' }}
          >
            FinanceQuest Pro
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed px-4"
          >
            Choose your learning adventure: grow a financial garden or master the data dashboard
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
          >
            <Card 
              className="relative p-4 sm:p-6 md:p-8 h-full border-2 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl overflow-hidden"
              style={{
                borderColor: 'oklch(0.55 0.18 145 / 0.3)',
                background: 'linear-gradient(135deg, oklch(0.55 0.18 145 / 0.05) 0%, oklch(0.58 0.18 145 / 0.02) 100%)'
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-success-light to-success rounded-t-xl" />
              
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-success to-success-dark opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all flex-shrink-0 group-hover:scale-110 duration-300">
                    <Plant className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" weight="fill" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3" style={{ color: 'oklch(0.35 0.18 145)' }}>
                    Creative Mode
                  </h2>
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2" style={{ color: 'oklch(0.40 0.16 145)' }}>
                    Finance Garden
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'oklch(0.45 0.14 145)' }}>
                    Watch your financial health bloom! Grow plants, unlock garden areas, and see your progress flourish in a beautiful living ecosystem.
                  </p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.40 0.16 145)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.55 0.18 145)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Visual & narrative-driven</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.40 0.16 145)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.55 0.18 145)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Growing plants & ecosystems</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.40 0.16 145)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.55 0.18 145)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Metaphors & storytelling</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full min-h-[44px] text-base sm:text-lg py-3 sm:py-6 shadow-lg hover:shadow-xl transition-all pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.55 0.18 145) 0%, oklch(0.50 0.20 145) 100%)',
                    color: 'oklch(0.98 0.005 145)'
                  }}
                  tabIndex={-1}
                >
                  <Plant className="w-4 h-4 sm:w-5 sm:h-5 mr-2" weight="fill" />
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
              className="relative p-4 sm:p-6 md:p-8 h-full border-2 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl overflow-hidden"
              style={{
                borderColor: 'oklch(0.45 0.15 250 / 0.3)',
                background: 'linear-gradient(135deg, oklch(0.45 0.15 250 / 0.05) 0%, oklch(0.50 0.16 250 / 0.02) 100%)'
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-info via-info-light to-info rounded-t-xl" />
              
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-info to-info-dark opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-info to-info-dark flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all flex-shrink-0 group-hover:scale-110 duration-300">
                    <ChartBar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" weight="fill" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3" style={{ color: 'oklch(0.30 0.15 250)' }}>
                    Structured Mode
                  </h2>
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2" style={{ color: 'oklch(0.38 0.14 250)' }}>
                    Analytics Dashboard
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'oklch(0.42 0.12 250)' }}>
                    Track your progress with precision! View detailed charts, data tables, and performance metrics in a clean analytical interface.
                  </p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.38 0.14 250)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.45 0.15 250)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Data-focused & analytical</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.38 0.14 250)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.45 0.15 250)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Charts, tables & metrics</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: 'oklch(0.38 0.14 250)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'oklch(0.45 0.15 250)' }}></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Numbers & statistics</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full min-h-[44px] text-base sm:text-lg py-3 sm:py-6 shadow-lg hover:shadow-xl transition-all pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.45 0.15 250) 0%, oklch(0.40 0.17 250) 100%)',
                    color: 'oklch(0.98 0.005 250)'
                  }}
                  tabIndex={-1}
                >
                  <TrendUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" weight="fill" />
                  View Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8 px-4"
        >
          Don't worry — you can switch modes anytime from settings
        </motion.p>
      </motion.div>
    </div>
  )
}
