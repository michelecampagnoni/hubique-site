// Motore 3D della presentazione «AI Integration Tools» (three 0.186.1, locale in vendor/).
// Un solo renderer: ogni slide chiede una scena per nome; il mouse inclina la scena,
// il trascinamento la fa girare con inerzia, il passaggio sugli oggetti li accende.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CYAN = 0x33d6fa, CYAN2 = 0x73eaff, AMBER = 0xffbd52, GREEN = 0x4dff9a, VIOLET = 0xb48cff, RED = 0xff5a6a, WHITE = 0xdff8ff;
const BG = 0x01060e;
const FONT = '"Chakra Petch", sans-serif';

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.FogExp2(BG, 0.045);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 0.6, 11);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.5, 0.3);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// pavimento a griglia (sempre presente, come nei render Blender)
const floor = (() => {
  const g = new THREE.Group(); const m = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.13 });
  const pts = []; const N = 40, S = 1.2;
  for (let i = -N; i <= N; i++) { pts.push(i * S, 0, -N * S, i * S, 0, N * S, -N * S, 0, i * S, N * S, 0, i * S); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(geo, m)); g.position.y = -3.2; return g;
})();
scene.add(floor);

// polvere di fondo
const dust = (() => {
  const n = 900, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 60; p[i * 3 + 1] = (Math.random() - .3) * 30; p[i * 3 + 2] = (Math.random() - .7) * 50; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: CYAN, size: 0.05, transparent: true, opacity: .5, depthWrite: false }));
})();
scene.add(dust);

const root = new THREE.Group(); scene.add(root);   // ruotato dal mouse
let current = null;                                   // {group, update, pick, dispose, opts}

// ---------- utilità ----------
const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(160,240,255,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const dotTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.beginPath(); x.arc(32, 32, 26, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
  const t = new THREE.CanvasTexture(c); return t;
})();
function glow(color = CYAN2, size = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(size); return s;
}
function lineMat(color = CYAN, opacity = 1) { return new THREE.LineBasicMaterial({ color, transparent: true, opacity }); }
function segs(points, color = CYAN, opacity = 1) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return new THREE.LineSegments(g, lineMat(color, opacity));
}
function rect(w, h) { const a = w / 2, b = h / 2; return [-a, -b, 0, a, -b, 0, a, -b, 0, a, b, 0, a, b, 0, -a, b, 0, -a, b, 0, -a, -b, 0]; }
// testo su una texture: per etichette dei moduli
function textMesh(lines, { w = 2, h = 0.5, color = '#a8f1ff', size = 64, weight = 600, align = 'center', glowc = 'rgba(51,214,250,.9)' } = {}) {
  const c = document.createElement('canvas'); const k = 256 / h; c.width = Math.round(w * k); c.height = 256; const x = c.getContext('2d');
  x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = color; x.shadowColor = glowc; x.shadowBlur = 8;
  const L = Array.isArray(lines) ? lines : [lines];
  L.forEach((l, i) => {
    const sz = l.size || size; x.font = `${l.weight || weight} ${sz}px ${FONT}`; x.fillStyle = l.color || color;
    const ty = c.height / 2 + (i - (L.length - 1) / 2) * (sz * 1.25);
    x.fillText(l.t ?? l, align === 'center' ? c.width / 2 : 20, ty);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  return m;
}
// pannello di vetro: lastra trasparente + bordo luminoso + righe di "testo" finte
function glass(w, h, { color = CYAN, fill = 0.06, bars = 0, edge = 0.95, corners = true } = {}) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: fill, side: THREE.DoubleSide, depthWrite: false }));
  g.add(face);
  const border = segs(rect(w, h), color, edge * .55); g.add(border);
  if (corners) {
    const a = w / 2, b = h / 2, k = Math.min(w, h) * .18, p = [];
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { p.push(sx * a, sy * b, 0, sx * a - sx * k, sy * b, 0, sx * a, sy * b, 0, sx * a, sy * b - sy * k, 0); }
    g.add(segs(p, CYAN2, edge));
  }
  if (bars) {
    const p = []; for (let i = 0; i < bars; i++) { const y = h / 2 - h * .18 - i * (h * .64 / Math.max(1, bars - 1)); const L = w * (.45 + Math.random() * .4); p.push(-w * .4, y, 0.001, -w * .4 + L, y, 0.001); }
    g.add(segs(p, color, .45));
  }
  g.userData.face = face; g.userData.border = border; return g;
}
function setGlow(obj, on, base = CYAN, hot = WHITE) {
  obj.traverse(o => { if (o.material && o.material.color && !o.material.map) { if (o.userData.base === undefined) o.userData.base = o.material.color.getHex(); o.material.color.setHex(on ? hot : o.userData.base); } });
}
function envelope(w = .9, h = .6, color = CYAN) {
  const g = glass(w, h, { color, fill: .07, corners: false });
  g.add(segs([-w / 2, h / 2, 0, 0, -h * .05, 0, 0, -h * .05, 0, w / 2, h / 2, 0], color, .9));
  return g;
}
function sheet(w = .7, h = .95, color = CYAN) { return glass(w, h, { color, bars: 6, corners: false, fill: .06 }); }
function book(color = CYAN) {
  const g = new THREE.Group(); const box = new THREE.BoxGeometry(.75, 1, .22);
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), lineMat(color, .9)));
  g.add(new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .05, depthWrite: false })));
  g.add(segs([-.3, .38, .115, .3, .38, .115, -.3, .3, .115, .15, .3, .115], color, .6)); return g;
}
function videoFrame(color = CYAN) {
  const g = glass(1.1, .66, { color, fill: .06, corners: true });
  g.add(segs([-.12, -.14, 0, -.12, .14, 0, -.12, .14, 0, .14, 0, 0, .14, 0, 0, -.12, -.14, 0], CYAN2, 1)); return g;
}
function reticle(r = 1, color = CYAN) {
  const g = new THREE.Group();
  const ring = (rad, op, seg = 128, gap = 0) => {
    const p = []; for (let i = 0; i < seg; i++) { if (gap && (i % gap) < gap / 3) continue; const a = i / seg * Math.PI * 2, b = (i + 1) / seg * Math.PI * 2; p.push(Math.cos(a) * rad, Math.sin(a) * rad, 0, Math.cos(b) * rad, Math.sin(b) * rad, 0); }
    return segs(p, color, op);
  };
  const r1 = ring(r, .9), r2 = ring(r * 1.25, .6, 96, 8), r3 = ring(r * .7, .5, 64, 4), r4 = ring(r * 1.55, .25, 160, 20);
  g.add(r1, r2, r3, r4);
  g.add(segs([-r * 1.8, 0, 0, -r * .3, 0, 0, r * .3, 0, 0, r * 1.8, 0, 0, 0, -r * 1.8, 0, 0, -r * .3, 0, 0, r * .3, 0, 0, r * 1.8, 0], color, .35));
  const core = glow(CYAN2, r * 1.4); g.add(core);
  g.userData = { r1, r2, r3, r4, core };
  g.userData.tick = (t, k = 1) => { r2.rotation.z = t * .4 * k; r3.rotation.z = -t * .7 * k; r4.rotation.z = t * .12; core.scale.setScalar(r * (1.2 + Math.sin(t * 2.2) * .18)); };
  return g;
}
const ease = t => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- scene ----------
const S = {};

// 1 · copertina: punto di luce che respira, anelli, filetto
S.cover = () => {
  const g = new THREE.Group(); const ret = reticle(1.1); g.add(ret);
  const pick = [];
  return { group: g, update(t) { ret.userData.tick(t, .6); ret.rotation.x = Math.sin(t * .3) * .1; }, pick };
};

