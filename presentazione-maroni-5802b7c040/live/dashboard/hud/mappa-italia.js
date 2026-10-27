// Mappa 3D d'Italia condivisa (14/10/2026): scena, terreno a fil di ferro, confini, zoom, punti, anello, clic.
// Usata da dashboard/scraping-mappa.html (SCRAPING) e dashboard/campagne-mappa.html (CAMPAGNE): stesso aspetto, stesso
// comportamento. Script classico (non modulo) perché dentro Jarvis le pagine si aprono da file:// e un import di modulo
// locale verrebbe bloccato; la pagina passa THREE e OrbitControls che importa dal CDN.
// Prima di caricarlo: data/italia-regioni.js (window.ITALIA) e data/italia-rilievo.js (window.RILIEVO).
//
// const M = creaMappaItalia(THREE, OrbitControls, {
//   diagnosi(msg),               // riga nel log di Jarvis
//   visibile(i) → bool,          // il punto i è acceso (filtri della pagina); i punti spenti non si toccano
//   tipPunto(i) → html,          // riquadro al passaggio su un punto
//   tipRegione(Rg) → testo,      // riquadro al passaggio su una regione (fuori dai punti)
//   clicPunto(i, e),             // clic (non trascinamento) su un punto
//   clicVuoto(e),                // clic fuori dai punti (facoltativo)
// });
// M.disegnaPunti(xyz Float32Array, rgb Float32Array) · M.coloraPunti(fn(i, color) → fattore) · M.regioni[iso].target
// (-1 fuori, 0..1 avanzamento, colore ciano→ambra→verde) · M.regioni[iso].attiva (pulsa) · M.regioneDi(x, y) · M.quota(x, y)
window.creaMappaItalia = function (THREE, OrbitControls, opz) {
  const diagnosi = opz.diagnosi || (() => {});
  const CYAN = new THREE.Color(0x33d6fa), AMBER = new THREE.Color(0xffbd52), GREEN = new THREE.Color(0x59f599), IDLE = new THREE.Color(0x1f86b0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  document.getElementById('app').appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02101d, 0.03);
  const camera = new THREE.PerspectiveCamera(36, (innerWidth > 0 && innerHeight > 0) ? innerWidth / innerHeight : 1, 0.05, 400);
  camera.position.set(0.3, -9.6, 11.4);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.target.set(0.3, 0.2, 0);
  controls.autoRotate = false;            // Michele 12/10: no automatic rotation
  controls.minDistance = 2.5; controls.maxDistance = 120; controls.maxPolarAngle = Math.PI * 0.8;
  // Whole boot in view whatever the box shape (12/10: in the tall, narrow column of a run the zoom stopped at 30 and
  // the fog hid the rest). Refit on resize until Michele moves the map himself.
  let toccata = false; controls.addEventListener('start', () => { toccata = true; });
  window.MAPPA = { camera, controls, dist: () => camera.position.distanceTo(controls.target), toccata: () => toccata };   // for automatic checks (Jarvis harness, Chrome)
  // Zoom inside Jarvis (12/10 evening, Michele: «ancora il problema con lo zoom»). Two holes: the wheel over the filters
  // and the writing zoomed nothing (inside Jarvis it scrolled the panel around the map instead), and the trackpad pinch
  // in a WebKit view arrives as gesture events, not as ctrl+wheel like in Chrome, so OrbitControls never saw it and
  // nothing moved. Now every wheel on the page zooms the scene and the pinch moves the camera; the page never scales.
  // Exception (14/10): a wheel over an element with class «scorre» (a long list) scrolls that element.
  addEventListener('wheel', e => {
    if (e.target.closest && e.target.closest('.scorre')) return;
    e.preventDefault();
    if (e.target !== renderer.domElement) renderer.domElement.dispatchEvent(new WheelEvent('wheel', e));
  }, { passive: false });
  let scala0 = 1, ultimaRotellaCtrl = 0;
  addEventListener('wheel', e => { if (e.ctrlKey) ultimaRotellaCtrl = performance.now(); }, { passive: true });
  function avvicina(k) {   // k > 1: closer, k < 1: farther, inside the zoom limits
    const off = camera.position.clone().sub(controls.target);
    const d = THREE.MathUtils.clamp(off.length() / k, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(off.setLength(d)); toccata = true; controls.update();
  }
  addEventListener('gesturestart', e => { e.preventDefault(); scala0 = 1; });
  addEventListener('gesturechange', e => {
    e.preventDefault();
    if (performance.now() - ultimaRotellaCtrl < 300) return;   // this WebKit already sends the pinch as ctrl+wheel
    if (e.scale > 0) { avvicina(e.scale / scala0); scala0 = e.scale; }
  });
  addEventListener('gestureend', e => e.preventDefault());
  // Inside Jarvis, one line in app.log after each zoom (how many wheel/pinch events, where the camera ended up).
  const zoomLog = { rotella: 0, pinch: 0, t: 0 };
  function segnaZoom(k) {
    const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.log; if (!h) return;
    zoomLog[k]++; clearTimeout(zoomLog.t);
    zoomLog.t = setTimeout(() => { h.postMessage(`mappa zoom: rotella ${zoomLog.rotella}, pinch ${zoomLog.pinch}, distanza ${camera.position.distanceTo(controls.target).toFixed(1)} (da ${controls.minDistance} a ${controls.maxDistance.toFixed(0)}), riquadro ${innerWidth}x${innerHeight}`); zoomLog.rotella = zoomLog.pinch = 0; }, 1500);
  }
  addEventListener('wheel', () => segnaZoom('rotella'), { passive: true });
  addEventListener('gesturechange', () => segnaZoom('pinch'), { passive: true });
  const DIR = new THREE.Vector3(0.0, -9.8, 11.2).normalize();
  function adatta() {
    if (!(innerWidth > 0 && innerHeight > 0)) return;   // inside Jarvis the page starts at 0×0: wait for a real size
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    const W = 9.6, Hh = 11.2;   // Italy in map units, with margin
    const d = Math.max((Hh / 2) / Math.tan(vf), (W / 2) / Math.tan(hf)) * 1.08;
    controls.target.set(0.3, -0.2, 0);
    camera.position.copy(controls.target).addScaledVector(DIR, d);
    controls.maxDistance = Math.max(120, d * 2);
    controls.update();
  }

  const grid = new THREE.GridHelper(40, 80, 0x1b6a8a, 0x0c3550);
  grid.rotation.x = Math.PI / 2; grid.position.z = -0.02; grid.material.transparent = true; grid.material.opacity = 0.25; scene.add(grid);

  // ---- Terrain as a wireframe (like the brain): one line per neighbouring pair of land cells ----
  const R = window.RILIEVO, ISO = R.iso, ZS = 0.00012 * 10;   // z is in tens of metres
  const hAt = (i, j) => R.z[j * R.w + i] * ZS;
  const pos = [], vreg = [];
  const cellX = i => R.x0 + i * R.d, cellY = j => R.y0 + j * R.d;
  for (let j = 0; j < R.h; j++) for (let i = 0; i < R.w; i++) {
    const k = j * R.w + i, rg = R.r[k];
    if (rg < 0) continue;
    for (const [di, dj] of [[1, 0], [0, 1]]) {
      const i2 = i + di, j2 = j + dj; if (i2 >= R.w || j2 >= R.h) continue;
      const k2 = j2 * R.w + i2; if (R.r[k2] < 0) continue;
      pos.push(cellX(i), cellY(j), hAt(i, j), cellX(i2), cellY(j2), hAt(i2, j2));
      vreg.push(rg, R.r[k2]);
    }
  }
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const tCol = new Float32Array(vreg.length * 3);
  tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
  const terrain = new THREE.LineSegments(tGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(terrain);
  // Glow nodes on the higher ground
  const nodes = [];
  for (let j = 0; j < R.h; j += 2) for (let i = 0; i < R.w; i += 2) { const k = j * R.w + i; if (R.r[k] >= 0 && R.z[k] > 60) { nodes.push(cellX(i), cellY(j), hAt(i, j) + 0.004); } }
  const nGeo = new THREE.BufferGeometry(); nGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodes, 3));
  scene.add(new THREE.Points(nGeo, new THREE.PointsMaterial({ color: 0x9fefff, size: 0.018, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Height of the ground at map coords (for borders and site dots)
  function quota(x, y) {
    const i = Math.round((x - R.x0) / R.d), j = Math.round((y - R.y0) / R.d);
    if (i < 0 || j < 0 || i >= R.w || j >= R.h) return 0;
    const v = R.z[j * R.w + i]; return v > 0 ? v * ZS : 0;
  }
  function regioneDi(x, y) { const i = Math.round((x - R.x0) / R.d), j = Math.round((y - R.y0) / R.d); if (i < 0 || j < 0 || i >= R.w || j >= R.h) return null; const r = R.r[j * R.w + i]; return r >= 0 ? ISO[r] : null; }

  // ---- Region borders, lifted on the terrain ----
  const regioni = {};
  ISO.forEach((iso, idx) => { const r = window.ITALIA[idx]; regioni[iso] = { idx, nome: r.nome, p: -1, target: -1, attiva: false, siti: 0, vista: false }; });
  const bpos = [], breg = [];
  window.ITALIA.forEach((r, idx) => {
    for (const rings of r.shapes) for (const ring of rings) for (let a = 0; a < ring.length; a++) {
      const p = ring[a], q = ring[(a + 1) % ring.length];
      bpos.push(p[0], p[1], quota(p[0], p[1]) + 0.01, q[0], q[1], quota(q[0], q[1]) + 0.01); breg.push(idx, idx);
    }
  });
  const bGeo = new THREE.BufferGeometry(); bGeo.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3));
  const bCol = new Float32Array(breg.length * 3); bGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
  scene.add(new THREE.LineSegments(bGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Invisible flat region meshes for hover
  const pick = [];
  window.ITALIA.forEach((r, idx) => {
    const shapes = r.shapes.map(rings => { const sh = new THREE.Shape(rings[0].map(p => new THREE.Vector2(p[0], p[1]))); rings.slice(1).forEach(h => sh.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1]))))); return sh; });
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shapes), new THREE.MeshBasicMaterial({ visible: false }));
    m.userData.iso = r.iso; scene.add(m); pick.push(m);
  });

  function colore(p) {
    if (p < 0) return IDLE.clone();
    if (p < 0.15) return CYAN.clone().lerp(AMBER, p / 0.15);
    return AMBER.clone().lerp(GREEN, (p - 0.15) / 0.85);
  }

  // ---- Dots: one THREE.Points (fast with thousands), colours per vertex ----
  let dots = null, nPunti = 0;
  const visibile = i => !opz.visibile || opz.visibile(i);
  // Crisp dot, no blur (Michele 12/10): solid disc with a thin dark rim.
  function disco() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
    x.beginPath(); x.arc(32, 32, 28, 0, Math.PI * 2); x.fillStyle = '#ffffff'; x.fill();
    x.lineWidth = 6; x.strokeStyle = 'rgba(0,10,20,0.85)'; x.stroke();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function disegnaPunti(ps, cs) {
    nPunti = ps.length / 3;
    if (dots) { scene.remove(dots); dots.geometry.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(ps, 3)); g.setAttribute('color', new THREE.BufferAttribute(cs, 3));
    dots = new THREE.Points(g, new THREE.PointsMaterial({ size: 7 * Math.min(2, devicePixelRatio), sizeAttenuation: false, vertexColors: true, transparent: false, depthWrite: false, depthTest: false, alphaTest: 0.5, map: disco() }));
    dots.renderOrder = 10;
    return dots;
  }
  function mostraPunti() { if (dots && dots.parent !== scene) scene.add(dots); }
  // fn(i, color) sets the colour of dot i and returns its brightness factor (1 lit, 0.12 dimmed)
  function coloraPunti(fn) {
    if (!dots) return;
    const cs = dots.geometry.attributes.color.array, c = new THREE.Color();
    for (let i = 0; i < nPunti; i++) { const k = fn(i, c); cs[i * 3] = c.r * k; cs[i * 3 + 1] = c.g * k; cs[i * 3 + 2] = c.b * k; }
    dots.geometry.attributes.color.needsUpdate = true;
  }
  const vtmp = new THREE.Vector3();
  function puntoVicino(mx, my, rc) {
    if (!dots) return null;
    const a = dots.geometry.attributes.position.array; let best = null, bd = 81;
    for (let i = 0; i < nPunti; i++) {
      if (!visibile(i)) continue;
      vtmp.set(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]).project(camera);
      if (vtmp.z > 1) continue;
      const sx = (vtmp.x + 1) / 2 * rc.width, sy = (1 - vtmp.y) / 2 * rc.height, d = (sx - mx) ** 2 + (sy - my) ** 2;
      if (d < bd) { bd = d; best = { i }; }
    }
    return best;
  }
  // Highlighted dot: a bigger ring on top of the hovered one (a second, fixed ring for a selected dot)
  const tAnello = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); x.beginPath(); x.arc(32, 32, 26, 0, Math.PI * 2); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke(); return new THREE.CanvasTexture(cv); })();
  const nuovoAnello = (colore, lato) => { const a = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
    new THREE.PointsMaterial({ size: lato * Math.min(2, devicePixelRatio), sizeAttenuation: false, color: colore, map: tAnello, transparent: true, alphaTest: 0.4, depthTest: false }));
    a.renderOrder = 11; a.visible = false; scene.add(a); return a; };
  const anello = nuovoAnello(0xffffff, 16), anelloFisso = nuovoAnello(0xffbd52, 20);
  function suPunto(a, i) {
    a.visible = i >= 0 && !!dots && i < nPunti;
    if (a.visible) { const p = dots.geometry.attributes.position.array; a.position.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]); }
  }
  const evidenzia = i => suPunto(anello, i), fissa = i => suPunto(anelloFisso, i);

  // Hover
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), tip = document.getElementById('tip');
  renderer.domElement.addEventListener('pointermove', e => {
    const rc = renderer.domElement.getBoundingClientRect();
    mouse.set((e.clientX - rc.left) / rc.width * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    // Dots first: the nearest one within 9 px of the pointer
    const dot = puntoVicino(e.clientX - rc.left, e.clientY - rc.top, rc);
    if (dot) {
      tip.style.display = 'block'; tip.style.left = e.clientX + 12 + 'px'; tip.style.top = e.clientY + 10 + 'px';
      tip.innerHTML = opz.tipPunto ? opz.tipPunto(dot.i) : '';
      // keep the label inside the window (long labels near the right or bottom edge)
      const tr = tip.getBoundingClientRect();
      if (tr.right > innerWidth - 4) tip.style.left = Math.max(4, e.clientX - 12 - tr.width) + 'px';
      if (tr.bottom > innerHeight - 4) tip.style.top = Math.max(4, e.clientY - 10 - tr.height) + 'px';
      evidenzia(dot.i); renderer.domElement.style.cursor = 'pointer'; return;
    }
    evidenzia(-1); renderer.domElement.style.cursor = 'crosshair';
    const hit = ray.intersectObjects(pick)[0];
    if (hit && opz.tipRegione) {
      const Rg = regioni[hit.object.userData.iso];
      tip.style.display = 'block'; tip.style.left = e.clientX + 12 + 'px'; tip.style.top = e.clientY + 10 + 'px';
      tip.textContent = opz.tipRegione(Rg);
    } else tip.style.display = 'none';
  });
  // Click on a dot. The dot is found at the click point (not from the last hover), and a drag of the map is not a click.
  let giu = null;
  renderer.domElement.addEventListener('pointerdown', e => { giu = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!giu || Math.hypot(e.clientX - giu[0], e.clientY - giu[1]) > 5) { giu = null; return; }
    giu = null;
    const rc = renderer.domElement.getBoundingClientRect();
    const dot = puntoVicino(e.clientX - rc.left, e.clientY - rc.top, rc);
    if (dot) { if (opz.clicPunto) opz.clicPunto(dot.i, e); }
    else if (opz.clicVuoto) opz.clicVuoto(e);
  });
  renderer.domElement.addEventListener('pointerleave', () => { tip.style.display = 'none'; evidenzia(-1); });

  function ridimensiona() {
    if (!(innerWidth > 0 && innerHeight > 0)) return;
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
    if (!toccata) adatta();
  }
  addEventListener('resize', ridimensiona);
  let ultimaMisura = '';
  adatta();

  const timer = new THREE.Timer(), regCol = ISO.map(() => new THREE.Color());
  function loop(t) {
    timer.update(t); const dt = Math.min(0.05, timer.getDelta()), time = timer.getElapsed();
    ISO.forEach((iso, idx) => {
      const Rg = regioni[iso]; Rg.p += (Rg.target - Rg.p) * Math.min(1, dt * 2.5);
      const base = Rg.p < 0 ? IDLE : colore(Rg.p);
      const pulse = Rg.attiva ? 0.55 + 0.45 * Math.sin(time * 4) : 1;
      regCol[idx].copy(base).multiplyScalar(Rg.p < 0 ? 0.75 : pulse);
    });
    for (let v = 0; v < vreg.length; v++) { const c = regCol[vreg[v]]; tCol[v * 3] = c.r; tCol[v * 3 + 1] = c.g; tCol[v * 3 + 2] = c.b; }
    tGeo.attributes.color.needsUpdate = true;
    for (let v = 0; v < breg.length; v++) { const c = regCol[breg[v]]; bCol[v * 3] = Math.min(1, c.r * 1.3 + 0.1); bCol[v * 3 + 1] = Math.min(1, c.g * 1.3 + 0.1); bCol[v * 3 + 2] = Math.min(1, c.b * 1.3 + 0.1); }
    bGeo.attributes.color.needsUpdate = true;

    const misura = innerWidth + 'x' + innerHeight;   // the web view can change size without a resize event
    if (misura !== ultimaMisura) { ultimaMisura = misura; ridimensiona(); }
    controls.update(dt);
    const dist = camera.position.distanceTo(controls.target);
    scene.fog.density = Number.isFinite(dist) ? 0.32 / Math.max(4, dist) : 0.02;   // never fogged when zoomed out
    renderer.render(scene, camera);
  }
  let fotogrammi = 0; const giro = t => { fotogrammi++; loop(t); };
  renderer.setAnimationLoop(giro);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : giro));
  setTimeout(() => { const gl = renderer.getContext(); diagnosi('finestra ' + innerWidth + 'x' + innerHeight + ' canvas ' + renderer.domElement.width + 'x' + renderer.domElement.height + ' fotogrammi ' + fotogrammi + ' punti ' + nPunti + ' contesto ' + (gl && !gl.isContextLost() ? 'ok' : 'PERSO') + ' camera ' + camera.position.toArray().map(v => v.toFixed(1)).join(',')); }, 5000);

  return {
    THREE, renderer, scene, camera, controls, R, ISO, regioni, quota, regioneDi, colore, disco,
    disegnaPunti, mostraPunti, coloraPunti, puntoVicino, evidenzia, fissa, vtmp, tip,
    get dots() { return dots; }, nPunti: () => nPunti, toccata: () => toccata,
  };
};
