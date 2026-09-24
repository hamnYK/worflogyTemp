"""Build crawlable Korean/English pages using only the Python and Node standard libraries.
Run: python scripts/build-seo.py (from this site's folder), or use an absolute script path.
Edit index.html, js/diagrams.js, js/translations.js and seo.config.json, then rebuild.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
from urllib.parse import urljoin, urlparse
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'seo.config.json').read_text(encoding='utf-8'))
BASE = CONFIG['siteUrl']
assert BASE.startswith('https://') and BASE.endswith('/'), 'siteUrl must be an absolute HTTPS URL ending in /'
URLS = {lang: urljoin(BASE, page) for lang, page in CONFIG['pages'].items()}
raw = (ROOT / 'js/translations.js').read_text(encoding='utf-8')
COPY = json.loads(raw.split('window.WORFLOGY_EN = ', 1)[1].strip().removesuffix(';'))
NORMAL = {re.sub(r'\s+', ' ', key).strip(): value for key, value in COPY.items()}

def translate(text):
    if text in COPY:
        return COPY[text]
    key = re.sub(r'\s+', ' ', text).strip()
    if key in NORMAL:
        return re.match(r'^\s*', text)[0] + NORMAL[key] + re.search(r'\s*$', text)[0]
    if re.search('[가-힣]', text):
        raise ValueError('Missing English copy: ' + text)
    return text

node_script = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('js/diagrams.js','utf8'),c);process.stdout.write(JSON.stringify(c.window.WORFLOGY_DIAGRAMS));"
diagrams = json.loads(subprocess.check_output(['node', '-e', node_script], cwd=ROOT).decode('utf-8'))

def static_diagrams():
    sections = []
    for i, item in enumerate(diagrams):
        title_id = 'title-' + item['id']
        parts = ['<section class="diagram-section" id="section-' + item['id'] + '" aria-labelledby="' + title_id + '">']
        if item.get('category'):
            parts.append('<p class="diagram-category"><span class="wf-badge wf-badge--neutral">' + escape(item['category']) + '</span></p>')
        if i == 0:
            parts += ['<header class="guide-header"><h1 id="' + title_id + '">워플로지 “AI 인문 사회 디자인”</h1></header>', '<p class="guide-description"><strong>한 번의 문제 해결이 다음 문제를 푸는 지식이 되도록.</strong>워플로지는 업무와 창작 과정에서 얻은 경험을 지식 그래프로 연결해,<br>다시 활용하고 발전시킬 수 있는 체계를 설계합니다.</p>']
            parts.append((ROOT / 'scripts/site-directory.html').read_text(encoding='utf-8'))
            parts.append('<h2 class="diagram-section-title" id="overview-summary-title">0. 워플로지, Bottom-Up 동적 지식 그래프 디자인 기술 회사</h2>')
        else:
            parts.append('<h2 class="diagram-section-title" id="' + title_id + '">' + str(i) + '. <span>' + escape(item['title']) + '</span></h2>')
        if item.get('placeholder'):
            parts.append('<div class="diagram-shell"><div class="diagram-canvas diagram-canvas--placeholder" role="img" aria-label="공간정보 프로젝트 캔버스, 내용 준비 중"></div></div></section>')
            sections.append('\n'.join(parts))
            continue
        if item.get('readiness'):
            parts.append('<p class="diagram-readiness">' + escape(item['readiness']) + '</p>')
        if item.get('video'):
            parts.append('<div class="diagram-shell"><div class="toolbar"><strong class="toolbar-technology">' + escape(item['technologyLabel']) + '</strong></div><video class="diagram-canvas diagram-canvas--video" src="' + escape(item['video'], quote=True) + '" autoplay muted loop playsinline preload="metadata" aria-label="' + escape(item['title'], quote=True) + '"></video></div>')
        elif item.get('desc'):
            parts.append('<p class="static-diagram-description">' + escape(item['desc']) + '</p>')
        if item.get('relations'):
            parts.append('<ul class="wf-relations" aria-label="핵심 연결 관계">')
            for triple in item['relations']:
                chips = []
                for position, text in enumerate(triple):
                    if position:
                        chips.append('<span class="wf-relation__edge" aria-hidden="true"></span>')
                    variant = ['', ' wf-badge--warning', ' wf-badge--neutral'][position]
                    chips.append('<span class="wf-badge' + variant + '">' + escape(text) + '</span>')
                parts.append('<li class="wf-relation">' + ''.join(chips) + '</li>')
            parts.append('</ul>')
        parts.append('</section>')
        sections.append('\n'.join(parts))
    return '\n'.join(sections)

def graph(lang):
    origin = urlparse(BASE).scheme + '://' + urlparse(BASE).netloc + '/'
    return {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Organization', '@id': origin + '#organization', 'name': '주식회사 워플로지' if lang == 'ko' else 'Worflogy Inc.', 'alternateName': 'Worflogy Inc.' if lang == 'ko' else '주식회사 워플로지', 'url': BASE, 'foundingDate': '2025-07-10'},
        {'@type': 'WebSite', '@id': BASE + '#website', 'url': BASE, 'name': 'Worflogy', 'inLanguage': ['ko', 'en'], 'publisher': {'@id': origin + '#organization'}},
        {'@type': 'WebPage', '@id': URLS[lang] + '#webpage', 'url': URLS[lang], 'name': CONFIG['title'][lang], 'description': CONFIG['description'][lang], 'inLanguage': lang, 'isPartOf': {'@id': BASE + '#website'}, 'about': {'@id': origin + '#organization'}}
    ]}

def seo(lang):
    title, description = CONFIG['title'][lang], CONFIG['description'][lang]
    tags = [
        '<title>' + escape(title) + '</title>',
        '<meta name="description" content="' + escape(description, quote=True) + '">',
        '<meta name="robots" content="index,follow,max-image-preview:large">',
        '<link rel="canonical" href="' + URLS[lang] + '">',
    ]
    for code, href in {**URLS, 'x-default': URLS[CONFIG['defaultLanguage']]}.items():
        tags.append('<link rel="alternate" hreflang="' + code + '" href="' + href + '">')
    values = {'og:type': 'website', 'og:site_name': 'Worflogy', 'og:title': title, 'og:description': description, 'og:url': URLS[lang], 'og:locale': 'ko_KR' if lang == 'ko' else 'en_US', 'og:locale:alternate': 'en_US' if lang == 'ko' else 'ko_KR', 'og:image': urljoin(BASE, CONFIG['shareImage']), 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': 'Worflogy - Workflow Ontology and Knowledge Graphs'}
    tags += ['<meta property="' + name + '" content="' + escape(value, quote=True) + '">' for name, value in values.items()]
    tags += ['<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:title" content="' + escape(title, quote=True) + '">', '<meta name="twitter:description" content="' + escape(description, quote=True) + '">', '<meta name="twitter:image" content="' + urljoin(BASE, CONFIG['shareImage']) + '">']
    tags += ['<script id="page-structured-data" type="application/ld+json">' + json.dumps(graph(lang), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>']
    return '<!-- SEO_START -->\n' + '\n'.join(tags) + '\n<!-- SEO_END -->'

class EnglishHTML(HTMLParser):
    """Preserve exact Korean text in attributes for reversible live language switching."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.raw = 0
        self.title = False
    def handle_decl(self, decl): self.out.append('<!' + decl + '>')
    def handle_comment(self, data): self.out.append('<!--' + data + '-->')
    def handle_entityref(self, name): self.out.append('&' + name + ';')
    def handle_charref(self, name): self.out.append('&#' + name + ';')
    def tag(self, tag, attrs, closing='>'):
        values = dict(attrs)
        originals = {}
        for key in ('title', 'aria-label', 'aria-roledescription', 'alt', 'placeholder', 'content'):
            if key in values and values[key] and re.search('[가-힣]', values[key]):
                originals[key] = values[key]
                values[key] = translate(values[key])
        if originals:
            values['data-i18n-attrs'] = json.dumps(originals, ensure_ascii=False, separators=(',', ':'))
        if tag == 'html': values.update(lang='en', **{'data-page-language': 'en'})
        if values.get('lang') == 'ko' and 'data-language-control' not in values: values['lang'] = 'en'
        if tag == 'title': values['data-i18n-ko'] = CONFIG['title']['ko']
        self.out.append('<' + tag + ''.join(' ' + key + ('="' + escape(value, quote=True) + '"' if value is not None else '') for key, value in values.items()) + closing)
    def handle_starttag(self, tag, attrs):
        self.tag(tag, attrs)
        if tag in ('script', 'style'): self.raw += 1
        if tag == 'title': self.title = True
    def handle_startendtag(self, tag, attrs): self.tag(tag, attrs, '/>')
    def handle_endtag(self, tag):
        self.out.append('</' + tag + '>')
        if tag in ('script', 'style'): self.raw -= 1
        if tag == 'title': self.title = False
    def handle_data(self, text):
        if self.raw or not re.search('[가-힣]', text):
            self.out.append(text)
        elif self.title:
            self.out.append(escape(translate(text)))
        else:
            self.out.append('<span data-i18n-ko="' + escape(text, quote=True) + '">' + escape(translate(text)) + '</span>')