// 2 · frammenti sparsi / che formano la cupola
function frammenti(mode) {
  const g = new THREE.Group(); const n = 170; const items = []; const pick = [];
  const makers = [envelope, sheet, () => glass(.8, .62, { bars: 3, corners: false, fill: .06 }), () => book()];
  const tips = ['Mail', 'Contratto', 'Cartella', 'Chat', 'Fattura', 'Offerta', 'Verbale', 'Listino'];
  for (let i = 0; i < n; i++) {
    const o = makers[i % 4](); o.scale.setScalar(rnd(.35, .6));
    const dir = new THREE.Vector3(rnd(-1, 1), rnd(-.6, 1), rnd(-1, 1)).normalize();
    const far = dir.clone().multiplyScalar(rnd(3, 8)); far.y *= .7;
    // posizione sulla cupola (emisfero schiacciato)
    const th = Math.acos(rnd(0, 1)), ph = rnd(0, Math.PI * 2);
    const dome = new THREE.Vector3(Math.sin(th) * Math.cos(ph) * 3.6, Math.cos(th) * 2.2 - .9, Math.sin(th) * Math.sin(ph) * 3.6);
    o.position.copy(mode === 'cupola' ? far : new THREE.Vector3(0, 0, 0));
    o.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6));
    o.userData = { ...o.userData, far, dome, spin: new THREE.Vector3(rnd(-.4, .4), rnd(-.4, .4), rnd(-.4, .4)), tip: tips[i % tips.length] + ' · ' + (2017 + (i % 9)) };
    g.add(o); items.push(o); pick.push(o);
  }
  // fili della cupola
  const links = []; if (mode === 'cupola') {
    for (let i = 0; i < n; i++) { let best = [], d; for (let j = 0; j < n; j++) if (j !== i) { d = items[i].userData.dome.distanceTo(items[j].userData.dome); best.push([d, j]); } best.sort((a, b) => a[0] - b[0]); for (const [, j] of best.slice(0, 2)) links.push(items[i].userData.dome.x, items[i].userData.dome.y, items[i].userData.dome.z, items[j].userData.dome.x, items[j].userData.dome.y, items[j].userData.dome.z); }
  }
  const web = segs(links, CYAN, 0); g.add(web);
  const core = glow(CYAN2, 1.6); g.add(core);
  return {
    group: g, pick,
    update(t) {
      const k = mode === 'cupola' ? ease((t - .3) / 2.4) : ease(t / 1.2);
      items.forEach((o, i) => {
        const u = o.userData;
        if (mode === 'cupola') { o.position.lerpVectors(u.far, u.dome, k); o.lookAt(o.position.clone().multiplyScalar(2)); if (k < 1) o.rotation.x += u.spin.x * .02; }
        else { o.position.copy(u.far).multiplyScalar(k).add(new THREE.Vector3(Math.sin(t * .3 + i) * .15, Math.cos(t * .25 + i) * .15, 0)); o.rotation.x += u.spin.x * .01; o.rotation.y += u.spin.y * .01; }
      });
      web.material.opacity = mode === 'cupola' ? Math.max(0, (k - .7) / .3) * .45 : 0;
      core.scale.setScalar(mode === 'cupola' ? 1.6 * k + .2 : Math.max(0, 1.6 - t * 1.5));
    },
    hover(o, on) { setGlow(o, on); o.scale.multiplyScalar(on ? 1.5 : 1 / 1.5); }
  };
}
S.sparsi = () => frammenti('sparsi');
S.cupola = () => frammenti('cupola');

// 3 · orbita dei sette Kit attorno al reticolo
export const KITS = [
  { n: 1, nome: 'Scout Kit', verbo: 'Trova.', tip: 'Nuovi showroom nel mondo e nuovi marchi per cui lavorare.', cap: 'scout' },
  { n: 2, nome: 'Inbound Kit', verbo: 'Risponde.', tip: 'Rivenditori, privati e committenti: ogni richiesta ha la sua risposta, pronta da approvare.', cap: 'inbound' },
  { n: 3, nome: 'Fin Kit', verbo: 'Fa i conti.', tip: 'DDT, fatture, banca e il margine vero di ogni commessa.', cap: 'fin' },
  { n: 4, nome: 'Brain Kit', verbo: 'Ricorda.', tip: 'Collezioni, commesse, disegni e mail in un unico posto.', cap: 'brain' },
  { n: 5, nome: 'Skill Kit', verbo: 'Applica il metodo.', tip: 'Sessant\'anni di mestiere, scritti una volta.', cap: 'skill' },
  { n: 6, nome: 'Task Kit', verbo: 'Organizza.', tip: 'Macchine, consegne e agenda: propone il piano, tu approvi.', cap: 'task' },
  { n: 7, nome: 'Voice Kit', verbo: 'Ti ascolta.', tip: 'In officina o in fiera: gli parli come a un collega.', cap: 'voice' },
];
function orbita(finale) {
  const g = new THREE.Group(); const ret = reticle(.9); g.add(ret); const pick = []; const mods = [];
  const beams = new THREE.Group(); g.add(beams);
  KITS.forEach((k, i) => {
    const m = new THREE.Group();
    const p = glass(2.1, 1.15, { fill: .08 }); m.add(p);
    const lab = textMesh([{ t: '#' + k.n, size: 70, weight: 700 }, { t: k.nome.toUpperCase(), size: 54 }], { w: 2, h: 1 }); lab.position.z = .01; m.add(lab);
    m.userData = { ...m.userData, i, kit: k, tip: `#${k.n} ${k.nome} — ${k.tip}`, cap: k.cap, panel: p };
    g.add(m); mods.push(m); pick.push(m);
  });
  const bp = new Float32Array(KITS.length * 6); const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const beam = new THREE.LineSegments(bg, lineMat(CYAN, .35)); beams.add(beam);
  const words = finale ? textMesh(' ', { w: 6, h: .6 }) : null; if (words) { words.position.set(0, -2.5, 1); g.add(words); }
  let hot = null, lastWord = -1;
  return {
    group: g, pick,
    update(t, dt) {
      ret.userData.tick(t);
      const spd = hot ? 0 : 1; g.userData.ang = (g.userData.ang || 0) + dt * .18 * spd;
      mods.forEach((m, i) => {
        const a = g.userData.ang + i / KITS.length * Math.PI * 2; const R = 4.3 * ease((t - i * .12) / 1.2);
        m.position.set(Math.cos(a) * R, Math.sin(a) * R * .38 + .2, Math.sin(a) * R * .55);
        m.lookAt(camera.position.clone().sub(root.position)); // sempre leggibili
        bp.set([0, 0, 0, m.position.x, m.position.y, m.position.z], i * 6);
        if (finale) { const on = Math.floor(t / 1.1) % (KITS.length + 2) === i; m.userData.panel.userData.face.material.opacity = on ? .35 : .08; }
      });
      bg.attributes.position.needsUpdate = true; beam.material.opacity = .25 + Math.sin(t * 3) * .1;
      if (finale) {
        const w = Math.floor(t / 1.1) % (KITS.length + 2);
        if (w !== lastWord) { lastWord = w; const txt = w < KITS.length ? KITS[w].verbo : ' '; const nm = textMesh([{ t: txt, size: 110, weight: 600, color: '#ffffff' }], { w: 7, h: .7 }); words.material.map.dispose(); words.material.map = nm.material.map; words.material.needsUpdate = true; }
      }
    },
    hover(o, on) { hot = on ? o : null; setGlow(o, on); o.scale.setScalar(on ? 1.18 : 1); },
    click(o) { if (o.userData.cap && window.vaiACapitolo) window.vaiACapitolo(o.userData.cap); }
  };
}
S.orbita = () => orbita(false);
S.chiusura = () => orbita(true);

