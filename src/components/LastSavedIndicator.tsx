import { useDataPersistence } from '@/hooks/use-data-persistence'
import { Clock, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LastSavedIndicatorProps {
  className?: string
  showIcon?: boolean
  compact?: boolean
}

export function LastSavedIndicator({ 
  className, 
  showIcon = true, 
  compact = false 
}: LastSavedIndicatorProps) {
  const { lastSaved, isSaving } = useDataPersistence()

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return 'Never'
    
    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 min ago'
    if (diffMins < 60) return `${diffMins} mins ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hr ago'
    if (diffHours < 24) return `${diffHours} hrs ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground",
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`Last saved ${getTimeSinceLastSave()}`}
      >
        {showIcon && (
          isSaving ? (
            <Clock className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
          )
        )}
        <span className="hidden sm:inline">
          {isSaving ? 'Saving...' : getTimeSinceLastSave()}
        </span>
        <span className="sm:hidden">
          {isSaving ? 'Saving...' : getTimeSinceLastSave()}
        </span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Last saved ${getTimeSinceLastSave()}`}
    >
      {showIcon && (
        isSaving ? (
          <Clock className="w-4 h-4 text-muted-foreground animate-pulse" aria-hidden="true" />
        ) : (
          <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
        )
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="font-medium text-xs sm:text-sm">
          {isSaving ? 'Saving...' : 'Last saved:'}
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {isSaving ? 'Backing up progress' : getTimeSinceLastSave()}
        </span>
      </div>
    </div>
  )
}
