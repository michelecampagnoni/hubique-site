// Motore 3D della presentazione «RealHub per le imprese di impiantistica» · Termotech (three r186, locale in vendor/).
// Un solo renderer trasparente sopra il fondo chiaro; ogni slide chiede una scena per nome.
// Il mouse inclina la scena, il trascinamento la gira, il passaggio accende gli oggetti.
import * as THREE from 'three';

const IND = 0x34495a, IND2 = 0x6f8794, RED = 0xd4471e, WHITE = 0xffffff;
const FONT = '"Chakra Petch", -apple-system, sans-serif';
const SYS = {
  riscaldamento: { c: 0xd4471e, t: 'RISCALDAMENTO', d: 'Generatore, accumulo, collettore e circuiti verso i terminali.' },
  idrico: { c: 0x2f86b8, t: 'IDRICO E SANITARIO', d: 'Acqua fredda, addolcitore, bollitore dell\'acqua calda sanitaria, ricircolo.' },
  clima: { c: 0x23978a, t: 'CLIMATIZZAZIONE', d: 'Pompa di calore e circuiti verso le unità interne.' },
  ventilazione: { c: 0x6f7f8a, t: 'VENTILAZIONE', d: 'Unità di trattamento aria e canali verso i locali.' },
  solare: { c: 0xe0a21b, t: 'SOLARE TERMICO', d: 'Collettori solari e circuito verso accumulo e bollitore.' },
};
export const SISTEMI = Object.keys(SYS);

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0xdcdcd6, 2.4));
const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(6, 10, 7); scene.add(sun);
const root = new THREE.Group(); scene.add(root);
let current = null;

// ---------- utilità ----------
const white = new THREE.Color(WHITE);
const pale = (c, k = .6) => new THREE.Color(c).lerp(white, k);
function lines(geo, color = IND, opacity = .5) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
function glassBox(w, h, d, { opacity = .35, edge = .45, color = WHITE, ecolor = IND } = {}) {
  const g = new THREE.Group(); const geo = new THREE.BoxGeometry(w, h, d);
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: .25, metalness: 0, depthWrite: false })));
  g.add(lines(geo, ecolor, edge)); return g;
}
function solid(geo, color = 0xf5f6f7, { rough = .45, metal = .1, emissive = 0 } = {}) {
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive }));
}
function texCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function label(text, { w = 2, h = .28, color = '#34495a', size = 70, weight = 700, sub = null } = {}) {
  const t = texCanvas(Math.round(512 * w / h * .5), 256, (x, W, H) => {
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `${weight} ${size * 2}px ${FONT}`; x.fillText(text, W / 2, sub ? H * .36 : H / 2);
    if (sub) { x.font = `600 ${size * .55}px ${FONT}`; x.fillStyle = '#76808a'; x.fillText(sub, W / 2, H * .74); }
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
}
const softTex = texCanvas(256, 256, (x, W) => {
  const g = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  g.addColorStop(0, 'rgba(52,73,90,.22)'); g.addColorStop(.55, 'rgba(52,73,90,.07)'); g.addColorStop(1, 'rgba(52,73,90,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, W);
});
const glowTex = texCanvas(128, 128, (x, W) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, W);
});
function shadowDisc(r = 5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
function circle(r, color = IND, opacity = .25, seg = 128, arc = Math.PI * 2, a0 = 0) {
  const p = []; for (let i = 0; i <= seg; i++) { const a = a0 + arc * i / seg; p.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
function hudRings(rs = [4.2, 5.1, 6.0]) {
  const g = new THREE.Group();
  rs.forEach((r, i) => g.add(circle(r, IND, .16 - i * .03)));
  const arcs = new THREE.Group();
  [[rs[1], .9, 0], [rs[1], .5, 2.6], [rs[2], .35, 4.4]].forEach(([r, a, a0]) => arcs.add(circle(r, RED, .7, 32, a, a0)));
  const ticks = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, r0 = rs[0] - (i % 6 ? .06 : .16); ticks.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * rs[0], 0, Math.sin(a) * rs[0]); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3));
  g.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ color: IND, transparent: true, opacity: .25 })));
  g.add(arcs); g.userData.arcs = arcs; return g;
}
// percorso a spezzata, parametrizzato sulla lunghezza (getPoint = getPointAt)
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

