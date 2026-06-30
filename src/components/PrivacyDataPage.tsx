import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Lock, 
  Eye, 
  UserCircle, 
  ClockCounterClockwise, 
  Warning,
  ArrowLeft
} from '@phosphor-icons/react'
import { PIPEDAComplianceService } from '@/lib/pipeda-compliance'

interface PrivacyDataPageProps {
  onBack: () => void
}

export function PrivacyDataPage({ onBack }: PrivacyDataPageProps) {
  const policyContent = PIPEDAComplianceService.getPrivacyPolicyContent()

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'What We Collect & Why': Eye,
    'How We Protect Your Information': Lock,
    'Your Rights & Control': UserCircle,
    'Who Can See Your Data': Shield,
    'Data Retention & Deletion': ClockCounterClockwise,
    'If Something Goes Wrong': Warning
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{policyContent.title}</h1>
                <p className="text-muted-foreground mt-1">
                  Understanding how we protect and respect your information
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm leading-relaxed">
                <strong>Easy to understand:</strong> This policy is written in plain language (Grade 6 reading level) 
                so everyone can understand their privacy rights. Capital follows Canadian PIPEDA laws to 
                protect your personal information.
              </p>
            </div>

            <Separator className="my-6" />

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {policyContent.sections.map((section, index) => {
                  const Icon = iconMap[section.heading] || Shield

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <h2 className="text-xl font-semibold">{section.heading}</h2>
                      </div>

                      <div className="ml-10 space-y-3">
                        {section.content.map((paragraph, pIndex) => {
                          if (paragraph === '') {
                            return <div key={pIndex} className="h-2" />
                          }

                          if (paragraph.startsWith('•')) {
                            return (
                              <div key={pIndex} className="flex gap-3 text-base leading-relaxed">
                                <span className="text-primary mt-1">•</span>
                                <span>{paragraph.substring(2)}</span>
                              </div>
                            )
                          }

                          if (paragraph.startsWith('  -')) {
                            return (
                              <div key={pIndex} className="flex gap-3 text-sm leading-relaxed ml-6 text-muted-foreground">
                                <span className="text-primary mt-1">-</span>
                                <span>{paragraph.substring(4)}</span>
                              </div>
                            )
                          }

                          return (
                            <p key={pIndex} className="text-base leading-relaxed">
                              {paragraph}
                            </p>
                          )
                        })}
                      </div>

                      {index < policyContent.sections.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>

            <Separator className="my-6" />

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Privacy Matters
              </h3>
              <p className="text-sm leading-relaxed">
                This privacy policy was last updated on <strong>January 2024</strong>. We review and update it 
                regularly to ensure it reflects our current practices and complies with Canadian privacy laws.
              </p>
              <p className="text-sm leading-relaxed">
                If you have questions or concerns about your privacy, you can:
              </p>
              <ul className="text-sm space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Contact us through GitHub</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Request a copy of all your data from Settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>File a complaint with the Privacy Commissioner of Canada at priv.gc.ca</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={onBack}
                size="lg"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
