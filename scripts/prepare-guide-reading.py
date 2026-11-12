"""Decorate the checked-in article HTML for reading, without changing its text.

Run after changing src/data/ai-guide.json. This build step is local and portable.
It does not fetch content, overwrite the source records, or inspect private inputs.
"""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
VOID = {'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'embed', 'param'}
ICONS = {
    '/articles/ai-agent-common-operations': '87c54669d2252f76.png',
    'https://nextjs.org/': '0c8b6b492fb25c2e.png',
    'https://www.notion.so/': '70e0a9a3953eb1a7.png',
    'https://stripe.com/': '20ee57d4a1291704.png',
    'https://openai.com/': 'dcd85df84b3d98c3.png',
}

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)

    def images(self):
        result = [self] if self.tag == 'img' else []
        for child in self.children:
            if isinstance(child, Node):
                result.extend(child.images())
        return result

class Parser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, value):
        self.stack[-1].children.append(value)

def serialize(node):
    if isinstance(node, str):
        return html.escape(node)
    content = ''.join(serialize(child) for child in node.children)
    if not node.tag:
        return content
    attrs = ''.join(' ' + key + '="' + html.escape(value or '', quote=True) + '"' for key, value in node.attrs.items())
    return '<' + node.tag + attrs + '>' + content + ('</' + node.tag + '>' if node.tag not in VOID else '')

def wrap(parent):
    result = []
    children = parent.children
    index = 0
    while index < len(children):
        node = children[index]
        if isinstance(node, Node):
            if node.tag == 'p' and not node.text().strip() and len(node.images()) == 1:
                image = node.images()[0]
                figure = Node('figure', [('class', 'article-figure figure-diagram')])
                # Preserve any image link instead of throwing its anchor away.
                figure.children = node.children
                if index + 2 < len(children) and isinstance(children[index + 1], str) and not children[index + 1].strip() and isinstance(children[index + 2], Node) and children[index + 2].tag == 'p' and children[index + 2].text().strip() == image.attrs.get('alt'):
                    caption = Node('figcaption')
                    caption.children = children[index + 2].children
                    figure.children.append(caption)
                    index += 2
                node = figure
            elif node.tag in {'table', 'pre'}:
                container = Node('div', [('class', 'article-table' if node.tag == 'table' else 'code-block')])
                container.children = [node]
                node = container
            elif node.tag == 'a':
                key = node.attrs.get('href', '').replace('/ai-guide/articles/', '/articles/')
                if key in ICONS:
                    node.attrs['class'] = 'inline-link-with-icon'
                    icon = Node('span', [('class', 'inline-link-favicon')])
                    icon.children = [Node('img', [('src', '/ai-guide/media/' + ICONS[key]), ('alt', ''), ('width', '14'), ('height', '14')])]
                    node.children.insert(0, icon)
            if node.tag != 'figure' and node.attrs.get('class') not in {'article-table', 'code-block'}:
                wrap(node)
        result.append(node)
        index += 1
    parent.children = result

source = ROOT / 'src/data/ai-guide.json'
raw = source.read_bytes()
data = json.loads(raw)
articles = {}
for article in data['articles']:
    tree = Parser(article['html']).root
    original_text = re.sub(r'\s+', '', tree.text())
    wrap(tree)
    rendered = serialize(tree)
    assert original_text == re.sub(r'\s+', '', Parser(rendered).root.text()), article['slug']
    articles[article['slug']] = rendered
for icon in ICONS.values():
    assert (ROOT / 'public/ai-guide/media' / icon).is_file(), icon
result = {'sourceSha256': hashlib.sha256(raw).hexdigest(), 'icons': ICONS, 'articles': articles}
(ROOT / 'src/data/ai-guide-reading.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {len(articles)} article bodies; text unchanged.')
