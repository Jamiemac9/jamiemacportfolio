#!/usr/bin/env python3
"""Build the weekly notes blog from posts/*.md.

Writes: blog/index.html, blog/<slug>/index.html, feed.xml, sitemap.xml,
and the "Latest notes" list on the homepage (between <!-- notes:start --> and <!-- notes:end -->).

Post file: posts/YYYY-MM-DD-slug.md with a front matter block:
---
title: ...
description: ...           (one sentence, used for search results and social cards)
tags: a, b, c
highlights: First key point | Second key point | Third key point   (3-5, shown as "The short version")
---
Markdown body: ## headings, paragraphs, - lists, **bold**, *italic*, [links](url),
and "> Takeaway: ..." lines, which render as a highlighted takeaway callout.

Run: python3 tools/build_blog.py
"""
import datetime, html, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://jamiemac.co.uk'
AUTHOR = 'Jamie Mac'


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: '<a href="%s"%s>%s</a>' % (m.group(2), '' if m.group(2).startswith(('/', '#', 'mailto:')) or SITE in m.group(2) else ' rel="noopener"', m.group(1)), t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\w)', r'<em>\1</em>', t)
    return t


def md(src):
    out, para, lst, quote = [], [], [], []
    def flush():
        if quote:
            q = ' '.join(quote); quote.clear()
            m = re.match(r'\*{0,2}([A-Za-z ]{3,24}):\*{0,2}\s*(.*)', q)
            label, txt = (m.group(1), m.group(2)) if m else ('Takeaway', q)
            txt = txt[:1].upper() + txt[1:]
            out.append('<aside class="take"><b>%s</b><p>%s</p></aside>' % (html.escape(label), inline(txt)))
        if para: out.append('<p>%s</p>' % inline(' '.join(para))); para.clear()
        if lst: out.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % inline(x) for x in lst)); lst.clear()
    for line in src.splitlines():
        s = line.strip()
        if not s: flush(); continue
        m = re.match(r'(#{2,3})\s+(.*)', s)
        if m:
            flush(); lvl = len(m.group(1)); txt = m.group(2)
            sid = re.sub(r'[^a-z0-9]+', '-', txt.lower()).strip('-')
            out.append('<h%d id="%s">%s</h%d>' % (lvl, sid, inline(txt), lvl)); continue
        if s.startswith('>'):
            if para or lst: flush()
            quote.append(s.lstrip('> ').strip()); continue
        if quote: flush()
        if s.startswith(('- ', '* ')):
            if para: flush()
            lst.append(s[2:]); continue
        if lst: flush()
        para.append(s)
    flush()
    return '\n'.join(out)


def load():
    posts = []
    for f in sorted((ROOT / 'posts').glob('*.md')):
        raw = f.read_text()
        m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
        if not m: continue
        meta = dict(l.split(':', 1) for l in m.group(1).splitlines() if ':' in l)
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        if meta.get('draft', '').lower() == 'true': continue
        date = f.name[:10]
        slug = f.stem[11:]
        body = m.group(2)
        words = len(re.findall(r'\w+', body))
        hl = [x.strip() for x in meta.get('highlights', '').split('|') if x.strip()]
        posts.append({'highlights': hl, 'title': meta['title'], 'description': meta.get('description', ''), 'tags': [t.strip() for t in meta.get('tags', '').split(',') if t.strip()],
                      'date': date, 'slug': slug, 'url': '%s/blog/%s/' % (SITE, slug), 'html': md(body), 'mins': max(1, round(words / 220))})
    return sorted(posts, key=lambda p: p['date'], reverse=True)


def nice(d):
    return datetime.date.fromisoformat(d).strftime('%-d %B %Y')


HEAD = '''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="author" content="Jamie Mac">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="Jamie Mac">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B0D12">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Jamie Mac · Weekly notes" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog/blog.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="bh"><a class="brand" href="/" aria-label="Jamie Mac home"><img src="/img/logo-mark.webp" alt="Jamie Mac" width="480" height="117"></a><nav aria-label="Main"><a href="/blog/">Notes</a><a href="/#ventures">Ventures</a><a href="/#contact">Contact</a></nav></header>
'''
FOOT = '''<footer class="bf"><a href="/">jamiemac.co.uk</a> · <a href="/blog/">All notes</a> · <a href="/feed.xml">RSS</a></footer>
</body>
</html>
'''


