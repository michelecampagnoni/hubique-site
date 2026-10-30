// Motore 3D della presentazione per Etikasa Group (three r186, locale in vendor/).
// Un solo renderer trasparente sopra il fondo chiaro; ogni slide chiede una scena per nome.
// Il mouse inclina la scena, il trascinamento la gira, il passaggio accende gli oggetti.
import * as THREE from 'three';

const ANT = 0x2c3333, AZ = 0x2ea3f2, AZP = 0x8fd3ff, WHITE = 0xffffff;
const ANTC = '#2c3333', AZC = '#2ea3f2', AZT = '#1579bd', MUTC = '#6f7a7b';
const FONT = '"Chakra Petch", -apple-system, sans-serif';
export const STATI = {
  interni: { c: AZ, t: 'PROGETTO DI INTERNI', d: 'Arredi, materiali e finiture di un appartamento.' },
  ristrutturazione: { c: 0xe6a52e, t: 'RISTRUTTURAZIONE', d: 'Cantiere aperto, con fasi, SAL e varianti.' },
  piccolo: { c: 0x4fa37f, t: 'PICCOLO INTERVENTO', d: 'Un bagno, una tinteggiatura: lavori anche da 3.000 €. Poca fatica, stessa commessa.' },
  flipping: { c: 0xc4603a, t: 'FLIPPING', d: 'Acquisto, lavori e rivendita di un appartamento.' },
  immobiliare: { c: 0x3f6f9e, t: 'OPERAZIONE IMMOBILIARE', d: 'Un intero corpo di fabbrica: acquisto, lavori e vendita.' },
};
export const SISTEMI = Object.keys(STATI);

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const piccolo = Math.min(innerWidth, innerHeight) < 600;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cc, 1.75));
const sun = new THREE.DirectionalLight(0xfff4e4, 2.1); sun.position.set(-6, 15, 13); scene.add(sun);
sun.castShadow = true; sun.shadow.mapSize.setScalar(piccolo ? 1024 : 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .025;
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 50 });
const root = new THREE.Group(); scene.add(root);
let current = null;

// ---------- utilità ----------
const white = new THREE.Color(WHITE);
const pale = (c, k = .6) => new THREE.Color(c).lerp(white, k);
function lines(geo, color = ANT, opacity = .5) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
function solid(geo, color = 0xf4f6f7, { rough = .6, metal = .05, emissive = 0 } = {}) {
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive }));
}
function texCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function tessera(w, h, draw, rx, ry, dati = false) {
  const t = texCanvas(w, h, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); if (dati) t.colorSpace = THREE.NoColorSpace; return t;
}
function label(text, { w = 2, h = .28, color = ANTC, size = 70, weight = 700, sub = null } = {}) {
  const t = texCanvas(Math.round(512 * w / h * .5), 256, (x, W, H) => {
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `${weight} ${size * 2}px ${FONT}`; x.fillText(text, W / 2, sub ? H * .36 : H / 2);
    if (sub) { x.font = `600 ${size * .55}px ${FONT}`; x.fillStyle = MUTC; x.fillText(sub, W / 2, H * .74); }
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
}
const softTex = texCanvas(256, 256, (x, W) => {
  const g = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  g.addColorStop(0, 'rgba(44,51,51,.2)'); g.addColorStop(.55, 'rgba(44,51,51,.07)'); g.addColorStop(1, 'rgba(44,51,51,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, W);
});
function shadowDisc(r = 5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
function circle(r, color = ANT, opacity = .25, seg = 128, arc = Math.PI * 2, a0 = 0) {
  const p = []; for (let i = 0; i <= seg; i++) { const a = a0 + arc * i / seg; p.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
class Poly extends THREE.Curve {
  constructor(pts) {
    super(); this.p = pts.map(a => new THREE.Vector3(...a)); this.L = [0];
    for (let i = 1; i < this.p.length; i++) this.L.push(this.L[i - 1] + this.p[i].distanceTo(this.p[i - 1]));
    this.len = this.L[this.L.length - 1];
  }
  getPoint(t, out = new THREE.Vector3()) {
    const d = Math.min(Math.max(t, 0), 1) * this.len; let i = 1; while (i < this.L.length - 1 && this.L[i] < d) i++;
    const k = (d - this.L[i - 1]) / ((this.L[i] - this.L[i - 1]) || 1); return out.lerpVectors(this.p[i - 1], this.p[i], k);
  }
}
const dummy = new THREE.Object3D();
const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });

// ---------- lotti: tante forme unite in una sola mesh, nella trasformazione corrente (MX) ----------
const CUBO = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(), CP = CUBO.attributes.position.array, CN = CUBO.attributes.normal.array;
let MX = new THREE.Matrix4();
const qui = (x, y, z, ry = 0) => { MX = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z); };
class Lotto {
  constructor(mat, ombra = true) { this.mat = mat; this.ombra = ombra; this.p = []; this.n = []; this.u = []; }
  v(x, y, z, a, b, c, s, t) {
    const e = MX.elements; this.p.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
    this.n.push(e[0] * a + e[4] * b + e[8] * c, e[1] * a + e[5] * b + e[9] * c, e[2] * a + e[6] * b + e[10] * c); this.u.push(s, t);
  }
  box(x, y, z, w, h, d) { for (let i = 0; i < 36; i++) this.v(CP[i * 3] * w + x, CP[i * 3 + 1] * h + y, CP[i * 3 + 2] * d + z, CN[i * 3], CN[i * 3 + 1], CN[i * 3 + 2], 0, 0); return this; }
  geo(g, m = null) {
    const a = g.index ? g.toNonIndexed() : g, P = a.attributes.position, N = a.attributes.normal, UV = a.attributes.uv;
    const v = new THREE.Vector3(), w = new THREE.Vector3(), nm = m ? new THREE.Matrix3().getNormalMatrix(m) : null;
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i); w.fromBufferAttribute(N, i); if (m) { v.applyMatrix4(m); w.applyMatrix3(nm).normalize(); }
      this.v(v.x, v.y, v.z, w.x, w.y, w.z, UV ? UV.getX(i) : 0, UV ? UV.getY(i) : 0);
    } return this;
  }
  mesh() {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    const m = new THREE.Mesh(g, this.mat); m.castShadow = this.ombra; m.receiveShadow = true; return m;
  }
}
function trave(L, a, b, s, s2 = s) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); dummy.position.copy(A).add(B).multiplyScalar(.5); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0); dummy.lookAt(B); dummy.scale.set(s, s2, A.distanceTo(B)); dummy.updateMatrix();
  L.geo(CUBO, dummy.matrix);
}
function prisma(pts, depth) { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }); }
const posa = (x, y, z, ry = 0) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);

