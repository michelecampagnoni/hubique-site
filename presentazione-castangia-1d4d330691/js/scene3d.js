// Motore 3D della presentazione Castangia 1850 · Inbound Kit (three r186, locale in vendor/).
// Un solo renderer trasparente sopra il fondo; ogni slide chiede una scena per nome.
// Il mouse inclina la scena, il trascinamento la gira, il passaggio accende gli oggetti.
// Tutti i tessuti sono procedurali: si tessono filo per filo (ordito, trama, armatura), nessuna foto.
import * as THREE from 'three';

const NAVY = 0x1c2836, SAND = 0xc8b596, TERRA = 0xa96a3f, GOLD = 0xa2814f;

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const piccolo = Math.min(innerWidth, innerHeight) < 600;
const PR = Math.min(devicePixelRatio, 1.75);
renderer.setPixelRatio(PR);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xfff6e8, 0xb9a98f, 1.25));
const sun = new THREE.DirectionalLight(0xfff0dc, 2.6); sun.position.set(-7, 15, 11); scene.add(sun);
sun.castShadow = true; sun.shadow.mapSize.setScalar(piccolo ? 1024 : 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 5;
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 });
const root = new THREE.Group(); scene.add(root);
let current = null;

// luce d'ambiente: una stanza chiara fatta di pannelli, per i riflessi morbidi di ottone e legno
(function ambiente() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x4a4238);
  const pann = (c, w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  pann(new THREE.Color(9, 8.2, 7), 12, 6, -6, 9, 6); pann(new THREE.Color(3, 2.8, 2.5), 10, 10, 10, 2, 2); pann(new THREE.Color(1.6, 1.5, 1.4), 16, 6, 0, -8, 0);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(s, .05).texture; scene.environmentIntensity = .42; pm.dispose();
})();

