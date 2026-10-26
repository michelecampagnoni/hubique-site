// G.T.O. — animazione 3D guidata dallo scroll. three 0.186.1, nessuna altra libreria.
// Sequenza: fronte -> rotazione sull'asse verticale fino a 90° -> esplosione (rientra a ~60° perché a 90° i pezzi
// piatti si vedrebbero di taglio) -> ricomposizione mentre torna di fronte.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

if (!WebGL.isWebGL2Available()) {
  document.getElementById('avviso').style.display = 'grid';
  document.getElementById('carico').style.display = 'none';
  throw new Error('WebGL2 non disponibile');
}

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('scena');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;      // colori del cuoio fedeli alla foto, acciaio brillante
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
camera.position.set(0, 0, 16);
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();

// ---------------------------------------------------------------- caricamento
const manager = new THREE.LoadingManager();
manager.onProgress = (_u, done, total) => { document.getElementById('perc').textContent = Math.round(done / total * 100); };
const pmrem = new THREE.PMREMGenerator(renderer);
const [hdr, gltf] = await Promise.all([
  new HDRLoader(manager).loadAsync('./assets/studio_512.hdr'),
  new GLTFLoader(manager).loadAsync('./assets/gto.glb?v=14'),
]);
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = pmrem.fromEquirectangular(hdr).texture;   // riflessi dell'acciaio, nessuno sfondo
scene.environmentRotation.set(0, Math.PI * 0.15, 0);
hdr.dispose(); pmrem.dispose();

// ---------------------------------------------------------------- texture e materiali
// Regole per le texture (il punto debole di three.js):
// - colore in sRGB, normal/roughness lineari
// - filtro anisotropico al massimo: quadrante e lancette restano nitidi quando l'orologio è inclinato
// - mipmap trilineari
// - quadrante e lancette senza luce né tone mapping: sono fotografie già illuminate, i colori restano quelli della foto
function curaTexture(t, colore) {
  if (!t) return;
  t.anisotropy = MAX_ANISO;
  t.colorSpace = colore ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
}

const watch = gltf.scene;
watch.rotation.x = Math.PI / 2;            // il fronte (asse +Z di Blender, +Y in glTF) verso la camera
const pivot = new THREE.Group();
pivot.add(watch);
scene.add(pivot);

