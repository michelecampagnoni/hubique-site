// Regia della presentazione: slide, navigazione, gallerie di schermate vere, prove dal vivo, mockup dei kit nuovi.
import { mostra, pausa, KITS } from './scene3d.js';

const KW = /^(AI|Kit|Kit\.|Kit,|Brain|Scout|Skill|Voice|Inbound|Fin|Task|Hubique|tu|sì\.|sì|AI,)$/;
function parole(righe, base = 0) {
  let i = base;
  return righe.map(r => {
    const cls = typeof r === 'object' ? r.c || '' : '';
    const txt = typeof r === 'object' ? r.t : r;
    const sp = txt.split(' ').map(w => `<span class="w${KW.test(w) ? ' k' : ''}" style="--i:${i++}">${w}</span>`).join(' ');
    return `<p class="ln ${cls}">${sp}</p>`;
  }).join('');
}
const brackets = '<div class="bk tl"></div><div class="bk tr"></div><div class="bk bl"></div><div class="bk br"></div><div class="scan"></div>';
const M = 'media/', I = 'media/img/';

// ---------- contenuti ----------
const SLIDES = [
  // INTRO
  { cap: 'intro', tipo: 'copy', scena: 'cover', tag: 'AI INTEGRATION TOOLS', righe: [{ t: 'Hubique presenta:', c: '' }, { t: 'AI Integration Tools', c: 'xl glowtitle' }, { t: "L'AI integrator", c: 's' }], low: true, hint: 'Frecce o spazio per avanzare · muovi il mouse sulla scena' },
  { cap: 'intro', tipo: 'copy', scena: 'sparsi', righe: ['Ogni azienda ha una memoria.', { t: 'Sparsa in mail, cartelle, persone.', c: 's' }], low: true, hint: 'Passa sui frammenti' },
  { cap: 'intro', tipo: 'copy', scena: 'cupola', righe: ['Là fuori ci sono clienti che non ti conoscono ancora.', { t: 'E un modo di lavorare che nessuno ha mai scritto.', c: 's' }], low: true },
  { cap: 'intro', tipo: 'copy', scena: 'cover', righe: ['Non un software in più.', { t: "L'aggregatore AI dentro l'azienda.", c: '' }] },
  { cap: 'intro', tipo: 'copy', scena: 'orbita', righe: ['Sette Kit. Una sola conversazione.', { t: "L'AI propone, tu decidi.", c: 's' }], low: true, hint: 'Passa sui Kit · clic per aprire il capitolo · trascina per ruotare' },

  // #1 BRAIN
  { cap: 'brain', tipo: 'cover', scena: 'brain', off: 2.6, num: '#1 · BRAIN KIT', titolo: 'Brain <span class="k">Kit</span>', q: "Cosa sa l'azienda?", sub: 'Il cervello aziendale che ricostruisce la tua azienda.',
    punti: ['<b>Anni di carte.</b> Ogni pezzo, al suo posto.', 'Posta, documenti, note e conversazioni: <b>tutto in un unico posto.</b>', '<b>Ogni fonte è un punto.</b> Ogni legame, un filo.'], hint: 'Passa sui punti: si accendono i legami' },
  { cap: 'brain', tipo: 'gal', tag: '#1 · BRAIN KIT · SCHERMATE', clip: [
    { src: M + 'brain_ricostruzione.mp4', r: ['Brain Kit by Hubique', { t: 'La ricostruzione: la chat, il cervello 3D, la cronologia.', c: 's' }] },
    { img: I + 'BRAIN-6_ricostruzione_in_corso.jpg', r: ['Cerca nella posta, nei documenti, nelle note, nelle chat.'] },
    { src: M + 'brain_cervello.mp4', r: ['Ogni fonte è un punto. Ogni legame, un filo.'] },
    { img: I + 'BRAIN-8_racconto_rimandi_e_fonti.jpg', r: ['Ogni frase ha la sua fonte.', { t: 'Il racconto è in ordine di tempo.', c: 's' }] },
    { src: M + 'brain_lettore.mp4', r: ['Un clic: il tuo documento, la mail, la fattura,', { t: 'il contratto che non trovi.', c: '' }] },
    { src: M + 'brain_cronologia.mp4', r: ['Scegli un momento:', { t: 'la memoria svela tutto ciò che gli è collegato.', c: 's' }] },
    { img: I + 'BRAIN-12_password_archivio_riservato.jpg', r: ['Il riservato resta chiuso.', { t: 'Si apre solo se lo decidi tu, con la password.', c: 's' }] },
    { src: M + 'brain_giro.mp4', r: ['La memoria intera, a portata di mano.', { t: 'Poi continua a rispondere.', c: 's' }] },
  ], live: 1 },
  { cap: 'brain', tipo: 'live', src: 'live/cervello/index.html', tag: '#1 · BRAIN KIT · PROVA DAL VIVO', nota: 'DATI DIMOSTRATIVI · CLICCA UNA VICENDA' },
  { cap: 'brain', tipo: 'copy', scena: 'brain', dim: true, righe: ['Brain Kit.', 'La tua memoria, il tuo know, la tua azienda.', { t: 'Finalmente in un unico posto, sempre accessibile.', c: 's' }] },

  // #2 SCOUT
  { cap: 'scout', tipo: 'cover', scena: 'italia', off: 2.4, num: '#2 · SCOUT KIT', titolo: 'Scout <span class="k">Kit</span>', q: 'Nel mercato, chi c\'è?', sub: 'Trova i clienti. Prima degli altri.',
    punti: ['<b>Dillo con parole tue.</b> Che aziende cerchi, dove, cosa escludere. Il resto lo fa il kit.', '<b>Centinaia di database</b>, sempre aggiornati. Contatti verificati, di prima qualità.', 'Analisi e matching di <b>migliaia di aziende</b> in pochi secondi.'], hint: 'Passa sui punti: ogni punto è un\'azienda' },
  { cap: 'scout', tipo: 'gal', tag: '#2 · SCOUT KIT · SCHERMATE', clip: [
    { src: M + 'scout_scraping.mp4', r: ['Centinaia di database, sempre aggiornati.', { t: 'Contatti verificati, di prima qualità.', c: 's' }] },
    { src: M + 'scout_riempie.mp4', r: ['Analisi e matching di migliaia di aziende in pochi secondi.'] },
    { src: M + 'scout_dossier.mp4', r: ['Business Intelligence', { t: 'Per ogni azienda un dossier: andamento, sede, prodotti.', c: 's' }] },
    { img: I + 'SCOUT-8_dossier_3_matching.jpg', r: ['E cosa puoi davvero proporle', { t: 'tra i tuoi prodotti e servizi.', c: 's' }] },
    { src: M + 'scout_mappa.mp4', r: ["L'Italia dei tuoi clienti.", { t: 'Un clic: il sito, il dossier.', c: 's' }] },
    { src: M + 'scout_campagne.mp4', r: ['Le tue campagne, su una mappa.'] },
  ], live: 1 },
  { cap: 'scout', tipo: 'copy', scena: 'lettere', righe: ['Una mail su misura per ogni azienda, già controllata.', { t: "Ferme, in attesa. L'AI prepara. Tu guardi il campione e decidi. Solo dopo, parte.", c: 's' }], low: true, hint: 'Passa sulle bozze: il semaforo del revisore' },
  { cap: 'scout', tipo: 'live', src: 'live/mappa/campagne-mappa-video.html', tag: '#2 · SCOUT KIT · PROVA DAL VIVO', nota: 'DATI DIMOSTRATIVI · TRASCINA, FILTRA, CLICCA UN PUNTO' },
  { cap: 'scout', tipo: 'copy', scena: 'italia', dim: true, righe: ['Non una semplice lista:', 'una lista di opportunità.', { t: 'SCOUT KIT by HUBIQUE', c: 's' }] },

  // #3 SKILL
  { cap: 'skill', tipo: 'cover', scena: 'skillvolume', off: 2.6, num: '#3 · SKILL KIT', titolo: 'Skill <span class="k">Kit</span>', q: 'Come lavora la tua azienda?', sub: 'Un libro. Una procedura. Un video di formazione. Una persona che sa come si fa. E ogni volta si rispiega da capo.',
    punti: ['<b>Ogni metodo, una skill.</b> Scritta in chiaro. Sempre consultabile.', '<b>Mentre lavora, dice quali metodi usa.</b> Le skill richiamate, sempre visibili.', 'Una richiesta complessa. <b>Un metodo.</b>'], hint: 'Passa sulle schede: ogni scheda è un metodo' },
  { cap: 'skill', tipo: 'copy', scena: 'skilllastre', righe: ['Gli dici cosa deve imparare. Gli consegni il materiale.', { t: 'Documenti. Indici di libri. Pagine web. Perfino video: ne legge i sottotitoli.', c: 's' }, { t: 'Estrae. Scrive il metodo. Rivede.', c: '' }], low: true, hint: 'Passa sulle lastre' },
  { cap: 'skill', tipo: 'copy', scena: 'skillvolume', dim: true, righe: ['Ogni passo ha la sua fonte.', 'Quello che non è verificato, lo dice.', { t: "Più materiale entra, più cresce quello che l'azienda sa fare.", c: 's' }] },

  // #4 VOICE
  { cap: 'voice', tipo: 'cover', scena: 'kitring', off: 2.8, num: '#4 · VOICE KIT', titolo: 'Voice <span class="k">Kit</span>', q: 'E tutto questo, come si usa?', sub: "L'AI dentro l'azienda. Le parli come a un collega.",
    punti: ['Dici <b>«Kit»</b>. Ascolta.', '<b>Una sola conversazione.</b> Non si perde mai. Niente tastiera: parli e riprendi da dove eri.', 'Un lavoro complesso diventa <b>un lavoro di squadra</b>: Kit lo divide tra i kit e li coordina.'], hint: 'Clic sul cerchio: standby, ascolto, al lavoro, in attesa del sì' },
  { cap: 'voice', tipo: 'gal', tag: '#4 · VOICE KIT · INTERFACCIA', clip: [
    { src: M + 'voice_ascolta.mp4', r: ['Dici «Kit».', { t: 'Ascolta.', c: 's' }] },
    { src: M + 'voice_posta.mp4', r: ['La posta del mattino, già riassunta.', { t: "Per ogni mail: chi scrive, l'urgenza, la risposta.", c: 's' }] },
    { src: M + 'voice_conferma.mp4', r: ['La bozza di risposta è già pronta.', { t: 'Aspetta solo il tuo sì.', c: 's' }] },
    { src: M + 'voice_memoria.mp4', r: ['Una sola conversazione. Non si perde mai.', { t: 'Niente tastiera: parli e riprendi da dove eri.', c: 's' }] },
    { src: M + 'voice_squadra.mp4', r: ['Un lavoro complesso diventa un lavoro di squadra.', { t: 'Ti spiega la scelta. Se vuoi, la cambi a voce.', c: 's' }] },
    { src: M + 'voice_device.mp4', r: ['Su ogni device, lo stesso Kit. La stessa memoria.', { t: 'Il tuo lavoro, sempre raggiungibile.', c: 's' }] },
    { src: M + 'voice_telefono.mp4', r: ['Anche sul telefono.', { t: 'In auto, in giro: ci parli.', c: 's' }] },
  ] },
  { cap: 'voice', tipo: 'copy', scena: 'preventivo', righe: ['Un preventivo complesso.', { t: 'Diviso. Studiato. Ricomposto. Tu lo rileggi e decidi.', c: 's' }], low: true, hint: 'Passa sui moduli: chi fa cosa' },

  // #5 INBOUND
  { cap: 'inbound', tipo: 'cover', scena: 'inbound', off: 3.0, sc: .82, num: '#5 · INBOUND KIT', titolo: 'Inbound <span class="k">Kit</span>', q: 'Un cliente scrive. Chi risponde?', sub: 'Ogni richiesta in arrivo, una risposta giusta, pronta da approvare.',
    punti: ['Dal sito e dalla posta: <b>le richieste arrivano a Kit.</b>', 'Conosce <b>catalogo, listini e rete vendita</b>: il modello giusto, il prezzo, il rivenditore di zona.', 'Risponde <b>nella lingua del cliente.</b>', 'Il tuo commerciale rilegge e approva. <b>Solo dopo, parte.</b>'], hint: 'Passa sulle buste: richieste in arrivo e bozze pronte' },
  { cap: 'inbound', tipo: 'mock', mock: 'inbound', tag: '#5 · INBOUND KIT · COME FUNZIONA' },
  { cap: 'inbound', tipo: 'copy', scena: 'inbound', dim: true, righe: ['Ogni correzione diventa memoria.', { t: 'Già al lavoro per un produttore di caminetti di design.', c: 's' }, { t: 'Inbound Kit. Nessuna richiesta senza risposta.', c: '' }] },

  // #6 FIN
  { cap: 'fin', tipo: 'cover', scena: 'ddt', off: 3.6, sc: .8, num: '#6 · FIN KIT', titolo: 'Fin <span class="k">Kit</span>', q: 'E i conti, tornano?', sub: "I numeri dell'azienda ci sono tutti. Fatture. Banca. DDT. Commesse. Ma non si parlano.",
    punti: ['<b>Un DDT. Una foto.</b> Fornitore, righe, prezzi: letti e al loro posto.', 'Ogni DDT collegato a <b>fornitore, commessa, listino e fattura.</b>', '<b>Se un prezzo non torna, lo vedi subito.</b>'], hint: 'Passa sulle righe del DDT' },
  { cap: 'fin', tipo: 'mock', mock: 'fin', tag: '#6 · FIN KIT · ECONOMATO' },
  { cap: 'fin', tipo: 'copy', scena: 'ddt', dim: true, righe: ['Non un altro gestionale.', "L'AI sopra quello che hai già.", { t: 'Fin Kit. Fatture, banca, DDT e commesse: finalmente parlano la stessa lingua.', c: 's' }] },

  // #7 TASK
  { cap: 'task', tipo: 'cover', scena: 'agenda', off: 3.1, sc: .74, num: '#7 · TASK KIT', titolo: 'Task <span class="k">Kit</span>', q: 'Cosa faccio adesso?', sub: 'Attività, stime e agenda: un piano che si rifà da solo.',
    punti: ['Dici cosa devi fare: <b>Kit stima quanto ci vuole.</b>', 'Lo mette in agenda <b>attorno ai tuoi appuntamenti.</b>', '<b>Propone, tu approvi:</b> solo dopo finisce nel calendario.'], hint: 'Clic sui blocchi gialli: li approvi' },
  { cap: 'task', tipo: 'mock', mock: 'task', tag: '#7 · TASK KIT · AGENDA' },
  { cap: 'task', tipo: 'copy', scena: 'agenda', dim: true, righe: ['«Kit, cosa faccio adesso?»', { t: '«Il preventivo del capitolato: hai due ore libere, bastano.»', c: 's' }, { t: 'Se qualcosa sfora, te lo dice prima.', c: '' }] },

  // CHIUSURA
  { cap: 'fine', tipo: 'copy', scena: 'chiusura', righe: [{ t: 'Ricorda. Trova. Applica il metodo. Ti ascolta.', c: 's' }, { t: 'Risponde. Fa i conti. Organizza.', c: 's' }], low: true, hint: 'Clic su un Kit per tornare al suo capitolo' },
  { cap: 'fine', tipo: 'copy', scena: 'cover', righe: ['Kit propone, tu approvi.', { t: 'Brain · Scout · Skill · Voice · Inbound · Fin · Task', c: 's' }, { t: 'AI Integration Tools', c: 'xl glowtitle' }, { t: 'Prenota una demo. hubique.it', c: 's' }] },
];
const CAPS = [['intro', 'INTRO'], ...KITS.map(k => [k.cap, `#${k.n} ${k.nome.replace(' Kit', '').toUpperCase()}`]), ['fine', 'FINE']];

