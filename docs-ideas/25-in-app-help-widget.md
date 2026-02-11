# Idea 25: In-app help & support widget

**Goal:** Provide a lightweight, always-available **Help** button in the app (bottom-right widget) so users can quickly access FAQs, contact support, or send feedback without leaving the dashboard.

**What we build**
- A persistent **“Help”** button on the bottom-right of the app:
  - Opens a panel with:
    - Short **FAQ** or “Getting started” links (e.g. how to add cards, how to track bonuses, how travel goals work).
    - **Contact / feedback form** (subject + message; optionally include technical info like browser, app version).
    - Links to external docs or blog posts (e.g. “How to hit minimum spend safely”).
- Optional future integrations:
  - Third-party support tools (e.g. Intercom, Crisp) instead of custom form.
  - Simple in-app chat history if you build your own messaging.

**Data**
- Minimal for MVP:
  - `SupportTicket` or `Feedback` table: `id`, `userId`, `type` (bug, question, idea), `subject`, `body`, `status`, `createdAt`, `handledBy`, `handledAt`.
  - Optional: store FAQ entries in a `HelpArticle` table (title, slug, body) or read from markdown files.

**Phases**
1. **MVP Help widget**:
   - Floating button → panel with:
     - Static FAQ links (to docs or blog).
     - Simple feedback form (sends email or creates a support ticket record).
2. **Admin handling**:
   - Basic admin view of tickets (list + detail, mark as handled).
   - Email notifications to you/team when new ticket created.
3. **Enhanced help (optional)**:
   - Searchable FAQs or help center.
   - Integration with external support/chat tools.
   - Contextual help (e.g. open widget with specific article when user is on certain page).

**Dependencies:** Email sending or internal admin tooling for handling tickets; content for FAQs or docs; design for floating widget and panel.

