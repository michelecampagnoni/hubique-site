// Regia della presentazione: slide, navigazione, tema chiaro e scuro.
import { mostra, suOra } from './scene3d.js';
import { ETI, chat, pannello, stato } from './cruscotti.js';

const M = 'media/';
const r = (i) => `class="r" style="--i:${i}"`;
const rc = (i) => `r" style="--i:${i}`; // per le classi composte: class="m tu r" style="--i:n"
const OFFERTA = 'https://hubiqueerp.pages.dev/offerta/3a43f1a9-65e2-45bb-804c-42ec84beadd8';
const riga = (a, b, c = '') => `<div class="riga ${c}"><span>${a}</span><b>${b}</b></div>`;

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'tavolo', off: 3.3, sc: .77, offY: -3.3, kStretto: .84, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Proposta Hubique</div>
      <h1 class="r" style="--i:1"><u>Castangia 1850 <span>·</span></u><br><em>Inbound Kit</em></h1>
      <p class="lead r" style="--i:2">Presidiare la domanda dei retailer in ogni fuso orario.</p>
      <div class="av r" style="--i:3">All'attenzione di Alberto Grilletti</div>
    </div>
    <div class="hint">Muovi il mouse sul tavolo · Passa sui rotoli · Frecce per avanzare</div>` },

  { id: 'esigenza', nome: 'L\'esigenza', scena: 'mondo', tema: 'scuro', off: 3.2, sc: .8, offY: -3.5, kStretto: .78, html: `
    <div class="in">
      <div class="kick r" style="--i:0">L'esigenza</div>
      <h2 class="r" style="--i:1">Il retailer scrive <em>quando l'ufficio è chiuso</em></h2>
      <p class="lead r" style="--i:2">Nella moda e nel lusso, l'Inbound Kit è lo strumento dedicato ai brand che vendono all'estero: gestisce la domanda in entrata attraverso i fusi orari.</p>
      <ul class="pts">
        <li ${r(3)}>Il lavoro è su misura: la domanda vera è <b>se quel tessuto è disponibile</b>, e cosa proporre se non lo è.</li>
        <li ${r(4)}>Le richieste arrivano <b>per mail e WhatsApp, in inglese</b>.</li>
      </ul>
    </div>
    <div class="orologio r" style="--i:5"><span id="ora-t">In Sardegna</span><b id="ora">19:00</b><i id="ora-s">Ufficio chiuso</i></div>
    <div class="hint">Passa sui punti · Ora simulata · Punti generici, a scopo illustrativo</div>` },

  { id: 'soluzione', nome: 'Cosa fa', scena: 'ambient', html: `
    <div class="in stretta">
      <div class="kick r" style="--i:0">Cosa fa la soluzione</div>
      <h2 class="r" style="--i:1">Dal tessuto alla risposta, <em>a qualunque ora</em></h2>
      <figure class="foto r" style="--i:2"><img src="${M}stoffa.jpg" alt="Tessuti Castangia"></figure>
    </div>
    <ol class="passi">
      ${[['Pannello tessuti', 'gestito da Castangia, a mano o da Excel.'],
         ['Assistente in chat', 'nell\'area rivenditori, a qualunque ora, nella lingua del retailer.'],
         ['Disponibilità a tre stati', `${stato('d')} ${stato('e')} ${stato('n')}`],
         ['Caratteristiche del tessuto', 'pronte da consultare nella stessa conversazione.'],
         ['I tessuti più simili', 'proposti per composizione, peso, colore e disegno.'],
         ['Bozze di risposta alle mail', 'dei retailer: partono solo con l\'approvazione di Castangia.'],
         ['Quando non sa', 'passa all\'ufficio commerciale.']]
        .map((p, i) => `<li ${r(i + 3)}><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></li>`).join('')}
    </ol>` },

  { id: 'esempio', nome: 'Un esempio', scena: 'ambient', html: `
    <div class="ese">
      <div class="ese-t">
        <div><div class="kick r" style="--i:0">Cosa fa la soluzione · Un esempio</div>
        <h2 class="r" style="--i:1">Una richiesta di notte, <em>dalla chat alla bozza</em></h2></div>
        <div class="eti r" style="--i:2">${ETI}</div>
      </div>
      <div class="ese-g">${chat(rc)}${pannello(rc)}</div>
    </div>` },

  { id: 'vantaggi', nome: 'Vantaggi', scena: 'ambient', html: `
    <div class="in stretta">
      <div class="kick r" style="--i:0">I vantaggi</div>
      <h2 class="r" style="--i:1">Cosa cambia <em>in concreto</em></h2>
      <p class="lead r" style="--i:2">Un sistema semplice da avviare, che cresce con voi un passo alla volta.</p>
    </div>
    <div class="tiles">
      ${[['Risposte anche fuori orario', 'Il retailer riceve risposta quando in Sardegna l\'ufficio è chiuso.'],
         ['Stessa informazione a tutti', 'Disponibilità e caratteristiche vengono da un solo elenco.'],
         ['Ufficio commerciale libero', 'Le richieste ripetitive non pesano più: all\'ufficio restano quelle che chiedono una persona.'],
         ['Nessun impatto sul gestionale', 'Il pannello vive a parte: il gestionale resta com\'è.'],
         ['Si parte semplice, si cresce a passi', 'Prima tessuti e disponibilità, il resto quando serve.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 3}"><i>${i + 1}</i><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join('')}
      <figure class="tile foto r" style="--i:8"><img src="${M}mani-sarta.jpg" alt="Lavorazione a mano"></figure>
    </div>` },

  { id: 'offerta', nome: 'Offerta economica', scena: 'ambient', html: `
    <div class="off">
      <div><div class="kick r" style="--i:0">L'offerta economica</div>
      <h2 class="r" style="--i:1">Attivazione e primo anno: <em>1.500 € + IVA</em></h2></div>
      <div class="ofg">
        <div class="ofc r" style="--i:2"><h3>Inbound Kit · Cosa comprende</h3>
          <ul>
            <li>Chat nell'area rivenditori</li><li>Pannello tessuti</li><li>Bozze mail</li><li>Server e AI</li>
            <li>Assistenza per 12 mesi dalla messa in funzione</li><li>Fino a 3.000 richieste</li>
          </ul>
        </div>
        <div class="ofc r" style="--i:3"><h3>Prezzo</h3>
          ${riga('Listino', '2.000 € <small>+ IVA</small>')}
          ${riga('Sconto di fine mese', '−500 €')}
          ${riga('Confermando entro il 31/10/2026', '1.500 € <small>+ IVA</small>', 'forte')}
          ${riga('Dal secondo anno, rinnovo annuale', '1.500 € <small>+ IVA</small>')}
        </div>
        <div class="ofc tot r" style="--i:4"><h3>Proposta</h3>
          <div class="pr">1.500 € <small>+ IVA</small></div>
          <p><b>50%</b> alla conferma, <b>50%</b> a 30 giorni, con bonifico.</p>
          <a class="acc pe" href="${OFFERTA}" target="_blank" rel="noopener">Accetta l'offerta</a>
        </div>
      </div>
      <p class="dopo r" style="--i:5"><b>Per i passi successivi restano</b> prezzi e listini personalizzati, stato ordini, WhatsApp, collegamento al gestionale.</p>
    </div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'ambient', tema: 'foto', bg: M + 'testata.jpg', o: 1, html: `
    <div class="in lungo">
      <div class="kick r" style="--i:0">Prossimo passo</div>
      <h2 class="r" style="--i:1">Si parte <em>dall'elenco dei tessuti</em></h2>
      <p class="lead r" style="--i:2">Per partire serve l'elenco dei tessuti, con disponibilità e caratteristiche verificate.</p>
      <div class="azioni r" style="--i:3"><a class="acc pe" href="${OFFERTA}" target="_blank" rel="noopener">Accetta l'offerta</a></div>
      <div class="contact r" style="--i:4">
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

// fondo con l'immagine della slide (due livelli in dissolvenza)
const bgA = document.getElementById('bgA'), bgB = document.getElementById('bgB'); let bgFront = bgA, bgUrl = null;
function sfondo(url, o) {
  if (url === bgUrl) return; bgUrl = url;
  const next = bgFront === bgA ? bgB : bgA;
  if (url) { next.style.backgroundImage = `url("${url}")`; next.style.setProperty('--o', o); next.classList.add('on'); }
  bgFront.classList.remove('on'); bgFront = next; if (!url) next.classList.remove('on');
}


const oraEl = document.getElementById('ora'), oraS = document.getElementById('ora-s');

// ---------- navigazione ----------
let cur = -1; const count = document.getElementById('count'), bar = document.getElementById('bar'), tip = document.getElementById('tip');
function vai(n) {
  n = Math.max(0, Math.min(SLIDES.length - 1, n)); if (n === cur) return;
  const first = cur < 0;
  if (SLIDES[cur]) SLIDES[cur].el.classList.remove('on');
  cur = n; const s = SLIDES[n];
  s.el.querySelectorAll('.r').forEach(x => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; });
  s.el.classList.add('on'); s.el.scrollTop = 0;
  document.body.classList.toggle('scuro', s.tema === 'scuro'); document.body.classList.toggle('sufoto', s.tema === 'foto');
  mostra(s.scena, { offsetX: s.off || 0, scale: s.sc || 1, snap: first, offY: s.offY, kStretto: s.kStretto });
  if (s.scena === 'mondo') suOra(({ ora, chiuso }) => { oraEl.textContent = ora; oraS.textContent = chiuso ? 'Ufficio chiuso' : 'Ufficio aperto'; oraS.classList.toggle('ap', !chiuso); });
  sfondo(s.bg || null, s.o || .4);
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

Promise.all(['300 italic 60px "Cormorant Garamond"', '400 60px "Cormorant Garamond"', '400 18px Jost', '500 18px Jost'].map(f => document.fonts.load(f, 'Aa€'))).catch(() => { }).then(() => vai(Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)));
