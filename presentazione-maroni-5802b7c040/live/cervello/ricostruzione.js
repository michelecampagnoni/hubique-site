"use strict";
/* Cervello · RICOSTRUZIONE · chat vera (19/10/2026).
   Stati della pagina (indirizzo):  #            chat vuota, cervello spento in attesa
                                     #r=<id>      una ricostruzione salvata (o in corso: avanzamento per fasi)
   Cambiare ricostruzione = ricaricare la pagina con un altro #r: il cervello 3D si ridisegna da zero coi dati salvati.
   Ponte: window.webkit.messageHandlers.cervello.postMessage({cmd,…}) → Promise con una riga JSON (CervelloPonte.swift →
   strumenti/cervello_ricostruzione.py). Nelle prove fuori dall'app si può definire window.cervelloPonte(msg). */

const $ = id => document.getElementById(id);
const chat = $("chat");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const num = (x, d = 0) => Number(x || 0).toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });
const minSec = s => s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${num(s, 0)} s`;
const ora = iso => { const m = String(iso || "").match(/T(\d{2}:\d{2})/); return m ? m[1] : ""; };
const giorno = iso => { const m = String(iso || "").match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : ""; };

/* ---------------------------------------------------------------- ponte con l'app */
const PONTE = (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cervello) ? window.webkit.messageHandlers.cervello : null;
async function ponte(cmd, args = {}) {
  const msg = { cmd, ...args };
  let r;
  if (window.cervelloPonte) r = await window.cervelloPonte(msg);
  else if (PONTE) r = await PONTE.postMessage(msg);
  else throw new Error("questa pagina funziona dentro Jarvis (manca il ponte con l'app)");
  const d = typeof r === "string" ? JSON.parse(r) : r;
  if (d && d.errore) throw new Error(d.errore);
  return d;
}
const haPonte = () => !!(window.cervelloPonte || PONTE);
function log(t) { try { window.webkit.messageHandlers.log.postMessage(String(t).slice(0, 300)); } catch (e) { /* fuori dall'app */ } }

/* ---------------------------------------------------------------- stato */
let R = null;                 // ricostruzione aperta (apri)
let RID = null;               // suo id (nome della cartella)
let FONTI = {}, CRONO = [], ORDINE = [], G3 = { nodi: [], archi: [], lobi: [], corsie: [] };
let NODO3 = {}, LEG3 = {};
let CITATI = [];
let risposto = false, correnteLettore = null, salvato = null, timerStato = null, ultimoStato = null;
const LOBI_VUOTI = [{ nome: "COMMERCIALE", sotto: "" }, { nome: "PRODUZIONE · R&S", sotto: "" }, { nome: "AMMINISTRAZIONE", sotto: "" }, { nome: "LEGALE", sotto: "" }];
const ESEMPI = ["Com'è andata la consegna degli arredi a Corvenna Hotels e la penale?",
                "Perché il laminato di Seravo è arrivato in ritardo?",
                "Ricostruisci la non conformità sulle ante graffiate"];

function oraTop() { const d = new Date(); $("ora").textContent = d.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).toUpperCase() + " · " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); }
oraTop(); setInterval(oraTop, 30000);

function intestazione() {
  if (!R) { $("testa").innerHTML = `<span class="meta">Nuova ricostruzione · scrivi la domanda qui sotto</span>`; return; }
  const turni = (R.turni || []).filter(t => t.chi === "tu").length;
  const met = R.metriche || {};
  $("testa").innerHTML = `<span class="codice">${esc(R.codice || "Cervello")}</span><span class="titolo-sessione" title="${esc(R.domanda)}">${esc(R.titolo)}</span>` +
    `<span class="meta">${giorno(R.creata)} · ${turni} ${turni === 1 ? "DOMANDA" : "DOMANDE"}${met.costo_usd != null ? " · " + num(met.costo_usd + (met.seguiti_costo_usd || 0), 2) + " $" : ""}</span>`;
}

/* ---------------------------------------------------------------- etichette, rimandi */
const NAT_LAB = { F: ["fatto", "FATTO"], M: ["tua", "TUA DICHIARAZIONE"], C: ["contro", "DICH. CONTROPARTE"], Q: ["domanda", "TUA DOMANDA A CHATGPT"], A: ["ass", "RISPOSTA ASSISTENTE · NON PROVA"], I: ["ipotesi", "IPOTESI"] };
const TIT_NAT = { F: "Fatto letto nella fonte", M: "Tua posizione o tuo racconto: non è un fatto accertato", C: "Posizione di altri scritta in una fonte", Q: "Cosa hai chiesto a ChatGPT: è una tua azione datata", A: "Proposta di ChatGPT: non prova i fatti", I: "Collegamento ipotizzato: la fonte non lo dice" };
const N = k => NAT_LAB[k] ? `<span class="nat ${NAT_LAB[k][0]}" title="${TIT_NAT[k]}">${NAT_LAB[k][1]}</span>` : "";
const isChat = n => FONTI[n] && FONTI[n].tipo === "chat ChatGPT";
const isMail = n => !!(FONTI[n] && /^mail/.test(FONTI[n].tipo));
function dataDi(n) {
  const f = FONTI[n]; if (!f) return "";
  if (f.data) return f.data;
  if (f.mail && f.mail.quando) return f.mail.quando;
  const ev = (f.ev || []).find(e => e.dd === "testo" || e.dd === "intestazione");
  return ev ? ev.d : (f.data_file ? "file " + f.data_file : "senza data");
}
const R1 = n => { const f = FONTI[n]; if (!f) return ""; return `<span class="rif${isChat(n) ? " cg" : ""}" data-n="${n}" role="button" tabindex="0" title="${esc(f.tit)} · ${esc(dataDi(n))}">${n}</span>`; };

/* Markdown del racconto → HTML: titoli, elenchi, grassetto, [n] cliccabili, DICHIARAZIONE/IPOTESI come etichette. */
function inline(t) {
  let h = esc(t);
  h = h.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, "$1<i>$2</i>");
  h = h.replace(/\[(\d+(?:\s*[,;–-]\s*\d+)*)\]/g, (m, g) => {
    let ns = g.split(/\s*[,;]\s*/).flatMap(x => { const r = x.match(/^(\d+)\s*[–-]\s*(\d+)$/); if (r) { const a = []; for (let i = +r[1]; i <= +r[2]; i++) a.push(String(i)); return a; } return [x.trim()]; });
    ns = ns.filter(n => FONTI[n]);
    return ns.map(R1).join("");
  });
  h = h.replace(/(^|<b>|\s)DICHIARAZIONE(\s+(?:di|del|della|dello)\s+)(?!Michele|te\b)/g, (m, a, b) => a + N("C") + b.trimStart())
       .replace(/(^|<b>|\s)(DICHIARAZIONE)(\s*[:·-]?\s*)/g, (m, a, b, c) => a + N("M"))
       .replace(/(^|<b>|\s)(IPOTESI)(\s*[:·-]?\s*)/g, (m, a, b, c) => a + N("I"));
  return h;
}
function mdHTML(md, opz = {}) {
  const righe = String(md || "").split("\n");
  const out = []; let lista = false, tre = false;
  const chiudi = () => { if (lista) { out.push("</ul>"); lista = false; } };
  for (const riga of righe) {
    const r = riga.trimEnd();
    if (/^\s*$/.test(r)) { chiudi(); continue; }
    const h = r.match(/^(#{1,4})\s*(.*)$/);
    if (h) {
      chiudi(); if (tre) { out.push("</ul></div>"); tre = false; }
      if (opz.salta && /^fonti\b/i.test(h[2])) break;
      const lv = Math.min(4, h[1].length + 1);
      out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); continue;
    }
    const tr = r.match(/^\*\*In tre righe:?\*\*:?\s*(.*)$/i);
    if (tr) { chiudi(); out.push(`<div class="tre"><div class="h">IN TRE RIGHE</div><ul>`); tre = true; if (tr[1]) out.push(`<li>${inline(tr[1])}</li>`); continue; }
    const li = r.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (tre && (li || !/^#/.test(r))) { out.push(`<li>${inline(li ? li[1] : r)}</li>`); continue; }
    if (li) { if (!lista) { out.push("<ul>"); lista = true; } out.push(`<li>${inline(li[1])}</li>`); continue; }
    chiudi(); out.push(`<p>${inline(r)}</p>`);
  }
  chiudi(); if (tre) out.push("</ul></div>");
  return out.join("\n");
}
/* «In tre righe» finisce al primo titolo: il ciclo sopra chiude il box quando arriva un titolo. */

/* ---------------------------------------------------------------- chat */
function aggiungi(html, cl = "") { const d = document.createElement("div"); d.className = "msg" + (cl ? " " + cl : ""); d.innerHTML = html; chat.appendChild(d); return d; }
const testa = (chi, quando) => `<div class="msg-head ${chi === "TU" ? "tu" : "jarvis"}">${chi}${quando ? "  ·  " + quando : ""}</div>`;
function rigaFlusso(h) { const f = $("flusso"); const z = f.querySelector(".fermo"); if (z) z.remove(); const r = document.createElement("div"); r.className = "r"; r.innerHTML = h; f.appendChild(r); f.scrollTop = f.scrollHeight; }

function vuota() {
  R = null; RID = null; risposto = false;
  intestazione();
  $("btnScarica").disabled = true;
  $("campo").placeholder = "Chiedi al cervello di ricostruire una vicenda…";
  chat.innerHTML = `<div class="vuota-chat">
    <div class="gr">Che vicenda ricostruiamo?</div>
    <div class="pc">Scrivi una domanda su un cliente, un fornitore, un contratto o una trattativa: apro davvero documenti, mail e chat ChatGPT,
      li collego e ti racconto com'è andata, con le fonti numerate. Ci vogliono alcuni minuti; intanto la pagina resta usabile.</div>
    <div class="esempi">${ESEMPI.map(e => `<button type="button" data-es="${esc(e)}">${esc(e)}</button>`).join("")}</div>
    <div class="recenti" id="recenti"></div>
    ${haPonte() ? "" : `<div class="ponte-assente">Ponte con l'app non disponibile: aperta fuori da Jarvis, la pagina non può avviare né riaprire ricostruzioni.</div>`}
  </div>`;
  chat.querySelectorAll("[data-es]").forEach(b => b.onclick = () => { $("campo").value = b.dataset.es; $("campo").focus(); });
  $("flusso").innerHTML = `<div class="fermo">Nessun lavoro in corso</div>`;
  $("cap").textContent = "In attesa di una domanda: le fonti della ricostruzione si accendono qui";
  G3 = { nodi: [], archi: [], lobi: LOBI_VUOTI, corsie: [{ nome: "" }, { nome: "" }, { nome: "" }], cervelletto: "" };
  pronto3D();
  if (haPonte()) ponte("elenco").then(d => {
    const l = (d.ricostruzioni || []).slice(0, 5);
    if (l.length && $("recenti")) $("recenti").innerHTML = `<div class="h">ULTIME RICOSTRUZIONI</div>` + l.map(voceHTML).join("");
  }).catch(e => log("elenco: " + e.message));
  $("campo").focus();
}

async function inviaDomanda(testo) {
  testo = testo.trim(); if (!testo) return;
  if (!haPonte()) { avviso("Fuori da Jarvis la pagina non può avviare una ricostruzione.", true); return; }
  $("campo").value = ""; $("invia").disabled = true;
  try {
    if (!R) {
      chat.innerHTML = ""; aggiungi(`${testa("TU", new Date().toTimeString().slice(0, 5))}<div class="msg-body">${esc(testo)}</div>`);
      aggiungi(`${testa("JARVIS")}<div class="msg-body"><p class="riga-dim">Avvio la ricostruzione…</p></div>`);
      const d = await ponte("nuova", { domanda: testo });
      vai(d.id);
    } else {
      if (ultimoStato && ["in_corso", "attesa_password"].includes(ultimoStato.stato)) { avviso("Aspetta che finisca il lavoro in corso su questa ricostruzione.", true); $("campo").value = testo; return; }
      await ponte("segui", { id: RID, testo });
      R.turni = (R.turni || []).concat([{ chi: "tu", testo, quando: new Date().toISOString().slice(0, 19) }]);
      disegnaTurni(); seguiStato();
    }
  } catch (e) { avviso("Non riesco ad avviare: " + e.message, true); $("campo").value = testo; }
  finally { $("invia").disabled = false; }
}
function vai(id) { location.hash = id ? "r=" + encodeURIComponent(id) : ""; location.reload(); }

/* ---------------------------------------------------------------- una ricostruzione */
async function apri(id) {
  RID = id;
  let d;
  try { d = await ponte("apri", { id }); }
  catch (e) { chat.innerHTML = `<div class="vuota-chat"><div class="gr">Ricostruzione non trovata</div><div class="pc">${esc(e.message)}</div></div>`; pronto3D(); return; }
  R = d; FONTI = d.FONTI || {}; CRONO = d.CRONO || [];
  G3 = d.GRAFO || { nodi: [], archi: [], lobi: LOBI_VUOTI, corsie: [{ nome: "" }, { nome: "" }, { nome: "" }] };
  NODO3 = Object.fromEntries(G3.nodi.map(x => [x.id, x]));
  LEG3 = {}; G3.archi.forEach(a => { (LEG3[a.a] = LEG3[a.a] || []).push(a); (LEG3[a.b] = LEG3[a.b] || []).push(a); });
  intestazione();
  $("btnScarica").disabled = R.stato !== "fatta";
  risposto = R.stato === "fatta";
  disegnaTurni();
  pronto3D();
  if (risposto) { accendi(true); $("campo").placeholder = "Chiedi altro su questa vicenda o rispondi alla domanda…"; }
  const s = d.stato_lavoro;
  if (s && ["in_corso", "attesa_password"].includes(s.stato)) seguiStato();
  else if (s) mostraFlusso(s);
}

function disegnaTurni() {
  chat.innerHTML = "";
  const turni = R.turni || [];
  turni.forEach((t, i) => {
    if (t.chi === "tu") { aggiungi(`${testa("TU", ora(t.quando))}<div class="msg-body">${esc(t.testo)}</div>`); return; }
    if (t.tipo === "racconto") { const m = aggiungi(rispostaHTML(t)); collegaRisposta(m); return; }
    const m = aggiungi(`${testa("JARVIS", ora(t.quando))}<div class="msg-body">${mdHTML(t.md, { salta: true })}</div>`, "seguito"); collegaRisposta(m);
  });
  if (R.stato === "in_corso" || R.stato_seguito === "in_corso") aggiungi(`${testa("JARVIS")}<div class="msg-body" id="lavoroBox"></div>`);
  if (R.stato === "errore" || R.stato_seguito === "errore") aggiungi(`${testa("JARVIS")}<div class="msg-body"><div class="lavoro err"><div class="h">IL LAVORO SI È FERMATO</div><div class="nota">Rifai la domanda con + NUOVA (o riscrivila qui sotto). Il log è nella cartella della ricostruzione.</div></div></div>`);
  if (R.stato === "fatta") {
    const prima = chat.querySelector(".msg");
    if (turni.length <= 2) { const m = chat.querySelectorAll(".msg")[1]; if (m) osservaSotto(m); }
    if (prima) chat.scrollTop = 0;
  } else chat.scrollTop = chat.scrollHeight;
}

/* ----- risposta principale: racconto (Sonnet), miniature, come ho lavorato, chiarimento (Opus), fonti ----- */
function rispostaHTML(t) {
  const md = String(t.md || "").split(/\n#+\s*Fonti\b/)[0];
  const citati = [...new Set([...md.matchAll(/\[(\d+(?:\s*[,;–-]\s*\d+)*)\]/g)].flatMap(m => m[1].split(/\s*[,;]\s*/).flatMap(x => { const r = x.match(/^(\d+)\s*[–-]\s*(\d+)$/); if (r) { const a = []; for (let i = +r[1]; i <= +r[2]; i++) a.push(String(i)); return a; } return [x.trim()]; })))].filter(n => FONTI[n]);
  CITATI = citati.slice();
  ORDINE = citati.slice().sort((a, b) => a - b);
  Object.keys(FONTI).sort((a, b) => a - b).forEach(n => { if (!ORDINE.includes(n)) ORDINE.push(n); });
  const prime = citati.slice(0, 3), altre = citati.slice(3, 18);
  const ris = (R.riservato || {});
  const elencoRis = (ris.elenco || []);
  return `${testa("JARVIS", ora(t.quando))}
  <div class="msg-body">${mdHTML(md, { salta: true })}
    <div class="legenda">Come leggere: ${N("F")} ${N("M")} ${N("C")} ${N("Q")} ${N("A")} ${N("I")} · i numeri sono le fonti: clic per aprirle, si accendono nel cervello.</div>
  </div>
  ${prime.length ? `<div class="miniature">${prime.map(cardMini).join("")}${altre.length ? `<button class="azione vedi" data-vedi aria-expanded="false">VEDI ALTRE ${altre.length} FONTI</button>` : ""}</div>
  <div class="altri" hidden>${altre.map(cardMini).join("")}</div>` : ""}
  ${strisciaHTML()}
  ${t.chiarimento ? `<div class="chiarimento"><div class="h">? COSE CHE NON TORNANO · VERIFICATE DA OPUS</div>${mdHTML(t.chiarimento.replace(/^#+\s*Cose che non tornano\s*$/im, ""))}<p class="dopo2">Puoi rispondere qui sotto: la tua risposta resta come tua dichiarazione, non come documento.</p></div>` : ""}
  ${ris.aperto ? `<div class="riservato-no"><b>RISERVATO APERTO</b> · con la tua password: archivi riservati letti in memoria, mai salvati in chiaro.</div>` : ""}
  ${elencoRis.length ? `<div class="riservato-no"><b>RISERVATO NON APERTO (${elencoRis.length})</b> · solo elencati, senza la password: ${elencoRis.slice(0, 12).map(x => esc(x.titolo)).join(" · ")}${elencoRis.length > 12 ? " …" : ""}</div>` : ""}
  <div class="elencofonti sottoapri" data-sotto><button type="button" aria-expanded="false">FONTI CITATE (${citati.length}) · TUTTE LE FONTI LETTE (${Object.keys(FONTI).length}) ▾</button>
    <ol>${ORDINE.map(n => `<li>${R1(n)} ${esc(FONTI[n].tit)} · ${esc(FONTI[n].tipo)} · ${esc(dataDi(n))}${citati.includes(n) ? "" : " · <i>non citata</i>"}</li>`).join("")}</ol></div>`;
}
function strisciaHTML() {
  const m = R.metriche || {}, F = m.fasi || {};
  if (!F.lettura) return "";
  const v = F.verifica || {}, L = (F.collegamento || {}).legami_per_tipo || {};
  const fase = (n, cl, mod, io, k, perche) => `<div class="fase"><div class="fn">${n}</div><div class="fm ${cl}">${mod}</div><span class="fio">${io}</span><div class="fk">${k}</div><div class="fperche">${perche}</div></div>`;
  const k = f => `${f.chiamate || 0} chiamate · ${minSec(f.secondi || 0)} · ${num(f.costo_usd, 2)} $`;
  const rc = (F.racconto || {}).chiamate || [];
  return `<div class="striscia" id="striscia">
    <button type="button" data-striscia aria-expanded="false"><span class="lab">COME HO LAVORATO</span>
      <span class="num">${F.raccolta.fonti} fonti raccolte, ${F.lettura.fonti_lette} lette davvero · ${F.lettura.eventi} eventi · ${F.collegamento.legami} legami · ${minSec(m.secondi)} · ${num(m.costo_usd, 2)} $ a listino</span><span class="fr">APRI ▾</span></button>
    <div class="corpo"><div class="catena">
      ${fase("1 · RACCOLTA", "py", "Python + Haiku", `domanda → termini (Haiku), poi <b>${F.raccolta.fonti} fonti candidate</b>`, k(F.raccolta), "Cercare nei cataloghi è aritmetica: Python; Haiku solo per capire la domanda.")}
      ${fase("2 · LETTURA", "hk", "Haiku", `apre <b>${F.lettura.fonti_lette} fonti</b> a ondate → <b>${F.lettura.eventi} eventi</b> con data, chi, cosa, importi`, k(F.lettura), "Estrarre fatti da un testo per volta: il modello più economico basta. Le fonti già lette tornano dalla cache.")}
      ${fase("3 · COLLEGAMENTO", "py", "Python", `<b>${F.collegamento.legami} legami</b>, ${F.collegamento.contraddizioni} cose che forse non tornano`, `0 chiamate · ${minSec(F.collegamento.secondi || 0)} · 0 $`, "Confrontare date, nomi, importi e allegati: gratis e ripetibile.")}
      ${fase("4 · RACCONTO", "sn", "Sonnet ‖ Opus", `racconto con <b>${F.collegamento.fonti_numerate} fonti numerate</b>; Opus solo sulle cose che non tornano`, `${rc.length} chiamate · ${minSec(F.racconto.secondi || 0)} · ${num(F.racconto.costo_usd, 2)} $`, "Tenere insieme centinaia di eventi in un testo causale; il modello migliore solo dove l'errore costa.")}
      ${fase("5 · VERIFICA", "py", "Python + Haiku", `${v.sostenute || 0} frasi sostenute, ${v.parziali || 0} parziali, ${v.non_sostenute || 0} no · <b>${num(v.precisione_pct, 0)} %</b>`, `${v.chiamate || 0} chiamate · ${minSec(v.secondi || 0)} · ${num(v.costo_usd, 3)} $`, "Ogni [n] controllato sugli eventi della fonte: date e importi.")}
    </div>
    <div class="legtipi">Legami: ${Object.entries(L).map(([a, b]) => `${a.replace(/_/g, " ")} ${b}`).join(" · ")}</div>
    <div class="notacosti">Costo a listino del CLI: con il piano Max rientra nelle quote.</div></div></div>`;
}
function cardMini(id) {
  const f = FONTI[id]; if (!f) return "";
  const numero = `<span class="rif n${isChat(id) ? " cg" : ""}">${id}</span>`;
  if (isChat(id)) {
    const q = (f.ev || []).filter(e => e.n === "Q").slice(0, 2);
    return `<button class="mini chatg" data-apri="${id}" aria-label="Giornata di chat ChatGPT del ${esc(f.data)}">
      <div class="ico"><div><span class="busta">◷ CHATGPT · ${f.nq || 0} DOMANDE</span>${q.map(e => `<span class="q"><i>${esc(e.o || "")}</i>${esc(String(e.a).replace(/^(Michele )?(Chiede a ChatGPT (di )?)?/i, ""))}</span>`).join("")}</div></div>${numero}
      <div class="t">${esc(f.conv || f.tit)}</div><div class="d">${esc(f.data)}${f.ore ? " · " + esc(f.ore) : ""} · CHAT</div></button>`;
  }
  if (f.mail) return `<button class="mini mail" data-apri="${id}" aria-label="Mail ${esc(f.tit)}">
      <div class="ico"><div><span class="busta" style="color:var(--violet)">✉ MAIL</span>${esc(f.mail.da)} → ${esc(f.mail.a)}${(f.mail.allegati || []).length ? `<br>📎 ${esc(f.mail.allegati.length)} allegati` : ""}</div></div>${numero}
      <div class="t">${esc(f.tit)}</div><div class="d">${esc(f.mail.quando)}</div></button>`;
  if (f.img) return `<button class="mini" data-apri="${id}" aria-label="${esc(f.tit)}"><img src="${esc(R.base + f.img)}" alt="" loading="lazy">${numero}<div class="t">${esc(f.tit)}</div><div class="d">${esc(dataDi(id))}</div></button>`;
  return `<button class="mini${f.riservato ? " ris" : ""}" data-apri="${id}"><div class="ico"><div><b>${f.riservato ? "RIS" : "DOC"}</b>${f.riservato ? "Archivio riservato" : "Anteprima non disponibile"}</div></div>${numero}<div class="t">${esc(f.tit)}</div><div class="d">${esc(dataDi(id))}</div></button>`;
}
function collegaRisposta(m) {
  m.addEventListener("click", e => {
    const r = e.target.closest(".rif[data-n]"); if (r) { apriLettore(r.dataset.n, r); return; }
    const a = e.target.closest("[data-apri]"); if (a) { apriLettore(a.dataset.apri, a); return; }
    const v = e.target.closest("[data-vedi]");
    if (v) { const g = m.querySelector(".altri"); g.hidden = !g.hidden; v.textContent = g.hidden ? `VEDI ALTRE ${g.children.length} FONTI` : "MOSTRA MENO"; v.setAttribute("aria-expanded", String(!g.hidden)); return; }
    const s = e.target.closest("[data-striscia]");
    if (s) { const b = s.parentElement; b.classList.toggle("aperta"); const o = b.classList.contains("aperta"); s.setAttribute("aria-expanded", String(o)); s.querySelector(".fr").textContent = o ? "CHIUDI ▴" : "APRI ▾"; return; }
    const so = e.target.closest("[data-sotto]>button");
    if (so) { const b = so.parentElement; b.classList.toggle("aperta"); const o = b.classList.contains("aperta"); so.setAttribute("aria-expanded", String(o)); so.innerHTML = so.innerHTML.replace(/[▾▴]$/, o ? "▴" : "▾"); }
  });
  m.addEventListener("keydown", e => { const r = e.target.closest(".rif[data-n]"); if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); apriLettore(r.dataset.n, r); } });
  m.addEventListener("mouseover", e => { const t = e.target.closest(".rif[data-n],[data-apri]"); if (t) selezionaNodo(t.dataset.n || t.dataset.apri); });
  m.addEventListener("mouseout", e => { const t = e.target.closest(".rif[data-n],[data-apri]"); if (t && !correnteLettore) selezionaNodo(null); });
}
let osservatore = null;
function osservaSotto(m) {
  const target = m.querySelector(".chiarimento"); if (!target) return; if (osservatore) osservatore.disconnect();
  osservatore = new IntersectionObserver(([e]) => { $("sottoHint").hidden = e.isIntersecting || !risposto; if (e.isIntersecting) osservatore.disconnect(); }, { root: chat, threshold: .2 });
  osservatore.observe(target);
}
$("sottoHint").onclick = () => { const t = chat.querySelector(".chiarimento"); if (t) chat.scrollTop = t.offsetTop - 60; $("sottoHint").hidden = true; };

/* ---------------------------------------------------------------- avanzamento della catena (stato.json) */
const ICONA = { attesa: "·", in_corso: "●", fatta: "✓", saltata: "–" };
function lavoroHTML(s) {
  const L = s.lettura;
  const fasi = (s.fasi || []).map(f => {
    let det = f.dettaglio || "";
    let barra = "";
    if (f.k === "lettura" && f.stato === "in_corso" && L) {
      det = `ondata ${L.ondata}: lettura ${L.fatte}/${L.totale} · ${L.fonti_lette} fonti prese su ${L.fonti_candidate} candidate` + (det ? " · " + det.replace(/^ondata \d+ · /, "") : "");
      barra = `<div class="barra-l"><i style="width:${L.totale ? Math.round(100 * L.fatte / L.totale) : 0}%"></i></div>`;
    }
    return `<li class="${f.stato}"><span class="i">${ICONA[f.stato] || "·"}</span><span class="n">${esc(f.nome)}</span><span>${esc(det)}${barra}</span></li>`;
  }).join("");
  const err = ["errore", "interrotta"].includes(s.stato);
  return `<div class="lavoro${err ? " err" : ""}"><div class="h">${err ? "IL LAVORO SI È FERMATO" : s.tipo === "segui" ? "RISPONDO SUGLI EVENTI GIÀ LETTI" : "RICOSTRUISCO DALLE FONTI"}<span class="tm">${minSec(s.secondi || 0)} · ${num(s.costo_usd, 2)} $</span></div>
    <ul class="fasi-l">${fasi}</ul>
    <div class="nota">${err ? esc(s.messaggio || "") : s.tipo === "segui" ? "Di solito meno di un minuto." : "Di solito 3-7 minuti. Puoi aprire altre ricostruzioni o farne una nuova: questa continua e resta salvata."}</div></div>`;
}
function mostraFlusso(s) {
  const f = $("flusso"); if (!f) return;
  f.innerHTML = (s.fasi || []).filter(x => x.stato !== "attesa").map(x => `<div class="r"><b>${esc(x.nome)}</b> · ${esc(x.dettaglio || "")}</div>`).join("") || `<div class="fermo">Nessun lavoro in corso</div>`;
  f.scrollTop = f.scrollHeight;
}
function seguiStato() {
  if (timerStato) clearInterval(timerStato);
  const giro = async () => {
    let s;
    try { s = await ponte("stato", { id: RID }); } catch (e) { log("stato: " + e.message); return; }
    ultimoStato = s;
    const box = $("lavoroBox") || (aggiungi(`${testa("JARVIS")}<div class="msg-body" id="lavoroBox"></div>`), $("lavoroBox"));
    box.innerHTML = lavoroHTML(s);
    mostraFlusso(s);
    const corre = ["in_corso", "attesa_password"].includes(s.stato);
    $("chip").classList.toggle("on", corre);
    $("chip").textContent = corre ? `● ${s.stato === "attesa_password" ? "ASPETTO LA PASSWORD" : "RICOSTRUISCO DALLE FONTI"} · ${minSec(s.secondi || 0)}` : "";
    if (s.stato === "attesa_password") chiediPassword(s, box); else { const c = $("chiave"); if (c) c.remove(); }
    if (!corre) {
      clearInterval(timerStato); timerStato = null;
      if (s.stato === "fatta") { if (s.tipo === "segui") { const d = await ponte("apri", { id: RID }); R = d; intestazione(); disegnaTurni(); const ult = chat.lastElementChild; if (ult) chat.scrollTop = ult.offsetTop - 16; } else location.reload(); }
    }
  };
  giro(); timerStato = setInterval(giro, 2000);
}

/* ----- password degli archivi riservati: UNA domanda; ricordata dall'app fino alla sua chiusura, mai su disco ----- */
let passwordInviata = false;
async function chiediPassword(s, box) {
  if ($("chiave")) { const e = $("chiaveErr"); if (e) e.textContent = s.password_errata ? `Password errata (${s.password_errata}/3): riprova.` : ""; return; }
  if (!passwordInviata) {
    try { const h = await ponte("haPassword"); if (h.ricordata) { passwordInviata = true; await ponte("password", { id: RID, ricordata: true }); rigaFlusso("uso la password già data in questa sessione dell'app"); return; } } catch (e) { log("password ricordata: " + e.message); }
  }
  const l = (s.riservati || []);
  const d = document.createElement("div"); d.className = "chiave"; d.id = "chiave";
  d.innerHTML = `<div class="h">ARCHIVI RISERVATI · SERVE LA TUA PASSWORD</div>
    <p>Per questa vicenda ci sono ${l.length} archivi o chat riservate pertinenti. Con la password li apro in memoria e li uso nel racconto; senza, li elenco soltanto.</p>
    <ul>${l.map(x => `<li>${esc(x.tipo)} · ${esc(x.titolo)}${x.data ? " · " + esc(String(x.data).slice(0, 10)) : ""}</li>`).join("")}</ul>
    <form id="chiaveForm"><input type="password" id="chiavePw" placeholder="password" autocomplete="off" aria-label="Password degli archivi riservati">
      <label><input type="checkbox" id="chiaveRic" checked> ricordala fino alla chiusura di Jarvis</label>
      <button class="azione" type="submit">APRI</button><button class="azione" type="button" id="chiaveSalta">SOLO ELENCO</button>
      <span class="errata" id="chiaveErr">${s.password_errata ? `Password errata (${s.password_errata}/3): riprova.` : ""}</span></form>
    <p class="riga-dim">La password non viene mai scritta su disco: passa solo dall'app al lavoro in corso.</p>`;
  box.after(d);
  $("chiaveForm").onsubmit = async e => {
    e.preventDefault(); const pw = $("chiavePw").value; if (!pw) return;
    $("chiavePw").value = "";
    try { await ponte("password", { id: RID, password: pw, ricorda: $("chiaveRic").checked }); passwordInviata = true; $("chiaveErr").textContent = "verifico…"; }
    catch (err) { $("chiaveErr").textContent = err.message; }
  };
  $("chiaveSalta").onclick = async () => { try { await ponte("salta", { id: RID }); d.remove(); } catch (err) { $("chiaveErr").textContent = err.message; } };
  $("chiavePw").focus();
}