// 4 · cervello: nuvola di punti con lobi e solchi, fonti colorate, legami
S.brain = () => {
  const g = new THREE.Group(); const noise = new SimplexNoise(); const n = 2600; const pos = [], col = [], meta = [];
  const C = { mail: new THREE.Color(VIOLET), chat: new THREE.Color(GREEN), doc: new THREE.Color(CYAN2), nota: new THREE.Color(WHITE) };
  const kinds = ['doc', 'doc', 'mail', 'mail', 'chat', 'nota'];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1; let v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
    let x = v.x * 1.25, y = v.y * 1.05, z = v.z * 1.6;
    const s = 1 + noise.noise3d(x * 2.2, y * 2.2, z * 2.2) * .07;
    x = (Math.abs(x) * s + .08) * side; y *= s; z *= s;
    if (y < -.55 && z < -.5 && Math.random() < .7) { y = -.65 - Math.random() * .25; x *= .6; } // cervelletto
    pos.push(x * 1.6, y * 1.6 + .3, z * 1.6);
    const k = y > .3 ? (Math.random() < .6 ? 'mail' : kinds[i % 6]) : y < -.3 ? (Math.random() < .6 ? 'doc' : kinds[i % 6]) : (Math.random() < .5 ? 'chat' : kinds[i % 6]);
    const c = C[k]; col.push(c.r, c.g, c.b); meta.push(k);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .07, map: dotTex, vertexColors: true, transparent: true, alphaTest: .3, depthWrite: false })); g.add(pts);
  // legami tra vicini
  const L = []; const P = i => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
  for (let i = 0; i < n; i += 3) { for (let k = 0; k < 2; k++) { const j = (i + 1 + Math.floor(Math.random() * 40)) % n; const a = P(i), b = P(j); if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < .55) L.push(...a, ...b); } }
  const web = segs(L, CYAN, .16); g.add(web);
  // fili dell'evidenza (accesi al passaggio)
  const hiGeo = new THREE.BufferGeometry(); hiGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 2 * 14), 3));
  const hi = new THREE.LineSegments(hiGeo, lineMat(WHITE, 0)); g.add(hi);
  const spot = glow(WHITE, .5); spot.visible = false; g.add(spot);
  const nomi = { mail: 'Mail', chat: 'Chat', doc: 'Documento', nota: 'Nota' };
  return {
    group: g, pick: [pts], pointsPick: true,
    update(t) { g.rotation.y = t * .08; g.scale.setScalar(ease(t / 1.4)); hi.material.opacity = Math.max(0, hi.material.opacity - .01); },
    hoverPoint(i) {
      if (i == null) { spot.visible = false; return null; }
      const a = P(i); spot.position.set(...a); spot.visible = true;
      const arr = hiGeo.attributes.position.array; let c = 0;
      for (let j = 0; j < n && c < 14; j += 7) { const b = P((i + j * 13) % n); if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1.3) { arr.set([...a, ...b], c * 6); c++; } }
      for (; c < 14; c++) arr.set([...a, ...a], c * 6);
      hiGeo.attributes.position.needsUpdate = true; hi.material.opacity = .9;
      return `${nomi[meta[i]]} ${String(i).padStart(4, '0')} · fonte collegata`;
    }
  };
};

// 5 · Italia: rilievo a punti, confini, aziende colorate per voto
S.italia = (opts = {}) => {
  const g = new THREE.Group(); const R = window.RILIEVO, IT = window.ITALIA, PT = window.PUNTI;
  if (R) {
    const p = [], c = [];
    for (let j = 0; j < R.h; j += 1) for (let i = 0; i < R.w; i += 1) { const z = R.z[j * R.w + i]; if (z < 0) continue; if ((i + j) % 2) continue; p.push(R.x0 + i * R.d, z * 0.00045, -(R.y0 + j * R.d)); const k = .25 + Math.min(1, z / 2500) * .75; c.push(.2 * k, .84 * k, .98 * k); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: .022, vertexColors: true, transparent: true, opacity: .75, depthWrite: false })));
  }
  if (IT) {
    const p = []; for (const r of IT) for (const sh of r.shapes) for (const ring of sh) for (let i = 0; i < ring.length - 1; i++) p.push(ring[i][0], .01, -ring[i][1], ring[i + 1][0], .01, -ring[i + 1][1]);
    g.add(segs(p, CYAN2, .55));
  }
  const vc = { A: new THREE.Color(GREEN), B: new THREE.Color(CYAN2), C: new THREE.Color(AMBER), D: new THREE.Color(RED) };
  const list = (PT && PT.punti) ? PT.punti.slice(0, 1800) : [];
  const p = new Float32Array(list.length * 3), c = new Float32Array(list.length * 3);
  list.forEach((q, i) => { p.set([q[0], .06, -q[1]], i * 3); const k = vc[q[2]] || vc.B; c.set([k.r, k.g, k.b], i * 3); });
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(p, 3)); dg.setAttribute('color', new THREE.BufferAttribute(c, 3)); dg.setDrawRange(0, 0);
  const dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: .11, map: dotTex, vertexColors: true, transparent: true, alphaTest: .3, depthWrite: false })); g.add(dots);
  const ring = glow(WHITE, .45); ring.visible = false; g.add(ring);
  g.rotation.x = .95; g.scale.setScalar(.68); g.position.y = -.1;
  const wrap = new THREE.Group(); wrap.add(g);
  return {
    group: wrap, pick: [dots], pointsPick: true, pointsObj: dots, threshold: .12,
    update(t) { dg.setDrawRange(0, Math.floor(Math.min(1, t / 4) * list.length)); g.rotation.z = Math.sin(t * .15) * .12; },
    hoverPoint(i) { if (i == null) { ring.visible = false; return null; } ring.position.set(p[i * 3], .1, p[i * 3 + 2]); ring.visible = true; const q = list[i]; return `${q[3]} · voto ${q[2]} · clic: sito e dossier`; }
  };
};

// 5b · pianeta: terre a punti, coste, showroom e studi colorati per voto (stesso stile dell'Italia)
S.globo = () => {
  const G = window.GLOBO; const g = new THREE.Group(); const R = 2.9;
  const xyz = (la, lo, r = R) => { const a = la * Math.PI / 180, b = lo * Math.PI / 180; return [r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)]; };
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * .985, 64, 48), new THREE.MeshBasicMaterial({ color: BG, transparent: true, opacity: .92 })); g.add(core);
  const halo = glow(CYAN, R * 3.1); halo.material.opacity = .18; g.add(halo);
  if (G) {
    const p = [], c = [];
    for (let i = 0; i < G.land.length; i += 2) { p.push(...xyz(G.land[i], G.land[i + 1], R * 1.004)); const k = .35 + ((i * 7919) % 100) / 100 * .65; c.push(.2 * k, .84 * k, .98 * k); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: .03, vertexColors: true, transparent: true, opacity: .8, depthWrite: false })));
    const s = []; for (let i = 0; i < G.coast.length; i += 4) s.push(...xyz(G.coast[i], G.coast[i + 1], R * 1.006), ...xyz(G.coast[i + 2], G.coast[i + 3], R * 1.006));
    g.add(segs(s, CYAN2, .5));
  }
  const grid = []; for (let la = -60; la <= 60; la += 30) for (let lo = 0; lo < 360; lo += 4) grid.push(...xyz(la, lo, R * 1.002), ...xyz(la, lo + 4, R * 1.002));
  for (let lo = 0; lo < 360; lo += 30) for (let la = -80; la < 80; la += 4) grid.push(...xyz(la, lo, R * 1.002), ...xyz(la + 4, lo, R * 1.002));
  g.add(segs(grid, CYAN, .08));
  const vc = { A: new THREE.Color(GREEN), B: new THREE.Color(CYAN2), C: new THREE.Color(AMBER), D: new THREE.Color(RED) };
  const list = G ? G.punti : [];
  const p = new Float32Array(list.length * 3), c = new Float32Array(list.length * 3);
  list.forEach((q, i) => { p.set(xyz(q[0], q[1], R * 1.02), i * 3); const k = vc[q[2]] || vc.B; c.set([k.r, k.g, k.b], i * 3); });
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(p, 3)); dg.setAttribute('color', new THREE.BufferAttribute(c, 3)); dg.setDrawRange(0, 0);
  const dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: .1, map: dotTex, vertexColors: true, transparent: true, alphaTest: .3, depthWrite: false })); g.add(dots);
  const ring = glow(WHITE, .45); ring.visible = false; g.add(ring);
  const orb = new THREE.Group(); [1.18, 1.32].forEach((k, j) => { const o = []; for (let i = 0; i < 128; i++) { if (j && i % 8 < 3) continue; const a = i / 128 * Math.PI * 2, b = (i + 1) / 128 * Math.PI * 2; o.push(Math.cos(a) * R * k, 0, Math.sin(a) * R * k, Math.cos(b) * R * k, 0, Math.sin(b) * R * k); } orb.add(segs(o, CYAN, j ? .25 : .4)); });
  orb.rotation.x = .32; orb.rotation.z = -.2;
  const wrap = new THREE.Group(); g.rotation.x = .38; wrap.add(g, orb);
  let hot = false, spin = -0.18; const v = new THREE.Vector3(), cpos = new THREE.Vector3(), n = new THREE.Vector3();
  return {
    group: wrap, pick: [dots], pointsPick: true, pointsObj: dots, threshold: .1,
    update(t, dt) { dg.setDrawRange(0, Math.floor(Math.min(1, t / 4) * list.length)); if (!hot) spin -= dt * .06; g.rotation.y = spin; orb.rotation.y = t * .1; },
    hoverPoint(i) {
      if (i == null) { ring.visible = false; hot = false; return null; }
      v.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]); dots.localToWorld(v); g.getWorldPosition(n); camera.getWorldPosition(cpos);
      if (v.clone().sub(n).dot(cpos.clone().sub(v)) < 0) { ring.visible = false; hot = false; return null; }
      hot = true; ring.position.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]); ring.visible = true; const q = list[i]; return `${q[3]} · ${q[4]} · voto ${q[2]} · clic: sito e dossier`;
    }
  };
};

