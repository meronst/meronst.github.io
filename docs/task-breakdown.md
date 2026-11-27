# meron.tours v3.0 — Task breakdown

Status: draft, 27/11/2026

Proposal for the Jira epic and its issues. Nothing is created in Jira until Meron approves it. Once the issues exist,
Jira is the source of truth for their status.

**Epic:** "v3.0 — Tour pages and online booking"

## Stories
Each story is at most one day. The acceptance criteria become its tests. Order matters: S1–S3 give a thin slice from a
data file to a checked, built tour page. The slice stops at the build because the site deploys only from `main`.

### Slice 1 — one tour from data to a checked build
**S1. Eleventy skeleton that keeps the current site** (labels: `build`, `slice-1`)
- `npm run build` produces `_site/` with every existing page and asset on the copy list, byte-identical to its source.
- A test fails if a required file is missing (home, about, lectures, tours pages, assets, images, fonts, robots.txt).
- `docs/`, `CLAUDE.md`, `README.md` and test files are not in `_site/`.
- The Eleventy version is locked; `Makefile` targets call the npm scripts.

**S2. Pre-merge gate** (`ci`, `slice-1`)
- `pre-merge.yml` runs the seven checks in architecture §7, with read-only permissions, plus the PR template.
- The RTL checker passes the allowed cases and fails the forbidden ones listed in the dev-workflow conventions, and
  checks only new and changed lines.
- A deliberately bad PR (no Jira key, one physical CSS class) fails. It is closed without merging.
- Needs Meron: create the `pre-merge gate` ruleset after the checks have run once.

**S3. First generated tour page: Mar Saba** (`tour-page`, `slice-1`)
- `src/tours/mar-saba.md` builds `/tours/mar-saba.html` with title, hero, detail chips and story.
- The page is `lang="he" dir="rtl"`; UI text comes from `strings.json`.
- HTML in a data field is escaped; the story body renders from Markdown.
- A smoke E2E test opens the page on phone and desktop.

### Slice 2 — complete pages from validated data
**S4. Tour data validation** (`data`, `slice-2`)
- Each failure case in architecture §3 stops the build with the file and field named, and has a unit test.
- `price`, `capacity` and `maxTickets` are rejected.

**S5. Full tour page** (`tour-page`, `slice-2`)
- All F1 sections show; optional gallery is left out cleanly when absent.
- Cancellation policy shows the placeholder; there is a "private group? request a quote" link.
- Booking box is in the side column on desktop and directly under the title on phone.
- Unique title, description, canonical URL and Open Graph image.
- No copy, right-click or keyboard blocking.
- Needs Meron: Mar Saba content and photos (M1).

**S6. Featured page and sitemap from data** (`listing`, `slice-2`)
- All eight current cards come from data files, in today's order and with today's text and images.
- A `page: true` card links to its page; the others link to the contact form.
- The tour count in both descriptions is calculated.
- The copy, right-click and keyboard blocking is gone.
- The sitemap keeps today's URLs and adds every tour page.
- The old root `featured.html` and `sitemap.xml` are removed. Cards added on `main` meanwhile are included.

### Slice 3 — booking
**S7. Booking states and sales guard** (`booking`, `slice-3`)
- The five states and their precedence match architecture §5, on the tour page and the featured card.
- Unit tests cover the day of the tour and the day after, in `Asia/Jerusalem`.
- The browser check switches an already-built page to Past.
- The widget is absent unless `salesOpen` and `cancellationPolicyFinal` are both true. A build test proves it, and the
  deploy workflow can't set the preview flag.

**S8. Tickchak booking box** (`booking`, `slice-3`) — blocked by M2
- The embed code from the test event lives in one include, keyed by `tickchakEvent`.
- It loads after the main content; if it fails, the contact link still shows.
- No other page loads the script. E2E tests use a stub.
- A manual check with the test event on a phone: inline display, Hebrew, payment methods offered.

**S9. Sold out and waiting list** (`booking`, `slice-3`) — blocked by M3
- `soldOut: true` shows "אזלו המקומות" on the page and the card.
- The waiting list (Tickchak's own, or the Google Form) is offered only in that state.
- The form fallback shows the purpose line.

### Slice 4 — ready to release
**S10. Accessibility and performance pass** (`quality`, `slice-4`)
- Automated accessibility checks pass on generated pages.
- A manual keyboard, screen reader and phone check against IS 5568 / WCAG 2.1 AA, including the real widget, is
  recorded. Each failure gets a bug ticket.
- On a phone, booking is reachable from the hero; gallery images load lazily; the widget doesn't delay first paint.

**S11. Deploy workflow and release preparation** (`release`, `slice-4`)
- `deploy.yml` tests, builds and deploys on a push to `main`.
- `_site/` is compared with the live site; every difference is expected and listed.
- README (run, publish a tour, deploy, roll back) and CHANGELOG are written.
- The cutover itself happens in Phase 5.

## Meron's tasks (Jira type: Task)
| ID | Task | Needed for |
|---|---|---|
| M1 | Mar Saba content: story, route, meeting point, difficulty, distance, ages, what to bring, suitability, photos with alt text | S3 (first draft), S5 |
| M2 | Create a Tickchak test event and send its embed code and event code | S8 |
| M3 | Check Tickchak: native waiting list, sold-out display. If no waiting list, create the Google Form | S9 |
| M4 | Receipt and terminal: check with Tickchak and the accountant. A bad answer reopens ADR 0001, so check before S8 | opening sales |
| M5 | Final refund/cancellation text, checked against consumer protection law | opening sales |

## Bugs already known (Jira type: Bug)
| ID | Bug | Severity | Proposed fix |
|---|---|---|---|
| B1 | Live featured page: both descriptions say 7 tours, there are 8 | low | Hotfix to `main` now; S6 then calculates the count |
| B2 | `lectures.html` has 1,537 NUL bytes after `</html>`, so Git treats it as binary | low | Fix on the release branch with a regression test, after S2 |

## To decide with this approval
| # | Question | Proposal |
|---|---|---|
| 1 | The gate requires a Jira key in every PR title. What about `content/<slug>` PRs? | Exempt them, so publishing a tour doesn't need a ticket. The other checks still run. |
| 2 | B1 is on the live site, and there is no gate on `main` yet | Hotfix it now with a manual check. The regression test arrives with S6, which is later than the dev-workflow rule asks. |
