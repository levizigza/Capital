import { Howl } from 'howler'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  tags: string[]
  category: 'adventure' | 'calm' | 'battle' | 'victory' | 'menu'
}

// Free royalty-free music tracks from various sources
// Using SoundHelix for reliable free music streaming
const MUSIC_TRACKS: MusicTrack[] = [
  // Adventure/Exploration Music
  {
    id: 'adventure-1',
    title: 'Adventure Quest',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 0,
    tags: ['adventure', 'exploration', 'upbeat'],
    category: 'adventure'
  },
  {
    id: 'adventure-2',
    title: 'Journey Begins',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 0,
    tags: ['adventure', 'epic', 'journey'],
    category: 'adventure'
  },
  // Calm/Menu Music
  {
    id: 'calm-1',
    title: 'Peaceful Village',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 0,
    tags: ['calm', 'peaceful', 'ambient'],
    category: 'calm'
  },
  {
    id: 'calm-2',
    title: 'Relaxing Meadow',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 0,
    tags: ['calm', 'relaxing', 'nature'],
    category: 'calm'
  },
  // Battle/Action Music
  {
    id: 'battle-1',
    title: 'Boss Battle',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 0,
    tags: ['battle', 'intense', 'action'],
    category: 'battle'
  },
  {
    id: 'battle-2',
    title: 'Epic Confrontation',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 0,
    tags: ['battle', 'epic', 'boss'],
    category: 'battle'
  },
  // Victory Music
  {
    id: 'victory-1',
    title: 'Victory Fanfare',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 0,
    tags: ['victory', 'celebration', 'success'],
    category: 'victory'
  },
  // Menu Music
  {
    id: 'menu-1',
    title: 'Main Menu',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 0,
    tags: ['menu', 'ambient', 'calm'],
    category: 'menu'
  },
  {
    id: 'menu-2',
    title: 'Title Screen',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 0,
    tags: ['menu', 'intro', 'welcome'],
    category: 'menu'
  },
  {
    id: 'adventure-3',
    title: 'Neighborhood Stroll',
    artist: 'SoundHelix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 0,
    tags: ['adventure', 'exploration', 'fun'],
    category: 'adventure'
  }
]

class MusicService {
  private currentTrack: Howl | null = null
  private currentTrackId: string | null = null
  private volume: number = 0.3
  private isPlaying: boolean = false
  private isEnabled: boolean = true
  private playlist: MusicTrack[] = [...MUSIC_TRACKS]
  private currentIndex: number = 0
  private currentCategory: MusicTrack['category'] | null = null