// 6 · Scout: lettere-bozza che escono dalla lista e si fermano alla soglia «in attesa»
S.lettere = () => {
  const g = new THREE.Group(); const pick = [];
  const lista = glass(1.8, 3.2, { bars: 12, fill: .07 }); lista.position.set(-4.4, 0, 0); lista.rotation.y = .45; g.add(lista);
  lista.userData.tip = 'La lista di aziende scelte'; pick.push(lista);
  const soglia = glass(4.2, 3.6, { color: AMBER, fill: .03, edge: 1 }); soglia.position.set(1.6, 0, -.6); g.add(soglia);
  const sl = textMesh([{ t: 'IN ATTESA DEL TUO SÌ', size: 64, color: '#ffbd52' }], { w: 3.6, h: .4, glowc: 'rgba(255,189,82,.9)' }); sl.position.set(1.6, 2.1, -.6); g.add(sl);
  const letters = [];
  for (let i = 0; i < 9; i++) {
    const e = envelope(1.0, .66); const sem = glow(i === 4 ? AMBER : GREEN, .4); sem.position.set(.38, .21, .02); e.add(sem);
    e.userData = { ...e.userData, i, tip: i === 4 ? `Bozza ${i + 1} · il revisore chiede un controllo` : `Bozza ${i + 1} · su misura · revisione OK` };
    g.add(e); letters.push(e); pick.push(e);
  }
  return {
    group: g, pick,
    update(t) {
      letters.forEach((e, i) => {
        const k = ease((t - i * .3) / 1.4); const row = Math.floor(i / 3), col = i % 3;
        const start = new THREE.Vector3(-4.3, 1 - i * .22, .3), end = new THREE.Vector3(.35 + col * 1.25, 1 - row * .95, 0);
        e.position.lerpVectors(start, end, k); e.position.z += Math.sin(k * Math.PI) * 1.2; e.rotation.y = lerp(.45, 0, k);
      });
      soglia.userData.border.material.opacity = .4 + Math.sin(t * 4) * .25;
    },
    hover(o, on) { setGlow(o, on); }
  };
};

// 7 · Skill: libri, fogli, video convergono in un volume ordinato di schede
S.skillvolume = () => {
  const g = new THREE.Group(); const pick = []; const items = [];
  const nomi = ['Pricing', 'Dossier azienda', 'Manutenzione', 'Project management', 'Interaction design', 'Algoritmi', 'Controllo di gestione', 'Basi di dati', 'Valutazione idea', 'Preventivi', 'Mailing su misura', 'Questionari', 'Sicurezza', 'Formazione', 'Qualità', 'Acquisti', 'Assistenza', 'Commesse', 'Onboarding', 'Procedure HR', 'Garanzie', 'Logistica', 'Offerte', 'Bandi'];
  const make = [book, sheet, videoFrame];
  for (let i = 0; i < 24; i++) {
    const o = make[i % 3](); o.scale.setScalar(.55);
    const card = glass(1.1, .7, { bars: 3, fill: .1 }); card.visible = false; o.add(card); card.scale.setScalar(1 / .55 * .9);
    const cx = (i % 4) - 1.5, cy = Math.floor(i / 4) % 3 - 1, cz = Math.floor(i / 12) - .5;
    o.userData = { ...o.userData, from: new THREE.Vector3(rnd(-7, 7), rnd(-3, 3.5), rnd(-5, 2)), to: new THREE.Vector3(cx * 1.25, cy * .85 + .3, cz * 1.1), spin: rnd(-1, 1), card, tip: 'Skill · ' + nomi[i] };
    g.add(o); items.push(o); pick.push(o);
  }
  const links = []; for (let i = 0; i < 24; i++) { const a = items[i].userData.to; if (i % 4 < 3) { const b = items[i + 1].userData.to; links.push(a.x, a.y, a.z, b.x, b.y, b.z); } if (i + 4 < 24 && Math.floor(i / 12) === Math.floor((i + 4) / 12)) { const b = items[i + 4].userData.to; links.push(a.x, a.y, a.z, b.x, b.y, b.z); } }
  const web = segs(links, CYAN, 0); g.add(web);
  return {
    group: g, pick,
    update(t) {
      items.forEach((o, i) => {
        const k = ease((t - .4 - i * .04) / 2.2); const u = o.userData;
        o.position.lerpVectors(u.from, u.to, k); o.rotation.set((1 - k) * u.spin * 3 + Math.sin(t + i) * (1 - k), (1 - k) * u.spin * 4, 0);
        const done = k > .97; u.card.visible = done; o.children.forEach(ch => { if (ch !== u.card) ch.visible = !done; });
      });
      web.material.opacity = Math.max(0, ease((t - 2.4) / 1)) * .35;
    },
    hover(o, on) { setGlow(o, on); o.scale.setScalar(on ? .7 : .55); }
  };
};

