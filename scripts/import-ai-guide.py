"""Import only anonymous, rendered Oil Book content; never inspect script payloads."""
import os, argparse, concurrent.futures, hashlib, html, json, re, shutil, subprocess
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
MOTHER = Path(os.environ.get('AI_GUIDE_SOURCE_DIR', str(ROOT/'sources/ai-guide')))
ORIGIN = 'https://book.oiloil.org'
VOID = {'img','br','hr','input','meta','link','source','wbr','area','embed','param'}
class Node:
    def __init__(self,tag='',attrs=None): self.tag,self.attrs,self.children=tag,dict(attrs or []),[]
    def all(self, predicate):
        out=[]
        for c in self.children:
            if isinstance(c,Node):
                if predicate(c): out.append(c)
                out.extend(c.all(predicate))
        return out
    def text(self): return ''.join(c.text() if isinstance(c,Node) else c for c in self.children).strip()
    def cls(self,name): return name in self.attrs.get('class','').split()
class Parser(HTMLParser):
    def __init__(self,s):
        super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(s)
    def handle_starttag(self,t,a):
        n=Node(t,a);n.parent=self.stack[-1];self.stack[-1].children.append(n)
        if t not in VOID:self.stack.append(n)
    def handle_startendtag(self,t,a): self.handle_starttag(t,a);self.handle_endtag(t)
    def handle_endtag(self,t):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==t:self.stack=self.stack[:i];break
    def handle_data(self,d):self.stack[-1].children.append(d)
def fetch(url):
    if urlparse(url).hostname!='book.oiloil.org':raise ValueError('Unapproved source '+url)
    
    for attempt in range(3):
        try:return subprocess.check_output(['curl','--http1.1','--compressed','--fail','-sSL','--connect-timeout','10','--max-time','60',url])
        except subprocess.CalledProcessError:
            if attempt==2:raise
def page(path):return Parser(fetch(urljoin(ORIGIN,path)).decode()).root
def first(n,p):return next(iter(n.all(p)),None)
def inspect():
    a=first(page('/articles/ai-agent-common-operations'),lambda n:n.tag=='article')
    print([(n.tag,n.attrs.get('class'),n.attrs.get('id'),len(n.text())) for n in a.children if isinstance(n,Node)])
    h=page('/')
    print([(n.tag,n.attrs.get('class'),n.attrs.get('id')) for n in h.all(lambda n:n.attrs.get('id')=='model-dossier')])

ALLOW={'p','h2','h3','h4','h5','h6','ul','ol','li','blockquote','pre','code','strong','em','b','i','a','img','figure','figcaption','table','thead','tbody','tr','td','th','br','hr','div','span','section','details','summary','sup','sub','video','source'}
DROP={'script','style','iframe','form','button','input','noscript','svg'}
MEDIA={}
SLUGS=set()
def media(url):
    url=urljoin(ORIGIN,url)
    if urlparse(url).hostname!='book.oiloil.org':raise ValueError('External media needs review: '+url)
    ext=Path(urlparse(url).path).suffix.lower()
    if ext not in {'.svg','.png','.jpg','.jpeg','.webp','.gif','.avif','.mp4','.webm'}:raise ValueError('Unknown media '+url)
    name=hashlib.sha256(url.encode()).hexdigest()[:16]+ext
    if url not in MEDIA:MEDIA[url]={'file':name}
    return '/ai-guide/media/'+name

