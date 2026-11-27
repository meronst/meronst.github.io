# ADR 0001 — Ticketing and payment provider: Tickchak

Status: accepted, 27/11/2026

## Context
v3.0 adds online registration + payment for open public tours. The site is static (GitHub Pages), so checkout must be
hosted by a provider and embedded/linked. Needs: price per person, max tickets, automatic sold out, waiting list,
participant list, Hebrew/mobile, Bit + cards.

## Options considered
| | Tickchak | Grow (Meshulam) | Cardcom | Paddle |
|---|---|---|---|---|
| Type | Ticketing platform | Payment page | Payment page | Merchant of record (software) |
| Fee | 5% per ticket | ~1.4% + payout fee (Morning "Extra" route) | Quote only | — |
| Max tickets / auto sold out | Yes | No | No | — |
| SMS ticket, reminder, attendee list | Yes | No | Partial | — |
| Automatic tax receipt | To confirm | Yes (via Morning) | Yes (built in) | — |
| Static-site embed | Script widget (form.loader.js) | Link | Link | — |
| Allowed for tours | Yes | Yes | Yes | **No** — AUP excludes human services |

## Decision
Tickchak. On a 20 × ₪150 tour it costs ~₪90 more than Grow, but it provides capacity, sold out, reminders and the
attendee list without any backend, plus exposure on its public listing site. Building those on Grow/Cardcom would need
a server and database.

## Consequences
- Prices, ticket types and max tickets live only in Tickchak; page data must not duplicate them.
- Revisit if public-tour revenue passes ~₪10,000/month (5% becomes material): switch the booking box to a cheaper
  payment page plus our own capacity logic (v4.0). Tour pages and data files stay the same.
- Meron absorbs the 5% (decided 27/11/2026).
- Open: receipt issuing and terminal, native waiting list, widget sold-out display (see requirements §8).