// ---------- scena 1: palazzo torinese in spaccato, a cantiere aperto ----------
const S = {};
S.palazzo = (o = {}) => {
  const fin = !!o.finito, g = new THREE.Group(), pick = [], units = [], Y = [0, 1.25, 2.4, 3.45, 4.45], TK = .16;
  const noise = tessera(256, 256, (x, W) => { const d = x.createImageData(W, W); for (let i = 0; i < d.data.length; i += 4) { const v = 180 + Math.random() * 75; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }, 2.2, 2.2, true);
  const bugTex = tessera(512, 512, (x, W) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, W); x.fillStyle = '#5c5850'; const r = W / 4;
    for (let i = 0; i < 4; i++) { x.fillRect(0, i * r, W, 13); const o2 = i % 2 ? 0 : W / 4; for (let j = 0; j < 2; j++) x.fillRect((o2 + j * W / 2) % W, i * r, 10, r); }
  }, 1 / 1.05, 1 / .64);
  const tetTex = tessera(256, 256, (x, W) => {
    x.fillStyle = '#6a6f6e'; x.fillRect(0, 0, W, W); x.fillStyle = '#3c4243';
    for (let i = 0; i < 8; i++) { x.fillRect(i * W / 8, 0, 7, W); for (let j = 0; j < 8; j++) { x.globalAlpha = .28; x.fillRect(i * W / 8, (j + (i % 2) * .5) * W / 8 % W, W / 8, 5); x.globalAlpha = 1; } }
  }, 1 / .62, 1 / .62);
  const std = (color, a = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...a });
  const L = {
    int: new Lotto(std(0xeadfca, { bumpMap: noise, bumpScale: .6 })), bug: new Lotto(std(0xd8cebb, { map: bugTex, bumpMap: bugTex, bumpScale: 2.5 })),
    pie: new Lotto(std(0xf2ecdf, { roughness: .7 })), fer: new Lotto(std(ANT, { roughness: .45, metalness: .45 })), bia: new Lotto(std(0xfafaf7)),
    scu: new Lotto(std(0x4b5758)), tet: new Lotto(std(0xffffff, { map: tetTex })), leg: new Lotto(std(0xb6905f)), par: new Lotto(std(0xcfae83)), cem: new Lotto(std(0xc4c8c8)),
    poc: new Lotto(std(ANT, { roughness: .95 })), arr: new Lotto(std(0x96a3a5)), azz: new Lotto(std(AZ, { roughness: .45, metalness: .2 })), str: new Lotto(std(0xb9bfc1), false),
    mar: new Lotto(std(0xe7e8e4), false), pav: new Lotto(std(0xd6d5cd), false), ver: new Lotto(std(0xa9bca6, { flatShading: true })),
    ces: new Lotto(std(0xbfdcef, { roughness: .35 })), ter: new Lotto(std(0xc4603a, { roughness: .6 })),
  };
  // ogni commessa ha i suoi vetri (materiale proprio) e, se nello spaccato, un volume che si accende
  const nuova = (id, tipo, stato, f) => {
    if (fin) stato = 'interni';
    const mv = new THREE.MeshStandardMaterial({ color: 0x3e4f58, roughness: .22, metalness: .35, emissive: STATI[stato].c, emissiveIntensity: 0 });
    const u = { id, tipo, stato, f, k: 0, mv, vetri: new Lotto(mv, false) }; units.push(u); return u;
  };
  const nomiP = ['piano terra', 'primo piano', 'secondo piano', 'terzo piano', 'sottotetto'];
  const lista = (a) => a.map((s, f) => nuova(s, nomiP[f], s, f));
  const Aa = lista(['piccolo', 'interni', 'ristrutturazione', 'flipping']), Ab = lista(['interni', 'flipping', 'piccolo', 'ristrutturazione']);
  // lo spaccato: ogni stanza è un lavoro di natura diversa
  const tipiO = [['ristrutturazione', 'interni'], ['interni', 'piccolo'], ['flipping', 'ristrutturazione'], ['piccolo', 'flipping'], ['immobiliare', 'immobiliare']];
  const O1 = tipiO.map((s, f) => nuova(s[0], nomiP[f], s[0], f)), O2 = tipiO.map((s, f) => nuova(s[1], nomiP[f], s[1], f));
  const Bu = lista(['piccolo', 'ristrutturazione', 'interni', 'piccolo']);
  // l'ala su cortile, col ponteggio, è una sola commessa: l'operazione immobiliare
  const opI = fin ? null : nuova('immobiliare', 'ala su cortile', 'immobiliare', 0);
  const Cu = [0, 1, 2, 3].map(f => [0, 1, 2, 3].map(b => opI || nuova('interni', nomiP[f], 'interni', f)));
  const boxPick = (u, c, s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...s), pickMat); m.position.set(...c); m.userData.u = u; g.add(m); pick.push(m); return m; };

  // pareti con aperture: una fascia per piano, così lo spaccato può scalare piano per piano
  function fascia(Lot, x0, x1, y0, y1, fori) {
    const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath();
    fori.forEach(h => {
      const p = new THREE.Path(), a = h.x - h.w / 2, b = h.x + h.w / 2, t = h.y + h.h;
      p.moveTo(a, h.y);
      if (h.arco) { p.lineTo(a, t - h.w / 2); p.absarc(h.x, t - h.w / 2, h.w / 2, Math.PI, 0, true); p.lineTo(b, h.y); } else { p.lineTo(a, t); p.lineTo(b, t); p.lineTo(b, h.y); }
      p.closePath(); s.holes.push(p);
    });
    const e = new THREE.ExtrudeGeometry(s, { depth: TK, bevelEnabled: false, curveSegments: 10 }); e.translate(0, 0, -TK); Lot.geo(e); e.dispose();
  }
  function apertura(a, f) {
    const { x, y, w, h, u, arco, porta } = a, gl = u.vetri, tH = arco ? h - w / 2 : h;
    if (porta === 'portone') {
      const s = new THREE.Shape(); s.moveTo(x - w / 2, y); s.lineTo(x + w / 2, y); s.lineTo(x + w / 2, y + tH); s.absarc(x, y + tH, w / 2, 0, Math.PI, false); s.closePath();
      const e = new THREE.ExtrudeGeometry(s, { depth: .02, bevelEnabled: false, curveSegments: 12 }); e.translate(0, 0, -TK * .75); L.scu.geo(e); e.dispose();
      L.pie.box(x, y + tH + w / 2 + .02, .03, .13, .2, .1); [-1, 1].forEach(k => L.pie.box(x + k * (w / 2 + .05), y + tH / 2, .02, .09, tH, .06));
      L.fer.box(x, y + tH / 2 + .1, -TK * .7, .012, tH + .2, .012); [.3, .55, .8].forEach(q => [-1, 1].forEach(k => L.fer.box(x + k * w * .25, y + tH * q, -TK * .7, w * .32, .02, .012)));
      return;
    }
    gl.box(x, y + tH / 2, -TK * .62, w, tH, .012);
    if (arco) { const c = new THREE.CircleGeometry(w / 2, 14, 0, Math.PI); const m = new THREE.Matrix4().makeTranslation(x, y + tH, -TK * .62); gl.geo(c, m); }
    L.bia.box(x, y + tH / 2, -TK * .58, .018, tH, .016); L.bia.box(x, y + tH * .62, -TK * .58, w, .016, .016);
    if (porta) L.scu.box(x, y + tH * .28, -TK * .6, w, tH * .56, .018);
    if (f === 0) return;
    const fr = .05; // cornice in pietra
    L.pie.box(x - w / 2 - fr / 2, y + h / 2, .012, fr, h + fr, .03); L.pie.box(x + w / 2 + fr / 2, y + h / 2, .012, fr, h + fr, .03); L.pie.box(x, y + h + fr / 2, .012, w + fr * 2, fr, .03);
    L.pie.box(x, y - .02, .03, w + .16, .04, .08);
  }
  function balcone(x0, x1, y, dep = .34) {
    L.pie.box((x0 + x1) / 2, y, dep / 2, x1 - x0, .06, dep); L.pie.box((x0 + x1) / 2, y - .045, dep / 2 - .02, x1 - x0 - .04, .03, dep - .04);
    for (let x = x0 + .1; x < x1; x += Math.max(.32, (x1 - x0 - .2) / Math.round((x1 - x0) / .36))) L.pie.box(x, y - .11, dep * .42, .07, .12, dep * .8);
    ringhiera(x0 + .02, x1 - .02, y + .03, dep - .025); [x0 + .02, x1 - .02].forEach(x => { for (let z = .03; z < dep - .03; z += .06) L.fer.box(x, y + .03 + .15, z, .01, .3, .01); L.fer.box(x, y + .33, dep / 2, .018, .018, dep); });
  }
  function ringhiera(x0, x1, y, z) {
    L.fer.box((x0 + x1) / 2, y + .3, z, x1 - x0, .018, .018); L.fer.box((x0 + x1) / 2, y + .04, z, x1 - x0, .012, .012);
    for (let x = x0; x <= x1 + .001; x += .06) L.fer.box(x, y + .15, z, .01, .3, .01);
  }
  function cornicione(x0, x1, y) {
    const m = (x0 + x1) / 2, w = x1 - x0; L.pie.box(m, y - .2, .03, w, .05, .08); L.pie.box(m, y - .13, .06, w + .04, .05, .14); L.pie.box(m, y - .02, .13, w + .1, .05, .28); L.pie.box(m, y + .03, .16, w + .14, .04, .34);
    for (let x = x0 + .08; x < x1; x += .2) L.pie.box(x, y - .08, .13, .06, .07, .22);
  }
  const marcap = (x0, x1, y) => { L.pie.box((x0 + x1) / 2, y, .025, x1 - x0, .07, .05); L.pie.box((x0 + x1) / 2, y + .05, .04, x1 - x0, .03, .08); };

  // facciata su strada (ala A): l'ala si interrompe a x=1 e lo spaccato scala piano per piano
  qui(-5, 0, 2.2);
  const ext = fin ? [6, 6, 6, 6] : [4, 4, 3, 3];
  const unA = (i, f) => i <= 1 ? Aa[f] : i === 2 ? Ab[f] : i === 3 ? O1[f] : O2[f];
  const specS = [
    { w: .58, h: .8, y: .16, arco: true }, { w: .42, h: .76, y: Y[1] + .22 }, { w: .4, h: .68, y: Y[2] + .18 }, { w: .36, h: .58, y: Y[3] + .17 },
  ];
  for (let f = 0; f < 4; f++) {
    const fori = [], sp = specS[f];
    for (let i = 0; i < ext[f]; i++) {
      const x = i + .5, por = f === 0 && i === 1, a = por ? { x, y: 0, w: .68, h: 1.04, arco: true, porta: 'portone', u: Aa[0] } : { x, y: sp.y, w: sp.w, h: sp.h, arco: sp.arco, u: unA(i, f) };
      fori.push(a);
    }
    fascia(f === 0 ? L.bug : L.int, 0, ext[f], Y[f], Y[f + 1], fori);
    fori.forEach(a => apertura(a, f));
    fori.forEach((a, i) => {
      if (f === 1) { const tri = i % 2 === 0, x = a.x, t = a.y + a.h + .05, w = a.w + .2;  // timpani alternati del piano nobile
        const e = tri ? prisma([[x - w / 2, t], [x + w / 2, t], [x, t + .15]], .07) : (() => { const s = new THREE.Shape(); s.moveTo(x - w / 2, t); s.lineTo(x + w / 2, t); s.absarc(x, t - w * .35, w * .61, Math.atan2(w * .35, w / 2), Math.PI - Math.atan2(w * .35, w / 2), false); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: .07, bevelEnabled: false, curveSegments: 10 }); })();
        L.pie.geo(e); e.dispose(); L.pie.box(x, t, .035, w + .04, .025, .09); }
      if (f === 2) { L.pie.box(a.x, a.y + a.h + .1, .04, a.w + .22, .04, .1); }
      if (f >= 2) [-1, 1].forEach(k => L.scu.box(a.x + k * (a.w / 2 + .15), a.y + a.h / 2, .024, .19, a.h, .016));
    });
    if (f < 3) marcap(0, Math.min(ext[f], ext[f + 1]), Y[f + 1]);
    if (!fin) L.poc.box(ext[f] + .004, (Y[f] + Y[f + 1]) / 2, -TK / 2, .012, Y[f + 1] - Y[f], TK);
  }
  balcone(.1, Math.min(2.9, ext[1] - .05), Y[1] + .03, .36); if (fin) balcone(3.1, 5.9, Y[1] + .03, .36); else balcone(3.14, 3.86, Y[1] + .03);
  balcone(1.15, 1.85, Y[2] + .03);
  cornicione(0, ext[3], Y[4]);

  // lato cortile dell'ala A: si vede da dentro lo spaccato
  qui(1, 0, 0, Math.PI);
  for (let f = 0; f < 4; f++) {
    const fori = []; for (let i = 0; i < 6; i++) fori.push({ x: i + .5, y: Y[f] + .22, w: .36, h: .62, u: unA(5 - i, f) });
    fascia(L.int, 0, 6, Y[f], Y[f + 1], fori); fori.forEach(a => apertura(a, f === 0 ? 1 : 1));
  }
  cornicione(0, 6, Y[4]);

  // testa dell'ala A
  if (fin) { qui(1, 0, 2.2, Math.PI / 2); for (let f = 0; f < 4; f++) { const fori = [{ x: 1.1, y: Y[f] + .22, w: .38, h: .62, u: O2[f] }]; fascia(f ? L.int : L.bug, 0, 2.2, Y[f], Y[f + 1], fori); fori.forEach(a => apertura(a, f || 1)); } cornicione(0, 2.2, Y[4]); }

  // ballatoi sul cortile: ala B (corta) e ala C (lunga)
  const ballatoi = (n, b, unF) => {
    for (let f = 0; f < 4; f++) {
      const fori = []; for (let i = 0; i < n; i++) { const x = (i + .5) * b, u = unF(i, f);
        fori.push({ x: x - .22, y: Y[f] + .06, w: .3, h: .82, porta: true, u }, { x: x + .22, y: Y[f] + .3, w: .3, h: .54, u }); }
      fascia(f ? L.int : L.bug, 0, n * b, Y[f], Y[f + 1], fori); fori.forEach(a => apertura(a, f));
      if (f) { const y = Y[f] - .01, w = n * b; L.pie.box(w / 2, y, .24, w, .05, .48); for (let i = 0; i <= n * 2; i++) L.fer.box(i * b / 2, y - .09, .22, .03, .13, .42); ringhiera(0, w, y + .03, .46); }
    }
    cornicione(0, n * b, Y[4]);
  };
  qui(-3, 0, 0, Math.PI / 2); ballatoi(3, 3.4 / 3, (i, f) => Bu[f]);
  qui(-3, 0, -3.4); ballatoi(8, 1, (i, f) => Cu[f][i >> 1]);
  for (let f = 0; f < 4; f++) for (let b = 0; b < 4; b++) boxPick(Cu[f][b], [-2 + b * 2, Y[f] + .55, -3.3], [1.9, 1.05, .36]);
  for (let f = 0; f < 4; f++) boxPick(Bu[f], [-2.9, Y[f] + .55, -1.7], [.36, 1.05, 3.3]);
  for (let f = 0; f < 4; f++) { boxPick(Aa[f], [-4, Y[f] + .55, 2.28], [1.95, 1.05, .3]); if (ext[f] > 2) boxPick(Ab[f], [-2.5, Y[f] + .55, 2.28], [.95, 1.05, .3]); }
  qui(5, 0, -3.4, Math.PI / 2);
  for (let f = 0; f < 4; f++) { const fori = [.55, 1.65].map(x => ({ x, y: Y[f] + .22, w: .36, h: .62, u: Cu[f][3] })); fascia(f ? L.int : L.bug, 0, 2.2, Y[f], Y[f + 1], fori); fori.forEach(a => apertura(a, 1)); }
  cornicione(0, 2.2, Y[4]);
  // muri ciechi verso i lotti confinanti
  qui(0, 0, 0);
  L.int.box(-5.0, Y[4] / 2, 1.1, .14, Y[4], 2.2); L.int.box(-5.0, Y[4] / 2, -1.7, .14, Y[4], 3.4); L.int.box(-5.0, Y[4] / 2, -4.5, .14, Y[4], 2.2); L.int.box(0, Y[4] / 2, -5.6, 10, Y[4], .14);

  // solai e tetti
  [...Y].forEach((y, i) => { L.cem.box(-2, y - .04, 1.1, 6, .09, 2.2); if (i) { L.cem.box(0, y - .04, -4.5, 10, .09, 2.2); L.cem.box(-4, y - .04, -1.7, 2, .09, 3.4); } });
  const tetto = (x, z, lung, ry, D = 2.3, H = .95, o = .16) => {
    const m = posa(x, Y[4] + .02, z, ry), e = prisma([[-D / 2 - o, 0], [D / 2 + o, 0], [0, H]], lung); L.tet.geo(e, m); e.dispose();
  };
  const lTet = fin ? 6 : 3;
  tetto(-5, 1.1, lTet, Math.PI / 2); tetto(-5, -4.5, 10, Math.PI / 2); tetto(-4, -3.4, 3.4, 0, 2);
  if (!fin) { const e = prisma([[-1.2, .04], [1.2, .04], [0, .93]], .03); L.poc.geo(e, posa(-2.02, Y[4] + .02, 1.1, Math.PI / 2)); e.dispose(); }
  const abbaino = (x, z, ry = 0) => {
    const m = posa(x, Y[4], z, ry); const c = (a, b, q, w, h, d) => L.int.geo(CUBO, m.clone().multiply(new THREE.Matrix4().makeTranslation(a, b, q).scale(new THREE.Vector3(w, h, d))));
    c(0, .3, 0, .42, .34, .56); const r = prisma([[-.27, 0], [.27, 0], [0, .17]], .6); L.tet.geo(r, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, .47, -.3))); r.dispose();
    L.poc.geo(CUBO, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, .31, .285).scale(new THREE.Vector3(.26, .24, .012))));
    L.pie.geo(CUBO, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, .31, .292).scale(new THREE.Vector3(.02, .24, .012))));
  };
  [-4.5, -3.5, -2.5].forEach(x => abbaino(x, 1.75)); [-1, 1, 3].forEach(x => abbaino(x, -3.95));
  const cam = (x, z, h) => { L.pie.box(x, Y[4] + h / 2 + .4, z, .3, h, .2); L.int.box(x, Y[4] + h + .43, z, .36, .06, .26); L.scu.box(x, Y[4] + h + .52, z, .18, .1, .1); };
  cam(-4.2, 1, .9); cam(-2.6, 1.3, .8); cam(-1.5, -4.8, .9); cam(2.2, -4.2, .9); cam(-4.2, -2, .9); if (fin) cam(.2, 1, .9);
  // tetto aperto sullo spaccato: capriate e arcarecci in legno
  if (!fin) {
    for (let x = -1.85; x <= 1; x += .56) {
      trave(L.leg, [x, Y[4] + .03, -.1], [x, Y[4] + .03, 2.3], .05, .06); trave(L.leg, [x, Y[4] + .03, -.1], [x, Y[4] + .93, 1.1], .05, .07); trave(L.leg, [x, Y[4] + .03, 2.3], [x, Y[4] + .93, 1.1], .05, .07);
      trave(L.leg, [x, Y[4] + .03, 1.1], [x, Y[4] + .9, 1.1], .04); trave(L.leg, [x, Y[4] + .03, .6], [x, Y[4] + .5, 1.1], .035); trave(L.leg, [x, Y[4] + .03, 1.6], [x, Y[4] + .5, 1.1], .035);
    }
    trave(L.leg, [-2, Y[4] + .95, 1.1], [1.02, Y[4] + .95, 1.1], .06);
    [[.45, .23], [.8, .53], [1.4, .53], [1.75, .23]].forEach(([z, h]) => trave(L.leg, [-2, Y[4] + h + .1, z], [1.02, Y[4] + h + .1, z], .04));
    // correnti e prime file di tegole verso l'intatto
    for (let x = -1.95; x < -.9; x += .12) { trave(L.leg, [x, Y[4] + .14, 2.28], [x, Y[4] + .98, 1.14], .022, .03); }
    L.cem.box(1, Y[4] + .05, 1.1, .02, .1, 2.2);
  }

  // spaccato dell'ala A: interni per tipo di lavoro, scala, sezione tagliata
  const uom = (x, y, z, casco = true) => { const c = new THREE.CapsuleGeometry(.05, .24, 3, 8); L.arr.geo(c, new THREE.Matrix4().makeTranslation(x, y + .17, z)); const t = new THREE.SphereGeometry(.05, 10, 8); (casco ? L.azz : L.bia).geo(t, new THREE.Matrix4().makeTranslation(x, y + .4, z)); };
  const stanza = (u, x0, x1, f) => {
    const y = Y[f] + .005, xc = (x0 + x1) / 2, w = x1 - x0, top = f === 4 ? Y[4] + .86 : Y[f + 1] - .09, H = top - Y[f];
    const tp = u.stato, finito = tp === 'interni' || tp === 'piccolo' || tp === 'flipping';
    if (f < 4) { // tramezzi: finiti o a montanti
      const tx = x0 + w * .55;
      if (finito) { L.bia.box(tx, y + H / 2, .62, .04, H, .9); if (x1 < 0) L.bia.box(x1 - .02, y + H / 2, 1.1, .04, H, 2.0); }
      else { for (let z = .2; z < 1.2; z += .22) L.leg.box(tx, y + H / 2, z, .025, H, .04); L.leg.box(tx, y + .03, .7, .04, .03, 1.05); L.leg.box(tx, y + H - .03, .7, .04, .03, 1.05); if (x1 < 0) L.cem.box(x1 - .02, y + H / 2, 1.1, .05, H, 2.0); }
    }
    if (tp === 'interni') { // progetto di interni: arredato, con tavolo da disegno e progettista
      L.par.box(xc, y + .01, 1.08, w, .02, 2.05); L.pie.box(xc + w * .08, y + .024, 1.5, .8, .008, .6);
      L.arr.box(xc + w * .08, y + .1, 1.72, .62, .2, .24); L.arr.box(xc + w * .08, y + .2, 1.84, .62, .22, .08); L.pie.box(xc + w * .08, y + .05, 1.36, .34, .1, .2);
      L.bia.box(x0 + .3, y + .2, .4, .5, .4, .2); L.azz.box(xc - w * .18, y + .15, 1.3, .1, .3, .02).box(xc - w * .18, y + .3, 1.3, .36, .02, .24); uom(xc - w * .18 - .3, y, 1.3, false);
      L.leg.box(x0 + .2, y + .35, 1.1, .04, .7, .7); L.bia.box(x0 + .23, y + .55, 1.1, .02, .22, .5);
    } else if (tp === 'piccolo') { // bagno: rivestimento, vasca, lavabo, sanitario, un solo operaio
      L.bia.box(xc, y + .012, 1.08, w, .02, 2.05); const a = xc - w * .32;
      L.ces.box(xc + .05, y + .3, .3, w * .9, .6, .03); L.ces.box(a - .17, y + .3, 1, .03, .6, 1.2);
      L.bia.box(a + .1, y + .1, .75, .3, .2, .68); L.ces.box(a + .1, y + .2, .75, .22, .01, .58);
      L.bia.box(xc + .22, y + .24, .36, .22, .08, .14); L.bia.box(xc + .22, y + .1, .36, .05, .2, .05); L.bia.box(a + .04, y + .08, 1.32, .15, .16, .2); L.bia.box(a - .08, y + .2, 1.32, .05, .22, .18);
      uom(xc + .3, y, 1.25);
    } else if (tp === 'flipping') { // flipping: metà finito, metà ancora da chiudere, già pronto per la rivendita
      L.par.box(xc - w * .22, y + .01, 1.08, w * .56, .02, 2.05); L.cem.box(xc + w * .28, y + .012, 1.08, w * .44, .018, 1.6);
      L.arr.box(xc - w * .24, y + .1, 1.72, .56, .2, .24); L.arr.box(xc - w * .24, y + .2, 1.84, .56, .22, .08);
      L.ter.box(xc + .28, y + .06, 1.6, .12, .12, .12); trave(L.leg, [xc + .2, y + .02, 1.3], [xc + .3, y + .6, 1.2], .018); L.ter.box(xc + .3, y + .62, 1.2, .16, .04, .04); uom(xc + .08, y, 1.45);
    } else if (tp === 'ristrutturazione') {
      L.cem.box(xc, y + .012, .9, w * .8, .018, .9); L.pie.box(xc + .1, y + .05, 1.5, .32, .1, .24); L.arr.box(xc + .1, y + .15, 1.5, .28, .1, .2);
      trave(L.azz, [xc - .35, y, 1.6], [xc - .3, y + .6, 1.74], .025); trave(L.azz, [xc - .22, y, 1.84], [xc - .3, y + .6, 1.74], .025); uom(xc + .3, y, 1.1);
    } else { // operazione immobiliare: recupero del sottotetto, ancora al grezzo
      [[0, 0], [.14, .08], [-.12, .1], [.05, -.1]].forEach(([a, b], i) => L.cem.box(xc + a, y + .04 + i * .015, 1.3 + b, .22 - i * .03, .08, .18));
    }
    const vol = new THREE.BoxGeometry(w - .06, H - .03, f === 4 ? 1.5 : 2.0), m = new THREE.Mesh(vol, new THREE.MeshBasicMaterial({ color: STATI[u.stato].c, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(xc, Y[f] + H / 2, 1.1); g.add(m); u.glow = m;
    const e = lines(vol, STATI[u.stato].c, 0); e.position.copy(m.position); g.add(e); u.edge = e;
    boxPick(u, [xc, Y[f] + H / 2, 1.1], [w, H, 2.1]);
  };
  qui(0, 0, 0);
  if (!fin) for (let f = 0; f < 5; f++) { stanza(O1[f], -2, -.55, f); stanza(O2[f], -.45, 1, f); L.bia.box(-2.03, f < 4 ? (Y[f] + Y[f + 1]) / 2 : Y[4] + .4, 1.1, .05, f < 4 ? Y[f + 1] - Y[f] : .8, 2.15); }
  if (!fin) for (let f = 0; f < 4; f++) {   // scala a due rampe lungo il muro di cortile
    const H = Y[f + 1] - Y[f], st = H / 16;
    for (let j = 0; j < 8; j++) { L.pie.box(-.92 + j * .085, Y[f] + (j + 1) * st - .02, .3, .09, .05, .26); L.pie.box(-.28 - j * .085, Y[f] + H / 2 + (j + 1) * st - .02, .58, .09, .05, .26); }
    L.pie.box(-.14, Y[f] + H / 2 - .02, .44, .16, .05, .56);
    trave(L.fer, [-.95, Y[f] + .3, .44], [-.25, Y[f] + H / 2 + .26, .44], .012); trave(L.fer, [-.25, Y[f] + H / 2 + .26, .44], [-.95, Y[f + 1] + .3, .44], .012);
  }
  if (!fin) { // sezione: spessori tagliati in antracite
    Y.forEach(y => L.poc.box(1.004, y - .04, 1.1, .012, .09, 2.2)); L.poc.box(1.004, Y[4] / 2, .08, .012, Y[4], .16);
  }

  // basamento: lotto, marciapiede, strada con i binari del tram, cortile
  const base = new THREE.Shape(), R = .35, X0 = -6.6, X1 = 6.8, Z0 = -6.8, Z1 = 5.4;
  base.moveTo(X0 + R, Z0); base.lineTo(X1 - R, Z0); base.quadraticCurveTo(X1, Z0, X1, Z0 + R); base.lineTo(X1, Z1 - R); base.quadraticCurveTo(X1, Z1, X1 - R, Z1); base.lineTo(X0 + R, Z1); base.quadraticCurveTo(X0, Z1, X0, Z1 - R); base.lineTo(X0, Z0 + R); base.quadraticCurveTo(X0, Z0, X0 + R, Z0);
  const bg = new THREE.ExtrudeGeometry(base, { depth: .32, bevelEnabled: false, curveSegments: 8 }); bg.rotateX(Math.PI / 2); L.pie.geo(bg); bg.dispose();
  L.str.box(.1, .004, 3.95, 13.3, .01, 1.7); L.mar.box(.1, .03, 2.65, 13.3, .06, .9); L.mar.box(.1, .03, 5.0, 13.3, .06, .7);
  [3.55, 3.65, 4.25, 4.35].forEach(z => L.scu.box(.1, .012, z, 13.3, .012, .02));
  for (let x = -6.4; x < 6.7; x += .3) L.scu.box(x, .012, 3.95, .12, .004, .012);
  L.pav.box(1, .012, -1.5, 8, .02, 3.8); L.mar.box(3.0, .03, 1.1, 3.9, .05, 2.2);
  for (let x = -2.8; x < 5; x += .5) L.str.box(x, .024, -1.5, .006, .002, 3.8); for (let z = -3.3; z < .4; z += .5) L.str.box(1, .024, z, 8, .002, .006);
  const albero = (x, z, h = 1.2, r = .5) => { L.leg.box(x, h / 2, z, .07, h, .07); [[0, 0, 0, 1], [.25, -.1, .1, .7], [-.22, -.12, -.12, .72], [.05, .25, -.2, .62]].forEach(([a, b, c, k]) => { const s = new THREE.IcosahedronGeometry(r * k, 1); L.ver.geo(s, new THREE.Matrix4().makeTranslation(x + a, h + .25 + b, z + c)); }); };
  albero(5.6, 2.7, 1.2, .42);
  if (fin) albero(2.5, -1.6, 1.2, .46);

  // cantiere: gru, ponteggio, cassone, bancali, recinzione
  const parti = { gru: null, carr: null, fune: null, car: null, mont: null };
  if (!fin) {
    const x0 = 1, x1 = 5, zp = -3.4 + .6, zq = zp + .5, liv = [.9, 1.8, 2.7, 3.6, 4.5];
    for (let x = x0; x <= x1 + .01; x += 1) [zp, zq].forEach(z => L.fer.box(x, 2.6, z, .025, 5.2, .025));
    liv.forEach(y => { [zp, zq].forEach(z => L.fer.box(3, y, z, 4.04, .02, .02)); L.leg.box(3, y + .02, (zp + zq) / 2, 4, .02, .42); });
    for (let i = 0; i < 4; i++) [0, 2, 4].forEach(k => { const a = liv[k] - .9, b = liv[k]; trave(L.fer, [x0 + i, a, zq], [x0 + i + 1, b, zq], .014); });
    const net = new THREE.Mesh(new THREE.PlaneGeometry(4.06, 1.75), new THREE.MeshStandardMaterial({ map: texCanvas(256, 96, (x, W, H) => { x.fillStyle = '#e9f5fe'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(46,163,242,.3)'; for (let i = 0; i < W; i += 7) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += 7) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); } }), transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    net.position.set(3, 4.3, zq + .02); g.add(net);
    L.azz.box(2.9, .35, -.1, 1.25, .5, .62); L.azz.box(2.9, .62, -.1, 1.3, .03, .66); L.arr.box(2.9, .5, -.1, 1.1, .4, .5);
    [[.2, -1.1], [.2, -2.0], [-1.2, -.7]].forEach(([x, z], i) => { L.leg.box(x, .05, z, .5, .06, .4); L.pie.box(x, .19, z, .44, .22, .34); if (i !== 1) L.cem.box(x, .36, z, .36, .12, .28); });
    uom(.75, .02, -1.5); uom(1.9, .02, -2.2); uom(-.4, .04, 2.65, true);
    for (let x = 1.3; x < 4.9; x += .6) { L.fer.box(x, .3, .45, .02, .55, .02); } L.fer.box(3.1, .55, .45, 3.7, .018, .018); L.fer.box(3.1, .12, .45, 3.7, .018, .018); L.azz.box(3.1, .34, .45, 3.7, .12, .006);
    // gru a torre
    const gx = 3.7, gz = -1.5, H = 6.3, s = .13;
    L.cem.box(gx, .1, gz, .8, .2, .8);
    [[-s, -s], [s, -s], [s, s], [-s, s]].forEach(([a, b]) => L.azz.box(gx + a, H / 2, gz + b, .03, H, .03));
    for (let y = .2; y < H; y += .3) { const p = (y * 3.33 | 0) % 2 ? 1 : -1; trave(L.azz, [gx - s, y, gz + s], [gx + s, y + .3, gz + s], .014); trave(L.azz, [gx + s, y, gz - s], [gx - s, y + .3, gz - s], .014); trave(L.azz, [gx + s, y, gz + s * p], [gx + s, y + .3, gz - s * p], .014); trave(L.azz, [gx - s, y, gz + s * p], [gx - s, y + .3, gz - s * p], .014); }
    const G = new Lotto(std(AZ, { roughness: .45, metalness: .2 })), N = new Lotto(std(ANT, { metalness: .4 }));
    const jib = 5.0, ctr = 1.7, h = .2;
    G.box(.05, .08, .22, .28, .3, .24); N.box(.05, .1, .34, .24, .2, .02);
    [[-.09, 0], [.09, 0]].forEach(([z]) => trave(G, [-ctr, .2, z], [jib, .2, z], .022)); trave(G, [0, .2 + h, 0], [jib, .2 + h * .2, 0], .02);
    for (let x = 0; x < jib - .1; x += .3) { const yy = .2 + h * (1 - x / jib * .8); trave(G, [x, yy, 0], [x + .3, .2, .09], .012); trave(G, [x, yy, 0], [x + .3, .2, -.09], .012); }
    N.box(-ctr + .15, .08, 0, .3, .36, .24); G.box(0, .55, 0, .06, .8, .06);
    trave(N, [0, .95, 0], [3.2, .42, 0], .008); trave(N, [0, .95, 0], [-ctr + .1, .3, 0], .008);
    const gru = new THREE.Group(); gru.position.set(gx, H, gz); gru.add(G.mesh(), N.mesh()); g.add(gru); parti.gru = gru;
    const carr = new THREE.Group(); carr.position.y = .17; gru.add(carr); const ca = solid(new THREE.BoxGeometry(.14, .05, .22), ANT); carr.add(ca);
    const fune = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, 1, 5), new THREE.MeshStandardMaterial({ color: ANT })); fune.geometry.translate(0, -.5, 0); carr.add(fune); parti.fune = fune;
    const car = new THREE.Group(); const c1 = solid(new THREE.BoxGeometry(.36, .05, .28), 0xb6905f), c2 = solid(new THREE.BoxGeometry(.3, .18, .24), 0xf2ecdf); c2.position.y = .11; car.add(c1, c2); [c1, c2].forEach(m => m.castShadow = true); carr.add(car); parti.car = car; parti.carr = carr;
    // montacarichi del ponteggio
    L.fer.box(5.3, 2.7, zp + .25, .05, 5.4, .05);
    const mont = solid(new THREE.BoxGeometry(.36, .05, .4), AZ); mont.position.set(5.15, 1, zp + .25); mont.castShadow = true; g.add(mont); parti.mont = mont;
  }

  Object.values(L).forEach(l => { const m = l.mesh(); g.add(m); });
  units.forEach(u => { if (u.vetri.p.length) g.add(u.vetri.mesh()); });
  // anelli a terra, stessa famiglia delle altre scene
  const fondo = new THREE.Group(); fondo.position.y = -.36; fondo.add(shadowDisc(11)); [9.2, 10.2].forEach((r, i) => fondo.add(circle(r, ANT, .12 - i * .03)));
  const archi = new THREE.Group(); [[9.2, .8, .5], [10.2, .4, 3.6]].forEach(([r, a, a0]) => archi.add(circle(r, AZ, .75, 32, a, a0))); fondo.add(archi); g.add(fondo);
  g.position.set(0, -2.15, 1.3); g.rotation.y = -.12;
  const tipOp = 'Piccola o grande, è una commessa: costi e ricavi sullo stesso conto.';

  let active = 'ristrutturazione', forced = null, hov = null, last = 2.4; let tt = 0;
  const api = {
    group: g, pick, cam: [11.5, 7.6, 18.5], look: [0, .35, 0], ombre: true,
    set(s) { forced = s; if (s) active = s; },
    update(t, dt) {
      tt = t;
      if (!fin && !forced && !hov && t - last > 3.2) { last = t; active = SISTEMI[(SISTEMI.indexOf(active) + 1) % SISTEMI.length]; if (api.onSys) api.onSys(active); }
      if (forced) last = t;
      const ondata = t < 2.2; // all'ingresso i piani si accendono dal basso verso l'alto
      units.forEach((u, i) => {
        let w = hov ? (u === hov ? 1 : .05) : fin ? .35 + .55 * (Math.sin(t * .7 + u.f * .9 + i * 1.3) > .35 ? 1 : 0) : ondata ? (t > u.f * .36 && t < u.f * .36 + 1.1 ? 1 : 0) : (u.stato === active ? 1 : .03);
        u.k += (w - u.k) * Math.min(1, dt * 6);
        u.mv.emissiveIntensity = u.k * 1.5; u.mv.color.setRGB(.24 * (1 - u.k), .31 * (1 - u.k), .35 * (1 - u.k));
        if (u.glow) { u.glow.material.opacity = u.k * .42; u.edge.material.opacity = u.k * .95; }
      });
      if (parti.gru) {
        parti.gru.rotation.y = 2.5 + Math.sin(t * .16) * .65; const dist = 2.6 + Math.sin(t * .23) * 1.5; parti.carr.position.x = dist;
        const L0 = 2.9 + Math.sin(t * .31) * 1.2; parti.fune.scale.y = L0; parti.car.position.y = -L0 - .03;
        parti.mont.position.y = 2.6 + Math.sin(t * .4) * 2.2;
      }
      archi.rotation.y = t * .06; g.rotation.y = -.12 + Math.sin(t * .22) * .05;
    },
    hover(ob) {
      const u = ob ? ob.userData.u : null; hov = u;
      if (u && api.onSys) api.onSys(u.stato);
      if (u && fin) return '<b>COMMESSA CHIUSA</b>Costi, ricavi e cassa restano sullo stesso conto.';
      return u ? `<b>${STATI[u.stato].t} · ${u.tipo.toUpperCase()}</b>${STATI[u.stato].d}<br><span style="color:#6f7a7b">${tipOp}</span>` : null;
    },
    dispose() { [noise, bugTex, tetTex].forEach(t => t.dispose()); },
  };
  return api;
};
S.finito = () => S.palazzo({ finito: true });

// ---------- scena 3: il percorso della commessa, valido per tutte le taglie, un solo conto ----------
function modellino(tipo) {
  const G = new THREE.Group();
  const fac = (acc, gr) => texCanvas(256, 300, (x, W, H) => {
    x.fillStyle = gr ? '#c9cdcc' : '#f0e8d9'; x.fillRect(0, 0, W, H); if (!gr) { x.fillStyle = '#ddd3c0'; x.fillRect(0, H * .76, W, H * .24); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const a = acc.includes(r * 4 + c); x.fillStyle = a ? AZC : gr ? '#8f9796' : '#4b5758'; x.fillRect(22 + c * 56, 18 + r * 70, 36, 46); }
  });
  const body = (w, h, d, map, roof) => {
    const m = solid(new THREE.BoxGeometry(w, h, d), roof ? 0xf0e8d9 : 0xc9cdcc); m.position.y = h / 2; m.castShadow = true; G.add(m);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: .85 })); f.position.set(0, h / 2, d / 2 + .004); G.add(f);
    const e = prisma([[-d / 2 - .05, 0], [d / 2 + .05, 0], [0, .3]], w + .1); e.rotateY(Math.PI / 2); e.translate(-w / 2 - .05, h, 0); const t = new THREE.Mesh(e, new THREE.MeshStandardMaterial({ color: roof ? 0x5f6566 : 0x9aa1a0, roughness: .8 })); t.castShadow = true; G.add(t);
  };
  if (tipo === 'acquisto') { body(1, 1.05, .62, fac([], true), false); const k = new THREE.Group(); const a = solid(new THREE.TorusGeometry(.1, .028, 10, 24), AZ, { metal: .4 }), b = solid(new THREE.BoxGeometry(.3, .035, .035), AZ, { metal: .4 }); b.position.x = .24; const c = solid(new THREE.BoxGeometry(.035, .09, .03), AZ); c.position.set(.33, -.05, 0); k.add(a, b, c); k.position.set(.62, .24, .42); k.rotation.z = .4; G.add(k); G.userData.chiave = k; }
  if (tipo === 'lavori') {
    body(1, 1.05, .62, fac([], false), false); const M = new THREE.MeshStandardMaterial({ color: ANT, metalness: .4, roughness: .5 });
    for (let x = -.56; x <= .57; x += .375) { const p = new THREE.Mesh(new THREE.BoxGeometry(.015, 1.3, .015), M); p.position.set(x, .65, .46); G.add(p); }
    [.35, .7, 1.05].forEach(y => { const p = new THREE.Mesh(new THREE.BoxGeometry(1.16, .015, .015), M); p.position.set(0, y, .46); G.add(p); const q = new THREE.Mesh(new THREE.BoxGeometry(1.16, .012, .12), new THREE.MeshStandardMaterial({ color: 0xb6905f })); q.position.set(0, y + .01, .41); G.add(q); });
    const cr = new THREE.Group(), m2 = new THREE.MeshStandardMaterial({ color: AZ, metalness: .2, roughness: .45 }); const tw = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.75, .05), m2); tw.position.y = .875; cr.add(tw); const j = new THREE.Group(); j.position.y = 1.72; const ja = new THREE.Mesh(new THREE.BoxGeometry(1.2, .04, .04), m2); ja.position.x = .36; j.add(ja); cr.add(j); cr.position.set(-.72, 0, -.15); G.add(cr); G.userData.jib = j;
  }
  const foglio = (titolo, x0 = 0, z0 = 0, rz = 0) => {
    const t = texCanvas(300, 400, (x, W, H) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = ANTC; x.font = `700 38px ${FONT}`; x.fillText(titolo, 34, 66); x.fillStyle = 'rgba(44,51,51,.3)'; for (let i = 0; i < 8; i++) x.fillRect(36, 104 + i * 26, i === 7 ? 120 : 228, 7); x.strokeStyle = AZC; x.lineWidth = 7; x.beginPath(); x.arc(216, 332, 40, 0, 7); x.stroke(); x.fillStyle = AZC; x.beginPath(); x.arc(216, 332, 22, 0, 7); x.fill(); });
    const q = new THREE.Group(); const d = new THREE.Mesh(new THREE.BoxGeometry(.8, 1.06, .02), new THREE.MeshStandardMaterial({ color: 0xffffff })); d.castShadow = true; const f = new THREE.Mesh(new THREE.PlaneGeometry(.78, 1.04), new THREE.MeshBasicMaterial({ map: t })); f.position.z = .012; q.add(d, f);
    q.position.set(x0, .56, z0); q.rotation.set(-.12, 0, rz); G.add(q);
  };
  if (tipo === 'richiesta') {
    const t = texCanvas(360, 240, (x, W, H) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.strokeStyle = AZC; x.lineWidth = 9; x.lineJoin = 'round'; x.beginPath(); x.moveTo(8, 10); x.lineTo(W / 2, H * .62); x.lineTo(W - 8, 10); x.stroke(); x.strokeStyle = 'rgba(44,51,51,.3)'; x.lineWidth = 6; x.strokeRect(5, 5, W - 10, H - 10); });
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, .74, .05), new THREE.MeshStandardMaterial({ color: 0xffffff })); d.position.y = .44; d.rotation.x = -.14; d.castShadow = true; G.add(d);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.08, .72), new THREE.MeshBasicMaterial({ map: t })); f.position.set(0, .44, .027); f.rotation.x = -.14; G.add(f);
  }
  if (tipo === 'preventivo') foglio('PREVENTIVO');
  if (tipo === 'fattura') { foglio('FATTURA', -.1, -.08, .07); foglio('FATTURA', .08, .02, -.05); }
  if (tipo === 'sal') body(1, 1.05, .62, fac([8, 9, 10, 11, 12, 13, 14, 15], false), true);
  if (tipo === 'vendita') body(1, 1.05, .62, fac([1, 2, 5, 6, 9, 10, 13, 14], false), true);
  if (tipo === 'incasso') {
    const b = solid(new THREE.BoxGeometry(1.2, .1, .72), 0xf2ecdf); b.position.y = .05; b.castShadow = true; G.add(b);
    [-.42, -.14, .14, .42].forEach(x => { const c = solid(new THREE.CylinderGeometry(.075, .085, .64, 16), 0xf2ecdf); c.position.set(x, .42, .1); c.castShadow = true; G.add(c); });
    const a = solid(new THREE.BoxGeometry(1.2, .09, .72), 0xf2ecdf); a.position.y = .78; G.add(a);
    const e = prisma([[-.64, 0], [.64, 0], [0, .3]], .72); e.translate(0, .82, -.36); const t = solid(e, AZ, { rough: .5 }); t.castShadow = true; G.add(t);
  }
  if (tipo === 'margine') {
    [[-.42, .3, AZ], [-.14, .58, AZ], [.14, .88, AZ], [.42, 1.2, ANT]].forEach(([x, h, c]) => { const m = solid(new THREE.BoxGeometry(.22, h, .24), c, { rough: .45 }); m.position.set(x, h / 2, 0); m.castShadow = true; G.add(m); });
  }
  return G;
}
S.percorso = () => {
  const g = new THREE.Group(), pick = [], X = [-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8], YP = 1.15, ZP = -.4, YA = -.92, ZB = 1.5, RP = .72;
  const TAPPE = [
    { k: 'richiesta', t: 'RICHIESTA', c: 0, r: 0, tip: '<b>RICHIESTA O INCARICO</b>Qui si apre la commessa. Per un lavoro da 3.000 € basta poca fatica: la commessa piccola si crea rapidamente.' },
    { k: 'preventivo', t: 'PREVENTIVO', c: .05, r: 0, tip: '<b>PREVENTIVO</b>Il cliente lo riceve con un link.' },
    { k: 'lavori', t: 'LAVORI', c: .52, r: 0, tip: '<b>LAVORI</b>I costi entrano nella commessa fase per fase, previsto contro speso.' },
    { k: 'sal', t: 'SAL E VARIANTI', c: .32, r: .42, tip: '<b>SAL E VARIANTI</b>Ogni SAL e ogni variante aggiornano costi e ricavi. Nel piccolo lavoro si saltano.' },
    { k: 'fattura', t: 'FATTURA', c: .05, r: .72, tip: '<b>FATTURA</b>Ogni fattura, emessa o ricevuta, si lega alla commessa.' },
    { k: 'incasso', t: 'INCASSO', c: 0, r: 0, tip: '<b>INCASSO</b>Incassi e pagamenti dalla banca, riconciliati sulla commessa.' },
    { k: 'margine', t: 'MARGINE', c: 0, r: 0, tip: '<b>MARGINE</b>Costi e ricavi sullo stesso conto: il margine di ogni commessa, piccola o grande.' },
  ], N = TAPPE.length, EXTRA = [
    { k: 'acquisto', t: 'ACQUISTO', x: -2.4, i: 2, tip: '<b>ACQUISTO · SOLO OPERAZIONI IMMOBILIARI</b>Nel flipping e nelle operazioni immobiliari la commessa ha anche l\'acquisto.' },
    { k: 'vendita', t: 'VENDITA', x: 2.4, i: 5, tip: '<b>VENDITA · SOLO OPERAZIONI IMMOBILIARI</b>Nel flipping e nelle operazioni immobiliari il ricavo viene dalla vendita.' },
  ];
  const st = TAPPE.map((d, i) => {
    const G = new THREE.Group(); G.position.set(X[i], YP, ZP);
    const pad = solid(new THREE.CylinderGeometry(RP, RP + .03, .1, 48), 0xffffff, { rough: .5 }); pad.position.y = -.05; pad.receiveShadow = true; pad.castShadow = true; G.add(pad);
    const ring = circle(RP + .01, AZ, .9); ring.position.y = .012; G.add(ring); ring.scale.setScalar(.001);
    const mod = modellino(d.k); G.add(mod); mod.scale.setScalar(.6);
    const l = label(d.t, { w: 1.6, h: .3, size: 70 }); l.position.set(0, -.3, .86); l.rotation.x = -.15; G.add(l);
    const pv = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, 1.7, 12), pickMat); pv.position.y = .65; G.add(pv); pv.userData.tip = d.tip; pv.userData.i = i; pick.push(pv);
    g.add(G); return { G, ring, mod, y: YP, sc: .6, d: i };
  });
  // tappe eventuali: solo nel flipping e nelle operazioni immobiliari, tratteggiate sopra il percorso
  const YE = YP + 1.72, ZE = ZP - .9;
  EXTRA.forEach((d, n) => {
    const G = new THREE.Group(); G.position.set(d.x, YE, ZE);
    const pad = solid(new THREE.CylinderGeometry(.5, .52, .07, 40), 0xffffff, { rough: .5 }); pad.position.y = -.035; G.add(pad);
    const ring = circle(.5, ANT, .5); ring.position.y = .01; G.add(ring); const mod = modellino(d.k); mod.scale.setScalar(.4); G.add(mod);
    const l = label(d.t, { w: 1.8, h: .36, size: 84, color: AZT }); l.position.set(0, .86, 0); G.add(l);
    const pv = new THREE.Mesh(new THREE.CylinderGeometry(.56, .56, 1.3, 10), pickMat); pv.position.y = .5; G.add(pv); pv.userData.tip = d.tip; pv.userData.i = N + n; pick.push(pv);
    g.add(G);
    const pts2 = [new THREE.Vector3(d.x, YE - .08, ZE), new THREE.Vector3(d.x, YP + .1, ZP)], gg = new THREE.BufferGeometry().setFromPoints(pts2), ln = new THREE.Line(gg, new THREE.LineDashedMaterial({ color: AZ, dashSize: .1, gapSize: .08, transparent: true })); ln.computeLineDistances(); g.add(ln);
    st.push({ G, ring, mod, y: YE, sc: .4, d: d.i - .5, extra: true });
  });
  // conto della commessa: lastra con costi sotto lo zero, ricavi sopra e margine cumulato
  const W = 11, lastra = new THREE.Mesh(new THREE.BoxGeometry(W, 2.1, .06), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7, depthWrite: false })); lastra.position.set(0, YA + .02, ZB - .1); lastra.renderOrder = -1; g.add(lastra); const bl = lines(lastra.geometry, ANT, .3); bl.position.copy(lastra.position); g.add(bl);
  const asse = new THREE.Mesh(new THREE.BoxGeometry(W - .3, .02, .02), new THREE.MeshBasicMaterial({ color: ANT })); asse.position.set(0, YA, ZB); g.add(asse);
  const tt = label('CONTO DELLA COMMESSA', { w: 4.4, h: .34, size: 70, color: AZT }); tt.position.set(-3.1, YA + .78, ZB); g.add(tt);

  let cum = 0; const pts = [[X[0] - .6, YA, ZB + .1], [X[1] - .3, YA, ZB + .1]];
  const barre = TAPPE.map((d, i) => {
    const cg = new THREE.BoxGeometry(.36, 1, .12); cg.translate(0, -.5, 0); const rg = new THREE.BoxGeometry(.36, 1, .12); rg.translate(0, .5, 0);
    const C = solid(cg, ANT, { rough: .5 }), R = solid(rg, AZ, { rough: .45 }); C.position.set(X[i] - .2, YA, ZB); R.position.set(X[i] + .2, YA, ZB); C.scale.y = R.scale.y = .001; g.add(C, R);
    cum += d.r - d.c; if (i) pts.push([X[i], YA + cum, ZB + .1]);
    return { C, R, d };
  });
  pts.push([X[N - 1] + .55, YA + cum, ZB + .1]);
  const cv = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .15), rib = new THREE.TubeGeometry(cv, 160, .03, 8, false), rm = new THREE.Mesh(rib, new THREE.MeshBasicMaterial({ color: AZ })); rib.setDrawRange(0, 0); g.add(rm);
  const seg = rib.index.count;
  const fine = new THREE.Mesh(new THREE.SphereGeometry(.09, 18, 14), new THREE.MeshBasicMaterial({ color: AZ })); fine.position.set(...pts[pts.length - 1]); fine.scale.setScalar(.001); g.add(fine);
  const mar = label('MARGINE', { w: 1.5, h: .3, size: 66, color: AZT }); mar.position.set(pts[pts.length - 1][0] - .35, pts[pts.length - 1][1] + .3, ZB + .1); mar.material.opacity = 0; g.add(mar);
  const lav = st[2].mod.userData.jib, chiave = st[N].mod.userData.chiave, hov = st.map(() => 0); let t0 = 0, last = 0, h = -1; const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);
  g.position.y = .05;
  return {
    group: g, pick, cam: [0, 3.3, 15.5], look: [0, .2, 0], ombre: true,
    update(t, dt) {
      last = t; const T = t - t0, D = .5;
      st.forEach((s, i) => {
        const k = ease((T - .3 - s.d * D) / .6); s.ring.scale.setScalar(Math.max(.001, k)); s.mod.scale.setScalar(s.sc * (.6 + .4 * k)); s.mod.visible = T > .2 + s.d * D;
        hov[i] += ((h === i ? 1 : 0) - hov[i]) * Math.min(1, dt * 8); s.G.position.y = s.y + hov[i] * .12 + Math.sin(t * .9 + i) * .02; s.mod.rotation.y = hov[i] * .35 + Math.sin(t * .4 + i) * .07;
      });
      barre.forEach((b, i) => { const q = ease((T - .55 - i * D) / .7); b.C.scale.y = Math.max(.001, b.d.c * q); b.R.scale.y = Math.max(.001, b.d.r * q); });
      rib.setDrawRange(0, Math.floor(seg * Math.min(1, Math.max(0, (T - .5) / (D * N))) / 3) * 3);
      const e = ease((T - .5 - D * N) / .5); fine.scale.setScalar(Math.max(.001, e)); mar.material.opacity = e;
      if (lav) lav.rotation.y = Math.sin(t * .5) * 1.2;
      if (chiave) chiave.rotation.y = t * .6;
    },
    hover(o) { h = o ? o.userData.i : -1; return o ? o.userData.tip : null; },
    click() { t0 = last; },
  };
};

