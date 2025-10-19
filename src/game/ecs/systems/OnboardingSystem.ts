import type { Entity } from '../Entity';
import type { OnboardingComponent } from '../components/Onboarding';

export function OnboardingSystem(entities: Entity[], onComplete: (entity: Entity) => void) {
  for (const entity of entities) {
    const onboarding = entity.components['onboarding'] as OnboardingComponent | undefined;
    if (onboarding && !onboarding.completed) {
      // Example: complete onboarding after step 3
      if (onboarding.step >= 3) {
        onboarding.completed = true;
        onComplete(entity);
      }
    }
  }
}
