export type EntityId = number;

export interface Entity {
  id: EntityId;
  components: Record<string, any>;
}
