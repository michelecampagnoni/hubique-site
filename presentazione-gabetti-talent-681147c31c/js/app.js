// Regia della presentazione HubAgency per la rete Gabetti: slide, navigazione.
import { mostra } from './scene3d.js';

const M = 'media/';
const r = (i) => `class="r" style="--i:${i}"`;
const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';
const DEMO = {
  conti: 'https://hubique.it/hubagency-conti-agenzia-90eb5a71/',
  sito: 'https://hubique.it/hubagency-sito-d3741808/',
  dossier: 'https://hubique.it/hubagency-dossier-2c7315fc/',
  arreda: 'https://hubique.it/hubagency-arreda-a103ff50/',
  ristruttura: 'https://hubique.it/hubagency-dossier-2c7315fc/dossier.html',
  talent: 'https://hubique.it/gabetti-talent-e9b5519e/#/ats/cassetti?come=franchisor',
  talentPipe: 'https://hubique.it/gabetti-talent-e9b5519e/#/ats/pipeline?come=franchisor',
  talentAnnunci: 'https://hubique.it/gabetti-talent-e9b5519e/#/annunci?come=franchisor',
  talentForm: 'https://hubique.it/gabetti-talent-e9b5519e/#/formazione?come=agente',
  talentGioco: 'https://hubique.it/gabetti-talent-e9b5519e/#/allenamento?come=agente',
  talentRete: 'https://hubique.it/gabetti-talent-e9b5519e/#/cruscotto?come=franchisor',
};
const host = u => u.replace(/^https:\/\//, '').replace(/[#?].*$/, '').replace(/\/[^/]*\.html$/, '').replace(/\/$/, '');

// una slide per demo: cosa fa, tre vantaggi, schermata, pulsante
function demo({ n, kick, titolo, em, cosa, vant, nota, url, img, alt, eti = ETI }) {
  return `
    <div class="in demo-t">
      <div class="kick r" style="--i:0">Demo ${n} di 6 · ${kick}</div>
      <h2 class="r" style="--i:1">${titolo} <em>${em}</em></h2>
      <p class="lead r" style="--i:2">${cosa}</p>
      <ul class="vant">
        ${vant.map((v, i) => `<li ${r(i + 3)}><i class="${v[0] === 'Gabetti' ? 'gb' : ''}">${v[0]}</i><span>${v[1]}</span></li>`).join('')}
      </ul>
      <div class="azioni r" style="--i:6"><a class="apri pe" href="${url}" target="_blank" rel="noopener">Apri la demo <span aria-hidden="true">&#8599;</span></a></div>
      <p class="nota r" style="--i:7">${nota}</p>
    </div>
    <a class="shot r pe" style="--i:3" href="${url}" target="_blank" rel="noopener" aria-label="Apri la demo ${kick}">
      <span class="barra"><i></i><i></i><i></i><b class="lab">${host(url).replace(/-[0-9a-f]{8}$/, "")}</b></span>
      <img src="${M}${img}" alt="${alt}">
      <span class="eti">${eti}</span>
    </a>`;
}

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'italia', off: 2.5, offY: -3.6, kStretto: .62, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Proposta Hubique · Rete Gabetti</div>
      <h1 class="r" style="--i:1">Gabetti Talent: <em>selezione e formazione per tutta la rete</em></h1>
      <div class="av r" style="--i:2">
        <span>Alla cortese attenzione di</span>
        <b>Marco Speretta</b><small>Amministratore Delegato, Gruppo Gabetti</small>
        <b>Alessio Parisi</b><small>Project Manager, Tree Re Srl</small>
      </div>
    </div>
    <div class="hint">Passa sulle agenzie · Frecce per avanzare · Punti generici, a scopo illustrativo</div>` },

  { id: 'obiettivi', nome: 'Obiettivi', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Le persone della rete</div>
      <h2 class="r" style="--i:1">Tre obiettivi, <em>un solo strumento</em></h2>
      <ol class="obi">
        ${[['Le persone giuste, più in fretta', 'Profili per ruolo, questionari mirati, annunci su tutti i portali.'],
           ['Una formazione uguale in tutta la rete', 'Percorsi assegnati dalla direzione, costruiti sulle lacune di ognuno.'],
           ['Competenze che non si perdono', 'Pochi minuti di allenamento ogni giorno, come un gioco.']]
          .map((p, i) => `<li ${r(i + 2)}><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></li>`).join('')}
      </ol>
    </div>` },

  { id: 'talent-cassetti', nome: 'Profili', scena: 'ambient', html: demo({
    n: 1, kick: `il candidato giusto`, titolo: `Ogni ruolo,`, em: `le sue competenze`,
    cosa: `Per ogni posizione (agente junior e senior, acquisitore, segreteria, consulente mutui) si costruisce il profilo del candidato ideale aprendo solo i «cassetti» che servono: 24 questionari brevi, ognuno su una sola competenza, 14 di comportamento (negoziazione, controllo emotivo, gestione del rifiuto…) e 10 di mestiere (normativa, valutazione, strumenti digitali). Per ogni cassetto si sceglie peso e livello atteso.`,
    vant: [['Agenzia', `Un agente e una segretaria non si misurano con lo stesso test.`], ['Agenzia', `Profili già pronti per i ruoli tipici, modificabili.`], ['Gabetti', `Un metodo di selezione unico per tutta la rete.`]],
    nota: `Questionari scritti in collaborazione con uno psicometrista certificato. Nessun test clinico: misurano competenze e preferenze di lavoro.`, url: DEMO.talent, img: 'demo-t-cassetti.jpg', alt: `Catalogo dei cassetti di Gabetti Talent` }) },

  { id: 'talent-pipeline', nome: 'Selezione', scena: 'ambient', html: demo({
    n: 2, kick: `la selezione`, titolo: `Dal questionario del candidato`, em: `alla scelta del titolare`,
    cosa: `Il candidato riceve un link e risponde da qualsiasi dispositivo, telefono, tablet o computer, alle domande dei soli cassetti del suo profilo, dopo informativa e consenso. Il punteggio, calcolato con regole fisse dalle risposte, arriva come proposta interna: per ogni competenza il valore contro il livello atteso e la spiegazione. Il titolare sposta i candidati tra le colonne, li confronta, corregge un punteggio con una nota: tutto resta nel registro delle decisioni.`,
    vant: [['Agenzia', `Meno colloqui a vuoto: si incontra chi ha il profilo.`], ['Agenzia', `Si vede subito dove la persona è forte e dove va formata.`], ['Gabetti', `Tempi e qualità delle assunzioni misurati agenzia per agenzia.`]],
    nota: `La piattaforma suggerisce, decide sempre una persona. Nessuno scarto automatico.`, url: DEMO.talentPipe, img: 'demo-t-pipeline.jpg', alt: `Pipeline dei candidati di un'agenzia` }) },

  { id: 'talent-annunci', nome: 'Annunci', scena: 'ambient', html: demo({
    n: 3, kick: `gli annunci`, titolo: `L'annuncio di lavoro`, em: `nasce dal profilo`,
    cosa: `L'annuncio si scrive da solo partendo dal profilo a cassetti della posizione; si può riscrivere con un tono diverso e si vede l'anteprima per Indeed, LinkedIn, InfoJobs, Subito Lavoro e la pagina «Lavora con noi». Per ogni ricerca si segue lo stato su ogni portale. I file per Google for Jobs e il feed Indeed sono reali e scaricabili.`,
    vant: [['Agenzia', `Un annuncio fatto bene in un minuto, su tutti i portali.`], ['Agenzia', `Le candidature entrano già nella pipeline giusta.`], ['Gabetti', `Annunci con lo stesso stile e lo stesso marchio in tutta la rete.`]],
    nota: `Nella demo la pubblicazione sui portali è simulata: nessun annuncio esce davvero.`, url: DEMO.talentAnnunci, img: 'demo-t-annunci.jpg', alt: `Annunci di lavoro con lo stato per portale` }) },

  { id: 'talent-formazione', nome: 'Formazione', scena: 'ambient', html: demo({
    n: 4, kick: `la formazione`, titolo: `La formazione parte`, em: `dove serve davvero`,
    cosa: `Il nuovo assunto trova un percorso di inserimento costruito sui cassetti rimasti sotto il livello atteso nel questionario d'ingresso. Corsi brevi (inserimento in rete, acquisizione, normativa e antiriciclaggio, privacy, uso di HubAgency), lezioni di pochi minuti, quiz e attestato. La direzione assegna i percorsi obbligatori con scadenza, l'agenzia aggiunge i suoi.`,
    vant: [['Agenzia', `Il nuovo agente è operativo prima.`], ['Agenzia', `Formazione obbligatoria tracciata, con attestati.`], ['Gabetti', `Stessi contenuti e stesso livello in tutte le agenzie.`]],
    nota: `Contenuti dei corsi d'esempio, da far rivedere ai formatori della rete.`, url: DEMO.talentForm, img: 'demo-t-formazione.jpg', alt: `La mia formazione, vista dell'agente` }) },

  { id: 'talent-gioco', nome: 'Allenamento', scena: 'ambient', html: demo({
    n: 5, kick: `l'allenamento`, titolo: `Quattro minuti al giorno,`, em: `come un gioco`,
    cosa: `Ogni giorno cinque case da vendere in un quartiere 3D: ogni casa è una domanda su quello che si è studiato, si risponde bene e compare il cartello VENDUTO. Le domande sbagliate tornano nei giorni dopo finché non sono imparate. Giorni di fila, punti, livelli e badge; in modalità immersiva si cammina nel quartiere col telefono. Leghe a squadre e sfide tra agenzie.`,
    vant: [['Agenzia', `Quello che si impara in aula non si perde.`], ['Agenzia', `Un'abitudine quotidiana, non un corso una volta l'anno.`], ['Gabetti', `Sfide di rete che uniscono le agenzie.`]],
    nota: `La classifica di rete la accende o la spegne la direzione.`, url: DEMO.talentGioco, img: 'demo-t-allenamento.jpg', alt: `Allenamento di oggi: cinque case da vendere` }) },

  { id: 'talent-rete', nome: 'Cruscotto', scena: 'ambient', html: demo({
    n: 6, kick: `la vista di Gabetti`, titolo: `Tutta la rete`, em: `in un cruscotto`,
    cosa: `La direzione vede ricerche aperte, candidati in selezione, tempo medio di assunzione, formazione completata e chi si è allenato questa settimana. L'imbuto della selezione dice dove si perdono i candidati; le agenzie più attive e quelle da seguire compaiono da sole, con il motivo.`,
    vant: [['Gabetti', `Si interviene sulle agenzie ferme prima che sia tardi.`], ['Gabetti', `Selezione e formazione misurate con gli stessi numeri.`], ['Agenzia', `Ogni agenzia vede solo i suoi dati.`]],
    nota: `Dati della demo inventati su 12 agenzie dimostrative.`, url: DEMO.talentRete, img: 'demo-t-cruscotto.jpg', alt: `Cruscotto della rete` }) },

  { id: 'vantaggi', nome: 'Vantaggi per Gabetti', scena: 'ambient', html: `
    <div class="in stretta">
      <div class="kick r" style="--i:0">In sintesi</div>
      <h2 class="r" style="--i:1">I vantaggi <em>per Gabetti</em></h2>
      <p class="lead r" style="--i:2">Selezione, formazione e allenamento in un solo strumento, con lo stesso accesso di HubAgency.</p>
    </div>
    <div class="tiles">
      ${[['Un metodo unico di selezione', 'Gli stessi profili e gli stessi questionari in tutte le agenzie.'],
         ['Meno colloqui a vuoto', 'Si incontra chi ha già il profilo giusto.'],
         ['Annunci coerenti con il marchio', 'Su tutti i portali, scritti dal profilo della posizione.'],
         ['Nuovi agenti operativi prima', 'Inserimento costruito sulle lacune emerse in selezione.'],
         ['Formazione obbligatoria tracciata', 'Percorsi con scadenza e attestati, agenzia per agenzia.'],
         ['La rete sotto controllo', 'Cruscotto con ricerche, assunzioni, formazione e allenamento.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 3}"><i>${i + 1}</i><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join('')}
    </div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in lungo">
      <div class="kick r" style="--i:0">Prossimo passo</div>
      <h2 class="r" style="--i:1">Una prova <em>con alcune agenzie della rete</em></h2>
      <p class="lead r" style="--i:2">Scegliamo insieme i ruoli da cercare, i corsi da mettere nel catalogo e le agenzie con cui partire.</p>
      <div class="contact r" style="--i:3">
        <div class="who">Michele Campagnoni</div><div class="role">Amministratore Delegato · Hubique</div>
        <div class="cc"><a class="pe" href="mailto:m.campagnoni@hubique.it">m.campagnoni@hubique.it</a><a class="pe" href="tel:+393282588293">+39 3282588293</a></div>
        <div class="leg">Hubique S.r.l. · Via Ennio 6A, 20137 Milano · P.IVA 12588200969</div>
      </div>
    </div>` },

];

