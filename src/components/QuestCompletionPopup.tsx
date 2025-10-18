import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Trophy, Sparkle, X } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface QuestCompletionPopupProps {
  isVisible: boolean
  questName: string
  financeXP: number
  lineXP: number
  onClose: () => void
}

export function QuestCompletionPopup({
  isVisible,
  questName,
  financeXP,
  lineXP,
  onClose
}: QuestCompletionPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 40
            }}
            className="pointer-events-auto"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-2xl max-w-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 500,
                        damping: 15
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" weight="fill" />
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Quest Complete!</h3>
                      <p className="text-sm text-green-700">{questName}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 px-3 py-1.5">
                      <Trophy className="w-4 h-4 mr-1" weight="fill" />
                      +{financeXP} Finance XP
                    </Badge>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 px-3 py-1.5">
                      <Sparkle className="w-4 h-4 mr-1" weight="fill" />
                      +{lineXP} Line XP
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
