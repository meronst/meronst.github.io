# meron.tours v3.0 — Requirements

Status: draft, 27/11/2026

## 1. Purpose
Let people find a specific public tour on meron.tours, read about it on a dedicated page, and register and pay in one step,
without Meron reconciling payments by hand (today: Google Form + Paybox link, matched manually).

## 2. Users and roles
| Role | Who | Needs |
|---|---|---|
| Visitor / buyer | Individuals and families joining an open tour | Understand the tour, see date/price/places, pay fast on a phone |
| Organization buyer | Welfare managers, schools, senior clubs, Scout coordinators | Not online payment: a clear path to a quote/contact for a private group |
| Owner | Meron | Publish a tour by adding one data entry; see who registered; no manual payment matching |

## 3. Scope decisions (agreed)
- Online payment for **open public tours only** (fixed date, price per person, limited places). Private/company groups keep the quote/contact form.
- Ticketing and payment provider: **Tickchak** (5% fee). Tickchak hosts checkout; the site embeds its widget. No card data touches meron.tours.
- Registration and payment happen **in one step** inside the Tickchak form (name, phone, number of participants, payment).
- One **page template + one data file per tour**. Adding a tour = adding one entry; the page is generated from it.
- Site stays **static on GitHub Pages**. No backend in v3.0.

## 4. Features
### F1 — Dedicated tour page (template)
- URL per tour: `/tours/<slug>.html` (e.g. `/tours/emek-haela.html`).
- Sections: hero image + title, detail chips (date, time, meeting point, difficulty/distance, age), the story, route of the day,
  gallery, "what to know" (what to bring, suitability, cancellation policy), booking box, "private group? request a quote" link.
- Desktop: booking box in the side column. Phone: booking box directly under the title.
- SEO: unique `<title>`, description, Open Graph image per tour; tour added to `sitemap.xml`.

### F2 — Tickchak booking box
- Embedded Tickchak widget per tour, keyed by the tour's Tickchak event code.
- Ticket types and prices are defined **only in Tickchak** (single source of truth); the page does not duplicate them.
- Payment methods as offered by Tickchak (credit card, Bit, Apple/Google Pay — to be confirmed in setup).
- Buyer receives Tickchak's SMS + digital ticket + pre-tour reminder.

### F3 — Max tickets and sold out
- Max number of tickets is set per event in Tickchak.
- When sold out, Tickchak stops sales; the tour page shows a clear "אזלו המקומות" state and the waiting-list option (F4).

### F4 — Waiting list
- When a tour is sold out, the visitor can join a waiting list (name, phone, number of places).
- Preferred: Tickchak's own waiting list, if it has one. **Fallback:** a waiting-list form on the page (provider decided in Phase 2), shown only when the tour is sold out.
- Meron is notified of each waiting-list entry and offers freed places manually (in order of signup).

### F5 — Tour listing integration
- "סיורים נבחרים" (`/tours/featured.html`) cards link to the dedicated page; cards for tours with an open date show the date and a "להרשמה" badge.
- Past tours: page stays online (SEO), booking box replaced by "הסיור התקיים — רוצים לשמוע על המועד הבא?" + WhatsApp/contact link.

### F6 — Publishing a tour (owner flow)
1. Create the event in Tickchak (date, ticket types, prices, max tickets).
2. Add one data entry (slug, title, date, time, meeting point, difficulty, story, route, images, Tickchak event code).
3. Build/publish → page live, listed on the featured page and in the sitemap.

## 5. Non-functional
- Hebrew, RTL-first; CSS logical properties; fonts as in the current site (Assistant, Frank Ruhl Libre).
- Mobile-first: booking reachable without scrolling past the hero on a phone viewport.
- Accessibility: IS 5568 / WCAG 2.1 AA for everything we build (the embedded widget is Tickchak's responsibility, but we check it).
- Privacy: meron.tours collects no personal data for bookings (Tickchak does). The waiting-list fallback, if used, collects name + phone only, with a purpose line and deletion after the tour date.
- Performance: Tickchak script loaded lazily so it doesn't slow the first paint.
- No secrets in the repo.

## 6. Out of scope (v3.0)
- Our own backend, database or live seat counter.
- Online payment for private/company groups, lectures, or deposits.
- Coupons/discount logic beyond what Tickchak offers.
- Migrating past Paybox/Google Form registrations.

## 7. Open questions (to resolve before Phase 2 approval)
1. Does Tickchak offer a native waiting list? If not, which fallback form (Google Form / Tickchak free "registration" event / other)?
2. Who pays the 5%: Meron or the buyer (service fee)?
3. Who issues the tax receipt — Tickchak, or Meron's own system? Can Tickchak run on Meron's own terminal?
4. Refund/cancellation policy text (shown on every tour page).
5. Can the widget show "sold out" by itself, or does the page need a manual `soldOut` flag in the data file?
6. Which tour is the first one (pilot) for the thin end-to-end slice?
