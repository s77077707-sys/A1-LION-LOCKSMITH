from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
from lxml import html
import html as escaping
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public'
BASE = 'https://es-locksmith.com'
PHONE = '(704) 840-2555'
NAV = [('Home','/'),('Services','/service-areas/'),('Emergency','/emergency-locksmith/'),('About','/about-us/'),('Blog','/blog-posts/'),('Contact','/contact-us/')]
BLOG_PATHS = ['/exploring-the-differences-between-smart-locks-and-regular-locks/', '/emergency-locksmith-help-in-charlotte-nc/']
POLICY_CONTENT = """<section><h2>Information you send us</h2><p>If you use the contact form, we collect the name, phone number, message, and any email address you choose to provide. We use this information to review your request, contact you, and discuss locksmith service or a quote. Do not include payment card details or other sensitive information in the form.</p></section><section><h2>How the form works</h2><p>Form submissions are sent by email to A-1 Lion Locksmith using Resend. The website is hosted on Vercel, which may process technical request information, such as an IP address and browser details, to deliver and protect the site. Submitted messages may be kept in our business email as needed to handle inquiries and related records.</p></section><section><h2>Questions about your information</h2><p>To ask about information you sent through this site, email <a href="mailto:a1lionlocksmith@gmail.com">a1lionlocksmith@gmail.com</a> or call <a href="tel:+17048402555">(704) 840-2555</a>. This notice describes this website's current contact form and may be updated when the site's features change.</p></section>"""
TERMS_CONTENT = """<section><h2>Using this website</h2><p>The information on this site describes locksmith services and service areas. It is general information and does not guarantee that a particular service, arrival time, or price is available for your situation. Call us to confirm availability, timing, the scope of work, and an estimate before service begins.</p></section><section><h2>Requests and estimates</h2><p>Sending a contact request does not create a service appointment or a binding quote. We may need more details about the property, vehicle, lock, or key before discussing the work. You must be authorized to request access or work on the property or vehicle.</p><p>If anyone is in immediate danger, contact emergency services first.</p></section><section><h2>Contact</h2><p>Questions about this website or a service request? Call <a href="tel:+17048402555">(704) 840-2555</a> or email <a href="mailto:a1lionlocksmith@gmail.com">a1lionlocksmith@gmail.com</a>.</p></section>"""
SERVICE_CONTENT = {
    '/emergency-locksmith/': '''<section><h2>Help with urgent lock and key problems</h2><p>Locked out of a home, business, or vehicle? Move to a safe place and call us with your location and a description of the problem. We can confirm current availability, discuss the likely approach, and explain pricing before work begins.</p><p>If someone is in immediate danger, or a child or pet is trapped in a vehicle, call emergency services first.</p></section><section><h2>Common situations</h2><ul><li>Home, office, and vehicle lockouts</li><li>Keys broken in a lock</li><li>Lost keys and concerns about access</li><li>Damaged or malfunctioning locks</li></ul><p>The options depend on the lock, key, and proof of authorization. You can also read our <a href="/emergency-locksmith-help-in-charlotte-nc/">Charlotte emergency locksmith guide</a> before calling.</p></section>''',
    '/automotive-locksmith/': '''<section><h2>Vehicle lock and key assistance</h2><p>Call with your vehicle's make, model, year, and location. Tell us whether the key is inside, lost, damaged, or stuck, and whether you have a spare. We can discuss what service may be available for that vehicle and the expected cost.</p></section><section><h2>What to ask about</h2><ul><li>Access to a locked vehicle or trunk</li><li>Lost or broken car keys</li><li>Key duplication or replacement</li><li>Lock or ignition problems</li></ul><p>Key types and vehicle security systems vary. Confirm the specific service, availability, timing, and price by phone. Have proof that you are authorized to access the vehicle ready.</p></section>''',
    '/residential-locksmith/': '''<section><h2>Locksmith help for your home</h2><p>For a lockout, damaged lock, missing key, or move into a new home, call and describe the door and hardware. We can discuss options such as entry, rekeying, repair, or replacement, depending on the condition of the lock.</p></section><section><h2>Choosing the right service</h2><p>Rekeying can change which key operates a suitable lock. Replacement may make more sense if the hardware is worn or damaged. If you are considering a deadbolt or smart lock, tell us the door type and what you want to improve. We will discuss the available options and an estimate before work begins.</p><p>Be ready to show that you are authorized to access the property.</p></section>''',
    '/commercial-locksmith/': '''<section><h2>Locks and access for Charlotte businesses</h2><p>Business access needs vary by building and hardware. Call with the location, door or lock type, and the issue you need to solve. We can discuss lockout assistance, rekeying, repair, replacement, and key control options.</p></section><section><h2>Plan for your property</h2><p>For a change in tenants or staff, ask whether rekeying or a new key system is appropriate. For damaged hardware or an access problem, describe the current setup and any security requirements. We can confirm which work is available and discuss timing and pricing before a visit.</p><p>Have authorization from the business or property owner available.</p></section>''',
    '/locksmith-in-charlotte/': '''<section><h2>Lock and key services in Charlotte</h2><p>We help customers describe a home, business, or vehicle access problem and choose a practical next step. For a lockout, first make sure you are safe. If anyone is in immediate danger, call emergency services.</p><p>For home or business locks, tell us if the key is missing, the lock is damaged, or access needs to change. For a vehicle, have its make, model, year, and location ready. Call to confirm service availability, timing, and an estimate.</p></section><section><h2>Explore our services</h2><p>Read about <a href="/residential-locksmith/">residential</a>, <a href="/commercial-locksmith/">commercial</a>, <a href="/automotive-locksmith/">automotive</a>, and <a href="/emergency-locksmith/">urgent locksmith</a> services, or see our <a href="/service-areas/">service areas</a>.</p></section>'''
}

