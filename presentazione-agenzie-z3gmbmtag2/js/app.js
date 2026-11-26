// Regia della presentazione HubAgency per le agenzie immobiliari: slide, navigazione.
import { mostra } from './scene3d.js';

const M = 'media/';
const r = (i) => `class="r" style="--i:${i}"`;
const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';
const DEMO = {
  conti: 'https://hubique.it/demo-agenzie-prlw36v1/conti/',
  sito: 'https://hubique.it/demo-agenzie-prlw36v1/sito/',
  dossier: 'https://hubique.it/demo-agenzie-prlw36v1/dossier/',
  arreda: 'https://hubique.it/demo-agenzie-prlw36v1/arredo/',
  ristruttura: 'https://hubique.it/demo-agenzie-prlw36v1/dossier/dossier.html',
  talent: 'https://hubique.it/demo-agenzie-prlw36v1/talent/#/cruscotto?come=franchisor',
  login: 'https://app.hubagency.it/login',
};
// accesso alla demo HubAgency (account dimostrativo): la password non compare a video, si copia col pulsante
const ACC = { u: 'demo.milano@hubique.it', p: atob('bXFkRTckTWRzZ0JSbnhZNFd6eEpUaW1nRm84NA==') };
const accesso = (i, tit = 'Accedi alla demo completa') => `
      <div class="accesso r" style="--i:${i}">
        <div class="acc-t">${tit}</div>
        <div class="acc-r"><span>Utente</span><code>${ACC.u}</code><button type="button" class="pe" data-copia="u">Copia</button></div>
        <div class="acc-r"><span>Password</span><code>••••••••••••</code><button type="button" class="pe" data-copia="p">Copia password</button></div>
        <a class="apri pe" href="${DEMO.login}" target="_blank" rel="noopener">Entra nella demo <span aria-hidden="true">&#8599;</span></a>
      </div>`;
