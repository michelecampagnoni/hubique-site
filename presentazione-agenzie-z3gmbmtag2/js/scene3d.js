// Motore 3D della presentazione HubAgency per le agenzie immobiliari (three r186, locale in vendor/).
// Un solo renderer trasparente sopra il fondo; ogni slide chiede una scena per nome.
// Scene: «italia» (la rete che si accende), «casa» (una casa che si scompone in planimetria), «ambient» (pulviscolo).
// Tutti i punti delle agenzie sono generici, generati a caso dentro il profilo dell'Italia: nessun dato reale.
import * as THREE from 'three';

// PALETTE DEL DESTINATARIO (insieme alle variabili :root di css/stile.css): cambiare solo qui.
const PAL = { primario: 0x40349a, accento: 0xea3558, scuro: 0x05144e, chiaro: 0xa6adec, spento: 0xb4b8cf, terra: [.60, .62, .70], ombra: '17,26,54', primarioCss: '#40349a', scuroCss: '#05144e', emiss: 0x120d3a, suolo: 0xd4d6e4 };
const VIOLA = PAL.primario, ACCENTO = PAL.accento, GRIGIO = PAL.spento;

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const piccolo = Math.min(innerWidth, innerHeight) < 600;
const PR = Math.min(devicePixelRatio, 1.75);
renderer.setPixelRatio(PR);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, PAL.suolo, 1.35));
const sun = new THREE.DirectionalLight(0xfff6ee, 2.3); sun.position.set(-7, 15, 11); scene.add(sun);
sun.castShadow = true; sun.shadow.mapSize.setScalar(piccolo ? 1024 : 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 });
const root = new THREE.Group(); scene.add(root);
let current = null;