/* ---------------------------------------------------------------- elenco delle ricostruzioni */
function voceHTML(x) {
  const st = { in_corso: ["IN CORSO", "corso"], attesa_password: ["ASPETTA LA PASSWORD", "corso"], errore: ["ERRORE", "err"], interrotta: ["INTERROTTA", "err"] }[x.stato];
  return `<button class="voce${x.id === RID ? " attiva" : ""}" data-r="${esc(x.id)}"><span class="cod">${esc(x.codice)}</span><span class="t">${esc(x.titolo)}</span>
    <span class="s ${st ? st[1] : ""}">${st ? st[0] : (giorno(x.creata) + (x.fonti ? " · " + x.fonti + " FONTI" : ""))}</span><span class="q">${esc(x.domanda)}</span></button>`;
}
async function apriElenco() {
  $("elenco").hidden = false; $("btnElenco").setAttribute("aria-expanded", "true");
  $("elencoCorpo").innerHTML = `<div class="elenco-vuoto">Carico…</div>`;
  try {
    const d = await ponte("elenco");
    const l = d.ricostruzioni || [];
    $("elencoCorpo").innerHTML = l.length ? l.map(voceHTML).join("") : `<div class="elenco-vuoto">Nessuna ricostruzione salvata: fai la prima domanda.</div>`;
  } catch (e) { $("elencoCorpo").innerHTML = `<div class="elenco-vuoto">${esc(e.message)}</div>`; }
  $("elencoChiudi").focus();
}
function chiudiElenco() { $("elenco").hidden = true; $("btnElenco").setAttribute("aria-expanded", "false"); }
document.addEventListener("click", e => { const v = e.target.closest("[data-r]"); if (v) { e.preventDefault(); if (v.dataset.r !== RID) vai(v.dataset.r); else chiudiElenco(); } });
$("btnElenco").onclick = () => $("elenco").hidden ? apriElenco() : chiudiElenco();
$("elencoChiudi").onclick = chiudiElenco;
$("btnNuova").onclick = () => { if (!R && !location.hash) { $("campo").focus(); return; } vai(null); };

