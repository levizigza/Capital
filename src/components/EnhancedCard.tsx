import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EnhancedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export function EnhancedCard({
  variant = 'default',
  hover = true,
  padding = 'md',
  className,
  children,
  ...props
}: EnhancedCardProps) {
  const variantStyles = {
    default: 'bg-card border border-border-light',
    elevated: 'bg-card border border-border-light shadow-md',
    glass:
      'bg-card/85 backdrop-blur-sm border border-border-light/30 shadow-lg',
    gradient:
      'bg-gradient-to-br from-card to-muted-light border border-border-light',
  }

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  return (
    <motion.div
      className={cn(
        'rounded-xl transition-all duration-250',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'hover:shadow-lg hover:border-border',
        className
      )}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-2">{action}</div>}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-sm text-foreground-muted space-y-2', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 pt-4 mt-4 border-t border-border-light',
        className
      )}
    >
      {children}
    </div>
  )
}
