---
title: The week the site went live, and the agents got a window
description: Weekly notes from Jamie Mac. This week jamiemac.co.uk went live, Cogent Island got a public feed so you can watch real agents doing real work, and Support Audit outreach kept moving.
tags: weekly notes, property tech, AI agents, compliance
---

Morning. This is the first of these, so a quick word on what they are. Every week I'll write up what I've actually been working on across property, tech and compliance: what shipped, what broke, and what I'd do differently. No polish for the sake of it. If something didn't work, it goes in here too.

## The site you're reading went live

Each of my businesses has its own site, but none of them said much about the person behind them. This week jamiemac.co.uk went live, built from scratch, hosted on Cloudflare and deployed straight from GitHub.

It took longer than it should have, and most of that was mobile. The desktop version came together quickly. On a phone it lagged, text faded in while you were trying to read it, and the 3D island froze. The lesson I keep relearning is simple: **build for the phone first, then let the desktop have the extras.** Most people reading this are on a phone.

The fix for the island was unglamorous. It was drawing nearly 500 separate objects every frame, so I merged everything that never moves and cut that by almost two thirds. It runs at a steady 30 frames a second on phones now, and only loads when you tap it.

## The agents got a window

The part I'm most pleased with is The Yard. It's a little 3D island where each of my businesses is a building, and the drones flying between them are my real agents:

- **Hermes** runs jobs and sends outreach
- **Claude** builds and ships
- **Scout** finds and qualifies leads
- **Grok** watches the inboxes
- **Sprig** keeps my notes and knowledge vault current

It reads from Cogent Island, the work tracker those agents report into. This week I added a public, read-only feed to it, so real jobs agents finish can show up on the site. Nothing private goes out: no notes, no task names, nothing about clients or deals. Just "this agent did this kind of work for this business".

I wanted it because "we use AI" means nothing on its own any more. Showing the work is more honest than describing it.

## Property and compliance kept moving

Support Audit is still the main focus. It checks whether a supported housing provider's property and support evidence would stand up if a regulator or commissioner looked at it. Property compliance has certificates, expiry dates and a contractor who signs. Support compliance has none of that, and that's the gap.

Outreach carried on alongside the site work, written for people in the sector rather than at them. ExemptAccommodation.com, the free plain-English hub on supported accommodation rules, keeps doing its quiet job in the background. It answers the questions landlords and providers actually ask.

## What I'd do differently

I'd have tested on a real phone from the very first day. Every problem I spent time fixing this week was visible from the first scroll on an iPhone.

## Next week

- Get Bing and the AI answer engines indexing the site properly
- Keep the Support Audit conversations going
- Write this up again next Wednesday

If any of this is useful, or you're working on something in property, compliance or automation, [send me a message](mailto:Jamiemack2991@gmail.com). I reply to every one.
