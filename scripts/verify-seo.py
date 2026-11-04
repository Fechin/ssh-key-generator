"""Verify final static SEO output against the site's authoritative content."""
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
CONFIG = json.loads((ROOT / 'src/i18n/languageConfig.json').read_text())
LANGUAGES = CONFIG['languages']
SITE = CONFIG['siteUrl']
REVIEW = json.loads((ROOT / 'src/content/siteReview.json').read_text())
SITE_INFO = json.loads((ROOT / 'src/content/siteInfo.json').read_text())


def original(path):
    return subprocess.check_output(['git', 'show', f'HEAD:{path}'], cwd=ROOT).decode()


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.lang = None
        self.links = []
        self.alternates = {}
        self.duplicate_alternates = []
        self.meta = {}
        self.canonicals = []
        self.title = ''
        self.text = []
        self.identifiers = set()
        self.times = set()
        self.pending_suspense = []
        self.title_open = False
        self.ignored = 0
        self.main = False
        self.feed(html)

    @property
    def canonical(self):
        return self.canonicals[0] if self.canonicals else None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        identifier = a.get('id', '')
        if identifier:
            self.identifiers.add(identifier)
        if tag == 'a' and a.get('name'):
            self.identifiers.add(a['name'])
        if tag == 'template' and identifier.startswith('B:'):
            self.pending_suspense.append(identifier)
        if 'hidden' in a and identifier.startswith('S:'):
            self.pending_suspense.append(identifier)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.title_open = True
        if tag == 'main': self.main = True
        if tag in ('script', 'style'): self.ignored += 1
        if tag == 'time' and a.get('datetime'): self.times.add(a['datetime'])
        if tag == 'meta': self.meta[a.get('name', a.get('property'))] = a.get('content')
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'link' and a.get('rel') == 'canonical': self.canonicals.append(a.get('href'))
        if tag == 'link' and a.get('hreflang'):
            if a['hreflang'] in self.alternates:
                self.duplicate_alternates.append(a['hreflang'])
            self.alternates[a['hreflang']] = a.get('href')

    def handle_endtag(self, tag):
        if tag == 'title': self.title_open = False
        if tag == 'main': self.main = False
        if tag in ('script', 'style'): self.ignored -= 1

    def handle_comment(self, data):
        # Completed <!--$--> boundaries are valid; pending/error fallbacks are not.
        if data.startswith(('$?', '$!', '$~')):
            self.pending_suspense.append(data)

    def handle_data(self, data):
        if self.title_open: self.title += data
        if self.main and not self.ignored: self.text.append(data)


def file_for(url):
    pathname = unquote(urlparse(url).path)
    candidate = DIST / pathname.lstrip('/')
    if pathname.endswith('/') or candidate.is_dir():
        return candidate / 'index.html'
    return candidate


def localized_url(language, slug=''):
    return f"{SITE}{language['basePath']}/{slug + '/' if slug else ''}"


meta = {}
for path in (ROOT / 'src/content/meta').glob('*.json'):
    batch = json.loads(path.read_text())
    old = json.loads(original(path.relative_to(ROOT)))
    for lang, articles in batch.items():
        meta.setdefault(lang, {}).update(articles)
        for slug, article in articles.items():
            for field in ('title', 'description', 'publishDate'):
                assert article[field] == old[lang][slug][field], f'{field} changed: {lang}/{slug}'


def expected_alternates(slug=''):
    result = {
        language['hreflang']: localized_url(language, slug)
        for language in LANGUAGES
        if not slug or slug in meta.get(language['code'], {})
    }
    default = next(x for x in LANGUAGES if x['code'] == CONFIG['defaultLanguage'])
    result['x-default'] = localized_url(default, slug)
    return result


# Metadata preservation uses the pre-change conventions, not the modified build.
old_seo = original('src/lib/seo.ts')
default_title = re.search(r"const DEFAULT_TITLE = '([^']+)'", old_seo).group(1)
default_description = re.search(r"const DEFAULT_DESCRIPTION =\s*'([^']+)'", old_seo).group(1)
expected_pages = {}
for language in LANGUAGES:
    strings_path = Path('src/i18n/locales') / language['localeFile']
    old_strings = json.loads(original(strings_path))
    strings = json.loads((ROOT / strings_path).read_text())
    assert strings['hero'] == old_strings['hero'], f"Home hero changed: {language['code']}"
    is_default = language['code'] == CONFIG['defaultLanguage']
    expected_pages[localized_url(language)] = {
        'kind': 'home', 'language': language,
        'title': default_title if is_default else f"{old_strings['hero']['title']} | SSH Key Generator",
        'description': default_description if is_default else old_strings['hero']['subtitle'],
        'lastmod': REVIEW['dateModified'], 'alternates': expected_alternates(),
    }
    for slug, article in meta.get(language['code'], {}).items():
        expected_pages[localized_url(language, slug)] = {
            **article, 'kind': 'article', 'language': language,
            'lastmod': article.get('modifiedDate', article['publishDate']),
            'alternates': expected_alternates(slug),
        }
for info in SITE_INFO:
    expected_pages[f"{SITE}/{info['slug']}/"] = {
        **info, 'kind': 'info', 'language': next(x for x in LANGUAGES if x['code'] == 'en'),
        'lastmod': info['dateModified'], 'alternates': {},
    }

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
sitemap = ET.parse(DIST / 'sitemap.xml')
entries = sitemap.findall('s:url', ns)
urls = [entry.findtext('s:loc', namespaces=ns) for entry in entries]
assert len(urls) == len(set(urls)), 'Duplicate sitemap URLs'
assert set(urls) == set(expected_pages), 'Sitemap does not match existing content and language routes'
for entry, url in zip(entries, urls):
    expected = expected_pages[url]
    assert entry.findtext('s:lastmod', namespaces=ns) == expected['lastmod'], f'Sitemap lastmod mismatch: {url}'
    alternates = {link.get('hreflang'): link.get('href') for link in entry.findall('x:link', ns)}
    assert alternates == expected['alternates'], f'Sitemap hreflang mismatch: {url}'

