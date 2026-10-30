// Regia della presentazione: slide, navigazione, schermi flottanti, ingrandimento.
import { mostra, evidenzia, suSistema, SISTEMI, STATI } from './scene3d.js';
import { macro, dettaglio, disegna } from './cruscotti.js';

const M = 'media/';
const hex = c => '#' + c.toString(16).padStart(6, '0');
const r = (i) => `class="r" style="--i:${i}"`;
const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';

// schermo disegnato: interfaccia HTML dentro la cornice della base; clic = ingrandisci
function schermo(html, lab, spots) {
  return `<div class="stage ds s1"><div class="tilt"><div class="scr a" data-cap="${lab}">
    <span class="lab">${lab}</span>
    <div class="fr"><div class="fit">${html}</div><div class="gl"></div>
    ${spots.map((p, k) => `<span class="spot" data-n="${k + 1}" data-t="${p.t}" style="left:${p.x}%;top:${p.y}%"></span>`).join('')}</div>
  </div></div><div class="zoomhint">CLIC SULLO SCHERMO PER INGRANDIRLO</div></div>`;
}
const riga = (a, b, c) => `<div class="riga">${a}<b>${b}</b>${c ? `<span>${c}</span>` : ''}</div>`;

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'palazzo', off: 3.5, sc: .76, html: `
    <div class="in">
      <div class="kick r" style="--i:0">CRM · ECONOMATO · CANTIERI DA UFFICIO</div>
      <h1 class="r" style="--i:1">Proposta per<br><em>Etikasa Group</em></h1>
      <p class="lead r" style="--i:2">Dal piccolo intervento all'operazione immobiliare, tutti sullo stesso sistema: margini, KPI e processi di ogni commessa.</p>
      <div class="legend pe r" style="--i:3">${SISTEMI.map(k => `<button data-sys="${k}" style="--c:${hex(STATI[k].c)}"><i></i>${STATI[k].t}</button>`).join('')}</div>
      <div class="av r" style="--i:4">ALL'ATTENZIONE DELL'ING. GIUSEPPE VADALÀ</div>
    </div>
    <div class="hint">MUOVI IL MOUSE SULL'EDIFICIO · PASSA SUI PIANI · FRECCE PER AVANZARE</div>` },

  { id: 'esigenza', nome: 'Obiettivi', scena: 'ambient', bg: M + 'madama-cristina.jpg', o: .5, html: `
    <div class="in">
      <div class="kick r" style="--i:0">IL PUNTO DI PARTENZA</div>
      <h2 class="r" style="--i:1">Tre obiettivi,<br><em>un solo sistema</em></h2>
      <p class="lead r" style="--i:2">Su questi tre punti è costruito tutto il resto.</p>
    </div>
    <div class="probs tre">
      ${[['Vedere le varie marginalità', 'OGNI LAVORO È UNA COMMESSA'],
         ['Tenere d\'occhio i KPI, con viste macro e di dettaglio per commessa', 'VISTA MACRO · VISTA DI DETTAGLIO'],
         ['Avere una gestione dei processi fluida', 'DAL CONTATTO ALL\'ANALISI']]
        .map((p, i) => `<div class="prob r" style="--i:${i + 3}"><div class="num">${i + 1}</div><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join('')}
    </div>` },

  { id: 'operazione', nome: 'La commessa', scena: 'percorso', off: 3.35, sc: .72, html: `
    <div class="in">
      <div class="kick r" style="--i:0">COME LAVORA · LA COMMESSA</div>
      <h2 class="r" style="--i:1">Interni, ristrutturazioni, flipping, operazioni: <em>sempre una commessa</em></h2>
      <ol class="pts num">
        <li ${r(2)}><b>Richiesta o incarico</b>: qui si apre la commessa, con poca fatica anche per un lavoro da 3.000 €.</li>
        <li ${r(3)}><b>Preventivo</b>: con link al cliente.</li>
        <li ${r(4)}><b>Lavori, SAL e varianti</b>: i costi entrano fase per fase.</li>
        <li ${r(5)}><b>Fattura e incasso</b>: ricavi e banca sulla stessa commessa.</li>
        <li ${r(6)}><b>Margine</b>: di ogni commessa, piccola o grande.</li>
      </ol>
      <div class="note r" style="--i:7">ACQUISTO E VENDITA SI AGGIUNGONO SOLO NELLE OPERAZIONI IMMOBILIARI</div>
    </div>
    <div class="cap3 r" style="--i:8">PASSA SULLE TAPPE · CLIC PER RIVEDERE IL PERCORSO</div>` },

  { id: 'macro', nome: 'Vista macro', scena: 'ambient', html: `
    <div class="in corto">
      <div class="kick r" style="--i:0">COME LAVORA · MACRO</div>
      <h2 class="r" style="--i:1">Tutte le commesse, <em>su una pagina</em></h2>
      <ul class="pts">
        <li ${r(2)}><b>Numero di commesse, margine e cassa impegnata</b> sul totale dell'anno.</li>
        <li ${r(3)}><b>Margine per tipo di commessa</b>, dal piccolo intervento all'operazione immobiliare.</li>
        <li ${r(4)}>Da ogni riga si apre <b>il dettaglio della commessa</b>.</li>
      </ul>
      <div class="note r" style="--i:5">${ETI}</div>
    </div>
    ${schermo(macro(), 'CRUSCOTTO COMMESSE', [{ x: 23.5, y: 16, t: 'Numero di commesse dell\'anno, aperte e chiuse.' }, { x: 97.5, y: 16, t: 'Cassa impegnata oggi, il totale e commessa per commessa.' }, { x: 97.5, y: 46, t: 'L\'elenco si filtra per tipo. Il ROI compare solo sulle operazioni immobiliari.' }])}` },

  { id: 'dettaglio', nome: 'Vista di dettaglio', scena: 'ambient', html: `
    <div class="in corto">
      <div class="kick r" style="--i:0">COME LAVORA · DETTAGLIO</div>
      <h2 class="r" style="--i:1">Una ristrutturazione, <em>fase per fase</em></h2>
      <ul class="pts">
        <li ${r(2)}><b>Previsto contro speso</b>, per fase, con SAL e varianti.</li>
        <li ${r(3)}><b>Ricavo contro costi</b>: fatturato, incassato, da fatturare.</li>
        <li ${r(4)}><b>Margine</b> mentre i lavori sono in corso.</li>
      </ul>
      <div class="note r" style="--i:5">${ETI}</div>
    </div>
    ${schermo(dettaglio(), 'COMMESSA VIA CAMPIONE 27', [{ x: 37.5, y: 39, t: 'Ogni fase mostra lo speso sul previsto; varianti e SAL entrano qui.' }, { x: 97, y: 33, t: 'Ricavo della commessa: incassato, fatturato, da fatturare.' }, { x: 20, y: 83, t: 'La cassa della commessa: consuntivo dalla banca.' }])}` },

  { id: 'processi', nome: 'Processi fluidi', scena: 'processi', off: 3.3, sc: .82, html: `
    <div class="in">
      <div class="kick r" style="--i:0">COME LAVORA · PROCESSI</div>
      <h2 class="r" style="--i:1">Un solo sistema, <em>dal contatto all'analisi</em></h2>
      <ul class="pts">
        <li ${r(2)}>Dal contatto al <b>preventivo con link al cliente</b>.</li>
        <li ${r(3)}>Il <b>preventivo accettato si collega alla commessa</b>, senza ribattere i dati.</li>
        <li ${r(4)}><b>SAL, fattura e banca riconciliata</b> sulla stessa commessa.</li>
        <li ${r(5)}><b>Analytics</b> sempre allineati ai dati di tutti i giorni.</li>
        <li ${r(6)}><b>Un lavoro da 3.000 € chiede poca fatica</b>: creare una commessa piccola è rapido.</li>
        <li ${r(7)}><b>Con voi che approvate</b>: niente diventa definitivo da solo.</li>
      </ul>
    </div>
    <div class="cap3 r" style="--i:8">PASSA SULLE CARTE · CLIC PER RIVEDERE IL FLUSSO</div>` },

  { id: 'vantaggi', nome: 'Vantaggi', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">VANTAGGI</div>
      <h2 class="r" style="--i:1">Cosa cambia <em>in concreto</em></h2>
      <p class="lead r" style="--i:2">Niente percentuali promesse: i numeri veri li misuriamo insieme sui vostri dati.</p>
    </div>
    <div class="tiles">
      ${[['1', 'commessa', 'L\'avvio lo facciamo noi, su una commessa vera', 'A voi chiediamo solo i documenti della commessa.', [1, 0, 0]],
         ['1', 'conto', 'Ogni commessa ha il suo conto', 'Preventivo, lavori, fatture e cassa sullo stesso conto.', [1, 1, 0]],
         ['2', 'viste', 'Macro e dettaglio dicono la stessa cosa', 'Il totale dell\'anno e la singola commessa leggono gli stessi numeri.', [1, 1, 1]],
         ['', '', 'Il margine si legge durante i lavori', 'Previsto e speso, fase per fase: lo scostamento si vede dove nasce.', [1, 1, 1, 2]],
         ['', '', 'Un lavoro da 3.000 € chiede poca fatica', 'Creare una commessa piccola è rapido: anche i piccoli lavori hanno il loro margine.', [1, 1, 2]],
         ['', '', 'Niente diventa definitivo senza il vostro sì', 'Abbinamenti e proposte del sistema restano tali finché non le approvate.', [1, 2]]]
        .map((t, i) => `<div class="tile r" style="--i:${i + 2}">${t[0] !== '' ? `<div class="n">${t[0]}<small>${t[1].toUpperCase()}</small></div>` : `<div class="n" style="font-size:22px;color:var(--red)">◆</div>`}<h3>${t[2]}</h3><p>${t[3]}</p><div class="bar">${t[4].map(b => `<i class="${b === 1 ? 'k' : b === 2 ? 'x' : ''}"></i>`).join('')}</div></div>`).join('')}
    </div>` },

  { id: 'offerta', nome: 'Offerta economica', scena: 'ambient', html: `
    <div class="off">
      <div><div class="kick r" style="--i:0">OFFERTA ECONOMICA</div>
      <h2 class="r" style="--i:1">Primo anno: <em>3.500 € + IVA</em></h2></div>
      <div class="ofg">
        <div class="ofc r" style="--i:2"><h3>CANONE ANNUO</h3>
          <div class="pr">3.000 € <small>+ IVA · primo anno</small></div><div class="sub">Dal secondo anno 3.500 € + IVA</div>
          <ul>
            <li><b>CRM completo</b>: contatti, portafoglio immobili, trattative, preventivi, analytics.</li>
            <li><b>Economato</b>: tesoreria, banca, fatture, pagamenti, riconciliazione, commesse con margine, finanziamenti.</li>
            <li><b>Cantieri da ufficio</b>: avanzamento, SAL, varianti, unità.</li>
            <li><b>Viste commessa con KPI</b>, server, aggiornamenti, assistenza.</li>
          </ul>
          <div class="ex">Esclusi: rapportino a voce e app di cantiere.</div>
        </div>
        <div class="ofc r" style="--i:3"><h3>UNA TANTUM</h3>
          ${riga('Setup iniziale', '500 € <small>+ IVA</small>', 'Sempre previsto')}
          ${riga('Fit-out su misura', '1.500 € <small>+ IVA</small>', 'Facoltativo: importazione dati di banca e magazzino, riconciliazione con bilanci e prima nota, piccole personalizzazioni.')}
          ${riga('Versione web', 'Inclusa', '')}
          ${riga('In alternativa, installata sui vostri sistemi', '500 € <small>+ IVA</small>', 'Una tantum, più 500 € + IVA all\'anno')}
        </div>
        <div class="ofc tot r" style="--i:4"><h3>PROPOSTA</h3>
          <div class="pr">3.500 € <small>+ IVA · canone + setup</small></div><div class="sub">Con il Fit-out su misura 5.000 € + IVA</div>
          <ul>
            <li><b>50% di acconto</b> alla conferma, <b>50% a 30 giorni</b>.</li>
            <li><b>Pagamento</b>: bonifico bancario.</li>
          </ul>
          <div class="ex">OFFERTA VALIDA FINO AL 29/11/2026</div>
          <a class="acc pe" href="https://hubiqueerp.pages.dev/offerta/204a4e18-7ca0-4f70-9d49-9f2a4d0387a8" target="_blank" rel="noopener">VAI ALL'OFFERTA E ACCETTA →</a>
        </div>
      </div>
    </div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'finito', off: 3.5, sc: .74, html: `
    <div class="in">
      <div class="kick r" style="--i:0">PROSSIMO PASSO</div>
      <h2 class="r" style="--i:1">Scegliamo<br><em>la commessa pilota</em></h2>
      <ol class="passi">
        <li class="step r" style="--i:2"><i>01</i><span><b>Scegliete una commessa vera</b> da cui partire.</span></li>
        <li class="step r" style="--i:3"><i>02</i><span><b>L'avvio lo facciamo noi</b>, sui vostri dati.</span></li>
        <li class="step r" style="--i:4"><i>03</i><span><b>Misuriamo insieme</b> i numeri veri.</span></li>
      </ol>
      <div class="azioni r" style="--i:5">
        <a class="acc pe" href="https://hubiqueerp.pages.dev/offerta/204a4e18-7ca0-4f70-9d49-9f2a4d0387a8" target="_blank" rel="noopener">VAI ALL'OFFERTA E ACCETTA →</a>
        <div class="demo"><a class="acc2 pe" href="https://hubique-demo.vercel.app" target="_blank" rel="noopener">PROVA LA DEMO DEL SISTEMA →</a><span>Accesso: utente Demo, password 1234</span></div>
        <p>Ambiente dimostrativo con dati fittizi di un'azienda di impianti. Il CRM, compreso nell'offerta, non è visibile in questa demo.</p>
      </div>
      <div class="contact r" style="--i:6"><div class="mk">HQ</div><div><div class="who">Michele Campagnoni</div><div class="role">AMMINISTRATORE DELEGATO · HUBIQUE</div><a class="pe" href="mailto:m.campagnoni@hubique.it">m.campagnoni@hubique.it</a><a class="pe" href="tel:+393282588293">+39 3282588293</a></div></div>
    </div>` },
];

// ---------- costruzione ----------
const deck = document.getElementById('deck'), dots = document.getElementById('dots');
SLIDES.forEach((s, i) => {
  const el = document.createElement('section'); el.className = 'slide'; el.id = 's-' + s.id; el.innerHTML = s.html; deck.appendChild(el); s.el = el;
  const b = document.createElement('button'); b.innerHTML = `<span>${String(i + 1).padStart(2, '0')} ${s.nome.toUpperCase()}</span>`; b.title = s.nome; b.onclick = () => vai(i); dots.appendChild(b);
});

// legenda tipi di commessa (slide 1) sincronizzata con la scena
function legenda(active) { document.querySelectorAll('.legend button').forEach(b => b.classList.toggle('on', b.dataset.sys === active)); }
document.querySelectorAll('.legend button').forEach(b => {
  b.onmouseenter = () => { evidenzia(b.dataset.sys); legenda(b.dataset.sys); };
  b.onmouseleave = () => evidenzia(null);
  b.onclick = () => { evidenzia(b.dataset.sys); legenda(b.dataset.sys); };
});

// schermi: inclinazione col mouse, punti con spiegazione, clic = ingrandisci
const tip = document.getElementById('tip'), lb = document.getElementById('lb');
addEventListener('pointermove', e => {
  const s = SLIDES[cur]; if (!s) return;
  const t = s.el.querySelector('.tilt'); if (!t) return;
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  t.style.setProperty('--ry', (-6 + x * 10).toFixed(2) + 'deg'); t.style.setProperty('--rx', (3 - y * 6).toFixed(2) + 'deg');
});
document.querySelectorAll('.spot').forEach(sp => {
  sp.onmouseenter = () => { tip.innerHTML = `<b>PUNTO ${sp.dataset.n}</b>${sp.dataset.t}`; tip.classList.add('on'); };
  sp.onmouseleave = () => tip.classList.remove('on');
});
const lbm = lb.querySelector('.lbm');
document.querySelectorAll('.scr').forEach(sc => sc.onclick = () => {
  const c = sc.querySelector('.mock').cloneNode(true), stretta = c.classList.contains('st');
  c.style.transform = 'none'; lbm.replaceChildren(c);
  lb.classList.add('m', 'on'); lb.querySelector('figcaption').textContent = sc.dataset.cap + ' · ' + ETI; tip.classList.remove('on');
  const W = stretta ? 420 : 960; c.style.height = ''; const H = stretta ? c.scrollHeight : 600, s = Math.min(innerWidth * .92 / W, innerHeight * .82 / H);
  lbm.style.width = W * s + 'px'; lbm.style.height = H * s + 'px'; c.style.transform = `scale(${s})`; disegna(c);
});
lb.onclick = () => lb.classList.remove('on');

// le interfacce disegnate hanno misure fisse e si scalano per stare nello spazio; su telefono si ricompongono in colonna
function adatta() {
  const stretta = innerWidth <= 900 || innerWidth / innerHeight <= 1;
  document.querySelectorAll('.fit').forEach(f => {
    const m = f.querySelector('.mock'), st = f.closest('.stage'); m.classList.toggle('st', stretta); m.style.transform = 'none'; m.style.height = '';
    const W = stretta ? 420 : 960, H = stretta ? m.scrollHeight : 600, s = stretta ? f.clientWidth / W : Math.min(f.clientWidth / W, (st.clientHeight - 14) / H);
    m.style.transform = `scale(${s})`; f.style.height = H * s + 'px'; f.style.width = stretta ? '' : W * s + 'px';
    disegna(m);
  });
}
addEventListener('resize', adatta);

// fondo con l'immagine della slide (due livelli in dissolvenza)
const bgA = document.getElementById('bgA'), bgB = document.getElementById('bgB'); let bgFront = bgA, bgUrl = null;
function sfondo(url, o) {
  if (url === bgUrl) return; bgUrl = url;
  const next = bgFront === bgA ? bgB : bgA;
  if (url) { next.style.backgroundImage = `url("${url}")`; next.style.setProperty('--o', o); next.classList.add('on'); }
  bgFront.classList.remove('on'); bgFront = next; if (!url) next.classList.remove('on');
}

// su schermi stretti le scene con molto testo restano solo come fondo spento
function stretto() { const n = innerWidth <= 900 || innerWidth / innerHeight <= 1; document.body.classList.toggle('no3d', n && ['percorso', 'processi', 'finito'].includes(SLIDES[cur].scena)); }
addEventListener('resize', () => cur >= 0 && stretto());

// ---------- navigazione ----------
let cur = -1; const count = document.getElementById('count'), bar = document.getElementById('bar');
function vai(n) {
  n = Math.max(0, Math.min(SLIDES.length - 1, n)); if (n === cur) return;
  const first = cur < 0;
  if (SLIDES[cur]) SLIDES[cur].el.classList.remove('on');
  cur = n; const s = SLIDES[n];
  s.el.querySelectorAll('.r').forEach(x => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; });
  s.el.classList.add('on'); s.el.scrollTop = 0;
  mostra(s.scena, { offsetX: s.off || 0, scale: s.sc || 1, snap: first });
  if (s.scena === 'palazzo') suSistema(legenda);
  stretto();
  sfondo(s.bg || null, s.o || .4);
  lb.classList.remove('on'); tip.classList.remove('on');
  count.textContent = String(n + 1).padStart(2, '0') + ' / ' + SLIDES.length;
  bar.style.width = ((n + 1) / SLIDES.length * 100) + '%';
  dots.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === n));
  history.replaceState(null, '', '#' + (n + 1));
}
addEventListener('keydown', e => {
  if (e.key === 'Escape') { lb.classList.remove('on'); return; }
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); vai(cur + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); vai(cur - 1); }
  if (e.key === 'Home') vai(0); if (e.key === 'End') vai(SLIDES.length - 1);
  if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});
let wheelLock = 0;
addEventListener('wheel', e => {
  if (lb.classList.contains('on')) return;
  const sl = SLIDES[cur].el; if (sl.scrollHeight > sl.clientHeight + 4) return; // su schermi stretti la slide scorre
  const now = Date.now(); if (now < wheelLock || Math.abs(e.deltaY) < 18) return; wheelLock = now + 900; vai(cur + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });
let tx = null; addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) vai(cur + (dx < 0 ? 1 : -1)); tx = null; });
document.getElementById('prev').onclick = () => vai(cur - 1);
document.getElementById('next').onclick = () => vai(cur + 1);

document.fonts.load('700 40px "Chakra Petch"').catch(() => { }).then(() => { adatta(); vai(Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)); });