// ---------- costruzione DOM ----------
const deck = document.getElementById('deck');
SLIDES.forEach((s, n) => {
  const el = document.createElement('section'); el.className = 'slide t-' + s.tipo; el.dataset.n = n; s.el = el;
  if (s.tipo === 'copy') el.innerHTML = brackets + (s.tag ? `<span class="tag">${s.tag}</span>` : '') + `<div class="txt" style="--st:.09s">${parole(s.righe)}</div>` + (s.hint ? `<div class="hint">${s.hint}</div>` : '');
  if (s.low) el.classList.add('low');
  if (s.tipo === 'cover') el.innerHTML = brackets + `<div class="col pe"><div class="knum">${s.num}</div><h1>${s.titolo}</h1><div class="q">${s.q}</div><div class="sub">${s.sub}</div><ul>${s.punti.map((p, i) => `<li style="--i:${i}">${p}</li>`).join('')}</ul></div>` + (s.hint ? `<div class="hint" style="left:72%">${s.hint}</div>` : '');
  if (s.tipo === 'gal') el.innerHTML = `<span class="tag" style="top:62px;left:4vw">${s.tag}</span>` + `<div class="gal"><div class="tvwrap"><div class="tv"><div class="glitch"></div><div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div><span class="rec">● SCHERMATA</span></div><div class="cap"></div></div><div class="list"><div class="hd">SCHERMATE · ${s.clip.length}</div>${s.clip.map((c, i) => `<button data-i="${i}"><i>${String(i + 1).padStart(2, '0')}</i>${(typeof c.r[0] === 'object' ? c.r[0].t : c.r[0])}<span class="pg"></span></button>`).join('')}${s.live ? '<button class="live" data-live="1"><i>▶</i>PROVA DAL VIVO</button>' : ''}</div></div>`;
  if (s.tipo === 'live') el.innerHTML = `<div class="liveframe"><span class="lab2">${s.tag}</span><span class="lab">${s.nota}</span></div>`;
  if (s.tipo === 'mock') el.innerHTML = `<span class="tag" style="top:62px;left:4vw">${s.tag}</span><div class="mock"></div>`;
  deck.appendChild(el);
});
const nav = document.getElementById('nav');
CAPS.forEach(([c, l]) => { const b = document.createElement('button'); b.textContent = l; b.dataset.cap = c; b.onclick = () => vaiACapitolo(c); nav.appendChild(b); });

