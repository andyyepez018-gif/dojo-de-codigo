# Dojo de código

App para aprender PSeInt, Python y C++ en ratos cortos: retos de 30 segundos para las esperas, una ruta
de 10 temas (cada idea en los tres lenguajes a la vez), un laboratorio que ejecuta el código en el propio
dispositivo y lo muestra paso a paso, **inglés para programar desde cero** (escucharlo, leerlo, escribirlo
y hablarlo), **diez rangos por puntos** de Aprendiz a Ingeniero de élite, y un plan contra el scroll. Se
instala en el móvil y en el PC, funciona sin internet y se actualiza sola.

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
- **Exámenes de ascenso:** cada rango dice qué debe saber quien lo tiene (código, inglés y habla) y su
  examen lo evalúa: de 12 a 36 preguntas mezcladas, sin tutor ni pistas, sin saber si aciertas hasta el
  final, con nota mínima del 70 % al 85 %. Llegar a los puntos solo abre el examen; subir exige aprobarlo.
  Salir a mitad o cerrar la app cuenta como suspenso. Suspender resta el 10 % de los puntos del rango y
  deja un repaso obligatorio de lo fallado (con explicaciones); terminado el repaso y recuperados los
  puntos de antes, se puede repetir.
- **Habla de programador:** seis bloques (lo básico del código, errores y depuración, Git y revisiones,
  calidad, producto y equipo, sistemas en producción) con 48 términos en español e inglés y 24
  situaciones de trabajo: lo que no se dice y cómo lo dice un profesional, en los dos idiomas.
- **Rangos y puntos:** diez rangos (Aprendiz, Estudiante de código, Pasante, Programador junior,
  Programador, Programador senior, Ingeniero de software, Ingeniero senior, Arquitecto de software e
  Ingeniero de élite, a partir de 30.000 puntos). Acertar suma (más en racha) y fallar resta: un reto de
  código −5, un ejercicio de inglés o de habla −4, un ejercicio del laboratorio que no pasa −5, una
  frase mal dicha o una respuesta no entendida en una conversación −2. Si los puntos bajan del mínimo de
  tu rango, bajas de rango. Todos los valores están en `PUNTOS` y `RANGOS` (`nucleo.js`) y la app los
  muestra desde ahí.
- **Inglés para programar:** 12 unidades del A1 al B1 técnico (saludar, leer código en voz alta, el
  teclado, las palabras del código, verbos, explicar código, mensajes de error reales, pedir ayuda,
  commits en pasado, planes, la reunión diaria y documentación): 144 palabras con su pronunciación,
  72 frases, gramática mínima y una conversación guiada por unidad. Nueve clases de ejercicio
  (significado, cómo se dice, escucha, ordenar, completar, traducir, dictado, hablar y leer un error),
  con repaso espaciado. Para hablar usa el micrófono: marca en verde y rojo las palabras que se
  entendieron. Dentro de Claude usa la voz y el dictado de Claude y permite una conversación libre con
  Claude; en la app instalada, la voz y el reconocimiento del navegador. Sin voz ni micrófono se sigue
  pudiendo hacer todo leyendo y escribiendo.
- **Plan** basado en investigación (intenciones de implementación, práctica de recuperación,
  repaso espaciado, problemas de Parsons), lista para preparar el móvil y ajustes.

## Cómo está hecha

| Archivo | Qué es |
|---|---|
| `motor.js` | El intérprete: lo de un primer curso de PSeInt, Python (listas, diccionarios, comprensiones) y C++ (vector, string, `setprecision`). Errores y avisos en español, registro paso a paso. |
| `contenido.js` | Las 10 lecciones, los 20 ejercicios, las 44 plantillas de retos y la rama de HTML. |
| `ingles.js` | El curso de inglés: 12 unidades, mensajes de error, comparadores tolerantes (mayúsculas, signos, contracciones, números) y el generador de ejercicios. |
| `nucleo.js` | Lógica sin pantalla: progreso (con validación y migración), puntos y rangos, repaso espaciado, inglés, racha, recomendaciones. |
| `ui.js` | Piezas visuales: resaltado, editor con colores, cinturones, insignias de rango, celebración, aspecto claro/oscuro. |
| `habla.js` | Habla de programador: los 6 bloques de términos y situaciones y su generador de ejercicios. |
| `vista-habla.js`, `vista-examen.js` | Las pantallas de Habla y del examen de ascenso (con su repaso). |
| `voz.js` | Oír y hablar inglés: voz y dictado de Claude o del navegador, con respaldo sin voz. |
| `vista-ingles.js` | La pantalla de Inglés: unidades, práctica, hablar y conversación. |
| `ejecutor.js`, `trabajador.js` | Ejecución en un hilo aparte (Web Worker) con respaldo en la página. |
| `app.js`, `index.html` | Las pantallas: Hoy, Retos, Inglés, Habla, Ruta, Laboratorio, Plan y el examen de ascenso. |
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
node pruebas/ingles.test.js       # el curso de inglés: contenido, comparadores y miles de ejercicios
node pruebas/habla.test.js        # habla de programador: términos, situaciones y ejercicios
node pruebas/nucleo.test.js       # progreso, migración, rangos y exámenes, repaso espaciado, inglés y habla
# en un navegador (Playwright): sirve docs/ en el puerto 8770 y
node pruebas/e2e.js [carpeta-capturas]
node pruebas/claude.js            # la versión dentro de Claude, con Claude simulado (también su voz y su dictado)
# pruebas/robot-ingles.js: voz y micrófono simulados y un alumno robot que responde cualquier ejercicio
```

GitHub Actions las pasa todas en cada subida (`.github/workflows/pruebas.yml`).

## Publicar una versión nueva

1. Cambiar `VERSION` en `nucleo.js`.
2. `python construir.py` (pasa las pruebas y rehace `docs/`).
3. Subir a `main`. Las apps instaladas ven «Hay una versión nueva» y se actualizan con un toque.

GitHub Pages: Settings → Pages → Deploy from a branch → `main` y la carpeta `/docs`.