const ORDINE_LANCETTE = ['lancetta_gmt', 'lancetta_ore', 'lancetta_minuti', 'lancetta_secondi'];
// pezzi = nodi del modello (un nodo può contenere più mesh, una per materiale: cinturino con fodera e bordi)
const parti = {};
for (const n of watch.children) parti[n.name] = n;
function sistemaMateriale(o, m) {
  curaTexture(m.map, true);
  curaTexture(m.normalMap, false);
  curaTexture(m.roughnessMap, false);
  if (m.name === 'quadrante') {
    o.renderOrder = 1;
    return new THREE.MeshBasicMaterial({ name: m.name, map: m.map, toneMapped: false });
  }
  if (m.name === 'fibbia') {                // placca della fibbia: foto già illuminata (logo leggibile)
    return new THREE.MeshBasicMaterial({ name: m.name, map: m.map, toneMapped: false });
  }
  if (m.name === 'fondello_retro') {        // foto del retro: già illuminata, come il quadrante
    return new THREE.MeshBasicMaterial({ name: m.name, map: m.map, toneMapped: false });
  }
  if (m.name.startsWith('numero_')) {       // 12 e 6 applicati: ritagli della foto, sopra il quadrante e sotto le lancette
    o.renderOrder = 2;
    return new THREE.MeshBasicMaterial({ name: m.name, map: m.map, transparent: true, alphaTest: 0.02, toneMapped: false,
      side: THREE.DoubleSide, depthWrite: false });
  }
  if (m.name.startsWith('lancetta_')) {
    o.renderOrder = 3 + ORDINE_LANCETTE.indexOf(m.name);
    return new THREE.MeshBasicMaterial({ name: m.name, map: m.map, transparent: true, alphaTest: 0.02, toneMapped: false,
      side: THREE.DoubleSide, depthWrite: false });
  }
  if (m.name === 'vetro_zaffiro') {
    o.renderOrder = 20;                    // il vetro si disegna per ultimo
    return new THREE.MeshPhysicalMaterial({ name: m.name,
      color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.1,
      envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false });
  }
  if (m.name === 'cuoio') {
    // pelle: grana e trapuntatura dalle mappe, lucentezza morbida (sheen) e leggera vernice di finitura
    m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping;
    m.normalMap.wrapS = m.normalMap.wrapT = THREE.RepeatWrapping;
    m.roughnessMap.wrapS = m.roughnessMap.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshPhysicalMaterial({ name: m.name, map: m.map, normalMap: m.normalMap, normalScale: new THREE.Vector2(1.1, 1.1),
      roughnessMap: m.roughnessMap, roughness: 1.0, metalness: 0,
      sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color(0.95, 0.72, 0.5),
      clearcoat: 0.08, clearcoatRoughness: 0.5, envMapIntensity: 0.7 });
  }
  if (m.name === 'fodera' || m.name === 'cuoio_bordo' || m.name.startsWith('filo_')) {
    m.envMapIntensity = 0.5;
    if ('sheen' in m) m.sheen = 0.4;
    return m;
  }
  if (m.name === 'acciaio_movimento') m.envMapIntensity = 0.55;   // platina e ponti più scuri: le ruote dorate risaltano
  else if (m.name === 'acciaio_satinato') m.envMapIntensity = 0.8;
  else if (m.name.startsWith('acciaio') || m.name === 'oro_ruote' || m.name === 'fibbia') m.envMapIntensity = 1.5;
  return m;
}
watch.traverse((o) => { if (o.isMesh) o.material = sistemaMateriale(o, o.material); });
const DISSOLVI = [];                       // cinturino e cuciture: si dissolvono durante l'esploso
for (const k of ['cinturino_sopra', 'cinturino_sotto', 'cuciture_sopra', 'cuciture_sotto']) {
  parti[k]?.traverse((o) => { if (o.isMesh) DISSOLVI.push(o.material); });
}
const base = {};
for (const [k, o] of Object.entries(parti)) base[k] = { p: o.position.clone(), r: o.rotation.y };
if (params.has('debug')) console.log('PARTI', Object.keys(parti).join(','));

// ---------------------------------------------------------------- esploso
// spostamento lungo l'asse del vetro (Y del glTF = Z di Blender), in cm; davanti positivo, retro negativo
const ESP = {                              // escono solo i pezzi della parte frontale
  vetro: 4.6, lunetta: 3.6,
  lancetta_secondi: 2.85, lancetta_minuti: 2.4, lancetta_ore: 1.95, lancetta_gmt: 1.5,
  numero_12: 1.25, numero_6: 1.25,     // il quadrante resta nella cassa (26/10 Francesco)
};
const CENTRO = 2.3;                        // durante l'esploso la pila si sposta indietro di metà: resta centrata
const ESP_LATO = {};
const GIRO = { lancetta_secondi: Math.PI * 2, lancetta_minuti: Math.PI * 0.6, lancetta_ore: Math.PI * 0.2, lancetta_gmt: -Math.PI * 0.3 };

// ---------------------------------------------------------------- sequenza dello scroll (p da 0 a 1)
const sm = (t) => t * t * (3 - 2 * t);
const tratto = (p, a, b) => sm(Math.min(1, Math.max(0, (p - a) / (b - a))));
const lerp = (a, b, t) => a + (b - a) * t;
const DEG = Math.PI / 180;
function stato(p) {
  const giro1 = tratto(p, 0.10, 0.36);         // 0 -> 90°
  const esplodi = tratto(p, 0.36, 0.56);       // esplosione
  const ricomponi = tratto(p, 0.64, 0.86);     // ricomposizione
  const ritorno = tratto(p, 0.64, 0.92);       // 60° -> 0°
  const esp = esplodi * (1 - ricomponi);
  let yaw = lerp(0, 90, giro1);
  yaw = lerp(yaw, 50, esplodi);                // durante l'esploso rientra a ~50°: i pezzi si aprono a ventaglio
  yaw = lerp(yaw, 0, ritorno);
  const pitch = -12 * esplodi * (1 - ritorno);  // leggera vista dall'alto nell'esploso
  const dist = lerp(15.5, 23, esplodi * (1 - ricomponi));
  return { yaw: yaw * DEG, pitch: pitch * DEG, esp, dist };
}

