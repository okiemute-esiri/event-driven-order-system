import { createOrderSystem } from "./system.js";

const { orders, inventory } = createOrderSystem();
inventory.setStock("LAPTOP-001", 3);

const first = await orders.createOrder("LAPTOP-001", 2);
const second = await orders.createOrder("LAPTOP-001", 2);

console.log(JSON.stringify({ first, second, remainingStock: inventory.getStock("LAPTOP-001") }, null, 2));
