# Tech Idea 4: Authentication, security, and privacy

**Goal:** Harden authentication and authorization, and handle user data in a way that respects privacy and basic compliance expectations.

**What we build**
- **Auth hardening**:
  - Review password reset, session handling, and JWT/cookie setup.
  - Add protections like rate limiting on login, lockout after repeated failures, and secure cookie flags.
- **Authorization checks**:
  - Ensure all API routes that modify or read user-specific data correctly enforce `userId` scoping.
- **Privacy & data handling**:
  - Simple privacy policy and terms of service.
  - Ability for user to delete their account and data (subject to legal constraints).

**Data / infra**
- Uses existing User model and auth middleware.
- May add audit logs for key security events (login, password reset, data export, account deletion).

**Phases**
1. **Review & patch auth flows**
   - Threat model for current routes.
   - Implement rate limiting for auth endpoints and secure cookie settings in production.
2. **Authorization audit**
   - Check all backend routes for proper access control.
   - Add tests to ensure users cannot access each other’s resources.
3. **Privacy features**
   - Implement account deletion flow.
   - Publish minimal privacy policy and terms; link from app.

**Dependencies:** Logging/monitoring to observe auth-related issues; deployment platform supporting HTTPS.

