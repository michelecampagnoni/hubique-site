// Regia della presentazione HubAgency per la rete Gabetti: slide, navigazione.
import { mostra } from './scene3d.js';

const M = 'media/';
const r = (i) => `class="r" style="--i:${i}"`;
const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';
const DEMO = {
  conti: 'https://hubique.it/hubagency-conti-agenzia-90eb5a71/',
  sito: 'https://hubagency-sito-anteprima.vercel.app',
  dossier: 'https://hubagency-casa3d.vercel.app',
  arreda: 'https://arreda-demo.vercel.app',
};
const host = u => u.replace(/^https:\/\//, '').replace(/\/$/, '');

// una slide per demo: cosa fa, tre vantaggi, schermata, pulsante
function demo({ n, kick, titolo, em, cosa, vant, nota, url, img, alt, eti = ETI }) {
  return `
    <div class="in demo-t">
      <div class="kick r" style="--i:0">Demo ${n} di 4 · ${kick}</div>
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
      <h1 class="r" style="--i:1">HubAgency per la rete Gabetti: <em>strumenti che lavorano per l'agenzia</em></h1>
      <div class="av r" style="--i:2">
        <span>Alla cortese attenzione di</span>
        <b>Alessio Parisi</b><small>Project Manager, Tree Re Srl</small>
        <b>Marco Speretta</b><small>Amministratore Delegato, Gruppo Gabetti</small>
      </div>
    </div>
    <div class="hint">Passa sulle agenzie · Frecce per avanzare · Punti generici, a scopo illustrativo</div>` },

  { id: 'obiettivi', nome: 'Obiettivi', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Gli obiettivi della rete</div>
      <h2 class="r" style="--i:1">Quattro obiettivi, <em>emersi dal confronto con Tree Re</em></h2>
      <ol class="obi">
        ${[['Una rete più produttiva', 'Strumenti che fanno risparmiare tempo all\'agenzia e portano contatti.'],
           ['Strumenti che gli agenti usano davvero', 'Pochi passaggi, risultato subito visibile.'],
           ['Pochi fornitori, nessun doppione', 'Servizi mirati, accanto a quelli che la rete ha già.'],
           ['Servizi a consumo per gli agenti', 'Ogni agenzia attiva quello che le serve.']]
          .map((p, i) => `<li ${r(i + 2)}><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></li>`).join('')}
      </ol>
    </div>` },

  { id: 'conti', nome: 'Conti Agenzia', scena: 'ambient', html: demo({
    n: 1, kick: 'Conti Agenzia', titolo: 'Il mese dell\'agenzia,', em: 'in una schermata',
    cosa: 'Cosa è entrato, cosa è uscito, cosa resta e quali incassi arrivano nei prossimi 60 giorni. Dalle trattative alla previsione, fino alle provvigioni degli agenti.',
    vant: [['Agenzia', 'Sa quanto guadagna davvero ogni mese.'], ['Agenzia', 'Vede quali trattative rendono e quali fanno perdere tempo.'], ['Gabetti', 'Conti letti con gli stessi criteri in tutta la rete.']],
    nota: 'Il collegamento ai gestionali della rete è da definire insieme a Gabetti.', url: DEMO.conti, img: 'demo-conti.jpg', alt: 'Conti Agenzia, schermata «Il mio mese»' }) },

  { id: 'sito', nome: 'Il tuo sito in un\'ora', scena: 'ambient', html: demo({
    n: 2, kick: 'Il tuo sito in un\'ora', titolo: 'Il sito dell\'agenzia,', em: 'fatto dall\'agente',
    cosa: 'L\'agente sceglie uno dei 30 modelli e cambia solo testi, foto, colore e logo. Gli annunci entrano nel sito con un interruttore, come per i portali.',
    vant: [['Agenzia', 'Un sito proprio, senza webmaster.'], ['Agenzia', 'Annunci sempre allineati, senza doppio lavoro.'], ['Gabetti', 'Un\'immagine coerente della rete, sito per sito.']],
    nota: 'Anteprima dimostrativa, senza pubblicazione reale. Da aprire da computer o tablet.', url: DEMO.sito, img: 'demo-sito.jpg', alt: 'Galleria dei modelli di sito' }) },

  { id: 'dossier', nome: 'Dossier Immobile', scena: 'ambient', html: demo({
    n: 3, kick: 'Dossier Immobile', titolo: 'Dall\'incarico al dossier,', em: 'con la casa in 3D',
    cosa: 'Dalla planimetria catastale nascono la casa 3D, le foto degli ambienti arredati e un dossier A4 con il marchio dell\'agenzia. Si stampa o si invia come link.',
    vant: [['Agenzia', 'Una presentazione professionale in pochi minuti.'], ['Agenzia', 'Un argomento in più per acquisire l\'incarico.'], ['Gabetti', 'Stessa impaginazione e stesso stile in tutta la rete.']],
    nota: 'Nella demo dati, testi e foto sono d\'esempio. Il percorso guidato è in cinque passi.', url: DEMO.dossier, img: 'dossier-casa3d.jpg', alt: 'Casa 3D generata dalla planimetria' }) },

  { id: 'arreda', nome: 'Il tuo arredo', scena: 'ambient', html: demo({
    n: 4, kick: 'Il tuo arredo nella casa in vendita', titolo: 'La casa in vendita', em: 'con i mobili di chi la guarda',
    cosa: 'Sull\'annuncio, il visitatore carica la foto del suo salotto e vede la stanza in vendita arredata con i suoi mobili. Dopo le prime prove lascia la mail.',
    vant: [['Agenzia', 'Contatti interessati a quella casa, dall\'annuncio.'], ['Agenzia', 'Annunci più coinvolgenti per chi li guarda.'], ['Gabetti', 'Una funzione di rete, con il marchio Gabetti.']],
    nota: 'Il risultato è un\'immagine indicativa: mobili e proporzioni possono differire.', url: DEMO.arreda, img: 'demo-arreda.jpg', alt: 'Stanza in vendita arredata con i mobili del visitatore', eti: 'IMMAGINE INDICATIVA' }) },

  { id: 'vantaggi', nome: 'Vantaggi per Gabetti', scena: 'ambient', html: `
    <div class="in stretta">
      <div class="kick r" style="--i:0">In sintesi</div>
      <h2 class="r" style="--i:1">I vantaggi <em>per Gabetti</em></h2>
      <p class="lead r" style="--i:2">Quattro strumenti, un solo partner, già nella rete con HubAgency.</p>
    </div>
    <div class="tiles">
      ${[['Un fornitore, più strumenti', 'Conti, sito, dossier e arredo da un solo partner.'],
         ['Nessun doppione', 'Ogni strumento risponde a un bisogno preciso, accanto a quelli della rete.'],
         ['Immagine di rete uniforme', 'Siti e dossier con lo stesso stile e lo stesso marchio.'],
         ['Contatti dagli annunci', 'La prova dell\'arredo porta alle agenzie visitatori interessati.'],
         ['Dati confrontabili', 'I conti delle agenzie letti con gli stessi criteri.'],
         ['A consumo', 'L\'agente attiva i servizi che usa; il modello si definisce insieme.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 3}"><i>${i + 1}</i><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join('')}
    </div>` },

  { id: 'sviluppi', nome: 'Prossimi sviluppi', scena: 'casa', off: 3.9, sc: .6, offY: -6.2, kStretto: .5, html: `
    <div class="in lungo">
      <div class="kick r" style="--i:0">Prossimi sviluppi · prototipi in costruzione</div>
      <h2 class="r" style="--i:1">Quello che <em>stiamo costruendo</em></h2>
      <div class="card r" style="--i:2"><h3>Calcola ristrutturazione</h3>
        <p>Dentro il Dossier Immobile: una stima a forchetta dei costi di ristrutturazione, per l'acquirente.</p></div>
      <div class="card r" style="--i:3"><h3>HubAgency People</h3>
        <p><b>Ricerca del personale</b>, per Gabetti e per le agenzie: profilo del candidato ideale con competenze tecniche e personali, questionari con punteggio spiegato, decisione sempre di una persona, annunci sui portali.</p>
        <p><b>Formazione continua</b>: corsi, quiz e allenamento quotidiano, con punti, badge e sfide tra agenzie.</p></div>
      <p class="nota r" style="--i:4">Prototipi in costruzione: tempi e contenuti si decidono insieme.</p>
    </div>
    <div class="hint">Passa sulle stanze · ${ETI}</div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in lungo">
      <div class="kick r" style="--i:0">Prossimo passo</div>
      <h2 class="r" style="--i:1">Una sessione di lavoro <em>per scegliere con cosa partire nel 2027</em></h2>
      <p class="lead r" style="--i:2">Rivediamo insieme le demo, scegliamo gli strumenti da cui partire e le agenzie con cui provarli.</p>
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
