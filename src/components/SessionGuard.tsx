import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Clock } from '@phosphor-icons/react'

interface SessionGuardProps {
  children: React.ReactNode
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { session, isAuthenticated, updateActivity, handleLogout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (!session || !isAuthenticated) return

    const checkSession = () => {
      const now = Date.now()
      const timeSinceActivity = now - session.lastActivity
      const timeout = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
      const remaining = timeout - timeSinceActivity
      
      const fiveMinutes = 5 * 60 * 1000
      if (remaining <= fiveMinutes && remaining > 0 && !showWarning) {
        setShowWarning(true)
        setTimeRemaining(Math.floor(remaining / 1000))
      } else if (remaining <= 0) {
        handleLogout()
      }
    }

    const interval = setInterval(checkSession, 10000)
    
    checkSession()

    return () => clearInterval(interval)
  }, [session, isAuthenticated, showWarning])

  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      const countdown = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdown)
    }
  }, [showWarning, timeRemaining])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleUserActivity = () => {
      updateActivity()
      if (showWarning) {
        setShowWarning(false)
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [updateActivity, showWarning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStaySignedIn = () => {
    updateActivity()
    setShowWarning(false)
  }

  return (
    <>
      {children}
      
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" weight="fill" />
              Session Expiring Soon
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your session will expire in <strong className="text-foreground">{formatTime(timeRemaining)}</strong> due 
                to inactivity.
              </p>
              <p className="text-sm">
                Click "Stay Signed In" to continue your session, or you'll be automatically signed out.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogout}>
              Sign Out Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStaySignedIn}>
              Stay Signed In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
