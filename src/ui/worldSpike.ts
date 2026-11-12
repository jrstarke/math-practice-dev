// THROWAWAY SPIKE (Robo's world, release 1 blur check). Not for merging.
// A static sample world behind the whole app, with a corner button cycling blur / sharp / off and a frame-rate
// readout, so the blur's cost and the math's readability can be judged on her iPad.

const L = 'stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const tree = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L0 -26" ${L} fill="none"/><path d="M-20 -22 C-26 -44 -10 -62 0 -60 C12 -64 28 -46 20 -22 Z" fill="#7cc576" ${L}/></g>`;
const bush = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 C-30 -4 -26 -18 -14 -16 C-12 -28 6 -28 8 -18 C20 -24 30 -10 22 0 Z" fill="#5fb35a" ${L}/></g>`;
const mountain = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 L-18 -56 L0 -36 L22 -70 L64 0 Z" fill="#b9b3d6" ${L}/><path d="M22 -70 L12 -54 L22 -50 L30 -58 Z" fill="#fff" ${L}/></g>`;
const lake = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="46" ry="12" fill="#8fd0f0" ${L}/><path d="M-20 -2 L-8 -2 M6 3 L20 3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>`;
const house = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 L-22 -26 L0 -44 L22 -26 L22 0 Z" fill="#fff" ${L}/><path d="M-6 0 L-6 -14 L6 -14 L6 0" fill="#f5c76b" ${L}/></g>`;

/** One 3:4 area, horizon at 40%: far things small near the horizon, near things big and low. */
const WORLD = `<svg viewBox="0 0 270 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="spike-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient></defs>
  <rect width="270" height="145" fill="url(#spike-sky)"/><rect y="145" width="270" height="215" fill="#d8efc4"/>
  <circle cx="226" cy="42" r="16" fill="#ffe27a" ${L}/>
  ${mountain(70, 145, 0.55)}${mountain(160, 145, 0.4)}
  ${tree(205, 172, 0.5)}${house(120, 182, 0.6)}${bush(240, 200, 0.6)}
  ${tree(36, 236, 0.95)}${lake(175, 280, 1.2)}${bush(90, 318, 1.1)}${house(232, 330, 1.2)}
</svg>`;

type Mode = 'blur' | 'sharp' | 'off';
const MODES: Mode[] = ['blur', 'sharp', 'off'];
const KEY = 'spike-world-mode';

const CSS = `
html, body { background: transparent; }
.spike-world { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: -1; overflow: hidden; background: #fff8ec; pointer-events: none; }
.spike-world svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.spike-world[data-mode="blur"] svg { filter: blur(6px); transform: scale(1.06); }
.spike-world .veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(255, 248, 236, 0.5); }
.spike-world[data-mode="off"] svg, .spike-world[data-mode="off"] .veil { display: none; }
.spike-toggle { position: fixed; left: 8px; bottom: 8px; z-index: 50; font: 600 12px/1 system-ui; color: #2b2a4c;
  background: rgba(255,255,255,.85); border-radius: 8px; padding: 8px 10px; box-shadow: 0 2px 0 #e6dccb; }
`;

export function mountWorldSpike(): void {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const world = document.createElement('div');
  world.className = 'spike-world';
  world.innerHTML = `${WORLD}<div class="veil"></div>`;
  document.body.prepend(world);

  let mode: Mode = 'blur';
  try { const m = localStorage.getItem(KEY) as Mode | null; if (m && MODES.includes(m)) mode = m; } catch { /* ignore */ }
  const btn = document.createElement('button');
  btn.className = 'spike-toggle';
  document.body.append(btn);
  let fps = 0;
  const label = () => { btn.textContent = `world: ${mode} · ${fps} fps`; };
  const apply = () => { world.dataset.mode = mode; label(); };
  btn.addEventListener('click', () => {
    mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    try { localStorage.setItem(KEY, mode); } catch { /* ignore */ }
    apply();
  });
  apply();

  // Frames per second over the last second: drops show the blur costing time when things animate on top of it.
  let frames = 0, since = performance.now();
  const tick = (t: number) => {
    frames++;
    if (t - since >= 1000) { fps = Math.round((frames * 1000) / (t - since)); frames = 0; since = t; label(); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
