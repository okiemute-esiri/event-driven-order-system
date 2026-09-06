import { randomUUID } from "node:crypto";
import type { DomainEvent } from "../domain/events.js";
import type { InMemoryEventBus } from "../infrastructure/in-memory-event-bus.js";

export type OrderStatus = "PENDING" | "INVENTORY_RESERVED" | "REJECTED";

export interface Order {
  id: string;
  sku: string;
  quantity: number;
  status: OrderStatus;
  rejectionReason?: string | undefined;
}

export class OrderService {
  private readonly orders = new Map<string, Order>();
  private readonly processedEvents = new Set<string>();

  constructor(private readonly bus: InMemoryEventBus) {}

  async createOrder(sku: string, quantity: number): Promise<Order> {
    if (!sku.trim()) throw new Error("SKU is required");
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }

    const order: Order = {
      id: randomUUID(),
      sku: sku.trim(),
      quantity,
      status: "PENDING"
    };
    this.orders.set(order.id, order);

    await this.bus.publish({
      id: randomUUID(),
      type: "OrderCreated",
      occurredAt: new Date().toISOString(),
      correlationId: order.id,
      payload: { orderId: order.id, sku: order.sku, quantity: order.quantity }
    });

    return this.getOrder(order.id)!;
  }

  async handleInventoryEvent(event: DomainEvent): Promise<void> {
    if (event.type !== "InventoryReserved" && event.type !== "InventoryRejected") return;
    if (this.processedEvents.has(event.id)) return;

    const order = this.orders.get(event.payload.orderId);
    if (!order) return;

    if (event.type === "InventoryReserved") {
      this.orders.set(order.id, { ...order, status: "INVENTORY_RESERVED" });
    } else {
      this.orders.set(order.id, {
        ...order,
        status: "REJECTED",
        rejectionReason: event.payload.reason
      });
    }

    this.processedEvents.add(event.id);
  }

  getOrder(id: string): Order | undefined {
    const order = this.orders.get(id);
    return order ? { ...order } : undefined;
  }
}
