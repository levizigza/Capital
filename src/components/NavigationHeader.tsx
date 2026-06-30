import { motion } from 'framer-motion'
import { House, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { UserAvatar } from '@/components/UserAvatar'
import type { UserProfile } from '@/App'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface NavigationHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  onHome: () => void
  showHomeButton?: boolean
  showBackButton?: boolean
  onBack?: () => void
  rightContent?: React.ReactNode
  mode?: 'Creative' | 'Structured' | 'Classic' | string
  userProfile?: UserProfile | null
}

export function NavigationHeader({
  breadcrumbs,
  onHome,
  showHomeButton = true,
  showBackButton = false,
  onBack,
  rightContent,
  mode,
  userProfile,
}: NavigationHeaderProps) {
  useKeyboardShortcuts([
    {
      key: 'h',
      alt: true,
      callback: onHome,
      description: 'Go to home',
    },
  ])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showHomeButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onHome}
              className="min-w-[44px] min-h-[44px]"
              aria-label="Go to home (Alt+H)"
              title="Go to home (Alt+H)"
              data-ux-tooltip="Return to main dashboard"
            >
              <House size={20} weight="duotone" />
            </Button>
          )}

          {showBackButton && onBack && (
            <motion.div whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="min-w-[44px] min-h-[44px]"
                aria-label="Go back"
                title="Go back"
                data-ux-tooltip="Go to previous screen"
              >
                <ArrowLeft size={20} weight="duotone" />
              </Button>
            </motion.div>
          )}

          {/* Mode indicator for user orientation */}
          {mode && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-2 px-3 py-1 rounded bg-primary/10 text-primary font-semibold text-sm shadow-sm"
              aria-label={`Current mode: ${mode}`}
              title={`Current mode: ${mode}`}
              data-ux-tooltip={`You are in ${mode} mode`}
            >
              {mode} Mode
            </motion.span>
          )}

          <nav aria-label="Breadcrumb" className="flex items-center">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-muted-foreground" aria-hidden="true">
                      /
                    </span>
                  )}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span
                      className={
                        index === breadcrumbs.length - 1
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground'
                      }
                      aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {rightContent}
          {userProfile && (
            <UserAvatar userProfile={userProfile} size="sm" />
          )}
        </div>
      </div>
    </motion.header>
  )
}
