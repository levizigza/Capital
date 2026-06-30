import { useState, useEffect } from 'react'
import { Play, Pause, SpeakerHigh, SpeakerX, SkipForward, SkipBack, MusicNotes } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { musicService, type MusicTrack } from '@/lib/music-service'
import { cn } from '@/lib/utils'

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isEnabled, setIsEnabled] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Initialize music service state
    setIsPlaying(musicService.isMusicPlaying())
    setVolume(musicService.getVolume())
    setIsEnabled(musicService.isMusicEnabled())
    setCurrentTrack(musicService.getCurrentTrack())

    // Don't auto-play - wait for user to click play button
    // This avoids browser autoplay restrictions

    // Update state periodically
    const interval = setInterval(() => {
      setIsPlaying(musicService.isMusicPlaying())
      setCurrentTrack(musicService.getCurrentTrack())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleToggle = () => {
    if (isEnabled) {
      musicService.toggle()
      setIsPlaying(musicService.isMusicPlaying())
    } else {
      musicService.enable()
      setIsEnabled(true)
      setIsPlaying(true)
      if (!currentTrack) {
        musicService.playTrack(undefined, true)
        setCurrentTrack(musicService.getCurrentTrack())
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    musicService.setVolume(newVolume)
  }

  const handleDisable = () => {
    musicService.disable()
    setIsEnabled(false)
    setIsPlaying(false)
  }

  const handleNext = () => {
    musicService.next()
    setCurrentTrack(musicService.getCurrentTrack())
  }

  const handlePrevious = () => {
    musicService.previous()
    setCurrentTrack(musicService.getCurrentTrack())
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative min-w-[44px] min-h-[44px]",
            isPlaying && "text-primary"
          )}
          aria-label="Music player"
          title={currentTrack ? `Now playing: ${currentTrack.title}` : 'Music player'}
        >
          <MusicNotes size={20} weight={isPlaying ? "fill" : "regular"} />
          {isPlaying && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Current Track Info */}
          {currentTrack && (
            <div className="text-center pb-2 border-b">
              <p className="font-semibold text-sm">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              aria-label="Previous track"
            >
              <SkipBack size={18} />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleToggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-12 h-12"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {volume > 0 ? (
                  <SpeakerHigh size={16} className="text-muted-foreground" />
                ) : (
                  <SpeakerX size={16} className="text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Volume</span>
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Enable/Disable */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={isEnabled ? handleDisable : handleToggle}
              className="w-full"
            >
              {isEnabled ? 'Disable Music' : 'Enable Music'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