// 8 · Skill: tre lastre «estrae / scrive il metodo / rivede»
S.skilllastre = () => {
  const g = new THREE.Group(); const pick = [];
  const L = [['ESTRAE', 'Legge il materiale e tira fuori i passi.'], ['SCRIVE IL METODO', 'Mette i passi in ordine, in chiaro, con le fonti.'], ['RIVEDE', 'Controlla: ciò che non è verificato lo dice.']];
  const plates = L.map(([t, d], i) => {
    const p = glass(2, 2.8, { fill: .05 }); p.position.set(-2.6 + i * 2.6, 0, 0); p.rotation.y = -.5;
    const lab = textMesh([{ t, size: 60, weight: 700 }], { w: 3, h: .6 }); lab.position.set(0, 1.85, 0); p.add(lab);
    p.userData = { ...p.userData, tip: t + ' — ' + d }; g.add(p); pick.push(p); return p;
  });
  const src = new THREE.Group(); src.add(book()); const s2 = sheet(); s2.position.set(.2, -.2, .3); src.add(s2); const v = videoFrame(); v.scale.setScalar(.6); v.position.set(-.2, .8, -.2); src.add(v); src.position.set(-6, 0, 0); src.rotation.y = .6; g.add(src);
  const out = glass(1.4, 1.9, { fill: .12, bars: 7 }); out.position.set(5.6, 0, 0); out.rotation.y = -.5; g.add(out);
  const ot = textMesh([{ t: 'SKILL', size: 70, weight: 700 }], { w: 1.2, h: .3 }); ot.position.set(0, .7, .01); out.add(ot);
  out.userData.tip = 'Una scheda ordinata: titolo e passi numerati'; pick.push(out);
  const n = 160, pp = new Float32Array(n * 3), ph = new Float32Array(n); for (let i = 0; i < n; i++) ph[i] = Math.random();
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: CYAN2, size: .09, map: dotTex, transparent: true, alphaTest: .3, depthWrite: false })));
  return {
    group: g, pick,
    update(t, dt) {
      for (let i = 0; i < n; i++) { ph[i] = (ph[i] + dt * .12) % 1; const x = lerp(-5.6, 5.2, ph[i]); const spread = (1 - ph[i]) * .9 + .05; pp.set([x, Math.sin(i * 12.9) * spread, Math.cos(i * 7.3) * spread], i * 3); }
      pg.attributes.position.needsUpdate = true;
      plates.forEach((p, i) => { p.userData.face.material.opacity = .05 + Math.max(0, Math.sin(t * 2 - i * 1.2)) * .12; });
    },
    hover(o, on) { setGlow(o, on); }
  };
};

// 9 · Voice: il cerchio «Kit» (standby / ascolto / al lavoro / fatto); clic cambia stato
S.kitring = () => {
  const g = new THREE.Group(); const ret = reticle(1.25); g.add(ret); ret.userData.core.material.opacity = .28;
  const lab = textMesh([{ t: 'Kit', size: 120, weight: 700, color: '#e9fbff' }], { w: 1.4, h: .7 }); lab.position.z = .02; g.add(lab);
  const nb = 72, bars = []; const bm = new THREE.LineBasicMaterial({ color: CYAN2, transparent: true, opacity: .9 });
  const bp = new Float32Array(nb * 6); const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const wave = new THREE.LineSegments(bg, bm); g.add(wave);
  const stati = [['STANDBY', CYAN, 'Dì «Kit» per iniziare'], ['IN ASCOLTO', CYAN2, 'Ti ascolta'], ['AL LAVORO', AMBER, 'Lavora: divide, coordina, verifica'], ['IN ATTESA DEL TUO SÌ', GREEN, 'La bozza è pronta']];
  const st = textMesh(' ', { w: 4, h: .35 }); st.position.set(0, -2.6, 0); g.add(st);
  let s = 0, energy = 0; const setS = i => { s = i; const [t, c] = stati[i]; const m = textMesh([{ t, size: 64, color: '#' + new THREE.Color(c).getHexString() }], { w: 4, h: .35 }); st.material.map.dispose(); st.material.map = m.material.map; st.material.needsUpdate = true; ret.traverse(o => { if (o.material && !o.material.map) o.material.color.setHex(c); }); bm.color.setHex(c); };
  setS(0);
  const hit = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.userData.tip = 'Clic: cambia stato del Kit'; g.add(hit);
  return {
    group: g, pick: [hit],
    update(t, dt) {
      ret.userData.tick(t, s === 2 ? 3 : 1); energy = Math.max(s === 0 ? .05 : .25, energy * .96);
      for (let i = 0; i < nb; i++) { const a = i / nb * Math.PI * 2; const h = .12 + energy * (Math.abs(Math.sin(t * 7 + i * .9)) * .6 + Math.abs(Math.sin(t * 3.3 + i * .37)) * .4); const r0 = 2.15; bp.set([Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * (r0 + h), Math.sin(a) * (r0 + h), 0], i * 6); }
      bg.attributes.position.needsUpdate = true; lab.scale.setScalar(1 + (s === 3 ? Math.sin(t * 6) * .04 : 0));
    },
    onMove(v) { energy = Math.min(1.2, energy + v * .02); },
    click() { setS((s + 1) % stati.length); energy = 1; },
    hover() { }
  };
};

// 10 · Voice: capitolato scomposto, tre kit, bozza di preventivo in attesa
S.preventivo = () => {
  const g = new THREE.Group(); const pick = [];
  const cap = new THREE.Group(); for (let i = 0; i < 4; i++) { const s = sheet(1.1, 1.5); s.position.set(i * .08, -i * .08, -i * .1); cap.add(s); } cap.position.set(-4.6, 0, 0); cap.rotation.y = .5; g.add(cap);
  cap.userData.tip = 'Il capitolato che hai girato'; pick.push(cap);
  const M = [['BRAIN KIT', 'le offerte passate', [0, 2.2, -1]], ['SCOUT KIT', 'il cliente e il mercato', [0, 0, -2.2]], ['SKILL KIT', 'il metodo di preventivo', [0, -2.2, -1]]];
  const mods = M.map(([n, d, p]) => { const m = glass(2.1, .9, { fill: .1 }); const l = textMesh([{ t: n, size: 60, weight: 700 }, { t: d, size: 38, color: '#cfefff' }], { w: 2, h: .8 }); l.position.z = .01; m.add(l); m.position.set(...p); m.userData.tip = n + ' · ' + d; g.add(m); pick.push(m); return m; });
  const doc = glass(1.5, 2, { fill: .1, bars: 8 }); doc.position.set(4.4, 0, .5); doc.rotation.y = -.4; g.add(doc);
  const dl = textMesh([{ t: 'BOZZA DI PREVENTIVO', size: 44, weight: 700 }], { w: 1.4, h: .25 }); dl.position.set(0, .8, .01); doc.add(dl);
  const btn = textMesh([{ t: 'IN ATTESA DEL TUO SÌ', size: 50, color: '#4dff9a' }], { w: 2.6, h: .3, glowc: 'rgba(77,255,154,.9)' }); btn.position.set(4.4, -1.45, .6); g.add(btn);
  doc.userData.tip = 'Ricomposto: tu lo rileggi e decidi'; pick.push(doc);
  const nb = 18; const blocks = []; for (let i = 0; i < nb; i++) { const b = glass(.35, .22, { fill: .25, corners: false }); g.add(b); blocks.push(b); }
  return {
    group: g, pick,
    update(t) {
      blocks.forEach((b, i) => {
        const m = mods[i % 3].position; const ph = ((t * .35 + i / nb) % 1);
        const a = new THREE.Vector3(-4.2, (i % 6 - 2.5) * .25, 0), c = new THREE.Vector3(4.4, (i % 6 - 2.5) * .25, .5);
        if (ph < .5) b.position.lerpVectors(a, m, ease(ph * 2)); else b.position.lerpVectors(m, c, ease((ph - .5) * 2));
        b.rotation.z = ph * 3;
      });
      doc.scale.setScalar(ease((t - 1.5) / 1.2)); btn.visible = t > 2.6 && Math.floor(t * 2) % 4 !== 0;
    },
    hover(o, on) { setGlow(o, on); }
  };
};