/* ---------------------------------------------------------------- SCARICA: zip in Download, mostrato nel Finder */
function avviso(t, err) { const a = $("avvisoScarica"); a.hidden = false; a.classList.toggle("err", !!err); a.textContent = t; clearTimeout(avviso.t); avviso.t = setTimeout(() => { a.hidden = true; }, 12000); }
$("btnScarica").onclick = async () => {
  if (!RID) return;
  const b = $("btnScarica"); b.disabled = true; b.textContent = "PREPARO LO ZIP…";
  try {
    const d = await ponte("scarica", { id: RID });
    const nome = d.zip.split("/").pop();
    avviso(`Zip salvato in Download e mostrato nel Finder: «${nome}» · ${d.fonti} fonti, ${d.file_copiati} file copiati · ${num(d.dimensione_mb, 1)} MB`);
  } catch (e) { avviso("Zip non riuscito: " + e.message, true); }
  finally { b.disabled = false; b.textContent = "SCARICA"; }
};

/* ---------------------------------------------------------------- lettore interno */
const evRiga = e => `<li><span class="o">${esc(e.d)}${e.o ? " " + esc(e.o) : ""}</span>${N(e.n)}${esc(e.a)}${e.c ? `<q>${esc(e.c)}</q>` : ""}</li>`;
function legamiHTML(f) {
  if (!f.leg || !f.leg.length) return "";
  return `<div class="blocco"><span class="lab">LEGAMI CON ALTRE FONTI (PYTHON)</span><ul class="legl">${f.leg.filter(l => FONTI[l[0]]).map(l => `<li><b>${esc(String(l[1]).toUpperCase())}</b> → ${R1(String(l[0]))} ${esc(FONTI[l[0]].tit)} · <span>${esc(l[2])}</span></li>`).join("")}</ul></div>`;
}
function apriLettore(id, origine) {
  id = String(id); const f = FONTI[id]; if (!f) return;
  if (!correnteLettore) salvato = { scroll: chat.scrollTop, origine, id };
  correnteLettore = id;
  $("letN").textContent = id; $("letN").className = "rif" + (isChat(id) ? " cg" : "");
  $("letTit").textContent = f.tit;
  $("letSotto").textContent = [dataDi(id), f.tipo, f.prov].filter(Boolean).join(" · ");
  let h = "";
  if (isChat(id)) {
    h = `<div class="schedachat"><div class="busta">◷ CHATGPT · GIORNATA DEL ${esc(f.data)}</div><div class="ogg">Conversazione «${esc(f.conv)}»</div>
      <div class="mdati">${f.msg || 0} tuoi messaggi quel giorno · orari in ora italiana ${esc(f.ore || "")}</div>
      <div class="avviso">Le tue domande e dichiarazioni sono azioni tue, datate. Le risposte di ChatGPT sono proposte: non provano i fatti.</div>
      <ul class="evl">${(f.ev || []).map(evRiga).join("")}</ul></div>` + legamiHTML(f);
  } else {
    if (f.cit) h += `<div class="citato"><span class="lab">PASSAGGIO LETTO NELLA FONTE</span>«${esc(f.cit)}»</div>`;
    if (f.mail) h += `<div class="schedamail"><div class="busta">✉ MAIL</div><div class="ogg">${esc(f.tit)}</div><div class="mdati">${esc(f.mail.da)} → ${esc(f.mail.a)} · ${esc(f.mail.quando)}${(f.mail.allegati || []).length ? `<br>Allegati: ${esc(f.mail.allegati.join(", "))}` : ""}</div></div>`;
    else if (f.img) h += `<img src="${esc(R.base + f.img)}" alt="Prima pagina: ${esc(f.tit)}">`;
    else if (f.riservato) h += `<div class="vuotagrande"><b>RIS</b>Nota di un archivio riservato, letta in memoria con la tua password: il testo non resta su disco.</div>`;
    if (f.ev && f.ev.length) h += `<div class="blocco"><span class="lab">COSA HA LETTO HAIKU IN QUESTA FONTE (${f.ev_tot} EVENTI)</span><ul class="evl">${f.ev.map(evRiga).join("")}</ul></div>`;
    h += legamiHTML(f);
  }
  if (!f.riservato || isChat(id)) h += `<div class="testo-fonte" id="testoFonte"><button class="azione" id="btnTesto">MOSTRA IL TESTO DELLA FONTE</button></div>`;
  $("letPag").innerHTML = h; $("letPag").scrollTop = 0;
  const bt = $("btnTesto");
  if (bt) bt.onclick = async () => {
    bt.disabled = true; bt.textContent = "CARICO…";
    try { const d = await ponte("testo", { id: RID, n: id }); $("testoFonte").innerHTML = `<span class="lab" style="font:700 9px var(--mono);letter-spacing:1.2px;color:var(--dim)">TESTO DELLA FONTE${d.nota ? " · " + esc(d.nota) : ""}</span><pre>${esc(d.testo || "")}</pre>`; }
    catch (e) { bt.textContent = e.message; }
  };
  const i = ORDINE.indexOf(id);
  $("letPrec").disabled = i <= 0; $("letSucc").disabled = i < 0 || i >= ORDINE.length - 1;
  $("letApri").textContent = f.mail ? "APRI IN MAIL" : isChat(id) ? "APRI LA CHAT" : "APRI NEL FINDER";
  $("letApri").disabled = !!f.riservato && !isChat(id);
  $("lettore").hidden = false; focusNodo(id); $("letTorna").focus();
}
function chiudiLettore(silenzioso) {
  if ($("lettore").hidden) return;
  $("lettore").hidden = true; correnteLettore = null;
  if (silenzioso || !salvato) { salvato = null; return; }
  const { scroll, origine: o, id } = salvato; salvato = null;
  chat.scrollTop = scroll;
  if (o && document.contains(o) && chat.contains(o)) { o.focus({ preventScroll: true }); chat.scrollTop = scroll; o.classList.add("lampo"); selezionaNodo(id); setTimeout(() => { o.classList.remove("lampo"); if (!correnteLettore) selezionaNodo(null); }, 2000); }
}
function spostaLettore(d) { const i = ORDINE.indexOf(String(correnteLettore)); const j = i + d; if (i >= 0 && j >= 0 && j < ORDINE.length) apriLettore(ORDINE[j]); }
$("letTorna").onclick = () => chiudiLettore();
$("letPrec").onclick = () => spostaLettore(-1);
$("letSucc").onclick = () => spostaLettore(1);
$("letApri").onclick = async () => {
  const b = $("letApri"), t = b.textContent;
  try { const d = await ponte("apriFonte", { id: RID, n: correnteLettore }); b.textContent = d.ok ? "APERTA IN " + String(d.cosa).toUpperCase() : "NON APRIBILE"; }
  catch (e) { b.textContent = "NON APRIBILE"; }
  setTimeout(() => { b.textContent = t; }, 1800);
};
$("letPag").addEventListener("click", e => { const r = e.target.closest(".rif[data-n]"); if (r) apriLettore(r.dataset.n); });
document.addEventListener("keydown", e => {
  if (!$("elenco").hidden && e.key === "Escape") { e.preventDefault(); chiudiElenco(); return; }
  if ($("lettore").hidden) return;
  if (e.target && e.target.tagName === "INPUT") return;
  if (e.key === "Escape") { e.preventDefault(); chiudiLettore(); }
  else if (e.key === "ArrowLeft") spostaLettore(-1);
  else if (e.key === "ArrowRight") spostaLettore(1);
});
$("composer").addEventListener("submit", e => { e.preventDefault(); inviaDomanda($("campo").value); });

