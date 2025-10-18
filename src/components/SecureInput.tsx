import { forwardRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SecurityService } from '@/lib/security'
import { WarningCircle } from '@phosphor-icons/react'

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validate?: 'email' | 'username' | 'text'
  onValidChange?: (value: string, isValid: boolean) => void
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ validate, onValidChange, onChange, value, maxLength = 1000, ...props }, ref) => {
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value
      let isValid = true
      let errorMsg: string | null = null

      inputValue = SecurityService.sanitizeInput(inputValue)

      if (validate === 'email') {
        isValid = SecurityService.validateEmail(inputValue)
        if (!isValid && inputValue.length > 0) {
          errorMsg = 'Please enter a valid email address'
        }
      } else if (validate === 'username') {
        isValid = SecurityService.validateUsername(inputValue)
        if (!isValid && inputValue.length > 0) {
          errorMsg = 'Username must be 3-20 characters, letters, numbers, dash, or underscore only'
        }
      }

      setError(errorMsg)
      
      if (onValidChange) {
        onValidChange(inputValue, isValid)
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: inputValue }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={error ? 'border-destructive' : ''}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <WarningCircle className="w-3 h-3" weight="fill" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

SecureInput.displayName = 'SecureInput'

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValidChange?: (value: string) => void
}

export const SecureTextarea = forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ onValidChange, onChange, value, maxLength = 1000, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let inputValue = e.target.value

      inputValue = SecurityService.sanitizeInput(inputValue)

      if (onValidChange) {
        onValidChange(inputValue)
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: inputValue }
        } as React.ChangeEvent<HTMLTextAreaElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
    )
  }
)

SecureTextarea.displayName = 'SecureTextarea'