(function ambiente() { // riflessi morbidi
  const s = new THREE.Scene(); s.background = new THREE.Color(0x55524e);
  const pann = (c, w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  pann(new THREE.Color(8, 8, 8), 12, 6, -6, 9, 6); pann(new THREE.Color(3, 3, 3), 10, 10, 10, 2, 2);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(s, .05).texture; scene.environmentIntensity = .35; pm.dispose();
})();

// ---------- utilità ----------
function texCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const softTex = texCanvas(256, 256, (x, W) => {
  const g = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  g.addColorStop(0, `rgba(${PAL.ombra},.30)`); g.addColorStop(.55, `rgba(${PAL.ombra},.10)`); g.addColorStop(1, `rgba(${PAL.ombra},0)`);
  x.fillStyle = g; x.fillRect(0, 0, W, W);
});
const ease = k => { k = Math.min(1, Math.max(0, k)); return 1 - Math.pow(1 - k, 3); };
const liscio = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
function caso(seme) { let a = seme >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- scena 1: la rete sull'Italia ----------
// profilo disegnato a mano (lon, lat), volutamente semplificato
const ITALIA = [
  [[7.5, 43.8], [7.0, 44.2], [6.9, 44.6], [7.0, 45.0], [6.8, 45.2], [7.1, 45.9], [7.9, 45.95], [8.4, 46.45], [9.0, 45.9], [9.3, 46.5], [10.1, 46.6], [10.5, 46.9], [11.0, 46.8], [12.2, 47.1], [13.0, 46.6], [13.7, 46.5], [13.4, 46.0], [13.8, 45.6], [13.1, 45.7], [12.4, 45.4], [12.3, 44.9], [12.4, 44.2], [13.6, 43.5], [14.0, 42.7], [14.7, 42.1], [15.2, 41.9], [16.1, 41.9], [16.0, 41.4], [17.1, 41.0], [18.0, 40.6], [18.5, 40.1], [18.3, 39.8], [17.9, 40.3], [17.2, 40.4], [16.6, 40.1], [16.5, 39.6], [17.1, 39.4], [17.1, 38.9], [16.6, 38.8], [16.1, 38.0], [15.65, 37.95], [15.65, 38.25], [15.9, 38.6], [16.2, 38.9], [15.7, 39.9], [15.0, 40.2], [14.4, 40.6], [14.0, 40.8], [13.5, 41.2], [12.6, 41.4], [12.1, 41.9], [11.4, 42.4], [10.5, 42.9], [10.5, 43.5], [10.2, 43.9], [9.8, 44.1], [9.0, 44.4], [8.4, 44.2]],
  [[12.4, 37.8], [13.3, 38.2], [14.3, 38.0], [15.6, 38.3], [15.2, 37.4], [15.1, 36.7], [14.4, 36.8], [12.6, 37.6]],
  [[8.4, 41.1], [9.2, 41.25], [9.6, 40.9], [9.8, 40.1], [9.6, 39.2], [9.0, 39.1], [8.5, 38.9], [8.4, 39.6], [8.5, 40.3], [8.2, 40.6]],
];
const KM = .6, proj = (lon, lat) => [(lon - 12.4) * .75 * KM, (41.9 - lat) * KM];
const N_AG = 420, CENTRO = [9.19, 45.46]; // centro della rete: punto di partenza dell'onda, nessuna agenzia reale

const scene1 = { costruisci() {
  const g = new THREE.Group(), pick = [];
  // maschera dell'Italia su canvas, in lon/lat
  const L0 = 6, L1 = 19, A0 = 36.4, A1 = 47.4, MW = 520, MH = Math.round(MW * (A1 - A0) / (L1 - L0) / .75);
  const mc = document.createElement('canvas'); mc.width = MW; mc.height = MH; const mx = mc.getContext('2d', { willReadFrequently: true }); mx.fillStyle = '#fff';
  const px = (lon, lat) => [(lon - L0) / (L1 - L0) * MW, (A1 - lat) / (A1 - A0) * MH];
  ITALIA.forEach(p => { mx.beginPath(); p.forEach((q, i) => { const [X, Y] = px(q[0], q[1]); i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); }); mx.closePath(); mx.fill(); });
  const md = mx.getImageData(0, 0, MW, MH).data;
  const terra = (lon, lat) => { const [X, Y] = px(lon, lat); if (X < 0 || Y < 0 || X >= MW || Y >= MH) return false; return md[((Y | 0) * MW + (X | 0)) * 4 + 3] > 128; };
  // puntinato della terra
  const pos = [], passo = .085;
  for (let z = -3.6; z < 3.6; z += passo) for (let x = -4.4; x < 4.4; x += passo) {
    const xx = x + (Math.round(z / passo) & 1) * passo / 2, lon = xx / (.75 * KM) + 12.4, lat = 41.9 - z / KM;
    if (terra(lon, lat)) pos.push(xx, 0, z);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.add(new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { px: { value: PR * (innerWidth > 1500 ? 3.4 : 2.7) }, tc: { value: new THREE.Vector3(...PAL.terra) } }, transparent: true, depthWrite: false,
    vertexShader: `uniform float px; void main(){ vec4 m=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*m; gl_PointSize=px*(12./-m.z); }`,
    fragmentShader: `uniform vec3 tc; void main(){ float r=length(gl_PointCoord-.5); if(r>.5) discard; gl_FragColor=vec4(tc,1.);
#include <colorspace_fragment>
    }`,
  })));
  const om = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: .45 })); om.rotation.x = -Math.PI / 2; om.position.y = -.02; g.add(om);

  // agenzie generiche: punti a caso dentro il profilo, ordinate per distanza dal centro della rete
  const rnd = caso(2027), ag = [], [cx, cz] = proj(...CENTRO);
  while (ag.length < N_AG) { const lon = L0 + rnd() * (L1 - L0), lat = A0 + rnd() * (A1 - A0); if (!terra(lon, lat)) continue; const [x, z] = proj(lon, lat); ag.push({ x, z, d: Math.hypot(x - cx, z - cz), v: .25 + rnd() * .75, f: rnd() * 6.28 }); }
  ag.forEach(a => a.t0 = .5 + a.d * .55 + rnd() * .35);
  const colG = new THREE.CylinderGeometry(.022, .022, 1, 8).translate(0, .5, 0);
  const col = new THREE.InstancedMesh(colG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5, metalness: .05 }), N_AG); g.add(col);
  const baseG = new THREE.CircleGeometry(.045, 18).rotateX(-Math.PI / 2);
  const base = new THREE.InstancedMesh(baseG, new THREE.MeshBasicMaterial({ color: 0xffffff }), N_AG); base.position.y = .006; g.add(base);
  const hitG = new THREE.BoxGeometry(.17, .5, .17).translate(0, .25, 0);
  const hit = new THREE.InstancedMesh(hitG, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), N_AG); g.add(hit); pick.push(hit);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), C = new THREE.Color(), CR = new THREE.Color(VIOLA), CG = new THREE.Color(GRIGIO);
  ag.forEach((a, i) => { M.compose(P.set(a.x, 0, a.z), Q, S.set(1, 1, 1)); hit.setMatrixAt(i, M); });

  // centro della rete
  const hub = new THREE.Mesh(new THREE.SphereGeometry(.11, 24, 16), new THREE.MeshStandardMaterial({ color: VIOLA, roughness: .35 })); hub.position.set(cx, .11, cz); g.add(hub);
  const hubR = new THREE.Mesh(new THREE.RingGeometry(.16, .19, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: ACCENTO, transparent: true, depthWrite: false })); hubR.position.set(cx, .01, cz); g.add(hubR);
  const hubHit = new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })); hubHit.position.copy(hub.position); hubHit.userData.hub = true; g.add(hubHit); pick.push(hubHit);

  // onde attorno alle agenzie e archi dal centro della rete
  const onde = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(.06, .08, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: VIOLA, transparent: true, opacity: 0, depthWrite: false })); m.position.y = .01; g.add(m); return { m, t: -9, a: null }; });
  const archi = Array.from({ length: 10 }, () => { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(41 * 3), 3)); const l = new THREE.Line(ge, new THREE.LineBasicMaterial({ color: ACCENTO, transparent: true, opacity: 0 })); g.add(l); return { l, t: -9 }; });
  const tracciaArco = (o, a) => { const p = o.l.geometry.attributes.position, h = .35 + a.d * .12; for (let k = 0; k <= 40; k++) { const q = k / 40; p.setXYZ(k, cx + (a.x - cx) * q, .11 + Math.sin(q * Math.PI) * h, cz + (a.z - cz) * q); } p.needsUpdate = true; };

  let hovI = -1, nOnda = 0, nArco = 0, prossima = 0, prossimoArco = 0;
  const accese = t => ag.filter(a => t > a.t0 + .4);
  const api = {
    group: g, pick, vertZ: true, cam: [0, 11.6, 4.4], look: [0, -.3, .25], ombre: false,
    update(t, dt) {
      ag.forEach((a, i) => {
        const k = ease((t - a.t0) / .7), h = k * (.04 + a.v * a.v * .26 * (1 + .15 * Math.sin(t * .8 + a.f))) * (i === hovI ? 1.5 : 1) + .002;
        M.compose(P.set(a.x, 0, a.z), Q, S.set(1, h, 1)); col.setMatrixAt(i, M);
        C.copy(CG).lerp(CR, k); col.setColorAt(i, C);
        M.compose(P.set(a.x, 0, a.z), Q, S.setScalar(.6 + k * .5)); base.setMatrixAt(i, M); base.setColorAt(i, C);
      });
      col.instanceMatrix.needsUpdate = base.instanceMatrix.needsUpdate = true; col.instanceColor.needsUpdate = base.instanceColor.needsUpdate = true;
      const on = t > 1 ? accese(t) : [];
      if (on.length && t > prossima) { const o = onde[nOnda++ % onde.length]; o.a = on[(Math.random() * on.length) | 0]; o.t = t; o.m.position.x = o.a.x; o.m.position.z = o.a.z; prossima = t + .22; }
      onde.forEach(o => { const k = (t - o.t) / 1.6; if (k < 0 || k > 1) { o.m.material.opacity = 0; return; } o.m.scale.setScalar(1 + k * 4); o.m.material.opacity = (1 - k) * .7; });
      if (on.length > 10 && t > prossimoArco) { const o = archi[nArco++ % archi.length]; tracciaArco(o, on[(Math.random() * on.length) | 0]); o.t = t; prossimoArco = t + .55; }
      archi.forEach(o => { const k = (t - o.t) / 2.4; if (k < 0 || k > 1) { o.l.material.opacity = 0; return; } o.l.geometry.setDrawRange(0, Math.max(2, Math.ceil(ease(k / .45) * 41))); o.l.material.opacity = (k > .7 ? (1 - k) / .3 : 1) * .75; });
      const kk = (t * .45) % 1; hubR.scale.setScalar(1 + kk * 2.2); hubR.material.opacity = 1 - kk;
      g.rotation.y = Math.sin(t * .15) * .05;
    },
    hover(o, id) {
      hovI = -1;
      if (!o) return null;
      if (o.userData.hub) return `<b>LA RETE</b>Strumenti condivisi, attivati agenzia per agenzia.<br><span>PUNTO ILLUSTRATIVO</span>`;
      if (id != null && id >= 0) { hovI = id; return `<b>UN'AGENZIA DELLA RETE</b>La colonna cresce con gli strumenti in uso.<br><span>PUNTO GENERICO, A SCOPO ILLUSTRATIVO</span>`; }
      return null;
    },
  };
  return api;
} };

