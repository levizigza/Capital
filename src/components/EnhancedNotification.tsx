import { motion } from 'framer-motion'
import { Info, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  onClose?: () => void
  duration?: number
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
}

const colorMap = {
  info: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    icon: 'text-info',
    text: 'text-info-dark',
  },
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: 'text-success',
    text: 'text-success-dark',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: 'text-warning',
    text: 'text-warning-dark',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: 'text-error',
    text: 'text-error-dark',
  },
}

export function EnhancedNotification({
  type,
  title,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  const Icon = iconMap[type]
  const colors = colorMap[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border-2',
        'backdrop-blur-sm shadow-lg',
        colors.bg,
        colors.border
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
        <Icon size={24} weight="fill" />
      </div>

      <div className="flex-1 min-w-0" title={message} data-ux-tooltip={message}>
        <h4 className={cn('font-semibold text-sm mb-1', colors.text)}>{title}</h4>
        <p className="text-sm text-foreground-muted leading-relaxed">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring',
            colors.text
          )}
          aria-label="Close notification"
          title="Close notification"
          data-ux-tooltip="Dismiss this message"
        >
          <XCircle size={18} />
        </button>
      )}

      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={cn(
          'absolute bottom-0 left-0 h-1 w-full origin-left rounded-b-xl',
          type === 'info' && 'bg-info',
          type === 'success' && 'bg-success',
          type === 'warning' && 'bg-warning',
          type === 'error' && 'bg-error'
        )}
      />
    </motion.div>
  )
}
