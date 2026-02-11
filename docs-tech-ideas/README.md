# docs-tech-ideas – Technical roadmap for production readiness

This folder contains **technical ideas and plans** that are required (or strongly recommended) to make PointTracker production-ready. Each doc follows a similar structure to the feature ideas: **Goal / What we build / Data or infra / Phases / Dependencies**.

## Current tech ideas (implementation order T1 → T6)

- `01-core-platform-readiness.md` – Environments, configuration, basic security, and build/deploy baseline.  
- `02-data-integrity-backups-migrations.md` – Prisma migrations, backups, and data integrity checks.  
- `03-auth-security-privacy.md` – Authentication hardening, authorization audit, and privacy basics (account deletion, policies).  
- `04-testing-and-quality-gates.md` – Automated tests and CI quality gates before deploy.  
- `05-observability-logging-monitoring.md` – Structured logging, error tracking, monitoring, and alerts.  
- `06-email-and-background-jobs.md` – Shared email service and background job scheduling for alerts, digests, and scheduled tasks.  
- `07-earn-rate-matrix-and-spend-optimizer.md` – Technical companion to feature idea 27 (earn-rate matrix & spend optimizer).

Add more docs here as you discover additional technical gaps (e.g. performance, advanced scaling, or multi-region setups).