// ---------- scena 2: la casa che si scompone in planimetria ----------
// stanze inventate: nomi e metri quadri compaiono solo con l'etichetta ESEMPIO
const STANZE = [
  { n: 'Living e cucina', mq: 36, x0: 0, z0: 0, x1: 5, z1: 3.6, c: 0xe6d3b5 },
  { n: 'Camera padronale', mq: 15, x0: 5, z0: 0, x1: 8, z1: 3.6, c: 0xe9dcc7 },
  { n: 'Cameretta', mq: 13, x0: 0, z0: 3.6, x1: 3, z1: 6, c: 0xe9dcc7 },
  { n: 'Bagno', mq: 7, x0: 3, z0: 3.6, x1: 5.2, z1: 6, c: 0xd6d9dc },
  { n: 'Studio', mq: 10, x0: 5.2, z0: 3.6, x1: 8, z1: 6, c: 0xe6d3b5 },
];
const MURI = [ // [x1,z1,x2,z2, varchi]
  [0, 0, 8, 0, [[1.2, 3.4], [5.8, 7.2]]], [0, 6, 8, 6, [[.9, 2.1], [3.6, 4.4], [6, 7.2]]], [0, 0, 0, 6, [[1.2, 2.6]]], [8, 0, 8, 6, [[1.4, 2.4], [4.2, 5.2]]],
  [0, 3.6, 8, 3.6, [[1.0, 1.8], [3.5, 4.2], [6.3, 7.0]]], [5, 0, 5, 3.6, [[2.6, 3.4]]], [3, 3.6, 3, 6, []], [5.2, 3.6, 5.2, 6, []],
];
const scene2 = { costruisci() {
  const g = new THREE.Group(), casa = new THREE.Group(), pick = []; g.add(casa); casa.position.set(-4, 0, -3);
  const W = 8, D = 6, H = 2.6, T = .16;
  const bianco = new THREE.MeshStandardMaterial({ color: 0xf7f5f2, roughness: .8 });
  const taglio = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .7 });
  const zocc = new THREE.Mesh(new THREE.BoxGeometry(W + .8, .22, D + .8), new THREE.MeshStandardMaterial({ color: 0xdedad4, roughness: .9 })); zocc.position.set(W / 2, -.11, D / 2); zocc.receiveShadow = true; casa.add(zocc);
  const om = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.4, D * 2.6), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.set(W / 2, -.21, D / 2); casa.add(om);
  STANZE.forEach(s => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(s.x1 - s.x0 - .02, .04, s.z1 - s.z0 - .02), new THREE.MeshStandardMaterial({ color: s.c, roughness: .75 }));
    f.position.set((s.x0 + s.x1) / 2, .02, (s.z0 + s.z1) / 2); f.receiveShadow = true; f.userData.s = s; casa.add(f); pick.push(f); s.f = f;
  });
  // muri, spezzati nei varchi di porte e finestre; ogni pezzo cresce dal pavimento
  const muri = [];
  MURI.forEach(([x1, z1, x2, z2, varchi]) => {
    const L = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / L, uz = (z2 - z1) / L, tratti = []; let a = 0;
    const vv = varchi.map(v => [Math.abs(ux) ? v[0] - Math.min(x1, x2) : v[0] - Math.min(z1, z2), Math.abs(ux) ? v[1] - Math.min(x1, x2) : v[1] - Math.min(z1, z2)]);
    vv.forEach(v => { tratti.push([a, v[0]]); a = v[1]; }); tratti.push([a, L]);
    tratti.forEach(([s0, s1]) => {
      if (s1 - s0 < .02) return; const l = s1 - s0 + (s0 === 0 || s1 === L ? T / 2 : 0);
      const ge = new THREE.BoxGeometry(Math.abs(ux) ? l : T, 1, Math.abs(uz) ? l : T).translate(0, .5, 0);
      const m = new THREE.Mesh(ge, [bianco, bianco, taglio, bianco, bianco, bianco]); const mid = (s0 + s1) / 2;
      m.position.set(x1 + ux * mid, 0, z1 + uz * mid); m.castShadow = m.receiveShadow = true; casa.add(m); muri.push(m);
    });
  });
  // arredi semplici
  const legno = new THREE.MeshStandardMaterial({ color: 0xc9a77c, roughness: .6 }), tess = new THREE.MeshStandardMaterial({ color: 0xd9d4cd, roughness: .95 }), accento = new THREE.MeshStandardMaterial({ color: ACCENTO, roughness: .7 });
  const mob = (w, h, d, x, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, h / 2 + .04, z); b.castShadow = b.receiveShadow = true; casa.add(b); return b; };
  mob(2.2, .45, .9, 1.6, 2.7, tess); mob(.5, .25, .5, 2.6, 2.75, accento); mob(1.4, .75, .8, 3.6, 1.2, legno); mob(.6, .9, 2.6, .4, 1.6, bianco);
  mob(1.6, .5, 2, 6.6, 1.4, tess); mob(1.4, .14, .6, 6.6, 2.1, accento); mob(1.2, .45, 1.9, 1.4, 4.9, tess); mob(.9, .5, .5, 4.4, 5.6, bianco); mob(1.4, .75, .7, 6.6, 5.5, legno);
  // tetto a due falde
  const tetto = new THREE.Group(), coppi = new THREE.MeshStandardMaterial({ color: 0xa9483a, roughness: .85, transparent: true });
  const falda = Math.hypot(D / 2 + .5, 1.5);
  for (const v of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(W + 1, .14, falda), coppi); f.position.set(W / 2, H + .75, D / 2 + v * (D / 4 + .25)); f.rotation.x = v * Math.atan2(1.5, D / 2 + .5); f.castShadow = true; tetto.add(f); }
  const timp = new THREE.Shape(); timp.moveTo(-D / 2, 0); timp.lineTo(D / 2, 0); timp.lineTo(0, 1.45); timp.closePath();
  for (const x of [0, W]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(timp), new THREE.MeshStandardMaterial({ color: 0xf1eee9, side: THREE.DoubleSide, transparent: true })); m.rotation.y = Math.PI / 2; m.position.set(x, H, D / 2); tetto.add(m); }
  casa.add(tetto);
  // etichette della pianta, con quote
  const etichetta = (riga1, riga2) => {
    const tx = texCanvas(512, 160, (x, w, h) => { x.fillStyle = 'rgba(255,255,255,.94)'; x.beginPath(); x.roundRect(6, 20, w - 12, h - 40, 60); x.fill(); x.fillStyle = PAL.scuroCss; x.font = '500 46px Jost, sans-serif'; x.textAlign = 'center'; x.fillText(riga1.toUpperCase(), w / 2, 78); x.fillStyle = PAL.primarioCss; x.font = '400 36px Jost, sans-serif'; x.fillText(riga2, w / 2, 120); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false, opacity: 0 })); sp.scale.set(2.1, .66, 1); return sp;
  };
  const eti = STANZE.map(s => { const e = etichetta(s.n, s.mq + ' m²'); e.position.set((s.x0 + s.x1) / 2, .9, (s.z0 + s.z1) / 2 + .1); casa.add(e); return e; });
  const quota = etichetta('8,00 m', 'esempio'); quota.position.set(W / 2, .5, -.95); quota.scale.set(1.5, .47, 1); casa.add(quota);
  const ql = new THREE.Mesh(new THREE.BoxGeometry(W, .02, .025), new THREE.MeshBasicMaterial({ color: VIOLA, transparent: true, opacity: 0 })); ql.position.set(W / 2, .03, -.5); casa.add(ql);

  let hov = null;
  const api = {
    group: g, pick, cam: [6.5, 9.6, 11.8], look: [0, .4, 0], ombre: true,
    update(t) {
      const c = (t + 2) % 16, p = c < 3 ? 0 : c < 6.5 ? liscio((c - 3) / 3.5) : c < 12.5 ? 1 : c < 15.5 ? 1 - liscio((c - 12.5) / 3) : 0;
      const kr = liscio(p / .45); tetto.position.y = kr * 2.4; coppi.opacity = 1 - kr; tetto.children.forEach(m => { m.material.opacity = 1 - kr; m.visible = kr < .99; m.castShadow = kr < .3; });
      const kw = liscio((p - .3) / .5), h = H * (1 - kw) + .32 * kw; muri.forEach(m => { m.scale.y = h; });
      const ke = liscio((p - .75) / .25); eti.forEach(e => e.material.opacity = ke); quota.material.opacity = ke; ql.material.opacity = ke;
      STANZE.forEach(s => s.f.material.emissive.setHex(hov === s ? PAL.emiss : 0));
      api.ombre = true;
      g.rotation.y = -.25 + Math.sin(t * .12) * .12;
    },
    hover(o) { hov = o ? o.userData.s : null; if (!hov) return null; return `<b>${hov.n.toUpperCase()} · ${hov.mq} m²</b>Dalla planimetria alla casa 3D, stanza per stanza.<br><span>ESEMPIO DIMOSTRATIVO · DATI FITTIZI</span>`; },
  };
  return api;
} };

