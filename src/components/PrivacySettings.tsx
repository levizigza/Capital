import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  Warning,
  Trash,
  FileArrowDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@/hooks/use-safe-kv'
import type { ConsentSettings, UserPrivacyData } from '@/lib/pipeda-compliance'
import { PIPEDAComplianceService } from '@/lib/pipeda-compliance'

interface PrivacySettingsProps {
  userId: string
  onViewPrivacyPolicy: () => void
}

export function PrivacySettings({ userId, onViewPrivacyPolicy }: PrivacySettingsProps) {
  const [consent, setConsent] = useKV<ConsentSettings>('consent-settings', PIPEDAComplianceService.createDefaultConsent())
  const [privacyData, setPrivacyData] = useKV<UserPrivacyData | null>('privacy-data', null)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const dataMinimization = PIPEDAComplianceService.getDataMinimizationInfo()

  useEffect(() => {
    if (privacyData && privacyData.dataRetention?.lastActive) {
      const status = PIPEDAComplianceService.checkInactivityStatus(privacyData.dataRetention.lastActive)
      
      if (status.needsWarning && !privacyData.dataRetention.inactivityWarningDate) {
        setPrivacyData(prev => ({
          ...prev!,
          dataRetention: {
            ...prev!.dataRetention,
            inactivityWarningDate: new Date().toISOString()
          }
        }))
      }
    }
  }, [privacyData])

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean) => {
    if (!consent) return

    setConsent({
      ...consent,
      [key]: value,
      lastUpdated: new Date().toISOString()
    })

    toast.success('Consent preferences updated')
  }

  const handleWithdrawConsent = async () => {
    if (!privacyData) return

    const scheduledData = PIPEDAComplianceService.scheduleDataDeletion(privacyData)
    setPrivacyData(scheduledData)

    toast.warning('Consent withdrawn. Your data will be deleted within 24 hours.', {
      description: 'You can cancel this by clicking "Cancel Data Deletion" below.'
    })

    setShowWithdrawDialog(false)
  }

  const handleCancelDeletion = () => {
    if (!privacyData) return

    const updatedData = PIPEDAComplianceService.cancelDataDeletion(privacyData)
    setPrivacyData(updatedData)

    toast.success('Data deletion cancelled. Your account remains active.')
  }

  const handleDeleteAllData = async () => {
    setIsDeleting(true)

    try {
      await PIPEDAComplianceService.deleteUserData(userId)
      
      toast.success('All data deleted successfully', {
        description: 'Reloading application...'
      })

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast.error('Failed to delete data', {
        description: 'Please try again or contact support.'
      })
      setIsDeleting(false)
    }
  }

  const handleExportData = async () => {
    try {
      const allKeys = await window.spark.kv.keys()
      const exportData: Record<string, any> = {}

      for (const key of allKeys) {
        const value = await window.spark.kv.get(key)
        exportData[key] = value
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financequest-data-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const inactivityStatus = privacyData?.dataRetention?.lastActive 
    ? PIPEDAComplianceService.checkInactivityStatus(privacyData.dataRetention.lastActive)
    : null

  const hasScheduledDeletion = !!privacyData?.dataRetention?.scheduledDeletion

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Privacy & Data Protection</h2>
          <p className="text-sm text-muted-foreground">
            Manage your privacy preferences and data
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Your Consent Preferences
          </h3>
          
          {consent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="progress-consent">Store my game progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Save your scores, levels, and achievements
                  </p>
                </div>
                <Switch
                  id="progress-consent"
                  checked={consent.storeGameProgress}
                  onCheckedChange={(checked) => handleConsentChange('storeGameProgress', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics-consent">Share anonymous usage data</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app (no personal information shared)
                  </p>
                </div>
                <Switch
                  id="analytics-consent"
                  checked={consent.shareAnonymousUsage}
                  onCheckedChange={(checked) => handleConsentChange('shareAnonymousUsage', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tips-consent">Receive educational tips</Label>
                  <p className="text-sm text-muted-foreground">
                    Get helpful financial learning suggestions
                  </p>
                </div>
                <Switch
                  id="tips-consent"
                  checked={consent.receiveEducationalTips}
                  onCheckedChange={(checked) => handleConsentChange('receiveEducationalTips', checked)}
                />
              </div>

              {consent.consentDate && (
                <div className="pt-4 text-sm text-muted-foreground">
                  Consent given on: {new Date(consent.consentDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Data Minimization
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">What we collect:</p>
              <div className="space-y-2">
                {dataMinimization.collected.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground"> - {item.purpose}</span>
                      {item.required && (
                        <span className="text-xs text-destructive ml-2">(Required)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">What we DON'T collect:</p>
              <div className="flex flex-wrap gap-2">
                {dataMinimization.notCollected.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-xs rounded-md flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Data Retention & Activity
          </h3>
          
          {inactivityStatus && (
            <div className="space-y-3">
              {inactivityStatus.needsWarning && (
                <Alert variant="destructive">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Inactivity Warning</AlertTitle>
                  <AlertDescription>
                    Your account will be automatically deleted in{' '}
                    <strong>{inactivityStatus.daysUntilDeletion} days</strong> due to inactivity.
                    Log in to prevent deletion.
                  </AlertDescription>
                </Alert>
              )}

              {hasScheduledDeletion && (
                <Alert variant="destructive">
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Scheduled for Deletion</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      Your data is scheduled to be deleted on{' '}
                      <strong>
                        {new Date(privacyData!.dataRetention.scheduledDeletion!).toLocaleDateString()}
                      </strong>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDeletion}
                    >
                      Cancel Data Deletion
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Account created:</span>{' '}
                  <span className="font-medium">
                    {privacyData?.dataRetention?.accountCreated 
                      ? new Date(privacyData.dataRetention.accountCreated).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Last active:</span>{' '}
                  <span className="font-medium">
                    {privacyData?.dataRetention?.lastActive
                      ? new Date(privacyData.dataRetention.lastActive).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          )}

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertTitle>Automatic Data Retention Policy</AlertTitle>
            <AlertDescription>
              Inactive accounts (not used for 2 years) are automatically deleted. You'll receive a
              warning 30 days before deletion. Simply log in to keep your account active.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Your Data Rights</h3>
        
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={handleExportData}
          >
            <FileArrowDown className="w-4 h-4" />
            Export All My Data
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={onViewPrivacyPolicy}
          >
            <Shield className="w-4 h-4" />
            View Full Privacy Policy
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => setShowWithdrawDialog(true)}
            disabled={hasScheduledDeletion}
          >
            <Warning className="w-4 h-4" />
            Withdraw Consent & Delete Data
          </Button>

          <Button
            variant="destructive"
            className="justify-start gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="w-4 h-4" />
            Delete All My Data Now
          </Button>
        </div>
      </Card>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Consent?</DialogTitle>
            <DialogDescription>
              Withdrawing consent will schedule your data for deletion within 24 hours. This includes:
            </DialogDescription>
          </DialogHeader>
          
          <ul className="text-sm space-y-1 ml-4">
            <li>• All game progress and scores</li>
            <li>• Learning style preferences</li>
            <li>• Achievements and levels</li>
            <li>• Account settings</li>
          </ul>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You can cancel the deletion within 24 hours by logging in and clicking "Cancel Data Deletion"
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleWithdrawConsent}>
              Withdraw Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Data?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All of your data will be permanently deleted:
            </DialogDescription>
          </DialogHeader>
          
          <ul className="text-sm space-y-1 ml-4">
            <li>• User profile and level progress</li>
            <li>• All game scores and achievements</li>
            <li>• Tier progression and quest data</li>
            <li>• Learning style preferences</li>
            <li>• Settings and preferences</li>
            <li>• Transaction history (simulator)</li>
          </ul>

          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertDescription>
              <strong>This cannot be undone!</strong> Consider exporting your data first.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllData}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
