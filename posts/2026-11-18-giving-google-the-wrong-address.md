---
title: "Notes #2: a search audit across my sites, and a new personal website offer"
description: Week two. I audited how my sites present themselves to Google, found five hidden issues, added a build check against them, and launched personal websites.
tags: weekly notes, websites, google, search, small business
highlights: Audited the sites I run and manage for how Google sees them and found five types of hidden indexing issue | Added a build check that stops a page pointing Google at the wrong domain from going live | Launched personal websites from £997, usually built within 48 hours | Rule of thumb: let Search Console data decide your site's main address, not preference
---

## Last week I said I'd

- **Get the site properly indexed.** Done, and I widened it to every site I run and manage. Details below.
- **Carry on with Support Audit outreach.** Ongoing.
- **Publish notes #2.** You're reading it.

## Shipped this week

**A search audit across my sites.** A site can work perfectly for visitors and still be telling Google the wrong thing about itself. I went through each site's canonicals (the tag on every page that tells Google its proper address), sitemaps and redirects, and found five types of issue:

- A sitemap and canonicals pointing at a domain that doesn't exist.
- Blog post addresses missing the trailing slash, so Google saw every post as a redirect rather than a page.
- Section pages declaring the blog homepage as their proper address, so Google dropped them as duplicates.
- A site serving its homepage to Google in place of its inner pages.
- Pages that arrived near-empty and filled in afterwards, which makes them harder for Google to read.

**A guardrail so it can't come back.** On the site where the domain mattered most, every address is now built from one fixed starting point, and the build refuses to go live if the wrong domain slips into a page. A fix that relies on someone remembering it doesn't last. One that's built in does.

**Personal websites, as a service.** The site you're on is now the example for an offer: a scroll-led personal site for founders, consultants and operators whose reputation is the business. From £997, usually built within 48 hours of a 30-minute call. [See the details](/#websites).

**A sharper site.** A new logo, a cleaner menu, and the 3D island now loads by itself with an instant preview, so it never looks blank on a slow connection.

## What I learned

**Let the data choose your main address.** One site could be reached with or without "www". Search Console showed all of its recent Google clicks were coming through the www version, so that's the one I made the main address. Whichever version Google already trusts is the one to back. Preference doesn't come into it.

**Fixes should become checks.** The domain fix is now enforced by the build, and that's the standard I'm applying to the rest. It's what turns a one-off clean-up into something that stays fixed.

## For your business

If your site has been rebuilt, moved or changed domain, spend ten minutes on this:

- Type your address four ways: with and without www, and with http and https. All four should end up at exactly the same address.
- Open yourdomain/sitemap.xml. Every address should be on your real domain, and none should redirect.
- Search Google for site:yourdomain.co.uk. If pages you care about are missing, one of the above is usually why.
- In Search Console, open the Pages report and look first at "Page with redirect" and anything starting with "Duplicate".

## Next week

- Track the fixed pages back into Google's index in Search Console
- Get the personal websites offer in front of the people it's for
- Notes #3, starting with how these went

If any of that check doesn't add up for your site, [send me a message](mailto:Jamiemack2991@gmail.com).
