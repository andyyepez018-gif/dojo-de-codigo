"""Monta la app instalable en docs/ (lo que publica GitHub Pages) a partir de los mismos archivos que usa
la versión dentro de Claude. Uso: python construir.py   (la versión sale de app.js: const VERSION = '…')"""
import re, shutil, pathlib
raiz = pathlib.Path(__file__).parent
docs = raiz / 'docs'
docs.mkdir(exist_ok=True)
app = (raiz / 'app.js').read_text(encoding='utf-8')
version = re.search(r"const VERSION = '([^']+)'", app).group(1)
pagina = (raiz / 'index.html').read_text(encoding='utf-8')
titulo = re.search(r'<title>.*?</title>', pagina).group(0)
enlaces = ''.join(re.findall(r'<link [^>]*>\n?', pagina))
cuerpo = re.sub(r'<title>.*?</title>\n?', '', pagina)
cuerpo = re.sub(r'<link [^>]*>\n?', '', cuerpo)
cuerpo = re.sub(r'<meta name="claude:[^>]*>\n?', '', cuerpo)
cabeza = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{titulo}
<meta name="description" content="Retos de 30 segundos de PSeInt, Python y C++, una ruta de 10 temas y un laboratorio que ejecuta código.">
<meta name="theme-color" content="#2B4C9B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Dojo">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icono-192.png">
<link rel="apple-touch-icon" href="icono-180.png">
{enlaces}<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px system-ui}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
(docs / 'index.html').write_text(cabeza + cuerpo + '\n</body>\n</html>\n', encoding='utf-8')
for f in ['motor.js', 'contenido.js', 'app.js']:
    shutil.copy(raiz / f, docs / f)
for f in (raiz / 'iconos').glob('*.png'):
    shutil.copy(f, docs / f.name)
(docs / 'manifest.webmanifest').write_text((raiz / 'plantillas' / 'manifest.webmanifest').read_text(encoding='utf-8'), encoding='utf-8')
(docs / 'sw.js').write_text((raiz / 'plantillas' / 'sw.js').read_text(encoding='utf-8').replace('__VERSION__', version), encoding='utf-8')
(docs / '.nojekyll').write_text('')
print('docs/ montado, versión', version)