// ---------- galleria ----------
function galleria(s) {
  const el = s.el, tv = el.querySelector('.tv'), cap = el.querySelector('.cap'), btns = [...el.querySelectorAll('.list button[data-i]')];
  let i = 0, timer = null, media = null;
  const play = k => {
    i = (k + s.clip.length) % s.clip.length; clearTimeout(timer);
    if (media) { media.remove(); media = null; }
    tv.classList.remove('cut'); void tv.offsetWidth; tv.classList.add('cut');
    const c = s.clip[i];
    if (c.src) { media = document.createElement('video'); Object.assign(media, { src: c.src, muted: true, autoplay: true, playsInline: true }); media.onended = () => play(i + 1); media.ontimeupdate = () => { btns[i].querySelector('.pg').style.width = (media.currentTime / media.duration * 100) + '%'; }; }
    else { media = document.createElement('img'); media.src = c.img; media.className = 'kb'; timer = setTimeout(() => play(i + 1), 7000); }
    tv.prepend(media);
    btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.querySelector('.pg').style.width = '0'; });
    cap.innerHTML = parole(c.r); cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on');
  };
  btns.forEach(b => b.onclick = () => play(+b.dataset.i));
  const live = el.querySelector('[data-live]'); if (live) live.onclick = () => vai(SLIDES.indexOf(s) + s.live + (s.cap === 'scout' ? 1 : 0));
  return { start: () => play(0), stop: () => { clearTimeout(timer); if (media) { media.remove(); media = null; } } };
}