/* ---------------------------------------------------------------- cervello 3D (lib/cervello3d.js) */
let C3 = null, FUOCO = null, CREA = null; const CODA3 = [];
function c3(fn) { if (C3) fn(C3); else CODA3.push(fn); }
const CAP_VUOTO = "Trascina per ruotare · rotella per avvicinarti · passa sui punti per il nome";
const CAP_ACCESO = "Clic su un punto, su un [n] in chat o sulla cronologia: si accende il suo sistema di legami";
function accendi(on) {
  c3(c => c.accendi(on));
  if (on) { apriApprof("crono"); $("cap").textContent = CAP_ACCESO; }
  else { FUOCO = null; c3(c => c.reset()); }
}
function selezionaNodo(id) { c3(c => c.anteprima(id == null ? null : String(id))); }
function focusNodo(id) {
  id = String(id); FUOCO = id; c3(c => c.focus(id)); segnaInCronologia(id, true);
  const n = NODO3[id]; if (!n) return; const L = LEG3[id] || [], forti = L.filter(a => a.forte).length;
  $("cap").innerHTML = `<span class="rif${isChat(id) ? " cg" : ""}">${id}</span> <b>${esc(n.tit)}</b> · ${esc(n.sotto)} · ${L.length} legami diretti (${forti} forti, ${L.length - forti} solo stesso importo)`;
}
function segnaInCronologia(id, scorri) {
  document.querySelectorAll("#appCorpo .attivo").forEach(e => e.classList.remove("attivo"));
  if (id == null) return;
  const els = [...document.querySelectorAll(`#appCorpo [data-apri="${id}"]`)]; els.forEach(e => e.classList.add("attivo"));
  const b = els.find(e => e.tagName === "BUTTON"); const c = $("appCorpo");
  if (b && scorri && c) { const r = b.getBoundingClientRect(), rc = c.getBoundingClientRect(); if (r.top < rc.top || r.bottom > rc.bottom) c.scrollTo({ top: c.scrollTop + (r.top - rc.top) - rc.height / 2, behavior: "smooth" }); }
}
function giocoStato(s) {
  $("gVis").textContent = `${s.visitate}/${s.totale}`; $("gLobi").textContent = `${s.lobiVisti}/${s.lobiTot}`;
  $("gBarra").style.width = (s.totale ? 100 * s.visitate / s.totale : 0) + "%";
}
let datiPronti = false;
function pronto3D() { datiPronti = true; crea3D(); }
function crea3D() {
  if (!CREA || !datiPronti || C3) return;
  const el = $("c3d");
  try {
    const c = CREA(el, { ...G3,
      onClic: id => { if (risposto) apriLettore(String(id)); else focusNodo(id); },
      onHover: id => { document.querySelectorAll("#chat .rif.attivo").forEach(e => e.classList.remove("attivo")); if (id != null) document.querySelectorAll(`#chat .rif[data-n="${id}"]`).forEach(e => e.classList.add("attivo")); },
      onStato: giocoStato });
    C3 = c; CODA3.splice(0).forEach(f => f(c)); window.cervello3d = c;
  } catch (err) { el.insertAdjacentHTML("beforeend", `<div class="c3-err">Cervello 3D non disponibile qui (${esc(err.message)}). Il resto della pagina funziona.</div>`); log("3D: " + err.message); }
  regole();
}
window.avvia3D = function (crea) { CREA = crea; crea3D(); };
$("c3Home").onclick = () => { FUOCO = null; segnaInCronologia(null, false); c3(c => c.reset()); $("cap").textContent = risposto ? CAP_ACCESO : CAP_VUOTO; };
$("c3Regole").onclick = () => { const r = $("regole"); r.hidden = !r.hidden; $("c3Regole").setAttribute("aria-expanded", String(!r.hidden)); };
function regole() {
  const per = (k, f) => G3.nodi.filter(x => x[k] === f).length;
  $("regole").innerHTML = `<b>COME È DISPOSTO</b>
    <p><span class="sw" style="background:var(--violet)"></span>in alto le <b>mail</b> · <span class="sw" style="background:var(--green)"></span>a metà le <b>chat ChatGPT</b> · <span class="sw" style="background:var(--cyan)"></span>in basso i <b>documenti</b>.</p>
    <p><b>Lobi = argomento</b>, dalla fronte alla nuca: ${(G3.lobi || []).map((l, i) => `${esc(l.nome)} (${per("lobo", i)})`).join(" · ")}. Regola: parole chiave dell'argomento nel titolo e nella cartella (peso 3) e negli eventi letti da Haiku (peso 1); «avvocato», «diffida», «contestazione», «rigetto» nel titolo portano subito in LEGALE.</p>
    <p><b>Corsie = controparte</b>, da sinistra a destra: ${(G3.corsie || []).map((c, i) => `${esc(c.nome || "—")} (${per("corsia", i)})`).join(" · ")}. Le prime due sono le controparti più presenti tra le fonti, la terza raccoglie le altre.</p>
    <p><b>Legami</b> (Python): forti = cita, allegato, stesso thread, risposta, chat prima/dopo il fatto, stessa persona entro 7 giorni; deboli = solo stesso importo.</p>`;
}