// ---------- utilità ----------
function texCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const softTex = texCanvas(256, 256, (x, W) => {
  const g = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  g.addColorStop(0, 'rgba(46,36,24,.42)'); g.addColorStop(.55, 'rgba(46,36,24,.15)'); g.addColorStop(1, 'rgba(46,36,24,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, W);
});
const ease = k => { k = Math.min(1, Math.max(0, k)); return 1 - Math.pow(1 - k, 3); };
// griglia di vertici: fn(i/cols, j/rows) -> [x,y,z,u,v]
function striscia(cols, rows, fn) {
  const p = [], uv = [], idx = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const a = fn(i / cols, j / rows); p.push(a[0], a[1], a[2]); uv.push(a[3] || 0, a[4] || 0); }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

// ---------- telaio: ogni tessuto nasce da ordito, trama e armatura, come su un telaio vero ----------
const FILI = 256, TEXN = piccolo ? 512 : 1024, TILE = 3.2; // 256 fili ogni 3,2 unità di scena: disegni leggibili, trama fine
const ARM = {
  saia: (i, j) => ((i + j) & 3) < 2,
  lisca: (i, j) => ((((i >> 3) & 1) ? i + j : i - j + 1024) & 3) < 2,
  panama: (i, j) => (((i >> 1) + (j >> 1)) & 1) === 0,
};
const rgb = h => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const jit = (v, a) => v.map(c => Math.max(0, Math.min(255, c + a))); // ogni filo ha una tonalità un po' sua
function fili(fn, amp) { return Array.from({ length: FILI }, (_, i) => jit(rgb(fn(i)), (Math.random() - .5) * amp)); }
const normaliCache = {};
function normali(arm) {
  if (normaliCache[arm]) return normaliCache[arm];
  const N = TEXN, tw = N / FILI, h = new Float32Array(N * N), f = ARM[arm];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (x / tw) | 0, j = (y / tw) | 0, up = f(i, j), a = (x % tw + .5) / tw, b = (y % tw + .5) / tw;
    h[y * N + x] = (up ? .55 + .45 * Math.sin(Math.PI * a) : .08 + .42 * Math.sin(Math.PI * b));
  }
  const d = new Uint8Array(N * N * 4), S = 1.6;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (h[y * N + ((x + 1) % N)] - h[y * N + ((x + N - 1) % N)]) * S, dy = (h[((y + 1) % N) * N + x] - h[((y + N - 1) % N) * N + x]) * S, l = 1 / Math.hypot(dx, dy, 1), o = (y * N + x) * 4;
    d[o] = (-dx * l * .5 + .5) * 255; d[o + 1] = (-dy * l * .5 + .5) * 255; d[o + 2] = (l * .5 + .5) * 255; d[o + 3] = 255;
  }
  const t = new THREE.DataTexture(d, N, N); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return normaliCache[arm] = t;
}
function tessi({ ordito, trama, arm, amp = 16 }) {
  const N = TEXN, tw = N / FILI, W = fili(ordito, amp), P = fili(trama, amp), f = ARM[arm], sum = [0, 0, 0];
  const t = texCanvas(N, N, (x) => {
    const im = x.createImageData(N, N), d = im.data;
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      const i = (px / tw) | 0, j = (py / tw) | 0, up = f(i, j), c = up ? W[i] : P[j], a = (px % tw + .5) / tw, b = (py % tw + .5) / tw;
      const s = (up ? .84 + .16 * Math.sin(Math.PI * a) : .78 + .2 * Math.sin(Math.PI * b)) * (1 + .035 * Math.sin(px / N * 6.283 * 3 + 1.3 * Math.sin(py / N * 6.283 * 2))), o = (py * N + px) * 4;
      d[o] = c[0] * s; d[o + 1] = c[1] * s; d[o + 2] = c[2] * s; d[o + 3] = 255; sum[0] += d[o]; sum[1] += d[o + 1]; sum[2] += d[o + 2];
    }
    x.putImageData(im, 0, 0);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 16;
  const media = new THREE.Color(sum[0] / (N * N * 255), sum[1] / (N * N * 255), sum[2] / (N * N * 255)).convertSRGBToLinear();
  return { map: t, normalMap: normali(arm), media };
}
const seq = (i, ...passi) => { const tot = passi.reduce((a, b) => a + b.n * b.v.length, 0); let r = i % tot; for (const p of passi) { const L = p.n * p.v.length; if (r < L) return p.v[(r / p.n | 0)]; r -= L; } };
const pietra = 0xd9d2c2, antr = 0x2d3238, chiaro = 0xcbc5b6;
const glen = i => (i % 128 < 2 ? 0x9a5a33 : seq(i, { n: 4, v: [antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro] }, { n: 2, v: [antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro, antr, chiaro] }));
// nomi e dati sono inventati: si vedono solo con l'etichetta ESEMPIO
export const STOFFE = {
  gessato: { nome: 'Gessato Blu Notte', dati: 'Lana · 280 g/m', stato: 'Disponibile', def: { ordito: i => (i % 26 < 1 ? 0xd8d4c8 : NAVY), trama: () => 0x18222e, arm: 'saia', amp: 12 } },
  navy: { nome: 'Panama Blu', dati: 'Lana · 240 g/m', stato: 'In esaurimento', def: { ordito: () => 0x223146, trama: () => 0x1a2636, arm: 'panama', amp: 20 } },
  sabbia: { nome: 'Spina Sabbia', dati: 'Lana e lino · 260 g/m', stato: 'Disponibile', def: { ordito: () => 0xcbb999, trama: () => 0x9c8a6c, arm: 'lisca', amp: 14 } },
  principe: { nome: 'Principe Grigio', dati: 'Lana · 300 g/m', stato: 'Non disponibile', def: { ordito: glen, trama: glen, arm: 'saia', amp: 10 } },
  terra: { nome: 'Flanella Terra', dati: 'Lana · 320 g/m', stato: 'Disponibile', def: { ordito: () => TERRA, trama: () => 0x8f5a36, arm: 'saia', amp: 24 } },
  pied: { nome: 'Pied de Poule Avorio', dati: 'Lana e seta · 270 g/m', stato: 'In esaurimento', def: { ordito: i => (i % 8 < 4 ? NAVY : 0xe9e3d6), trama: i => (i % 8 < 4 ? NAVY : 0xe9e3d6), arm: 'saia', amp: 10 } },
};
const tela = {}; // tessuti già fatti: si tengono per tutta la presentazione
function stoffa(k) {
  if (tela[k]) return tela[k];
  const t = tessi(STOFFE[k].def), chiara = t.media.clone().lerp(new THREE.Color(1, 1, 1), .12);
  const mat = new THREE.MeshPhysicalMaterial({ map: t.map, normalMap: t.normalMap, normalScale: new THREE.Vector2(.55, .55), roughness: .9, metalness: 0, sheen: .55, sheenRoughness: .6, sheenColor: chiara, side: THREE.DoubleSide, envMapIntensity: .55 });
  const cima = new THREE.MeshStandardMaterial({ color: t.media.clone().multiplyScalar(1.05), roughness: 1, side: THREE.DoubleSide, envMapIntensity: .3 });
  const buio = new THREE.MeshBasicMaterial({ color: t.media.clone().multiplyScalar(.1) });
  return tela[k] = { mat, cima, buio };
}

// ---------- rotolo: ultimo giro in stoffa, testa a spirale vera, anima in cartone ----------
const animaMat = new THREE.MeshStandardMaterial({ color: 0xb49a78, roughness: .85 }), animaBuio = new THREE.MeshBasicMaterial({ color: 0x1b1712 });
function testa(R, r0, passo, z, seme) { // la stoffa vista di taglio: un nastro piatto a spirale, con un filo di vuoto tra i giri
  const giri = (R - r0) / passo, seg = Math.ceil(giri * 56);
  return striscia(1, seg, (a, b) => {
    const th = b * giri * 6.2832 + seme, r = r0 + (R - r0) * b + Math.sin(th * .5 + seme) * .004, q = r + (a ? passo * .8 : 0);
    return [Math.cos(th) * q, Math.sin(th) * q, z + Math.sin(th * .23 + seme) * .012];
  });
}
function rotolo(k, { R = .5, L = 3.6, r0 = .1, passo = .036 } = {}) {
  const s = stoffa(k), g = new THREE.Group(), fi = Math.random() * 6, giri = 1.22;
  const corpo = striscia(14, 96, (a, b) => {
    const th = fi + b * giri * 6.2832, r = R - passo * (1 - b) * giri + .006 * Math.sin(th * 2 + fi) + .005 * Math.sin(a * 8 + fi), z = (a - .5) * L;
    return [Math.cos(th) * r, Math.sin(th) * r, z, z / TILE, R * b * giri * 6.2832 / TILE];
  });
  const m = new THREE.Mesh(corpo, s.mat); m.castShadow = m.receiveShadow = true; g.add(m);
  for (const z of [L / 2, -L / 2]) {
    const c = new THREE.Mesh(testa(R - .012, r0 + .02, passo, z, fi), s.cima); g.add(c);
    const d = new THREE.Mesh(new THREE.CircleGeometry(R - .012, 48), s.buio); d.position.z = z - Math.sign(z) * .018; if (z < 0) d.rotation.y = Math.PI; g.add(d);
    const fo = new THREE.Mesh(new THREE.CircleGeometry(r0 - .018, 24), animaBuio); fo.position.z = z + Math.sign(z) * .03; if (z < 0) fo.rotation.y = Math.PI; g.add(fo);
    const an = new THREE.Mesh(new THREE.RingGeometry(r0 - .02, r0 + .018, 32), animaMat); an.position.z = z + Math.sign(z) * .032; if (z < 0) an.rotation.y = Math.PI; g.add(an);
  }
  return g;
}
// il rotolo aperto: lo stesso nastro prosegue sul piano e cade oltre il bordo con le pieghe
function rotoloAperto(k, { R = .56, L = 3.7, r0 = .1, passo = .036, piano = 3.3, caduta = 2.35 } = {}) {
  const s = stoffa(k), g = new THREE.Group(), giri = 1.25, thE = -Math.PI / 2, curva = .07, sAvv = R * giri * 6.2832, sTot = sAvv + piano + curva * 1.571 + caduta;
  const corpo = striscia(34, 210, (a, b) => {
    const zz = (a - .5) * L, S = b * sTot; let x, y, z = zz, s0 = S;
    if (S < sAvv) { const q = S / sAvv, th = thE + giri * 6.2832 * (1 - q), r = R - passo * giri * (1 - q) + .005 * Math.sin(a * 7); x = Math.cos(th) * r; y = Math.sin(th) * r; }
    else if (S < sAvv + piano) { const d = S - sAvv, onda = Math.min(1, d / .6) * (.5 + .5 * Math.sin(d * 2.4 + a * 3.1)) * .03; x = -d; y = -R + .012 + onda; }
    else if (S < sAvv + piano + curva * 1.571) { const d = (S - sAvv - piano) / curva; x = -piano - Math.sin(d) * curva; y = -R + .012 - curva + Math.cos(d) * curva; }
    else {
      const d = S - sAvv - piano - curva * 1.571, f = d / caduta, w = Math.pow(f, 1.1), pieghe = Math.sin(a * 13 + .6 + f * .5) + .6 * Math.sin(a * 27 + 2.1 - f * .8) + .25 * Math.sin(a * 47 + f * 1.4);
      x = -piano - curva - .02 - .2 * w * (pieghe + 1.3); y = -R + .012 - curva - d * (1 - .012 * pieghe * w); z = zz * (1 - .05 * w);
    }
    return [x, y, z, zz / TILE, s0 / TILE];
  });
  const m = new THREE.Mesh(corpo, s.mat); m.castShadow = m.receiveShadow = true; g.add(m);
  for (const z of [L / 2, -L / 2]) {
    g.add(new THREE.Mesh(testa(R - .012, r0 + .02, passo, z, 1), s.cima));
    const d = new THREE.Mesh(new THREE.CircleGeometry(R - .012, 48), s.buio); d.position.z = z - Math.sign(z) * .018; if (z < 0) d.rotation.y = Math.PI; g.add(d);
    const an = new THREE.Mesh(new THREE.RingGeometry(r0 - .02, r0 + .018, 32), animaMat); an.position.z = z + Math.sign(z) * .032; if (z < 0) an.rotation.y = Math.PI; g.add(an);
    const fo = new THREE.Mesh(new THREE.CircleGeometry(r0 - .018, 24), animaBuio); fo.position.z = z + Math.sign(z) * .03; if (z < 0) fo.rotation.y = Math.PI; g.add(fo);
  }
  return g;
}

// ---------- scena 1: il tavolo del sarto ----------
const noce = (rip = 1) => {
  const f = (x, W, H) => {
    x.fillStyle = '#42301f'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { const y = Math.random() * H, a = .03 + Math.random() * .14; x.strokeStyle = Math.random() < .6 ? `rgba(24,13,6,${a})` : `rgba(136,92,56,${a})`; x.lineWidth = .6 + Math.random() * 2.4; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= W; px += 60) x.lineTo(px, y + Math.sin(px * .006 + y * .05) * 9 + Math.sin(px * .021 + y) * 2); x.stroke(); }
  };
  const t = texCanvas(1024, 512, f); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rip, rip); return t;
};
function metro() { // metro da sarto: nastro avorio con tacche e numeri
  return texCanvas(2048, 64, (x, W, H) => {
    x.fillStyle = '#e4cf94'; x.fillRect(0, 0, W, H); x.fillStyle = '#1c2836'; x.font = '500 30px Jost, sans-serif'; x.textAlign = 'center';
    for (let i = 0; i <= 200; i++) { const X = i / 200 * W, l = i % 10 === 0 ? 30 : i % 5 === 0 ? 20 : 12; x.fillRect(X, 0, 2, l); if (i % 10 === 0 && i) x.fillText(String(i / 2), X, 58); }
  });
}
function forbici() { // forbici da sarto: due lame, due anelli, ottone e acciaio
  const g = new THREE.Group(), acc = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, metalness: 1, roughness: .28 }), nero = new THREE.MeshStandardMaterial({ color: 0x15191f, metalness: .4, roughness: .4 }), ott = new THREE.MeshStandardMaterial({ color: 0xb08d4f, metalness: 1, roughness: .3 });
  for (const v of [1, -1]) {
    const f = new THREE.Group(), s = new THREE.Shape(); s.moveTo(0, -.045); s.lineTo(1.25, -.012); s.lineTo(1.3, .015); s.lineTo(.2, .07); s.lineTo(0, .06); s.closePath();
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .022, bevelEnabled: false }), acc); b.rotation.x = -Math.PI / 2; f.add(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .62, 8), nero); m.rotation.z = Math.PI / 2; m.position.set(-.33, .02, 0); f.add(m);
    const an = new THREE.Mesh(new THREE.TorusGeometry(.2 + (v > 0 ? .05 : 0), .045, 10, 28), nero); an.rotation.x = Math.PI / 2; an.position.set(-.8, .02, .02 * v); an.scale.set(1.35, 1, 1); f.add(an);
    f.rotation.y = v * .17; f.position.y = v > 0 ? .03 : 0; f.traverse(o => o.castShadow = true); g.add(f);
  }
  const p = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .08, 16), ott); p.position.y = .045; g.add(p);
  return g;
}
const scene1 = {};
scene1.costruisci = () => {
    const g = new THREE.Group(), pick = [], W = 9.2, D = 4.7, H = 3.15, Y = 0;
    const legno = new THREE.MeshStandardMaterial({ map: noce(1), roughness: .5, metalness: 0, envMapIntensity: .8 }), legnoS = new THREE.MeshStandardMaterial({ map: noce(1), roughness: .62, color: 0xb9a48e });
    const box = (w, h, d, x, y, z, m = legno) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
    box(W, .2, D, 0, Y - .1, 0); box(W - .5, .14, D - .5, 0, Y - .27, 0, legnoS);
    for (const x of [-1, 1]) for (const z of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.13, .08, H - .3, 4), legnoS); m.rotation.y = Math.PI / 4; m.scale.set(1, 1, 1); m.position.set(x * (W / 2 - .42), -H / 2 - .15, z * (D / 2 - .42)); m.castShadow = true; g.add(m); }
    box(W - .9, .1, D - .9, 0, -H + .68, 0, legnoS); // ripiano basso
    const r = new THREE.Mesh(new THREE.BoxGeometry(W - 1, .026, .15), new THREE.MeshStandardMaterial({ color: 0xb08d4f, metalness: 1, roughness: .34 })); r.position.set(-.6, -.1, D / 2 + .004); r.rotation.x = Math.PI / 2; g.add(r); // righello d'ottone sul bordo
    const om = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.7, D * 2.4), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = -H - .02; g.add(om);

    // piramide sul tavolo: teste verso chi guarda
    const rol = [], Rp = .49, poni = (k, x, y, z, ry, sc = 1, op = {}) => {
      const o = rotolo(k, { R: Rp * sc, L: 3.5, ...op }); o.position.set(x, y, z); o.rotation.y = ry; g.add(o);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(Rp * sc, Rp * sc, 3.5, 12).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })); o.add(p); p.userData.r = { o, k, y0: y, lift: 0, liftT: 0, d: rol.length * .08 }; pick.push(p); rol.push(p.userData.r);
    };
    const s3 = Math.sqrt(3) * Rp, x0 = -3.35;
    ['gessato', 'sabbia', 'navy'].forEach((k, i) => poni(k, x0 + i * Rp * 2.02, Rp, -.25, 0));
    ['principe', 'terra'].forEach((k, i) => poni(k, x0 + Rp * 1.01 + i * Rp * 2.02, Rp + s3, -.25, 0));
    poni('pied', x0 + Rp * 2.02, Rp + 2 * s3, -.25, 0);
    // ripiano basso: rotoli più corti, di testa
    const yb = -H + .73; ['sabbia', 'gessato', 'terra', 'navy', 'principe', 'pied', 'gessato'].forEach((k, i) => poni(k, -3.2 + i * 1.03, yb + Rp * .92, 0, 0, .92, { L: 3.05 }));

    // rotolo aperto, con la stoffa che cade oltre il bordo
    const ap = rotoloAperto('gessato', { R: .56, L: 3.6, piano: D / 2 + 1.05 + .01, caduta: 2.15 }); ap.position.set(2.45, .56, -1.05); ap.rotation.y = Math.PI / 2; g.add(ap);
    const pa = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 3.4), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })); pa.position.set(2.45, .3, .3); g.add(pa); pa.userData.r = { o: null, k: 'gessato', fisso: true }; pick.push(pa);

    // metro, gessetto, forbici
    const tm = metro(); tm.wrapS = THREE.RepeatWrapping;
    const nas = striscia(8, 90, (a, b) => { const t = b * 7.2, x = -.6 + t * .62 + .05 * Math.sin(t * 2.2), z = 1.4 + Math.sin(t * .9) * .42 + (a - .5) * .21, y = .065 + .03 * (1 + Math.sin(t * 1.7)) * .5; return [x + (a - .5) * .03, y, z, b, a]; });
    const nm = new THREE.Mesh(nas, new THREE.MeshStandardMaterial({ map: tm, roughness: .7, side: THREE.DoubleSide })); nm.castShadow = true; g.add(nm);
    const ges = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .06, 3), new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: .95 })); ges.position.set(1.15, .075, .55); ges.rotation.y = .5; ges.castShadow = true; g.add(ges);
    const fo = forbici(); fo.position.set(3.1, .08, .85); fo.rotation.y = 2.5; fo.scale.setScalar(.92); g.add(fo);

    let hov = null, tt = 0;
    const api = {
      group: g, pick, cam: [6.6, 5.9, 15.4], look: [0, -1, 0], ombre: true,
      update(t, dt) {
        tt = t; api.ombre = t < 3.4 || !!hov;
        rol.forEach(u => {
          const k = ease((t - u.d) / .9); u.lift += (u.liftT - u.lift) * Math.min(1, dt * 9);
          u.o.position.y = u.y0 + (1 - k) * 3.2 + u.lift * .05; if (u.lift > .001) api.ombre = true;
        });
        g.rotation.y = -.06 + Math.sin(t * .2) * .035;
      },
      hover(o) {
        const u = o ? o.userData.r : null; hov = u; rol.forEach(x => x.liftT = x === u ? 1 : 0); if (!u) return null;
        const f = STOFFE[u.k]; return `<b>${f.nome.toUpperCase()}</b>${f.dati} · ${f.stato}<br><span>ESEMPIO DIMOSTRATIVO · DATI FITTIZI</span>`;
      },
    };
    return api;
};