// ---------- scena 1: centrale termica in spaccato, con gli impianti che Termotech realizza ----------
const S = {};
S.centrale = () => {
  const g = new THREE.Group(), pick = [], pipes = [], parts = {};
  SISTEMI.forEach(k => parts[k] = []);
  const Y0 = -1.4, H = 3.3, W = 7.4, D = 4.6, ZB = -D / 2, XL = -W / 2;
  // locale tecnico: pavimento, parete di fondo e parete di sinistra, in vetro come uno spaccato
  const fl = glassBox(W, .08, D, { opacity: .72, edge: .5 }); fl.position.y = Y0; g.add(fl);
  const bk = glassBox(W, H, .05, { opacity: .2, edge: .3 }); bk.position.set(0, Y0 + H / 2, ZB); g.add(bk);
  const lf = glassBox(.05, H, D, { opacity: .2, edge: .3 }); lf.position.set(XL, Y0 + H / 2, 0); g.add(lf);
  // piastrelle a terra
  const tl = []; for (let x = XL + .5; x < W / 2; x += .5) tl.push(x, Y0 + .045, ZB, x, Y0 + .045, D / 2); for (let z = ZB + .5; z < D / 2; z += .5) tl.push(XL, Y0 + .045, z, W / 2, Y0 + .045, z);
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tl, 3)); g.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ color: IND, transparent: true, opacity: .12 })));

  const eq = (sys, mesh, x, y, z) => { mesh.position.set(x, y, z); mesh.userData.sys = sys; g.add(mesh); pick.push(mesh); parts[sys].push(mesh); return mesh; };
  const ACC = 0xdde3e7, acc = (geo) => solid(geo, ACC, { metal: .55, rough: .28 });
  // accumulo inerziale (puffer), coibentato
  const puf = eq('riscaldamento', acc(new THREE.CylinderGeometry(.52, .52, 2.0, 40)), -1.55, Y0 + 1.05, -1.35);
  const pd = acc(new THREE.SphereGeometry(.52, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2)); pd.scale.y = .35; pd.position.set(-1.55, Y0 + 2.05, -1.35); g.add(pd);
  [0, 1, 2].forEach(i => { const b = solid(new THREE.TorusGeometry(.525, .012, 6, 48), 0xb9c2c8, { metal: .6, rough: .3 }); b.rotation.x = Math.PI / 2; b.position.set(-1.55, Y0 + .45 + i * .6, -1.35); g.add(b); });
  // bollitore dell'acqua calda sanitaria (giallo, come nelle loro centrali)
  eq('idrico', solid(new THREE.CylinderGeometry(.38, .38, 1.65, 36), 0xe9b52a, { rough: .55, metal: .05 }), -2.75, Y0 + .87, -1.45);
  const bd = solid(new THREE.SphereGeometry(.38, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x5d6469, { rough: .5 }); bd.scale.y = .3; bd.position.set(-2.75, Y0 + 1.7, -1.45); g.add(bd);
  const man = solid(new THREE.CylinderGeometry(.07, .07, .03, 20), 0xffffff); man.rotation.x = Math.PI / 2; man.position.set(-2.75, Y0 + 1.25, -1.06); g.add(man);
  // addolcitore
  eq('idrico', solid(new THREE.CylinderGeometry(.16, .16, .7, 20), 0x3d6f8f, { rough: .4 }), -3.25, Y0 + .4, -.25);
  // generatore a condensazione a parete, con fiamma
  eq('riscaldamento', solid(new THREE.BoxGeometry(.56, .8, .32), 0xf7f8f9), -.3, Y0 + 1.55, ZB + .2);
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(.13, .13), new THREE.MeshBasicMaterial({ color: RED })); flame.position.set(-.3, Y0 + 1.4, ZB + .365); g.add(flame); parts.riscaldamento.push(flame);
  const fumi = solid(new THREE.CylinderGeometry(.06, .06, 1.3, 16), 0xc3c9cd, { metal: .5, rough: .3 }); fumi.position.set(-.3, Y0 + 2.6, ZB + .2); g.add(fumi);
  // vaso di espansione
  eq('riscaldamento', solid(new THREE.SphereGeometry(.2, 20, 14), RED, { rough: .4 }), -.55, Y0 + .32, -1.2);
  // pompa di calore aria-acqua con ventilatore
  const hp = eq('clima', solid(new THREE.BoxGeometry(1.15, .95, .5), 0xeef1f3, { rough: .4 }), 2.55, Y0 + .52, 1.15);
  const fr = new THREE.Mesh(new THREE.TorusGeometry(.3, .025, 8, 40), new THREE.MeshStandardMaterial({ color: IND, roughness: .4 })); fr.position.set(2.42, Y0 + .52, 1.41); g.add(fr);
  const fan = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = solid(new THREE.BoxGeometry(.48, .08, .01), 0x4a5660); b.geometry.translate(.24, 0, 0); b.rotation.z = i * Math.PI * 2 / 3; fan.add(b); }
  fan.position.copy(fr.position); g.add(fan);
  const grl = []; for (let i = 0; i < 6; i++) grl.push(2.86, Y0 + .2 + i * .12, 1.405, 3.05, Y0 + .2 + i * .12, 1.405);
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(grl, 3)); g.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: IND, transparent: true, opacity: .5 })));
  // unità di trattamento aria
  eq('ventilazione', solid(new THREE.BoxGeometry(.8, .9, 1.4), 0xd9dee1, { metal: .35, rough: .35 }), 3.15, Y0 + .49, -.35);
  [-.4, 0, .4].forEach(dz => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.3, .6), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .18, side: THREE.DoubleSide })); p.rotation.y = Math.PI / 2; p.position.set(2.745, Y0 + .49, -.35 + dz); g.add(p); });
  // collettori solari su telaio
  const sol = [];
  [-2.95, -1.85].forEach(x => {
    const grp = new THREE.Group(); grp.position.set(x, Y0 + .62, 1.25); grp.rotation.x = -.95;
    const geo = new THREE.BoxGeometry(1.0, 1.35, .06), m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x23323d, roughness: .25, metalness: .5, emissive: 0x000000 }));
    m.userData.sys = 'solare'; pick.push(m); parts.solare.push(m); sol.push(m); grp.add(m);
    const tex = texCanvas(128, 172, (c, w, h) => { c.strokeStyle = 'rgba(200,214,224,.55)'; c.lineWidth = 2; for (let i = 1; i < 10; i++) { c.beginPath(); c.moveTo(i * w / 10, 6); c.lineTo(i * w / 10, h - 6); c.stroke(); } c.strokeRect(2, 2, w - 4, h - 4); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(.98, 1.33), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); f.position.z = .032; grp.add(f);
    g.add(grp);
    const gamba = solid(new THREE.BoxGeometry(.04, .75, .04), 0x8c969c, { metal: .5 }); gamba.position.set(x, Y0 + .38, .95); g.add(gamba);
  });

  // tubazioni coibentate: tubo chiaro + gocce che scorrono; si accendono quando l'impianto è attivo
  const pipe = (sys, pts, r = .045, beadsPerUnit = 2.4) => {
    const curve = new Poly(pts.map(p => [p[0], Y0 + p[1], p[2]])), col = SYS[sys].c;
    const mat = new THREE.MeshStandardMaterial({ color: pale(col, .55), roughness: .3, metalness: .35, transparent: true, opacity: .92 });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, Math.ceil(curve.len * 14)), r, 12, false), mat); g.add(mesh);
    const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, Math.ceil(curve.len * 4)), Math.max(.13, r * 2.5), 6, false), pickMat);
    hit.userData.sys = sys; g.add(hit); pick.push(hit);
    const n = Math.max(3, Math.round(curve.len * beadsPerUnit));
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(r * 1.3, 10, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true }), n);
    beads.frustumCulled = false; g.add(beads);
    const p = { sys, curve, mesh, beads, n, col }; pipes.push(p); parts[sys].push(mesh); return p;
  };
  // canali d'aria rettangolari: un parallelepipedo per tratto, stesso materiale
  const canale = (sys, pts, w = .34, h = .26) => {
    const col = SYS[sys].c, mat = new THREE.MeshStandardMaterial({ color: pale(col, .55), roughness: .35, metalness: .4, transparent: true, opacity: .92 });
    const P = pts.map(p => new THREE.Vector3(p[0], Y0 + p[1], p[2])); let first = null;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1], d = b.clone().sub(a), s = [Math.abs(d.x) + w, Math.abs(d.y) + (d.y ? w : h), Math.abs(d.z) + w];
      if (!d.x) s[0] = w; if (!d.y) s[1] = h; if (!d.z) s[2] = w;
      const m = new THREE.Mesh(new THREE.BoxGeometry(...s), mat); m.position.copy(a).add(b).multiplyScalar(.5); m.userData.sys = sys; g.add(m); pick.push(m); first = first || m;
      const e = lines(m.geometry, IND, .25); e.position.copy(m.position); g.add(e);
    }
    const curve = new Poly(pts.map(p => [p[0], Y0 + p[1], p[2]])), n = Math.round(curve.len * 2);
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true }), n); beads.frustumCulled = false; g.add(beads);
    const p = { sys, curve, mesh: first, beads, n, col }; pipes.push(p); return p;
  };
  // riscaldamento: generatore → accumulo → collettore → circuiti verso l'edificio
  pipe('riscaldamento', [[-.3, 1.15, ZB + .2], [-.3, .75, ZB + .2], [-.3, .75, -1.35], [-1.03, .75, -1.35]]);
  pipe('riscaldamento', [[-1.03, 1.3, -1.35], [.25, 1.3, -1.35], [.25, 1.3, -1.6], [2.55, 1.3, -1.6]], .07, 1.6);
  [.65, 1.25].forEach(x => pipe('riscaldamento', [[x, 1.3, -1.6], [x, 2.85, -1.6], [x, 2.85, ZB]], .045, 2));
  // climatizzazione: pompa di calore → accumulo, e due circuiti del collettore verso le unità interne
  pipe('clima', [[2.3, 1.0, 1.15], [2.3, 1.55, 1.15], [2.3, 1.55, .35], [-1.0, 1.55, .35], [-1.0, 1.55, -.55], [-1.55, 1.55, -.55], [-1.55, 1.55, -.83]], .05, 2);
  pipe('clima', [[2.75, 1.0, 1.15], [2.75, .25, .7], [-1.25, .25, .7], [-1.25, .25, -.9]], .05, 2);
  [1.85, 2.45].forEach(x => pipe('clima', [[x, 1.3, -1.6], [x, 2.85, -1.6], [x, 2.85, ZB]], .045, 2));
  // idrico: ingresso acqua, addolcitore, bollitore, acqua calda verso le utenze
  pipe('idrico', [[XL, .55, -.25], [-3.09, .55, -.25]], .04);
  pipe('idrico', [[-3.25, .75, -.25], [-3.25, .95, -.25], [-2.75, .95, -.25], [-2.75, .95, -1.07]], .04);
  pipe('idrico', [[-2.75, 1.82, -1.45], [-2.75, 2.7, -1.45], [-2.75, 2.7, ZB]], .04);
  pipe('idrico', [[-2.55, 2.5, ZB], [-2.55, 2.5, -1.45], [-2.55, 1.6, -1.45]], .03);
  // solare termico: collettori → accumulo e bollitore
  pipe('solare', [[-1.85, .25, .85], [-1.85, .25, -.3], [-1.55, .25, -.3], [-1.55, .25, -.83]], .04, 2.4);
  pipe('solare', [[-2.95, .4, .85], [-2.95, .4, -.6], [-2.75, .4, -.6], [-2.75, .4, -1.07]], .04, 2.4);
  // ventilazione: canali dall'unità verso i locali
  canale('ventilazione', [[3.15, .94, -.35], [3.15, 3.05, -.35], [-3.3, 3.05, -.35]]);
  canale('ventilazione', [[-.6, 3.05, -.35], [-.6, 3.05, ZB]], .3, .22);
  // circolatori rossi sui circuiti del collettore, come nelle loro centrali
  const pompe = [];
  [.65, 1.25, 1.85, 2.45].forEach((x, i) => { const sys = i < 2 ? 'riscaldamento' : 'clima', b = eq(sys, solid(new THREE.BoxGeometry(.2, .2, .2), RED, { rough: .4 }), x, Y0 + 1.85, -1.48); pompe.push(b);
    const v = solid(new THREE.CylinderGeometry(.05, .05, .04, 14), 0x2f5f9e); v.rotation.x = Math.PI / 2; v.position.set(x, Y0 + 2.25, -1.53); g.add(v); });

  const base = new THREE.Group(); base.position.y = Y0 - .05; base.add(shadowDisc(5.6)); const rings = hudRings([4.6, 5.4, 6.2]); base.add(rings); g.add(base);
  g.position.y = -.55; g.rotation.y = -.5;

  let active = 'riscaldamento', forced = null, lastSwitch = 0; const mix = {}; SISTEMI.forEach(k => mix[k] = k === active ? 1 : 0);
  const api = {
    group: g, pick, cam: [8.6, 4.8, 13.4], look: [0, .3, 0],
    set(sys) { forced = sys; if (sys) active = sys; },
    update(t, dt) {
      if (!forced && t - lastSwitch > 3.2) { lastSwitch = t; active = SISTEMI[(SISTEMI.indexOf(active) + 1) % SISTEMI.length]; if (api.onSys) api.onSys(active); }
      if (forced) lastSwitch = t;
      SISTEMI.forEach(k => mix[k] += ((k === active ? 1 : 0) - mix[k]) * Math.min(1, dt * 5));
      for (const p of pipes) {
        const m = mix[p.sys]; p.mesh.material.color.copy(pale(p.col, .62 - m * .45)); p.mesh.material.opacity = .78 + m * .22;
        const sp = (.22 + m * .5) / p.curve.len, sc = .5 + m * .8;
        for (let i = 0; i < p.n; i++) { p.curve.getPoint((i / p.n + t * sp) % 1, dummy.position); dummy.scale.setScalar(sc); dummy.updateMatrix(); p.beads.setMatrixAt(i, dummy.matrix); }
        p.beads.instanceMatrix.needsUpdate = true; p.beads.material.opacity = .25 + m * .75;
      }
      SISTEMI.forEach(k => parts[k].forEach(o => { if (o.material && o.material.emissive && !pipes.some(p => p.mesh === o)) o.material.emissive.copy(new THREE.Color(SYS[k].c)).multiplyScalar(.28 * mix[k]); }));
      sol.forEach((m, i) => m.material.emissive.setRGB(.22 * mix.solare * (.7 + .3 * Math.sin(t * 3 + i)), .14 * mix.solare, 0));
      flame.material.color.setRGB(.83, .28 + .08 * Math.sin(t * 9), .12);
      fan.rotation.z = -t * (2 + mix.clima * 10);
      pompe.forEach((b, i) => b.rotation.y = Math.sin(t * 2 + i) * .05);
      rings.userData.arcs.rotation.y = t * .12; g.rotation.y = -.5 + Math.sin(t * .25) * .12;
    },
    hover(o) { const s = o ? o.userData.sys : null; if (s) { forced = s; active = s; if (api.onSys) api.onSys(s); } else forced = null; return s ? `<b>${SYS[s].t}</b>${SYS[s].d}<br><span style="color:#76808a">Ogni lavoro è una commessa: computo, preventivo, materiali, bolle e ore finiscono lì.</span>` : null; },
  };
  return api;
};
S.finale = () => S.centrale();

