# Tech Idea 3: Data integrity, migrations, and backups

**Goal:** Ensure user data (cards, snapshots, goals, etc.) is safe, consistent, and recoverable, and that schema changes can be applied without breaking production.

**What we build**
- **Migration workflow**:
  - Standard way to create and run Prisma migrations across environments.
  - Versioned schema changes with rollback strategy.
- **Backups**:
  - Automated daily backups of the production database.
  - Documented restore process and tested recovery.
- **Data integrity checks**:
  - Basic constraints and indexes (e.g. unique per user/card name where appropriate).
  - Periodic sanity check scripts or jobs (e.g. no negative points, orphaned records).

**Data / infra**
- Uses existing Postgres/Prisma setup.
- Backup configured via DB provider (e.g. managed Postgres) or scheduled job.

**Phases**
1. **Migrations**
   - Define process: `prisma migrate dev` for dev, `prisma migrate deploy` in prod.
   - Add instructions in `DEPLOYMENT.md`.
2. **Backups**
   - Enable automatic backups on production DB.
   - Document and test restore to staging.
3. **Integrity checks (optional)**
   - Scripts or cron to flag suspicious data (e.g. duplicate cards, invalid dates).

**Dependencies:** Stable DB provider and environment separation.