// testi: ogni blocco ha il suo intervallo di p
const blocchi = [...document.querySelectorAll('.blocco')];
let target = 0, corrente = 0;
function aggiornaTesti(p) {
  for (const b of blocchi) b.classList.toggle('visibile', p >= +b.dataset.da && p < +b.dataset.a);
}
function leggiScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = max > 0 ? window.scrollY / max : 0;
}
const pFisso = params.get('p');
if (pFisso !== null) {
  target = corrente = parseFloat(pFisso);
  document.querySelectorAll('.blocco, .etichetta').forEach((b) => { b.style.transition = 'none'; });
} else {
  window.addEventListener('scroll', leggiScroll, { passive: true });
  leggiScroll();
}

// etichette agganciate ai pezzi durante l'esploso
// etichette dell'esploso: testo sul nero, fuori dalla sagoma dell'orologio, con linea di richiamo fino al pezzo
const ETICHETTE = [
  ['vetro', 'Vetro zaffiro a cupola'],
  ['lunetta', 'Lunetta in acciaio 316L'],
  ['lancetta_minuti', 'Lancette luminescenti'],
  ['numero_12', 'Numeri applicati'],
].filter(([k]) => parti[k]);
const strato = document.getElementById('etichette');
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('class', 'richiami');
strato.appendChild(svg);
const etichette = ETICHETTE.map(([k, testo]) => {
  const d = document.createElement('div');
  d.className = 'etichetta';
  d.textContent = testo;
  if (pFisso !== null) d.style.transition = 'none';
  strato.appendChild(d);
  const linea = document.createElementNS(svgNS, 'polyline'); svg.appendChild(linea);
  const punto = document.createElementNS(svgNS, 'circle'); punto.setAttribute('r', '3'); svg.appendChild(punto);
  return { k, d, linea, punto };
});
const tmp = new THREE.Vector3();
const box = new THREE.Box3();
const angoli = Array.from({ length: 8 }, () => new THREE.Vector3());
function rettangoloSchermo(obj, w, h) {            // ingombro sullo schermo (px) di un oggetto
  box.setFromObject(obj);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < 8; i++) {
    angoli[i].set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
    const sx = (angoli[i].x * 0.5 + 0.5) * w, sy = (-angoli[i].y * 0.5 + 0.5) * h;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  return { x0, x1, y0, y1 };
}
function aggiornaEtichette(esp) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const vis = Math.max(0, (esp - 0.85) / 0.15);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.style.opacity = vis;
  // ingombro dei pezzi visibili e opachi (senza il cinturino che si dissolve)
  let x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [k, o] of Object.entries(parti)) {
    if (k.startsWith('cinturino') || k.startsWith('cuciture') || k === 'fibbia' || !o.visible) continue;
    const r = rettangoloSchermo(o, w, h); x1 = Math.max(x1, r.x1); y0 = Math.min(y0, r.y0); y1 = Math.max(y1, r.y1);
  }
  const colX = Math.min(x1 + 48, w - 250);           // colonna delle etichette, sul nero a destra dell'orologio
  const passo = Math.max(42, (y1 - y0) / (etichette.length + 1));
  const punti = etichette.map(({ k }) => {
    box.setFromObject(parti[k]); box.getCenter(tmp); tmp.project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h };
  });
  // ordine verticale delle etichette = ordine verticale dei pezzi (le linee non si incrociano)
  const ord = punti.map((p, i) => i).sort((a, b) => punti[a].y - punti[b].y);
  ord.forEach((i, pos) => {
    const { d, linea, punto } = etichette[i];
    const p = punti[i];
    const ty = y0 + passo * (pos + 1);
    d.style.transform = `translate(${colX + 10}px, ${ty - 7}px)`;
    d.style.opacity = vis;
    const gomito = colX - 18;
    linea.setAttribute('points', `${p.x},${p.y} ${gomito},${ty} ${colX + 4},${ty}`);
    punto.setAttribute('cx', p.x); punto.setAttribute('cy', p.y);
  });
}

