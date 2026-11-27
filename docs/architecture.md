# meron.tours v3.0 — Architecture

Status: approved, 27/11/2026

Implements [requirements.md](requirements.md). Decisions: [ADR 0001](decisions/0001-ticketing-provider.md) (Tickchak),
[ADR 0002](decisions/0002-tour-page-generator.md) (Eleventy + GitHub Actions).

## 1. Components
```
src/tours/<slug>.md ─┐
src templates ───────┼─► validate ─► Eleventy build ─► _site/ ─► GitHub Actions ─► GitHub Pages (meron.tours)
existing pages ──────┘   (fails on bad data)          (only listed files)

Visitor's browser ─► tour page ─► Tickchak widget (registration + payment, hosted by Tickchak)
                               └► Google Form link (waiting list, only when sold out)
```

## 2. Repository layout
```
src/
  tours/<slug>.md            one data file per tour
  _data/site.json            site-wide settings (§4)
  _data/strings.json         Hebrew UI text used by the templates
  _includes/                 layout, header, footer, booking box, tour card, cancellation policy
  tour.njk                   tour page template   -> /tours/<slug>.html
  featured.njk               featured page        -> /tours/featured.html
  sitemap.njk                                     -> /sitemap.xml
lib/                         tour validation and booking-state logic (pure functions, unit-tested)
tests/                       unit and E2E tests
eleventy.config.js           copy list, collections, validation hook
index.html, about.html, lectures.html, tours.html, tours/{companies,events,seniors,youth}.html
assets/, images/, fonts/, robots.txt           copied unchanged
_site/                       build output, not committed
```
- The root `tours/featured.html` and `sitemap.xml` are removed once their templates produce them.
- The existing pages keep their own header and footer. Generated pages share one include, so a menu or footer change
  must be made in both until the old pages are converted (not part of v3.0).

## 3. Tour data model
The file name is the slug: `src/tours/mar-saba.md` → `/tours/mar-saba.html`. The body is the story.

| Field | Needed | Notes |
|---|---|---|
| `title` | always | |
| `location` | always | card and page label |
| `hook` | always | card text; bold allowed |
| `order` | always | position on the featured page; unique |
| `image` (`src`, `alt`) | always | card and hero |
| `page` | optional, default `false` | `false`: card only, linking to the contact form |
| `description` | if `page` | meta description |
| `ogImage` | optional | defaults to `image.src` |
| `meetingPoint`, `difficulty`, `distance`, `ages` | if `page` | detail chips |
| `route` (list) | if `page` | route of the day |
| `gallery` (list of `src`, `alt`) | optional | |
| `bring` (list), `suitability` | if `page` | "what to know" |
| `date`, `time` | optional, together | an open date; needs `page: true` |
| `tickchakEvent` | with a date | Tickchak event code |
| `soldOut` | optional, default `false` | needs a date |

Validation fails the build when:
- a required field is missing, or has the wrong type or date format;
- a field is **unknown**. This catches typos, and blocks `price`, `capacity`, `maxTickets` and similar (ADR 0001);
- a referenced image doesn't exist;
- `order` is used twice, or a slug is `featured`, `companies`, `events`, `seniors` or `youth`.

All eight current cards become data files. Seven stay `page: false`. The pilot, Mar Saba, gets `page: true`.
This keeps one source for the featured page. The card count in its description is then calculated; today it still
says 7 although there are 8 cards.

## 4. Site settings (`site.json`)
| Setting | Purpose |
|---|---|
| `salesOpen` | `false` until the checks in requirements §8 are done |
| `cancellationPolicyFinal` | `false` while the policy is a placeholder |
| `waitlist` | `google-form` or `tickchak`, plus the form URL |

**Sales guard:** the production build includes the Tickchak widget only if both `salesOpen` and
`cancellationPolicyFinal` are true. Otherwise the booking box says registration will open soon. A local preview flag
shows the widget for testing; the deploy workflow never sets it. This guard controls only our site: it can't stop
sales through a direct Tickchak link, so don't publish or share the event link before then.

## 5. Booking box states
| State | When | Booking box | Featured card |
|---|---|---|---|
| No date | no `date` | "next date" message + WhatsApp/contact link | no date, no badge |
| Coming soon | open date, sales guard off | "registration opens soon" + contact link | date, no badge |
| Open | open date, guard on | Tickchak widget | date + "להרשמה" |
| Sold out | `soldOut: true` | "אזלו המקומות" + waiting list | date + "אזלו המקומות" |
| Past | today is after `date` | "הסיור התקיים…" + contact link | no date, no badge |

Order of precedence: past, then sold out, then coming soon, then open. A tour with `page: false` is outside this table.

- **Past without a daily rebuild:** the build sets the state using the `Asia/Jerusalem` date. A small script on the
  tour and featured pages checks the date again in the browser, so the page changes on time even if nothing is
  redeployed. Without JavaScript the visitor sees the state from the last build. We don't rely on a scheduled workflow.