// fondo leggero per le slide di testo: pulviscolo nel colore principale
const scene3 = { costruisci() {
  const g = new THREE.Group(), n = 140, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 26; p[i * 3 + 1] = (Math.random() - .5) * 14; p[i * 3 + 2] = (Math.random() - .8) * 14; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: VIOLA, size: .03, transparent: true, opacity: .22, depthWrite: false })); g.add(dots);
  return { group: g, pick: [], cam: [0, 0, 12], look: [0, 0, 0], update(t) { dots.rotation.y = t * .012; dots.position.y = Math.sin(t * .3) * .12; } };
} };
const SCENE = { italia: scene1, casa: scene2, ambient: scene3 }, fatte = {};

// ---------- ciclo, mouse, passaggio ----------
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(9, 9);
let mx = 0, my = 0, drag = false, lastX = 0, vel = 0, yaw = 0, hovered = null, hovId = null;
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
  if (drag) { const dx = e.clientX - lastX; vel = dx * .004; yaw += vel; }
  lastX = e.clientX;
  tip.style.left = Math.min(e.clientX + 18, innerWidth - 380) + 'px'; tip.style.top = Math.min(e.clientY + 16, innerHeight - 150) + 'px';
});
addEventListener('pointerdown', e => { if (e.target !== canvas && !e.target.closest('.slide')) return; if (e.target.closest('button,a,.tile,.shot,.card')) return; drag = true; lastX = e.clientX; });
addEventListener('pointerup', () => { drag = false; });
document.addEventListener('pointerleave', () => mouse.set(9, 9));

