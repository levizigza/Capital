import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Envelope, Clock, CheckCircle, ArrowRight } from '@phosphor-icons/react'

interface ParentConsentPendingProps {
  parentEmail: string
  onResendRequest: () => void
  onChangeEmail: () => void
}

export function ParentConsentPending({ 
  parentEmail, 
  onResendRequest,
  onChangeEmail 
}: ParentConsentPendingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto"
            >
              <Envelope className="w-10 h-10 text-primary" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold mb-2">Parent Permission Required</h1>
              <p className="text-lg text-muted-foreground">
                We've sent a consent request to your parent or guardian
              </p>
            </div>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Waiting for approval from:</p>
              <p className="text-sm">{parentEmail}</p>
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Why do we need parent permission?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Canadian privacy laws require us to get permission from a parent or guardian before 
                  collecting information from anyone under 13 years old. This is to keep you safe online!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg mt-1">
                <Envelope className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">What happens next?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your parent will receive an email explaining what FinanceQuest Pro is, what data we collect, 
                  and how we protect it. They can approve or decline, and they can withdraw permission anytime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg mt-1">
                <ArrowRight className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">What's included in the email?</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• What FinanceQuest Pro teaches</li>
                  <li>• What information we collect (very little!)</li>
                  <li>• How we protect their child's data</li>
                  <li>• A simple approve/decline button</li>
                  <li>• How to withdraw consent anytime</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onResendRequest}
              >
                <Envelope className="w-4 h-4 mr-2" />
                Resend Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onChangeEmail}
              >
                Change Email Address
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Make sure to ask your parent to check their spam folder if they don't see the email!
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
