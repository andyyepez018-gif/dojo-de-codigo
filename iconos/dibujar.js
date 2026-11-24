// Dibuja los iconos de la app con Chromium: node iconos/dibujar.js
const { chromium } = require('playwright');
const path = require('path');
const TAMANOS = [
  { f: 'icono-192.png', t: 192, redondo: true, escala: 0.62 },
  { f: 'icono-512.png', t: 512, redondo: true, escala: 0.62 },
  { f: 'icono-mascara-512.png', t: 512, redondo: false, escala: 0.5 },
  { f: 'icono-180.png', t: 180, redondo: false, escala: 0.6 }
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const x of TAMANOS) {
    await p.setViewportSize({ width: x.t, height: x.t });
    await p.setContent(`<html><body style="margin:0;background:transparent">
      <div id="i" style="width:${x.t}px;height:${x.t}px;background:#2B4C9B;border-radius:${x.redondo ? x.t * 0.22 : 0}px;display:grid;place-items:center;position:relative;overflow:hidden">
        <span style="font-family:'WenQuanYi Zen Hei','IPAGothic',sans-serif;font-weight:700;color:#fff;font-size:${Math.round(x.t * x.escala)}px;line-height:1;-webkit-text-stroke:${(x.t * 0.012).toFixed(1)}px #fff;transform:translateY(-3%)">道</span>
        <span style="position:absolute;left:${x.t * 0.5 - x.t * x.escala * 0.42}px;width:${x.t * x.escala * 0.84}px;bottom:${x.t * (x.redondo ? 0.13 : 0.18)}px;height:${Math.max(3, x.t * 0.035)}px;border-radius:99px;background:#F0B540"></span>
      </div></body></html>`);
    await p.locator('#i').screenshot({ path: path.join(__dirname, x.f), omitBackground: true });
  }
  await b.close();
  console.log('iconos listos');
})();
