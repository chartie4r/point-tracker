# Tech Idea 2: Observability (logging, monitoring, alerts)

**Goal:** Make it easy to understand what is happening in production and react to issues quickly using structured logs, basic metrics, and alerts.

**What we build**
- **Structured logging** in backend:
  - Use a logger (e.g. pino/winston) with consistent context (request id, user id, route).
  - Log at appropriate levels (info, warn, error) with JSON output for aggregation.
- **Error tracking**:
  - Capture unhandled exceptions and rejected promises and send them to a service (e.g. Sentry) or a custom “error events” store.
- **Health checks & basic metrics**:
  - Health endpoint for uptime monitors.
  - Basic metrics like request rate, error rate, and latency (through logs or a simple metrics endpoint).

**Data / infra**
- No new business data; may use:
  - Log sink (e.g. hosted log service or cloud provider logs).
  - Error tracking service credentials.

**Phases**
1. **Logging**
   - Introduce a central logger module.
   - Log incoming requests (method, path, status, duration) and key business events.
2. **Error tracking**
   - Global error handlers in Express (backend) and error boundaries in Vue (frontend).
   - Integrate with chosen error tracking service.
3. **Monitoring & alerts**
   - Configure uptime checks on backend/frontend.
   - Add simple alerts (e.g. if error rate spikes or app is down).

**Dependencies:** Production deployment in place; secrets for any third-party services.

