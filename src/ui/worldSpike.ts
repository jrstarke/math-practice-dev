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
const SCENE = `<defs><linearGradient id="spike-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient>
  <filter id="spike-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2"/></filter></defs>`;
const LAND = `<rect width="270" height="145" fill="url(#spike-sky)"/><rect y="145" width="270" height="215" fill="#d8efc4"/>
  <circle cx="226" cy="42" r="16" fill="#ffe27a" ${L}/>
  ${mountain(70, 145, 0.55)}${mountain(160, 145, 0.4)}
  ${tree(205, 172, 0.5)}${house(120, 182, 0.6)}${bush(240, 200, 0.6)}
  ${tree(36, 236, 0.95)}${lake(175, 280, 1.2)}${bush(90, 318, 1.1)}${house(232, 330, 1.2)}`;
const svg = (blurred: boolean) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 360" preserveAspectRatio="xMidYMid slice">${SCENE}${blurred ? `<g filter="url(#spike-blur)">${LAND}</g>` : LAND}</svg>`;
/** The blur baked into a picture once: painting a picture is cheap, re-running a blur every frame is not. */
const bakedBlur = () => `<img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg(true))}">`;

type Mode = 'blur' | 'blur+card' | 'sharp' | 'sharp+card' | 'blur-live' | 'off';
const MODES: Mode[] = ['blur', 'blur+card', 'sharp', 'sharp+card', 'blur-live', 'off'];
const NAMES: Record<Mode, string> = {
  blur: 'blur (baked, fix)', 'blur+card': 'blur + card', sharp: 'sharp', 'sharp+card': 'sharp + card',
  'blur-live': 'blur (live, first test)', off: 'off',
};
const KEY = 'spike-world-mode';

const CSS = `
html, body { background: transparent; }
.spike-world { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: -1; overflow: hidden; background: #fff8ec; pointer-events: none; }
/* Its own layer (except the live-blur mode, which is the first test as it was), so things moving above never repaint it. */
.spike-world:not([data-mode="blur-live"]) { will-change: transform; transform: translateZ(0); }
.spike-world svg, .spike-world img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.spike-world[data-mode="blur-live"] svg { filter: blur(6px); transform: scale(1.06); }
.spike-world .veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(255, 248, 236, 0.5); }
.spike-world[data-card] .veil { background: rgba(255, 248, 236, 0.15); }
/* The card: a soft white panel behind the problem, drawn behind it so nothing moves. */
body[data-spike-card] .problem { position: relative; isolation: isolate; }
body[data-spike-card] .problem::before { content: ''; position: absolute; left: -22px; right: -22px; top: -18px; bottom: -14px;
  z-index: -1; background: rgba(255, 255, 255, 0.92); border-radius: 18px; box-shadow: 0 3px 0 #e6dccb; }
body[data-spike-card] .answer-row .cell:empty { background: #fff3dd; }
.spike-toggle { position: fixed; left: 8px; bottom: 8px; z-index: 50; display: flex; gap: 6px; align-items: center;
  font: 600 12px/1 system-ui; color: #2b2a4c; background: rgba(255,255,255,.88); border-radius: 8px; padding: 6px 8px; box-shadow: 0 2px 0 #e6dccb; }
.spike-toggle select { font: inherit; }
`;

export function mountWorldSpike(): void {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const world = document.createElement('div');
  world.className = 'spike-world';
  document.body.prepend(world);

  let mode: Mode = 'blur';
  try { const m = localStorage.getItem(KEY) as Mode | null; if (m && MODES.includes(m)) mode = m; } catch { /* ignore */ }
  const box = document.createElement('label');
  box.className = 'spike-toggle';
  const select = document.createElement('select');
  select.innerHTML = MODES.map(m => `<option value="${m}">${NAMES[m]}</option>`).join('');
  const fpsEl = document.createElement('span');
  box.append('world:', select, fpsEl);
  document.body.append(box);
  const apply = () => {
    select.value = mode;
    world.dataset.mode = mode;
    const card = mode.endsWith('+card');
    world.toggleAttribute('data-card', card);
    document.body.toggleAttribute('data-spike-card', card);
    const blurred = mode === 'blur' || mode === 'blur+card';
    world.innerHTML = mode === 'off' ? '' : `${blurred ? bakedBlur() : svg(false)}<div class="veil"></div>`;
  };
  select.addEventListener('change', () => {
    mode = select.value as Mode;
    try { localStorage.setItem(KEY, mode); } catch { /* ignore */ }
    apply();
  });
  apply();

  // Frames per second over the last second: drops show the blur costing time when things move on top of it.
  let frames = 0, since = performance.now();
  const tick = (t: number) => {
    frames++;
    if (t - since >= 1000) { fpsEl.textContent = `${Math.round((frames * 1000) / (t - since))} fps`; frames = 0; since = t; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