// ---------- scena 6: il processo, dal contatto all'analisi, in un solo sistema ----------
function icon(x, kind, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.strokeStyle = ANTC; x.fillStyle = ANTC; x.lineWidth = 5; x.lineJoin = 'round'; x.lineCap = 'round';
  const riga = (a, b, y) => { x.beginPath(); x.moveTo(a, y); x.lineTo(b, y); x.stroke(); };
  if (kind === 'contatto') { x.beginPath(); x.arc(0, -16, 18, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 40, 36, Math.PI, 0); x.stroke(); }
  if (kind === 'preventivo') { x.beginPath(); x.moveTo(-28, -40); x.lineTo(14, -40); x.lineTo(30, -24); x.lineTo(30, 40); x.lineTo(-28, 40); x.closePath(); x.stroke(); riga(-16, 18, -12); riga(-16, 18, 4); x.strokeStyle = AZC; riga(-16, 2, 22); }
  if (kind === 'accettazione') { x.beginPath(); x.arc(0, 0, 34, 0, 7); x.stroke(); x.strokeStyle = AZC; x.lineWidth = 7; x.beginPath(); x.moveTo(-16, 2); x.lineTo(-4, 14); x.lineTo(18, -12); x.stroke(); }
  if (kind === 'sal') { x.fillRect(-36, 18, 18, 18); x.fillRect(-12, -2, 18, 38); x.fillStyle = AZC; x.fillRect(12, -26, 18, 62); x.strokeStyle = ANTC; riga(-42, 38, 38); }
  if (kind === 'fattura') { x.strokeRect(-30, -38, 60, 76); riga(-18, 18, -18); riga(-18, 18, -2); riga(-18, 4, 14); }
  if (kind === 'banca') { x.beginPath(); x.moveTo(-40, -14); x.lineTo(0, -38); x.lineTo(40, -14); x.closePath(); x.fill(); for (let i = -3; i <= 3; i += 2) x.fillRect(i * 9 - 4, -8, 8, 34); x.fillRect(-44, 30, 88, 8); }
  if (kind === 'analytics') { x.lineWidth = 6; x.beginPath(); x.moveTo(-40, 30); x.lineTo(-14, 2); x.lineTo(8, 16); x.lineTo(38, -28); x.stroke(); riga(-42, 40, 38); x.fillStyle = AZC; x.beginPath(); x.arc(38, -28, 7, 0, 7); x.fill(); }
  x.restore();
}
function cardTex(c, fatto) {
  return texCanvas(640, 400, (x, W, H) => {
    const r = 22; x.fillStyle = 'rgba(255,255,255,.98)'; x.beginPath(); x.roundRect(6, 6, W - 12, H - 12, r); x.fill();
    x.lineWidth = 3; x.strokeStyle = fatto ? ANTC : 'rgba(44,51,51,.3)'; x.stroke();
    x.fillStyle = 'rgba(44,51,51,.06)'; x.beginPath(); x.roundRect(30, 34, 130, 130, 18); x.fill();
    icon(x, c.k, 95, 99, 1.05);
    x.fillStyle = AZT; x.font = `700 30px ${FONT}`; x.textBaseline = 'middle'; x.fillText(c.tag, 180, 62);
    x.fillStyle = ANTC; x.font = `700 58px ${FONT}`; x.fillText(c.t, 180, 118);
    x.fillStyle = '#465050'; x.font = `600 40px ${FONT}`; x.fillText(c.l1, 36, 232);
    x.fillStyle = 'rgba(44,51,51,.12)'; x.fillRect(36, 288, W - 72, 5);
    const lab = fatto ? (c.ok ? '◆  APPROVATO DA VOI' : '✓  COLLEGATO') : 'IN ATTESA', w = fatto ? (c.ok ? 350 : 240) : 190;
    if (fatto) { x.fillStyle = c.ok ? AZC : ANTC; x.beginPath(); x.roundRect(36, 318, w, 50, 25); x.fill(); x.fillStyle = '#fff'; }
    else { x.strokeStyle = 'rgba(44,51,51,.3)'; x.lineWidth = 2; x.beginPath(); x.roundRect(36, 318, w, 50, 25); x.stroke(); x.fillStyle = MUTC; }
    x.font = `700 25px ${FONT}`; x.fillText(lab, 58, 343);
  });
}
S.processi = () => {
  const g = new THREE.Group(), pick = [];
  const C = [
    { k: 'contatto', tag: 'CRM', t: 'Contatto', l1: 'Scheda e immobili', tip: '<b>CONTATTO</b>Contatti, immobili e trattative nello stesso archivio. Da qui anche un lavoro da 3.000 € diventa commessa con poca fatica.' },
    { k: 'preventivo', tag: 'CRM', t: 'Preventivo', l1: 'Link al cliente', tip: '<b>PREVENTIVO</b>Il cliente riceve un link e lo vede online.' },
    { k: 'accettazione', tag: 'CRM', t: 'Accettazione', l1: 'Si collega alla commessa', ok: true, tip: '<b>ACCETTAZIONE</b>Il preventivo accettato si collega alla commessa, senza ribattere i dati. Voi confermate.' },
    { k: 'sal', tag: 'CANTIERE', t: 'SAL', l1: 'Avanzamento e varianti', ok: true, tip: '<b>SAL</b>Avanzamento e varianti si aggiornano dall\'ufficio. Il SAL lo approvate voi.' },
    { k: 'fattura', tag: 'ECONOMATO', t: 'Fattura', l1: 'Sulla commessa giusta', tip: '<b>FATTURA</b>Ogni fattura si lega alla commessa.' },
    { k: 'banca', tag: 'ECONOMATO', t: 'Banca', l1: 'Movimento riconciliato', ok: true, tip: '<b>BANCA RICONCILIATA</b>Il sistema propone l\'abbinamento tra movimento e fattura. Diventa definitivo quando lo approvate.' },
    { k: 'analytics', tag: 'ANALYTICS', t: 'Analytics', l1: 'Margine, KPI, cassa', tip: '<b>ANALYTICS</b>Le viste macro e di dettaglio leggono gli stessi dati, senza esportazioni.' },
  ];
  const P = [[-3.6, 1.55], [-1.2, 1.55], [1.2, 1.55], [3.6, 1.55], [2.4, -1.25], [0, -1.25], [-2.4, -1.25]];
  const cards = C.map((c, i) => {
    const G = new THREE.Group(); const t0 = cardTex(c, false), t1 = cardTex(c, true);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.31), new THREE.MeshBasicMaterial({ map: t0, transparent: true }));
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(2.17, 1.38), new THREE.MeshBasicMaterial({ color: ANT, transparent: true, opacity: .08, depthWrite: false })); bk.position.z = -.04;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.9), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: .9 })); sh.position.set(.08, -.12, -.1);
    G.add(sh, bk, face); const T = new THREE.Vector3(P[i][0], P[i][1], 0);
    G.userData = { tip: c.tip, face, t0, t1, T, from: new THREE.Vector3(T.x * 1.6, T.y * 2.4, -5), rf: (i - 3) * .35, delay: i * .1, lift: 0, liftT: 0 };
    g.add(G); pick.push(G); return G;
  });
  // fili tra le carte, si disegnano in sequenza; sulle tappe da approvare passa il segnale azzurro
  const wires = [];
  for (let i = 0; i < 6; i++) {
    const a = P[i], b = P[i + 1], giu = i === 3;
    const A = giu ? new THREE.Vector3(a[0], a[1] - .66, .03) : new THREE.Vector3(a[0] + (i > 3 ? -1.05 : 1.05), a[1], .03), B = giu ? new THREE.Vector3(b[0], b[1] + .66, .03) : new THREE.Vector3(b[0] + (i > 3 ? 1.05 : -1.05), b[1], .03);
    const k = giu ? new THREE.Vector3(0, -.75, 0) : new THREE.Vector3(i > 3 ? -.1 : .1, 0, 0);
    const curve = new THREE.CubicBezierCurve3(A, A.clone().add(k), B.clone().sub(k), B), segs = 40, rad = 8, geo = new THREE.TubeGeometry(curve, segs, .03, rad, false), mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: ANT })); geo.setDrawRange(0, 0); g.add(mesh);
    const n = giu ? 4 : 2, beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 12, 10), new THREE.MeshBasicMaterial({ color: AZ }), n); beads.count = 0; beads.frustumCulled = false; g.add(beads);
    wires.push({ curve, mesh, beads, n, total: geo.index.count, start: .9 + i * .34 });
  }
  let t0 = 0, lastT = 0; const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);
  g.position.y = -.15;
  return {
    group: g, pick, cam: [0, 1.2, 14], look: [0, 0, 0],
    update(t, dt) {
      lastT = t; const T = t - t0;
      cards.forEach((cd, i) => {
        const u = cd.userData, k = ease((T - u.delay) / 1.0); cd.position.lerpVectors(u.from, u.T, k); cd.rotation.set((1 - k) * .7, (1 - k) * u.rf - u.T.x * .05, (1 - k) * u.rf * .3);
        u.lift += (u.liftT - u.lift) * Math.min(1, dt * 8); cd.position.z += u.lift * .5; cd.position.y += Math.sin(t * 1.1 + i) * .03 + u.lift * .08;
        const on = T > 1 + i * .34; if ((u.face.material.map === u.t1) !== on) u.face.material.map = on ? u.t1 : u.t0;
      });
      wires.forEach(w => {
        const k = ease((T - w.start) / .55); w.mesh.geometry.setDrawRange(0, Math.floor(w.total * k / 3) * 3);
        if (k >= 1) { w.beads.count = w.n; for (let j = 0; j < w.n; j++) { w.curve.getPointAt(((j / w.n) + t * .35) % 1, dummy.position); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); w.beads.setMatrixAt(j, dummy.matrix); } w.beads.instanceMatrix.needsUpdate = true; } else w.beads.count = 0;
      });
    },
    hover(o) { cards.forEach(c => c.userData.liftT = c === o ? 1 : 0); return o ? o.userData.tip : null; },
    click() { t0 = lastT; },
  };
};