def page_post(p, prev, nxt):
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'BlogPosting', '@id': p['url'] + '#post', 'headline': p['title'], 'description': p['description'], 'datePublished': p['date'], 'dateModified': p['date'],
         'inLanguage': 'en-GB', 'url': p['url'], 'abstract': ' '.join(p['highlights']) or p['description'], 'mainEntityOfPage': p['url'], 'image': SITE + '/img/og.jpg', 'keywords': ', '.join(p['tags']),
         'author': {'@type': 'Person', '@id': SITE + '/#jamie', 'name': AUTHOR, 'url': SITE + '/'},
         'publisher': {'@type': 'Person', '@id': SITE + '/#jamie', 'name': AUTHOR},
         'isPartOf': {'@type': 'Blog', '@id': SITE + '/blog/#blog', 'name': 'Jamie Mac · Weekly notes'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Notes', 'item': SITE + '/blog/'},
            {'@type': 'ListItem', 'position': 3, 'name': p['title'], 'item': p['url']}]}]}
    h = HEAD.format(title=html.escape(p['title']) + ' · Jamie Mac', desc=html.escape(p['description']), url=p['url'], ogtype='article', ogtitle=html.escape(p['title']), site=SITE, ld=json.dumps(ld, ensure_ascii=False))
    pn = '<nav class="pn" aria-label="More notes">'
    if nxt: pn += '<a href="/blog/%s/"><small>Newer</small>%s</a>' % (nxt['slug'], html.escape(nxt['title']))
    if prev: pn += '<a href="/blog/%s/" class="older"><small>Older</small>%s</a>' % (prev['slug'], html.escape(prev['title']))
    pn += '</nav>'
    hl = ''
    if p['highlights']:
        hl = '<section class="short" aria-label="The short version"><p class="kick">The short version</p><ul>%s</ul></section>' % ''.join('<li>%s</li>' % inline(x) for x in p['highlights'])
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', p['html'])
    toc = ''
    if len(heads) >= 3:
        toc = '<nav class="toc" aria-label="On this page"><p class="kick">On this page</p><ol>%s</ol></nav>' % ''.join('<li><a href="#%s">%s</a></li>' % (i, t) for i, t in heads)
    body = '''<main class="post">
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> <span>/</span> <a href="/blog/">Notes</a></nav>
<article>
<header><p class="kick">Weekly notes</p><h1>{t}</h1><p class="meta"><time datetime="{d}">{nd}</time> · {m} min read · by <a href="/">Jamie Mac</a></p><p class="lede">{desc}</p></header>
{hl}{toc}
<div class="prose">
{html}
</div>
<aside class="author"><img src="/img/me.jpg" alt="" width="64" height="64" loading="lazy"><div><b>Jamie Mac</b><span>Property, tech and compliance. Eight years in property and compliance, ten in tech. Solihull, UK.</span></div></aside>
</article>
{pn}
</main>
'''.format(t=html.escape(p['title']), d=p['date'], nd=nice(p['date']), m=p['mins'], desc=html.escape(p['description']), html=p['html'], pn=pn, hl=hl, toc=toc)
    return h + body + FOOT


