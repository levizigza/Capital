import type { Entity } from './Entity';

export type System = (entities: Entity[], delta: number) => void;
