import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader } from '@/lib/lucide'
import { cn } from '@/lib/utils'

interface EnhancedButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

    const variantStyles = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-dark shadow-md hover:shadow-lg active:shadow-sm',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary-dark shadow-md hover:shadow-lg active:shadow-sm',
      accent:
        'bg-accent text-accent-foreground hover:bg-accent-dark shadow-md hover:shadow-lg active:shadow-sm',
      ghost:
        'bg-transparent text-foreground hover:bg-muted active:bg-muted-dark',
      outline:
        'bg-transparent border-2 border-border text-foreground hover:bg-muted hover:border-border-dark active:bg-muted-dark',
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm gap-1.5 min-h-[44px]',
      md: 'px-4 py-2.5 text-base gap-2 min-h-[48px]',
      lg: 'px-6 py-3 text-lg gap-2.5 min-h-[52px]',
      xl: 'px-8 py-4 text-xl gap-3 min-h-[56px]',
    }

    const rippleVariants = {
      initial: { scale: 0, opacity: 0.5 },
      animate: { scale: 4, opacity: 0 },
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
          >
            <Loader className="w-5 h-5 animate-spin" />
          </motion.div>
        )}

        <span
          className={cn(
            'flex items-center justify-center gap-2',
            isLoading && 'opacity-0'
          )}
        >
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'