// ---------- costruzione ----------
const deck = document.getElementById('deck'), dots = document.getElementById('dots');
SLIDES.forEach((s, i) => {
  const el = document.createElement('section'); el.className = 'slide'; el.id = 's-' + s.id; el.innerHTML = s.html; deck.appendChild(el); s.el = el;
  const b = document.createElement('button'); b.innerHTML = `<span>${s.nome}</span>`; b.title = s.nome; b.setAttribute('aria-label', s.nome); b.onclick = () => vai(i); dots.appendChild(b);
});

// ---------- navigazione ----------
let cur = -1; const count = document.getElementById('count'), bar = document.getElementById('bar'), tip = document.getElementById('tip');
function vai(n) {
  n = Math.max(0, Math.min(SLIDES.length - 1, n)); if (n === cur) return;
  const first = cur < 0;
  if (SLIDES[cur]) SLIDES[cur].el.classList.remove('on');
  cur = n; const s = SLIDES[n];
  s.el.querySelectorAll('.r').forEach(x => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; });
  s.el.classList.add('on'); s.el.scrollTop = 0;
  mostra(s.scena, { offsetX: s.off || 0, scale: s.sc || 1, snap: first, offY: s.offY, kStretto: s.kStretto });
  tip.classList.remove('on');
  count.textContent = String(n + 1).padStart(2, '0') + ' / ' + String(SLIDES.length).padStart(2, '0');
  bar.style.width = ((n + 1) / SLIDES.length * 100) + '%';
  dots.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === n));
  history.replaceState(null, '', '#' + (n + 1));
}
addEventListener('keydown', e => {
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); vai(cur + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); vai(cur - 1); }
  if (e.key === 'Home') vai(0); if (e.key === 'End') vai(SLIDES.length - 1);
  if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});
let wheelLock = 0;
addEventListener('wheel', e => {
  const sl = SLIDES[cur].el; if (sl.scrollHeight > sl.clientHeight + 4) return; // su schermi stretti la slide scorre
  const now = Date.now(); if (now < wheelLock || Math.abs(e.deltaY) < 18) return; wheelLock = now + 900; vai(cur + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });
let tx = null; addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) vai(cur + (dx < 0 ? 1 : -1)); tx = null; });
document.getElementById('prev').onclick = () => vai(cur - 1);
document.getElementById('next').onclick = () => vai(cur + 1);

Promise.all(['300 60px Jost', '400 18px Jost', '500 18px Jost'].map(f => document.fonts.load(f, 'Aa€'))).catch(() => { }).then(() => vai(Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)));
