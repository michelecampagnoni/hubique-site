// Cruscotti dimostrativi delle slide 4 e 5: interfaccia disegnata in HTML/CSS/canvas, dati tutti inventati.
// I valori derivati (margine, medie, totali) sono calcolati qui, così i numeri restano coerenti tra loro.
const AZ = '#2ea3f2', ANT = '#2c3333', MUT = '#6f7a7b', GRID = 'rgba(44,51,51,.1)';
const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';
export const eur = n => (n < 0 ? '−' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
const pct = n => n.toFixed(1).replace('.', ',') + '%';

// totale dell'anno per tipo di commessa
const TIPI = [
  { t: 'Piccoli interventi', n: 96, ricavo: 518000, costo: 383000 },
  { t: 'Progetti di interni', n: 44, ricavo: 396000, costo: 277000 },
  { t: 'Ristrutturazioni', n: 40, ricavo: 980000, costo: 784000 },
  { t: 'Flipping', n: 5, ricavo: 740000, costo: 612000 },
  { t: 'Operazioni immobiliari', n: 2, ricavo: 860000, costo: 705000 },
].map(o => ({ ...o, margine: o.ricavo - o.costo, mp: (o.ricavo - o.costo) / o.ricavo * 100 }));
const somma = (a, k) => a.reduce((s, o) => s + o[k], 0);
const T = { n: somma(TIPI, 'n'), ricavo: somma(TIPI, 'ricavo'), margine: somma(TIPI, 'margine'), cassa: 412000 };
T.mp = T.margine / T.ricavo * 100; T.medio = T.margine / T.n;
const APERTE = 62;
// prime righe dell'elenco: taglie diverse, il ROI solo sulle operazioni immobiliari
const RIGHE = [
  { cod: 'C26-187', nome: 'Via Esempio 12', tipo: 'Piccolo', stato: 'Aperta', ricavo: 3200, costo: 2300, cassa: 1100 },
  { cod: 'C26-186', nome: 'Corso Modello 8', tipo: 'Interni', stato: 'In lavori', ricavo: 18500, costo: 13100, cassa: 4200 },
  { cod: 'C26-181', nome: 'Via Campione 27', tipo: 'Ristrutturazione', stato: 'SAL 3', ricavo: 86000, costo: 68100, cassa: 8000 },
  { cod: 'C26-174', nome: 'Piazza Prova 3', tipo: 'Flipping', stato: 'In lavori', ricavo: 148000, costo: 123300, cassa: 96000 },
  { cod: 'C26-162', nome: 'Strada Prototipo 5', tipo: 'Immobiliare', stato: 'In lavori', ricavo: 430000, costo: 352500, cassa: 212000, roi: true },
].map(o => ({ ...o, margine: o.ricavo - o.costo, mp: (o.ricavo - o.costo) / o.ricavo * 100, roiv: (o.ricavo - o.costo) / o.costo * 100 }));

// commessa di esempio: la ristrutturazione Via Campione 27 (ricavo e costi uguali alla riga dell'elenco)
const CM = RIGHE[2];
const FASI = [['Demolizioni', 6200, 6200], ['Murature e tramezzi', 14800, 13900], ['Serramenti', 12500, 12500], ['Pavimenti', 16400, 9800], ['Finiture', 9200, 1600], ['Spese tecniche', 9000, 7000]];
const VOCI = [['Contratto', 80000, ''], ['Variante V1', 6000, ''], ['Fattura SAL 1', 25800, 'Incassata'], ['Fattura SAL 2', 32200, 'Da incassare'], ['Saldo', 28000, 'Da fatturare']];
const inc = 43000, fat = 58000, dafat = CM.ricavo - fat;
const prev = FASI.reduce((s, f) => s + f[1], 0), spe = FASI.reduce((s, f) => s + f[2], 0), MAXF = Math.max(...FASI.map(f => f[1]));
// cassa cumulata della commessa (migliaia di €): solo consuntivo, pagato meno incassato
const CASSA_OP = [0, -6, -14, -24, -32, -13.2, -20.2, -8], PREV_OP = [-8];
// cassa impegnata su tutte le commesse (migliaia di €): solo consuntivo
const CASSA_P = [310, 345, 380, 420, 395, 412], PREV_P = [412];

const testa = crumb => `<div class="m-top"><span class="m-logo">HUBIQUE</span><span class="m-crumb">${crumb}</span><span class="m-tag">${ETI}</span></div>`;
const kpi = (l, v, s, cl = '') => `<div class="m-kpi ${cl}"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
const chip = s => `<span class="m-st st-${s.toLowerCase()}">${s}</span>`;

export function macro() {
  const mx = Math.max(...TIPI.map(t => t.margine));
  return `<div class="mock">${testa('Analytics › <b>Tutte le commesse · anno 2026</b>')}
  <div class="m-kpis">
    ${kpi('COMMESSE', T.n, APERTE + ' aperte · ' + (T.n - APERTE) + ' chiuse', 'hi')}
    ${kpi('MARGINE', eur(T.margine), 'su ' + eur(T.ricavo) + ' di ricavi')}
    ${kpi('MARGINE MEDIO', pct(T.mp), eur(T.medio) + ' per commessa')}
    ${kpi('CASSA IMPEGNATA', eur(T.cassa), 'oggi, su tutte le commesse')}
  </div>
  <div class="m-panel"><div class="m-fil"><span class="on">Tutte</span><span>Piccoli</span><span>Interni</span><span>Ristrutturazioni</span><span>Flipping</span><span>Immobiliari</span><em>1-5 di ${T.n}</em></div>
  <table class="m-tb"><thead><tr><th>Commessa</th><th>Tipo</th><th class="hn">Stato</th><th class="hn n">Ricavo</th><th class="n">Margine</th><th class="hn n">Margine %</th><th class="hn n">ROI</th><th class="hn n">Cassa impegnata</th></tr></thead><tbody>
  ${RIGHE.map(o => `<tr><td><b>${o.nome}</b> <small class="hn">${o.cod}</small></td><td>${chip(o.tipo)}</td><td class="hn">${o.stato}</td><td class="hn n">${eur(o.ricavo)}</td><td class="n">${eur(o.margine)}</td><td class="hn n">${pct(o.mp)}</td><td class="hn n">${o.roi ? pct(o.roiv) : '—'}</td><td class="hn n">${eur(o.cassa)}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="m-due">
    <div class="m-panel"><div class="m-h">MARGINE PER TIPO DI COMMESSA <small>Barra: margine. Tra parentesi: commesse.</small></div>
      ${TIPI.map(t => `<div class="m-fase t2"><span class="f">${t.t} <small>(${t.n})</small></span><span class="t"><b style="width:${t.margine / mx * 100}%;top:1px;bottom:1px"></b></span><span class="v">${eur(t.margine)} <small>${pct(t.mp)}</small></span></div>`).join('')}
    </div>
    <div class="m-panel"><div class="m-h">CASSA IMPEGNATA <small>Consuntivo dalla banca.</small></div><canvas data-g="cassaP"></canvas></div>
  </div></div>`;
}

export function dettaglio() {
  return `<div class="mock">${testa('Commesse › <b>Ristrutturazione ' + CM.nome + '</b> · ' + CM.cod + ' · in lavori, mese 7')}
  <div class="m-kpis k5">
    ${kpi('MARGINE ATTESO', eur(CM.margine), pct(CM.mp) + ' sul ricavo', 'hi')}
    ${kpi('RICAVO', eur(CM.ricavo), 'contratto più variante')}
    ${kpi('COSTI SPESI', eur(spe), 'su ' + eur(prev) + ' previsti')}
    ${kpi('FATTURATO', eur(fat), 'su ' + eur(CM.ricavo))}
    ${kpi('CASSA IMPEGNATA', eur(spe - inc), 'pagato meno incassato')}
  </div>
  <div class="m-det">
    <div class="m-col">
      <div class="m-panel"><div class="m-h">LAVORI · PREVISTO CONTRO SPESO PER FASE <small><i class="sw a"></i>Speso <i class="sw b"></i>Previsto</small></div>
        ${FASI.map(f => `<div class="m-fase"><span class="f">${f[0]}</span><span class="t"><i style="width:${f[1] / MAXF * 100}%"></i><b style="width:${f[2] / MAXF * 100}%"></b></span><span class="v">${eur(f[2])} <small>/ ${eur(f[1])}</small></span></div>`).join('')}
        <div class="m-sal"><span class="ok">SAL 1</span><span class="ok">SAL 2</span><span class="cur">SAL 3 in corso</span><span class="var">Variante V1: +6.000 € sul ricavo</span></div>
      </div>
      <div class="m-panel gr"><div class="m-h">CASSA DELLA COMMESSA <small>Consuntivo dalla banca.</small></div><canvas data-g="cassaO"></canvas></div>
    </div>
    <div class="m-panel"><div class="m-h">RICAVO CONTRO COSTI</div>
      <div class="m-stack"><i class="a" style="flex:${inc}"></i><i class="b" style="flex:${fat - inc}"></i><i class="c" style="flex:${dafat}"></i></div>
      <div class="m-leg"><span><i class="a"></i>Incassato ${eur(inc)}</span><span><i class="b"></i>Fatturato da incassare ${eur(fat - inc)}</span><span><i class="c"></i>Da fatturare ${eur(dafat)}</span></div>
      <table class="m-tb small"><tbody>${VOCI.map(u => `<tr><td>${u[0]}</td><td>${u[2] ? chip(u[2]) : ''}</td><td class="n">${eur(u[1])}</td></tr>`).join('')}</tbody></table>
      <div class="m-conto"><div><span>Ricavo</span><b>${eur(CM.ricavo)}</b></div><div><span>Costi previsti</span><b>${eur(CM.costo)}</b></div><div class="tot"><span>Margine atteso</span><b>${eur(CM.margine)}</b></div></div>
    </div>
  </div></div>`;
}

// ---------- grafici su canvas ----------
function prepara(c) {
  const r = c.parentElement.getBoundingClientRect(), W = c.clientWidth || c.offsetWidth, H = c.clientHeight || c.offsetHeight, d = Math.min(2.5, (devicePixelRatio || 1) * 1.5);
  c.width = W * d; c.height = H * d; const x = c.getContext('2d'); x.scale(d, d); return { x, W, H, r };
}
const f = (x, s) => x.font = s + ' -apple-system,"Helvetica Neue",Arial,sans-serif';
function linea(x, pts, dash) {
  x.setLineDash(dash ? [5, 4] : []); x.lineWidth = 2; x.lineJoin = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.setLineDash([]);
}
function griglia(x, W, H, l, r, t, b, y0, y1, passo, fmt) {
  f(x, '10px'); x.textBaseline = 'middle'; x.textAlign = 'right';
  for (let v = Math.ceil(y0 / passo) * passo; v <= y1; v += passo) {
    const y = t + (1 - (v - y0) / (y1 - y0)) * (H - t - b);
    x.strokeStyle = v === 0 ? 'rgba(44,51,51,.45)' : GRID; x.lineWidth = 1; x.beginPath(); x.moveTo(l, y); x.lineTo(W - r, y); x.stroke();
    x.fillStyle = MUT; x.fillText(fmt(v), l - 6, y);
  }
}
const GRAF = {
  cassaP(c) {
    const { x, W, H } = prepara(c), l = 58, r = 14, t = 10, b = 26, Y0 = 200, Y1 = 500, n = CASSA_P.length + PREV_P.length - 2;
    griglia(x, W, H, l, r, t, b, Y0, Y1, 100, v => v + ' k€');
    const px = i => l + i / n * (W - l - r), py = v => t + (1 - (v - Y0) / (Y1 - Y0)) * (H - t - b);
    const a = CASSA_P.map((v, i) => [px(i), py(v)]), o = PREV_P.map((v, i) => [px(i + CASSA_P.length - 1), py(v)]);
    x.strokeStyle = AZ; linea(x, a); linea(x, o, true);
    x.fillStyle = AZ; x.beginPath(); x.arc(a[a.length - 1][0], a[a.length - 1][1], 4, 0, 7); x.fill();
    f(x, '600 10.5px'); x.fillStyle = ANT; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText('OGGI', a[a.length - 1][0], a[a.length - 1][1] - 10);
    f(x, '10px'); x.fillStyle = MUT; x.textAlign = 'left'; x.fillText('−6 mesi', px(0), H - 8); x.textAlign = 'right'; x.fillText('oggi', px(n), H - 8);
  },
  cassaO(c) {
    const { x, W, H } = prepara(c), l = 58, r = 14, t = 8, b = 20, Y0 = -40, Y1 = 10, n = CASSA_OP.length + PREV_OP.length - 2;
    griglia(x, W, H, l, r, t, b, Y0, Y1, 10, v => v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v) + ' k€');
    const px = i => l + i / n * (W - l - r), py = v => t + (1 - (v - Y0) / (Y1 - Y0)) * (H - t - b);
    const a = CASSA_OP.map((v, i) => [px(i), py(v)]), o = PREV_OP.map((v, i) => [px(i + CASSA_OP.length - 1), py(v)]);
    x.strokeStyle = ANT; linea(x, a); x.strokeStyle = AZ; linea(x, o, true);
    const u = o[o.length - 1]; x.fillStyle = AZ; x.beginPath(); x.arc(u[0], u[1], 4, 0, 7); x.fill();
    f(x, '600 10.5px'); x.fillStyle = ANT; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; 
    x.textAlign = 'center'; x.fillStyle = ANT; 
    f(x, '10px'); x.fillStyle = MUT; x.fillText('Mese 1', px(1), H - 5); x.fillText('Mese 7', px(n) - 18, H - 5);
  },
};
export function disegna(root) { root.querySelectorAll('canvas[data-g]').forEach(c => GRAF[c.dataset.g](c)); }
