import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAccessibility } from '@/hooks/use-accessibility'
import { Eye, EyeSlash, GearSix, Keyboard, SpeakerHigh, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface AccessibilitySettingsProps {
  onClose?: () => void
}

export function AccessibilitySettings({ onClose }: AccessibilitySettingsProps) {
  const {
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleKeyboardNavigation,
    toggleScreenReaderOptimization,
  } = useAccessibility()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Accessibility Settings</CardTitle>
                <CardDescription>
                  Customize your experience for better accessibility
                </CardDescription>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close accessibility settings"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-md bg-primary/10 mt-1">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="high-contrast"
                    className="text-base font-semibold cursor-pointer"
                  >
                    High Contrast Mode
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {settings.highContrastMode ? 'ON' : 'OFF'}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Increases contrast between text and background colors for better readability.
                    Color-coded elements include text labels alongside colors.
                  </p>
                </div>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrastMode}
                onCheckedChange={toggleHighContrast}
                aria-label="Toggle high contrast mode"
                className="mt-2"
              />
            </div>

            <Separator />

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-md bg-secondary/10 mt-1">
                  <GearSix className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="reduced-motion"
                    className="text-base font-semibold cursor-pointer"
                  >
                    Reduce Motion
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {settings.reducedMotion ? 'ON' : 'OFF'}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimizes animations and transitions throughout the app. Useful for users
                    sensitive to motion or who prefer a calmer interface.
                  </p>
                </div>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={toggleReducedMotion}
                aria-label="Toggle reduced motion"
                className="mt-2"
              />
            </div>

            <Separator />

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-md bg-accent/10 mt-1">
                  <Keyboard className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="keyboard-nav"
                    className="text-base font-semibold cursor-pointer"
                  >
                    Enhanced Keyboard Navigation
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {settings.keyboardNavigationEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enhanced focus indicators and keyboard shortcuts. Tab through all interactive
                    elements, use Enter/Space to activate buttons.
                  </p>
                  <div className="mt-2 p-3 rounded-md bg-muted/50">
                    <p className="text-xs font-medium mb-2">Keyboard Shortcuts:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-background border text-foreground">
                          Tab
                        </kbd>{' '}
                        - Navigate forward
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-background border text-foreground">
                          Shift + Tab
                        </kbd>{' '}
                        - Navigate backward
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-background border text-foreground">
                          Enter
                        </kbd>{' '}
                        or{' '}
                        <kbd className="px-1.5 py-0.5 rounded bg-background border text-foreground">
                          Space
                        </kbd>{' '}
                        - Activate button
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-background border text-foreground">
                          Esc
                        </kbd>{' '}
                        - Close dialogs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigationEnabled}
                onCheckedChange={toggleKeyboardNavigation}
                aria-label="Toggle enhanced keyboard navigation"
                className="mt-2"
              />
            </div>

            <Separator />

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-md bg-primary/10 mt-1">
                  <SpeakerHigh className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="screen-reader"
                    className="text-base font-semibold cursor-pointer"
                  >
                    Screen Reader Optimization
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {settings.screenReaderOptimized ? 'ON' : 'OFF'}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Adds descriptive labels and ARIA attributes for screen readers. All images have
                    alt text, form inputs have proper labels, and interactive elements are clearly
                    announced.
                  </p>
                </div>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReaderOptimized}
                onCheckedChange={toggleScreenReaderOptimization}
                aria-label="Toggle screen reader optimization"
                className="mt-2"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <p>
                All settings are automatically saved and will persist across sessions. These
                preferences apply throughout the entire application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
