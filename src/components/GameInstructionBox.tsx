import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Lightbulb, GameController, Target, Star, ArrowRight } from '@phosphor-icons/react'

export interface GameInstruction {
  title: string
  emoji: string
  objective: string
  howToPlay: string[]
  tips: string[]
  controls?: { key: string; action: string }[]
  scoring?: { action: string; points: string }[]
}

interface GameInstructionBoxProps {
  instruction: GameInstruction
  onStart: () => void
  /** Return to world map without starting (professional game flow: clear exit). */
  onBackToMap?: () => void
  onClose?: () => void
  showAlways?: boolean
}

export default function GameInstructionBox({
  instruction,
  onStart,
  onBackToMap,
  onClose,
  showAlways = false
}: GameInstructionBoxProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (isMinimized && !showAlways) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed top-4 right-4 z-50 retro-btn retro-btn-yellow"
      >
        <Lightbulb size={20} className="mr-2" /> How to Play
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`${showAlways ? '' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`retro-card ${showAlways ? 'w-full' : 'retro-card--scrollable max-w-2xl w-full max-h-[90vh]'}`}
      >
        {/* Header */}
        <div className="retro-card-header bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{instruction.emoji}</span>
            <span>{instruction.title}</span>
          </div>
          {!showAlways && onClose && (
            <button 
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Minimize instructions"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="retro-card-body space-y-6">
          {/* Objective - Most Important! */}
          <div className="retro-instruction-box">
            <div className="retro-instruction-title flex items-center gap-2">
              <Target size={20} weight="fill" />
              YOUR MISSION
            </div>
            <p className="retro-instruction-text text-lg font-medium">
              {instruction.objective}
            </p>
          </div>

          {/* How to Play */}
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-purple-600">
              <GameController size={24} weight="fill" />
              How to Play
            </h3>
            <ol className="space-y-2 list-none pl-0">
              {instruction.howToPlay.map((step, index) => (
                <li key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 bg-purple-50 p-3 rounded-xl"
                  >
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>

          {/* Controls */}
          {instruction.controls && instruction.controls.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-blue-600">
                🎮 Controls
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {instruction.controls.map((control, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl"
                  >
                    <kbd className="px-3 py-1 bg-gray-800 text-white rounded-lg font-mono text-sm">
                      {control.key}
                    </kbd>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="text-gray-700">{control.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scoring */}
          {instruction.scoring && instruction.scoring.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-600">
                <Star size={24} weight="fill" />
                Scoring
              </h3>
              <div className="bg-green-50 rounded-xl p-4">
                <table className="w-full">
                  <tbody>
                    {instruction.scoring.map((score, index) => (
                      <tr key={index} className="border-b border-green-200 last:border-0">
                        <td className="py-2 text-gray-700">{score.action}</td>
                        <td className="py-2 text-right font-bold text-green-600">{score.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips */}
          {instruction.tips.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-yellow-600">
                💡 Pro Tips
              </h3>
              <ul className="space-y-2">
                {instruction.tips.map((tip, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-gray-600"
                  >
                    <span className="text-yellow-500">★</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions — primary + optional back (game-style navigation) */}
          {!showAlways && (
            <div className="flex flex-col sm:flex-row gap-3">
              {onBackToMap && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBackToMap}
                  className="w-full sm:w-auto sm:min-w-[10rem] retro-btn retro-btn-yellow py-3 text-base"
                >
                  ← Back to map
                </motion.button>
              )}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="flex-1 retro-btn retro-btn-green text-xl py-4"
              >
                🚀 LET&apos;S PLAY!
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

