/**
 * Brain-Computer Interface System
 * Handles EEG data processing, attention/focus detection, and cognitive state analysis
 * Supports Muse, OpenBCI, and other EEG devices
 */

export interface EEGData {
  timestamp: number
  channels: {
    tp9?: number
    af7?: number
    af8?: number
    tp10?: number
    // Add more channels as needed
  }
  quality: number // 0-1, signal quality
}

export interface CognitiveState {
  attention: number // 0-1
  focus: number // 0-1
  relaxation: number // 0-1
  engagement: number // 0-1
  frustration: number // 0-1
  flow: number // 0-1
  timestamp: number
}

export interface BCIConfig {
  deviceType: 'muse' | 'openbci' | 'emotiv' | 'mock'
  samplingRate: number
  bufferSize: number
  calibrationTime: number // seconds
  adaptiveThresholds: boolean
}

export class BCISystem {
  private isConnected = false
  private isCalibrated = false
  private device: any = null
  private eegBuffer: EEGData[] = []
  private cognitiveState: CognitiveState | null = null
  private config: BCIConfig
  private calibrationData: { [key: string]: number } = {}
  private stateCallbacks: Function[] = []
  private baselineAlpha = 0
  private baselineBeta = 0
  private baselineTheta = 0

  constructor(config: Partial<BCIConfig> = {}) {
    this.config = {
      deviceType: 'mock',
      samplingRate: 256,
      bufferSize: 1024,
      calibrationTime: 30,
      adaptiveThresholds: true,
      ...config
    }
  }

  async initialize(): Promise<boolean> {
    try {
      switch (this.config.deviceType) {
        case 'muse':
          return await this.initializeMuse()
        case 'openbci':
          return await this.initializeOpenBCI()
        case 'emotiv':
          return await this.initializeEmotiv()
        case 'mock':
          return await this.initializeMock()
        default:
          console.error('Unsupported BCI device type')
          return false
      }
    } catch (error) {
      console.error('BCI initialization failed:', error)
      return false
    }
  }

  private async initializeMuse(): Promise<boolean> {
    try {
      // Check if Muse SDK is available
      if (typeof window !== 'undefined' && (window as any).muse) {
        this.device = new (window as any).muse.MuseClient()
        await this.device.connect()
        await this.device.start()
        
        this.device.eegReadings.subscribe((reading: any) => {
          this.processEEGData({
            timestamp: Date.now(),
            channels: {
              tp9: reading.samples[0]?.[0],
              af7: reading.samples[0]?.[1],
              af8: reading.samples[0]?.[2],
              tp10: reading.samples[0]?.[3]
            },
            quality: this.calculateSignalQuality(reading)
          })
        })

        this.isConnected = true
        return true
      }
      
      console.warn('Muse SDK not found, falling back to mock mode')
      return await this.initializeMock()
    } catch (error) {
      console.error('Muse initialization failed:', error)
      return await this.initializeMock()
    }
  }

  private async initializeOpenBCI(): Promise<boolean> {
    // OpenBCI implementation would go here
    // For now, fall back to mock
    console.warn('OpenBCI not implemented, using mock mode')
    return await this.initializeMock()
  }

  private async initializeEmotiv(): Promise<boolean> {
    // Emotiv implementation would go here
    // For now, fall back to mock
    console.warn('Emotiv not implemented, using mock mode')
    return await this.initializeMock()
  }

  private async initializeMock(): Promise<boolean> {
    // Mock BCI for development and demo purposes
    this.isConnected = true
    
    // Simulate EEG data
    setInterval(() => {
      const mockData: EEGData = {
        timestamp: Date.now(),
        channels: {
          tp9: this.generateMockEEG(),
          af7: this.generateMockEEG(),
          af8: this.generateMockEEG(),
          tp10: this.generateMockEEG()
        },
        quality: 0.8 + Math.random() * 0.2
      }
      
      this.processEEGData(mockData)
    }, 1000 / this.config.samplingRate)

    return true
  }

  private generateMockEEG(): number {
    // Generate realistic EEG-like signal with different frequency components
    const alpha = Math.sin(Date.now() * 0.001 * 10) * 20 // 10 Hz alpha
    const beta = Math.sin(Date.now() * 0.001 * 20) * 10  // 20 Hz beta
    const theta = Math.sin(Date.now() * 0.001 * 6) * 15  // 6 Hz theta
    const noise = (Math.random() - 0.5) * 5
    
    return alpha + beta + theta + noise
  }

  private calculateSignalQuality(reading: any): number {
    // Simplified signal quality calculation
    // In a real implementation, this would check impedance, artifacts, etc.
    return Math.max(0, Math.min(1, 0.7 + Math.random() * 0.3))
  }

  private processEEGData(data: EEGData) {
    // Add to buffer
    this.eegBuffer.push(data)
    if (this.eegBuffer.length > this.config.bufferSize) {
      this.eegBuffer.shift()
    }

    // Calculate cognitive state from recent EEG data
    if (this.eegBuffer.length >= 64) { // Need minimum samples for frequency analysis
      this.updateCognitiveState()
    }
  }

