/* Hubique — promo "Quanto copre il fondo" su tutto il sito.
   Barra fissa in basso su ogni pagina (chiudibile, riappare alla sessione
   successiva) e una modale per sessione dopo 12 secondi o 40% di scroll.
   Non compare su fondi.html. */
(function () {
  'use strict';
  if (/(^|\/)fondi\.html$/.test(window.location.pathname)) return;
  var body = document.body;
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* barra */
  if (!ss.get('hubique_promo_bar_closed')) {
    var bar = document.createElement('div');
    bar.className = 'promo-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Test: quanto copre il fondo');
    bar.innerHTML =
      '<p><b>Portare l’AI in azienda a costo zero?</b> In 3 minuti scoprite quanto copre il fondo a cui già versate.</p>' +
      '<a class="btn" href="fondi.html">Fai il test</a>' +
      '<button type="button" class="promo-close" aria-label="Chiudi">&#10005;</button>';
    body.appendChild(bar);
    body.classList.add('has-promo-bar');
    bar.querySelector('.promo-close').addEventListener('click', function () {
      bar.remove(); body.classList.remove('has-promo-bar'); ss.set('hubique_promo_bar_closed', '1');
    });
  }

  /* modale, una volta per sessione */
  if (ss.get('hubique_promo_modal_shown')) return;
  var shown = false;
  function showModal() {
    if (shown) return; shown = true; ss.set('hubique_promo_modal_shown', '1');
    var modal = document.createElement('div');
    modal.className = 'promo-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'promo-title');
    modal.innerHTML =
      '<div class="promo-card">' +
        '<button type="button" class="promo-close" aria-label="Chiudi">&#10005;</button>' +
        '<span class="tag">Fondi &amp; voucher · 3 minuti</span>' +
        '<h2 id="promo-title">Lo 0,30% che versate ogni mese può pagare l’AI in azienda.</h2>' +
        '<p>Dieci domande e vedete quali fondi interprofessionali, voucher e avvisi può usare la vostra azienda per un progetto AI fatto come formazione delle vostre persone. In molti casi il costo è zero.</p>' +
        '<div class="promo-actions"><a class="btn" href="fondi.html">Quanto copre il fondo</a><button type="button" class="promo-later">Più tardi</button></div>' +
      '</div>';
    body.appendChild(modal);
    function close() { modal.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    modal.querySelector('.promo-close').addEventListener('click', close);
    modal.querySelector('.promo-later').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', onKey);
    modal.querySelector('.btn').focus();
  }
  setTimeout(showModal, 12000);
  window.addEventListener('scroll', function onScroll() {
    var h = document.documentElement;
    if ((h.scrollTop + window.innerHeight) / h.scrollHeight > .4) { window.removeEventListener('scroll', onScroll); showModal(); }
  }, { passive: true });
})();
