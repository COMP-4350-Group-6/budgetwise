# Testing Plan (Overview)

## Strategy

We design tests around **contracts first** (ports) so adapters can be implemented and tested independently. Each port defines a contract; we write:

- **Contract tests** (against ports) to lock behavior.
- **Adapter tests** (in-memory, persistence, system) against those contracts.
- **Use case tests** that orchestrate domain + ports.
- **Composition/integration tests** that boot the container and exercise flows.
- **API route tests** that call the Hono app (Cloudflare Worker runtime) end-to-end without external deps.
- **Frontend tests** that validate:
  - The UI renders the correct pieces for each screen, and
  - Data from the API matches the expected schema/shape before use in components.
