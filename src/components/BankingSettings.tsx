import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shuffle, 
  Bank, 
  Sparkle, 
  Warning,
  ArrowLeft,
  TrashSimple
} from '@phosphor-icons/react'
import { useBanking } from '@/hooks/use-banking'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BankingSettingsProps {
  onBack: () => void
}

export function BankingSettings({ onBack }: BankingSettingsProps) {
  const { mode, isSimulated, toggleMode, resetSimulator } = useBanking()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleMode = async () => {
    if (!isSimulated) {
      toast.info('Real banking integration coming soon!')
      return
    }
    
    setIsToggling(true)
    try {
      await toggleMode()
      toast.success(isSimulated ? 'Switched to real banking mode' : 'Switched to simulator mode')
    } catch (error) {
      toast.error('Failed to switch modes')
    } finally {
      setIsToggling(false)
    }
  }

  const handleResetSimulator = async () => {
    try {
      await resetSimulator()
      toast.success('Simulator data has been reset with new transactions')
    } catch (error) {
      toast.error('Failed to reset simulator')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2" aria-label="Go back to dashboard" title="Go back to dashboard" data-ux-tooltip="Return to dashboard">
            <ArrowLeft />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Banking Settings</h1>
          <p className="text-muted-foreground">
            Manage your banking connection and data sources
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle />
                Banking Mode
              </CardTitle>
              <CardDescription>
                Choose between simulated practice data or real bank connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border" aria-label="Simulator Mode" title="Simulator Mode" data-ux-tooltip="Practice with simulated data">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSimulated ? 'bg-purple-500/10' : 'bg-muted'
                  }`}>
                    <Sparkle className={`w-6 h-6 ${isSimulated ? 'text-purple-500' : 'text-muted-foreground'}`} weight="fill" />
                  </div>
                  <div>
                    <p className="font-semibold">Simulator Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Practice with fake but realistic data
                    </p>
                  </div>
                </div>
                {isSimulated && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border opacity-60" aria-label="Real Bank Connection" title="Real Bank Connection" data-ux-tooltip="Connect to your real bank account">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    !isSimulated ? 'bg-green-500/10' : 'bg-muted'
                  }`}>
                    <Bank className={`w-6 h-6 ${!isSimulated ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold">Real Banking</p>
                    <p className="text-sm text-muted-foreground">
                      Connect to your actual bank accounts
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleToggleMode} 
                  disabled={isToggling || !isSimulated}
                  className="w-full"
                >
                  {isToggling ? 'Switching...' : isSimulated ? 'Switch to Real Banking' : 'Switch to Simulator'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isSimulated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle />
                  Simulator Controls
                </CardTitle>
                <CardDescription>
                  Manage your practice financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold">How the Simulator Works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Creates a checking account with $500-$2000 starting balance</li>
                    <li>• Generates 5-10 realistic past transactions</li>
                    <li>• Adds new transactions every 1-3 days you use the app</li>
                    <li>• Includes recurring bills (Netflix, Spotify, utilities)</li>
                    <li>• Simulates paycheck deposits every 2 weeks</li>
                    <li>• Tracks spending across categories automatically</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <TrashSimple />
                        Reset Simulator Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Warning className="w-5 h-5 text-destructive" />
                          Reset Simulator?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all your current simulator data and generate a fresh account with new transactions. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetSimulator}>
                          Reset Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p className="text-xs text-muted-foreground text-center">
                    Use this to start fresh with new randomized data
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isSimulated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bank />
                  Real Banking Connection
                </CardTitle>
                <CardDescription>
                  Connect securely to your bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-foreground">
                    Real banking integration via Plaid will be available soon. This will allow you to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Connect to 11,000+ banks and credit unions</li>
                    <li>• Automatically sync transactions</li>
                    <li>• Track spending across multiple accounts</li>
                    <li>• Get personalized financial insights</li>
                    <li>• Bank-level security and encryption</li>
                  </ul>
                </div>

                <Button className="w-full" disabled>
                  Connect Bank Account (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