// ---------- scena 3: quattro carte che si collegano ----------
function icon(x, kind, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.strokeStyle = '#34495a'; x.fillStyle = '#34495a'; x.lineWidth = 5; x.lineJoin = 'round'; x.lineCap = 'round';
  if (kind === 'banca') { x.beginPath(); x.moveTo(-40, -14); x.lineTo(0, -38); x.lineTo(40, -14); x.closePath(); x.fill(); for (let i = -3; i <= 3; i += 2) x.fillRect(i * 9 - 4, -8, 8, 34); x.fillRect(-44, 30, 88, 8); }
  if (kind === 'fattura') { x.beginPath(); x.moveTo(-28, -40); x.lineTo(14, -40); x.lineTo(30, -24); x.lineTo(30, 40); x.lineTo(-28, 40); x.closePath(); x.stroke(); for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-16, -14 + i * 14); x.lineTo(i === 3 ? 4 : 18, -14 + i * 14); x.stroke(); } }
  if (kind === 'ddt') { x.fillRect(-44, -22, 50, 40); x.beginPath(); x.moveTo(8, -10); x.lineTo(30, -10); x.lineTo(44, 6); x.lineTo(44, 18); x.lineTo(8, 18); x.closePath(); x.fill(); x.fillStyle = '#fff'; [-28, 28].forEach(cx2 => { x.beginPath(); x.arc(cx2, 22, 11, 0, 7); x.fill(); x.fillStyle = '#34495a'; x.beginPath(); x.arc(cx2, 22, 7, 0, 7); x.fill(); x.fillStyle = '#fff'; }); }
  if (kind === 'previsto') { x.strokeRect(-38, -30, 76, 66); x.fillRect(-38, -30, 76, 14); x.fillRect(-26, -42, 6, 18); x.fillRect(20, -42, 6, 18); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) x.fillRect(-28 + j * 16, -6 + i * 13, 9, 8); }
  x.restore();
}
function cardTex(c, linked) {
  return texCanvas(640, 400, (x, W, H) => {
    const r = 22; x.fillStyle = 'rgba(255,255,255,.97)'; x.beginPath(); x.roundRect(6, 6, W - 12, H - 12, r); x.fill();
    x.lineWidth = 3; x.strokeStyle = linked ? '#34495a' : 'rgba(52,73,90,.35)'; x.stroke();
    x.fillStyle = 'rgba(52,73,90,.07)'; x.beginPath(); x.roundRect(30, 34, 130, 130, 18); x.fill();
    icon(x, c.k, 95, 99, 1.05);
    x.fillStyle = '#d4471e'; x.font = `700 28px ${FONT}`; x.textBaseline = 'middle'; x.fillText(c.tag, 186, 64);
    x.fillStyle = '#232b30'; x.font = `700 52px ${FONT}`; x.fillText(c.t, 186, 116);
    x.fillStyle = '#3d464c'; x.font = `600 31px ${FONT}`; x.fillText(c.l1, 36, 214); x.fillStyle = '#76808a'; x.font = `500 29px ${FONT}`; x.fillText(c.l2, 36, 256);
    x.fillStyle = 'rgba(52,73,90,.14)'; x.fillRect(36, 298, 420, 7);
    if (linked) { x.fillStyle = '#34495a'; x.beginPath(); x.roundRect(36, 340, 210, 40, 20); x.fill(); x.fillStyle = '#fff'; x.font = `700 20px ${FONT}`; x.fillText('✓  COLLEGATO', 58, 361); }
    else { x.strokeStyle = 'rgba(52,73,90,.35)'; x.lineWidth = 2; x.beginPath(); x.roundRect(36, 340, 210, 40, 20); x.stroke(); x.fillStyle = '#76808a'; x.font = `700 20px ${FONT}`; x.fillText('IN ATTESA', 74, 361); }
    x.fillStyle = '#d4471e'; x.fillRect(W - 120, H - 52, 70, 6);
  });
}
S.carte = () => {
  const g = new THREE.Group(), pick = [];
  const C = [
    { k: 'previsto', tag: 'PREVISTO', t: 'Pagamento', l1: 'Termoforniture Tanaro Spa', l2: 'Scadenza fattura fornitore', tip: '<b>PAGAMENTO PREVISTO</b>Nasce da scadenze, contratti e ordini. Aspetta il suo movimento in banca.' },
    { k: 'banca', tag: 'BANCA', t: 'Movimento', l1: 'Pagamento al fornitore', l2: 'Estratto conto importato', tip: '<b>MOVIMENTO BANCARIO</b>Importato dall\'estratto conto. Il sistema cerca a cosa corrisponde.' },
    { k: 'fattura', tag: 'FATTURA', t: 'FV/6559', l1: 'Termoforniture Tanaro Spa', l2: 'Riepilogativa: più DDT', tip: '<b>FATTURA DEL FORNITORE</b>Anche riepilogativa: si apre sulle bolle che contiene, riga per riga.' },
    { k: 'ddt', tag: 'DDT', t: '18554/B', l1: '09/09/2026 · 4 righe', l2: 'Magazzino centrale', tip: '<b>DDT</b>La bolla dalla foto: righe, quantità, prezzi e commessa proposti, verificati da voi.' },
  ];
  const node = new THREE.Vector3(0, -1.55, .7);
  const target = [[-3.45, 1.15, 0], [-1.15, 1.75, -.5], [1.15, 1.75, -.5], [3.45, 1.15, 0]];
  const cards = C.map((c, i) => {
    const grp = new THREE.Group();
    const t0 = cardTex(c, false), t1 = cardTex(c, true);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 1.28), new THREE.MeshBasicMaterial({ map: t0, transparent: true }));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(2.12, 1.35), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .1, depthWrite: false })); back.position.z = -.04;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: .9 })); sh.position.set(.08, -.12, -.1);
    grp.add(sh, back, face);
    const T = new THREE.Vector3(...target[i]);
    grp.userData = { tip: c.tip, face, t0, t1, T, from: new THREE.Vector3(T.x * 2.2, T.y + (i % 2 ? 3.2 : -3.4), -5), rf: (i - 1.5) * .9, delay: i * .14, lift: 0, liftT: 0 };
    g.add(grp); pick.push(grp); return grp;
  });
  // fili dalle carte al nodo: si disegnano, poi ci scorrono i dati
  const wires = cards.map((cd, i) => {
    const T = cd.userData.T, p0 = new THREE.Vector3(T.x, T.y - .66, T.z + .02);
    const curve = new THREE.CubicBezierCurve3(p0, p0.clone().add(new THREE.Vector3(0, -1.1, .2)), node.clone().add(new THREE.Vector3(T.x * .35, .95, 0)), node);
    const segs = 90, rad = 8; const geo = new THREE.TubeGeometry(curve, segs, .028, rad, false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? IND : IND2 })); geo.setDrawRange(0, 0); g.add(mesh);
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, .07, 8, false), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .08, depthWrite: false })); halo.geometry.setDrawRange(0, 0); g.add(halo);
    const n = 5, beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 12, 10), new THREE.MeshBasicMaterial({ color: i === 2 ? RED : 0x6f8794 }), n); beads.count = 0; beads.frustumCulled = false; g.add(beads);
    return { curve, mesh, halo, beads, n, total: segs * rad * 6, start: 1.25 + i * .38 };
  });
  // nodo centrale: sfera, spunta, anelli
  const core = new THREE.Mesh(new THREE.SphereGeometry(.42, 40, 30), new THREE.MeshStandardMaterial({ color: IND, roughness: .25, metalness: .3, emissive: 0x0d0f40 }));
  core.position.copy(node); g.add(core);
  const check = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCanvas(256, 256, (x) => { x.strokeStyle = '#fff'; x.lineWidth = 26; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(70, 132); x.lineTo(112, 172); x.lineTo(190, 88); x.stroke(); }), transparent: true, opacity: 0, depthTest: false }));
  check.scale.setScalar(.62); check.position.copy(node).add(new THREE.Vector3(0, 0, .45)); g.add(check);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xf2a07e, transparent: true, opacity: .55, depthWrite: false })); halo.scale.setScalar(2.2); halo.position.copy(node); g.add(halo);
  const plate = new THREE.Group(); plate.position.copy(node).add(new THREE.Vector3(0, -.45, 0));
  plate.add(shadowDisc(2.4)); [.8, 1.25, 1.8].forEach((r, i) => plate.add(circle(r, IND, .35 - i * .08)));
  const redArcs = new THREE.Group(); [[1.25, .7, .2], [1.8, .45, 3.3]].forEach(([r, a, a0]) => redArcs.add(circle(r, RED, .85, 24, a, a0))); plate.add(redArcs);
  const wave = circle(1, IND, .5); plate.add(wave); g.add(plate);
  core.userData.tip = '<b>ABBINAMENTO PROPOSTO</b>Previsto, banca, fattura e DDT si riconoscono. Diventa definitivo solo quando lo approvate.'; pick.push(core);
  const tl = label('RICONCILIAZIONE', { w: 3, h: .3, size: 56 }); tl.position.copy(node).add(new THREE.Vector3(0, -.95, .9)); tl.rotation.x = -.35; g.add(tl);
  g.position.y = .35;

  let t0 = 0, lastT = 0; const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);
  const api = {
    group: g, pick, cam: [0, 1.4, 13], look: [0, .1, 0],
    update(t, dt) {
      lastT = t; const T = t - t0;
      cards.forEach((cd, i) => {
        const u = cd.userData, k = ease((T - u.delay) / 1.1);
        cd.position.lerpVectors(u.from, u.T, k); cd.rotation.set((1 - k) * .8, (1 - k) * u.rf - u.T.x * .07, (1 - k) * u.rf * .4);
        u.lift += (u.liftT - u.lift) * Math.min(1, dt * 8); cd.position.z += u.lift * .5; cd.position.y += Math.sin(t * 1.1 + i) * .04 + u.lift * .1;
      });
      let all = true;
      wires.forEach((w, i) => {
        const k = ease((T - w.start) / .9); const cnt = Math.floor(w.total * k / 3) * 3; w.mesh.geometry.setDrawRange(0, cnt); w.halo.geometry.setDrawRange(0, Math.floor(w.halo.geometry.index.count * k / 3) * 3);
        if (k >= 1) {
          if (cards[i].userData.face.material.map !== cards[i].userData.t1) cards[i].userData.face.material.map = cards[i].userData.t1;
          w.beads.count = w.n; for (let j = 0; j < w.n; j++) { w.curve.getPointAt(((j / w.n) + t * .35) % 1, dummy.position); dummy.scale.setScalar(1); dummy.updateMatrix(); w.beads.setMatrixAt(j, dummy.matrix); } w.beads.instanceMatrix.needsUpdate = true;
        } else { all = false; w.beads.count = 0; if (cards[i].userData.face.material.map !== cards[i].userData.t0) cards[i].userData.face.material.map = cards[i].userData.t0; }
      });
      const done = all ? Math.min(1, (T - (wires[3].start + .9)) / .5) : 0;
      check.material.opacity = done; core.scale.setScalar(1 + done * .08 * (1 + Math.sin(t * 3)) / 2);
      core.material.color.setHex(done > 0 ? IND : 0x6b6fb5);
      halo.material.opacity = .25 + done * .45 + Math.sin(t * 3) * .05;
      const wk = (t * .45) % 1; wave.scale.setScalar(.8 + wk * 1.6); wave.material.opacity = (1 - wk) * .5 * (done > 0 ? 1 : .3);
      redArcs.rotation.y = -t * .3;
    },
    hover(o) { cards.forEach(c => c.userData.liftT = c === o ? 1 : 0); return o ? o.userData.tip : null; },
    click() { t0 = lastT; },
  };
  return api;
};

