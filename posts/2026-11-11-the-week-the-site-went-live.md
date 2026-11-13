---
title: The week the site went live, and the agents got a window
description: Weekly notes from Jamie Mac. jamiemac.co.uk went live, Cogent Island got a public feed so you can watch real agents doing real work, and Support Audit outreach kept moving. Plus what a week of mobile fixes taught me.
tags: weekly notes, property tech, AI agents, compliance, web performance
highlights: jamiemac.co.uk is live: one place for the property, tech and compliance work, built phone-first after the first version struggled on mobile | The 3D island went from nearly 500 draw calls to under 180, and now loads itself in the background instead of freezing the page | Real agent activity is now public through a read-only feed, with nothing private leaving the system | Support Audit is still the main focus: support evidence has no certificates or expiry dates, and that's exactly where providers get caught out | If you only take one thing away: test on a real phone on day one
---

Morning. This is the first of these, so a quick word on what they are. Every week I'll write up what I've actually been working on across property, tech and compliance: what shipped, what broke, and what I'd do differently. No polish for the sake of it. If something didn't work, it goes in here too.

## The site you're reading went live

Each of my businesses has its own site, but none of them said much about the person behind them. This week jamiemac.co.uk went live, built from scratch, hosted on Cloudflare and deployed straight from GitHub.

It took longer than it should have, and most of that was mobile. The desktop version came together quickly. On a phone it lagged, text faded in while you were trying to read it, and the 3D island froze. Three fixes did most of the work:

- **Stop animating things on every frame.** A colour effect was restyling the whole page sixty times a second. Moving it to only change when you reach a new section removed most of the lag.
- **Don't make people wait to read.** Fade-in text looks nice on a laptop. On a phone it means reading half-invisible words. Text is now there the moment you arrive.
- **Load heavy things last.** The 3D library is over half a megabyte. It now only downloads when you're about to scroll to it, so the first screen appears straight away.

> Takeaway: build for the phone first, then let the desktop have the extras. Most people reading this are on a phone.

## Making the 3D island fast enough for a phone

The island was drawing nearly 500 separate objects every frame. Phones hate that. Every tree, window and roof tile was its own draw call, even though none of them ever move.

The fix was unglamorous: merge everything that never moves into a handful of combined shapes, reuse materials instead of creating a new one for every object, and cap phones at a steady 30 frames a second. Draw calls dropped from 472 to 176. A still image of the island now shows instantly, and the live version fades in over it once it's ready, so it never looks broken while it loads.

> Takeaway: if something feels slow, count before you optimise. One number (draw calls) explained almost all of the problem.

## The agents got a window

The part I'm most pleased with is The Yard. It's a 3D island where each of my businesses is a building, and the drones flying between them are my real agents:

- **Hermes** runs jobs and sends outreach
- **Claude** builds and ships
- **Scout** finds and qualifies leads
- **Grok** watches the inboxes
- **Sprig** keeps my notes and knowledge vault current

It reads from Cogent Island, the work tracker those agents report into. This week I added a public, read-only feed to it, so real jobs agents finish can show up on the site. Nothing private goes out: no notes, no task names, nothing about clients or deals. Just "this agent did this kind of work for this business".

I wanted it because "we use AI" means nothing on its own any more. Showing the work is more honest than describing it.

> Takeaway: if you're putting automation in front of customers, decide what is safe to show before you build the feed, not after. Strip it down to who did what kind of work, and when.

## Property and compliance kept moving

Support Audit is still the main focus. It checks whether a supported housing provider's property and support evidence would stand up if a regulator or commissioner looked at it.

Here's why it matters. Property compliance has certificates, expiry dates and a contractor who signs: gas safety, electrical checks, fire risk assessments. Support compliance has none of that. Support plans, risk assessments and evidence of meaningful support sit in case notes and spreadsheets, and nobody signs to say they're good enough. That's the gap, and it's usually where providers get caught out.

Three questions I'd ask any provider this week:

- Could you show, for each resident, the support they received last month and who delivered it?
- When was each support plan last reviewed, and is that written down anywhere other than a diary?
- If a commissioner asked for evidence tomorrow, how long would it take to pull together?

ExemptAccommodation.com, the free plain-English hub on supported accommodation rules, keeps doing its quiet job in the background. It answers the questions landlords and providers actually ask.

## What I'd do differently

I'd have tested on a real phone from the very first day. Every problem I spent time fixing this week was visible from the first scroll on an iPhone. Browser tools that pretend to be a phone are useful, but they don't show you lag, and they don't show you what a tired thumb does.

## Next week

- Get Bing and the AI answer engines indexing the site properly
- Keep the Support Audit conversations going
- Write this up again next Wednesday

If any of this is useful, or you're working on something in property, compliance or automation, [send me a message](mailto:Jamiemack2991@gmail.com). I reply to every one.
