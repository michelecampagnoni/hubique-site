// Regia della presentazione: slide, navigazione, schermi flottanti, ingrandimento.
import { mostra, evidenzia, suSistema, centra3d, SISTEMI, SYS } from './scene3d.js';

const M = 'media/', SC = 'media/schermate/';
const hex = c => '#' + c.toString(16).padStart(6, '0');
const r = (i) => `class="r" style="--i:${i}"`;

// schermi flottanti: a = davanti, b e c dietro; clic = ingrandisci
function screens(list) {
  return `<div class="stage s${list.length}"><div class="tilt">${list.map((s, i) => `
    <div class="scr ${'abc'[i]}${i ? ' back' : ''}" data-src="${SC + s.src}" data-cap="${s.lab}">
      <span class="lab">${s.lab}</span>
      <div class="fr"><img src="${SC + s.src}" alt="${s.lab}" loading="eager" decoding="async"><div class="gl"></div>
      ${(s.spots || []).map((p, k) => `<span class="spot" data-n="${k + 1}" data-t="${p.t}" style="left:${p.x}%;top:${p.y}%"></span>`).join('')}</div>
    </div>`).join('')}</div><div class="zoomhint">CLIC SU UNO SCHERMO PER INGRANDIRLO</div></div>`;
}
const ico = {
  ddt: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5h16l6 6v24H9z"/><path d="M25 5v6h6M14 17h12M14 22h12M14 27h7"/><path d="M27 29l3 3 5-6" stroke="#ff5a1f"/></svg>',
  fatt: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="6" width="20" height="26"/><rect x="13" y="10" width="20" height="26" fill="#fff"/><path d="M17 17h12M17 22h12M17 27h8"/></svg>',
  banca: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15L20 7l14 8z"/><path d="M10 17v11M17 17v11M24 17v11M31 17v11M6 32h28"/></svg>',
  marg: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 32h28"/><path d="M9 26l7-7 6 5 10-12"/><path d="M27 12h5v5"/><circle cx="31" cy="30" r="0" /></svg>',
  list: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 8h24v24H8z"/><path d="M13 15h8M13 20h14M13 25h10"/><path d="M27 13l4 4M31 13l-4 4" stroke="#ff5a1f"/></svg>',
};

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'edificio', off: 3.0, sc: .86, html: `
    <div class="in">
      <div class="kick r" style="--i:0">IMPIANTI IDRAULICI · GAS · ELETTRICI</div>
      <h1 class="r" style="--i:1">L'AI per le imprese<br>di <em>impiantistica</em></h1>
      <p class="lead r" style="--i:2">RELAY collega pagamenti, banca, fatture e bolle. Dal cantiere al margine di commessa, in un solo sistema, per chi lavora nella filiera del real estate.</p>
      <div class="legend pe r" style="--i:3">${SISTEMI.map(k => `<button data-sys="${k}" style="--c:${hex(SYS[k].c)}"><i></i>${SYS[k].t}</button>`).join('')}</div>
    </div>
    <div class="hint">MUOVI IL MOUSE SULL'EDIFICIO · PASSA SUGLI IMPIANTI · FRECCE PER AVANZARE</div>` },

  { id: 'problema', nome: 'Il problema', scena: 'ambient', bg: M + 'cantiere.jpg', o: .42, html: `
    <div class="in">
      <div class="kick r" style="--i:0">OGGI</div>
      <h2 class="r" style="--i:1">Cinque punti dove il lavoro <em>si spezza</em></h2>
      <p class="lead r" style="--i:2">Ogni giorno, tra cantieri, magazzino e ufficio. Le informazioni ci sono, ma stanno in posti diversi.</p>
    </div>
    <div class="probs">
      ${[[ico.ddt, 'DDT di carta dai cantieri', 'Arrivano in ufficio giorni dopo, a volte non arrivano. Vanno ricopiati a mano.'],
         [ico.fatt, 'Fatture riepilogative del grossista', 'Dieci bolle in una fattura: da spuntare riga per riga, prezzo per prezzo.'],
         [ico.banca, 'Bonifici da abbinare', 'L\'estratto conto da una parte, le fatture e le scadenze dall\'altra.'],
         [ico.marg, 'Margine scoperto a fine lavori', 'Quando la commessa è chiusa e non si può più correggere niente.'],
         [ico.list, 'Listini che cambiano', 'Il prezzo concordato non è sempre quello che arriva in fattura.']]
        .map((p, i) => `<div class="prob r" style="--i:${i + 2}"><div class="ic">${p[0]}</div><h3>${p[1]}</h3><p>${p[2]}</p></div>`).join('')}
    </div>` },

  { id: 'cuore', nome: 'Il collegamento', scena: 'carte', off: 3.05, sc: .8, kn: .6, bg: M + 'riconciliazione.jpg', o: .16, html: `
    <div class="in">
      <div class="kick r" style="--i:0">IL CUORE DI RELAY</div>
      <h2 class="r" style="--i:1">Previsto, banca, fattura, DDT: <em>un solo collegamento</em></h2>
      <ol class="pts num">
        <li ${r(2)}><b>Il pagamento previsto</b> nasce da scadenze, contratti e ordini, e aspetta il suo movimento.</li>
        <li ${r(3)}><b>Il movimento in banca</b> arriva: il sistema propone la fattura e la scadenza giuste.</li>
        <li ${r(4)}><b>La fattura si apre sulle sue bolle</b>: ogni DDT, ogni riga, ogni prezzo.</li>
        <li ${r(5)}><b>Diventa definitivo solo quando lo approvate voi.</b></li>
      </ol>
    </div>
    <div class="cap3 r" style="--i:6">PASSA SULLE CARTE · CLIC PER RIVEDERE IL COLLEGAMENTO</div>
    <div class="mini r" style="--i:7"><div class="scr" data-src="${SC}economics_reconciliation.png" data-cap="RICONCILIAZIONE BANCARIA"><span class="lab">RICONCILIAZIONE BANCARIA · DEMO</span><div class="fr"><img src="${SC}economics_reconciliation.png" alt="Riconciliazione bancaria"><div class="gl"></div><span class="spot" data-n="1" data-t="Abbinamenti proposti dal motore di riconciliazione: diventano definitivi solo quando li approvate." style="left:80%;top:14%"></span></div></div></div>` },

  { id: 'ddt', nome: 'DDT', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">DDT DA FOTO · CONTROLLI</div>
      <h2 class="r" style="--i:1">Una foto della bolla. <em>Il resto lo legge il sistema.</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il tecnico fotografa il DDT <b>in cantiere o in magazzino</b>.</li>
        <li ${r(3)}>Fornitore, righe, quantità e prezzi vengono letti e collegati a <b>commessa, magazzino, listino e fattura</b>.</li>
        <li ${r(4)}>Il controllo DDT-fatture mostra <b>il denaro in gioco</b>: prezzi sopra listino, bolle non fatturate, resi senza nota di credito.</li>
      </ul>
      <div class="note r" style="--i:5">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_ddt_18554-B.png', lab: 'SCHEDA DDT 18554/B · LETTA DALLA FOTO', spots: [{ x: 96, y: 37, t: 'Circolatore fatturato 170,24 € contro 152,00 € di listino: 109,44 € in gioco.' }, { x: 90, y: 80, t: 'Il PDF o la foto originale resta allegato al DDT.' }] },
      { src: 'economics_ddt_controlli.png', lab: 'CONTROLLI DDT-FATTURE', spots: [{ x: 38, y: 22, t: 'Il totale del denaro in gioco tra DDT e fatture.' }] },
      { src: 'economics_ddt_ricevuti.png', lab: 'DDT RICEVUTI' }])}` },

  { id: 'magazzino', nome: 'Magazzino', scena: 'ambient', bg: M + 'magazzino.jpg', o: .3, html: `
    <div class="in">
      <div class="kick r" style="--i:0">MAGAZZINO</div>
      <h2 class="r" style="--i:1">Magazzino centrale, <em>furgoni, cantieri</em></h2>
      <ul class="pts">
        <li ${r(2)}>Ogni carico da DDT entra in giacenza <b>al costo medio</b>, senza ribattere niente.</li>
        <li ${r(3)}>Trasferimenti verso furgoni e cantieri: <b>si sa dove sta il materiale e quanto vale</b>.</li>
        <li ${r(4)}>Sotto scorta e materiale fermo da 90 giorni, <b>in evidenza</b>.</li>
      </ul>
      <div class="note r" style="--i:5">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_magazzino.png', lab: 'MAGAZZINO · CRUSCOTTO', spots: [{ x: 77, y: 27, t: 'Materiale fermo da più di 90 giorni, valorizzato.' }] },
      { src: 'economics_magazzino_posizioni_oggi.png', lab: 'POSIZIONI · MAGAZZINO, FURGONI, CANTIERI' }])}` },

  { id: 'listini', nome: 'Listini', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">LISTINI DEI FORNITORI</div>
      <h2 class="r" style="--i:1">Listini letti in automatico, <em>prezzi a confronto</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il listino si carica così com'è, <b>anche in PDF o scansione</b>: righe, sconti e condizioni vengono letti e abbinati agli articoli.</li>
        <li ${r(3)}>Prima di entrare in archivio <b>lo rivedete voi</b>.</li>
        <li ${r(4)}>Sullo stesso articolo, <b>chi è il fornitore migliore</b> e quanto si risparmierebbe sui carichi reali.</li>
      </ul>
      <div class="note r" style="--i:5">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_listini_confronto_oggi.png', lab: 'CONFRONTO PREZZI TRA FORNITORI', spots: [{ x: 77, y: 47, t: 'Risparmio calcolato sui carichi degli ultimi 12 mesi.' }] },
      { src: 'economics_listini_import_vera.png', lab: 'LISTINO LETTO · DA RIVEDERE', spots: [{ x: 34, y: 34, t: '72 righe lette, 66 abbinate ad articoli esistenti, 6 nuove.' }] }])}` },

  { id: 'gare', nome: 'Gare', scena: 'ambient', bg: M + 'centrale.jpg', o: .22, html: `
    <div class="in">
      <div class="kick r" style="--i:0">GARE TRA FORNITORI</div>
      <h2 class="r" style="--i:1">Gara per commessa. <em>Il prezzo aggiudicato fa da controllo.</em></h2>
      <ul class="pts">
        <li ${r(2)}>Dalla commessa nasce la <b>richiesta d'offerta</b>: righe, cantiere, consegna, pagamento.</li>
        <li ${r(3)}>Le offerte vengono lette e messe a confronto: <b>migliore complessivo e migliore per riga</b>.</li>
        <li ${r(4)}>Il prezzo aggiudicato diventa <b>il listino della commessa</b>: bolle e fatture vengono controllate su quello.</li>
        <li ${r(5)}>Nessuna mail parte da sola.</li>
      </ul>
      <div class="note r" style="--i:6">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_rdo_001_confronto_vera.png', lab: 'GARA RDO-2026-001 · AGGIUDICATA', spots: [{ x: 97, y: 26, t: 'Listino di commessa attivo: DDT e fatture di questa commessa vengono controllati su questi prezzi.' }] },
      { src: 'economics_rdo_002_confronto_vera.png', lab: 'GARA RDO-2026-002 · IN VALUTAZIONE' },
      { src: 'economics_rdo.png', lab: 'GARE FORNITORI' }])}` },

  { id: 'commessa', nome: 'Commessa', scena: 'ambient', bg: M + 'edificio.jpg', o: .25, html: `
    <div class="in">
      <div class="kick r" style="--i:0">COMMESSA</div>
      <h2 class="r" style="--i:1">Il margine reale, <em>mentre i lavori sono in corso</em></h2>
      <ul class="pts">
        <li ${r(2)}>Fatture emesse e ricevute, incassi e pagamenti dalla banca, ore del personale: <b>sulla stessa pagina</b>.</li>
        <li ${r(3)}>Margine di cassa e margine di competenza, <b>sempre aggiornati</b>.</li>
      </ul>
      <div class="kpis">
        <div class="kpi r" style="--i:4"><div class="l">FATTURATO</div><div class="v cnt" data-v="66600">66.600 €</div><div class="s">2 fatture</div></div>
        <div class="kpi kr r" style="--i:5"><div class="l">COSTI</div><div class="v cnt" data-v="44171">44.171 €</div><div class="s">fatture + personale</div></div>
        <div class="kpi g r" style="--i:6"><div class="l">MARGINE DI COMPETENZA</div><div class="v cnt" data-v="22345">22.345 €</div><div class="s">34% del fatturato</div></div>
      </div>
      <div class="note r" style="--i:7">ESEMPIO DIMOSTRATIVO · COMMESSA C25-031</div>
    </div>
    ${screens([
      { src: 'economics_projects_C25-031.png', lab: 'COMMESSA C25-031', spots: [{ x: 97, y: 30, t: 'Margine reale di cassa: incassato meno pagato.' }, { x: 34, y: 45, t: 'Margine di competenza: fatturato meno costi, personale compreso.' }] },
      { src: 'economics_projects.png', lab: 'TUTTE LE COMMESSE' }])}` },

  { id: 'vantaggi', nome: 'Vantaggi', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">IN CONCRETO</div>
      <h2 class="r" style="--i:1">Cosa cambia <em>in ufficio</em></h2>
      <p class="lead r" style="--i:2">Niente percentuali promesse: i numeri veri li misuriamo insieme sui vostri dati, nei primi mesi.</p>
    </div>
    <div class="tiles">
      ${[['1', 'schermata', 'Una sola schermata invece di tre programmi', 'Banca, fatture, magazzino e commesse si leggono nello stesso posto.', [1, 0, 0]],
         ['0', 'spunte a mano', 'Il controllo fattura-DDT lo fa il sistema', 'Quantità, prezzi e resi confrontati riga per riga. A voi restano le eccezioni.', [1, 1, 0]],
         ['1', 'commessa', 'Ogni bolla finisce sulla commessa giusta', 'Il materiale del cantiere si somma ai costi del cantiere, non al mucchio.', [1, 1, 1]],
         ['', '', 'Il margine si vede durante i lavori', 'Non a commessa chiusa: c\'è ancora tempo per correggere.', [1, 1, 1, 2]],
         ['', '', 'I prezzi concordati vengono verificati', 'Listini e gare aggiudicate diventano il metro per ogni fattura.', [1, 1, 2]],
         ['', '', 'Niente diventa definitivo senza il vostro sì', 'Abbinamenti, listini e gare restano proposte finché non le approvate.', [1, 2]]]
        .map((t, i) => `<div class="tile r" style="--i:${i + 2}">${t[0] !== '' ? `<div class="n">${t[0]}<small>${t[1].toUpperCase()}</small></div>` : `<div class="n" style="font-size:22px;color:var(--red)">◆</div>`}<h3>${t[2]}</h3><p>${t[3]}</p><div class="bar">${t[4].map(b => `<i class="${b === 1 ? 'k' : b === 2 ? 'x' : ''}"></i>`).join('')}</div></div>`).join('')}
    </div>` },

  { id: 'progetto', nome: 'Dal progetto', scena: 'progetto', off: 3.15, sc: .82, kn: .7, bg: M + 'edificio.jpg', o: .12, html: `
    <div class="in">
      <div class="kick r" style="--i:0">DAL DISEGNO ALL'OFFERTA</div>
      <h2 class="r" style="--i:1">Dal DWG, con listini e specifiche, <em>una bozza di computo e offerta</em></h2>
      <ol class="pts num">
        <li ${r(2)}>Dalla planimetria in <b>DWG</b> il sistema legge locali, superfici, perimetri e blocchi.</li>
        <li ${r(3)}>Con <b>i vostri listini e le specifiche del progetto</b> prepara le voci del computo metrico.</li>
        <li ${r(4)}>Compone una bozza di <b>offerta tecnico-commerciale</b> da rivedere.</li>
        <li ${r(5)}><b>La controllate e la correggete voi</b>: niente parte senza il vostro sì.</li>
      </ol>
      <div class="note r" style="--i:6">FUNZIONE IN DIMOSTRAZIONE · DA PROVARE SUI VOSTRI DISEGNI</div>
    </div>
    <div class="cap3 r" style="--i:7">PASSA SUI DOCUMENTI · CLIC PER RIVEDERE IL PERCORSO</div>` },
  { id: 'soluzioni', nome: 'Tutte le soluzioni', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">AI INTEGRATION TOOLS</div>
      <h2 class="r" style="--i:1">Non solo i conti: <em>tutte le soluzioni</em></h2>
      <p class="lead r" style="--i:2">Sette strumenti AI che si integrano con quello che avete già. L'AI propone, voi decidete.</p>
    </div>
    <div class="tiles sette">
      ${[['Brain Kit', "Cosa sa l'azienda?", 'Mail, documenti e note in una sola memoria, con la fonte di ogni risposta.'],
         ['Scout Kit', 'Nel mercato, chi c\'è?', 'Trova general contractor, developer e amministratori. Per ogni azienda, un dossier.'],
         ['Skill Kit', 'Come lavora la tua azienda?', 'Procedure e metodi diventano competenze scritte in chiaro, sempre consultabili.'],
         ['Voice Kit', 'E tutto questo, come si usa?', 'Gli parli come a un collega, anche dal telefono, anche dal cantiere.'],
         ['Inbound Kit', 'Un cliente scrive. Chi risponde?', 'Ogni richiesta dal sito e dalla posta riceve la risposta giusta, da approvare.'],
         ['Fin Kit', 'E i conti, tornano?', 'Fatture, banca, DDT e commesse: è il cuore di RELAY.'],
         ['Task Kit', 'Cosa faccio adesso?', 'Attività e stime in agenda, attorno ai tuoi appuntamenti.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 2}"><div class="n" style="font-size:clamp(17px,1.4vw,23px)">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p></div>`).join('')}
    </div>` },
  { id: 'chiusura', nome: 'Il sistema è vostro', scena: 'istanza', off: 3.5, sc: .82, bg: M + 'centrale.jpg', o: .16, html: `
    <div class="in">
      <div class="kick r" style="--i:0">CLOUD O IN SEDE</div>
      <h2 class="r" style="--i:1">Cloud o installato da voi: <em>il sistema è vostro</em></h2>
      <div class="deploy">
        <div class="dep r" style="--i:2"><h3>CLOUD DEDICATO</h3><p>Un'istanza solo per voi, su un server dedicato e gestito da noi.</p></div>
        <div class="dep r" style="--i:3"><h3>INSTALLATO DA VOI</h3><p>Sui vostri server, nella vostra rete. Stesse funzioni.</p></div>
      </div>
      <div class="same r" style="--i:4">In entrambi i casi un'<b>istanza unica e dedicata</b>, non una piattaforma condivisa con altri clienti. I dati sono vostri ed esportabili quando volete.</div>
      <div class="same r" style="--i:5;margin-top:10px"><a href="https://demo.realhub.it/richiedi-demo?da=presentazione-impiantistica" target="_blank" rel="noopener"><b>Richiedi una demo:</b></a> ricevi subito gli accessi e prova il gestionale con dati dimostrativi.</div><div class="contact r" style="--i:6"><div class="mk">HQ</div><div><div class="who">Michele Campagnoni</div><div class="role">CEO · HUBIQUE</div><a class="pe" href="mailto:m.campagnoni@hubique.it">m.campagnoni@hubique.it</a></div></div>
    </div>` },
];

// ---------- costruzione ----------
const deck = document.getElementById('deck'), dots = document.getElementById('dots');
SLIDES.forEach((s, i) => {
  const el = document.createElement('section'); el.className = 'slide'; el.id = 's-' + s.id; el.innerHTML = s.html; deck.appendChild(el); s.el = el;
  if (s.scena !== 'ambient') { // schermi stretti: finestra libera nel testo dove si vede la scena 3D
    const v = document.createElement('div'); v.className = 'spazio3d'; const dove = s.scena === 'edificio' ? null : el.querySelector('.in h2');
    if (dove) dove.after(v); else el.querySelector('.in').appendChild(v);
  }
  el.addEventListener('scroll', () => { if (s === SLIDES[cur]) scorri3d(); }, { passive: true });
  const b = document.createElement('button'); b.innerHTML = `<span>${String(i + 1).padStart(2, '0')} ${s.nome.toUpperCase()}</span>`; b.title = s.nome; b.onclick = () => vai(i); dots.appendChild(b);
});

// legenda impianti (slide 1) sincronizzata con la scena
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
document.querySelectorAll('.scr').forEach(sc => sc.onclick = () => {
  lb.querySelector('img').src = sc.dataset.src; lb.querySelector('figcaption').textContent = sc.dataset.cap + ' · DATI DIMOSTRATIVI'; lb.classList.add('on'); tip.classList.remove('on');
});
lb.onclick = () => lb.classList.remove('on');

// fondo con l'immagine della slide (due livelli in dissolvenza)
const bgA = document.getElementById('bgA'), bgB = document.getElementById('bgB'); let bgFront = bgA, bgUrl = null;
function sfondo(url, o) {
  if (url === bgUrl) return; bgUrl = url;
  const next = bgFront === bgA ? bgB : bgA;
  if (url) { next.style.backgroundImage = `url("${url}")`; next.style.setProperty('--o', o); next.classList.add('on'); }
  bgFront.classList.remove('on'); bgFront = next; if (!url) next.classList.remove('on');
}

// numeri che contano
function conta(el) {
  el.querySelectorAll('.cnt').forEach(c => { const v = +c.dataset.v; const t0 = performance.now();
    const step = () => { const k = Math.min(1, (performance.now() - t0) / 1400); c.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))).toLocaleString('it-IT') + ' €'; if (k < 1) requestAnimationFrame(step); };
    setTimeout(step, 700); });
}

// su schermi stretti la scena 3D sta nella sua finestra dentro al testo e scorre con la slide
const gl = document.getElementById('gl');
const stringe = () => innerWidth <= 900 || innerWidth / innerHeight <= 1;
let centroY = null;
function scorri3d() { gl.style.transform = centroY === null ? '' : `translateY(${centroY - innerHeight / 2 - SLIDES[cur].el.scrollTop}px)`; }
function stretto() {
  const v = SLIDES[cur].el.querySelector('.spazio3d'); let y = null;
  if (stringe() && v) { y = v.offsetHeight / 2; for (let e = v; e && e !== SLIDES[cur].el; e = e.offsetParent) y += e.offsetTop; }
  centroY = y; centra3d(y); scorri3d();
}
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
  mostra(s.scena, { offsetX: s.off || 0, scale: s.sc || 1, kn: s.kn, snap: first });
  if (s.scena === 'edificio') suSistema(legenda);
  stretto();
  sfondo(s.bg || null, s.o || .4); conta(s.el);
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

document.fonts.load('700 40px "Chakra Petch"').catch(() => { }).then(() => vai(Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)));