// ---------- scena del progetto: dal disegno al computo e all'offerta ----------
function docTex(titolo, righe, piede) {
  return texCanvas(600, 800, (x, W, H) => {
    x.fillStyle = 'rgba(255,255,255,.98)'; x.beginPath(); x.roundRect(6, 6, W - 12, H - 12, 22); x.fill();
    x.lineWidth = 3; x.strokeStyle = 'rgba(52,73,90,.45)'; x.stroke();
    x.fillStyle = '#34495a'; x.beginPath(); x.roundRect(6, 6, W - 12, 120, [22, 22, 0, 0]); x.fill();
    x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.font = `700 34px ${FONT}`; x.fillText('REALHUB', 40, 46); x.font = `600 25px ${FONT}`; x.fillText('BOZZA DA RIVEDERE', 40, 90);
    x.fillStyle = '#232b30'; x.font = `700 40px ${FONT}`; titolo.forEach((t, i) => x.fillText(t, 40, 182 + i * 48));
    const y0 = 182 + titolo.length * 48 + 34;
    righe.forEach(([a, b], i) => { const y = y0 + i * 66; x.fillStyle = '#3d464c'; x.font = `600 30px ${FONT}`; x.fillText(a, 40, y); x.fillStyle = '#34495a'; x.textAlign = 'right'; x.font = `700 30px ${FONT}`; x.fillText(b, W - 40, y); x.textAlign = 'left'; x.fillStyle = 'rgba(52,73,90,.14)'; x.fillRect(40, y + 30, W - 80, 3); });
    x.fillStyle = '#d4471e'; x.font = `700 28px ${FONT}`; x.fillText(piede, 40, H - 56);
  });
}
function tagTex(t, c) {
  const col = '#' + c.toString(16).padStart(6, '0');
  return texCanvas(480, 150, (x, W, H) => {
    x.fillStyle = 'rgba(255,255,255,.97)'; x.beginPath(); x.roundRect(5, 5, W - 10, H - 10, 18); x.fill(); x.lineWidth = 3; x.strokeStyle = col; x.stroke();
    x.fillStyle = col; x.fillRect(5, 28, 12, H - 56);
    x.fillStyle = '#232b30'; x.textBaseline = 'middle'; let fs = 58; x.font = `700 ${fs}px ${FONT}`; while (x.measureText(t).width > W - 70) { fs -= 2; x.font = `700 ${fs}px ${FONT}`; } x.textAlign = 'center'; x.fillText(t, W / 2 + 6, H / 2 + 3);
  });
}
S.progetto = () => {
  const g = new THREE.Group(), pick = [], Y = -1.4, ALT = .95;
  const MURI = [[-2.7, -1.7, 2.7, -1.7], [2.7, -1.7, 2.7, 1.7], [2.7, 1.7, -2.7, 1.7], [-2.7, 1.7, -2.7, -1.7], [-.6, -1.7, -.6, 1.7], [-.6, .2, 2.7, .2], [-2.7, -.1, -.6, -.1]];
  const LINEE = [
    { k: 'idrico', pts: [[-2.4, .35, 1.4], [-.9, .35, 1.4], [-.9, .35, -1.3], [2.3, .35, -1.3]], r: .04 },
    { k: 'riscaldamento', pts: [[-2.4, .55, -1.4], [-1.2, .55, -1.4], [-1.2, .55, .6], [2.3, .55, .6]], r: .04 },
    { k: 'clima', pts: [[2.4, .75, 1.35], [.2, .75, 1.35], [.2, .75, -.5], [2.3, .75, -.5]], r: .03 },
  ];
  // la planimetria: stessi muri e stesse linee di quelli che si alzano
  const SW = 6.4, SD = 4.25, tex = texCanvas(1280, 850, (x, W, H) => {
    const px = v => (v + SW / 2) / SW * W, pz = v => (v + SD / 2) / SD * H;
    x.fillStyle = '#2b3a44'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,255,255,.1)'; x.lineWidth = 1; for (let i = 0; i < W; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
    x.strokeStyle = '#eaf4fc'; x.lineWidth = 7; MURI.forEach(([a, b, c, d]) => { x.beginPath(); x.moveTo(px(a), pz(b)); x.lineTo(px(c), pz(d)); x.stroke(); });
    LINEE.forEach(l => { x.strokeStyle = '#' + SYS[l.k].c.toString(16).padStart(6, '0'); x.lineWidth = 4; x.setLineDash([16, 9]); x.beginPath(); l.pts.forEach((p, i) => i ? x.lineTo(px(p[0]), pz(p[2])) : x.moveTo(px(p[0]), pz(p[2]))); x.stroke(); }); x.setLineDash([]);
    x.fillStyle = '#eaf4fc'; x.textBaseline = 'middle'; x.font = `700 40px ${FONT}`; x.fillText('DWG', 34, 42); x.font = `500 25px ${FONT}`; x.fillText('24,60 m', W / 2 - 40, H - 28);
  });
  const foglio = new THREE.Mesh(new THREE.PlaneGeometry(SW, SD), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  foglio.rotation.x = -Math.PI / 2; foglio.position.y = Y; foglio.userData.tip = '<b>LA PLANIMETRIA DWG</b>Si parte dalla pianta che vi manda il progettista: il sistema propone locali, superfici e percorsi, voi li verificate.'; g.add(foglio); pick.push(foglio);
  const base = new THREE.Group(); base.position.y = Y - .03; base.add(shadowDisc(4.6)); g.add(base);
  // i muri si alzano dal disegno
  const muri = MURI.map(([a, b, c, d]) => {
    const lx = Math.abs(c - a) || .05, lz = Math.abs(d - b) || .05, m = glassBox(lx, ALT, lz, { opacity: .3, edge: .5 });
    m.position.set((a + c) / 2, Y + .006, (b + d) / 2); m.children.forEach(ch => ch.position.y = ALT / 2); g.add(m); return m;
  });
  // le linee degli impianti
  const linee = LINEE.map(l => {
    const curve = new Poly(l.pts.map(p => [p[0], Y + p[1], p[2]])), col = SYS[l.k].c;
    const geo = new THREE.TubeGeometry(curve, 160, l.r, 10, false), mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .35, metalness: .2 })); geo.setDrawRange(0, 0); g.add(mesh);
    const n = 6, beads = new THREE.InstancedMesh(new THREE.SphereGeometry(l.r * 1.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), n); beads.count = 0; beads.frustumCulled = false; g.add(beads);
    return { curve, geo, beads, n, tot: geo.index.count };
  });
  // le quantità che escono dagli impianti
  const QUANTITA = [
    { t: 'Idrico', c: SYS.idrico.c, x: -2.2, tip: '<b>IDRICO E SANITARIO</b>Punti acqua per locale e metri di tubo proposti dalla pianta: quantità da verificare.' },
    { t: 'Riscaldamento', c: SYS.riscaldamento.c, x: 0, tip: '<b>RISCALDAMENTO</b>Superfici, percorsi e terminali per ambiente proposti nelle voci del computo, da verificare.' },
    { t: 'Clima', c: SYS.clima.c, x: 2.2, tip: '<b>CLIMATIZZAZIONE E VENTILAZIONE</b>Linee, unità e canali proposti nelle voci del computo, da verificare.' },
  ].map(q => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.76, .55), new THREE.MeshBasicMaterial({ map: tagTex(q.t, q.c), transparent: true, depthWrite: false })); m.position.set(q.x, -.02, 1.3); m.userData.tip = q.tip; g.add(m); pick.push(m); return m; });
  // computo e offerta
  const DOC = [
    { x: -1.3, r: .12, tex: docTex(['Computo', 'per impianto'], [['Tubo multistrato', '412 m'], ['Tubo radiante', '627 m'], ['Terminali', '14 pz']], 'PREZZI DAI LISTINI'), tip: '<b>COMPUTO PER IMPIANTO</b>Idrico, riscaldamento, climatizzazione e ventilazione. I prezzi arrivano dai listini dei vostri fornitori; il prezzario regionale si può caricare nel Setup Gold.' },
    { x: 1.3, r: -.12, tex: docTex(['Preventivo', 'al cliente'], [['Idrico', '8.420 €'], ['Riscaldamento', '21.960 €'], ['Climatizzazione', '12.380 €']], 'IMPONIBILE + IVA'), tip: '<b>PREVENTIVO AL CLIENTE</b>A voci, a corpo o per ambiente, con link per vederlo e accettarlo. Il margine resta solo vostro: lo rivedete voi prima dell\'invio.' },
  ];
  const docs = DOC.map((d, i) => {
    const grp = new THREE.Group(), face = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.93), new THREE.MeshBasicMaterial({ map: d.tex, transparent: true }));
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.5), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: .8 })); sh.position.set(.08, -.12, -.1);
    grp.add(sh, face); const T = new THREE.Vector3(d.x, 2.15, -.6 - i * .1);
    grp.userData = { tip: d.tip, T, r: d.r, lift: 0, liftT: 0 }; g.add(grp); pick.push(grp); return grp;
  });
  // fili dalle quantità ai documenti
  const fili = QUANTITA.flatMap((q, i) => docs.filter((_, j) => i === 1 ? true : j === (i ? 1 : 0)).map(d => {
    const a = q.position.clone().add(new THREE.Vector3(0, .28, 0)), b = d.userData.T.clone().add(new THREE.Vector3(0, -1.46, 0));
    const curve = new THREE.CubicBezierCurve3(a, a.clone().add(new THREE.Vector3(0, .5, -.2)), b.clone().add(new THREE.Vector3(0, -.5, .2)), b);
    const geo = new THREE.TubeGeometry(curve, 50, .018, 6, false), mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .75 })); geo.setDrawRange(0, 0); g.add(mesh);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshBasicMaterial({ color: RED })); bead.visible = false; g.add(bead);
    return { curve, geo, bead, tot: geo.index.count, i };
  }));
  g.position.y = -.12;

  let t0 = 0, lastT = 0; const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);
  const api = {
    group: g, pick, cam: [2.2, 3.6, 13.5], look: [0, .75, 0],
    update(t, dt) {
      lastT = t; const T = t - t0;
      muri.forEach((m, i) => { m.scale.y = Math.max(.001, ease((T - .4 - i * .07) / .8)); });
      linee.forEach((l, i) => {
        const k = ease((T - 1.2 - i * .3) / 1); l.geo.setDrawRange(0, Math.floor(l.tot * k / 3) * 3);
        l.beads.count = k >= 1 ? l.n : 0; if (k >= 1) { for (let j = 0; j < l.n; j++) { l.curve.getPoint((j / l.n + t * .12) % 1, dummy.position); dummy.scale.setScalar(1); dummy.updateMatrix(); l.beads.setMatrixAt(j, dummy.matrix); } l.beads.instanceMatrix.needsUpdate = true; }
      });
      QUANTITA.forEach((m, i) => { const k = ease((T - 2.4 - i * .18) / .6); m.material.opacity = k; m.visible = k > .01; m.scale.setScalar(.8 + k * .2); m.position.y = -.2 + k * .18 + Math.sin(t * 1.2 + i) * .02; });
      fili.forEach((f, i) => {
        const k = ease((T - 3.1 - i * .07) / .7); f.geo.setDrawRange(0, Math.floor(f.tot * k / 3) * 3); f.bead.visible = k >= 1;
        if (k >= 1) f.curve.getPoint((t * .35 + i * .23) % 1, f.bead.position);
      });
      docs.forEach((d, i) => {
        const u = d.userData, k = ease((T - 3.6 - i * .35) / .9);
        d.visible = k > .01; d.scale.setScalar(.7 + k * .3); d.position.copy(u.T); d.position.y += (1 - k) * -1.2;
        u.lift += (u.liftT - u.lift) * Math.min(1, dt * 8); d.position.z += u.lift * .55; d.position.y += Math.sin(t * 1.05 + i) * .035 + u.lift * .1;
        d.rotation.set((1 - k) * .7, u.r, 0); d.children.forEach(c => { if (c.material) c.material.opacity = c.material.map === softTex ? k * .8 : k; });
      });
    },
    hover(o) { docs.forEach(d => d.userData.liftT = d === o ? 1 : 0); return o ? o.userData.tip : null; },
    click() { t0 = lastT; },
  };
  return api;
};