// fondo leggero per le slide di solo testo: punti e griglia che respirano
S.ambient = () => {
  const g = new THREE.Group(); const n = 240, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 26; p[i * 3 + 1] = (Math.random() - .5) * 14; p[i * 3 + 2] = (Math.random() - .8) * 14; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: ANT, size: .04, transparent: true, opacity: .28, depthWrite: false })); g.add(dots);
  return { group: g, pick: [], cam: [0, 0, 12], look: [0, 0, 0], update(t) { dots.rotation.y = t * .015; dots.position.y = Math.sin(t * .3) * .15; } };
};

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
  view.off = wide ? view.offWanted : 0; view.offY = wide ? 0 : -2.9; view.k = wide ? 1 : .62;
}
addEventListener('resize', layout);

addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; mouse.set(mx, my);
  if (drag) { const dx = e.clientX - lastX; vel = dx * .004; yaw += vel; moved += Math.abs(dx); }
  lastX = e.clientX;
  tip.style.left = Math.min(e.clientX + 18, innerWidth - 340) + 'px'; tip.style.top = Math.min(e.clientY + 16, innerHeight - 130) + 'px';
});
addEventListener('pointerdown', e => { if (e.target !== canvas && !e.target.closest('.slide')) return; if (e.target.closest('button,a,.scr,.prob,.tile,.off')) return; drag = true; moved = 0; lastX = e.clientX; });
addEventListener('pointerup', () => { if (drag && moved < 6 && current && current.click) current.click(hovered); drag = false; });
document.addEventListener('pointerleave', () => mouse.set(9, 9));