// leggero movimento col mouse, per dare profondità
const mouse = new THREE.Vector2();
window.addEventListener('pointermove', (e) => {
  mouse.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
}, { passive: true });

// la tela segue la sua dimensione CSS (100vw x 100vh), controllata a ogni fotogramma
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const pr = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(h * pr)) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
}

// ---------------------------------------------------------------- ciclo
const timer = new THREE.Timer();
let attivo = true;
document.addEventListener('visibilitychange', () => { attivo = !document.hidden; });

function disegna(dt) {
  resize();
  corrente += (target - corrente) * (1 - Math.exp(-dt * 6));   // inseguimento morbido dello scroll
  const st = stato(corrente);
  const stretto = camera.aspect < 0.8;                         // telefono: più distanza
  pivot.rotation.set(st.pitch + mouse.y * 0.06, st.yaw + mouse.x * 0.10, 0, 'YXZ');
  camera.position.set(0, 0, st.dist * (stretto ? 1.5 : 1));
  watch.position.set(0, 0, -CENTRO * st.esp);   // centraggio dell'esploso sull'orologio intero (y glTF -> z dopo la rotazione)
  for (const [k, o] of Object.entries(parti)) {
    const b = base[k];
    o.position.copy(b.p);
    o.position.y += (ESP[k] ?? 0) * st.esp;       // solo i pezzi in ESP si muovono; cassa e quadrante restano fermi
    const l = ESP_LATO[k];
    if (l) { o.position.x += l[0] * st.esp; o.position.y += l[1] * st.esp; o.position.z += l[2] * st.esp; }
    o.rotation.y = b.r + (GIRO[k] ?? 0) * st.esp;
  }
  for (const [k, o] of Object.entries(parti)) if (k.startsWith('fibbia') || k === 'passante' || k === 'fori') o.visible = st.esp < 0.15;   // la fibbia ha l'acciaio della cassa: si nasconde, non si dissolve
  for (const m of DISSOLVI) {                // opachi da composti, trasparenti solo mentre si dissolvono
    const tr = st.esp > 0.002;
    m.transparent = tr; m.opacity = 1 - 0.92 * st.esp; m.depthWrite = !tr;
  }
  if (params.get('vista') === 'pelle') {     // prova: primo piano del cinturino
    pivot.rotation.set(0.55, 0.45, 0, 'YXZ'); camera.position.set(0.6, 2.6, 7.0); camera.lookAt(0.2, 2.2, 0);
  } else if (params.get('vista') === 'sotto') {
    pivot.rotation.set(0.9, 2.6, 0, 'YXZ'); camera.position.set(0, 0, 13); camera.lookAt(0, 0, 0);
  } else if (params.get('vista') === 'retro') {      // prova: retro con fibbia, come la foto ufficiale
    pivot.rotation.set(+(params.get('px') ?? 0), Math.PI + +(params.get('py') ?? 0), 0, 'YXZ'); camera.position.set(0, 0, 17); camera.lookAt(0, 0, 0);
  } else camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  aggiornaTesti(corrente);
  aggiornaEtichette(st.esp);
  renderer.render(scene, camera);
}

let fotogrammi = 0;
renderer.setAnimationLoop((ts) => {
  if (!attivo) return;
  timer.update(ts);
  disegna(Math.min(timer.getDelta(), 0.05));
  if (++fotogrammi === 20) window.__pronto = true;     // per gli screenshot automatici
});

if (pFisso !== null) {
  document.getElementById('carico').remove();
} else {
  document.getElementById('carico').style.opacity = 0;
  setTimeout(() => document.getElementById('carico').remove(), 700);
}
