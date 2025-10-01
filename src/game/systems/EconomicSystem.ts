/**
 * Economic System - Manages market conditions, inflation, and economic events
 */

import { GameSystem, GameEntity } from '../GameEngine'

export interface MarketCondition {
  stockMarketTrend: 'bull' | 'bear' | 'sideways'
  interestRate: number // 0-1 (0-100%)
  inflationRate: number // 0-1 (0-100%)
  unemploymentRate: number // 0-1 (0-100%)
  economicEvent?: EconomicEvent
}

export interface EconomicEvent {
  type: 'recession' | 'boom' | 'crisis' | 'opportunity'
  name: string
  description: string
  duration: number // milliseconds
  effects: {
    incomeMultiplier?: number
    expenseMultiplier?: number
    assetValueMultiplier?: number
    jobAvailability?: number
  }
}

export class EconomicSystem implements GameSystem {
  name = 'EconomicSystem'
  requiredComponents = ['economy']
  
  private currentConditions: MarketCondition = {
    stockMarketTrend: 'sideways',
    interestRate: 0.03,
    inflationRate: 0.02,
    unemploymentRate: 0.05
  }

  private eventTimer = 0
  private readonly EVENT_FREQUENCY = 30000 // 30 seconds between potential events

  update(entities: GameEntity[], deltaTime: number): void {
    this.eventTimer += deltaTime

    entities.forEach(entity => {
      const economy = entity.components.get('economy')
      if (economy) {
        // Update market conditions gradually
        this.updateMarketConditions(deltaTime)
        
        // Check for economic events
        if (this.eventTimer >= this.EVENT_FREQUENCY) {
          this.checkForEconomicEvents()
          this.eventTimer = 0
        }

        // Apply current conditions to entity
        entity.components.set('economy', {
          ...economy,
          conditions: this.currentConditions
        })
      }
    })
  }

  private updateMarketConditions(deltaTime: number): void {
    // Simulate gradual market changes
    const changeRate = deltaTime / 60000 // Per minute

    // Interest rate fluctuation (0.1% - 8%)
    this.currentConditions.interestRate += (Math.random() - 0.5) * 0.001 * changeRate
    this.currentConditions.interestRate = Math.max(0.001, Math.min(0.08, this.currentConditions.interestRate))

    // Inflation rate fluctuation (-1% to 6%)
    this.currentConditions.inflationRate += (Math.random() - 0.5) * 0.002 * changeRate
    this.currentConditions.inflationRate = Math.max(-0.01, Math.min(0.06, this.currentConditions.inflationRate))

    // Stock market trend shifts
    if (Math.random() < 0.01 * changeRate) { // 1% chance per minute
      const trends: MarketCondition['stockMarketTrend'][] = ['bull', 'bear', 'sideways']
      this.currentConditions.stockMarketTrend = trends[Math.floor(Math.random() * trends.length)]
    }
  }

  private checkForEconomicEvents(): void {
    // 10% chance of economic event
    if (Math.random() < 0.1) {
      const events: EconomicEvent[] = [
        {
          type: 'recession',
          name: 'Economic Downturn',
          description: 'The economy is experiencing a downturn. Income may decrease and expenses may rise.',
          duration: 45000, // 45 seconds
          effects: {
            incomeMultiplier: 0.8,
            expenseMultiplier: 1.1,
            assetValueMultiplier: 0.9,
            jobAvailability: 0.7
          }
        },
        {
          type: 'boom',
          name: 'Economic Boom',
          description: 'The economy is thriving! Higher incomes and better investment returns.',
          duration: 60000, // 1 minute
          effects: {
            incomeMultiplier: 1.3,
            assetValueMultiplier: 1.2,
            jobAvailability: 1.4
          }
        },
        {
          type: 'crisis',
          name: 'Market Crash',
          description: 'Stock markets are crashing! Asset values are plummeting.',
          duration: 30000, // 30 seconds
          effects: {
            assetValueMultiplier: 0.6,
            expenseMultiplier: 1.2
          }
        },
        {
          type: 'opportunity',
          name: 'Investment Opportunity',
          description: 'A rare investment opportunity has appeared! Act quickly for higher returns.',
          duration: 20000, // 20 seconds
          effects: {
            assetValueMultiplier: 1.5
          }
        }
      ]

      const selectedEvent = events[Math.floor(Math.random() * events.length)]
      this.currentConditions.economicEvent = selectedEvent

      // Clear event after duration
      setTimeout(() => {
        this.currentConditions.economicEvent = undefined
      }, selectedEvent.duration)
    }
  }

  getCurrentConditions(): MarketCondition {
    return { ...this.currentConditions }
  }

  triggerEvent(event: EconomicEvent): void {
    this.currentConditions.economicEvent = event
    setTimeout(() => {
      this.currentConditions.economicEvent = undefined
    }, event.duration)
  }
}