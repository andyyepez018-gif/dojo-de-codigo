# Dojo de código

App para aprender PSeInt, Python y C++ en ratos cortos: retos de 30 segundos para las esperas,
una ruta de 10 temas (cada idea en los tres lenguajes a la vez), un laboratorio que ejecuta el
código en el propio navegador y un plan contra el scroll. Se instala en el móvil y en el PC,
funciona sin internet y se actualiza sola.

## Cómo está hecha

- `motor.js`: el intérprete. Ejecuta lo de un primer curso de PSeInt, Python y C++ y explica los errores en español.
- `contenido.js`: las 10 lecciones, las plantillas de retos y la rama de HTML.
- `app.js` e `index.html`: la app.
- `plantillas/`: el service worker (sin internet y actualizaciones) y el manifiesto (instalación).
- `iconos/`: los iconos (`node iconos/dibujar.js` los vuelve a dibujar).
- `docs/`: la app montada, lista para publicar. Es lo que sirve GitHub Pages.

## Publicar una versión nueva

1. Cambiar `const VERSION = '…'` en `app.js`.
2. Pasar las pruebas: `node pruebas/motor.test.js`, `node pruebas/contenido.test.js` y `node pruebas/soluciones.test.js`.
3. `python construir.py` (rehace `docs/`).
4. Subir a `main`. Las apps instaladas ven el aviso «Hay una versión nueva» y se actualizan con un toque.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` y la carpeta `/docs`.