// 11 · Inbound: richieste in arrivo → Kit con catalogo, listini, rete vendita → bozze in attesa
S.inbound = () => {
  const g = new THREE.Group(); const pick = [];
  const core = reticle(.7); g.add(core);
  const kl = textMesh([{ t: 'Kit', size: 120, weight: 700, color: '#e9fbff' }], { w: .9, h: .45 }); kl.position.z = .02; g.add(kl);
  const fonti = [['CATALOGO', 'modelli, misure, optional', [-1.9, 2.3, -.6]], ['LISTINI', 'prezzi e condizioni', [0, 2.7, -1.2]], ['RETE VENDITA', 'rivenditore di zona', [1.9, 2.3, -.6]]];
  const fm = fonti.map(([n, d, p]) => { const m = glass(1.7, .7, { fill: .1 }); const l = textMesh([{ t: n, size: 58, weight: 700 }, { t: d, size: 36, color: '#cfefff' }], { w: 1.6, h: .62 }); l.position.z = .01; m.add(l); m.position.set(...p); m.userData.tip = n + ' · ' + d; g.add(m); pick.push(m); return m; });
  g.add(segs(fm.flatMap(m => [0, 0, 0, m.position.x, m.position.y, m.position.z]), CYAN, .3));
  const lingue = ['IT', 'EN', 'FR', 'DE', 'ES', 'IT', 'EN', 'IT'];
  const ins = [], outs = [];
  for (let i = 0; i < 8; i++) {
    const e = envelope(.8, .52); const tg = textMesh([{ t: lingue[i], size: 90, weight: 700 }], { w: .4, h: .22 }); tg.position.set(-.2, -.12, .02); e.add(tg);
    e.userData = { ...e.userData, ph: i / 8, tip: `Richiesta dal sito · ${lingue[i]} · «${['Prezzo del modello 120?', 'Do you ship to Zurich?', 'Rivenditore a Torino?', 'Lieferzeit?', '¿Medidas del modelo 90?', 'Posso installarlo in mansarda?', 'Quote for 3 units', 'Optional domotica?'][i]}»` };
    g.add(e); ins.push(e); pick.push(e);
    const d = envelope(.8, .52, GREEN); d.userData = { ...d.userData, ph: i / 8, tip: `Bozza di risposta · in ${lingue[i]} · prodotto, prezzo e rivenditore giusti · aspetta il sì` }; g.add(d); outs.push(d); pick.push(d);
  }
  const gate = segs([3.4, -1.6, -1.5, 3.4, 1.6, -1.5, 3.4, 1.6, -1.5, 3.4, 1.6, 1.5, 3.4, 1.6, 1.5, 3.4, -1.6, 1.5, 3.4, -1.6, 1.5, 3.4, -1.6, -1.5], AMBER, .8); g.add(gate);
  const gl = textMesh([{ t: 'IL COMMERCIALE APPROVA', size: 50, color: '#ffbd52' }], { w: 3.2, h: .3, glowc: 'rgba(255,189,82,.9)' }); gl.position.set(3.4, -2.05, 0); g.add(gl);
  return {
    group: g, pick,
    update(t, dt) {
      core.userData.tick(t, 1.5);
      ins.forEach((e, i) => { const p = (t * .12 + e.userData.ph) % 1; e.position.set(lerp(-4.6, -.6, ease(p * 1.1)), Math.sin(i * 2.1) * 1.4 * (1 - p), Math.cos(i * 1.7) * 1.2 * (1 - p)); e.rotation.y = .4; e.visible = p < .9; });
      outs.forEach((d, i) => { const p = (t * .12 + d.userData.ph + .5) % 1; const col = i % 4, row = Math.floor(i / 4); d.position.set(lerp(.6, 3.0 - col * .08, ease(p * 1.6)), lerp(0, .9 - row * 1.0, ease(p * 1.6)), lerp(0, -.9 + col * .6, ease(p * 1.6))); d.rotation.y = -.5; d.visible = p > .02; });
      gate.material.opacity = .5 + Math.sin(t * 4) * .3;
    },
    hover(o, on) { setGlow(o, on); }
  };
};

// 12 · Fin: un DDT fotografato, scansionato, le righe volano a fornitore / commessa / listino e fattura
S.ddt = () => {
  const g = new THREE.Group(); const pick = [];
  const doc = glass(2.2, 3, { fill: .07, bars: 0 }); doc.position.set(-3.2, 0, 0); doc.rotation.y = .45; g.add(doc);
  const dl = textMesh([{ t: 'DDT 0482', size: 64, weight: 700 }], { w: 1.4, h: .3 }); dl.position.set(-.3, 1.2, .01); doc.add(dl);
  doc.userData.tip = 'Un DDT di carta: basta una foto'; pick.push(doc);
  const rows = []; for (let i = 0; i < 9; i++) { const r = glass(1.7, .16, { fill: .3, corners: false, color: i === 5 ? AMBER : CYAN }); r.userData = { ...r.userData, i, home: new THREE.Vector3(0, .8 - i * .26, .02), tip: i === 5 ? 'Riga 6 · prezzo diverso dal listino: da controllare' : `Riga ${i + 1} · letta e collegata` }; doc.add(r); r.position.copy(r.userData.home); rows.push(r); pick.push(r); }
  const scan = segs([-1.2, 0, .05, 1.2, 0, .05], CYAN2, 1); doc.add(scan); const sg = glow(CYAN2, .8); scan.add(sg);
  const D = [['FORNITORE', [1.5, 2, -.5]], ['COMMESSA', [2.1, 0, .2]], ['LISTINO · FATTURA', [1.5, -2, -.5]]];
  const mods = D.map(([n, p]) => { const m = glass(2.3, .8, { fill: .1 }); const l = textMesh([{ t: n, size: 60, weight: 700 }], { w: 2.2, h: .5 }); l.position.z = .01; m.add(l); m.position.set(...p); m.rotation.y = -.35; m.userData.tip = 'Collegato a ' + n.toLowerCase(); g.add(m); pick.push(m); return m; });
  const flyers = rows.map((r, i) => { const f = glass(.9, .1, { fill: .5, corners: false, color: i === 5 ? AMBER : CYAN2 }); f.visible = false; g.add(f); return f; });
  const tmp = new THREE.Vector3();
  return {
    group: g, pick,
    update(t) {
      const cyc = t % 6; const sy = 1.5 - Math.min(1, cyc / 2) * 3; scan.position.y = sy; scan.visible = cyc < 2;
      rows.forEach((r, i) => {
        const ti = cyc - (i * .22 + .3); const f = flyers[i];
        if (ti > 0 && ti < 2.2) { f.visible = true; r.getWorldPosition(tmp); g.worldToLocal(tmp); const dst = mods[i % 3].position; const k = ease(ti / 1.6); f.position.lerpVectors(tmp, dst, k); f.rotation.y = lerp(.45, -.35, k); f.scale.setScalar(1 - k * .5); }
        else f.visible = i === 5 && cyc > 2.5;
        if (i === 5 && cyc > 2.5) { f.position.set(2.1, -.75, .3); f.scale.setScalar(.9); }
      });
    },
    hover(o, on) { setGlow(o, on); }
  };
};