def page_index(posts):
    url = SITE + '/blog/'
    ld = {'@context': 'https://schema.org', '@type': 'Blog', '@id': url + '#blog', 'name': 'Jamie Mac · Weekly notes', 'url': url, 'inLanguage': 'en-GB',
          'description': 'Weekly notes on what Jamie Mac is building across property, tech and compliance.',
          'author': {'@type': 'Person', '@id': SITE + '/#jamie', 'name': AUTHOR},
          'blogPost': [{'@type': 'BlogPosting', 'headline': p['title'], 'url': p['url'], 'datePublished': p['date']} for p in posts]}
    h = HEAD.format(title='Weekly notes · Jamie Mac', desc='Weekly notes from Jamie Mac on what he is building across property, tech and compliance: what shipped, what broke and what is next.', url=url, ogtype='website', ogtitle='Weekly notes · Jamie Mac', site=SITE, ld=json.dumps(ld, ensure_ascii=False))
    items = '\n'.join('<li><a href="/blog/%s/"><time datetime="%s">%s</time><h2>%s</h2><p>%s</p><span class="more">Read the note →</span></a></li>' % (p['slug'], p['date'], nice(p['date']), html.escape(p['title']), html.escape(p['description'])) for p in posts)
    body = '''<main class="list">
<p class="kick">Weekly notes</p>
<h1>What I'm working on, <em>every week</em></h1>
<p class="lede">A conversational write-up each week of what I'm building across property, tech and compliance: what shipped, what broke and what's next.</p>
<ul class="posts">
%s
</ul>
</main>
''' % items
    return h + body + FOOT


def feed(posts):
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%a, %d %b %Y %H:%M:%S +0000')
    it = ''.join('<item><title>%s</title><link>%s</link><guid isPermaLink="true">%s</guid><pubDate>%s</pubDate><description>%s</description></item>' % (
        html.escape(p['title']), p['url'], p['url'], datetime.date.fromisoformat(p['date']).strftime('%a, %d %b %Y 08:00:00 +0000'), html.escape(p['description'])) for p in posts)
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Jamie Mac · Weekly notes</title><link>%s/blog/</link><atom:link href="%s/feed.xml" rel="self" type="application/rss+xml"/><description>Weekly notes on property, tech and compliance.</description><language>en-gb</language><lastBuildDate>%s</lastBuildDate>%s</channel></rss>\n' % (SITE, SITE, now, it)


def sitemap(posts):
    today = datetime.date.today().isoformat()
    urls = ['<url><loc>%s/</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq><priority>1.0</priority><image:image><image:loc>%s/img/hero.png</image:loc></image:image><image:image><image:loc>%s/img/me.jpg</image:loc></image:image></url>' % (SITE, today, SITE, SITE),
            '<url><loc>%s/blog/</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>' % (SITE, posts[0]['date'] if posts else today)]
    urls += ['<url><loc>%s</loc><lastmod>%s</lastmod><priority>0.7</priority></url>' % (p['url'], p['date']) for p in posts]
    urls.append('<url><loc>%s/llms.txt</loc><lastmod>%s</lastmod></url>' % (SITE, today))
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  ' + '\n  '.join(urls) + '\n</urlset>\n'


def homepage(posts):
    p = ROOT / 'index.html'; s = p.read_text()
    items = ''.join('<li><a href="/blog/%s/"><time datetime="%s">%s</time><b>%s</b><span>%s</span></a></li>' % (x['slug'], x['date'], nice(x['date']), html.escape(x['title']), html.escape(x['description'])) for x in posts[:3])
    block = '<!-- notes:start --><ul class="notes-list">%s</ul><!-- notes:end -->' % items
    s2 = re.sub(r'<!-- notes:start -->.*?<!-- notes:end -->', lambda m: block, s, flags=re.S)
    if s2 != s: p.write_text(s2)


def llms(posts):
    p = ROOT / 'llms.txt'; s = p.read_text()
    block = '## Weekly notes\n' + ''.join('- [%s](%s): %s\n' % (x['title'], x['url'], x['description']) for x in posts[:12])
    s = re.sub(r'## Weekly notes\n(?:- .*\n)*', '', s).rstrip('\n') + '\n\n' + block
    p.write_text(s)


def main():
    posts = load()
    (ROOT / 'blog').mkdir(exist_ok=True)
    for i, p in enumerate(posts):
        d = ROOT / 'blog' / p['slug']; d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(page_post(p, posts[i + 1] if i + 1 < len(posts) else None, posts[i - 1] if i > 0 else None))
    (ROOT / 'blog' / 'index.html').write_text(page_index(posts))
    (ROOT / 'feed.xml').write_text(feed(posts))
    (ROOT / 'sitemap.xml').write_text(sitemap(posts))
    homepage(posts); llms(posts)
    print('built %d posts' % len(posts))


if __name__ == '__main__':
    main()
