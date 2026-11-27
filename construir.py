"""Monta la app instalable en docs/ (lo que publica GitHub Pages) a partir de los mismos archivos que usa
la versión dentro de Claude.

    python construir.py                 # pasa las pruebas y monta docs/
    python construir.py --sin-pruebas   # solo monta (para probar rápido)

Qué cambia respecto a la versión de Claude: fuentes alojadas en la app (sin Google), política de
seguridad de contenido, manifiesto, iconos y un service worker cuya caché lleva la huella del contenido
(cualquier cambio publicado llega a las apps instaladas como «Hay una versión nueva»)."""
import hashlib, json, re, shutil, subprocess, sys, pathlib

raiz = pathlib.Path(__file__).parent
docs = raiz / 'docs'
SCRIPTS = ['motor.js', 'contenido.js', 'escribir.js', 'estudio.js', 'personalizado.js', 'ingles.js', 'habla.js', 'nucleo.js', 'ui.js', 'ejecutor.js', 'trabajador.js', 'voz.js', 'vista-ingles.js', 'vista-habla.js', 'vista-estudio.js', 'vista-examen.js', 'app.js']
PRUEBAS = ['motor', 'pseint', 'contenido', 'soluciones', 'escribir', 'estudio', 'ingles', 'habla', 'nucleo']

if '--sin-pruebas' not in sys.argv:
    for p in PRUEBAS:
        r = subprocess.run(['node', str(raiz / 'pruebas' / f'{p}.test.js')], capture_output=True, text=True)
        ultima = (r.stdout.strip().splitlines() or [''])[-1]
        print(f'  pruebas de {p}: {ultima}')
        if r.returncode != 0:
            print(r.stdout[-3000:], r.stderr[-2000:]); sys.exit(f'Las pruebas de {p} fallan: no se monta nada.')

version = re.search(r"const VERSION = '([^']+)'", (raiz / 'nucleo.js').read_text(encoding='utf-8')).group(1)
pagina = (raiz / 'index.html').read_text(encoding='utf-8')
titulo = re.search(r'<title>.*?</title>', pagina).group(0)
cuerpo = re.sub(r'<title>.*?</title>\n?', '', pagina)
cuerpo = re.sub(r'<link [^>]*>\n?', '', cuerpo)
cuerpo = re.sub(r'<meta name="claude:[^>]*>\n?', '', cuerpo)
csp = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; "
       "connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'")
cabeza = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{csp}">
<meta name="referrer" content="no-referrer">
{titulo}
<meta name="description" content="Retos de 30 segundos de PSeInt, Python y C++, inglés para programar desde cero (escucharlo y hablarlo), diez rangos de Aprendiz a Ingeniero de élite y un laboratorio que ejecuta código paso a paso.">
<meta name="theme-color" content="#2B4C9B" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1020" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Dojo">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icono-192.png">
<link rel="apple-touch-icon" href="icono-180.png">
<link rel="stylesheet" href="fuentes/fuentes.css">
<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px system-ui}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
if docs.exists(): shutil.rmtree(docs)
(docs / 'fuentes').mkdir(parents=True)
(docs / 'index.html').write_text(cabeza + cuerpo + '\n</body>\n</html>\n', encoding='utf-8')
for f in SCRIPTS: shutil.copy(raiz / f, docs / f)
for f in (raiz / 'iconos').glob('*.png'): shutil.copy(f, docs / f.name)
for f in (raiz / 'fuentes').iterdir(): shutil.copy(f, docs / 'fuentes' / f.name)
(docs / 'manifest.webmanifest').write_text((raiz / 'plantillas' / 'manifest.webmanifest').read_text(encoding='utf-8'), encoding='utf-8')
(docs / '.nojekyll').write_text('')

# Lo que se guarda para usar sin internet, y la huella de todo ello
archivos = ['./'] + sorted(str(p.relative_to(docs)).replace('\\', '/') for p in docs.rglob('*')
                           if p.is_file() and p.name not in ('.nojekyll',) and not p.name.endswith('.txt'))
huella = hashlib.sha256(b''.join((docs / a).read_bytes() for a in archivos if a != './')).hexdigest()[:10]
sw = (raiz / 'plantillas' / 'sw.js').read_text(encoding='utf-8')
sw = sw.replace('__VERSION__', f'{version}-{huella}').replace('__ARCHIVOS__', json.dumps(archivos, ensure_ascii=False))
(docs / 'sw.js').write_text(sw, encoding='utf-8')
peso = sum(p.stat().st_size for p in docs.rglob('*') if p.is_file())
print(f'docs/ montado: versión {version}, huella {huella}, {len(archivos)} archivos para usar sin internet, {peso / 1024:.0f} KB en total')
