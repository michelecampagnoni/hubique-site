/* =====================================================================================
   [CERVELLO] cervello3d.js · vicenda in 3D dentro il cervello wireframe · 16/10/2026
   PARTE RIUSABILE in dashboard/cervello.html (e nella vista web CervelloPanel.swift).
   Nessuna dipendenza dalla pagina: riceve un contenitore e i dati, restituisce un'API.

     const c = creaCervello3D(contenitore, {
       nodi:  [{ id, tipo:'mail'|'chat'|'doc', lobo:0..3, corsia:0..2, data:'AAAA-MM-GG', tit, sotto }],
       archi: [{ a, b, forte:true|false, tipi:['cita',…], perche }],
       lobi:  [{ nome, sotto }] (4, dalla fronte alla nuca), corsie: [{ nome }] (3, da sinistra a destra),
       onClic(id), onHover(id|null), onStato({ visitate, totale, lobiVisti, lobiTot })
     });
     c.focus(id)       // illumina nodo + legami diretti + secondo livello attenuato, camera dolce
     c.anteprima(id)   // hover: solo etichetta e legami diretti tenui, camera ferma
     c.accendi(bool)   // nodi della risposta accesi / spenti
     c.reset()         // toglie il fuoco, vista iniziale
     c.suSchermo(id)   // [x, y] del nodo nella pagina

   Geometria (regola fissa, uguale per ogni vicenda):
     asse verticale y = tipo di fonte: mail in alto, chat ChatGPT a metà, documenti in basso
     asse fronte-nuca z = lobo (argomento): 4 fasce, la prima sulla fronte
     asse sinistra-destra x = corsia (controparte): stessa controparte = stessa profondità in tutti i lobi
     dentro la cella (lobo, corsia, piano) i nodi sono in ordine di data dalla fronte alla nuca.
   La forma del cervello (raggio, cervelletto, tronco) è la stessa di dashboard/cervello.html.
   ===================================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export const COLORI = { mail: 0xC799FF, chat: 0x59F599, doc: 0x33D6FA };   // = timeline v3 (viola, verde, ciano)
const PIANO_Y = { mail: 0.34, chat: 0.03, doc: -0.29 };
const BANDE = [0.40, 0.0, -0.40];                                           // confini dei lobi sull'asse z
const LOBO_Z = [[0.80, 0.44], [0.36, 0.04], [-0.04, -0.36], [-0.44, -0.74]];
const CORSIA_X = [-0.42, 0.0, 0.42];

export function creaCervello3D(el, opt) {
  // 19/10/2026 · chat vuota della RICOSTRUZIONE: senza nodi WebKit (vista dell'app) non disegnava nulla. Un nodo segnaposto
  // invisibile tiene vivo il disegno; il cervello resta spento in attesa della domanda.
  const vuoto = !opt.nodi.length;
  if (vuoto) opt = { ...opt, nodi: [{ id: '__vuoto', tipo: 'doc', lobo: 0, corsia: 1, data: '', tit: '', sotto: '' }] };
  // ---------- forma del cervello (copiata da dashboard/cervello.html) ----------
  let seed = 20261008;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const noise = new SimplexNoise({ random: rnd });
  const AX = 0.86, AY = 0.74, AZ = 1.08;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function raggio(dx, dy, dz) {
    let r = 1;
    r -= 0.14 * Math.exp(-((dx / 0.11) ** 2)) * sm(-0.35, 0.15, dy);
    r += 0.030 * noise.noise3d(dx * 4.5, dy * 4.5, dz * 4.5) + 0.018 * noise.noise3d(dx * 9 + 3, dy * 9, dz * 9);
    r += 0.07 * Math.exp(-((dy + 0.45) ** 2) / 0.06) * Math.exp(-((dz - 0.15) ** 2) / 0.25) * sm(0.3, 0.7, Math.abs(dx));
    if (dy < 0) r *= 1 - 0.10 * dy * dy;
    return r;
  }
  const CB = { c: [0, -0.56, -0.60], a: [0.50, 0.26, 0.36] };
  function raggioCb(dx, dy, dz) { return 1 + 0.035 * Math.sin(Math.acos(Math.max(-1, Math.min(1, dy))) * 26 + dz * 3) + 0.02 * noise.noise3d(dx * 7, dy * 7, dz * 7); }
  function dentro(p, f) {   // riporta p dentro la corteccia (frazione f del raggio)
    const x = p.x / AX, y = p.y / AY, z = p.z / AZ, l = Math.hypot(x, y, z) || 1e-6, r = raggio(x / l, y / l, z / l) * f;
    if (l > r) p.multiplyScalar(r / l); return p;
  }
  function guscio(seg, fn) { const g = new THREE.SphereGeometry(1, seg[0], seg[1]), a = g.attributes.position; for (let i = 0; i < a.count; i++) { const p = [a.getX(i), a.getY(i), a.getZ(i)]; fn(p); a.setXYZ(i, p[0], p[1], p[2]); } return g; }

  // ---------- scena ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab';
  const lay = document.createElement('div'); lay.className = 'c3-etichette'; el.appendChild(lay);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 50);
  const CENTRO = new THREE.Vector3(0, 0.10, 0);
  const HOME = new THREE.Vector3(3.05, 0.62, 1.15);   // di lato, un po' dall'alto: lobi da sinistra a destra, piani dal basso in alto
  camera.position.copy(HOME);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minDistance = 1.4; controls.maxDistance = 5.5; controls.target.copy(CENTRO);
  controls.rotateSpeed = 0.7; controls.autoRotate = false;
  let interagito = false;
  controls.addEventListener('start', () => { interagito = true; volo = null; renderer.domElement.style.cursor = 'grabbing'; });
  controls.addEventListener('end', () => { renderer.domElement.style.cursor = 'grab'; });
  const pr = () => renderer.getPixelRatio();

  // ---------- corteccia: wireframe fine, i lobi si accendono (shader) ----------
  const lobiU = { value: [0, 0, 0, 0] };
  const hullVS = `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
  const hullFS = `uniform float uLobo[4]; uniform float uBase; uniform float uCb; uniform float uT; varying vec3 vP;
    float s(float b){ return smoothstep(b-0.05, b+0.05, vP.z); }
    void main(){
      float f = s(${BANDE[0].toFixed(2)}), p = s(${BANDE[1].toFixed(2)}) - f, t = s(${BANDE[2].toFixed(2)}) - s(${BANDE[1].toFixed(2)}), o = 1.0 - s(${BANDE[2].toFixed(2)});
      float g = (f*uLobo[0] + p*uLobo[1] + t*uLobo[2] + o*uLobo[3]) * (1.0 - uCb);
      float onda = 0.85 + 0.15 * sin(uT*2.2 - vP.y*9.0);
      vec3 c = mix(vec3(0.20,0.84,0.98), vec3(0.75,0.97,1.0), g);
      gl_FragColor = vec4(c, uBase + g * 0.045 * onda); }`;
  const hullMat = new THREE.ShaderMaterial({ uniforms: { uLobo: lobiU, uBase: { value: 0.034 }, uCb: { value: 0 }, uT: { value: 0 } }, vertexShader: hullVS, fragmentShader: hullFS,
    wireframe: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const cbMat = hullMat.clone(); cbMat.uniforms.uCb.value = 1; cbMat.uniforms.uLobo = lobiU; cbMat.uniforms.uBase.value = 0.03;
  const hull = new THREE.Group(); scene.add(hull);
  hull.add(new THREE.Mesh(guscio([84, 56], p => { const r = raggio(p[0], p[1], p[2]); p[0] *= r * AX; p[1] *= r * AY; p[2] *= r * AZ; }), hullMat));
  hull.add(new THREE.Mesh(guscio([44, 28], p => { const r = raggioCb(p[0], p[1], p[2]); p[0] = CB.c[0] + p[0] * r * CB.a[0]; p[1] = CB.c[1] + p[1] * r * CB.a[1]; p[2] = CB.c[2] + p[2] * r * CB.a[2]; }), cbMat));
  { const pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; for (let s = 0; s < 8; s++) { const t = s / 8, t2 = (s + 1) / 8, r1 = 0.13 - t * 0.04, r2 = 0.13 - t2 * 0.04;
      pts.push(Math.cos(a) * r1, -0.52 - t * 0.5, -0.28 - t * 0.12 + Math.sin(a) * r1, Math.cos(a) * r2, -0.52 - t2 * 0.5, -0.28 - t2 * 0.12 + Math.sin(a) * r2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    hull.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x33d6fa, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }))); }

  // contorni: confini dei lobi (sezioni verticali) e piani dei tipi di fonte (sezioni orizzontali)
  function sezione(fnPunto, n) {   // per ogni angolo cerca il bordo della corteccia per bisezione
    const out = [];
    for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2; let lo = 0, hi = 1.4;
      for (let it = 0; it < 22; it++) { const m = (lo + hi) / 2, p = fnPunto(a, m), x = p.x / AX, y = p.y / AY, z = p.z / AZ, l = Math.hypot(x, y, z) || 1e-6;
        if (l < raggio(x / l, y / l, z / l)) lo = m; else hi = m; }
      out.push(fnPunto(a, lo * 0.995)); }
    return out;
  }
  const lineeFisse = [];
  function contorno(punti, col, op) {
    const g = new THREE.BufferGeometry().setFromPoints(punti);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(l); lineeFisse.push(l); return l;
  }
  BANDE.forEach(z => contorno(sezione((a, m) => new THREE.Vector3(Math.cos(a) * m, Math.sin(a) * m, z), 96), 0x33d6fa, 0.30));
  const pianiLinee = {};
  for (const t of ['mail', 'chat', 'doc']) pianiLinee[t] = contorno(sezione((a, m) => new THREE.Vector3(Math.cos(a) * m, PIANO_Y[t] - 0.07, Math.sin(a) * m), 128), COLORI[t], 0.24);

  // ---------- dati: posizioni ----------
  const N = opt.nodi.length;
  const idx = new Map(opt.nodi.map((n, i) => [String(n.id), i]));
  const P = opt.nodi.map(() => new THREE.Vector3());
  { const celle = new Map();
    opt.nodi.forEach((n, i) => { const k = n.lobo + '|' + n.corsia + '|' + n.tipo; if (!celle.has(k)) celle.set(k, []); celle.get(k).push(i); });
    for (const [k, ids] of celle) {
      const [lo, co, tp] = k.split('|'); ids.sort((a, b) => (opt.nodi[a].data || '').localeCompare(opt.nodi[b].data || ''));
      const [z0, z1] = LOBO_Z[+lo], m = ids.length;
      ids.forEach((i, r) => {
        const t = m === 1 ? 0.5 : r / (m - 1);
        const z = z0 + (z1 - z0) * (0.12 + 0.76 * t);
        const off = m === 1 ? 0 : ((r % 3) - 1) * 0.085 + (rnd() - 0.5) * 0.03;
        const y = PIANO_Y[tp] + ((r % 2) ? 0.035 : -0.035) + (rnd() - 0.5) * 0.02;
        P[i].set(CORSIA_X[+co] + off, y, z); dentro(P[i], 0.86);
      });
    }
  }
  const TIPO = opt.nodi.map(n => n.tipo);

  // ---------- nodi: punti con alone, anello = già visitato ----------
  const col = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N), aT = new Float32Array(N), vis = new Float32Array(N), sel = new Float32Array(N), seedA = new Float32Array(N);
  const tmp = new THREE.Color();
  for (let i = 0; i < N; i++) { tmp.setHex(COLORI[TIPO[i]]); col.set([tmp.r, tmp.g, tmp.b], i * 3); size[i] = TIPO[i] === 'chat' ? 15 : 18; alpha[i] = aT[i] = 0.25; seedA[i] = rnd() * 6.28; }
  const posArr = new Float32Array(N * 3); P.forEach((p, i) => posArr.set([p.x, p.y, p.z], i * 3));
  const nGeo = new THREE.BufferGeometry();
  nGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3)); nGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  nGeo.setAttribute('size', new THREE.BufferAttribute(size, 1)); nGeo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  nGeo.setAttribute('vis', new THREE.BufferAttribute(vis, 1)); nGeo.setAttribute('sel', new THREE.BufferAttribute(sel, 1)); nGeo.setAttribute('seed', new THREE.BufferAttribute(seedA, 1));
  const nMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPR: { value: pr() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `attribute float size; attribute float alpha; attribute float vis; attribute float sel; attribute float seed;
      varying vec3 vC; varying float vA; varying float vV; varying float vS; uniform float uT; uniform float uPR;
      void main(){ vC = color; vA = alpha; vV = vis; vS = sel; vec4 mv = modelViewMatrix * vec4(position,1.0);
        float pulse = 1.0 + 0.06 * sin(uT * 1.7 + seed) + sel * 0.18 * sin(uT * 4.0);
        gl_PointSize = size * (1.0 + sel * 0.75) * pulse * uPR * (2.9 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; varying float vV; varying float vS;
      void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        float core = smoothstep(0.17, 0.11, d); float halo = smoothstep(0.5, 0.1, d) * 0.30;
        float ring = smoothstep(0.035, 0.0, abs(d - 0.40)) * max(vV * 0.75, vS);
        vec3 c = mix(vC, vec3(1.0), core * (0.25 + 0.5 * vS));
        gl_FragColor = vec4(c, (core + halo) * vA + ring * min(1.0, vA * 1.6)); }`,
  });
  const nodi3 = new THREE.Points(nGeo, nMat); nodi3.renderOrder = 3; scene.add(nodi3);

  // ---------- legami: curve di Bézier sottili, a spessore costante (LineSegments2) ----------
  const SEG = 28;
  const archi = opt.archi.map(e => ({ ...e, ia: idx.get(String(e.a)), ib: idx.get(String(e.b)) })).filter(e => e.ia != null && e.ib != null);
  const adj = Array.from({ length: N }, () => []); archi.forEach((e, k) => { adj[e.ia].push(k); adj[e.ib].push(k); });
  function curva(ia, ib) {   // arco verso l'interno e un po' in alto: niente rette che si incrociano a caso
    const a = P[ia], b = P[ib], m = a.clone().add(b).multiplyScalar(0.5), d = a.distanceTo(b);
    const c = m.clone().multiplyScalar(0.62); c.y += 0.10 + d * 0.16; dentro(c, 0.9);
    const out = []; for (let s = 0; s <= SEG; s++) { const t = s / SEG, u = 1 - t;
      out.push(new THREE.Vector3(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, u * u * a.z + 2 * u * t * c.z + t * t * b.z)); }
    return out;
  }
  const CURVE = archi.map(e => curva(e.ia, e.ib));
  function strato(lw, op) {
    const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(6)); g.setColors(new Float32Array(6));
    const m = new LineMaterial({ color: 0xffffff, vertexColors: true, linewidth: lw, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, worldUnits: false });
    const l = new LineSegments2(g, m); l.renderOrder = 2; scene.add(l); return { g, m, l, lista: [] };
  }
  // fondo: solo i legami forti (citazioni, allegati, thread, chat prima/dopo, stessa persona), quasi invisibili
  const fondo = strato(1, 1), alone = strato(5.5, 1), luce = strato(1.5, 1), secondo = strato(1, 1);
  function riempi(st, lista) {   // lista: [{k, dir(0/1 = dal fuoco), forza, ritardo}]
    st.lista = lista; const n = Math.max(1, lista.length * SEG), pos = new Float32Array(n * 6), cc = new Float32Array(n * 6);
    lista.forEach((it, j) => { const C = CURVE[it.k]; const rev = it.dir === 1;
      for (let s = 0; s < SEG; s++) { const p = C[rev ? SEG - s : s], q = C[rev ? SEG - s - 1 : s + 1], o = (j * SEG + s) * 6; pos.set([p.x, p.y, p.z, q.x, q.y, q.z], o); } });
    st.g.dispose(); st.g = new LineSegmentsGeometry(); st.g.setPositions(pos); st.g.setColors(cc); st.l.geometry = st.g; colora(st, 0);
  }
  const cA = new THREE.Color(), cB = new THREE.Color();
  function colora(st, prog) {   // gradiente dal colore del nodo di partenza a quello di arrivo; prog = crescita dal fuoco verso fuori
    const arr = st.g.attributes.instanceColorStart.data.array;
    st.lista.forEach((it, j) => { const e = archi[it.k]; let ia = e.ia, ib = e.ib; if (it.dir === 1) [ia, ib] = [ib, ia];
      cA.setHex(COLORI[TIPO[ia]]); cB.setHex(COLORI[TIPO[ib]]);
      for (let s = 0; s < SEG; s++) { const t0 = s / SEG, t1 = (s + 1) / SEG, o = (j * SEG + s) * 6;
        const g0 = it.cresce ? sm(t0 - 0.02, t0 + 0.06, prog - (it.ritardo || 0)) : 1, g1 = it.cresce ? sm(t1 - 0.02, t1 + 0.06, prog - (it.ritardo || 0)) : 1;
        const f0 = it.forza * g0, f1 = it.forza * g1;
        arr[o] = (cA.r + (cB.r - cA.r) * t0) * f0; arr[o + 1] = (cA.g + (cB.g - cA.g) * t0) * f0; arr[o + 2] = (cA.b + (cB.b - cA.b) * t0) * f0;
        arr[o + 3] = (cA.r + (cB.r - cA.r) * t1) * f1; arr[o + 4] = (cA.g + (cB.g - cA.g) * t1) * f1; arr[o + 5] = (cA.b + (cB.b - cA.b) * t1) * f1; } });
    st.g.attributes.instanceColorStart.data.needsUpdate = true;
  }
  const FORTI = archi.map((e, k) => k).filter(k => archi[k].forte);
  let livelloFondo = 0.075;
  riempi(fondo, FORTI.map(k => ({ k, dir: 0, forza: livelloFondo })));

  // ---------- impulsi: scie luminose che viaggiano sui legami accesi ----------
  const NI = 160, TRAIL = 4;
  const iPos = new Float32Array(NI * TRAIL * 3), iCol = new Float32Array(NI * TRAIL * 3), iSize = new Float32Array(NI * TRAIL), iA = new Float32Array(NI * TRAIL);
  const iGeo = new THREE.BufferGeometry();
  iGeo.setAttribute('position', new THREE.BufferAttribute(iPos, 3)); iGeo.setAttribute('color', new THREE.BufferAttribute(iCol, 3));
  iGeo.setAttribute('size', new THREE.BufferAttribute(iSize, 1)); iGeo.setAttribute('alpha', new THREE.BufferAttribute(iA, 1));
  const iMat = new THREE.ShaderMaterial({ uniforms: { uPR: { value: pr() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float uPR;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * uPR * (2.9 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(mix(vC, vec3(1.0), 0.55), smoothstep(0.5, 0.0, d) * vA); }` });
  const imp3 = new THREE.Points(iGeo, iMat); imp3.renderOrder = 4; scene.add(imp3);
  let impulsi = [];   // {k, dir, t, v, forza}
  function impulsiDa(lista, quanti, forza, vel) {
    impulsi = []; if (!lista.length) return;
    for (let q = 0; q < Math.min(NI, quanti); q++) { const it = lista[q % lista.length]; impulsi.push({ k: it.k, dir: it.dir, t: -(q / Math.max(1, quanti)) * 1.2 - (it.ritardo || 0), v: vel * (0.8 + rnd() * 0.4), forza }); }
  }
  function aggiornaImpulsi(dt) {
    iA.fill(0);
    impulsi.forEach((s, q) => { s.t += dt * s.v; if (s.t > 1.15) s.t -= 1.35 + rnd() * 0.5;
      const C = CURVE[s.k], e = archi[s.k]; const da = s.dir === 1 ? e.ib : e.ia, a = s.dir === 1 ? e.ia : e.ib;
      cA.setHex(COLORI[TIPO[da]]); cB.setHex(COLORI[TIPO[a]]);
      for (let r = 0; r < TRAIL; r++) { const t = s.t - r * 0.035, j = (q * TRAIL + r);
        if (t < 0 || t > 1) { iA[j] = 0; continue; }
        const f = t * SEG, i0 = Math.floor(f), fr = f - i0, A = C[s.dir === 1 ? SEG - i0 : i0], B = C[s.dir === 1 ? Math.max(0, SEG - i0 - 1) : Math.min(SEG, i0 + 1)];
        iPos[j * 3] = A.x + (B.x - A.x) * fr; iPos[j * 3 + 1] = A.y + (B.y - A.y) * fr; iPos[j * 3 + 2] = A.z + (B.z - A.z) * fr;
        iCol[j * 3] = cA.r + (cB.r - cA.r) * t; iCol[j * 3 + 1] = cA.g + (cB.g - cA.g) * t; iCol[j * 3 + 2] = cA.b + (cB.b - cA.b) * t;
        iSize[j] = (7 - r * 1.4); iA[j] = s.forza * (1 - r / TRAIL) * sm(0, 0.08, t) * sm(1, 0.9, t); } });
    iGeo.attributes.position.needsUpdate = iGeo.attributes.color.needsUpdate = iGeo.attributes.size.needsUpdate = iGeo.attributes.alpha.needsUpdate = true;
  }

  // ---------- etichette HTML (solo hover e selezione), anti-sovrapposizione ----------
  const lobEl = opt.lobi.map((l, i) => { const d = document.createElement('div'); d.className = 'c3-lobo'; d.innerHTML = `<b>${l.nome}</b><span>${l.sotto || ''}</span>`; lay.appendChild(d); return d; });
  const cbEl = document.createElement('div'); cbEl.className = 'c3-lobo cb'; cbEl.innerHTML = `<b>${opt.cervelletto || ''}</b>`; lay.appendChild(cbEl);
  const LOBO_POS = LOBO_Z.map(([a, b], i) => new THREE.Vector3(0, i % 2 ? 0.90 : 0.78, (a + b) / 2));   // sfalsate: i nomi non si accavallano
  const CB_POS = new THREE.Vector3(0, -0.86, -0.66);
  const etichette = new Map();   // i -> {el, liv}
  function etichetta(i, liv) {
    let o = etichette.get(i);
    if (!o) { const d = document.createElement('div'); lay.appendChild(d); o = { el: d }; etichette.set(i, o); }
    const n = opt.nodi[i]; o.liv = liv;
    o.el.className = 'c3-et ' + liv + ' t-' + TIPO[i];
    o.el.innerHTML = liv === 'fuoco' || liv === 'hover' ? `<i>${n.id}</i>${esc(n.tit)}<small>${esc(n.sotto || '')}</small>` : `<i>${n.id}</i>${esc(corto(n.tit))}`;
  }
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const corto = s => { s = String(s).replace(/^Mail\s*[:«]?\s*/i, '').replace(/[«»]/g, ''); return s.length > 26 ? s.slice(0, 25) + '…' : s; };
  function togliEtichette(tenere) { for (const [i, o] of etichette) if (!tenere.has(i)) { o.el.remove(); etichette.delete(i); } }
  const v3 = new THREE.Vector3();
  function proietta(p) { v3.copy(p).project(camera); return [(v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * H, v3.z]; }
  function posaEtichette() {
    lobEl.forEach((d, i) => { const [x, y] = proietta(LOBO_POS[i]); d.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`; });
    { const [x, y] = proietta(CB_POS); cbEl.style.transform = `translate(${x}px,${y}px) translate(-50%,0)`; }
    const ord = [...etichette.entries()].sort((a, b) => peso(a[1].liv) - peso(b[1].liv)), occ = [];
    for (const [i, o] of ord) {
      const [x, y, z] = proietta(P[i]); const w = o.el.offsetWidth, h = o.el.offsetHeight;
      let ok = false, bx = 0, by = 0;
      for (const [dx, dy] of [[12, -h / 2], [-12 - w, -h / 2], [-w / 2, -h - 10], [-w / 2, 10]]) {
        bx = x + dx; by = y + dy; bx = Math.max(4, Math.min(W - w - 4, bx)); by = Math.max(4, Math.min(H - h - 4, by));
        if (!occ.some(r => bx < r[2] && bx + w > r[0] && by < r[3] && by + h > r[1])) { ok = true; break; } }
      if (z > 1 || (!ok && o.liv === 'vicino')) { o.el.style.visibility = 'hidden'; continue; }
      occ.push([bx - 3, by - 2, bx + w + 3, by + h + 2]); o.el.style.visibility = 'visible'; o.el.style.transform = `translate(${bx}px,${by}px)`;
    }
  }
  const peso = l => l === 'fuoco' ? 0 : l === 'hover' ? 1 : 2;

  // ---------- stato: fuoco, anteprima, visitati, lobi ----------
  let fuoco = -1, hover = -1, acceso = false, lobT = [0.25, 0.25, 0.25, 0.25], prog = 0;
  const visitati = new Set(), lobiVisti = new Set();
  function stato() { opt.onStato && opt.onStato({ visitate: visitati.size, totale: vuoto ? 0 : N, lobiVisti: lobiVisti.size, lobiTot: opt.lobi.length }); }
  function vicini(i) { const s = new Map(); adj[i].forEach(k => { const e = archi[k], o = e.ia === i ? e.ib : e.ia; if (!s.has(o) || archi[k].forte) s.set(o, k); }); return s; }
  function baseAlpha() { for (let i = 0; i < N; i++) aT[i] = vuoto ? 0 : acceso ? 0.55 : 0.22; }
  function applicaFuoco() {
    if (fuoco < 0) {
      baseAlpha(); sel.fill(0); lobT = acceso ? [0.3, 0.3, 0.3, 0.3] : [0.12, 0.12, 0.12, 0.12];
      riempi(luce, []); riempi(alone, []); riempi(secondo, []); livelloFondo = acceso ? 0.06 : 0.04; riempi(fondo, FORTI.map(k => ({ k, dir: 0, forza: livelloFondo })));
      const amb = FORTI.map(k => ({ k, dir: rnd() < 0.5 ? 0 : 1 })); impulsiDa(amb, acceso ? 34 : 14, 0.55, 0.32);
      togliEtichette(new Set(hover >= 0 ? [hover] : [])); nGeo.attributes.sel.needsUpdate = true; return;
    }
    const i = fuoco, v1 = vicini(i), v2 = new Map();
    for (const [o] of v1) adj[o].forEach(k => { const e = archi[k]; if (!e.forte) return; const w = e.ia === o ? e.ib : e.ia; if (w !== i && !v1.has(w) && !v2.has(w)) v2.set(w, { k, da: o }); });
    for (let j = 0; j < N; j++) aT[j] = 0.07;
    for (const [w] of v2) aT[w] = 0.42; for (const [o] of v1) aT[o] = 1; aT[i] = 1;
    sel.fill(0); sel[i] = 1; nGeo.attributes.sel.needsUpdate = true;
    const L1 = [...v1.entries()].map(([o, k]) => ({ k, dir: archi[k].ia === i ? 0 : 1, forza: archi[k].forte ? 1 : 0.5, cresce: true, ritardo: 0 }));
    const L2 = [...v2.values()].slice(0, 48).map(({ k, da }) => ({ k, dir: archi[k].ia === da ? 0 : 1, forza: 0.26, cresce: true, ritardo: 1.0 }));
    riempi(luce, L1); riempi(alone, L1.map(x => ({ ...x, forza: x.forza * 0.13 }))); riempi(secondo, L2);
    livelloFondo = 0.022; riempi(fondo, FORTI.map(k => ({ k, dir: 0, forza: livelloFondo }))); prog = 0;
    impulsiDa(L1, Math.min(NI, Math.max(8, L1.length * 2)), 0.95, 0.55);
    const lob = opt.nodi[i].lobo; lobT = [0.05, 0.05, 0.05, 0.05]; for (const [o] of v1) lobT[opt.nodi[o].lobo] = Math.max(lobT[opt.nodi[o].lobo], 0.45); lobT[lob] = 1;
    lobEl.forEach((d, k) => d.classList.toggle('on', lobT[k] > 0.4)); lobEl.forEach((d, k) => d.classList.toggle('pieno', k === lob));
    const tenere = new Set([i, ...v1.keys()]); if (hover >= 0) tenere.add(hover); togliEtichette(tenere);
    etichetta(i, 'fuoco'); for (const [o] of v1) etichetta(o, 'vicino'); if (hover >= 0 && hover !== i) etichetta(hover, 'hover');
  }

  // ---------- camera: volo dolce in coordinate sferiche (gira intorno, non attraversa) ----------
  let volo = null; const sph0 = new THREE.Spherical(), sph1 = new THREE.Spherical();
  function volaVerso(dir, target, dist, durata = 1.2) {
    const off0 = camera.position.clone().sub(controls.target); sph0.setFromVector3(off0);
    sph1.setFromVector3(dir.clone().normalize().multiplyScalar(dist)); sph1.phi = Math.min(Math.max(sph1.phi, 0.55), 1.45);
    let dth = sph1.theta - sph0.theta; while (dth > Math.PI) dth -= 2 * Math.PI; while (dth < -Math.PI) dth += 2 * Math.PI;
    volo = { th0: sph0.theta, dth, ph0: sph0.phi, ph1: sph1.phi, r0: sph0.radius, r1: dist, t0: controls.target.clone(), t1: target.clone(), k: 0, v: 1 / durata };
  }
  function orientaSu(i) {
    const p = P[i], v1 = vicini(i), c = p.clone().multiplyScalar(2); let n = 2; for (const [o] of v1) { c.add(P[o]); n++; } c.multiplyScalar(1 / n);
    const lato = Math.abs(p.x) > 0.12 ? Math.sign(p.x) : Math.sign(camera.position.x - controls.target.x) || 1;
    const dir = new THREE.Vector3(lato * 1.0, 0.24, 0.32 + p.z * 0.5);
    volaVerso(dir, CENTRO.clone().lerp(c, 0.25), 3.25);
  }

  // ---------- API ----------
  function focus(id, o = {}) {
    const i = idx.get(String(id)); if (i == null) return;
    fuoco = i; visitati.add(i); vis[i] = 1; nGeo.attributes.vis.needsUpdate = true; lobiVisti.add(opt.nodi[i].lobo);
    applicaFuoco(); if (o.camera !== false) orientaSu(i); stato();
  }
  function anteprima(id) {
    const i = id == null ? -1 : idx.get(String(id)); const prima = hover; hover = i == null ? -1 : i;
    if (prima >= 0 && prima !== fuoco && etichette.has(prima) && etichette.get(prima).liv === 'hover') { etichette.get(prima).el.remove(); etichette.delete(prima); }
    if (hover >= 0) { if (!etichette.has(hover) || etichette.get(hover).liv === 'vicino') etichetta(hover, hover === fuoco ? 'fuoco' : 'hover'); }
    if (fuoco < 0) { for (let j = 0; j < N; j++) sel[j] = j === hover ? 0.6 : 0; nGeo.attributes.sel.needsUpdate = true;
      if (hover >= 0) { const L = adj[hover].map(k => ({ k, dir: archi[k].ia === hover ? 0 : 1, forza: archi[k].forte ? 0.55 : 0.25 })); riempi(luce, L); } else riempi(luce, []); }
  }
  function accendi(on) { acceso = !!on; if (fuoco < 0) applicaFuoco(); }
  function reset() { fuoco = -1; lobEl.forEach(d => d.classList.remove('on', 'pieno')); applicaFuoco(); volaVerso(HOME.clone().sub(CENTRO), CENTRO, HOME.distanceTo(CENTRO)); }

  // ---------- puntatore: hover e clic sui nodi (ricerca in pixel, più precisa del raycaster sui punti) ----------
  let W = 1, H = 1, giu = null;
  function piuVicino(ev) {
    const r = renderer.domElement.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top; let best = -1, bd = 13 * 13;
    for (let i = 0; i < N; i++) { if (alpha[i] < 0.03) continue; const [x, y, z] = proietta(P[i]); if (z > 1) continue; const d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd) { bd = d; best = i; } }
    return best;
  }
  renderer.domElement.addEventListener('pointermove', ev => { if (ev.buttons) return; const i = piuVicino(ev);
    if (i !== hover) { anteprima(i >= 0 ? opt.nodi[i].id : null); opt.onHover && opt.onHover(i >= 0 ? opt.nodi[i].id : null); }
    renderer.domElement.style.cursor = i >= 0 ? 'pointer' : 'grab'; });
  let sopra = false; renderer.domElement.addEventListener('pointerenter', () => { sopra = true; });
  renderer.domElement.addEventListener('pointerleave', () => { sopra = false; if (hover >= 0) { anteprima(null); opt.onHover && opt.onHover(null); } });
  renderer.domElement.addEventListener('pointerdown', ev => { giu = [ev.clientX, ev.clientY]; });
  renderer.domElement.addEventListener('pointerup', ev => { if (!giu || Math.hypot(ev.clientX - giu[0], ev.clientY - giu[1]) > 4) return; giu = null;
    const i = piuVicino(ev); if (i >= 0) { opt.onClic ? opt.onClic(opt.nodi[i].id) : focus(opt.nodi[i].id); } });

  function misura() { W = el.clientWidth || 1; H = el.clientHeight || 1; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    for (const st of [fondo, alone, luce, secondo]) st.m.resolution.set(W * pr(), H * pr()); }
  new ResizeObserver(misura).observe(el); misura();

  // ---------- ciclo ----------
  let last = performance.now(), tt = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; tt += dt;
    for (let i = 0; i < N; i++) alpha[i] += (aT[i] - alpha[i]) * Math.min(1, dt * 6);
    nGeo.attributes.alpha.needsUpdate = true;
    for (let k = 0; k < 4; k++) lobiU.value[k] += (lobT[k] - lobiU.value[k]) * Math.min(1, dt * 4);
    if (prog < 2.2 && luce.lista.length) { prog += dt * 1.6; colora(luce, prog); colora(alone, prog); colora(secondo, prog); }
    aggiornaImpulsi(dt);
    if (volo) { volo.k = Math.min(1, volo.k + dt * volo.v); const e = 1 - Math.pow(1 - volo.k, 3);
      sph0.set(volo.r0 + (volo.r1 - volo.r0) * e, volo.ph0 + (volo.ph1 - volo.ph0) * e, volo.th0 + volo.dth * e);
      controls.target.lerpVectors(volo.t0, volo.t1, e); camera.position.setFromSpherical(sph0).add(controls.target); if (volo.k >= 1) volo = null; }
    else if (!interagito && fuoco < 0) { const off = camera.position.clone().sub(controls.target); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(tt * 0.25) * 0.0009); camera.position.copy(controls.target).add(off); }
    nMat.uniforms.uT.value = tt; hullMat.uniforms.uT.value = tt; cbMat.uniforms.uT.value = tt;
    controls.update(); renderer.render(scene, camera); posaEtichette();
  }
  applicaFuoco(); stato();
  renderer.setAnimationLoop(loop);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : loop));
  function suSchermo(id) {   // coordinate del nodo nella pagina (prove automatiche, frecce dall'esterno)
    const i = idx.get(String(id)); if (i == null) return null; const r = renderer.domElement.getBoundingClientRect(), [x, y] = proietta(P[i]); return [r.left + x, r.top + y];
  }
  const anteprimaDaFuori = id => { if (id == null && sopra) return; anteprima(id); };   // la pagina non spegne l'etichetta mentre il mouse è sul cervello
  return { focus, anteprima: anteprimaDaFuori, accendi, reset, suSchermo, visitati: () => [...visitati].map(i => opt.nodi[i].id), _scena: { scene, camera, renderer } };
}
