// Blocchi ridimensionabili (Michele 16/10/2026: «rendi i tre blocchi espandibili/draggabili così posso allargare e stringere le viste»).
// Divisore verticale tra chat e colonna destra, divisore orizzontale tra cervello e cronologia; doppio clic = misure iniziali.
// Pulsante ⤢ su ogni blocco: lo porta a tutto schermo, ⤡ lo rimette. Misure salvate in localStorage.
(function () {
  const css = `
  .main{display:flex!important;gap:0!important}
  .main>#pannelloChat{flex:1 1 auto;min-width:220px}
  .main>.dx{flex:0 0 var(--dx-w,640px);min-width:260px;display:flex;flex-direction:column;gap:0!important}
  .dx>#pannelloCervello{flex:0 0 var(--cerv-h,53%)!important;min-height:80px}
  .dx>#pannelloCrono{flex:1 1 auto;min-height:80px}
  .divisore{flex:0 0 12px;position:relative;z-index:5}
  .divisore::after{content:"";position:absolute;background:rgba(51,214,250,.25);transition:background .15s}
  .divisore:hover::after,.divisore.attivo::after{background:rgba(51,214,250,.9);box-shadow:0 0 8px rgba(51,214,250,.8)}
  .divisore.v{cursor:col-resize}.divisore.v::after{left:5px;width:2px;top:20%;bottom:20%}
  .divisore.o{cursor:row-resize}.divisore.o::after{top:5px;height:2px;left:20%;right:20%}
  .c3-hud{right:40px!important}
  .espandi{position:absolute;top:2px;right:6px;z-index:6;font:700 12px/1 var(--mono,monospace);color:var(--cyan,#33d6fa);
    background:rgba(4,11,24,.9);border:1px solid rgba(51,214,250,.45);padding:3px 6px;cursor:pointer}
  .espandi:hover{background:var(--cyan,#33d6fa);color:#000}
  body.solo .main>*,body.solo .dx>*{display:none!important}
  body.solo .main>.dx.tiene{display:flex!important;flex:1 1 auto}
  body.solo .sezione.pieno{display:flex!important;flex:1 1 auto!important}
  /* 19/10/2026: la regola con #id sopra vinceva sul ⤢ (cervello restava al 53% dell'altezza) */
  body.solo .dx>#pannelloCervello.pieno,body.solo .dx>#pannelloCrono.pieno{flex:1 1 auto!important}
  body.solo #pannelloChat.pieno{display:flex!important;flex-direction:column}
  body.trascina{user-select:none}body.trascina iframe,body.trascina canvas{pointer-events:none}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const main = document.getElementById("main"), dx = main && main.querySelector(".dx");
  const chat = document.getElementById("pannelloChat"), cerv = document.getElementById("pannelloCervello"),
        crono = document.getElementById("pannelloCrono");
  if (!main || !dx || !chat || !cerv || !crono) return;
  const salva = (k, v) => { try { localStorage.setItem("cervello." + k, v); } catch (e) {} };
  const leggi = k => { try { return localStorage.getItem("cervello." + k); } catch (e) { return null; } };
  const root = document.documentElement;
  if (leggi("dxW")) root.style.setProperty("--dx-w", leggi("dxW"));
  if (leggi("cervH")) root.style.setProperty("--cerv-h", leggi("cervH"));

  function divisore(tipo, prima, muovi, reset) {
    const d = document.createElement("div"); d.className = "divisore " + tipo;
    d.title = "Trascina per ridimensionare · doppio clic per tornare alle misure iniziali";
    prima.parentNode.insertBefore(d, prima);
    d.addEventListener("pointerdown", e => {
      e.preventDefault(); d.setPointerCapture(e.pointerId); d.classList.add("attivo"); document.body.classList.add("trascina");
      const su = () => { d.classList.remove("attivo"); document.body.classList.remove("trascina");
        d.removeEventListener("pointermove", muovi); d.removeEventListener("pointerup", su); };
      d.addEventListener("pointermove", muovi); d.addEventListener("pointerup", su);
    });
    d.addEventListener("dblclick", reset);
  }
  divisore("v", dx, e => {
    const r = main.getBoundingClientRect(), w = Math.max(260, Math.min(r.right - e.clientX, r.width - 230));
    root.style.setProperty("--dx-w", w + "px"); salva("dxW", w + "px");
  }, () => { root.style.removeProperty("--dx-w"); salva("dxW", ""); });
  divisore("o", crono, e => {
    const r = dx.getBoundingClientRect(), h = Math.max(10, Math.min(90, 100 * (e.clientY - r.top) / r.height));
    root.style.setProperty("--cerv-h", h.toFixed(1) + "%"); salva("cervH", h.toFixed(1) + "%");
  }, () => { root.style.removeProperty("--cerv-h"); salva("cervH", ""); });

  [chat, cerv, crono].forEach(s => {
    const b = document.createElement("button"); b.type = "button"; b.className = "espandi"; b.textContent = "⤢";
    b.title = "Allarga questo blocco a tutta la finestra";
    b.addEventListener("click", () => {
      const pieno = !s.classList.contains("pieno");
      document.querySelectorAll(".sezione.pieno").forEach(x => x.classList.remove("pieno"));
      document.querySelectorAll(".espandi").forEach(x => { x.textContent = "⤢"; x.title = "Allarga questo blocco a tutta la finestra"; });
      dx.classList.toggle("tiene", pieno && s !== chat);
      document.body.classList.toggle("solo", pieno);
      if (pieno) { s.classList.add("pieno"); b.textContent = "⤡"; b.title = "Rimetti i tre blocchi"; }
      window.dispatchEvent(new Event("resize"));
    });
    s.appendChild(b);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("solo")) {
      const b = document.querySelector(".sezione.pieno .espandi"); if (b) b.click();
    }
  });
})();
