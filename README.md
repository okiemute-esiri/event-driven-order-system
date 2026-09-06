# Event-Driven Order System

A TypeScript backend project demonstrating asynchronous domain events, service boundaries, consumer idempotency, inventory reservation and order-state transitions.

## Status

This repository contains a working in-memory event-driven implementation suitable for exercising the coordination model without external infrastructure. Kafka/RabbitMQ, PostgreSQL, transactional outbox persistence, retries and dead-letter queues remain production-evolution items and are not claimed as implemented.

## Architecture

```text
OrderService
   |
   | OrderCreated
   v
InMemoryEventBus
   |
   v
InventoryService
   |
   +-- InventoryReserved
   `-- InventoryRejected
          |
          v
      OrderService
          |
          v
     order state update
```

## Implemented

- strict TypeScript configuration
- versioned event-envelope model
- `OrderCreated`, `InventoryReserved` and `InventoryRejected` contracts
- in-memory event bus with typed subscriptions
- order creation and state transitions
- inventory reservation and rejection logic
- duplicate-event idempotency in the inventory consumer
- duplicate-result idempotency in the order consumer
- correlation IDs propagated across events
- input validation for order quantities and stock values
- automated tests for success, rejection and duplicate delivery
- runnable demonstration flow
- multi-stage non-root Docker image
- GitHub Actions CI with typecheck, tests, build and Docker verification

## Reliability Semantics

The current implementation deliberately models **at-least-once delivery**. Consumers track processed event IDs so replaying the same `OrderCreated` event does not decrement inventory twice. This demonstrates the consumer-side idempotency requirement that remains necessary even when a production broker provides durable delivery.

The in-memory processed-event registry is process-local. A production implementation would persist idempotency records transactionally with domain state.

## Run

```bash
npm install
npm run typecheck
npm test
npm run build
npm run demo
```

The compiled demo can be started with:

```bash
npm start
```

## Repository Structure

```text
src/
├── application/
│   ├── inventory-service.ts
│   └── order-service.ts
├── domain/
│   └── events.ts
├── infrastructure/
│   └── in-memory-event-bus.ts
├── system.ts
└── demo.ts

tests/
└── order-flow.test.ts
```

## Production Evolution

Planned extensions include a durable message broker, PostgreSQL persistence, transactional outbox/inbox tables, consumer retry policy, dead-letter handling, schema versioning, observability, distributed tracing, service deployment manifests and broker/database integration tests.

## Portfolio Focus

The project demonstrates event-driven backend reasoning rather than merely publishing messages: bounded service responsibilities, asynchronous state progression, event contracts, correlation, idempotent consumers and failure-aware design.