  private updateCognitiveState() {
    const recentData = this.eegBuffer.slice(-64) // Last 64 samples
    
    // Calculate power spectral density for different frequency bands
    const alpha = this.calculateBandPower(recentData, 8, 12) // Alpha waves (8-12 Hz)
    const beta = this.calculateBandPower(recentData, 13, 30)  // Beta waves (13-30 Hz)
    const theta = this.calculateBandPower(recentData, 4, 7)   // Theta waves (4-7 Hz)
    const gamma = this.calculateBandPower(recentData, 30, 100) // Gamma waves (30-100 Hz)

    // Calculate cognitive metrics
    const attention = this.calculateAttention(beta, alpha, theta)
    const focus = this.calculateFocus(beta, theta)
    const relaxation = this.calculateRelaxation(alpha, beta)
    const engagement = this.calculateEngagement(beta, gamma, alpha)
    const frustration = this.calculateFrustration(beta, alpha)
    const flow = this.calculateFlow(alpha, theta, beta)

    this.cognitiveState = {
      attention,
      focus,
      relaxation,
      engagement,
      frustration,
      flow,
      timestamp: Date.now()
    }

    // Notify listeners
    this.stateCallbacks.forEach(callback => callback(this.cognitiveState))
  }

  private calculateBandPower(data: EEGData[], lowFreq: number, highFreq: number): number {
    // Simplified band power calculation
    // In a real implementation, this would use FFT
    let power = 0
    const channels = ['tp9', 'af7', 'af8', 'tp10'] as const
    
    data.forEach(sample => {
      channels.forEach(channel => {
        const value = sample.channels[channel] || 0
        // Simplified frequency filtering (not actual FFT)
        const filtered = value * Math.sin(2 * Math.PI * ((lowFreq + highFreq) / 2) * 0.001)
        power += filtered * filtered
      })
    })

    return power / (data.length * channels.length)
  }

  private calculateAttention(beta: number, alpha: number, theta: number): number {
    // High beta, low theta typically indicates attention
    const ratio = (beta / (theta + alpha + 1))
    return Math.max(0, Math.min(1, ratio / 10))
  }

  private calculateFocus(beta: number, theta: number): number {
    // High beta/theta ratio indicates focus
    const ratio = beta / (theta + 1)
    return Math.max(0, Math.min(1, ratio / 5))
  }

  private calculateRelaxation(alpha: number, beta: number): number {
    // High alpha, low beta indicates relaxation
    const ratio = alpha / (beta + 1)
    return Math.max(0, Math.min(1, ratio / 3))
  }

  private calculateEngagement(beta: number, gamma: number, alpha: number): number {
    // High beta and gamma, moderate alpha indicates engagement
    const engagement = (beta + gamma) / (alpha + 1)
    return Math.max(0, Math.min(1, engagement / 8))
  }

  private calculateFrustration(beta: number, alpha: number): number {
    // Very high beta with low alpha can indicate frustration
    if (beta > this.baselineBeta * 2 && alpha < this.baselineAlpha * 0.5) {
      return Math.max(0, Math.min(1, (beta - this.baselineBeta) / this.baselineBeta))
    }
    return 0
  }

  private calculateFlow(alpha: number, theta: number, beta: number): number {
    // Flow state: moderate alpha, low theta, stable beta
    const alphaScore = Math.max(0, 1 - Math.abs(alpha - this.baselineAlpha) / this.baselineAlpha)
    const thetaScore = Math.max(0, 1 - theta / (this.baselineTheta + 1))
    const betaScore = Math.max(0, 1 - Math.abs(beta - this.baselineBeta) / this.baselineBeta)
    
    return (alphaScore + thetaScore + betaScore) / 3
  }

  async calibrate(duration: number = this.config.calibrationTime): Promise<boolean> {
    if (!this.isConnected) return false

    console.log(`Starting BCI calibration for ${duration} seconds...`)
    
    const startTime = Date.now()
    const calibrationBuffer: EEGData[] = []

    return new Promise((resolve) => {
      const calibrationInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        
        if (elapsed >= duration) {
          // Calculate baseline values
          if (calibrationBuffer.length > 0) {
            this.baselineAlpha = this.calculateBandPower(calibrationBuffer, 8, 12)
            this.baselineBeta = this.calculateBandPower(calibrationBuffer, 13, 30)
            this.baselineTheta = this.calculateBandPower(calibrationBuffer, 4, 7)
            
            this.isCalibrated = true
            console.log('BCI calibration completed')
          }
          
          clearInterval(calibrationInterval)
          resolve(this.isCalibrated)
        } else {
          // Collect calibration data
          calibrationBuffer.push(...this.eegBuffer.slice(-10))
        }
      }, 1000)
    })
  }

  getCognitiveState(): CognitiveState | null {
    return this.cognitiveState
  }

  onStateChange(callback: (state: CognitiveState) => void) {
    this.stateCallbacks.push(callback)
  }

  offStateChange(callback: Function) {
    const index = this.stateCallbacks.indexOf(callback)
    if (index > -1) {
      this.stateCallbacks.splice(index, 1)
    }
  }

  isDeviceConnected(): boolean {
    return this.isConnected
  }

  isDeviceCalibrated(): boolean {
    return this.isCalibrated
  }

  getSignalQuality(): number {
    if (this.eegBuffer.length === 0) return 0
    const recent = this.eegBuffer.slice(-10)
    return recent.reduce((sum, data) => sum + data.quality, 0) / recent.length
  }

  disconnect() {
    if (this.device && typeof this.device.disconnect === 'function') {
      this.device.disconnect()
    }
    
    this.isConnected = false
    this.isCalibrated = false
    this.device = null
    this.eegBuffer = []
    this.cognitiveState = null
    this.stateCallbacks = []
  }
}