// 13 · Task: settimana in 3D, appuntamenti, blocchi approvati, proposte (clic = approva)
S.agenda = () => {
  const g = new THREE.Group(); const pick = [];
  const W = 1.6, H = .42, days = ['LUN', 'MAR', 'MER', 'GIO', 'VEN'];
  const grid = []; for (let d = 0; d <= 5; d++) grid.push(-4 + d * W, 2.4, 0, -4 + d * W, -2.4, 0); for (let h = 0; h <= 11; h++) grid.push(-4, 2.4 - h * H * 1.04, 0, 4, 2.4 - h * H * 1.04, 0);
  g.add(segs(grid, CYAN, .18));
  days.forEach((d, i) => { const l = textMesh([{ t: d, size: 70, weight: 700 }], { w: 1, h: .28 }); l.position.set(-4 + W / 2 + i * W, 2.7, 0); g.add(l); });
  const blocks = [
    [0, 0, 2, 'app', 'Riunione di squadra'], [0, 3, 3, 'ok', 'Offerta cliente nord · 3h'], [1, 1, 2, 'ok', 'Chiusura mese · 2h'], [1, 5, 2, 'app', 'Visita in cantiere'],
    [2, 0, 4, 'ok', 'Preventivo capitolato · 4h'], [2, 6, 2, 'prop', 'Richiamo prospect · proposto'], [3, 2, 3, 'prop', 'Revisione contratti · proposto'], [3, 7, 2, 'app', 'Call fornitore'],
    [4, 1, 2, 'ok', 'Report settimanale · 2h'], [4, 4, 3, 'prop', 'Formazione squadra · proposto'], [1, 8, 2, 'prop', 'Follow-up demo · proposto'],
  ];
  const col = { app: 0x8aa0b4, ok: CYAN, prop: AMBER };
  const objs = blocks.map(([d, h, n, k, tit], i) => {
    const b = new THREE.Group(); const hh = n * H * 1.04 - .06;
    const box = new THREE.BoxGeometry(W - .12, hh, k === 'app' ? .08 : .3);
    const face = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: col[k], transparent: true, opacity: k === 'prop' ? .12 : .22, depthWrite: false })); b.add(face);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), k === 'prop' ? new THREE.LineDashedMaterial({ color: AMBER, dashSize: .08, gapSize: .06 }) : lineMat(col[k], .9));
    if (k === 'prop') edges.computeLineDistances(); b.add(edges);
    const l = textMesh([{ t: tit.split(' · ')[0], size: 44, color: k === 'app' ? '#c9d6e2' : k === 'prop' ? '#ffd58f' : '#dff8ff' }], { w: W - .2, h: .22, align: 'left' }); l.position.set(0, hh / 2 - .16, .17); b.add(l);
    const target = new THREE.Vector3(-4 + W / 2 + d * W, 2.4 - h * H * 1.04 - hh / 2 - .03, k === 'app' ? .04 : .16);
    b.userData = { ...b.userData, k, tit, target, from: target.clone().add(new THREE.Vector3(0, 3 + i * .2, 3)), face, edges, delay: i * .12, tip: tit + (k === 'prop' ? ' — clic per approvare' : k === 'app' ? ' — appuntamento del calendario' : ' — approvato, in calendario') };
    g.add(b); pick.push(b); return b;
  });
  const now = segs([-4 + W, .55, .35, -4 + 2 * W, .55, .35], RED, 1); g.add(now);
  g.rotation.x = -.35; g.position.y = .3;
  const wrap = new THREE.Group(); wrap.add(g);
  return {
    group: wrap, pick,
    update(t) { objs.forEach(b => { const u = b.userData; const k = ease((t - u.delay) / 1); b.position.lerpVectors(u.from, u.target, k); if (u.flash) { u.flash -= .02; b.scale.setScalar(1 + Math.max(0, u.flash) * .15); } }); now.material.opacity = .6 + Math.sin(t * 5) * .4; },
    hover(o, on) { setGlow(o, on); },
    click(o) {
      const u = o.userData; if (u.k !== 'prop') return; u.k = 'ok'; u.flash = 1;
      u.face.material.color.setHex(CYAN); u.face.material.opacity = .22; u.base = undefined;
      const e = new THREE.LineSegments(u.edges.geometry, lineMat(CYAN, .9)); o.remove(u.edges); o.add(e); u.edges = e;
      o.traverse(x => { delete x.userData.base; });
      u.tip = u.tit.replace(' · proposto', '') + ' — approvato: ora è in calendario';
      if (window.taskApprovato) window.taskApprovato();
    }
  };
};

// ---------- mobile Maroni: modelli glTF del loro configuratore ----------
// 'holo' = ologramma che si scompone nei pezzi lavorati; 'real' = finiture vere, clic per cambiarle.
let FIN = null;
const finP = fetch('media/mobili/finiture.json').then(r => r.json()).then(j => (FIN = j));
const gltfCache = {};
function caricaMobile(id) { return gltfCache[id] || (gltfCache[id] = finP.then(() => new Promise((ok, ko) => new GLTFLoader().load(FIN[id].model, g => ok(g.scene), undefined, ko)))); }
const texCache = {}; const texL = new THREE.TextureLoader();
function texFin(url) { if (!texCache[url]) { const t = texL.load(url); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; texCache[url] = t; } return texCache[url]; }
let envMap = null;
function ambiente() { if (!envMap) { const pm = new THREE.PMREMGenerator(renderer); envMap = pm.fromScene(new RoomEnvironment(), .04).texture; } return envMap; }
const NOMI = { STRUTTURA: 'Struttura in legno · lavorata a controllo numerico', INSERTI: 'Telaio in metallo', PUNTALI: 'Puntali in metallo', RIVESTIMENTO: 'Rivestimento in tessuto', Vetro: 'Vetro' };
const HOOK = { STRUTTURA: 'Legno', INSERTI: 'Metallo', PUNTALI: 'Metallo', RIVESTIMENTO: 'Tessuto' };

function mobile(id, mode) {
  const g = new THREE.Group(); const pick = []; const parts = [];
  const ret = reticle(2.4, CYAN); ret.rotation.x = -Math.PI / 2; ret.position.y = -2.25; g.add(ret);
  const norm = new THREE.Group(); g.add(norm);
  const label = textMesh([' '], { w: 8, h: .6 }); label.position.set(0, -3.0, .8); g.add(label);
  let ready = false, sel = {}, hot = null, lastSwap = 0;
  if (mode === 'real') {
    const h = new THREE.HemisphereLight(0xe8f6ff, 0x0b1622, 1.1); const d = new THREE.DirectionalLight(0xffffff, 2.2); d.position.set(4, 7, 6);
    const rim = new THREE.PointLight(CYAN, 30, 20); rim.position.set(-5, 3, -4); g.add(h, d, rim);
  }
  const scritta = () => {
    if (mode !== 'real' || !FIN) return;
    const txt = FIN[id].hooks.map(hk => `${HOOK[hk.mat] || hk.label}: ${hk.opts[sel[hk.mat] || 0].nome}`).join('   ·   ');
    const nm = textMesh([{ t: txt, size: 58, weight: 500, color: '#dff8ff' }], { w: 8, h: .6 }); label.material.map.dispose(); label.material.map = nm.material.map; label.material.needsUpdate = true;
  };
  const applica = () => {
    const hooks = FIN[id].hooks;
    parts.forEach(p => {
      const hk = hooks.find(x => x.mat === p.userData.mat); if (!hk) return;
      const o = hk.opts[sel[hk.mat] || 0]; p.material.map = texFin(o.tex); p.material.needsUpdate = true;
    });
    scritta();
  };
  caricaMobile(id).then(src => {
    const model = src.clone(true); model.updateMatrixWorld(true);
    const meshes = []; model.traverse(o => { if (o.isMesh && !/Environment|Background/i.test(o.material?.name || '') && !/Background/i.test(o.name)) meshes.push(o); });
    meshes.forEach(m => {
      m.matrixWorld.decompose(m.position, m.quaternion, m.scale); norm.add(m);
      const mat = (m.material.name || '').replace(/\.\d+$/, '');
      if (mode === 'holo') {
        m.material = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: .045, depthWrite: false, side: THREE.DoubleSide });
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 28), lineMat(CYAN2, .6)); m.add(e); m.userData.edges = e;
      } else {
        const metal = /INSERTI|PUNTALI/.test(mat), vetro = /Vetro/i.test(mat);
        m.material = vetro ? new THREE.MeshPhysicalMaterial({ color: 0xbfd8e6, transparent: true, opacity: .25, roughness: .05, metalness: 0 })
          : new THREE.MeshStandardMaterial({ color: 0xd2d2d2, roughness: metal ? .32 : .62, metalness: metal ? .85 : 0, envMapIntensity: metal ? 1.2 : .55 });
      }
      m.userData = { ...m.userData, mat, tip: (NOMI[mat] || 'Componente') + (mode === 'real' ? ' — clic: cambia finitura' : ' — passa sui pezzi, trascina per ruotare') };
      parts.push(m); pick.push(m);
    });
    const bbLocal = p => { p.updateMatrix(); if (!p.geometry.boundingBox) p.geometry.computeBoundingBox(); return p.geometry.boundingBox.clone().applyMatrix4(p.matrix); };
    const box = new THREE.Box3(); parts.forEach(p => box.union(bbLocal(p)));
    const sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()); const k = 4.2 / Math.max(sz.y, sz.x * .8, sz.z);
    const cen = c.clone();
    parts.forEach(p => { const pc = bbLocal(p).getCenter(new THREE.Vector3()); const dir = pc.sub(cen); dir.y *= 1.3; p.userData.home = p.position.clone(); p.userData.dir = dir.lengthSq() < 1e-6 ? new THREE.Vector3(0, 1, 0).multiplyScalar(sz.y * .2) : dir; });
    norm.scale.setScalar(k); norm.position.set(-c.x * k, -c.y * k + (4.2 - sz.y * k) / 2 - .05, -c.z * k);
    if (mode === 'real') { FIN[id].hooks.forEach(hk => sel[hk.mat] = 0); applica(); }
    ready = true;
  });
  return {
    group: g, pick, bloom: mode === 'real' ? 0 : .8,
    update(t) {
      ret.userData.tick(t, .5);
      if (mode === 'real') { scene.environment = ambiente(); }
      if (!ready) return;
      const intro = ease(t / 1.6); norm.parent.scale.setScalar(1);
      g.rotation.y = mode === 'real' ? Math.sin(t * .25) * .5 : t * .18;
      if (mode === 'holo') {
        const ex = (1 - Math.cos(Math.max(0, t - 1.2) * .7)) / 2 * .55;
        parts.forEach(p => p.position.copy(p.userData.home).addScaledVector(p.userData.dir, ex));
        norm.scale.setScalar(norm.scale.x); norm.children.forEach(p => { if (p.userData.edges) p.userData.edges.material.opacity = .6 * intro; });
      } else if (!hot && t - lastSwap > 3.2) { lastSwap = t; const hk = FIN[id].hooks[0]; sel[hk.mat] = ((sel[hk.mat] || 0) + 1) % hk.opts.length; applica(); }
    },
    hover(o, on) {
      hot = on ? o : null;
      if (mode === 'holo' && o.userData.edges) { o.userData.edges.material.color.setHex(on ? WHITE : CYAN2); o.material.opacity = on ? .22 : .07; }
      if (mode === 'real') o.material.emissive?.setHex(on ? 0x0a2a36 : 0x000000);
    },
    click(o) {
      if (mode !== 'real' || !o || !FIN) return;
      const hk = FIN[id].hooks.find(x => x.mat === o.userData.mat) || FIN[id].hooks[0];
      sel[hk.mat] = ((sel[hk.mat] || 0) + 1) % hk.opts.length; lastSwap = 1e9; applica();
    }
  };
}
S.mobile = () => mobile('Vero30317', 'holo');
S.mobilereal = () => mobile('Vero30317', 'real');
S.sedia = () => mobile('Mera70014', 'real');