// ---------- scena 10: istanza unica, in cloud o in sede ----------
S.istanza = () => {
  const g = new THREE.Group(), pick = [];
  const rack = new THREE.Group(); const rg = new THREE.BoxGeometry(1.35, 2.3, 1.0);
  rack.add(new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3, metalness: .15 }))); rack.add(lines(rg, IND, .8));
  const leds = [];
  for (let i = 0; i < 7; i++) {
    const y = .9 - i * .3; const sl = new THREE.Mesh(new THREE.BoxGeometry(1.15, .2, .02), new THREE.MeshStandardMaterial({ color: 0xeef0f8, roughness: .5 })); sl.position.set(0, y, .51); rack.add(sl);
    const e = lines(sl.geometry, IND, .35); e.position.copy(sl.position); rack.add(e);
    for (let j = 0; j < 3; j++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(.05, .05), new THREE.MeshBasicMaterial({ color: j === 2 && i % 3 === 0 ? RED : IND2, transparent: true })); l.position.set(.38 + j * .08, y, .525); rack.add(l); leds.push(l); }
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(.5, .03), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .25 })); bar.position.set(-.22, y, .525); rack.add(bar);
  }
  const name = label('LA VOSTRA AZIENDA', { w: 1.3, h: .2, size: 52 }); name.position.set(0, 1.34, .3); rack.add(name);
  rack.position.y = .25; g.add(rack);
  rack.userData.tip = '<b>UN\'ISTANZA SOLO VOSTRA</b>Database, archivio e programma dedicati alla vostra azienda. Nessuna piattaforma condivisa con altri clienti.'; pick.push(rack);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, .012, 6, 120), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .5 })); ring1.rotation.x = Math.PI / 2; ring1.position.y = -.4; g.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.95, .01, 6, 120, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .3 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = .2; g.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.75, .02, 6, 40, Math.PI * .35), new THREE.MeshBasicMaterial({ color: RED })); ring3.rotation.x = Math.PI / 2; ring3.position.y = -.4; g.add(ring3);
  const base = new THREE.Group(); base.position.y = -.95; base.add(shadowDisc(3.2)); base.add(hudRings([2.2, 2.7, 3.2])); g.add(base);
  // due destinazioni: cloud dedicato e server in sede
  const mk = (pts) => { const a = []; for (let i = 0; i < pts.length - 1; i++) a.push(...pts[i], ...pts[i + 1]); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: IND, transparent: true, opacity: .8 })); };
  const cloudPts = []; const arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; cloudPts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]); } };
  arc(-.5, -.05, .3, Math.PI * 1.5, Math.PI * .6); arc(-.05, .17, .38, Math.PI * 1.05, Math.PI * .05); arc(.45, -.02, .28, Math.PI * .55, -Math.PI * .5); cloudPts.push([-.5, -.35, 0]);
  const cloud = new THREE.Group(); cloud.add(mk(cloudPts)); cloud.add(label('CLOUD DEDICATO', { w: 1.8, h: .24, size: 58 })); cloud.children[1].position.y = -.62;
  cloud.position.set(-2.1, 2.35, 0); g.add(cloud);
  const house = new THREE.Group(); house.add(mk([[-.6, -.45, 0], [-.6, .2, 0], [0, .62, 0], [.6, .2, 0], [.6, -.45, 0], [-.6, -.45, 0]])); house.add(mk([[-.18, -.45, 0], [-.18, -.05, 0], [.18, -.05, 0], [.18, -.45, 0]]));
  house.add(label('IN SEDE DA VOI', { w: 1.8, h: .24, size: 58 })); house.children[2].position.y = -.72; house.position.set(2.1, 2.3, 0); g.add(house);
  const links = [cloud, house].map((d, i) => {
    const a = new THREE.Vector3(i ? .5 : -.5, 1.45, 0), b = d.position.clone().add(new THREE.Vector3(i ? -.7 : .75, -.1, 0));
    const curve = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3(a.x, b.y + .1, 0), b);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, .018, 6, false), new THREE.MeshBasicMaterial({ color: IND, transparent: true, opacity: .5 })); g.add(mesh);
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshBasicMaterial({ color: i ? RED : 0x6f8794 }), 6); beads.frustumCulled = false; g.add(beads);
    d.userData.tip = i ? '<b>INSTALLATO DA VOI</b>Sui vostri server, nella vostra rete. Stesso sistema, stesse funzioni.' : '<b>CLOUD DEDICATO</b>Un server solo per voi, gestito da Hubique. Nessuna condivisione con altri clienti.';
    pick.push(d); return { curve, mesh, beads, d };
  });
  g.position.y = -.2;
  let hov = null;
  return {
    group: g, pick, cam: [0, 1.6, 12.5], look: [0, .2, 0],
    update(t) {
      ring1.rotation.z = t * .15; ring2.rotation.z = -t * .1; ring3.rotation.z = t * .5;
      leds.forEach((l, i) => l.material.opacity = .35 + .65 * (Math.sin(t * (2 + i % 5) + i * 1.7) > .2 ? 1 : 0));
      const which = hov != null ? hov : Math.floor(t / 3.5) % 2;
      links.forEach((L, i) => {
        const on = i === which; L.mesh.material.opacity += ((on ? .9 : .18) - L.mesh.material.opacity) * .08;
        L.d.children.forEach(c => { if (c.material) c.material.opacity = on ? 1 : .35; });
        for (let j = 0; j < 6; j++) { L.curve.getPointAt(((j / 6) + t * .3 * (i ? -1 : 1) + 10) % 1, dummy.position); dummy.scale.setScalar(on ? 1 : .001); dummy.updateMatrix(); L.beads.setMatrixAt(j, dummy.matrix); }
        L.beads.instanceMatrix.needsUpdate = true;
      });
      rack.rotation.y = Math.sin(t * .4) * .25;
    },
    hover(o) { hov = o === links[0].d ? 0 : o === links[1].d ? 1 : null; return o ? o.userData.tip : null; },
  };
};

