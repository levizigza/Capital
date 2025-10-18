import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Eye, Headphones, BookOpen, Hand, ArrowCounterClockwise, Check } from '@phosphor-icons/react'
import { getDominantLearningStyle, getLearningStyleDescription, type VARKProfile } from '@/data/vark-questions'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface VARKSettingsProps {
  currentProfile: VARKProfile
  onSave: (profile: VARKProfile) => void
  onRetake: () => void
  onClose?: () => void
}

export function VARKSettings({ currentProfile, onSave, onRetake, onClose }: VARKSettingsProps) {
  const [profile, setProfile] = useState<VARKProfile>(currentProfile)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSliderChange = (dimension: keyof VARKProfile, value: number[]) => {
    const newValue = value[0] / 100
    setProfile(prev => ({ ...prev, [dimension]: newValue }))
    setHasChanges(true)
  }

  const handleNormalize = () => {
    const total = profile.visual + profile.aural + profile.readwrite + profile.kinesthetic
    if (total === 0) {
      toast.error('At least one dimension must be greater than zero')
      return
    }
    
    const normalized: VARKProfile = {
      visual: profile.visual / total,
      aural: profile.aural / total,
      readwrite: profile.readwrite / total,
      kinesthetic: profile.kinesthetic / total
    }
    
    setProfile(normalized)
    toast.success('Profile normalized to 100%')
  }

  const handleSave = () => {
    const total = profile.visual + profile.aural + profile.readwrite + profile.kinesthetic
    if (Math.abs(total - 1.0) > 0.01) {
      toast.error('Please normalize your profile first (should total 100%)')
      return
    }
    
    onSave(profile)
    setHasChanges(false)
    toast.success('Learning style updated successfully!')
  }

  const handleReset = () => {
    setProfile(currentProfile)
    setHasChanges(false)
    toast.info('Changes discarded')
  }

  const dominant = getDominantLearningStyle(profile)
  const description = getLearningStyleDescription(dominant)
  const total = (profile.visual + profile.aural + profile.readwrite + profile.kinesthetic) * 100

  const dimensions = [
    { 
      key: 'visual' as keyof VARKProfile, 
      label: 'Visual', 
      icon: Eye, 
      color: 'blue',
      description: 'Learns through charts, diagrams, and visual representations'
    },
    { 
      key: 'aural' as keyof VARKProfile, 
      label: 'Aural', 
      icon: Headphones, 
      color: 'green',
      description: 'Learns through listening and verbal discussions'
    },
    { 
      key: 'readwrite' as keyof VARKProfile, 
      label: 'Read/Write', 
      icon: BookOpen, 
      color: 'purple',
      description: 'Learns through reading and writing notes'
    },
    { 
      key: 'kinesthetic' as keyof VARKProfile, 
      label: 'Kinesthetic', 
      icon: Hand, 
      color: 'orange',
      description: 'Learns through hands-on practice and movement'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Style Profile</CardTitle>
          <CardDescription>
            Adjust your VARK learning style preferences to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Profile Summary */}
          <div className="p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 capitalize mb-1">
                  {dominant === 'multimodal' ? 'Multimodal Learner' : `${dominant} Learner`}
                </h3>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            </div>
            
            {/* Total Percentage */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium">Total:</span>
              <span className={`text-sm font-bold ${Math.abs(total - 100) < 1 ? 'text-green-600' : 'text-orange-600'}`}>
                {total.toFixed(1)}%
              </span>
            </div>
            {Math.abs(total - 100) > 1 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Profile should total 100%. Click "Normalize Profile" below.
              </p>
            )}
          </div>

          {/* Dimension Sliders */}
          <div className="space-y-6">
            {dimensions.map((dim, index) => (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <dim.icon className={`w-5 h-5 text-${dim.color}-500`} />
                    <span className="font-medium text-slate-800">{dim.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {Math.round(profile[dim.key] * 100)}%
                  </span>
                </div>
                <Slider
                  value={[profile[dim.key] * 100]}
                  onValueChange={(value) => handleSliderChange(dim.key, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">{dim.description}</p>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Visual Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-700">Visual Breakdown</h4>
            <div className="space-y-2">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600">{dim.label}</div>
                  <Progress value={profile[dim.key] * 100} className="flex-1 h-2" />
                  <div className="w-12 text-right text-sm font-medium text-slate-700">
                    {Math.round(profile[dim.key] * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleNormalize}
              disabled={Math.abs(total - 100) < 1}
            >
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Normalize Profile
            </Button>
            
            <Button
              variant="outline"
              onClick={onRetake}
            >
              Retake Assessment
            </Button>
            
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Discard Changes
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={Math.abs(total - 100) > 1}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
            
            {onClose && !hasChanges && (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </div>

          {/* Educational Note */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 How This Helps</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Games will prioritize your preferred learning modalities</li>
              <li>• Content presentation adapts to how you learn best</li>
              <li>• You can still access all content types manually</li>
              <li>• Higher scores mean more emphasis on that style</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