function pickLoop() {
  if (!current || !current.pick.length || mouse.x > 2 || document.querySelector('.slide.on a:hover, .slide.on .shot:hover')) { setHover(null); return; }
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(current.pick, false);
  setHover(hits.length ? hits[0].object : null, hits.length ? hits[0].instanceId : null);
}
function setHover(o, id = null) {
  if (o === hovered && id === hovId) return; hovered = o; hovId = id;
  const html = current && current.hover ? current.hover(o, id) : null;
  if (html) { tip.innerHTML = html; tip.classList.add('on'); } else tip.classList.remove('on');
  document.body.style.cursor = html ? 'pointer' : '';
}

let running = true, tick = 0;
function frame() {
  const now = performance.now(); const real = Math.min(.6, (now - last) / 1000), dt = Math.min(.05, real), ease2 = 1 - Math.exp(-real * 3.2); last = now; const t = (now - tStart) / 1000;
  if (!drag) { yaw += vel; vel *= .93; }
  root.rotation.y += ((yaw + mx * .22) - root.rotation.y) * ease2;
  root.rotation.x += ((-my * .05) - root.rotation.x) * ease2;
  const vz = current && current.vertZ; // vista dall'alto: lo spostamento verticale sullo schermo è lungo z
  root.position.x += (view.off - root.position.x) * ease2; root.position.y += ((vz ? 0 : view.offY) - root.position.y) * ease2; root.position.z += ((vz ? -view.offY : 0) - root.position.z) * ease2;
  const rk = root.scale.x + (view.k - root.scale.x) * ease2; root.scale.setScalar(rk);
  camera.position.lerp(view.cam, ease2); look.lerp(view.look, ease2); camera.lookAt(look);
  if (current) current.update(t - current.t0, dt);
  pickLoop();
  if (current && current.ombre && (tick++ % 2 === 0)) renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => { const p = document.hidden; if (p === !running) return; running = !p; renderer.setAnimationLoop(p ? null : frame); last = performance.now(); });

// le scene si costruiscono una volta sola
export function mostra(nome, opts = {}) {
  view.offWanted = opts.offsetX || 0; view.offYstretto = opts.offY || 0; view.kStretto = opts.kStretto || 0; layout();
  const n = SCENE[nome] ? nome : 'ambient';
  if (current && current.nome === n) { current.group.scale.setScalar(opts.scale || 1); return current; }
  if (current) root.remove(current.group);
  setHover(null); yaw = 0; vel = 0;
  current = fatte[n] || (fatte[n] = SCENE[n].costruisci()); current.nome = n; current.t0 = (performance.now() - tStart) / 1000;
  root.add(current.group); root.rotation.set(0, 0, 0);
  current.group.scale.setScalar(opts.scale || 1);
  view.cam.set(...current.cam); view.look.set(...current.look);
  if (opts.snap) { camera.position.copy(view.cam); look.copy(view.look); root.position.x = view.off; root.position.y = current.vertZ ? 0 : view.offY; root.position.z = current.vertZ ? -view.offY : 0; root.scale.setScalar(view.k); }
  renderer.shadowMap.needsUpdate = true;
  return current;
}