// ---------- mockup dei kit nuovi ----------
const MOCK = {};
MOCK.inbound = el => {
  const R = [
    ['J. Keller', 'Zürich · EN', 'SITO', 'Do you ship the 120 model to Zurich? Price with installation?', 'Modello 120 · listino CH', 'Rivenditore di zona: Zurigo', `Dear Mr Keller,\n\nthank you for your interest in the 120 model. It can be delivered and installed in Zurich through our local partner, who will contact you for an on-site survey.\n\nList price for Switzerland: CHF 6,480 (installation quoted after the survey).\n\nKind regards`],
    ['Studio Bianchi', 'Torino · IT', 'MAIL', 'Avete un rivenditore a Torino? Ci serve per un cliente in mansarda.', 'Modello 90 slim · optional canna', 'Rivenditore: Torino centro', `Gentile Studio Bianchi,\n\nper Torino il riferimento è il nostro rivenditore in centro, che può fare il sopralluogo in mansarda.\n\nPer un sottotetto consigliamo il modello 90 slim: ingombro ridotto e nessuna canna fumaria.\n\nCordiali saluti`],
    ['M. Dubois', 'Lyon · FR', 'SITO', 'Délai de livraison pour trois unités ?', 'Tre unità · tempi di consegna', 'Distributore Francia', `Bonjour Madame Dubois,\n\npour trois unités, le délai de livraison est de quatre semaines. Notre distributeur pour la France vous enverra le devis détaillé.\n\nBien cordialement`],
  ];
  el.innerHTML = `<div class="screen"><div class="sbar"><span class="t">INBOUND KIT</span><span>RICHIESTE IN ARRIVO</span><span class="sp"></span><span class="chip a">3 IN ATTESA DEL SÌ</span></div>
   <div class="sbody"><div class="split wide"><div class="reveal" style="display:flex;flex-direction:column;gap:8px">${R.map((r, i) => `<div class="req${i ? '' : ' on'}" data-i="${i}" style="--i:${i}"><div><div class="who">${r[0]}</div><div class="what">${r[3]}</div></div><div class="meta">${r[2]}<br>${r[1]}</div></div>`).join('')}
   <div style="--i:4;margin-top:auto" class="box"><div class="chip c">IMPARATO DALLE CORREZIONI</div><p style="margin-top:8px;font-size:13px;color:#cfeeff">«Per la Svizzera: prezzi in franchi e solo il rivenditore di zona, mai l'agente.» — corretto dal commerciale, applicato da allora.</p></div></div>
   <div style="display:flex;flex-direction:column;gap:10px"><div class="sbar" style="padding:0;border:0">BOZZA DI RISPOSTA</div><div class="match"></div><div class="draft typing"></div><div style="display:flex;gap:10px"><button class="btn g" data-ok>APPROVA E INVIA</button><button class="btn a">CORREGGI</button><span class="chip a st" style="margin-left:auto;align-self:center">IN ATTESA DEL TUO SÌ</span></div></div></div></div></div>
   <div class="side reveal"><div class="box" style="--i:1"><h4>COSA SA</h4><p>Catalogo, misure, optional, listini per paese, rete di rivenditori e agenti, condizioni commerciali.</p></div>
   <div class="box" style="--i:2"><h4>COSA FA</h4><p class="big">Legge la richiesta, trova il prodotto, il prezzo e il rivenditore giusti. Scrive nella lingua del cliente.</p></div>
   <div class="box" style="--i:3"><h4>CHI DECIDE</h4><p>Il tuo commerciale rilegge, corregge se serve, approva. Nessuna mail parte da sola.</p></div>
   <div class="box" style="--i:4"><h4>COME IMPARA</h4><p>Ogni correzione diventa una regola: la risposta dopo è già giusta.</p></div></div>`;
  const draft = el.querySelector('.draft'), match = el.querySelector('.match'), st = el.querySelector('.st'); let tm = null;
  const show = i => {
    el.querySelectorAll('.req').forEach(r => r.classList.toggle('on', +r.dataset.i === i)); const r = R[i];
    match.innerHTML = `<span class="chip c">${r[1]}</span><span class="chip g">${r[4]}</span><span class="chip v">${r[5]}</span>`;
    st.textContent = 'IN ATTESA DEL TUO SÌ'; st.className = 'chip a st'; st.style.marginLeft = 'auto';
    clearInterval(tm); let k = 0; draft.textContent = ''; draft.classList.add('typing');
    tm = setInterval(() => { k += 3; draft.textContent = r[6].slice(0, k); if (k >= r[6].length) { clearInterval(tm); draft.classList.remove('typing'); } }, 18);
  };
  el.querySelectorAll('.req').forEach(r => r.onclick = () => show(+r.dataset.i));
  el.querySelector('[data-ok]').onclick = () => { st.textContent = 'APPROVATA · INVIATA (DEMO)'; st.className = 'chip g st'; st.style.marginLeft = 'auto'; };
  setTimeout(() => show(0), 700);
  return () => clearInterval(tm);
};