  constructor() {
    // Load saved preferences
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('music-volume')
      const savedEnabled = localStorage.getItem('music-enabled')
      if (savedVolume) {
        this.volume = parseFloat(savedVolume)
      }
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true'
      }
    }
  }

  async playTrack(trackId?: string, loop: boolean = true): Promise<void> {
    if (!this.isEnabled) return

    // Stop current track
    this.stop()

    // Find track
    let track: MusicTrack | undefined
    if (trackId) {
      track = this.playlist.find(t => t.id === trackId)
      if (track) {
        this.currentIndex = this.playlist.indexOf(track)
      }
    } else {
      track = this.playlist[this.currentIndex]
    }

    if (!track) {
      console.warn('Track not found, using first available')
      track = this.playlist[0]
      this.currentIndex = 0
    }

    try {
      this.currentTrack = new Howl({
        src: [track.url],
        volume: this.volume,
        loop: loop,
        autoplay: false,
        html5: true, // Use HTML5 Audio for better streaming
        onload: () => {
          console.log('Music track loaded:', track?.title)
        },
        onloaderror: (_id, error) => {
          console.warn('Failed to load music track:', error)
          // Try next track
          if (this.playlist.length > 1) {
            setTimeout(() => this.next(), 1000)
          }
        },
        onend: () => {
          if (!loop) {
            this.next()
          }
        }
      })

      this.currentTrackId = track.id
      this.currentCategory = track.category

      // Only play if enabled and user has interacted
      if (this.isEnabled) {
        try {
          this.currentTrack.play()
          this.isPlaying = true
        } catch (error) {
          console.warn('Could not play music (may need user interaction):', error)
          this.isPlaying = false
        }
      }
    } catch (error) {
      console.error('Error playing music:', error)
    }
  }

  // Play music by category (for different game states)
  async playByCategory(category: MusicTrack['category'], loop: boolean = true): Promise<void> {
    const categoryTracks = this.playlist.filter(t => t.category === category)
    if (categoryTracks.length === 0) {
      console.warn(`No tracks found for category: ${category}`)
      return
    }
    
    // Pick a random track from the category
    const randomTrack = categoryTracks[Math.floor(Math.random() * categoryTracks.length)]
    await this.playTrack(randomTrack.id, loop)
  }

  stop(): void {
    if (this.currentTrack) {
      this.currentTrack.stop()
      this.currentTrack.unload()
      this.currentTrack = null
    }
    this.isPlaying = false
    this.currentTrackId = null
  }

  pause(): void {
    if (this.currentTrack && this.isPlaying) {
      this.currentTrack.pause()
      this.isPlaying = false
    }
  }

  resume(): void {
    if (this.currentTrack && !this.isPlaying && this.isEnabled) {
      this.currentTrack.play()
      this.isPlaying = true
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.currentTrack) {
      this.currentTrack.volume(this.volume)
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-volume', this.volume.toString())
    }
  }

  getVolume(): number {
    return this.volume
  }

  toggle(): void {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.resume()
    }
  }

  enable(): void {
    this.isEnabled = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-enabled', 'true')
    }
    if (!this.isPlaying && this.currentTrackId) {
      this.playTrack(this.currentTrackId)
    }
  }

  disable(): void {
    this.isEnabled = false
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-enabled', 'false')
    }
    this.stop()
  }

  isMusicEnabled(): boolean {
    return this.isEnabled
  }

  isMusicPlaying(): boolean {
    return this.isPlaying && this.isEnabled
  }

  getCurrentTrack(): MusicTrack | null {
    if (!this.currentTrackId) return null
    return this.playlist.find(t => t.id === this.currentTrackId) || null
  }

  getCurrentCategory(): MusicTrack['category'] | null {
    return this.currentCategory
  }

  getPlaylist(): MusicTrack[] {
    return [...this.playlist]
  }

  getPlaylistByCategory(category: MusicTrack['category']): MusicTrack[] {
    return this.playlist.filter(t => t.category === category)
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
    this.playTrack(this.playlist[this.currentIndex].id)
  }

  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
    this.playTrack(this.playlist[this.currentIndex].id)
  }

  // Search tracks by tag or title
  searchTracks(query: string): MusicTrack[] {
    const lowerQuery = query.toLowerCase()
    return this.playlist.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // Crossfade to a new track (for smooth transitions)
  async crossfadeTo(trackId: string, duration: number = 2000): Promise<void> {
    if (!this.isEnabled) return

    const newTrack = this.playlist.find(t => t.id === trackId)
    if (!newTrack) return

    // Fade out current track
    if (this.currentTrack && this.isPlaying) {
      const oldTrack = this.currentTrack
      const startVolume = this.volume
      const fadeSteps = 20
      const stepDuration = duration / 2 / fadeSteps

      for (let i = fadeSteps; i >= 0; i--) {
        oldTrack.volume((i / fadeSteps) * startVolume)
        await new Promise(resolve => setTimeout(resolve, stepDuration))
      }
      oldTrack.stop()
      oldTrack.unload()
    }

    // Play new track with fade in
    await this.playTrack(trackId)
    if (this.currentTrack) {
      this.currentTrack.volume(0)
      const fadeSteps = 20
      const stepDuration = duration / 2 / fadeSteps
      
      for (let i = 0; i <= fadeSteps; i++) {
        this.currentTrack.volume((i / fadeSteps) * this.volume)
        await new Promise(resolve => setTimeout(resolve, stepDuration))
      }
    }
  }
}

// Singleton instance
export const musicService = new MusicService()