// ---------- scena 2: globo con i fusi orari, fascia giorno/notte, retailer generici ----------
const lonlat = (lon, lat, r = 1) => { const a = lon * Math.PI / 180, b = lat * Math.PI / 180; return new THREE.Vector3(Math.cos(b) * Math.sin(a) * r, Math.sin(b) * r, Math.cos(b) * Math.cos(a) * r); };
const TERRE = [
  [[-165, 64], [-157, 71], [-141, 70], [-125, 71], [-105, 68], [-95, 71], [-85, 69], [-82, 64], [-93, 59], [-85, 55], [-79, 52], [-78, 58], [-70, 62], [-62, 58], [-56, 52], [-66, 50], [-60, 46], [-70, 44], [-74, 40], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 21], [-90, 19], [-87, 21], [-88, 16], [-83, 14], [-82, 9], [-78, 8], [-85, 11], [-95, 16], [-105, 20], [-110, 24], [-114, 30], [-117, 33], [-122, 37], [-124, 42], [-124, 48], [-130, 54], [-140, 60], [-150, 60], [-160, 56], [-165, 60]],
  [[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-35, -10], [-39, -18], [-48, -26], [-53, -34], [-62, -39], [-65, -46], [-69, -52], [-74, -52], [-74, -42], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 1]],
  [[-44, 60], [-52, 65], [-55, 70], [-68, 76], [-60, 82], [-35, 83], [-20, 80], [-22, 72], [-32, 68], [-40, 65]],
  [[-16, 15], [-17, 21], [-13, 28], [-9, 33], [-5, 36], [10, 37], [11, 33], [20, 31], [25, 32], [33, 31], [35, 28], [37, 21], [39, 15], [43, 12], [51, 12], [48, 5], [41, -2], [39, -8], [40, -15], [35, -20], [33, -26], [27, -34], [19, -35], [15, -27], [12, -18], [13, -8], [9, -1], [9, 4], [3, 6], [-7, 4], [-13, 8]],
  [[-9, 37], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [8, 57], [11, 54], [20, 55], [23, 59], [29, 60], [22, 61], [21, 65], [17, 62], [12, 56], [6, 58], [5, 62], [14, 68], [25, 71], [40, 67], [45, 68], [68, 69], [72, 73], [90, 76], [105, 78], [130, 72], [160, 70], [180, 68], [178, 64], [163, 60], [162, 56], [156, 51], [155, 59], [142, 59], [135, 54], [141, 48], [130, 42], [127, 36], [125, 40], [121, 39], [122, 31], [120, 25], [110, 21], [107, 17], [109, 12], [105, 9], [100, 13], [103, 2], [100, 5], [98, 10], [97, 16], [92, 21], [87, 21], [80, 15], [78, 8], [73, 17], [72, 21], [66, 25], [57, 26], [51, 29], [48, 30], [52, 24], [56, 25], [59, 22], [52, 16], [45, 13], [43, 15], [39, 21], [35, 28], [35, 36], [28, 36], [27, 41], [23, 38], [22, 37], [19, 42], [14, 45], [18, 40], [16, 38], [12, 44], [8, 44], [3, 43], [0, 39], [-2, 37], [-5, 36]],
  [[114, -22], [122, -18], [130, -12], [136, -12], [140, -17], [145, -14], [153, -26], [150, -37], [140, -38], [131, -32], [116, -34]],
  [[-5, 50], [1, 51], [0, 54], [-3, 58], [-6, 57], [-4, 54]], [[-10, 52], [-6, 52], [-6, 55], [-9, 54]],
  [[130, 32], [136, 34], [141, 36], [142, 41], [140, 40], [136, 36], [131, 34]], [[44, -16], [49, -13], [50, -16], [47, -25], [44, -24]],
  [[95, 5], [104, -3], [105, -6], [100, -2]], [[109, 1], [116, 6], [118, 1], [114, -4], [110, -2]], [[131, -1], [141, -3], [150, -9], [142, -9], [133, -4]],
  [[172, -35], [178, -38], [174, -41], [167, -46], [170, -43]], [[-24, 65], [-14, 66], [-14, 64], [-22, 63]], [[8, 41], [10, 41], [10, 39], [8, 39]], [[13, 38], [16, 38], [15, 37]],
  [[-120, 74], [-90, 76], [-70, 82], [-90, 82], [-115, 77]],
];
function puntiTerra(R) {
  const W = 720, H = 360, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff';
  TERRE.forEach(p => { x.beginPath(); p.forEach((q, i) => { const X = (q[0] + 180) / 360 * W, Y = (90 - q[1]) / 180 * H; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); x.fill(); });
  const d = x.getImageData(0, 0, W, H).data, pos = [], passo = 1.35;
  for (let lat = -58; lat <= 83; lat += passo) {
    const n = Math.max(8, Math.round(360 * Math.cos(lat * Math.PI / 180) / passo));
    for (let i = 0; i < n; i++) { const lon = -180 + (i + (Math.round(lat / passo) & 1) * .5) * 360 / n, X = Math.min(W - 1, (lon + 180) / 360 * W) | 0, Y = Math.min(H - 1, (90 - lat) / 180 * H) | 0; if (d[(Y * W + X) * 4 + 3] > 128) { const v = lonlat(lon, lat, R + .004); pos.push(v.x, v.y, v.z); } }
  }
  return pos;
}
// punti generici, a scopo illustrativo: nessun nome, nessun retailer reale
const PUNTI = [[42, -90], [36, -100], [46, -75], [20, -100], [-23, -55], [-34, -62], [50, 2], [47, 16], [55, 25], [25, 54], [24, 90], [31, 112], [37, 136], [1, 104], [-30, 145], [-29, 25], [60, 40], [12, 78]];
const SARD = [9, 39.3], R_G = 2.72, GIORNO = 40; // un giorno simulato dura GIORNO secondi
const orario = (lon, hs) => (hs + (lon - SARD[0]) / 15 + 48) % 24;
const hhmm = h => String(h | 0).padStart(2, '0') + ':' + String(((h % 1) * 12 | 0) * 5).padStart(2, '0');
const aperto = h => h >= 9 && h < 18;
const scene2 = {};
scene2.costruisci = () => {
  const g = new THREE.Group(), terra = new THREE.Group(); g.add(terra); terra.rotation.set(.3, -.22, .0);
  const u = { sole: { value: new THREE.Vector3(1, 0, 0) } };
  const globo = new THREE.Mesh(new THREE.SphereGeometry(R_G, 96, 64), new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: `varying vec3 n; varying vec3 v; varying vec3 vn; void main(){ n=normal; vn=normalMatrix*normal; vec4 m=modelViewMatrix*vec4(position,1.); v=normalize(-m.xyz); gl_Position=projectionMatrix*m; }`,
    fragmentShader: `uniform vec3 sole; varying vec3 n; varying vec3 v; varying vec3 vn;
      void main(){ vec3 N=normalize(n); float d=dot(N,sole), g=smoothstep(-.14,.2,d);
        vec3 c=mix(vec3(.0035,.0065,.012),vec3(.03,.055,.09),g);
        c+=vec3(.62,.44,.2)*exp(-pow(d/.07,2.))*.2;
        vec3 VN=normalize(vn); float f=pow(1.-max(dot(VN,v),0.),3.); c+=mix(vec3(.012,.02,.03),vec3(.09,.12,.16),g)*f;
        gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
      }`,
  })); terra.add(globo);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(puntiTerra(R_G), 3));
  terra.add(new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { ...u, px: { value: PR * (innerWidth > 1500 ? 2.9 : 2.3) } }, transparent: true, depthWrite: false,
    vertexShader: `uniform vec3 sole; uniform float px; varying float g; void main(){ g=smoothstep(-.12,.18,dot(normalize(position),sole)); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=px; }`,
    fragmentShader: `varying float g; void main(){ float r=length(gl_PointCoord-.5); if(r>.5) discard; vec3 c=mix(vec3(.2,.14,.07),vec3(.74,.62,.42),g); gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
      }`,
  })));
  // 24 fusi: un meridiano ogni 15 gradi; quello della Sardegna in oro
  const mp = []; for (let l = 0; l < 24; l++) for (let a = -84; a < 84; a += 4) { const A = lonlat(l * 15 + 7.5, a, R_G + .012), B = lonlat(l * 15 + 7.5, a + 4, R_G + .012); mp.push(A.x, A.y, A.z, B.x, B.y, B.z); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(mp, 3));
  terra.add(new THREE.LineSegments(mg, new THREE.LineBasicMaterial({ color: SAND, transparent: true, opacity: .1 })));
  // anello delle ore attorno al globo, con il sole che lo percorre
  const R2 = R_G * 1.2, ang = new THREE.Group(); terra.add(ang);
  const anp = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, l = i % 6 === 0 ? 1.075 : 1.04; anp.push(Math.sin(a) * R2, 0, Math.cos(a) * R2, Math.sin(a) * R2 * l, 0, Math.cos(a) * R2 * l); }
  const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.Float32BufferAttribute(anp, 3));
  ang.add(new THREE.LineSegments(ag, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .75 })));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R2, .007, 6, 180), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .5 })); ring.rotation.x = Math.PI / 2; ang.add(ring);
  const alone = texCanvas(128, 128, (x, W) => { const c = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); c.addColorStop(0, 'rgba(255,232,190,1)'); c.addColorStop(.25, 'rgba(232,190,120,.55)'); c.addColorStop(1, 'rgba(200,150,80,0)'); x.fillStyle = c; x.fillRect(0, 0, W, W); });
  const astro = new THREE.Sprite(new THREE.SpriteMaterial({ map: alone, transparent: true, depthWrite: false })); astro.scale.setScalar(.72); terra.add(astro);
  // Sardegna
  const pS = lonlat(SARD[0], SARD[1], R_G + .01), sar = new THREE.Mesh(new THREE.SphereGeometry(.058, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf3efe6 })); sar.position.copy(pS); terra.add(sar);
  const onda = new THREE.Mesh(new THREE.RingGeometry(.075, .094, 40), new THREE.MeshBasicMaterial({ color: 0xf3efe6, transparent: true, depthWrite: false, side: THREE.DoubleSide })); onda.position.copy(pS).multiplyScalar(1.003); onda.lookAt(pS.clone().multiplyScalar(2)); terra.add(onda);
  // retailer: punto, alone, arco verso la Sardegna
  const pick = [globo], punti = PUNTI.map((p, i) => {
    const P = lonlat(p[1], p[0], R_G + .012), pt = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), new THREE.MeshBasicMaterial({ color: 0xd9b777 })); pt.position.copy(P); terra.add(pt);
    const a = P.clone().normalize(), b = pS.clone().normalize(), om = a.angleTo(b), pp = []; for (let k = 0; k <= 48; k++) { const q = k / 48, s = Math.sin(om), v = a.clone().multiplyScalar(Math.sin((1 - q) * om) / s).add(b.clone().multiplyScalar(Math.sin(q * om) / s)).normalize(); pp.push(v.multiplyScalar(R_G + .02 + Math.sin(q * Math.PI) * (.05 + om * .15))); }
    const arco = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 64, .0085, 5), new THREE.MeshBasicMaterial({ color: 0xe2c48a, transparent: true, opacity: 0, depthWrite: false })); arco.geometry.setDrawRange(0, 0); terra.add(arco);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })); hit.position.copy(P); hit.userData.p = { lon: p[1] }; terra.add(hit); pick.push(hit);
    return { pt, arco, tot: arco.geometry.index.count, lon: p[1], fase: i * .61 % 1 };
  });
  const hS = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })); hS.position.copy(pS); hS.userData.s = true; terra.add(hS); pick.push(hS);
  let hs = 19, hov = null, lastTip = 0;
  const testo = o => {
    if (!o) return null;
    if (o.userData.s) return `<b>SARDEGNA · ${hhmm(hs)}</b>${aperto(hs) ? 'Ufficio commerciale aperto.' : 'Ufficio chiuso. Il retailer riceve comunque risposta.'}`;
    if (o.userData.p) { const h = orario(o.userData.p.lon, hs); return `<b>UN RETAILER · ${hhmm(h)} DA LUI</b>${aperto(h) ? 'È in orario di lavoro' : 'Fuori orario'}. In Sardegna sono le ${hhmm(hs)}.<br><span>PUNTO GENERICO, A SCOPO ILLUSTRATIVO</span>`; }
    return null;
  };
  const api = {
    group: g, pick, cam: [0, 1.1, 12.6], look: [0, 0, 0], ombre: false, onOra: null,
    update(t, dt) {
      hs = (19 + t * 24 / GIORNO) % 24;
      const lonSole = SARD[0] + (12 - hs) * 15; u.sole.value.copy(lonlat(lonSole, 12)); astro.position.copy(lonlat(lonSole, 0, R2));
      const chiuso = !aperto(hs); let arrivi = 0;
      punti.forEach(p => {
        const h = orario(p.lon, hs), sv = aperto(h), attivo = chiuso && sv, f = (t * .24 + p.fase) % 1;
        p.pt.scale.setScalar(sv ? 1.15 + Math.sin(t * 3 + p.fase * 6) * .22 : .7); p.pt.material.color.setHex(sv ? 0xf0d59a : 0x7d6a48);
        p.arco.geometry.setDrawRange(0, attivo ? Math.floor(ease(f / .5) * p.tot / 3) * 3 : 0);
        p.arco.material.opacity = attivo ? Math.min(1, f * 8) * (f > .75 ? (1 - f) / .25 : 1) * .9 : 0; if (attivo && f > .45 && f < .7) arrivi++;
      });
      const k = (t * .5) % 1, q = 1 + k * (arrivi ? 3.4 : 1.8); onda.scale.set(q, q, 1); onda.material.opacity = (1 - k) * (arrivi ? .9 : .4);
      terra.rotation.y = -.22 + Math.sin(t * .12) * .1;
      if (api.onOra && t - lastTip > .2) { lastTip = t; api.onOra({ ora: hhmm(hs), chiuso }); if (hov) { const m = testo(hov); if (m) document.getElementById('tip').innerHTML = m; } }
    },
    hover(o) { hov = o && (o.userData.s || o.userData.p) ? o : null; return testo(hov); },
  };
  return api;
};