const host = u => u.replace(/^https:\/\//, '').replace(/[#?].*$/, '').replace(/\/[^/]*\.html$/, '').replace(/\/$/, '');

// una slide per demo: cosa fa, tre vantaggi, schermata, pulsante
function demo({ n, kick, titolo, em, cosa, vant, nota, url, img, alt, eti = ETI, login = false }) {
  return `
    <div class="in demo-t">
      <div class="kick r" style="--i:0">Demo ${n} di 8 · ${kick}</div>
      <h2 class="r" style="--i:1">${titolo} <em>${em}</em></h2>
      <p class="lead r" style="--i:2">${cosa}</p>
      <ul class="vant">
        ${vant.map((v, i) => `<li ${r(i + 3)}><i class="${v[0] === 'Rete' ? 'gb' : ''}">${v[0]}</i><span>${v[1]}</span></li>`).join('')}
      </ul>
      ${login ? accesso(6) : `<div class="azioni r" style="--i:6"><a class="apri pe" href="${url}" target="_blank" rel="noopener">Apri la demo <span aria-hidden="true">&#8599;</span></a></div>`}
      <p class="nota r" style="--i:7">${nota}</p>
    </div>
    <a class="shot r pe" style="--i:3" href="${url}" target="_blank" rel="noopener" aria-label="Apri la demo ${kick}">
      <span class="barra"><i></i><i></i><i></i><b class="lab">${host(url)}</b></span>
      <img src="${M}${img}" alt="${alt}">
      <span class="eti">${eti}</span>
    </a>`;
}

const SLIDES = [
  { id: 'apertura', nome: 'Apertura', scena: 'italia', off: 2.5, offY: -3.6, kStretto: .62, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Proposta Hubique · Agenzie immobiliari</div>
      <h1 class="r" style="--i:1">HubAgency: <em>strumenti che lavorano per l'agenzia</em></h1>
      <p class="lead r" style="--i:2">Nuovi contatti dai portali, agenti AI, ristrutturazione, arredo, casa 3D, conti, persone e sito: otto strumenti per le agenzie e le reti immobiliari.</p>
    </div>
    <div class="hint">Passa sui punti della mappa · Frecce per avanzare · Punti generici, a scopo illustrativo</div>` },

  { id: 'obiettivi', nome: 'Obiettivi', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in">
      <div class="kick r" style="--i:0">Gli obiettivi della rete</div>
      <h2 class="r" style="--i:1">Tre obiettivi <em>per una rete di agenzie</em></h2>
      <ol class="obi">
        ${[['Una rete più produttiva', 'Strumenti che fanno risparmiare tempo all\'agenzia e portano contatti.'],
           ['Strumenti che gli agenti usano davvero', 'Pochi passaggi, risultato subito visibile.'],
           ['Pochi fornitori, nessun doppione', 'Servizi mirati, accanto a quelli che la rete ha già.']]
          .map((p, i) => `<li ${r(i + 2)}><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></li>`).join('')}
      </ol>
    </div>` },

  { id: 'trovalead', nome: 'Trova lead', scena: 'ambient', html: demo({
    n: 1, kick: `Trova lead`, titolo: `I privati che vendono,`, em: `appena escono sui portali`,
    cosa: `Legge gli annunci dei privati su Immobiliare.it, idealista e Casa.it, toglie i doppioni tra portali e mette in cima i più recenti e quelli con il prezzo al metro quadro più basso della zona, con un punteggio. Per ogni annuncio mostra i clienti acquirenti compatibili; la ricerca si salva e l'avviso arriva sul telefono quando esce un annuncio nuovo.`,
    vant: [['Agenzia', `Nuove acquisizioni senza passare le giornate sui portali.`], ['Agenzia', `Si chiama per primi, quando l'annuncio è appena uscito.`], ['Rete', `Stesso metodo in tutte le agenzie, elenchi esportabili in Excel.`]],
    nota: `Nella demo gli annunci sono reali, letti dai portali al momento della ricerca. Telefono ed email passano al contatto solo se l'annuncio li riporta.`, url: DEMO.login, img: 'demo-trova-lead.jpg', alt: `Elenco delle opportunità di Trova lead su Milano`, eti: 'ACCOUNT DIMOSTRATIVO · ANNUNCI REALI', login: true }) },

  { id: 'agenti', nome: 'Agenti AI', scena: 'ambient', html: demo({
    n: 2, kick: `Agenti AI`, titolo: `Agenti AI che rispondono`, em: `e scrivono per primi`,
    cosa: `L'assistente inbound risponde a ogni ora su WhatsApp, email e telefono: qualifica il contatto, dà le informazioni dell'agenzia e fissa l'appuntamento. Le campagne outbound scrivono per prime ad acquirenti da riattivare, proprietari da valutare e privati trovati con Trova lead, con i follow-up automatici.`,
    vant: [['Agenzia', `Nessun contatto perso, anche la sera e nel fine settimana.`], ['Agenzia', `Gli agenti parlano solo con chi è già interessato.`], ['Rete', `Stesso servizio in tutta la rete, anche per altri business.`]],
    nota: `Gli agenti lavorano entro le regole fissate dall'agenzia: impegni, offerte e prezzi restano alle persone. Nella demo gli agenti sono in pausa.`, url: DEMO.login, img: 'demo-agenti.jpg', alt: `Pagina AI Agents con assistente inbound e campagne outbound`, eti: 'ACCOUNT DIMOSTRATIVO · DATI FITTIZI', login: true }) },

  { id: 'ristr', nome: 'Ristrutturazione', scena: 'ambient', html: demo({
    n: 3, kick: `Quanto costerebbe ristrutturarlo`, titolo: `La casa da sistemare,`, em: `con il conto dei lavori`,
    cosa: `Nel Dossier Immobile per l'acquirente, due scelte con un tocco: rinfrescata, parziale o completa, e finitura base, media o alta. Esce la spesa a forchetta voce per voce (demolizioni, pavimenti, bagni, impianti, serramenti, tinteggiatura), con il perché di ogni cifra, la fonte del prezzo, il costo al metro quadro e le settimane di cantiere.`,
    vant: [['Agenzia', `L'obiezione «ma quanto devo spenderci?» trova risposta subito.`], ['Agenzia', `Le case da ristrutturare si propongono con numeri, non con impressioni.`], ['Rete', `Uno strumento in più che i portali non danno.`]],
    nota: `Stima indicativa con fonti dichiarate, non è un preventivo: serve sempre il sopralluogo di un'impresa. Nella versione per il proprietario non compare.`, url: DEMO.ristruttura, img: 'demo-ristr.jpg', alt: `Pagina «Quanto costerebbe ristrutturarlo» del dossier` }) },

  { id: 'arreda', nome: 'Il tuo arredo', scena: 'ambient', html: demo({
    n: 4, kick: 'Il tuo arredo nella casa in vendita', titolo: 'La casa in vendita', em: 'con i mobili di chi la guarda',
    cosa: 'Sull\'annuncio, il visitatore carica la foto del suo salotto e vede la stanza in vendita arredata con i suoi mobili. Dopo le prime prove lascia la mail.',
    vant: [['Agenzia', 'Contatti interessati a quella casa, dall\'annuncio.'], ['Agenzia', 'Annunci più coinvolgenti per chi li guarda.'], ['Rete', 'Una funzione di rete, con il marchio della rete.']],
    nota: 'Il risultato è un\'immagine indicativa: mobili e proporzioni possono differire.', url: DEMO.arreda, img: 'demo-arreda.jpg', alt: 'Stanza in vendita arredata con i mobili del visitatore', eti: 'IMMAGINE INDICATIVA' }) },

  { id: 'dossier', nome: 'Dossier Immobile', scena: 'ambient', html: demo({
    n: 5, kick: 'Dossier Immobile', titolo: 'Dall\'incarico al dossier,', em: 'con la casa in 3D',
    cosa: 'Dalla planimetria catastale nascono la casa 3D, le foto degli ambienti arredati e un dossier A4 con il marchio dell\'agenzia. Si stampa o si invia come link.',
    vant: [['Agenzia', 'Una presentazione professionale in pochi minuti.'], ['Agenzia', 'Un argomento in più per acquisire l\'incarico.'], ['Rete', 'Stessa impaginazione e stesso stile in tutta la rete.']],
    nota: 'Nella demo dati, testi e foto sono d\'esempio. Il percorso guidato è in cinque passi.', url: DEMO.dossier, img: 'demo-dossier.jpg', alt: 'Casa 3D generata dalla planimetria' }) },

  { id: 'conti', nome: 'Conti Agenzia', scena: 'ambient', html: demo({
    n: 6, kick: 'Conti Agenzia', titolo: 'Il mese dell\'agenzia,', em: 'in una schermata',
    cosa: 'Cosa è entrato, cosa è uscito, cosa resta e quali incassi arrivano nei prossimi 60 giorni. Dalle trattative alla previsione, fino alle provvigioni degli agenti.',
    vant: [['Agenzia', 'Sa quanto guadagna davvero ogni mese.'], ['Agenzia', 'Vede quali trattative rendono e quali fanno perdere tempo.'], ['Rete', 'Conti letti con gli stessi criteri in tutta la rete.']],
    nota: 'Il collegamento ai gestionali della rete è da definire insieme.', url: DEMO.conti, img: 'demo-conti.jpg', alt: 'Conti Agenzia, schermata «Il mio mese»' }) },

  { id: 'talent', nome: 'HubAgency Talent', scena: 'ambient', html: demo({
    n: 7, kick: `HubAgency Talent`, titolo: `Selezione e formazione`, em: `per tutta la rete`,
    cosa: `Il profilo del candidato ideale per ogni ruolo, costruito con questionari mirati su ogni competenza; il candidato risponde da qualsiasi dispositivo e il punteggio, calcolato con regole fisse, arriva al titolare come proposta interna, con la spiegazione. Annunci pronti per tutti i portali, percorsi di formazione costruiti sulle lacune di ognuno, allenamento quotidiano a gioco e un cruscotto per la direzione.`,
    vant: [['Agenzia', `Meno colloqui a vuoto e nuovi agenti operativi prima.`], ['Agenzia', `Quello che si impara non si perde, con pochi minuti al giorno.`], ['Rete', `Un metodo unico di selezione e formazione in tutta la rete.`]],
    nota: `Questionari scritti in collaborazione con uno psicometrista certificato; decide sempre una persona. Tutte le funzioni nella <a class="pe" href="https://hubique.it/presentazione-agenzie-talent-g576uba0ak/" target="_blank" rel="noopener" style="color:var(--viola)">presentazione di HubAgency Talent</a>.`, url: DEMO.talent, img: 'demo-t-cruscotto.jpg', alt: `Cruscotto della rete di HubAgency Talent` }) },

  { id: 'sito', nome: 'Il tuo sito in un\'ora', scena: 'ambient', html: demo({
    n: 8, kick: 'Il tuo sito in un\'ora', titolo: 'Il sito dell\'agenzia,', em: 'fatto dall\'agente',
    cosa: 'L\'agente sceglie uno dei 30 modelli e cambia solo testi, foto, colore e logo. Gli annunci entrano nel sito con un interruttore, come per i portali.',
    vant: [['Agenzia', 'Un sito proprio, senza webmaster.'], ['Agenzia', 'Annunci sempre allineati, senza doppio lavoro.'], ['Rete', 'Un\'immagine coerente della rete, sito per sito.']],
    nota: 'Anteprima dimostrativa, senza pubblicazione reale. Da aprire da computer o tablet.', url: DEMO.sito, img: 'demo-sito.jpg', alt: 'Galleria dei modelli di sito' }) },

  { id: 'vantaggi', nome: 'Vantaggi per la rete', scena: 'ambient', html: `
    <div class="in stretta">
      <div class="kick r" style="--i:0">In sintesi</div>
      <h2 class="r" style="--i:1">I vantaggi <em>per la rete</em></h2>
      <p class="lead r" style="--i:2">Otto strumenti, un solo partner.</p>
    </div>
    <div class="tiles">
      ${[['Un fornitore, più strumenti', 'Nuovi contatti, agenti AI, ristrutturazione, arredo, casa 3D, conti, persone e sito da un solo partner.'],
         ['Nessun doppione', 'Ogni strumento risponde a un bisogno preciso, accanto a quelli che la rete ha già.'],
         ['Immagine di rete uniforme', 'Siti e dossier con lo stesso stile e lo stesso marchio.'],
         ['Contatti e argomenti per vendere', 'Trova lead scova i privati che vendono, gli agenti AI li contattano e rispondono a ogni ora; arredo, casa 3D, dossier e conto dei lavori aiutano a chiudere.'],
         ['Dati confrontabili', 'I conti delle agenzie letti con gli stessi criteri.'],
         ['Persone scelte e formate con un metodo unico', 'Selezione, formazione e allenamento uguali in tutta la rete.']]
        .map((t, i) => `<div class="tile r" style="--i:${i + 3}"><i>${i + 1}</i><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join('')}
    </div>` },

  { id: 'chiusura', nome: 'Prossimo passo', scena: 'italia', off: 3.0, sc: .92, offY: -4.2, kStretto: .6, html: `
    <div class="in lungo">
      <div class="kick r" style="--i:0">Prossimo passo</div>
      <h2 class="r" style="--i:1">Una sessione di lavoro <em>per scegliere con cosa partire</em></h2>
      <p class="lead r" style="--i:2">Rivediamo insieme le demo, scegliamo gli strumenti da cui partire e le agenzie con cui provarli.</p>
      <div class="contact r" style="--i:3">
        <div class="who">Michele Campagnoni</div><div class="role">Amministratore Delegato · Hubique</div>
        <div class="cc"><a class="pe" href="mailto:m.campagnoni@hubique.it">m.campagnoni@hubique.it</a><a class="pe" href="tel:+393282588293">+39 3282588293</a></div>
        <div class="leg">Hubique S.r.l. · Via Ennio 6A, 20137 Milano · P.IVA 12588200969</div>
      </div>
      ${accesso(4, 'Provate HubAgency con l\'account dimostrativo')}
    </div>` },

];

// ---------- costruzione ----------
const deck = document.getElementById('deck'), dots = document.getElementById('dots');
SLIDES.forEach((s, i) => {
  const el = document.createElement('section'); el.className = 'slide'; el.id = 's-' + s.id; el.innerHTML = s.html; deck.appendChild(el); s.el = el;
  const b = document.createElement('button'); b.innerHTML = `<span>${s.nome}</span>`; b.title = s.nome; b.setAttribute('aria-label', s.nome); b.onclick = () => vai(i); dots.appendChild(b);
});

// ---------- copia credenziali ----------
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copia]'); if (!b) return; e.preventDefault(); e.stopPropagation();
  const t = ACC[b.dataset.copia], old = b.textContent;
  try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  b.textContent = 'Copiato'; b.classList.add('ok'); setTimeout(() => { b.textContent = old; b.classList.remove('ok'); }, 1600);
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