def clean(node):
    if isinstance(node,str):return html.escape(node)
    if node.tag=='source' and not node.attrs.get('src'):return ''
    if node.tag in DROP or 'hidden' in node.attrs or node.attrs.get('aria-hidden')=='true':return ''
    if node.attrs.get('id')=='article-paywall':return ''
    content=''.join(clean(c) for c in node.children)
    if node.tag not in ALLOW:return content
    attrs={}
    for k in ['id','alt','title','colspan','rowspan','start']:
        if k in node.attrs:attrs[k]=node.attrs[k]
    if node.tag=='a':
        href=node.attrs.get('href','')
        if href.startswith('/articles/'):
            target=href.split('/articles/',1)[1]
            href='/ai-guide/articles/'+target if target.split('#')[0].split('?')[0] in SLUGS else ORIGIN+href
        elif href.startswith('/assets/'):href=media(href)
        elif not href.startswith('#') and not re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:',href):href=urljoin(ORIGIN,href)
        if href.startswith(('https://','http://','#','/ai-guide/')):attrs['href']=href
        if href.startswith(('https://','http://')):attrs.update(target='_blank',rel='noopener noreferrer')
    if node.tag in {'img','source','video'}:
        if node.attrs.get('src'):attrs['src']=media(node.attrs['src'])
        if node.attrs.get('poster'):attrs['poster']=media(node.attrs['poster'])
        if node.tag=='video':attrs['controls']=''
        if node.tag=='img':attrs['loading']='lazy'
    return '<'+node.tag+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in attrs.items())+'>'+('' if node.tag in VOID else content+'</'+node.tag+'>')

def collect_catalog():
    rows=[]
    for path,kind in [('/articles','original'),('/curated','curated')]:
        d=page(path)
        groups=d.all(lambda n:n.tag=='section' and (n.attrs.get('aria-labelledby','').startswith('collection-category') or n.cls('collection-category') or ('ArticleCollectionContent_group__' in n.attrs.get('class',''))))
        if not groups:raise ValueError("Catalog layout changed; inspect categories before import")
        seen=set()
        for group in groups:
            heading=first(group,lambda n:n.tag=='h2')
            category=re.sub(r'^\d{2}', '', heading.text()) if heading else ('Oil 原创' if kind=='original' else '精选收录')
            for link in group.all(lambda n:n.tag=='a' and n.attrs.get('href','').startswith('/articles/')):
                slug=link.attrs['href'].split('/articles/')[1].split('#')[0]
                if slug in seen:continue
                seen.add(slug)
                card=link
                while getattr(card,'parent',None) and card.tag!='article' and card!=group:card=card.parent
                refs=[{'label':a.text() or '原始来源','url':a.attrs['href']} for a in card.all(lambda n:n.tag=='a' and n.attrs.get('href','').startswith('https://'))] if kind=='curated' else []
                rows.append({'slug':slug,'kind':kind,'category':category,'sourceUrl':ORIGIN+'/articles/'+slug,'sources':refs})
    return rows

def article(row):
    d=page(row['sourceUrl']);a=first(d,lambda n:n.tag=='article' and n.cls('reading'))
    if not a:raise ValueError('Missing visible article '+row['slug'])
    print('Article',row['slug'],flush=True)
    title=first(a,lambda n:n.tag=='h1');author=first(a,lambda n:n.cls('property-author'))
    body=first(a,lambda n:n.cls('article-content') or n.cls('article-body') or n.cls('prose') or 'ArticleBody_previewWrap' in n.attrs.get('class','') or 'ArticleBody_body' in n.attrs.get('class',''))
    if not body:
        raise ValueError('Inspect body containers '+row['slug']+' '+str([(n.tag,n.attrs.get('class')) for n in a.children if isinstance(n,Node)]))
    paywall=first(a,lambda n:n.attrs.get('id')=='article-paywall')
    cover=first(a,lambda n:n.tag=='img')
    sources=row.get('sources',[])
    cleaned=clean(body)
    headings=[{'id':n.attrs['id'],'title':n.text(),'level':int(n.tag[1])} for n in body.all(lambda n:n.tag in {'h2','h3'} and n.attrs.get('id'))]
    date=first(a,lambda n:n.tag=='time')
    return dict(row,title=title.text(),author=author.text() if author else '原作者见来源',date=date.attrs.get('datetime','') if date else '',sources=sources,html=cleaned,headings=headings,excerpt=body.text()[:140],cover=media(cover.attrs['src']) if cover else '',status='public_excerpt' if paywall else 'public_complete')