// fondo leggero per le slide di testo: pulviscolo d'oro
const scene3 = { costruisci() {
  const g = new THREE.Group(), n = 140, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 26; p[i * 3 + 1] = (Math.random() - .5) * 14; p[i * 3 + 2] = (Math.random() - .8) * 14; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: GOLD, size: .035, transparent: true, opacity: .32, depthWrite: false })); g.add(dots);
  return { group: g, pick: [], cam: [0, 0, 12], look: [0, 0, 0], update(t) { dots.rotation.y = t * .012; dots.position.y = Math.sin(t * .3) * .12; } };
} };
const SCENE = { tavolo: scene1, mondo: scene2, ambient: scene3 }, fatte = {};

// ---------- ciclo, mouse, passaggio ----------
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(9, 9);
let mx = 0, my = 0, drag = false, lastX = 0, vel = 0, yaw = 0, moved = 0, hovered = null;
const tip = document.getElementById('tip');
const tStart = performance.now(); let last = performance.now();
const view = { cam: new THREE.Vector3(0, 0, 12), look: new THREE.Vector3(), off: 0, offWanted: 0, offY: 0, k: 1 };
const look = new THREE.Vector3();

function layout() {
  const w = innerWidth, h = innerHeight, wide = w / h > 1.15 && w > 900;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = wide ? 34 : 46; camera.updateProjectionMatrix();
  view.off = wide ? view.offWanted : 0; view.offY = wide ? 0 : view.offYstretto || 0; view.k = wide ? 1 : view.kStretto || .62;
}
addEventListener('resize', layout);

addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; mouse.set(mx, my);
  if (drag) { const dx = e.clientX - lastX; vel = dx * .004; yaw += vel; moved += Math.abs(dx); }
  lastX = e.clientX;
  tip.style.left = Math.min(e.clientX + 18, innerWidth - 380) + 'px'; tip.style.top = Math.min(e.clientY + 16, innerHeight - 150) + 'px';
});
addEventListener('pointerdown', e => { if (e.target !== canvas && !e.target.closest('.slide')) return; if (e.target.closest('button,a,.tile,.off,.pan,.chat')) return; drag = true; moved = 0; lastX = e.clientX; });
addEventListener('pointerup', () => { drag = false; });
document.addEventListener('pointerleave', () => mouse.set(9, 9));

function pickLoop() {
  if (!current || !current.pick.length || mouse.x > 2 || document.body.classList.contains('no3d')) { setHover(null); return; }
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(current.pick, false);
  setHover(hits.length ? hits[0].object : null);
}
function setHover(o) {
  if (o === hovered) return; hovered = o;
  const html = current && current.hover ? current.hover(o) : null;
  if (html) { tip.innerHTML = html; tip.classList.add('on'); } else tip.classList.remove('on');
  document.body.style.cursor = html ? 'pointer' : '';
}

let running = true, tick = 0;
function frame() {
  const now = performance.now(); const real = Math.min(.6, (now - last) / 1000), dt = Math.min(.05, real), ease2 = 1 - Math.exp(-real * 3.2); last = now; const t = (now - tStart) / 1000;
  if (!drag) { yaw += vel; vel *= .93; }
  root.rotation.y += ((yaw + mx * .3) - root.rotation.y) * ease2;
  root.rotation.x += ((-my * .07) - root.rotation.x) * ease2;
  root.position.x += (view.off - root.position.x) * ease2; root.position.y += (view.offY - root.position.y) * ease2;
  const rk = root.scale.x + (view.k - root.scale.x) * ease2; root.scale.setScalar(rk);
  camera.position.lerp(view.cam, ease2); look.lerp(view.look, ease2); camera.lookAt(look);
  if (current) current.update(t - current.t0, dt);
  pickLoop();
  if (current && current.ombre && (tick++ % 2 === 0)) renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => { const p = document.hidden; if (p === !running) return; running = !p; renderer.setAnimationLoop(p ? null : frame); last = performance.now(); });

// le scene si costruiscono una volta sola: tornando indietro riparte l'animazione, non il telaio
export function mostra(nome, opts = {}) {
  view.offWanted = opts.offsetX || 0; view.offYstretto = opts.offY || 0; view.kStretto = opts.kStretto || 0; layout();
  if (current && current.nome === nome) return current;
  if (current) root.remove(current.group);
  setHover(null); yaw = 0; vel = 0;
  const n = SCENE[nome] ? nome : 'ambient';
  current = fatte[n] || (fatte[n] = SCENE[n].costruisci()); current.nome = nome; current.t0 = (performance.now() - tStart) / 1000;
  root.add(current.group); root.rotation.set(0, 0, 0);
  const sc = opts.scale || 1; current.group.scale.setScalar(sc);
  view.cam.set(...current.cam); view.look.set(...current.look);
  if (opts.snap) { camera.position.copy(view.cam); look.copy(view.look); root.position.x = view.off; root.position.y = view.offY; root.scale.setScalar(view.k); }
  renderer.shadowMap.needsUpdate = true;
  return current;
}
export function suOra(cb) { if (current) current.onOra = cb; }