MOCK.fin = el => {
  const TABS = ['TESORERIA', 'DDT', 'BANCA', 'COMMESSE', 'PRIMA NOTA', 'CHIEDI A KIT'];
  const CAP = [
    ['Cassa di oggi. Da incassare. Da pagare.', 'Tutto in una schermata, collegata al tuo gestionale.'],
    ['Un DDT. Una foto.', 'Fornitore, righe, prezzi: letti e collegati. Se un prezzo non torna, lo vedi subito.'],
    ['Banca e fatture, abbinate in un clic.', 'Quello che non torna resta in evidenza. Kit ti dice come, quando e perché riconciliarlo.'],
    ['Ogni commessa, il suo margine.', 'Costi e ricavi, sempre aggiornati.'],
    ['La prima nota si prepara da sola.', 'Tu controlli e confermi: clic su una riga.'],
    ['Chiedi, come a un collega.', 'Kit risponde, apre il grafico giusto e te lo spiega.'],
  ];
  el.innerHTML = `<div class="screen"><div class="sbar"><span class="t">FIN KIT</span><div class="tabs">${TABS.map((t, i) => `<button data-t="${i}">${t}</button>`).join('')}</div><span class="sp"></span><span class="chip c">DATI DIMOSTRATIVI</span></div><div class="sbody"></div></div>
   <div class="side"><div class="box"><h4>FIN KIT</h4><div class="fcap"></div></div><div class="box"><h4>SOPRA IL TUO GESTIONALE</h4><p>Legge fatture, banca, DDT e commesse da quello che usi già. Non lo sostituisce: li fa parlare.</p></div><div class="box"><h4>DECIDI TU</h4><p>Abbinamenti e registrazioni restano proposte finché non le confermi.</p></div></div>`;
  const body = el.querySelector('.sbody'), cap = el.querySelector('.fcap'); let auto = null, cur = 0;
  const eur = v => v.toLocaleString('it-IT') + ' €';
  const V = [
    () => `<div class="kpis reveal"><div class="kpi" style="--i:0"><div class="l">CASSA OGGI</div><div class="v cnt" data-v="248320">0 €</div></div><div class="kpi" style="--i:1"><div class="l">DA INCASSARE · 30 GG</div><div class="v g cnt" data-v="96410">0 €</div></div><div class="kpi" style="--i:2"><div class="l">DA PAGARE · 30 GG</div><div class="v a cnt" data-v="71880">0 €</div></div></div>
      <svg viewBox="0 0 800 210" style="width:100%;height:42%;margin:14px 0"><g stroke="rgba(51,214,250,.12)">${[0, 1, 2, 3, 4].map(i => `<line x1="0" x2="800" y1="${20 + i * 45}" y2="${20 + i * 45}"/>`).join('')}</g><path class="draw" fill="none" stroke="#73eaff" stroke-width="3" d="M0 150 L60 140 L120 152 L180 120 L240 128 L300 96 L360 104 L420 80 L480 92 L540 64 L600 70 L660 50 L720 58 L800 40"/><path class="draw" fill="none" stroke="#ffbd52" stroke-width="2" stroke-dasharray="6 6" d="M0 170 L100 166 L200 160 L300 150 L400 146 L500 132 L600 128 L700 118 L800 110"/></svg>
      <table class="hud"><tr style="--i:0"><th>CATEGORIA</th><th class="num">ENTRATE</th><th class="num">USCITE</th><th class="num">SALDO</th></tr>${[['Clienti', 182400, 0], ['Fornitori', 0, 96300], ['Personale', 0, 61200], ['Imposte', 0, 18900], ['Altro', 4200, 7600]].map((r, i) => `<tr style="--i:${i + 1}"><td>${r[0]}</td><td class="num">${eur(r[1])}</td><td class="num">${eur(r[2])}</td><td class="num">${eur(r[1] - r[2])}</td></tr>`).join('')}</table>`,
    () => `<div class="split"><div class="paper"><div class="ph">DOCUMENTO DI TRASPORTO N. 0482</div><div style="margin:6px 0 14px">Delta Forniture S.r.l. · 14/10</div>${Array.from({ length: 13 }, (_, i) => `<div class="pl" style="width:${55 + (i * 37) % 40}%"></div>`).join('')}<div class="beam"></div></div>
      <div><table class="hud"><tr style="--i:0"><th>ARTICOLO</th><th class="num">Q.TÀ</th><th class="num">PREZZO</th><th>COLLEGATO A</th></tr>${[['Profilo alluminio 40x40', 24, '12,80'], ['Staffa a L zincata', 120, '1,15'], ['Pannello sandwich 60', 18, '38,90'], ['Viti autofilettanti 6x40', 2000, '0,04'], ['Guarnizione EPDM', 60, '14,20', 1], ['Silicone neutro', 36, '4,90']].map((r, i) => `<tr class="${r[3] ? 'warn' : ''}" style="--i:${i + 1}"><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]} €</td><td class="links">${r[3] ? '<span class="chip a">LISTINO 12,80 € · DA CONTROLLARE</span>' : '<span class="chip c">FORNITORE</span><span class="chip c">COMMESSA 118</span><span class="chip g">FATTURA</span>'}</td></tr>`).join('')}</table></div></div>`,
    () => `<div style="position:relative;height:100%"><div class="split"><table class="hud"><tr style="--i:0"><th>MOVIMENTO BANCA</th><th class="num">IMPORTO</th></tr>${[['Bonifico Rossi Impianti', '+12.200'], ['RiBa Alfa Costruzioni', '+8.540'], ['Addebito Delta Forniture', '-4.310'], ['Bonifico n. 7781', '+2.930', 1], ['F24 ottobre', '-6.120']].map((r, i) => `<tr class="${r[2] ? 'warn' : ''}" style="--i:${i + 1}"><td>${r[0]}</td><td class="num">${r[1]} €</td></tr>`).join('')}</table>
      <table class="hud"><tr style="--i:0"><th>FATTURA</th><th>STATO</th></tr>${[['FT 41 · Rossi Impianti', 'ABBINATA'], ['FT 38 · Alfa Costruzioni', 'ABBINATA'], ['FA 2207 · Delta Forniture', 'ABBINATA'], ['— nessuna corrispondenza', 'DA CAPIRE', 1], ['F24 · Erario', 'ABBINATA']].map((r, i) => `<tr class="${r[2] ? 'warn' : ''}" style="--i:${i + 1}"><td>${r[0]}</td><td><span class="chip ${r[2] ? 'a' : 'g'}">${r[1]}</span></td></tr>`).join('')}</table></div>
      <div class="bub kit reveal" style="position:absolute;left:0;right:0;bottom:0;max-width:none"><b>CHIEDI A KIT · BONIFICO N. 7781</b><span style="--i:0">Come: è il saldo della FT 36 di Verdi Serramenti, meno lo sconto del 2% concordato in mail il 03/10. Quando: registralo oggi, chiude il mese. Perché: senza abbinamento la FT 36 resta aperta nello scadenzario.</span></div></div>`,
    () => `<table class="hud"><tr style="--i:0"><th>COMMESSA</th><th>CLIENTE</th><th class="num">RICAVI</th><th class="num">COSTI</th><th style="width:30%">MARGINE</th></tr>${[['118', 'Rossi Impianti', 84000, 61300], ['121', 'Alfa Costruzioni', 46500, 39900], ['124', 'Verdi Serramenti', 22800, 15100], ['127', 'Beta Logistica', 31200, 30400], ['130', 'Gamma Hotel', 58000, 41700]].map((r, i) => { const m = (r[2] - r[3]) / r[2] * 100; return `<tr style="--i:${i + 1}"><td>${r[0]}</td><td>${r[1]}</td><td class="num">${eur(r[2])}</td><td class="num">${eur(r[3])}</td><td><div class="mbar"><i class="${m < 10 ? 'r' : m < 18 ? 'a' : ''}" style="--w:${Math.max(4, m * 2.6)}%;--i:${i}"></i></div><small style="font-family:var(--m)">${m.toFixed(1)}%</small></td></tr>`; }).join('')}</table>`,
    () => `<table class="hud pn"><tr style="--i:0"><th>DATA</th><th>CONTO</th><th class="num">DARE</th><th class="num">AVERE</th><th>STATO</th></tr>${[['14/10', 'Clienti c/ Rossi Impianti', '', '12.200,00'], ['14/10', 'Banca c/c', '12.200,00', ''], ['15/10', 'Acquisti materiali', '4.310,00', ''], ['15/10', 'Fornitori c/ Delta Forniture', '', '4.310,00'], ['16/10', 'Erario c/ F24', '6.120,00', ''], ['16/10', 'Banca c/c', '', '6.120,00']].map((r, i) => `<tr style="--i:${i + 1};cursor:pointer"><td>${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td><td><span class="chip a">DA CONFERMARE</span></td></tr>`).join('')}</table>`,
    () => `<div class="split"><div class="chat reveal"><div class="bub me" style="--i:0"><b>TU</b>Quanto abbiamo fatturato a Rossi Impianti quest'anno?</div><div class="bub kit" style="--i:2"><b>KIT</b>184.600 € in 9 fatture, +22% sull'anno scorso. Due fatture sono ancora aperte: 18.400 € in scadenza il 30/10. Ti ho aperto il grafico per mese.</div></div>
      <svg viewBox="0 0 400 260" style="width:100%;height:100%">${[14, 18, 9, 22, 16, 25, 21, 28, 31].map((v, i) => `<rect x="${20 + i * 41}" y="${230 - v * 6.5}" width="26" height="${v * 6.5}" fill="rgba(115,234,255,.35)" stroke="#73eaff"><animate attributeName="height" from="0" to="${v * 6.5}" dur=".8s" begin="${.8 + i * .08}s" fill="freeze"/><animate attributeName="y" from="230" to="${230 - v * 6.5}" dur=".8s" begin="${.8 + i * .08}s" fill="freeze"/></rect>`).join('')}<line x1="10" x2="390" y1="230" y2="230" stroke="#33d6fa"/></svg></div>`,
  ];
  const show = i => {
    cur = i; el.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', +b.dataset.t === i));
    body.innerHTML = V[i](); cap.innerHTML = parole([{ t: CAP[i][0], c: 'big' }]) + `<p style="margin-top:8px">${CAP[i][1]}</p>`; cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on');
    body.querySelectorAll('.cnt').forEach(c => { const v = +c.dataset.v; let k = 0; const it = setInterval(() => { k++; c.textContent = eur(Math.round(v * Math.min(1, k / 24))); if (k >= 24) clearInterval(it); }, 40); });
    body.querySelectorAll('.pn tr').forEach(tr => tr.onclick = () => { const c = tr.querySelector('.chip'); if (c) { c.className = 'chip g'; c.textContent = 'CONFERMATA'; } });
  };
  el.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { clearInterval(auto); show(+b.dataset.t); });
  show(0); auto = setInterval(() => show((cur + 1) % V.length), 9000);
  return () => clearInterval(auto);
};

