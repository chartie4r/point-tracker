# Idea 1: Points expiry alerts

**Goal:** Help users not lose points: they set an expiry date per program (or per card), and get reminded by email or in-app before points expire.

**What we build**
- User can set "Points expire on [date]" per points program (e.g. Aeroplan, Marriott) or per card.
- Optional: "Estimated balance" or note (e.g. "~50k Aeroplan").
- Reminders: e.g. 30 days, 7 days, 1 day before expiry (configurable).
- Delivery: in-app notification and/or email (if we have email sending).

**Data**
- New: `PointsExpiry` or extend user/card — program, expiry date, optional balance note, reminder preferences (which offsets to send).
- Need: email sending (e.g. Resend, SendGrid) or in-app only at first.

**Phases**
1. Data model + UI to add/edit/delete expiry dates per program.
2. Cron or scheduled job: "reminders due today" → send email or create in-app notifications.
3. In-app notification center (if not exists) and email templates.

**Dependencies:** Email service for email reminders; optional notification system.