def fetch(url):
    result = subprocess.run(['curl','-fsSL','--max-time','35',url],capture_output=True)
    if result.returncode: print('FETCH FAILED', url, result.stderr.decode()[:100])
    return result.stdout

def paths_from_sitemap(filename):
    tree = ET.parse(filename)
    return [urlparse(node.text).path for item in tree.getroot() if item.tag.endswith('url') for node in item if node.tag.endswith('loc') and node.text and urlparse(node.text).netloc == 'es-locksmith.com']

SNAPSHOT = ROOT / 'src' / 'snapshot.json'

def tidy(s):
    return re.sub(r'\s+', ' ', s or '').strip()

def parse(entry):
    path, raw = entry
    if not raw: raise RuntimeError('Missing source: ' + path)
    doc = html.fromstring(raw)
    title = tidy(doc.xpath('string(//title)'))
    desc = tidy(doc.xpath('string(//meta[@name="description"]/@content)'))
    main = doc.xpath('//main[@id="content"]')
    if not main: raise RuntimeError('Missing main: ' + path)
    headings = []
    for e in main[0].xpath('.//h1|.//h2|.//h3'):
        s = tidy(e.text_content())
        if s and s not in headings: headings.append(s)
    blocks, seen = [], set()
    for e in main[0].xpath('.//p|.//li'):
        if e.xpath('ancestor::*[contains(@class,"elementor-form") or contains(@class,"elementor-nav-menu") or contains(@class,"testimonial") or contains(@class,"review")]'): continue
        s = tidy(e.text_content())
        if len(s) < 35 or s in seen: continue
        seen.add(s)
        blocks.append(s)
    # Keep original page copy while dropping repeated site-wide promotional snippets.
    return {'path':path,'title':title,'description':desc,'heading':headings[0] if headings else title.split('|')[0].strip(),'headings':headings[1:],'paragraphs':blocks[:45]}

if '--refresh' in sys.argv:
    paths = list(dict.fromkeys(paths_from_sitemap('/tmp/a1-pages.xml') + paths_from_sitemap('/tmp/a1-posts.xml')))
    with ThreadPoolExecutor(max_workers=4) as pool:
        data = list(map(parse, zip(paths, pool.map(lambda p: fetch(BASE+p), paths))))
    SNAPSHOT.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