// ambient: solo polvere e griglia (dietro schermate e prove dal vivo)
S.ambient = () => ({ group: new THREE.Group(), pick: [], update() { } });

// ---------- ciclo, mouse, passaggio ----------
const ray = new THREE.Raycaster(); ray.params.Points.threshold = .08;
const mouse = new THREE.Vector2(9, 9); let mx = 0, my = 0, drag = false, lastX = 0, lastY = 0, vel = 0, yaw = 0, pitch = 0, moved = 0;
const tip = document.getElementById('tip');
let hovered = null, hoveredPt = null, t0 = performance.now(), last = performance.now(), running = true;
const view = { cam: new THREE.Vector3(0, .6, 11), look: new THREE.Vector3(0, 0, 0) };

function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; mouse.set(mx, my);
  if (drag) { const dx = e.clientX - lastX, dy = e.clientY - lastY; vel = dx * .005; yaw += vel; pitch = Math.max(-.6, Math.min(.6, pitch + dy * .003)); moved += Math.abs(dx) + Math.abs(dy); }
  if (current && current.onMove) current.onMove(Math.hypot(e.movementX || 0, e.movementY || 0));
  lastX = e.clientX; lastY = e.clientY;
  tip.style.left = (e.clientX + 18) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
});
canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', e => {
  drag = false; if (moved < 6 && current) {
    if (hovered && current.click) current.click(hovered);
    else if (current.click && !current.pick.length) current.click();
  }
});
addEventListener('pointerleave', () => mouse.set(9, 9));

function pickLoop() {
  if (!current || !current.pick.length || mouse.x > 2) { setHover(null); return; }
  ray.setFromCamera(mouse, camera);
  if (current.pointsPick) {
    ray.params.Points.threshold = current.threshold || .08;
    const h = ray.intersectObjects(current.pick, false)[0];
    const label = current.hoverPoint(h ? h.index : null); showTip(label); canvas.style.cursor = label ? 'pointer' : 'grab'; return;
  }
  const hits = ray.intersectObjects(current.pick, true);
  let o = hits.length ? hits[0].object : null;
  while (o && !current.pick.includes(o)) o = o.parent;
  setHover(o);
}
function setHover(o) {
  if (o === hovered) return;
  if (hovered && current && current.hover) current.hover(hovered, false);
  hovered = o; if (o && current.hover) current.hover(o, true);
  showTip(o ? o.userData.tip : null); canvas.style.cursor = o ? 'pointer' : 'grab';
}
function showTip(t) { if (t) { tip.textContent = t; tip.classList.add('on'); } else tip.classList.remove('on'); }

function frame() {
  const now = performance.now(); const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
  if (!running) return;
  if (!drag) { yaw += vel; vel *= .94; }
  // il mouse inclina e fa ruotare la scena (lerp), il trascinamento aggiunge giri
  const ty = yaw + mx * .55, tx = pitch - my * .25;
  root.rotation.y += (ty - root.rotation.y) * .06; root.rotation.x += (tx - root.rotation.x) * .06;
  camera.position.lerp(view.cam, .06); camera.lookAt(view.look);
  dust.rotation.y = t * .01; floor.position.z = (t * .4) % 1.2;
  if (current) current.update(t - current.t0, dt);
  pickLoop();
  composer.render();
}
renderer.setAnimationLoop(frame);

export function mostra(nome, opts = {}) {
  if (current && current.nome === nome) { root.position.x = opts.offsetX || 0; root.scale.setScalar(opts.scale || 1); view.look.set(0, opts.low ? -1.25 : 0, 0); return; }
  if (current) { root.remove(current.group); current.group.traverse(o => { o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map !== glowTex && o.material.map !== dotTex && o.material.map.dispose(); o.material.dispose(); } }); }
  setHover(null); yaw = 0; pitch = 0; vel = 0;
  scene.environment = null; const make = S[nome] || S.ambient; current = make(opts); current.nome = nome; bloom.strength = current.bloom ?? .8; current.t0 = (performance.now() - t0) / 1000;
  root.add(current.group);
  const cams = { italia: [0, 2.2, 9.5], brain: [0, .5, 8.5], agenda: [0, .2, 10], orbita: [0, 1.2, 12], chiusura: [0, 1.6, 14.5], ddt: [0, .3, 10.5], inbound: [0, .6, 11.5], preventivo: [0, .4, 11.5], skilllastre: [0, .5, 11.5], cupola: [0, 1.4, 11], sparsi: [0, .6, 10], mobile: [0, .9, 10.5], globo: [0, .8, 11], mobilereal: [0, .9, 10], sedia: [0, .9, 10] };
  view.cam.set(...(cams[nome] || [0, .6, 11]));
  root.position.x = opts.offsetX || 0; root.scale.setScalar(opts.scale || 1);
  view.look.set(0, opts.low ? -1.25 : 0, 0);
  canvas.style.cursor = 'grab';
}
export function pausa(p) { running = !p; renderer.setAnimationLoop(p ? null : frame); }
export function sposta(x) { root.position.x = x; }