korean = (ROOT / 'index.html').read_text(encoding='utf-8')
korean = re.sub(r'<html\b[^>]*>', '<html lang="ko" data-page-language="ko">', korean, count=1)
korean = re.sub(r'<!-- STATIC_DIAGRAMS_START -->[\s\S]*?<!-- STATIC_DIAGRAMS_END -->', '<!-- STATIC_DIAGRAMS_START -->\n' + static_diagrams() + '\n<!-- STATIC_DIAGRAMS_END -->', korean, count=1)
if '<!-- SEO_START -->' in korean:
    korean = re.sub(r'<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->', lambda _: seo('ko'), korean, count=1)
else:
    korean = re.sub(r'<meta name="description"[^>]*>\s*', '', korean, count=1)
    korean = re.sub(r'<title>[\s\S]*?</title>', lambda _: seo('ko'), korean, count=1)
parser = EnglishHTML()
parser.feed(korean)
english = ''.join(parser.out)
# These head fields are language-specific, not generic translated body text.
english = re.sub(r'<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->', lambda _: seo('en').replace('<title>', '<title data-i18n-ko="' + escape(CONFIG['title']['ko'], quote=True) + '">'), english, count=1)
english = re.sub(r'<a id="language-toggle"[\s\S]*?</a>', '<a id="language-toggle" class="language-floating" data-language-control lang="ko" hreflang="ko" href="./index.html" aria-label="한국어로 전환">한국어</a>', english, count=1)
# Metadata source values are explicitly stored for accurate English -> Korean switching.
for key, ko in [('description', CONFIG['description']['ko']), ('twitter:title', CONFIG['title']['ko']), ('twitter:description', CONFIG['description']['ko'])]:
    english = re.sub(r'(<meta name="' + re.escape(key) + r'"[^>]*)(>)', lambda m: m[1] + ' data-i18n-attrs="' + escape(json.dumps({'content': ko}, ensure_ascii=False), quote=True) + '"' + m[2], english, count=1)
for key, ko in [('og:title', CONFIG['title']['ko']), ('og:description', CONFIG['description']['ko'])]:
    english = re.sub(r'(<meta property="' + key + r'"[^>]*)(>)', lambda m: m[1] + ' data-i18n-attrs="' + escape(json.dumps({'content': ko}, ensure_ascii=False), quote=True) + '"' + m[2], english, count=1)
entries = ['  <url><loc>' + escape(href) + '</loc></url>' for href in URLS.values()]
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(entries) + '\n</urlset>\n'
(ROOT / 'index.html').write_text(korean, encoding='utf-8')
(ROOT / 'en.html').write_text(english, encoding='utf-8')
(ROOT / 'sitemap.xml').write_text(sitemap, encoding='utf-8')
(ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + urljoin(BASE, 'sitemap.xml') + '\n', encoding='utf-8')
print('Built index.html, en.html, sitemap.xml and robots.txt for ' + BASE)