MOCK.task = el => {
  const days = ['LUN 20', 'MAR 21', 'MER 22', 'GIO 23', 'VEN 24'];
  const B = [[0, 0, 1, 'app', 'Riunione di squadra', '09:00–10:00'], [0, 2, 3, 'ok', 'Offerta cliente nord', '11:00–14:00'], [1, 0, 2, 'ok', 'Chiusura mese', '09:00–11:00'], [1, 4, 2, 'app', 'Visita in cantiere', '13:00–15:00'],
    [2, 0, 4, 'ok', 'Preventivo capitolato', '09:00–13:00'], [2, 5, 2, 'prop', 'Richiamo prospect', '14:00–16:00 · DA APPROVARE', 'p1'], [3, 1, 3, 'prop', 'Revisione contratti', '10:00–13:00 · DA APPROVARE', 'p2'], [3, 6, 1, 'app', 'Call fornitore', '15:00–16:00'],
    [4, 0, 2, 'ok', 'Report settimanale', '09:00–11:00'], [4, 3, 3, 'prop', 'Formazione squadra', '12:00–15:00 · DA APPROVARE', 'p3'], [1, 7, 2, 'prop', 'Follow-up demo', '16:00–18:00 · DA APPROVARE', 'p4']];
  el.innerHTML = `<div class="screen"><div class="sbar"><span class="t">TASK KIT</span><div class="tabs"><button class="on">SETTIMANA</button><button>GIORNO</button><button>MESE</button></div><span class="sp"></span><span>+ ATTIVITÀ</span><span>RIPIANIFICA</span><button class="btn g" data-all>APPROVA IL PIANO</button></div>
   <div class="sbody" style="padding:10px 14px 14px"><div class="week">${'<div></div>' + days.map(d => `<div class="d">${d}</div>`).join('')}${Array.from({ length: 10 }, (_, h) => `<div class="h">${String(9 + h).padStart(2, '0')}:00</div>` + '<div class="cell"></div>'.repeat(5)).join('')}</div></div></div>
   <div class="side"><div class="box" style="border-color:var(--cyan2)"><h4>ADESSO</h4><p class="big">Preventivo capitolato</p><p style="font:12px var(--m);color:var(--cyan2);margin:4px 0 10px">09:00–13:00 · stima 4h · 2 di 3 blocchi</p><div style="display:flex;gap:8px"><button class="btn g">FATTO</button><button class="btn c">+30 MIN</button></div></div>
   <div class="box"><h4>PROPOSTE DI KIT</h4><div style="display:flex;flex-direction:column;gap:8px">${[['p2', 'Revisione contratti giovedì 10:00', 'Scadenza venerdì: è l\'ultimo spazio libero di 3 ore.'], ['p3', 'Formazione squadra venerdì 12:00', 'Mercoledì sforava di 1h 30 oltre l\'orario: spostata.'], ['p4', 'Follow-up demo martedì 16:00', 'Dopo ogni demo serve un richiamo: stima 2h su 5 casi simili.']].map(p => `<div class="prop" data-p="${p[0]}"><div class="t">${p[1]}</div><div class="why">${p[2]}</div><button class="btn g" data-yes>SÌ</button> <button class="btn c">CAMBIA</button> <button class="btn r" data-no>NO</button></div>`).join('')}</div></div>
   <div class="box"><h4>CARICO DELLA SETTIMANA</h4><div style="display:flex;align-items:flex-end;gap:6px;height:56px">${[70, 85, 112, 80, 60].map((v, i) => `<div style="flex:1;height:${v / 1.2}%;background:${v > 100 ? 'var(--red)' : 'var(--cyan)'};opacity:.7"></div>`).join('')}</div></div></div>`;
  const wk = el.querySelector('.week');
  const place = () => {
    wk.querySelectorAll('.blk,.nowline').forEach(x => x.remove());
    const r = wk.getBoundingClientRect(); const cw = (r.width - 48) / 5, rh = (r.height - 28) / 10;
    B.forEach((b, i) => { const d = document.createElement('div'); d.className = 'blk ' + b[3]; d.style.cssText = `--i:${i};left:${48 + b[0] * cw + 3}px;width:${cw - 6}px;top:${28 + b[1] * rh + 2}px;height:${b[2] * rh - 4}px`; d.innerHTML = `${b[4]}<small>${b[5]}</small>`; if (b[6]) d.dataset.p = b[6]; d.onclick = () => approva(b[6]); wk.appendChild(d); });
    const n = document.createElement('div'); n.className = 'nowline'; n.style.cssText = `left:${48 + cw}px;width:${cw}px;top:${28 + 2.5 * rh}px`; wk.appendChild(n);
  };
  const approva = p => { if (!p) return; const b = B.find(x => x[6] === p); if (!b || b[3] !== 'prop') return; b[3] = 'ok'; b[5] = b[5].replace(' · DA APPROVARE', ' · IN CALENDARIO'); place(); wk.querySelectorAll('.blk').forEach(x => x.style.animation = 'none'); wk.querySelectorAll('.blk').forEach(x => x.style.opacity = 1); const pr = el.querySelector(`.prop[data-p="${p}"]`); if (pr) pr.classList.add('done'); };
  el.querySelectorAll('.prop').forEach(pr => { pr.querySelector('[data-yes]').onclick = () => approva(pr.dataset.p); pr.querySelector('[data-no]').onclick = () => pr.classList.add('no'); });
  el.querySelector('[data-all]').onclick = () => B.filter(b => b[3] === 'prop').forEach(b => approva(b[6]));
  requestAnimationFrame(place); const ro = new ResizeObserver(place); ro.observe(wk);
  return () => ro.disconnect();
};

