# Tech Idea 6: Email infrastructure and background jobs

**Goal:** Provide a shared, reliable way to send emails and run scheduled/background jobs for features like points expiry alerts, email digests, reports, and partner offers.

**What we build**
- **Email sending abstraction:**
  - Wrap a provider (e.g. Resend, SendGrid, SES) behind a simple service (`sendEmail(to, template, data)`).
  - Central place for templates (welcome, expiry alert, digest, support, etc.).
- **Background job runner:**
  - Minimal cron/scheduler setup (can start with a simple Node cron library or platform scheduler).
  - Jobs for “points expiry alerts due today”, “send weekly/monthly digest”, “generate scheduled reports” and similar.
- **Configuration & observability:**
  - Retry strategy and logging for failed emails/jobs.
  - Feature flags to disable certain jobs in early environments.

**Data / infra**
- Uses existing DB models (e.g. expiry records, digests preferences).
- Needs:
  - Email provider account + API key in environment variables.
  - Scheduling mechanism (cron in Node, platform-specific jobs, or external scheduler).

**Phases**
1. **MVP email + cron (OK to ship early)**
   - Implement a simple email service using a single provider.
   - Use a basic cron/job library in the backend to run daily/weekly tasks.
2. **Consolidate jobs**
   - Move all feature-specific cron logic (expiry alerts, email digest, reports) behind a shared job registration pattern.
   - Add structured logging for runs and failures.
3. **Hardening (optional)**
   - Add idempotency guards for jobs.
   - Central dashboard/endpoint to see last run status per job.

**Dependencies:** Core platform readiness (env vars, production deployment); observability for logging job results.