pages = {}
for url in urls:
    path = file_for(url)
    assert path.exists(), f'Missing HTML: {url}'
    html = path.read_text()
    page = Page(html)
    pages[url] = page
    expected = expected_pages[url]
    assert page.canonicals == [url], f'Canonical mismatch or duplicate: {url}'
    assert page.h1 == 1, f'{page.h1} H1s: {url}'
    assert 'noindex' not in page.meta.get('robots', ''), f'Noindex: {url}'
    assert 'seo-crawlable-links' not in html, f'Old hidden fallback: {url}'
    assert not page.pending_suspense, f'Unresolved or hidden React content {page.pending_suspense}: {url}'
    assert len(''.join(page.text)) > 250, f'Empty main content: {url}'
    assert page.title == expected['title'], f'Static title mismatch: {url}'
    assert page.meta.get('description') == expected['description'], f'Static description mismatch: {url}'
    assert page.lang == expected['language']['htmlLang'], f'HTML language mismatch: {url}'
    assert page.alternates == expected['alternates'] and not page.duplicate_alternates, f'Exact hreflang mapping mismatch: {url}'
    assert page.meta.get('og:url') == url, f'Open Graph URL mismatch: {url}'
    for info in SITE_INFO:
        assert f"/{info['slug']}/" in page.links, f"Missing trust link {info['slug']}: {url}"
    schemas = [json.loads(s) for s in re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)]
    assert schemas, f'No schema: {url}'
    assert any(s.get('@type') == 'Organization' for s in schemas), f'No organization: {url}'
    if expected['kind'] == 'article':
        assert '<article>' in html and '<pre ' in html, f'Missing article body: {url}'
        article = next(s for s in schemas if s.get('@type') == 'TechArticle')
        assert article['datePublished'] == expected['publishDate'], f'Article publication schema mismatch: {url}'
        assert article['dateModified'] == expected['lastmod'], f'Article modification schema mismatch: {url}'
        assert expected['publishDate'] in page.times, f'Missing visible publication date: {url}'
        assert expected['lastmod'] in page.times, f'Missing visible modified date: {url}'
    elif expected['kind'] == 'home':
        application = next(s for s in schemas if s.get('@type') == 'SoftwareApplication')
        assert application['dateModified'] == expected['lastmod'], f'Home schema date mismatch: {url}'
        assert expected['lastmod'] in page.times, f'Missing visible home review date: {url}'
        faq = next(s for s in schemas if s.get('@type') == 'FAQPage')
        body = ' '.join(' '.join(page.text).split())
        for question in faq['mainEntity']:
            assert ' '.join(question['name'].split()) in body, f'FAQ question not visible: {url}'
            assert ' '.join(question['acceptedAnswer']['text'].split()) in body, f'FAQ answer not visible: {url}'

# Resolve ordinary relative links and same-document anchors just as browsers do.
extra_pages = {}
for url, page in pages.items():
    for href in page.links:
        target = urlparse(urljoin(url, href))
        if target.scheme not in ('http', 'https') or target.netloc != urlparse(SITE).netloc:
            continue
        target_url = f'{SITE}{target.path}'
        target_file = file_for(target_url)
        assert target_file.is_file(), f'Broken internal link {href}: {url}'
        fragment = unquote(target.fragment).split(':~:text=', 1)[0]
        if fragment and fragment != 'top' and target_file.suffix == '.html':
            target_page = pages.get(target_url)
            if target_page is None:
                if target_file not in extra_pages:
                    extra_pages[target_file] = Page(target_file.read_text())
                target_page = extra_pages[target_file]
            assert fragment in target_page.identifiers, f'Broken internal fragment {href}: {url}'
    for hreflang, target in page.alternates.items():
        assert target in pages, f'Unknown alternate: {target}'
        if hreflang != 'x-default':
            assert url in pages[target].alternates.values(), f'Nonreciprocal hreflang: {url} -> {target}'

notfound = Page((DIST / '404.html').read_text())
assert 'noindex' in notfound.meta['robots'] and notfound.h1 == 1, 'Invalid static 404'
assert not notfound.pending_suspense, 'Unresolved 404 content'
assert (DIST / 'llms.txt').read_text() == (DIST / '.well-known/llms.txt').read_text()
assert 'User-agent: OAI-SearchBot' in (DIST / 'robots.txt').read_text()
revision = hashlib.md5((DIST / 'index.html').read_bytes()).hexdigest()
worker = (DIST / 'sw.js').read_text()
# Accept either minified or development formatting and either property order.
cache_entries = re.findall(r'\{[^{}]*\b["\']?url["\']?\s*:\s*["\']index\.html["\'][^{}]*\}', worker)
assert any(re.search(r'["\']?revision["\']?\s*:\s*["\']' + revision + r'["\']', entry) for entry in cache_entries), 'Service worker does not match final homepage'
print(f'PASS: {len(urls)} static pages, full main content, single H1, preserved titles/descriptions, exact canonical/hreflang, visible FAQ/schema, authoritative dates, resolved links/fragments, trust links, 404, AI access, final SW revision.')
