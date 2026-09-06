import { describe, expect, it } from "vitest";
import { createOrderSystem } from "../src/system.js";

describe("event-driven order flow", () => {
  it("reserves inventory and advances order state", async () => {
    const { orders, inventory } = createOrderSystem();
    inventory.setStock("SKU-1", 5);

    const order = await orders.createOrder("SKU-1", 2);

    expect(order.status).toBe("INVENTORY_RESERVED");
    expect(inventory.getStock("SKU-1")).toBe(3);
  });

  it("rejects an order when inventory is insufficient", async () => {
    const { orders, inventory } = createOrderSystem();
    inventory.setStock("SKU-2", 1);

    const order = await orders.createOrder("SKU-2", 3);

    expect(order.status).toBe("REJECTED");
    expect(order.rejectionReason).toBe("Insufficient inventory");
    expect(inventory.getStock("SKU-2")).toBe(1);
  });

  it("does not reserve inventory twice for a duplicate OrderCreated event", async () => {
    const { bus, inventory } = createOrderSystem();
    inventory.setStock("SKU-3", 10);

    const event = {
      id: "event-1",
      type: "OrderCreated" as const,
      occurredAt: new Date().toISOString(),
      correlationId: "order-1",
      payload: { orderId: "order-1", sku: "SKU-3", quantity: 4 }
    };

    await bus.publish(event);
    await bus.publish(event);

    expect(inventory.getStock("SKU-3")).toBe(6);
  });

  it("validates order quantities", async () => {
    const { orders } = createOrderSystem();
    await expect(orders.createOrder("SKU-4", 0)).rejects.toThrow(
      "Quantity must be a positive integer"
    );
  });
});
