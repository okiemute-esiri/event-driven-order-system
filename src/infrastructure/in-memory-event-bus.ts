import type { DomainEvent } from "../domain/events.js";

export type EventHandler = (event: DomainEvent) => Promise<void>;

export class InMemoryEventBus {
  private readonly handlers = new Map<DomainEvent["type"], EventHandler[]>();

  subscribe(type: DomainEvent["type"], handler: EventHandler): void {
    const current = this.handlers.get(type) ?? [];
    current.push(handler);
    this.handlers.set(type, current);
  }

  async publish(event: DomainEvent): Promise<void> {
    for (const handler of this.handlers.get(event.type) ?? []) {
      await handler(event);
    }
  }
}
