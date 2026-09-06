import { InventoryService } from "./application/inventory-service.js";
import { OrderService } from "./application/order-service.js";
import { InMemoryEventBus } from "./infrastructure/in-memory-event-bus.js";

export function createOrderSystem() {
  const bus = new InMemoryEventBus();
  const orders = new OrderService(bus);
  const inventory = new InventoryService(bus);

  bus.subscribe("OrderCreated", (event) => inventory.handle(event));
  bus.subscribe("InventoryReserved", (event) => orders.handleInventoryEvent(event));
  bus.subscribe("InventoryRejected", (event) => orders.handleInventoryEvent(event));

  return { bus, orders, inventory };
}
