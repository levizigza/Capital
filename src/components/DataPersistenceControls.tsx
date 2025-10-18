import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Download, 
  Upload, 
  Clock, 
  Database,
  CheckCircle,
  Warning
} from '@phosphor-icons/react'
import { useDataPersistence } from '@/hooks/use-data-persistence'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'

export function DataPersistenceControls() {
  const { 
    lastSaved, 
    isSaving, 
    exportData, 
    importData, 
    saveToLocalStorage, 
    clearAllData 
  } = useDataPersistence()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return 'Never'
    
    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const handleExport = async () => {
    await exportData()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    await importData(file)
    setIsImporting(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearData = async () => {
    const success = await clearAllData()
    if (success) {
      setShowClearDialog(false)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  const handleManualSave = async () => {
    await saveToLocalStorage()
    toast.success('Progress saved!')
  }

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Data Persistence</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your progress is automatically saved to browser storage every 30 seconds and backed up to localStorage.
          </p>
        </div>

        <div 
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
          role="status"
          aria-live="polite"
          aria-label={`Last saved ${getTimeSinceLastSave()}`}
        >
          {isSaving ? (
            <>
              <Clock className="w-5 h-5 text-muted-foreground animate-pulse" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium">Saving...</p>
                <p className="text-xs text-muted-foreground">Backing up your progress</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Last saved: {getTimeSinceLastSave()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-save is active
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleManualSave}
              variant="outline"
              className="flex-1 gap-2"
              disabled={isSaving}
              aria-label="Manually save progress now"
            >
              <Database className="w-4 h-4" aria-hidden="true" />
              Save Now
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex-1 gap-2"
              aria-label="Export progress as JSON file"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export Progress
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="flex-1 gap-2"
              disabled={isImporting}
              aria-label="Import progress from JSON file"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {isImporting ? 'Importing...' : 'Import Progress'}
            </Button>

            <Button
              onClick={() => setShowClearDialog(true)}
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label="Clear all saved data"
            >
              <Warning className="w-4 h-4" aria-hidden="true" />
              Clear All Data
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="File input for importing progress"
          />
        </div>

        <div className="pt-3 border-t space-y-2">
          <h4 className="text-sm font-medium">What gets saved:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>User profile (name, level, XP, coins)</li>
            <li>Tier progression and quest completion</li>
            <li>Game scores and high scores</li>
            <li>Accessibility settings</li>
            <li>Banking simulator data</li>
            <li>VARK learning profile</li>
          </ul>
        </div>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your progress, including:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>User profile and level progress</li>
                <li>All game scores and achievements</li>
                <li>Tier progression and quest data</li>
                <li>Settings and preferences</li>
              </ul>
              <strong className="block mt-3 text-destructive">
                This action cannot be undone. Consider exporting your data first!
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
