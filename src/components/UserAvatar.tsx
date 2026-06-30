import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/App'

interface UserAvatarProps {
  userProfile?: UserProfile | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  className?: string
}

const AVATAR_EMOJIS = ['👤', '🧑', '👨', '👩', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🦸', '🦸‍♂️', '🦸‍♀️', '🚀', '⭐', '💎', '🎯', '🌟']

export function UserAvatar({ userProfile, size = 'md', showName = false, className }: UserAvatarProps) {
  const { githubUser } = useAuth()
  
  // Get avatar from GitHub if available
  const avatarUrl = githubUser?.avatarUrl
  
  // Get user name
  const userName = userProfile?.name || githubUser?.login || 'User'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  // Select emoji avatar based on user name hash for consistency
  const emojiIndex = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_EMOJIS.length
  const emojiAvatar = AVATAR_EMOJIS[emojiIndex]

  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-16'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={userName} />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
          {avatarUrl ? initials : emojiAvatar}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="font-medium text-sm">{userName}</span>
      )}
    </div>
  )
}

// Simple emoji avatar for places where we just need a small icon
export function EmojiAvatar({ emoji, size = 'md', className }: { emoji: string, size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'size-6 text-xs',
    md: 'size-8 text-sm',
    lg: 'size-12 text-lg'
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200',
      sizeClasses[size],
      className
    )}>
      {emoji}
    </div>
  )
}

// Character avatar selector for game characters
export function CharacterAvatar({ 
  characterId, 
  size = 'md', 
  className 
}: { 
  characterId?: string, 
  size?: 'sm' | 'md' | 'lg',
  className?: string 
}) {
  const characterEmojis: Record<string, string> = {
    'piggy': '🐷',
    'squirrel': '🐿️',
    'owl': '🦉',
    'guardian': '🛡️',
    'strategist': '🧠',
    'navigator': '🧭',
    'explorer': '🗺️',
    'default': '👤'
  }

  const emoji = characterId ? characterEmojis[characterId] || characterEmojis.default : characterEmojis.default

  return <EmojiAvatar emoji={emoji} size={size} className={className} />
}