def models():
    h=page('/');out=[]
    for group in h.all(lambda n:n.cls('dispatch-slot')):
        heading=first(group,lambda n:n.tag in {'h2','h3'})
        category=re.sub(r'^\d{2}', '', heading.text()) if heading else '作者实测'
        for n in group.all(lambda n:n.cls('model-bookmark')):
            name=first(n,lambda n:n.tag=='strong')
            spans=n.all(lambda n:n.tag=='span')
            # Public button text and its visible tooltip are the captured source.
            label=spans[0] if spans else n
            children=[c for c in label.children if isinstance(c,Node)]
            name=name.text() if name else (children[0].text() if children else label.text())
            tagline=children[1].text() if len(children)>1 else ''
            out.append({'id':str(len(out)+1),'name':name,'category':category,'tagline':tagline,'description':n.attrs.get('title',''),'strengths':[],'limitations':[],'scenarios':[]})
    dossiers=json.loads((MOTHER/'models-visible.json').read_text())['rows']
    records={d['name']:d for d in dossiers}
    if len(out)!=len(dossiers) or len(records)!=len(dossiers) or {m['name'] for m in out}!=set(records):raise ValueError('Model dossiers do not match captured names')
    for model in out:
        values=records[model['name']]
        if not all(values.get(k) and isinstance(values[k],str) for k in ['strengths','limitations','scenarios']):raise ValueError('Incomplete dossier '+model['name'])
        model.update({k:values[k] for k in ['strengths','limitations','scenarios']})
    return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--inspect',action='store_true');ap.add_argument('--generate-only',action='store_true');args=ap.parse_args()
    if args.generate_only:
        shutil.copyfile(MOTHER/'catalog.json',ROOT/'src/data/ai-guide.json')
        
        if (MOTHER/'media').exists():shutil.copytree(MOTHER/'media',ROOT/'public/ai-guide/media',dirs_exist_ok=True)
        print('Generated from canonical source without network');return
    if args.inspect:inspect();return
    # Anonymous refreshes cannot replace the authorized full-text mother source.
    catalog=MOTHER/'catalog.json'
    if catalog.exists() and any(a.get('status')=='authorized_complete' for a in json.loads(catalog.read_text())['articles']):
        raise ValueError('Authorized full text exists. Update the local mother source, then use --generate-only; anonymous refresh would truncate Pro articles.')
    rows=collect_catalog();SLUGS.update(r['slug'] for r in rows);print('CATALOG',len(rows),[(x['kind'],x['category']) for x in rows],flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:articles=list(pool.map(article,rows))
    def download(item):
        url,record=item;dest=MOTHER/'media'/record['file'];dest.parent.mkdir(parents=True,exist_ok=True)
        data=dest.read_bytes() if dest.exists() else fetch(url)
        if dest.suffix=='.svg' and re.search(rb'<script|\bon\w+\s*=|javascript:|<foreignObject',data,re.I):raise ValueError('Unsafe SVG '+url)
        dest.write_bytes(data);record.update(sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(download,list(MEDIA.items())))
    result={'capturedAt':datetime.now(timezone(timedelta(hours=8))).isoformat(),'models':models(),'articles':articles}
    MOTHER.mkdir(parents=True,exist_ok=True)
    (MOTHER/'catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    (MOTHER/'media-manifest.json').write_text(json.dumps(MEDIA,ensure_ascii=False,indent=2))
    for a in articles:
        p=MOTHER/'articles'/ (a['slug']+'.html');p.parent.mkdir(exist_ok=True);p.write_text(a['html'])
    dest=ROOT/'src/data/ai-guide.json';dest.parent.mkdir(exist_ok=True);shutil.copyfile(MOTHER/'catalog.json',dest)
    if (MOTHER/'media').exists():shutil.copytree(MOTHER/'media',ROOT/'public/ai-guide/media',dirs_exist_ok=True)
    print('IMPORTED',len(articles),'MEDIA',len(MEDIA))
if __name__=='__main__':main()
