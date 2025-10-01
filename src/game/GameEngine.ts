/**
 * Core Game Engine for FinanceQuest
 * Implements Entity-Component-System architecture for scalable game development
 */

export interface GameEntity {
  id: string
  components: Map<string, any>
}

export interface GameComponent {
  type: string
  data: any
}

export interface GameSystem {
  name: string
  update(entities: GameEntity[], deltaTime: number): void
  requiredComponents: string[]
}

export class GameEngine {
  private entities: Map<string, GameEntity> = new Map()
  private systems: GameSystem[] = []
  private running = false
  private lastTime = 0

  // Entity management
  createEntity(id: string): GameEntity {
    const entity: GameEntity = {
      id,
      components: new Map()
    }
    this.entities.set(id, entity)
    return entity
  }

  removeEntity(id: string): void {
    this.entities.delete(id)
  }

  getEntity(id: string): GameEntity | undefined {
    return this.entities.get(id)
  }

  // Component management
  addComponent(entityId: string, component: GameComponent): void {
    const entity = this.entities.get(entityId)
    if (entity) {
      entity.components.set(component.type, component.data)
    }
  }

  removeComponent(entityId: string, componentType: string): void {
    const entity = this.entities.get(entityId)
    if (entity) {
      entity.components.delete(componentType)
    }
  }

  getComponent(entityId: string, componentType: string): any {
    const entity = this.entities.get(entityId)
    return entity?.components.get(componentType)
  }

  // System management
  addSystem(system: GameSystem): void {
    this.systems.push(system)
  }

  removeSystem(systemName: string): void {
    this.systems = this.systems.filter(s => s.name !== systemName)
  }

  // Query entities with specific components
  queryEntities(componentTypes: string[]): GameEntity[] {
    return Array.from(this.entities.values()).filter(entity => 
      componentTypes.every(type => entity.components.has(type))
    )
  }

  // Game loop
  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.gameLoop()
  }

  stop(): void {
    this.running = false
  }

  private gameLoop = (): void => {
    if (!this.running) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // Update all systems
    this.systems.forEach(system => {
      const relevantEntities = this.queryEntities(system.requiredComponents)
      system.update(relevantEntities, deltaTime)
    })

    requestAnimationFrame(this.gameLoop)
  }

  // Event system
  private eventListeners: Map<string, Function[]> = new Map()

  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }
}