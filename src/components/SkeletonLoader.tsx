import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'text' | 'avatar' | 'chart'
  count?: number
  className?: string
}

export function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-card border rounded-lg p-6 space-y-4 ${className}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            </div>
          </div>
        )

      case 'list':
        return (
          <div className={`bg-card border rounded-lg ${className}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
          </div>
        )

      case 'avatar':
        return <div className={`w-12 h-12 bg-muted rounded-full animate-pulse ${className}`} />

      case 'chart':
        return (
          <div className={`bg-card border rounded-lg p-6 ${className}`}>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </motion.div>
  )
}
