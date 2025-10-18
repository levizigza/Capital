import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Eye, Headphones, BookOpen, Hand, Sparkle } from '@phosphor-icons/react'
import { getDominantLearningStyle, getLearningStyleDescription, type VARKProfile } from '@/data/vark-questions'
import { motion } from 'framer-motion'

interface VARKResultsProps {
  profile: VARKProfile
  onContinue: () => void
}

export function VARKResults({ profile, onContinue }: VARKResultsProps) {
  const dominant = getDominantLearningStyle(profile)
  const description = getLearningStyleDescription(dominant)

  const styles = [
    { key: 'visual', label: 'Visual', icon: Eye, color: 'blue', value: profile.visual },
    { key: 'aural', label: 'Aural', icon: Headphones, color: 'green', value: profile.aural },
    { key: 'readwrite', label: 'Read/Write', icon: BookOpen, color: 'purple', value: profile.readwrite },
    { key: 'kinesthetic', label: 'Kinesthetic', icon: Hand, color: 'orange', value: profile.kinesthetic }
  ]

  const getDominantColor = () => {
    if (dominant === 'multimodal') return 'indigo'
    const style = styles.find(s => s.key === dominant)
    return style?.color || 'blue'
  }

  const dominantColor = getDominantColor()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center mb-4"
            >
              <div className={`p-4 rounded-full bg-${dominantColor}-100`}>
                <Sparkle className={`w-12 h-12 text-${dominantColor}-600`} weight="fill" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl mb-2">Your Learning Profile</CardTitle>
            <p className="text-slate-600">
              Here's how you learn best based on your responses
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Dominant Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-6 rounded-lg bg-gradient-to-br from-${dominantColor}-50 to-${dominantColor}-100 border-2 border-${dominantColor}-200`}
            >
              <div className="flex items-center gap-3 mb-3">
                {dominant === 'visual' && <Eye className="w-6 h-6 text-blue-600" weight="fill" />}
                {dominant === 'aural' && <Headphones className="w-6 h-6 text-green-600" weight="fill" />}
                {dominant === 'readwrite' && <BookOpen className="w-6 h-6 text-purple-600" weight="fill" />}
                {dominant === 'kinesthetic' && <Hand className="w-6 h-6 text-orange-600" weight="fill" />}
                {dominant === 'multimodal' && <Sparkle className="w-6 h-6 text-indigo-600" weight="fill" />}
                <h3 className="text-xl font-bold capitalize">
                  {dominant === 'multimodal' ? 'Multimodal Learner' : `${dominant} Learner`}
                </h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800">Your Learning Style Breakdown:</h4>
              {styles.map((style, index) => (
                <motion.div
                  key={style.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <style.icon className={`w-5 h-5 text-${style.color}-500`} />
                      <span className="font-medium text-slate-700">{style.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {Math.round(style.value * 100)}%
                    </span>
                  </div>
                  <Progress value={style.value * 100} className="h-2" />
                </motion.div>
              ))}
            </div>

            {/* What This Means */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h4 className="font-semibold text-blue-900 mb-2">✨ What this means for you:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                {profile.visual > 0.35 && (
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Games will show more charts, infographics, and color-coded visuals</span>
                  </li>
                )}
                {profile.aural > 0.35 && (
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You'll get audio feedback and voice-over explanations</span>
                  </li>
                )}
                {profile.readwrite > 0.35 && (
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Detailed text guides and bullet-point summaries will be prioritized</span>
                  </li>
                )}
                {profile.kinesthetic > 0.35 && (
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Interactive mini-games and hands-on activities will be emphasized</span>
                  </li>
                )}
                {dominant === 'multimodal' && (
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You'll get a balanced mix of all content types for flexible learning</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You can always change these preferences in Settings</span>
                </li>
              </ul>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button 
                onClick={onContinue}
                className="w-full h-12 text-lg"
                size="lg"
              >
                Continue to Games
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