// ---------- navigazione ----------
let cur = -1, gal = null, stopMock = null;
const count = document.getElementById('count'), bar = document.getElementById('bar');
function vai(n) {
  n = Math.max(0, Math.min(SLIDES.length - 1, n)); if (n === cur) return;
  const old = SLIDES[cur];
  if (old) { old.el.classList.remove('on'); if (gal) { gal.stop(); gal = null; } if (stopMock) { stopMock(); stopMock = null; } if (old.tipo === 'live') old.el.querySelector('.liveframe iframe')?.remove(); if (old.tipo === 'mock') old.el.querySelector('.mock').innerHTML = ''; }
  cur = n; const s = SLIDES[n];
  // riavvia le animazioni CSS
  s.el.classList.add('on'); s.el.querySelectorAll('.bk,.scan,li').forEach(x => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; });
  document.body.classList.toggle('dim', !!s.dim || s.tipo === 'gal' || s.tipo === 'mock');
  document.body.classList.toggle('off', s.tipo === 'live');
  if (s.tipo === 'live') { pausa(true); const f = document.createElement('iframe'); f.src = s.src; s.el.querySelector('.liveframe').appendChild(f); }
  else { pausa(false); mostra(s.tipo === 'gal' || s.tipo === 'mock' ? 'ambient' : s.scena, { offsetX: s.tipo === 'cover' ? s.off : 0, scale: s.tipo === 'cover' ? (s.sc || 1) : 1, low: !!s.low && s.scena !== 'cover' }); }
  if (s.tipo === 'gal') { gal = galleria(s); gal.start(); }
  if (s.tipo === 'mock') { stopMock = MOCK[s.mock](s.el.querySelector('.mock')); }
  count.textContent = String(n + 1).padStart(2, '0') + ' / ' + SLIDES.length;
  bar.style.width = ((n + 1) / SLIDES.length * 100) + '%';
  nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.cap === s.cap));
  history.replaceState(null, '', '#' + (n + 1));
}
function vaiACapitolo(c) { const i = SLIDES.findIndex(s => s.cap === c); if (i >= 0) vai(i); }
window.vaiACapitolo = vaiACapitolo;
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('iframe')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); vai(cur + 1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); vai(cur - 1); }
  if (e.key === 'Home') vai(0); if (e.key === 'End') vai(SLIDES.length - 1);
  if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  if (e.key === '?' || e.key === 'h') document.getElementById('help').classList.toggle('on');
  if (e.key === 'Escape') document.getElementById('help').classList.remove('on');
  if (/^[1-7]$/.test(e.key)) vaiACapitolo(KITS[+e.key - 1].cap);
});
document.getElementById('prev').onclick = () => vai(cur - 1);
document.getElementById('next').onclick = () => vai(cur + 1);
document.getElementById('help').onclick = () => document.getElementById('help').classList.remove('on');
setInterval(() => { const d = new Date(); document.getElementById('clock').textContent = d.toLocaleDateString('it-IT') + ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); }, 1000);

document.fonts.load('600 40px "Chakra Petch"').then(() => vai(Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)));
