export type OrderCreated = {
  orderId: string;
  sku: string;
  quantity: number;
};

export type InventoryReserved = {
  orderId: string;
  sku: string;
  quantity: number;
};

export type InventoryRejected = {
  orderId: string;
  sku: string;
  quantity: number;
  reason: string;
};

export type DomainEvent =
  | EventEnvelope<"OrderCreated", OrderCreated>
  | EventEnvelope<"InventoryReserved", InventoryReserved>
  | EventEnvelope<"InventoryRejected", InventoryRejected>;

export interface EventEnvelope<TType extends string, TPayload> {
  id: string;
  type: TType;
  occurredAt: string;
  correlationId: string;
  payload: TPayload;
}
