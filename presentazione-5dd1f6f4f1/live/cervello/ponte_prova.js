/* PONTE SIMULATO per il video (20/10/2026). Sostituisce window.webkit.messageHandlers.cervello (CervelloPonte.swift):
   risponde con i DATI DI PROVA di dati/vicenda.js (vicenda inventata). Nessuna ricostruzione vera, nessuna chiamata a Jarvis.
   Oscuramento: tempi e costi dell'avanzamento non compaiono (regola del video: nessun costo o cronometro a schermo). */
(function () {
  const V = window.VICENDE || {};
  const primo = () => V["prova-07"];
  window.cervelloPonte = async function (m) {
    const d = V[m.id] || primo();
    switch (m.cmd) {
      case "apri": return JSON.parse(JSON.stringify(d));
      case "stato": return d.stato_lavoro || { stato: "fatta" };
      case "elenco": return { ricostruzioni: window.ELENCO_PROVA || [] };
      case "testo": return { testo: (window.TESTI_PROVA || {})[m.n] || "Testo della fonte di prova (documento inventato per il video).", nota: "DATI DI PROVA" };
      case "haPassword": return { ricordata: false };
      case "scarica": return { zip: "/Users/utente/Downloads/Cervello 07 · Corvenna Hotels (PROVA).zip", fonti: 21, file_copiati: 21, dimensione_mb: 6.4 };
      case "apriFonte": return { ok: true, cosa: m.n && d.FONTI[m.n] && d.FONTI[m.n].mail ? "mail" : "finder" };
      default: return { ok: true };
    }
  };
  // Nasconde tempi e costi (chip in alto e testata del riquadro di avanzamento).
  const pulisci = () => {
    const c = document.getElementById("chip");
    if (c && / · \d/.test(c.textContent)) c.textContent = c.textContent.replace(/ · \d.*$/, "");
    document.querySelectorAll(".lavoro .h .tm").forEach(e => e.remove());
  };
  new MutationObserver(pulisci).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
})();
