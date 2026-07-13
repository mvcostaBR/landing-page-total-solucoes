from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
import json, re, subprocess, sys

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text(encoding='utf-8')
checks: list[tuple[str, bool]] = []

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]; self.hrefs=[]; self.srcs=[]; self.forms=0
        self.in_jsonld=False; self.jsonld=[]; self._buf=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if 'href' in a: self.hrefs.append(a['href'])
        if 'src' in a: self.srcs.append(a['src'])
        if tag == 'form': self.forms += 1
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_jsonld=True; self._buf=[]
    def handle_data(self, data):
        if self.in_jsonld: self._buf.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_jsonld:
            self.jsonld.append(''.join(self._buf)); self.in_jsonld=False

parser=Parser(); parser.feed(html)

def check(name, condition):
    checks.append((name, bool(condition)))

check('Idioma pt-BR', 'lang="pt-BR"' in html)
check('Viewport responsivo', '<meta name="viewport"' in html)
check('Sem formulários', parser.forms == 0)
check('Um H1', len(re.findall(r'<h1\b', html, flags=re.I)) == 1)
check('IDs sem duplicidade', len(parser.ids) == len(set(parser.ids)))
internal = [h[1:] for h in parser.hrefs if h.startswith('#') and len(h)>1]
check('Âncoras internas válidas', all(x in set(parser.ids) for x in internal))
check('CTA principal exato', html.count('Garantir Meu Ar Puro Agora') >= 6)
check('CTA secundário exato', 'Tenho outro modelo (Consultar valor)' in html)
primary_msg='Olá! Vim pela página da Total Soluções Prediais e quero agendar a higienização do meu ar condicionado Split para proteger a saúde da minha família. Podem me passar as orientações?'
secondary_msg='Olá! Vi a tabela de preços, mas tenho um modelo de ar condicionado diferente/com outras especificações. Gostaria de saber os valores para higienização.'
check('Mensagem principal exata', primary_msg in unquote(html))
check('Mensagem secundária exata', secondary_msg in unquote(html))
for value in ['R$350,00','R$450,00','R$150,00','Barra','Recreio','Freguesia','Leblon','São Conrado','Joá','Jardim Botânico','Lagoa','Botafogo','08h às 18h']:
    check(value, value in html)
check('Analogia obrigatória', 'Respirar o ar de um equipamento sujo pode ser comparado a beber água contaminada' in html)
check('GTM placeholder sem ID inventado', 'data-gtm-id=""' in html)
check('GA4 placeholder sem ID inventado', 'data-ga4-id=""' in html)
check('Google Ads placeholders sem IDs inventados', 'data-google-ads-id=""' in html and 'data-google-ads-label=""' in html)
check('Ordem consentimento → analytics → app', html.index('assets/js/consent.js') < html.index('assets/js/analytics.js') < html.index('assets/js/app.js'))

consent=(root/'assets/js/consent.js').read_text(encoding='utf-8')
analytics=(root/'assets/js/analytics.js').read_text(encoding='utf-8')
check('Consent Mode v2 completo', all(x in consent for x in ['analytics_storage','ad_storage','ad_user_data','ad_personalization']))
check('Conversão Google Ads separada', 'google_ads_whatsapp_conversion' in analytics)
check('Evento GA4 generate_lead', 'generate_lead' in analytics)
check('UTMs permitidos e click IDs protegidos', 'utm_source' in analytics and 'gclid_present' in analytics and '"gclid"' in analytics)
check('Enhanced Conversions desativado', 'enhancedConversions: false' in analytics and 'enhanced_conversions: false' in analytics)
check('Sem envio de user_data', 'user_data' not in analytics)

# JSON-LD externo e inline sincronizados.
external_schema=json.load(open(root/'schema.json', encoding='utf-8'))
inline_schema=json.loads(parser.jsonld[0]) if parser.jsonld else None
check('JSON-LD válido e sincronizado', inline_schema == external_schema)

for f in ['config/measurement-ids.example.json','config/gtm-blueprint.json','config/ga4-events.json','config/google-ads-conversions.json','config/utm-policy.json','config/remarketing-audiences.json','site.webmanifest']:
    json.load(open(root/f, encoding='utf-8'))
check('Arquivos JSON válidos', True)

# Assets locais usados no HTML.
missing=[]
for ref in parser.hrefs + parser.srcs:
    if ref.startswith(('http://', 'https://', '//', 'mailto:', 'tel:', 'data:', '#')):
        continue
    clean=ref.split('?',1)[0].split('#',1)[0]
    if clean in ['', '/', '/higienizacao-split']:
        continue
    p=root/clean.lstrip('./').lstrip('/')
    if not p.exists(): missing.append(clean)
check('Assets locais existentes', not missing)

# Sintaxe JS.
node_ok=True
for f in ['app.js','consent.js','analytics.js']:
    p=subprocess.run(['node','--check',str(root/'assets/js'/f)],capture_output=True,text=True)
    node_ok &= p.returncode == 0
    if p.returncode: print(p.stderr)
check('JavaScript ES6 sintaticamente válido', node_ok)

# Validação simples de equilíbrio de chaves CSS.
css_ok=True
for f in ['critical.css','main.css']:
    text=(root/'assets/css'/f).read_text(encoding='utf-8')
    css_ok &= text.count('{') == text.count('}')
check('CSS com blocos equilibrados', css_ok)

failed=[name for name,ok in checks if not ok]
for name,ok in checks:
    print(f"[{'OK' if ok else 'FAIL'}] {name}")
print(f'\nResultado: {len(checks)-len(failed)}/{len(checks)} verificações aprovadas')
if missing: print('Assets ausentes:', ', '.join(missing))
if failed:
    print('Falhas:', ', '.join(failed))
    sys.exit(1)