/* ---------------------------------------------------------------- cronologia e mappa (pannello in basso a destra) */
const TITOLI = { mappa: "MAPPA", crono: "CRONOLOGIA" };
function apriApprof(voce) {
  if (!risposto) return;
  const corpo = $("appCorpo"); $("pannelloCrono").classList.add("con-dati");
  document.querySelectorAll("#voci3 [data-v]").forEach(b => { const on = b.dataset.v === voce; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  $("appTit").textContent = TITOLI[voce];
  if (voce === "crono") cronologia(corpo); else mappa(corpo);
  corpo.onclick = e => { const a = e.target.closest("[data-apri]"); if (a) apriLettore(a.dataset.apri, a); };
  corpo.onmouseover = e => { const a = e.target.closest("[data-apri]"); if (a) selezionaNodo(a.dataset.apri); };
  corpo.onmouseleave = () => selezionaNodo(null);
  if (FUOCO) segnaInCronologia(FUOCO, true);
}
document.querySelectorAll("#voci3 [data-v]").forEach(b => b.onclick = () => apriApprof(b.dataset.v));
const pi = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pd = s => { const m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function cronologia(corpo) {
  if (!CRONO.length) { corpo.innerHTML = `<div class="crono-leg">Nessun evento con una data certa.</div>`; return; }
  const d0 = pi(CRONO[0].d), d1 = pi(CRONO[CRONO.length - 1].d);
  const T0 = new Date(d0.getFullYear(), d0.getMonth(), 1), T1 = new Date(d1.getFullYear(), d1.getMonth() + 1, 1);
  const W = 520, X = d => 14 + (d - T0) / Math.max(1, T1 - T0) * (W - 28), Y = 58;
  let s = `<line class="lin" x1="10" y1="${Y}" x2="${W - 10}" y2="${Y}"/>`;
  const mesi = (T1.getFullYear() - T0.getFullYear()) * 12 + T1.getMonth() - T0.getMonth();
  const passo = mesi > 36 ? 12 : mesi > 12 ? 3 : 1;
  for (let k = 0; k <= mesi; k++) { const d = new Date(T0.getFullYear(), T0.getMonth() + k, 1); if (d.getMonth() % passo) continue; const x = X(d);
    s += `<line class="gr" x1="${x}" y1="14" x2="${x}" y2="${Y + 6}"/><text x="${x + 2}" y="${Y + 20}"${d.getMonth() ? ' style="opacity:.6"' : ""}>${d.getMonth() ? MESI[d.getMonth()] : d.getFullYear()}</text>`; }
  let nf = 0, nc = 0;
  CRONO.forEach(g => { const x = X(pi(g.d)); const dd = g.d.split("-").reverse().join("/");
    if (g.f.length) { nf++; const h = Math.min(40, 6 + g.f.length * 7); s += `<rect class="tk${isMail(String(g.f[0])) ? " tm" : ""}" data-apri="${g.f[0]}" x="${x - 1}" y="${Y - h}" width="2.2" height="${h}"><title>${dd} · fonti ${g.f.map(n => "[" + n + "]").join(" ")}</title></rect>`; }
    if (g.c.length) { nc++; s += `<circle class="ch" data-apri="${g.c[0]}" cx="${x}" cy="${Y}" r="3.2"><title>${dd} · chat ChatGPT ${g.c.map(n => "[" + n + "]").join(" ")}</title></circle>`; } });
  /* elenco verticale: ogni fonte numerata alla sua prima data certa, spazio proporzionale ai giorni */
  const prima = {};
  CRONO.forEach(g => [...g.f, ...g.c].forEach(n => { if (!prima[n]) prima[n] = g.d; }));
  const tutte = cronologia.tutte || !CITATI.length;
  const righe = (tutte ? Object.keys(FONTI) : CITATI).map(n => ({ n, d: prima[n] ? pi(prima[n]) : pd(dataDi(n)), f: FONTI[n] })).filter(r => r.d).sort((a, b) => a.d - b.d || a.n - b.n);
  let prec = null, h = "";
  righe.forEach(r => { const gg = prec ? Math.round((r.d - prec) / 864e5) : 0; prec = r.d;
    if (gg > 45) h += `<div class="vuoto" style="height:${Math.min(90, 10 + gg * 0.3)}px">— ${Math.round(gg / 30.4)} mesi —</div>`; else if (gg > 0) h += `<div style="height:${Math.min(24, 2 + gg * 0.8)}px"></div>`;
    const c = isChat(r.n);
    h += `<button class="pt${c ? " c" : (isMail(r.n) ? " m" : "")}" data-apri="${r.n}"><b>${r.d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}</b><span>${esc(c ? `chat ChatGPT «${r.f.conv}» · ${r.f.nq || 0} domande` : r.f.tit)} ${R1(r.n)}</span></button>`; });
  corpo.innerHTML = `<svg class="crono-svg" viewBox="0 0 ${W} 86" preserveAspectRatio="none">${s}</svg>
    <div class="crono-leg">In scala, ${MESI[T0.getMonth()]} ${T0.getFullYear()} – ${MESI[d1.getMonth()]} ${d1.getFullYear()} · barrette = giorni con documenti (ciano) o mail (viola) (${nf}) · puntini = giornate di chat (${nc}) · clic per aprire. Esclusi ${R.CRONO_ESCLUSI || 0} eventi con data solo dedotta o dai metadati del file.</div>
    <div class="crono-leg">Elenco: ${tutte ? `tutte le ${Object.keys(FONTI).length} fonti lette` : `le ${CITATI.length} fonti citate nel racconto`} · <button class="azione" id="cronoTutte">${tutte ? "SOLO LE CITATE" : "TUTTE LE FONTI"}</button></div>
    <div class="crono">${h}</div>`;
  const b = $("cronoTutte"); if (b) b.onclick = e => { e.stopPropagation(); cronologia.tutte = !tutte; cronologia(corpo); };
}
function mappa(corpo) {
  const corsie = G3.corsie || [];
  const gruppi = corsie.map((c, i) => ({ t: (c.nome || "—").toUpperCase(), c: ["var(--amber)", "var(--violet)", "var(--cyan)"][i] || "var(--cyan)", ids: [] }));
  const chatG = { t: "LE TUE CHAT CHATGPT", c: "var(--green)", ids: [] };
  G3.nodi.slice().sort((a, b) => (a.data || "9").localeCompare(b.data || "9")).forEach(n => { if (n.tipo === "chat") chatG.ids.push(n.id); else if (gruppi[n.corsia]) gruppi[n.corsia].ids.push(n.id); });
  const card = n => { const f = FONTI[n]; const L = (f.leg || [])[0];
    return `<button class="card${isChat(n) ? " chatc" : (isMail(n) ? " mail" : "")}" data-apri="${n}"><span class="rif${isChat(n) ? " cg" : ""}">${n}</span><span><span class="ct">${esc(isChat(n) ? f.conv : f.tit)}</span><br><span class="cd">${esc(isChat(n) ? f.data + " · " + (f.ore || "") : dataDi(n))}</span>${L ? `<span class="lg">${esc(L[1])} [${L[0]}]</span>` : ""}</span></button>`; };
  const gh = g => g.ids.length ? `<div class="gruppo" style="border-color:${g.c}"><span class="gt" style="color:${g.c}">${esc(g.t)} · ${g.ids.length}</span>${g.ids.map(card).join("")}</div>` : "";
  corpo.innerHTML = `<div class="mappa"><div class="colonna">${gruppi.map(gh).join("")}</div><div class="colonna">${gh(chatG)}</div></div>`;
}

/* ---------------------------------------------------------------- avvio */
(function () {
  const m = location.hash.match(/r=([^&]+)/);
  if (m) apri(decodeURIComponent(m[1])); else vuota();
})();
