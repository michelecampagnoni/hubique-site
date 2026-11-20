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

const OFF = 'https://hubiqueerp.pages.dev/offerta/a10ced94-78c8-4dfc-ae36-c31786a7f4f5';
const riga = (a, b, c) => `<div class="riga">${a}<b>${b}</b>${c ? `<span>${c}</span>` : ''}</div>`;

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'centrale', off: 3.5, sc: .82, html: `
    <div class="in">
      <div class="kick r" style="--i:0">PROPOSTA PER TERMOTECH S.R.L. · GROSSETO</div>
      <h1 class="r" style="--i:1">RealHub per le imprese di <em>impiantistica</em></h1>
      <p class="lead r" style="--i:2">Dalla pianta DWG al preventivo, dal cantiere al margine di commessa: computo, listini, DDT, fatture e banca in un solo sistema.</p>
      <div class="legend pe r" style="--i:3">${SISTEMI.map(k => `<button data-sys="${k}" style="--c:${hex(SYS[k].c)}"><i></i>${SYS[k].t}</button>`).join('')}</div>
      <div class="av r" style="--i:4">ALL'ATTENZIONE DI RICCARDO GRECHI</div>
    </div>
    <div class="hint">MUOVI IL MOUSE SULLA CENTRALE · PASSA SUGLI IMPIANTI · FRECCE PER AVANZARE</div>` },

  { id: 'obiettivi', nome: 'Obiettivi', scena: 'ambient', bg: M + 'f1.jpg', o: .5, html: `
    <div class="in">
      <div class="kick r" style="--i:0">GLI OBIETTIVI</div>
      <h2 class="r" style="--i:1">Quattro obiettivi,<br><em>un solo sistema</em></h2>
      <p class="lead r" style="--i:2">Su questi punti è costruita la proposta.</p>
    </div>
    <div class="probs tre">
      ${[['Preventivi più rapidi, partendo dalla pianta', 'PIANTA DWG · COMPUTO · PREVENTIVO'],
         ['Quantità corrette, impianto per impianto', 'IDRICO · RISCALDAMENTO · CLIMATIZZAZIONE · VENTILAZIONE'],
         ['Margine sotto controllo, dal preventivo alla commessa chiusa', 'LISTINI · DDT · FATTURE · BANCA'],
         ['Avvio con i vostri dati', 'LISTINI, ANAGRAFICHE E LAVORI IN CORSO']]
        .map((p, i) => `<div class="prob r" style="--i:${i + 3}"><div class="num">${i + 1}</div><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join('')}
    </div>` },

  { id: 'moduli', nome: 'Cosa comprende', scena: 'ambient', bg: M + 'f7.jpg', o: .22, html: `
    <div class="in">
      <div class="kick r" style="--i:0">REALHUB · COSA COMPRENDE</div>
      <h2 class="r" style="--i:1">Un solo sistema, <em>dal contatto al margine</em></h2>
      <p class="lead r" style="--i:2">Versione web, su un'istanza dedicata a voi. Tutti i moduli sono compresi nel canone.</p>
    </div>
    <div class="tiles sette">
      ${[['CRM', 'Contatti e trattative', 'Preventivi con link al cliente e analytics delle vendite.'],
         ['COMPUTO', 'Dalla pianta DWG', 'Computo e preventivo per impianto, con margine modificabile riga per riga.'],
         ['CANTIERI', 'Commesse in corso', 'Avanzamento, SAL, varianti e margine di ogni commessa.'],
         ['ECONOMATO', 'Fatture e banca', 'Pagamenti, riconciliazione bancaria e tesoreria.'],
         ['MAGAZZINO', 'DDT, giacenze, listini', 'Bolle proposte dalla foto per la verifica, materiale per furgone e cantiere, listini dei fornitori.'],
         ['GARE', 'Richieste d\'offerta', 'Offerte dei fornitori a confronto, prezzo aggiudicato come controllo.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 3}"><div class="n" style="font-size:clamp(15px,1.25vw,21px);letter-spacing:.12em">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p></div>`).join('')}
    </div>` },

  { id: 'progetto', nome: 'Dalla pianta', scena: 'progetto', off: 3.15, sc: .82, kn: .7, bg: M + 'f4.jpg', o: .12, html: `
    <div class="in">
      <div class="kick r" style="--i:0">COME LAVORA · DALLA PIANTA AL PREVENTIVO</div>
      <h2 class="r" style="--i:1">Dalla pianta DWG <em>al preventivo con link</em></h2>
      <ol class="pts num">
        <li ${r(2)}><b>Pianta DWG</b>: il sistema propone locali, superfici e percorsi, voi li verificate.</li>
        <li ${r(3)}><b>Computo per impianto</b>: idrico, riscaldamento, climatizzazione, ventilazione, con le quantità proposte dalla pianta.</li>
        <li ${r(4)}><b>Prezzi</b> dai listini dei vostri fornitori.</li>
        <li ${r(5)}><b>Margine</b> riga per riga: lo vedete solo voi.</li>
        <li ${r(6)}><b>Preventivo con link</b>: il cliente lo vede e lo accetta online.</li>
      </ol>
      <div class="note r" style="--i:7">REGOLE DEI VOSTRI IMPIANTI E PREZZARIO REGIONALE: CONFIGURATI SUL VOSTRO CASO NEL SETUP GOLD</div>
    </div>
    <div class="cap3 r" style="--i:8">PASSA SUI DOCUMENTI · CLIC PER RIVEDERE IL PERCORSO</div>` },

  { id: 'preventivo', nome: 'Prezzi e margine', scena: 'ambient', html: `
    <div class="in">
      <div class="kick r" style="--i:0">COME LAVORA · COMPUTO E PREVENTIVO</div>
      <h2 class="r" style="--i:1">Quantità dalla pianta, <em>margine riga per riga</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il sistema propone il computo dalla pianta: <b>locali, superfici e percorsi</b>. Voi verificate e correggete le quantità.</li>
        <li ${r(3)}>Ogni voce prende il prezzo dai <b>listini dei vostri fornitori</b>; il prezzario regionale si può caricare nel Setup Gold.</li>
        <li ${r(4)}>Il <b>margine</b> si imposta su ogni riga e non compare mai al cliente.</li>
        <li ${r(5)}>Il preventivo va al cliente <b>a voci, a corpo o per ambiente</b>, con un link per accettarlo.</li>
      </ul>
      <div class="note r" style="--i:6">ESEMPIO DIMOSTRATIVO · DATI FITTIZI</div>
    </div>
    ${screens([
      { src: 'esempio_preventivo.png', lab: 'PREVENTIVO · ESEMPIO DIMOSTRATIVO', spots: [{ x: 61, y: 33, t: 'Margine modificabile su ogni riga: il prezzo si ricalcola.' }, { x: 90, y: 26, t: 'La vista del cliente: a voci, a corpo o per ambiente. Margine e costi non compaiono.' }] },
      { src: 'esempio_computo.png', lab: 'COMPUTO DALLA PIANTA · ESEMPIO DIMOSTRATIVO' }])}` },

  { id: 'commessa', nome: 'Commessa', scena: 'ambient', bg: M + 'f5.jpg', o: .25, html: `
    <div class="in">
      <div class="kick r" style="--i:0">CANTIERI E COMMESSE</div>
      <h2 class="r" style="--i:1">Il margine reale, <em>mentre i lavori sono in corso</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il preventivo accettato diventa <b>la commessa</b>: avanzamento, SAL e varianti.</li>
        <li ${r(3)}>Fatture emesse e ricevute, incassi e pagamenti dalla banca, ore del personale: <b>sulla stessa pagina</b>.</li>
        <li ${r(4)}>Margine di cassa e margine di competenza, <b>sempre aggiornati</b>.</li>
      </ul>
      <div class="note r" style="--i:8">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_projects_C25-031.png', lab: 'COMMESSA C25-031' },
      { src: 'economics_projects.png', lab: 'TUTTE LE COMMESSE' }])}` },
  { id: 'cuore', nome: 'Il collegamento', scena: 'carte', off: 3.05, sc: .8, kn: .6, bg: M + 'f3.jpg', o: .14, html: `
    <div class="in">
      <div class="kick r" style="--i:0">ECONOMATO · IL COLLEGAMENTO</div>
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
      <div class="kick r" style="--i:0">DDT · CONTROLLI</div>
      <h2 class="r" style="--i:1">Dalla foto della bolla, <em>una proposta da verificare</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il tecnico fotografa il DDT <b>in cantiere o in magazzino</b>.</li>
        <li ${r(3)}>Fornitore, righe, quantità e prezzi vengono proposti per la verifica e, confermati da voi, collegati a <b>commessa, magazzino, listino e fattura</b>.</li>
        <li ${r(4)}>Il controllo DDT-fatture mostra <b>il denaro in gioco</b>: prezzi sopra listino, bolle non fatturate, resi senza nota di credito.</li>
      </ul>
      <div class="note r" style="--i:5">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_ddt_18554-B.png', lab: 'SCHEDA DDT 18554/B · CONFERMATA', spots: [{ x: 96, y: 37, t: 'Circolatore fatturato 170,24 € contro 152,00 € di listino, su 6 pezzi: 109,44 € in gioco.' }, { x: 90, y: 80, t: 'Il PDF o la foto originale resta allegato al DDT.' }] },
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
      <h2 class="r" style="--i:1">Listini dei fornitori, <em>prezzi a confronto</em></h2>
      <ul class="pts">
        <li ${r(2)}>Il listino si carica come vi arriva: righe, sconti e condizioni vengono <b>proposti e abbinati agli articoli</b>. I formati dei vostri fornitori si configurano nel Setup Gold.</li>
        <li ${r(3)}>Prima di entrare in archivio <b>lo rivedete voi</b>.</li>
        <li ${r(4)}>Sullo stesso articolo, <b>chi è il fornitore migliore</b> e quanto si risparmierebbe sui carichi reali.</li>
      </ul>
      <div class="note r" style="--i:5">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_listini_confronto_oggi.png', lab: 'CONFRONTO PREZZI TRA FORNITORI', spots: [{ x: 77, y: 47, t: 'Risparmio calcolato sui carichi degli ultimi 12 mesi.' }] },
      { src: 'economics_listini_import_vera.png', lab: 'LISTINO PROPOSTO · DA RIVEDERE', spots: [{ x: 34, y: 34, t: '72 righe proposte: 66 abbinate ad articoli esistenti, 6 nuove. Entrano in archivio solo dopo la vostra conferma.' }] }])}` },

  { id: 'gare', nome: 'Gare', scena: 'ambient', bg: M + 'f2.jpg', o: .2, html: `
    <div class="in">
      <div class="kick r" style="--i:0">GARE TRA FORNITORI</div>
      <h2 class="r" style="--i:1">Gara per commessa. <em>Il prezzo aggiudicato fa da controllo.</em></h2>
      <ul class="pts">
        <li ${r(2)}>Dalla commessa nasce la <b>richiesta d'offerta</b>: righe, cantiere, consegna, pagamento.</li>
        <li ${r(3)}>Le offerte dei fornitori vengono proposte per la verifica e messe a confronto: <b>migliore complessivo e migliore per riga</b>.</li>
        <li ${r(4)}>Il prezzo aggiudicato diventa <b>il listino della commessa</b>: bolle e fatture vengono controllate su quello.</li>
        <li ${r(5)}>Nessuna mail parte da sola.</li>
      </ul>
      <div class="note r" style="--i:6">SCHERMATE DELLA DEMO · DATI DIMOSTRATIVI</div>
    </div>
    ${screens([
      { src: 'economics_rdo_001_confronto_vera.png', lab: 'GARA RDO-2026-001 · AGGIUDICATA', spots: [{ x: 97, y: 26, t: 'Listino di commessa attivo: DDT e fatture di questa commessa vengono controllati su questi prezzi.' }] },
      { src: 'economics_rdo_002_confronto_vera.png', lab: 'GARA RDO-2026-002 · IN VALUTAZIONE' },
      { src: 'economics_rdo.png', lab: 'GARE FORNITORI' }])}` },


  { id: 'vantaggi', nome: 'Vantaggi', scena: 'ambient', bg: M + 'f6.jpg', o: .14, html: `
    <div class="in">
      <div class="kick r" style="--i:0">VANTAGGI</div>
      <h2 class="r" style="--i:1">Cosa cambia <em>in concreto</em></h2>
      <p class="lead r" style="--i:2">Niente percentuali promesse: i numeri veri li misuriamo insieme sui vostri lavori, nei primi mesi.</p>
    </div>
    <div class="tiles">
      ${[['', '', 'Un solo sistema per computo, preventivi, commesse, fatture e banca', 'Tutto si legge nello stesso posto, sugli stessi dati.', [1, 0, 0]],
         ['', '', 'Il computo parte dalla pianta', 'Il sistema propone locali, superfici e percorsi dal DWG; voi verificate invece di ricontare.', [1, 1, 0]],
         ['', '', 'Fatture e DDT confrontati riga per riga', 'Quantità, prezzi e resi: il sistema segnala le differenze, voi decidete.', [1, 1, 1]],
         ['', '', 'Il margine si vede durante i lavori', 'Dal preventivo alla commessa chiusa: c\'è ancora tempo per correggere.', [1, 1, 1, 2]],
         ['', '', 'I prezzi concordati vengono verificati', 'Listini e gare aggiudicate diventano il metro per ogni fattura.', [1, 1, 2]],
         ['', '', 'Niente diventa definitivo senza il vostro sì', 'Quantità, abbinamenti e preventivi restano proposte finché non li approvate.', [1, 2]]]
        .map((t, i) => `<div class="tile r" style="--i:${i + 2}">${t[0] !== '' ? `<div class="n">${t[0]}<small>${t[1].toUpperCase()}</small></div>` : `<div class="n" style="font-size:22px;color:var(--red)">◆</div>`}<h3>${t[2]}</h3><p>${t[3]}</p><div class="bar">${t[4].map(b => `<i class="${b === 1 ? 'k' : b === 2 ? 'x' : ''}"></i>`).join('')}</div></div>`).join('')}
    </div>` },

  { id: 'offerta', nome: 'Offerta economica', scena: 'ambient', html: `
    <div class="off">
      <div><div class="kick r" style="--i:0">OFFERTA ECONOMICA</div></div>
      <div class="ofg">
        <div class="ofc r" style="--i:2"><h3>CANONE ANNUO</h3>
          <div class="pr">3.000 € <small>+ IVA all'anno</small></div><div class="sub">RealHub per le imprese di impiantistica · versione web, istanza dedicata</div>
          <ul>
            <li><b>CRM</b>: contatti, trattative, preventivi con link al cliente, analytics.</li>
            <li><b>Computo e preventivo da pianta DWG</b>, con margine modificabile riga per riga.</li>
            <li><b>Cantieri e commesse</b>: avanzamento, SAL, varianti, margine per commessa.</li>
            <li><b>Economato</b>: fatture, banca, pagamenti, riconciliazione, tesoreria.</li>
            <li><b>DDT, magazzino e listini</b> dei fornitori; <b>gare</b>.</li>
            <li><b>Server, aggiornamenti, assistenza.</b></li>
          </ul>
          <div class="ex">Non compresi: Kit AI, rapportini a voce, app di cantiere.</div>
        </div>
        <div class="ofc r" style="--i:3"><h3>SETUP GOLD · UNA TANTUM</h3>
          <div class="pr">1.500 € <small>+ IVA</small></div>
          ${riga('Configurazione', 'Inclusa', 'Utenti, ruoli, regole di impianto, listini.')}
          ${riga('Importazione dati storici', 'Inclusa', 'Anagrafiche, listini, preventivi e commesse in corso, saldi.')}
          ${riga('Interfaccia con i vostri sistemi', 'Inclusa', 'Il gestionale o la contabilità che usate oggi.')}
          ${riga('Formazione', 'Inclusa', '')}
          <div class="ex">Oltre il perimetro: 250 € + IVA a giornata, solo su vostra approvazione.</div>
        </div>
      </div>
      <div class="cond r" style="--i:4">
        <p><b>Pagamento</b>: 50% alla conferma, 50% a 30 giorni, bonifico bancario · <b>Offerta valida fino al 20/12/2026</b></p>
        <a class="acc pe" href="${OFF}" target="_blank" rel="noopener">VEDI E CONFERMA L'OFFERTA →</a>
      </div>
    </div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'finale', off: 3.7, sc: .74, html: `
    <div class="in">
      <div class="kick r" style="--i:0">PROSSIMO PASSO</div>
      <h2 class="r" style="--i:1">Partiamo<br><em>da una vostra pianta</em></h2>
      <ol class="passi">
        <li class="step r" style="--i:2"><i>01</i><span><b>Confermate l'offerta</b> dal link.</span></li>
        <li class="step r" style="--i:3"><i>02</i><span><b>Setup Gold</b>: carichiamo listini, anagrafiche e lavori in corso e configuriamo le regole dei vostri impianti.</span></li>
        <li class="step r" style="--i:4"><i>03</i><span><b>Primo preventivo insieme</b>, su una vostra pianta vera.</span></li>
      </ol>
      <div class="azioni r" style="--i:5">
        <a class="acc pe" href="${OFF}" target="_blank" rel="noopener">VEDI E CONFERMA L'OFFERTA →</a>
      </div>
      <div class="contact r" style="--i:6"><div class="mk">HQ</div><div><div class="who">Michele Campagnoni</div><div class="role">CEO · HUBIQUE</div><a class="pe" href="mailto:m.campagnoni@hubique.it">m.campagnoni@hubique.it</a><a class="pe" href="tel:+393282588293">+39 328 2588293</a></div></div>
    </div>` },
];

// ---------- costruzione ----------
const deck = document.getElementById('deck'), dots = document.getElementById('dots');
SLIDES.forEach((s, i) => {
  const el = document.createElement('section'); el.className = 'slide'; el.id = 's-' + s.id; el.innerHTML = s.html; deck.appendChild(el); s.el = el;
  if (s.scena !== 'ambient') { // schermi stretti: finestra libera nel testo dove si vede la scena 3D
    const v = document.createElement('div'); v.className = 'spazio3d'; const dove = ['centrale', 'finale'].includes(s.scena) ? null : el.querySelector('.in h2');
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
  lb.querySelector('img').src = sc.dataset.src; lb.querySelector('figcaption').textContent = sc.dataset.cap.includes('ESEMPIO') ? sc.dataset.cap : sc.dataset.cap + ' · DATI DIMOSTRATIVI'; lb.classList.add('on'); tip.classList.remove('on');
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
  if (s.scena === 'centrale') suSistema(legenda);
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
