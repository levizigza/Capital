import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Icon } from '@phosphor-icons/react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] px-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6 p-6 rounded-full bg-muted"
        aria-label={title}
        data-ux-tooltip={title}
      >
        <Icon size={64} weight="duotone" className="text-muted-foreground" />
      </motion.div>

      <h3 className="text-2xl font-semibold mb-3 text-foreground" title={title} data-ux-tooltip={title}>{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed" title={description} data-ux-tooltip={description}>{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            size="lg"
            className="min-w-[160px] min-h-[44px]"
            aria-label={actionLabel}
            title={actionLabel}
            data-ux-tooltip={actionLabel}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            onClick={onSecondaryAction}
            variant="outline"
            size="lg"
            className="min-w-[160px] min-h-[44px]"
            aria-label={secondaryActionLabel}
            title={secondaryActionLabel}
            data-ux-tooltip={secondaryActionLabel}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