- If Tickchak shows sold out by itself, that also works while `soldOut` is still false. We have not confirmed this.
- With a native Tickchak waiting list, the sold-out state keeps whatever Tickchak needs to show it. The exact form
  depends on the §8 check.
- A new date for a past tour: update `date`, `time` and `tickchakEvent`, and reset `soldOut`. The URL stays the same.

## 6. External interfaces
No API or database of our own.

**Tickchak widget**
- All embed code lives in one include (`booking-box`), keyed by `tickchakEvent`.
- The exact markup is **not confirmed**. Tickchak's WordPress plugin names `tickchak.co.il/form.loader.js` and an event
  code, but that URL returned 404 to our page fetcher. Take the embed code from a test event in Meron's Tickchak account
  before building the booking box. Confirm it supports inline display and delayed loading.
- Loaded only in the Open state (and sold out, if needed), after the main content, so it doesn't delay first paint.
- If it doesn't load, the box still offers a contact link, plus a direct Tickchak link if the event has one.
- It is a third-party script on our page. It goes on no other pages.

**Waiting list (fallback):** a link to one Google Form (name, phone, number of places, tour). It shows a purpose line:
the details are used only to offer freed places, and are deleted after the tour date. Meron turns on the form's email
notification and does the deletion.

## 7. Build, tests and deployment
**Commands:** npm scripts do the work. A thin `Makefile` provides the dev-workflow targets for CI, since `make` isn't
installed locally.

**`pre-merge.yml`** (PRs into `release/**` and `main`):

| Check | Content |
|---|---|
| Conventions | branch name and PR title (needs the Jira key) |
| RTL | `scripts/rtl-check.mjs` on templates and changed CSS/HTML |
| Secret scan | gitleaks |
| Lint | JavaScript and generated HTML |
| Unit | validation, booking states, date boundaries, escaping, RTL checker |
| Build | production build; required files present, existing pages unchanged, internal links and sitemap valid, no widget while the sales guard is off |
| E2E | Playwright, `he-IL`, phone and desktop; automated accessibility checks; Tickchak replaced by a stub. Smoke for release PRs, full for `main` |

Differences from the dev-workflow gate: no database integration tests and no type check (plain JavaScript, no
database). `assets/site.css` already has physical left/right declarations, so the RTL check starts with new and changed
lines. Automated checks don't prove IS 5568 compliance: the pilot also gets a manual keyboard, screen reader and
phone check, including the real Tickchak widget.

**`deploy.yml`:** on push to `main`: install, test, build, upload `_site/`, deploy.

**Cutover at the v3.0 release (once):**
1. Build locally and compare `_site/` with the live site's pages.
2. Meron: Settings → Pages → Source → **GitHub Actions**.
3. Merge `release/v3.0` → `main`; the deploy workflow runs.
4. Check the custom domain and HTTPS in Pages settings, then smoke-test the old pages, the featured page, the pilot
   page and the sitemap.
5. Rollback: revert the release merge and set the Pages source back to the `main` branch.

Until the release, `main` keeps deploying as today. **A card added to `tours/featured.html` on `main` before then must
also be added as a tour data file on the release branch.**

## 8. Publishing a tour
1. Create the event in Tickchak.
2. Add or edit `src/tours/<slug>.md` and its images.
3. Open a PR. After the checks pass and it is merged to `main`, the site deploys.

Marking a tour sold out is the same flow with a one-line edit, which can be made in GitHub's web editor. It is not
instant: it waits for the checks and the deploy.

## 9. Non-functional
- **RTL and mobile:** `lang="he" dir="rtl"`, logical CSS properties, `<bdi>` around dates and times, dates shown as
  dd/MM/yyyy.
- **Booking on phones:** the box sits directly under the title. The hero is kept short, with a "להרשמה" button in it
  that jumps to the box, to meet "reachable without scrolling past the hero".
- **SEO:** unique title, description, canonical URL and Open Graph image per tour page; sitemap generated.
- **Performance:** sized, compressed images; lazy gallery; delayed Tickchak script.
- **Privacy:** meron.tours stores no booking data. No secrets are needed to build; the deploy uses GitHub's built-in
  token with only the Pages permissions it needs.

## 10. Hosting and cost
| Item | Cost |
|---|---|
| GitHub Pages and Actions (public repository, standard runners) | ₪0 |
| Eleventy, Playwright | ₪0 (open source) |
| Domain meron.tours | existing renewal, unchanged |
| Google Form | ₪0 |
| Tickchak | 5% per ticket, paid by Meron |

## 11. Decisions made at approval (27/11/2026)
| # | Question | Decision |
|---|---|---|
| 1 | `tours/featured.html` blocks copy, right-click and some keys, including print. Do generated pages do the same? | **No.** Tour pages don't block them, and the generated featured page drops the blocking: buyers need to copy the meeting point and print, and blocking keys can hurt accessibility. |
| 2 | How are tour data changes published after v3.0? | Short `content/<slug>` branch with a PR straight into `main`, without a version branch, then sync into any open release branch. |
