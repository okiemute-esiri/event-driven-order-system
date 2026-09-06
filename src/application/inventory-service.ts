import { randomUUID } from "node:crypto";
import type { DomainEvent } from "../domain/events.js";
import type { InMemoryEventBus } from "../infrastructure/in-memory-event-bus.js";

export class InventoryService {
  private readonly stock = new Map<string, number>();
  private readonly processedEvents = new Set<string>();

  constructor(private readonly bus: InMemoryEventBus) {}

  setStock(sku: string, quantity: number): void {
    if (!sku.trim()) throw new Error("SKU is required");
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Stock must be a non-negative integer");
    }
    this.stock.set(sku.trim(), quantity);
  }

  getStock(sku: string): number {
    return this.stock.get(sku) ?? 0;
  }

  async handle(event: DomainEvent): Promise<void> {
    if (event.type !== "OrderCreated") return;
    if (this.processedEvents.has(event.id)) return;

    const available = this.getStock(event.payload.sku);
    if (available >= event.payload.quantity) {
      this.stock.set(event.payload.sku, available - event.payload.quantity);
      this.processedEvents.add(event.id);
      await this.bus.publish({
        id: randomUUID(),
        type: "InventoryReserved",
        occurredAt: new Date().toISOString(),
        correlationId: event.correlationId,
        payload: event.payload
      });
      return;
    }

    this.processedEvents.add(event.id);
    await this.bus.publish({
      id: randomUUID(),
      type: "InventoryRejected",
      occurredAt: new Date().toISOString(),
      correlationId: event.correlationId,
      payload: {
        ...event.payload,
        reason: "Insufficient inventory"
      }
    });
  }
}