else:
    data = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    paths = [d['path'] for d in data]
assert len(paths) == 35, len(paths)

def esc(s): return escaping.escape(s or '', quote=True)
def link(label, path): return f'<a href="{esc(path)}">{esc(label)}</a>'

def page(d):
    path=d['path']; home=path=='/'
    category='Charlotte locksmith services' if home else ('Service area' if path.endswith('-locksmith/') and path not in ['/emergency-locksmith/','/automotive-locksmith/','/commercial-locksmith/','/residential-locksmith/'] else 'A-1 Lion Locksmith')
    intro=d['description'] or (d['paragraphs'][0] if d['paragraphs'] else 'A-1 Lion Locksmith serves Charlotte, NC. Call (704) 840-2555 to discuss availability and pricing.')
    if path=='/about-us/': intro='Learn about A-1 Lion Locksmith and our locksmith services for Charlotte homes, businesses, and vehicles.'
    if path=='/contact-us/': intro='Call A-1 Lion Locksmith to discuss locksmith service in Charlotte and nearby communities, or send us a request for a quote.'
    if path=='/privacy-policy/': intro='How A-1 Lion Locksmith handles information submitted through this website.'
    if path=='/terms-and-conditions/': intro='Information about using this website and requesting locksmith service.'
    if len(intro)>175:
        sentences=re.split(r'(?<=[.!?])\s+',intro)
        if len(sentences)>1 and len(sentences[0])<=175: intro=sentences[0]
    h1=d['heading']
    if home: h1='Locksmith services in Charlotte, NC'
    if path=='/about-us/': h1='About A-1 Lion Locksmith'
    title='Locksmith Services in Charlotte, NC | A-1 Lion Locksmith' if home else ('About A-1 Lion Locksmith | Charlotte, NC' if path=='/about-us/' else d['title'])
    body=''
    article=path=='/emergency-locksmith-help-in-charlotte-nc/'
    paras=[] if home or article or path in SERVICE_CONTENT else d['paragraphs']
    body+=SERVICE_CONTENT.get(path, '')
    if path=='/privacy-policy/': body+=POLICY_CONTENT
    if path=='/terms-and-conditions/': body+=TERMS_CONTENT
    if path=='/about-us/':
        body+='''<section><h2>Lock and key help in the Charlotte area</h2><p>A-1 Lion Locksmith provides residential, commercial, automotive, and emergency locksmith services in Charlotte and nearby communities. Call us with your location and a description of the lock or key problem so we can discuss current availability, timing, and pricing.</p><p>We can talk through options such as entry, rekeying, repair, and replacement depending on the hardware and situation. For vehicle work, have the make, model, year, and location ready. We ask customers to show that they are authorized to access the property or vehicle.</p><p>Explore our <a href="/service-areas/">service areas</a> or <a href="/contact-us/">contact us</a> to request a quote.</p></section>'''
    if home:
        body+='<section class="service-grid" aria-label="Locksmith services">'+''.join(f'<a class="service-card" href="/{x}-locksmith/"><span>{label}</span><span aria-hidden="true">↗</span></a>' for x,label in [('emergency','Emergency locksmith'),('residential','Residential locksmith'),('automotive','Automotive locksmith'),('commercial','Commercial locksmith')])+'</section>'
        body+='''<section><h2>Lock and key help in Charlotte</h2><p>Locked out, replacing a lost key, or updating the locks at your home or business? Tell us your location and what happened. We can discuss service options, current availability, and pricing before work begins.</p><p>For vehicle service, have the year, make, model, and location ready. For a home or business, describe the door, lock, or key problem and whether you have another way inside.</p></section><section><h2>What happens when you call</h2><p>We ask a few questions about the lock or key issue, confirm where service is needed, and discuss timing and an estimate. Bring proof that you are authorized to access the property or vehicle.</p></section><section><h2>Common questions</h2><h3>Can you help with a car lockout?</h3><p>Call with your vehicle details and location so we can confirm the available options and timing.</p><h3>Can I request a quote online?</h3><p>When online requests are available, the form appears below. For an urgent lockout, call directly.</p></section>'''
    if path.endswith('-locksmith/') and path not in ['/emergency-locksmith/','/automotive-locksmith/','/commercial-locksmith/','/residential-locksmith/']:
        body+='<p class="notice">Call for current availability and a quote in your area.</p>'
    if path in ['/site-map/','/service-areas/','/blog-posts/']:
        selected = paths if path=='/site-map/' else ([p for p in paths if p.endswith('-locksmith/') and p not in ['/emergency-locksmith/','/automotive-locksmith/','/commercial-locksmith/','/residential-locksmith/']] if path=='/service-areas/' else BLOG_PATHS)
        body+='<div class="link-grid">'+''.join(link(next(x['heading'] for x in data if x['path']==p),p) for p in selected if p!=path)+'</div>'
    if article:
        body+='<figure class="article-image"><img src="/emergency-locksmith.webp" alt="Charlotte skyline and emergency locksmith services" width="1024" height="1024" decoding="async" fetchpriority="low"></figure>'
        body+='''<article class="article-copy"><p>A lockout can happen at home, at work, or with a vehicle. First move to a safe place. If there is immediate danger, or a child or pet is trapped in a vehicle, call emergency services. For other lock and key problems in Charlotte, call A-1 Lion Locksmith at <a href="tel:+17048402555">(704) 840-2555</a> to discuss availability, timing, and pricing.</p><h2>What to do when you are locked out</h2><p>For a home lockout, check whether another authorized entrance or a spare key with someone you trust is available. Avoid forcing the door or removing the lock. If you rent, contact your property manager about access rules.</p><p>For a business lockout, contact the owner or authorized manager. Keep any access cards or broken keys for inspection. For a vehicle, note the make, model, year, and exact location. Tell us whether the key is inside, lost, or broken in the lock.</p><h2>Information to have ready when you call</h2><ul><li>Your location and a phone number where you can be reached</li><li>Whether the issue involves a home, business, or vehicle</li><li>Where the key is and whether the lock or door is damaged</li><li>Any access or parking details that could affect the visit</li></ul><p>Be prepared to show that you are authorized to enter the property or vehicle. Ask about the service call charge, estimated total, arrival window, and any parts that may be needed. Confirm the work and price before it begins.</p><h2>After the lockout</h2><p>A lost key can raise a security concern, while a key that sticks or breaks may point to worn hardware. Ask whether <a href="/residential-locksmith/">rekeying or lock repair</a> fits your situation. For vehicle access or keys, see our <a href="/automotive-locksmith/">automotive services</a>. Business owners can review <a href="/commercial-locksmith/">commercial locksmith services</a>.</p><p>Keep a spare key in a secure place with someone you trust. If a key is missing, ask whether rekeying or replacement makes sense. For immediate help, call <a href="tel:+17048402555">(704) 840-2555</a>.</p></article>'''
    # Exclude claims from older public copy that need separate operational verification.
    unverified = re.compile(r'\bleading locksmith\b|\b24\s?/?\s?7\b|\b24hour\b|\bwithin (?:a few|\d+) minutes\b|\bfast response times\b|\bavailable all the time\b|\blicensed and insured team\b|\ball our locksmiths are licensed and insured\b',re.I)
    if path in ['/about-us/','/privacy-policy/','/terms-and-conditions/']: paras=[]
    for p in paras:
        if unverified.search(p) or 'Your email address will not be published' in p or 'Save my name, email, and website' in p: continue
        if path=='/contact-us/':
            p=p.replace('form above', 'online request form when available').replace('free estimate', 'quote')
        body+=f'<p>{esc(p)}</p>'
    if not paras and not body: body='<p>Call us for locksmith service availability and a quote in Charlotte, NC.</p>'
    if path in ['/','/contact-us/']:
        body+='''<section class="contact" id="contact"><h2>Request a quote</h2><p>Tell us what you need. For urgent help, call directly.</p><p id="form-availability">Online requests are temporarily unavailable. Please call <a href="tel:+17048402555">(704) 840-2555</a>.</p><form id="contact-form" hidden><label>Name <input name="name" autocomplete="name" required></label><label>Phone <input name="phone" type="tel" autocomplete="tel" required></label><label>Email <input name="email" type="email" autocomplete="email"></label><label>How can we help? <textarea name="message" rows="5" required></textarea></label><label class="trap" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label><button type="submit">Send request</button><p id="form-status" role="status" aria-live="polite"></p></form></section>'''
    canonical=BASE+path
    ld=json.dumps({'@context':'https://schema.org','@type':'Locksmith','name':'A-1 Lion Locksmith','url':BASE+'/','telephone':'+17048402555','email':'a1lionlocksmith@gmail.com','areaServed':{'@type':'City','name':'Charlotte','address':{'@type':'PostalAddress','addressLocality':'Charlotte','addressRegion':'NC','addressCountry':'US'}}},separators=(',',':'))
    robots='<meta name="robots" content="noindex,follow">' if path=='/thank-you/' else ''
    contact_cta='<a class="button secondary" href="#contact">Request a quote</a>' if path=='/contact-us/' else '<a class="button secondary" href="/contact-us/">Contact us</a>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><meta name="description" content="{esc(intro)}">{robots}<link rel="canonical" href="{esc(canonical)}"><meta property="og:type" content="{'article' if article else 'website'}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(intro)}"><meta property="og:url" content="{esc(canonical)}"><link rel="stylesheet" href="/style.css"><script type="application/ld+json">{ld}</script><script src="/site.js" defer></script></head><body><a class="skip" href="#main">Skip to content</a><header class="header"><div class="bar"><a class="brand" href="/" aria-label="A-1 Lion Locksmith home"><span>A-1 <b>Lion</b></span><small>LOCKSMITH · NC LICENSE #2313</small></a><button class="menu" aria-expanded="false" aria-controls="nav" type="button">Menu ☰</button><nav id="nav" aria-label="Main navigation">{''.join(link(n,u) for n,u in NAV)}</nav><a class="call" href="tel:+17048402555">Call {PHONE}</a></div></header><main id="main"><section class="hero{' article-hero' if article else ''}"><div class="wrap"><p class="eyebrow">{esc(category)}</p><h1>{esc(h1)}</h1><p class="lead">{esc(intro)}</p><div class="hero-actions"><a class="button" href="tel:+17048402555">Call {PHONE}</a>{contact_cta}</div></div></section><div class="wrap"><div class="content">{body}</div><aside class="cta"><strong>Need a locksmith?</strong><p>Call to confirm availability, timing, and pricing before work begins.</p><a href="tel:+17048402555">{PHONE} →</a></aside></div></main><footer><div class="wrap foot"><div><strong>A-1 Lion Locksmith</strong><p>Charlotte, NC · NC Locksmith License #2313</p><a href="tel:+17048402555">{PHONE}</a> · <a href="mailto:a1lionlocksmith@gmail.com">Email us</a></div><div>{link('Privacy policy','/privacy-policy/')} {link('Terms','/terms-and-conditions/')} {link('Site map','/site-map/')}</div></div></footer><a class="mobile-call" href="tel:+17048402555">Call {PHONE}</a></body></html>'''

OUT.mkdir(exist_ok=True)
for d in data:
    target=OUT / d['path'].strip('/') / 'index.html' if d['path']!='/' else OUT/'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page(d), encoding='utf-8')
(OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{BASE+p}</loc></url>' for p in paths if p!='/thank-you/')+'</urlset>',encoding='utf-8')
(OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://es-locksmith.com/sitemap.xml\n')
print(f'Built {len(data)} URLs in {OUT}')
