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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full"
      >
        <div className="text-center mb-8 sm:mb-12 px-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 sm:mb-6 shadow-2xl"
          >
            <Sparkle className="w-8 h-8 sm:w-10 sm:h-10 text-white" weight="fill" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight px-2"
          >
            FinanceQuest Pro
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Choose your learning adventure: grow a financial garden or master the data dashboard
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="w-full"
          >
            <Card 
              className="p-4 sm:p-6 md:p-8 h-full border-2 border-green-200/50 hover:border-green-400/50 transition-all duration-300 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm cursor-pointer group shadow-xl hover:shadow-2xl"
              onClick={() => handleSelectMode('creative')}
              onTouchStart={() => handleSelectMode('creative')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectMode('creative')
                }
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                  <Plant className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" weight="fill" />
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 mb-2 sm:mb-3">
                    Creative Mode
                  </h2>
                  <p className="text-base sm:text-lg text-green-700 font-medium mb-1 sm:mb-2">
                    Finance Garden
                  </p>
                  <p className="text-sm sm:text-base text-green-600 leading-relaxed">
                    Watch your financial health bloom! Grow plants, unlock garden areas, and see your progress flourish in a beautiful living ecosystem.
                  </p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 sm:gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Visual & narrative-driven</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Growing plants & ecosystems</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Metaphors & storytelling</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base sm:text-lg py-3 sm:py-6 shadow-lg hover:shadow-xl transition-all pointer-events-none"
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
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="w-full"
          >
            <Card 
              className="p-4 sm:p-6 md:p-8 h-full border-2 border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm cursor-pointer group shadow-xl hover:shadow-2xl"
              onClick={() => handleSelectMode('structured')}
              onTouchStart={() => handleSelectMode('structured')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectMode('structured')
                }
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                  <ChartBar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" weight="fill" />
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Structured Mode
                  </h2>
                  <p className="text-base sm:text-lg text-blue-700 font-medium mb-1 sm:mb-2">
                    Analytics Dashboard
                  </p>
                  <p className="text-sm sm:text-base text-blue-600 leading-relaxed">
                    Track your progress with precision! View detailed charts, data tables, and performance metrics in a clean analytical interface.
                  </p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 sm:gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Data-focused & analytical</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Charts, tables & metrics</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-left">Numbers & statistics</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-base sm:text-lg py-3 sm:py-6 shadow-lg hover:shadow-xl transition-all pointer-events-none"
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
