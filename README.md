# Dojo de código

App para aprender PSeInt, Python y C++ en ratos cortos: retos de 30 segundos para las esperas, una ruta
de 10 temas (cada idea en los tres lenguajes a la vez), un laboratorio que ejecuta el código en el propio
dispositivo y lo muestra paso a paso, y un plan contra el scroll. Se instala en el móvil y en el PC,
funciona sin internet y se actualiza sola.

**App:** https://andyyepez018-gif.github.io/dojo-de-codigo/

## Qué hace

- **Retos** de cinco clases (qué muestra, completar el hueco, ordenar líneas, encontrar el error y
  traducir entre lenguajes), generados con números nuevos cada vez. El motor calcula la respuesta real,
  así que nunca hay una respuesta mal puesta.
- **Repaso espaciado:** cada tipo de reto tiene su calendario por lenguaje (vuelve en 1, 3, 7, 16 y 35
  días si lo aciertas; enseguida si lo fallas). La pantalla Hoy muestra tus puntos débiles.
- **Ruta de 10 temas** con dos ejercicios de escribir código cada uno, corregidos con pruebas.
  Cada tema dominado es un cinturón (del 10.º kyū a Shodan).
- **Laboratorio:** editor con colores, ejecución en un hilo aparte (la pantalla nunca se congela y
  se puede detener), consola que pide datos, avisos de fallos típicos y **paso a paso** con las
  variables, la función en curso y la salida de cada momento. Rama extra de HTML con vista previa.
- **Plan** basado en investigación (intenciones de implementación, práctica de recuperación,
  repaso espaciado, problemas de Parsons), lista para preparar el móvil y ajustes.

## Cómo está hecha

| Archivo | Qué es |
|---|---|
| `motor.js` | El intérprete: lo de un primer curso de PSeInt, Python (listas, diccionarios, comprensiones) y C++ (vector, string, `setprecision`). Errores y avisos en español, registro paso a paso. |
| `contenido.js` | Las 10 lecciones, los 20 ejercicios, las 44 plantillas de retos y la rama de HTML. |
| `nucleo.js` | Lógica sin pantalla: progreso (con validación y migración), repaso espaciado, rango, racha, recomendaciones. |
| `ui.js` | Piezas visuales: resaltado, editor con colores, cinturones, celebración, aspecto claro/oscuro. |
| `ejecutor.js`, `trabajador.js` | Ejecución en un hilo aparte (Web Worker) con respaldo en la página. |
| `app.js`, `index.html` | Las pantallas: Hoy, Retos, Ruta, Laboratorio y Plan. |
| `plantillas/` | Service worker (sin internet y actualizaciones) y manifiesto (instalación). |
| `fuentes/` | IBM Plex Sans/Mono y Zen Kaku Gothic New (licencia OFL), alojadas en la app. |
| `docs/` | La app montada que sirve GitHub Pages. No se edita a mano: la genera `construir.py`. |

La misma base funciona también como página dentro de Claude (ahí guarda el progreso en la cuenta y
tiene tutor); fuera de Claude guarda el progreso en el dispositivo, sin servidores ni rastreadores.

## Pruebas

```
node pruebas/motor.test.js        # 119 programas y errores típicos en los tres lenguajes
node pruebas/contenido.test.js    # miles de retos generados y comprobados con el motor
node pruebas/soluciones.test.js   # los 20 ejercicios resueltos en los tres lenguajes
node pruebas/nucleo.test.js       # progreso, migración, repaso espaciado, rango
# en un navegador (Playwright): sirve docs/ en el puerto 8770 y
node pruebas/e2e.js [carpeta-capturas]
node pruebas/claude.js            # la versión dentro de Claude, con Claude simulado
```

GitHub Actions las pasa todas en cada subida (`.github/workflows/pruebas.yml`).

## Publicar una versión nueva

1. Cambiar `VERSION` en `nucleo.js`.
2. `python construir.py` (pasa las pruebas y rehace `docs/`).
3. Subir a `main`. Las apps instaladas ven «Hay una versión nueva» y se actualizan con un toque.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` y la carpeta `/docs`.
