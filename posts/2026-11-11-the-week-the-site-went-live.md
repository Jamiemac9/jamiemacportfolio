---
title: "Notes #1: jamiemac.co.uk is live, with a live agent feed and a phone-first build"
description: Week one. My personal site launched with a 3D map of my businesses, a public feed of real agent work, and search set-up done properly from day one.
tags: weekly notes, websites, AI agents, search, property tech
highlights: Launched jamiemac.co.uk: one place for my property, tech and compliance work | Cut the 3D island from 472 draw calls to 176 so it runs smoothly on a phone | Put a read-only feed of real agent work on the site, with nothing private exposed | Search, AI answer engines and IndexNow set up from day one, not bolted on later
---

These notes are a weekly record of what I've shipped across property, tech and compliance, with the evidence, what I learned, and what's next. Each one starts by checking last week's promises, so you can see whether I hit them.

## Shipped this week

**jamiemac.co.uk went live.** One site that ties together eight years in property and compliance and ten in tech. It's hosted on Cloudflare and deploys from GitHub, so a change is live minutes after I make it.

**The Yard.** A 3D island where each of my businesses is a building and my AI agents fly between them. It reads from Cogent Island, the tracker my agents report into, through a new public feed. The feed shows who did what kind of work for which business, and nothing else: no client names, task details or notes.

**Built for phones first.** The first version was heavy on a phone, so I rebuilt the slow parts before anyone saw them:

- The 3D island went from 472 draw calls to 176 by merging everything that never moves.
- Phones are capped at 30 frames a second, so the island doesn't fight the rest of the page.
- The page stopped restyling itself on every frame and only updates when you reach a new section.

**Search set up properly.** Structured data that tells Google and AI tools who I am and what I do, a visible FAQ, a sitemap, an llms.txt file for AI answer engines, and IndexNow, which pings Bing and others automatically every time the site changes.

## What I learned

**Test on the device your customers use, before you call it finished.** A site can look perfect on a laptop and still be slow on the phone most people will actually see it on. I now check every change at phone, tablet and desktop width before it goes live.

**If you say you use AI, show the work.** "We use AI" means very little now. A live view of real jobs, with private details stripped out, is far more convincing than a paragraph about it.

## For your business

If you have a website, open it on your own phone, with wifi off, and check three things: how long it takes to load, whether a stranger could tell what you do from the first screen, and whether every phone number, email and form actually works.

## Next week

- Get the site properly indexed by Google, Bing and the AI answer engines
- Carry on with Support Audit outreach
- Publish notes #2 with the results

Working on something in property, compliance or automation? [Send me a message](mailto:Jamiemack2991@gmail.com).
