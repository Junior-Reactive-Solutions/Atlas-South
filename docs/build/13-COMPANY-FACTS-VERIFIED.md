# Company Facts — Verified From the Live Site

Single source of truth for every legal/contact fact used across the new site. Every
other build document and every page spec must pull NAP (Name/Address/Phone) and legal
details from **this file only** — the audit's #1 finding was inconsistent phone numbers
across pages, and that cannot recur in the rebuild.

Pulled directly from `atlassouthes.com` on 2026-07-30. Anything not confirmed on the live
site is marked **UNVERIFIED — confirm with client** and must not be invented.

## Confirmed facts

| Field | Value | Source |
|---|---|---|
| Trading name | Atlas South Technical Services | site-wide |
| Founded | 2018 (sole trader) | about.html |
| Incorporated | 2022, as a Limited company | about.html |
| Registered/trading address | 4th Floor, Silverstream House, 45 Fitzroy Street, Fitzrovia, London, W1T 6EB | contact-us.html |
| Primary phone (24/7) | **07778 858278** | site-wide (canonical format — see below) |
| Primary email | start@atlassouthes.com | forms, contact-us.html |
| WhatsApp | https://wa.me/447778858278 | homepage |
| Clients served | 700+ | homepage stats |
| Jobs completed | 12,000+ | homepage stats |
| Public liability insurance | £5 million | about.html |
| Certifications held | Gas Safe registered · Part P certified (electrical) · SIA licensed (security division) | about.html |
| Domain | atlassouthes.com | — |

## Canonical phone format (mandatory, single source)

The audit found **two different numbers** in **five formats** across the live site
(`07778 858278` and `020 335 52797`, plus inconsistent spacing on both). The rebuild uses
exactly one, defined once as a config constant, referenced everywhere via that constant —
never hand-typed on a page again:

```
Display format:  07778 858278
tel: href:       tel:+447778858278
WhatsApp:        https://wa.me/447778858278
```

If `020 335 52797` is actually a real, separate landline the client wants kept (e.g. for a
specific department), get that confirmed explicitly before launch — otherwise treat it as
the error the audit flagged and drop it.

## ⚠ Flagged for client confirmation — do not treat as fact

1. **Companies House registration number.** No number is published on the live site. A
   search of the public register found no exact match for "Atlas South Technical
   Services" — several unrelated "Atlas ..." companies exist under different names, none
   of which are confirmed as this business. **Do not fabricate a company number.** The
   Terms of Use / Privacy Policy will ship with a placeholder
   (`[Company registration number — TBC]`) until the client supplies the real one, or
   confirms the company is not yet incorporated as claimed.
2. **VAT number** — not published anywhere. Same placeholder treatment if the client is
   VAT-registered.
3. **`contact-us.html` contains content that reads as unedited template boilerplate**,
   not real Atlas South facts — flag before reusing any of it:
   - "Service discount up to 30% for any project"
   - "operating across 15+ Countries" (inconsistent with a London/South East trades
     business)
   - A testimonial: *"planned maintenance program cut our downtime by 60%"* — no
     attribution, doesn't match the reviews shown elsewhere on the site.
   - **Action:** exclude these three claims from the rebuild entirely unless the client
     explicitly confirms them as real. Do not carry unverifiable stats into a legal
     document or marketing page.
4. **"Silverstream House" vs "45 Fitzroy Street"** — both are used to describe the same
   address on different pages (`4th Floor, Silverstream House, 45 Fitzroy Street` is the
   most complete version found and is treated as canonical here) — confirm this is a real,
   current office and not a placeholder from a virtual-office template.
5. **Social media presence** — no social profiles found on the live site beyond WhatsApp.
   If the client has LinkedIn/Instagram/Facebook, get the URLs for the footer's `sameAs`
   schema (see [`08-ADMIN-PANEL-SPEC.md`](08-ADMIN-PANEL-SPEC.md) and
   [`06-PAGE-SPECIFICATIONS.md`](06-PAGE-SPECIFICATIONS.md) footer schema requirements).

## Full page inventory (confirmed live, 2026-07-30)

The audit's own sitemap.xml check (11 URLs) was itself incomplete — `contact-us.html`
returns HTTP 200 but was never listed in the sitemap. Confirmed 14 live pages:

`index` · `security` · `plumbing` · `electrical` · `painting` · `handyman` ·
`domestic-cleaning` · `commercial-cleaning` · `property-maintenance` · `about` ·
`careers` · `contact-us` · `terms-of-use` · `privacy-policy`

This supersedes the "13 pages" figure used in the original audit PDF and
`inspiration-gap-analysis.md` — corrected here rather than reprinting the audit.