// fondo leggero per le slide con le schermate: punti e griglia che respirano
S.ambient = () => {
  const g = new THREE.Group(); const n = 260, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 26; p[i * 3 + 1] = (Math.random() - .5) * 14; p[i * 3 + 2] = (Math.random() - .8) * 14; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: IND, size: .045, transparent: true, opacity: .35, depthWrite: false })); g.add(dots);
  return { group: g, pick: [], cam: [0, 0, 12], look: [0, 0, 0], update(t) { dots.rotation.y = t * .015; dots.position.y = Math.sin(t * .3) * .15; } };
};

// ---------- ciclo, mouse, passaggio ----------
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(9, 9);
let mx = 0, my = 0, drag = false, lastX = 0, vel = 0, yaw = 0, moved = 0, hovered = null;
const tip = document.getElementById('tip');
const tStart = performance.now(); let last = performance.now();
const view = { cam: new THREE.Vector3(0, 0, 12), look: new THREE.Vector3(), off: 0, offWanted: 0, offY: 0, k: 1, kn: .72 };
let centro = null; // schermi stretti: la tela è centrata sulla finestra della scena
const look = new THREE.Vector3();

function layout() {
  const w = innerWidth, h = innerHeight, wide = w / h > 1.15 && w > 900;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = wide ? 34 : 46;
  const su = !wide && centro !== null;
  camera.updateProjectionMatrix();
  view.off = wide ? view.offWanted : 0; view.offY = wide || su ? 0 : -2.3; view.k = wide ? 1 : view.kn;
}
addEventListener('resize', layout);

addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; mouse.set(mx, my);
  if (drag) { const dx = e.clientX - lastX; vel = dx * .004; yaw += vel; moved += Math.abs(dx); }
  lastX = e.clientX;
  tip.style.left = Math.min(e.clientX + 18, innerWidth - 340) + 'px'; tip.style.top = (e.clientY + 16) + 'px';
});
addEventListener('pointerdown', e => { if (e.target !== canvas && !e.target.closest('.slide') ) return; if (e.target.closest('button,a,.scr,.prob,.tile')) return; drag = true; moved = 0; lastX = e.clientX; });
addEventListener('pointercancel', () => { drag = false; });
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

let running = true;
function frame() {
  const now = performance.now(); const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - tStart) / 1000;
  if (!drag) { yaw += vel; vel *= .93; }
  root.rotation.y += ((yaw + mx * .32) - root.rotation.y) * .05;
  root.rotation.x += ((-my * .07) - root.rotation.x) * .05;
  root.position.x += (view.off - root.position.x) * .06; root.position.y += (view.offY - root.position.y) * .06;
  const rk = root.scale.x + (view.k - root.scale.x) * .06; root.scale.setScalar(rk);
  camera.position.lerp(view.cam, .05); look.lerp(view.look, .05); camera.lookAt(look);
  if (current) current.update(t - current.t0, dt);
  pickLoop();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => { const p = document.hidden; if (p === !running) return; running = !p; renderer.setAnimationLoop(p ? null : frame); last = performance.now(); });

function dispose(obj) {
  obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const m = o.material; if (m.map && m.map !== softTex && m.map !== glowTex) m.map.dispose(); if (m !== pickMat) m.dispose(); } });
}
export function mostra(nome, opts = {}) {
  view.offWanted = opts.offsetX || 0; view.kn = opts.kn || .72; layout();
  if (current && current.nome === nome) return current;
  if (current) { root.remove(current.group); dispose(current.group); }
  setHover(null); yaw = 0; vel = 0;
  current = (S[nome] || S.ambient)(opts); current.nome = nome; current.t0 = (performance.now() - tStart) / 1000;
  root.add(current.group); root.rotation.set(0, 0, 0);
  const sc = opts.scale || 1; current.group.scale.multiplyScalar(sc);
  view.cam.set(...current.cam); view.look.set(...current.look);
  if (opts.snap) { camera.position.copy(view.cam); look.copy(view.look); root.position.x = view.off; root.position.y = view.offY; root.scale.setScalar(view.k); }
  return current;
}
export function centra3d(y) { centro = y; layout(); }
export function evidenzia(sys) { if (current && current.set) current.set(sys); }
export function suSistema(cb) { if (current) current.onSys = cb; }
export { SYS };
