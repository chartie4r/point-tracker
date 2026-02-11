# Idea 8: Email digest (weekly / monthly)

**Goal:** Keep users engaged and informed: weekly or monthly email with summary of their cards, any catalogue changes (e.g. bonus improved for a card they have), and tips or product updates.

**What we build**
- User preference: "Email digest: Off / Weekly / Monthly".
- Content: (1) Your cards summary (count, recent snapshots); (2) "Catalogue updates" — e.g. bonus value changed for cards in catalogue (from Bonus Value Tracking); (3) Optional: one tip or link to blog/feature.
- Send via transactional email service (Resend, SendGrid, etc.).

**Data**
- User: digestFrequency (off | weekly | monthly), lastDigestSentAt. Templates for email body.

**Phases**
1. Digest content logic (what to include); template (HTML/text).
2. Cron job: "users who want weekly digest and last sent 7+ days ago" → send, update lastDigestSentAt.
3. Settings UI: toggle and frequency; optional "preview" button.

**Dependencies:** Email service; Bonus Value Tracking and catalogue data for "what changed".
