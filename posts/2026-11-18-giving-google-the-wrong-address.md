---
title: My sites were giving Google the wrong address, and nothing looked broken
description: Why pages on a working website can go missing from Google, and a ten-minute check to make sure yours points Google at the right address.
tags: weekly notes, websites, google, search, small business
highlights: Several sites I run or look after were pointing Google at old, redirected or non-existent addresses | Nothing looked wrong to a visitor, which is how it goes unnoticed | Check that your canonical, your sitemap and your www version all agree on one address
---

Last week I said I'd spend this week making sure search engines could actually find my site. That turned into going through the other sites I run and look after as well, because once I knew what to look for I kept finding it.

The problem was much the same everywhere. The sites worked. You could click around, read everything, fill in the forms. But behind the scenes they were telling Google the wrong address for their own pages.

## What I found

Every page on a website carries a small note for search engines that says "this is my proper address". It's called a canonical. Your sitemap does the same job for the whole site, as a list. If those notes point somewhere slightly different from where the page really lives, Google has to decide what to believe, and often it just leaves the page out.

That's what was going on. On one site the sitemap and canonicals pointed at a domain that doesn't exist. On a blog, every post's address was missing the slash at the end, which redirected to the version with the slash, so Google saw each post as a redirect rather than a page. The section pages on that blog all said their proper address was the blog's homepage, so Google dropped them as duplicates. Another site was serving its homepage to Google in place of its inner pages. And a couple were built in a way that sends a near-empty page first and fills it in afterwards, which makes Google's job harder than it needs to be.

None of this shows up for a visitor, which is exactly how it goes unnoticed. If people find you by searching, whether that's tenants looking for a room or customers looking for a trade, a page Google has dropped is a page they'll never see.

## The one I got wrong

One site could be reached with or without the www at the front. I tidied it up so everything pointed at the version without the www. Then I looked at what Google was actually doing, and it was the other way round. All of the site's recent clicks from Google were coming through the www version, and none through the other one. I'd just pointed Google away from the address it already trusted.

So I moved it all back to www. I also changed the code so every address on the site is built from one fixed starting point, which means a single page can't quietly put out the wrong domain again. And the build now refuses to go live if the wrong version slips through.

The lesson for me was simple. Don't pick the version you prefer. Look at which one Google is already using and back that one.

## A ten-minute check for your own site

If you've got a business website, especially one that's been rebuilt, moved or changed domain, this is worth doing:

- **Type your address four ways.** With and without www, with http and with https. All four should land on exactly the same address in the browser bar.
- **Look at a page's canonical.** On a laptop, right-click a page, choose View page source and search for "canonical". The address there should match the one in your browser bar exactly, slash and all.
- **Open yourdomain/sitemap.xml.** Every address in it should be on your real domain, and none of them should redirect when you open them.
- **Search Google for site:yourdomain.co.uk.** If pages you care about aren't there, something above is probably off.

If you use Google Search Console, the Pages report tells you which pages it has left out and why. "Page with redirect" and anything starting with "Duplicate" are the ones to look at first.

If you run through that and something doesn't add up, [send me a message](mailto:Jamiemack2991@gmail.com) and I'll have a look.
