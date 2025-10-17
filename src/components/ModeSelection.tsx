import { motion } from 'framer-motion'
import { Plant, ChartBar, Sparkle, TrendUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { LearningMode } from '@/App'

interface ModeSelectionProps {
  onSelectMode: (mode: LearningMode) => void
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-2xl"
          >
            <Sparkle className="w-10 h-10 text-white" weight="fill" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent"
          >
            FinanceQuest Pro
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Choose your learning adventure: grow a financial garden or master the data dashboard
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-8 h-full border-2 border-green-200/50 hover:border-green-400/50 transition-all duration-300 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm cursor-pointer group shadow-xl hover:shadow-2xl"
              onClick={() => onSelectMode('creative')}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Plant className="w-12 h-12 text-white" weight="fill" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-green-900 mb-3">
                    Creative Mode
                  </h2>
                  <p className="text-lg text-green-700 font-medium mb-2">
                    Finance Garden
                  </p>
                  <p className="text-green-600 leading-relaxed">
                    Watch your financial health bloom! Grow plants, unlock garden areas, and see your progress flourish in a beautiful living ecosystem.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Visual & narrative-driven</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Growing plants & ecosystems</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Metaphors & storytelling</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all"
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
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-8 h-full border-2 border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm cursor-pointer group shadow-xl hover:shadow-2xl"
              onClick={() => onSelectMode('structured')}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <ChartBar className="w-12 h-12 text-white" weight="fill" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-blue-900 mb-3">
                    Structured Mode
                  </h2>
                  <p className="text-lg text-blue-700 font-medium mb-2">
                    Analytics Dashboard
                  </p>
                  <p className="text-blue-600 leading-relaxed">
                    Track your progress with precision! View detailed charts, data tables, and performance metrics in a clean analytical interface.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Data-focused & analytical</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Charts, tables & metrics</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Numbers & statistics</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all"
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
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          Don't worry — you can switch modes anytime from settings
        </motion.p>
      </motion.div>
    </div>
  )
}
