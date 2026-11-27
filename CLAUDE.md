# CLAUDE.md — meron.tours

## Project
- What: Meron Statter's site — lectures and guided tours ("לטייל את הסיפור"). Static HTML on GitHub Pages, domain meron.tours.
- Users: individuals booking public tours; organizations (welfare managers, schools, senior clubs, Scouts) requesting lectures/tours.
- Jira: TBD (site/key to be provided)
- Current version: v3.0 — dedicated tour pages + Tickchak booking (payment, max tickets, sold out, waiting list). Branch: release/v3.0.
- Stack: static HTML/CSS + GitHub Pages; generator choice for tour pages decided in Phase 2 (docs/decisions/0002-*.md)
- Current phase: 1 Requirements — docs/requirements.md (approved 27/11/2026); Phase 2 not started, awaiting Meron's go-ahead

## Conventions
Follow the dev-workflow conventions: gated phases (wait for approval between phases); one Jira parent epic and one
release/vX.Y branch per version; Jira updated in real time; bug ticket opened before every fix, with a regression test;
branch per story off the version branch; conventional commits and PR titles with the Jira key; pre-merge gate
(.github/workflows/pre-merge.yml) green before any merge into release/* or main; Hebrew/RTL-first UI with logical CSS
properties; docs and ADRs updated in the same PR; secrets only in .env.

## Project-specific notes
- Ticketing/payment provider: Tickchak (5%). Prices, ticket types and max tickets live only in Tickchak — never duplicate them in page data.
- Online payment is for open public tours only; organizations get the quote/contact path.
- Line endings: `.gitattributes` forces LF (added on release/v3.0, 27/11/2026). It reaches main with the v3.0 release.