function pickLoop() {
  if (!current || !current.pick.length || mouse.x > 2 || document.body.classList.contains('no3d')) { setHover(null); return; }
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(current.pick, true);
  let o = hits.length ? hits[0].object : null;
  while (o && !current.pick.includes(o)) o = o.parent;
  setHover(o);
}
function setHover(o) {
  if (o === hovered) return; hovered = o;
  const html = current && current.hover ? current.hover(o) : null;
  if (html) { tip.innerHTML = html; tip.classList.add('on'); } else tip.classList.remove('on');
  document.body.style.cursor = o ? 'pointer' : '';
}

let running = true, tick = 0;
function frame() {
  const now = performance.now(); const real = Math.min(.6, (now - last) / 1000), dt = Math.min(.05, real), ease = 1 - Math.exp(-real * 3.2); last = now; const t = (now - tStart) / 1000;
  if (!drag) { yaw += vel; vel *= .93; }
  root.rotation.y += ((yaw + mx * .32) - root.rotation.y) * ease;
  root.rotation.x += ((-my * .07) - root.rotation.x) * ease;
  root.position.x += (view.off - root.position.x) * ease; root.position.y += (view.offY - root.position.y) * ease;
  const rk = root.scale.x + (view.k - root.scale.x) * ease; root.scale.setScalar(rk);
  camera.position.lerp(view.cam, ease); look.lerp(view.look, ease); camera.lookAt(look);
  if (current) current.update(t - current.t0, dt);
  pickLoop();
  if (current && current.ombre && (tick++ % 2 === 0)) renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => { const p = document.hidden; if (p === !running) return; running = !p; renderer.setAnimationLoop(p ? null : frame); last = performance.now(); });

function dispose(obj) {
  obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const m = o.material; if (m.map && m.map !== softTex) m.map.dispose(); if (m !== pickMat) m.dispose(); } });
}
export function mostra(nome, opts = {}) {
  view.offWanted = opts.offsetX || 0; layout();
  if (current && current.nome === nome) return current;
  if (current) { root.remove(current.group); dispose(current.group); if (current.dispose) current.dispose(); }
  setHover(null); yaw = 0; vel = 0;
  current = (S[nome] || S.ambient)(opts); current.nome = nome; current.t0 = (performance.now() - tStart) / 1000;
  root.add(current.group); root.rotation.set(0, 0, 0);
  const sc = opts.scale || 1; current.group.scale.multiplyScalar(sc);
  view.cam.set(...current.cam); view.look.set(...current.look);
  if (opts.snap) { camera.position.copy(view.cam); look.copy(view.look); root.position.x = view.off; root.position.y = view.offY; root.scale.setScalar(view.k); }
  renderer.shadowMap.needsUpdate = true;
  return current;
}
export function evidenzia(s) { if (current && current.set) current.set(s); }
export function suSistema(cb) { if (current) current.onSys = cb; }
