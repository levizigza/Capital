import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Eye, Envelope, CheckCircle } from '@phosphor-icons/react'
import type { ConsentSettings } from '@/lib/pipeda-compliance'
import { PIPEDAComplianceService } from '@/lib/pipeda-compliance'

interface ConsentDialogProps {
  ageRange: 'under-13' | '13-17' | '18-plus'
  onComplete: (consent: ConsentSettings, parentEmail?: string) => void
  onSkip?: () => void
}

export function ConsentDialog({ ageRange, onComplete, onSkip }: ConsentDialogProps) {
  const [storeGameProgress, setStoreGameProgress] = useState(false)
  const [shareAnonymousUsage, setShareAnonymousUsage] = useState(false)
  const [receiveEducationalTips, setReceiveEducationalTips] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [currentSection, setCurrentSection] = useState(0)

  const requiresParentConsent = PIPEDAComplianceService.requiresParentalConsent(ageRange)

  const sections = [
    {
      title: 'Welcome to FinanceQuest Pro! 🎮',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-base leading-relaxed">
            Before you start your financial learning adventure, we need to talk about your privacy and data.
          </p>
          <p className="text-base leading-relaxed">
            We only collect information that helps you learn better. You're always in control of your data.
          </p>
          <Alert className="bg-primary/5 border-primary/20">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This explanation is written in simple language (Grade 6 reading level) so everyone can understand their rights.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'What We Collect (Very Little!) 📊',
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p className="text-base leading-relaxed font-medium">We only collect:</p>
          <ul className="space-y-2 text-base ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Your username (from GitHub)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Your age range (not exact birthday)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Your game scores (if you choose to save them)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>How you like to learn (visual, reading, etc.)</span>
            </li>
          </ul>
          <Alert className="bg-destructive/5 border-destructive/20">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">We DO NOT collect:</p>
              <p className="text-sm">Your full name, address, phone number, social insurance number, or any real money information.</p>
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'How We Protect Your Data 🔒',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-base leading-relaxed">
            We use military-grade encryption (AES-256) to protect your information. That means:
          </p>
          <ul className="space-y-2 text-base ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Your email (if you provide one) is scrambled so no one can read it</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Your learning preferences are encrypted</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>All data stays on your device - it's not sent to other servers</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>We never share or sell your information to anyone</span>
            </li>
          </ul>
          <Alert className="bg-primary/5 border-primary/20">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This app is for learning only. No real money is involved!
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'Your Choices 🎯',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <p className="text-base leading-relaxed">
            You get to decide what we can do with your data. Check the boxes for what you're comfortable with:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
              <Checkbox 
                id="progress"
                checked={storeGameProgress}
                onCheckedChange={(checked) => setStoreGameProgress(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="progress" className="text-base font-medium cursor-pointer">
                  Save my game progress and scores
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Without this, you'll start from the beginning each time you visit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
              <Checkbox 
                id="analytics"
                checked={shareAnonymousUsage}
                onCheckedChange={(checked) => setShareAnonymousUsage(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-medium cursor-pointer">
                  Share anonymous usage data to help improve the app
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll know "100 people played today" but not who you are. This helps us make the app better.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
              <Checkbox 
                id="tips"
                checked={receiveEducationalTips}
                onCheckedChange={(checked) => setReceiveEducationalTips(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="tips" className="text-base font-medium cursor-pointer">
                  Receive helpful financial learning tips (optional)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get occasional tips and encouragement to help you learn.
                </p>
              </div>
            </div>
          </div>

          <Alert className="bg-accent/5 border-accent/20">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You can change these choices anytime in Settings, and you can delete all your data whenever you want!
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ]

  if (requiresParentConsent) {
    sections.push({
      title: 'Parent Permission Required 👪',
      icon: Envelope,
      content: (
        <div className="space-y-4">
          <p className="text-base leading-relaxed">
            Because you're under 13, we need a parent or guardian's permission before you can use FinanceQuest Pro.
          </p>
          <p className="text-base leading-relaxed">
            This is required by law to protect children's privacy.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="parent-email" className="text-base">
              Parent or Guardian's Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="parent-email"
              type="email"
              placeholder="parent@example.com"
              value={parentEmail}
              onChange={(e) => {
                setParentEmail(e.target.value)
                setEmailError('')
              }}
              className={emailError ? 'border-destructive' : ''}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              We'll send them an email asking for permission. You can start playing once they approve.
            </p>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <Envelope className="h-4 w-4" />
            <AlertDescription>
              The email will explain what data we collect and how we protect it. Your parent can approve or decline.
            </AlertDescription>
          </Alert>
        </div>
      )
    })
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleComplete = () => {
    if (requiresParentConsent) {
      if (!parentEmail || !parentEmail.includes('@')) {
        setEmailError('Please enter a valid email address')
        return
      }
    }

    const consent: ConsentSettings = {
      storeGameProgress,
      shareAnonymousUsage,
      receiveEducationalTips,
      consentDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }

    onComplete(consent, requiresParentConsent ? parentEmail : undefined)
  }

  const currentSectionData = sections[currentSection]
  const Icon = currentSectionData.icon
  const isLastSection = currentSection === sections.length - 1

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{currentSectionData.title}</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentSection + 1} of {sections.length}
              </div>
            </div>
            
            <div className="flex gap-2">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index <= currentSection ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            {currentSectionData.content}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {currentSection > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {onSkip && currentSection === 0 && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              )}
            </div>

            {isLastSection ? (
              <Button
                onClick={handleComplete}
                size="lg"
                className="min-w-[140px]"
              >
                {requiresParentConsent ? 'Send Parent Request' : 'Start Learning'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
