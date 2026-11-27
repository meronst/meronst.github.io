# ADR 0002 — Tour page generator and deployment: Eleventy + GitHub Actions

Status: accepted, 27/11/2026

This is also the project's stack decision. The TypeScript and Python app stacks in the dev-workflow conventions don't
apply: v3.0 has no backend or database.

## Context
- v3.0 needs one template and one data file per tour (requirements §3). It generates the tour pages, the featured page
  and the sitemap (F1, F5, F6).
- The site is static HTML on GitHub Pages. Today Pages publishes the root of `main` with its branch-based Jekyll build.
- The existing hand-written pages should not need rewriting.
- Bad tour data must stop the build, not reach the live site. Prices and capacity must never appear in tour data (ADR 0001).
- Meron's PC has Node 24 and Python 3.14, but no Ruby and no `make`.

## Options considered
| | A. Own build script + Actions | B. Jekyll | C. Eleventy + Actions |
|---|---|---|---|
| Templates, data files, collections | We write them | Built in (Liquid) | Built in (Nunjucks, front matter) |
| HTML escaping | We must get it right | `escape` filter, added per value | Nunjucks auto-escape (we test it) |
| Local preview on this PC | We write watch/serve | Needs Ruby installed | `npx @11ty/eleventy --serve` |
| Data validation | Plain JS in the build | Separate script and CI step | Plain JS run by the build |
| Dependencies | Few or none | Ruby gems | One main npm package (and what it pulls in) |
| Deploy | Our workflow | Built-in Pages build, no workflow | Our workflow |
| What gets published | Only what we copy | Whole repo except exclusions | Only what we copy |
| Learning | Plain JS, but home-made conventions | Ruby ecosystem, Liquid | JS, widely used conventions |

**A** has the fewest dependencies, but we would be writing and testing a small site generator: templating, escaping,
Markdown, a preview server.

**B** is the least infrastructure: GitHub already runs it. But local preview needs a Ruby toolchain. It publishes
by exclusion, so a new internal file is public until someone excludes it. GitHub Pages' default plugins render
Markdown files even without front matter, so `docs/` and `CLAUDE.md` would need to be excluded explicitly. (Jekyll
can also run in Actions, but then it loses its main advantage.)

**C** gives templating and collections without writing them, in the same language as our tests.

Also rejected: running a generator locally and committing the generated HTML. It needs no deploy change, but the
output can drift from the data, every content change creates noisy diffs, and publishing depends on one PC.

## Decision
**Eleventy 3** (3.1.8 was current on npm on 27/11/2026; exact version locked in `package-lock.json`), deployed by a
**GitHub Actions** workflow (`upload-pages-artifact` + `deploy-pages`).

- Eleventy builds only what is under `src/`, plus an **explicit list** of existing files that it copies unchanged.
- Existing pages stay where they are. Only `tours/featured.html` moves to a template.
- Tour data is one Markdown file per tour: YAML front matter for fields, body for the story.

## Consequences
- The Pages source must be switched from "Deploy from a branch" to "GitHub Actions". Only Meron can do this, at release
  (see architecture §7).
- With Actions deployment GitHub ignores the `CNAME` file. The custom domain comes from the repository's Pages
  settings, where it must be checked at cutover.
- `docs/`, `CLAUDE.md` and `README.md` stop being served from meron.tours. They stay readable on GitHub, because the
  repository is public. (`README.md` is served from the site today.)
- A new public file must be added to the copy list. A build test compares the output with a list of required files.
- Publishing a tour now depends on Actions. If a build fails, the last deployed site stays up.
- Node and npm become project requirements, with dependency updates to maintain.
- No change in hosting cost.
- If we drop Eleventy later, tour data stays as Markdown + YAML and the output stays plain HTML.

## References
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [jekyll-optional-front-matter](https://github.com/benbalter/jekyll-optional-front-matter)
