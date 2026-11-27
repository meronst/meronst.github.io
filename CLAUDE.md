# CLAUDE.md — meron.tours

## Project
- What: Meron Statter's site — lectures and guided tours ("לטייל את הסיפור"). Static HTML on GitHub Pages, domain meron.tours.
- Users: individuals booking public tours; organizations (welfare managers, schools, senior clubs, Scouts) requesting lectures/tours.
- Jira: TBD (site/key to be provided)
- Current version: v3.0 — dedicated tour pages + Tickchak booking (payment, max tickets, sold out, waiting list). Branch: release/v3.0.
- Stack: static HTML/CSS + GitHub Pages; v3.0 moves to Eleventy 3 + GitHub Actions deploy (docs/decisions/0002-tour-page-generator.md)
- Current phase: 3 Task breakdown. Phases 1 and 2 approved 27/11/2026 (docs/requirements.md, docs/architecture.md).

## Conventions
Follow the dev-workflow conventions: gated phases (wait for approval between phases); one Jira parent epic and one
release/vX.Y branch per version; Jira updated in real time; bug ticket opened before every fix, with a regression test;
branch per story off the version branch; conventional commits and PR titles with the Jira key; pre-merge gate
(.github/workflows/pre-merge.yml) green before any merge into release/* or main; Hebrew/RTL-first UI with logical CSS
properties; docs and ADRs updated in the same PR; secrets only in .env.

## Project-specific notes
- Ticketing/payment provider: Tickchak (5%). Prices, ticket types and max tickets live only in Tickchak — never duplicate them in page data.
- Online payment is for open public tours only; organizations get the quote/contact path.
- After v3.0 is released, tour data changes go on a short `content/<slug>` branch with a PR straight into `main`, then are synced into any open release branch.
- Until the release: a card added to `tours/featured.html` on `main` must also become a tour data file on the release branch.
- No copy, right-click or keyboard blocking on tour pages or the generated featured page.
- Line endings: `.gitattributes` forces LF (added on release/v3.0, 27/11/2026). It reaches main with the v3.0 release.
