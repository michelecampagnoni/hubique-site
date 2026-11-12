/* Demo pubblica: al posto del servizio render locale mostra foto già generate con l'AI. */
(() => {
  if (new URLSearchParams(location.search).get('passo') === 'casa') document.head.insertAdjacentHTML('beforeend', '<style>.rend{display:none!important}</style>');
  const Q = new URLSearchParams(location.search), PID = Q.get('p') || 'p7';
  const AUTO_PAGE = location.pathname.includes('/motore/');
  const BASE = AUTO_PAGE ? '../render_foto/' : 'render_foto/';
  const SAB = {
    'Living e cucina · ampia': '170921-fd976',
    'Camera padronale · ampia': '171815-e12c1', 'Camera padronale · controcampo': '163638-df818',
    'Camera · ampia': '170933-97b18', 'Camera · controcampo': '163651-1af86',
    'Bagno padronale · ampia': '170940-e4f79', 'Bagno padronale · controcampo': '163704-07f0d',
    'Terrazzo · ampia': '171009-3ef5e',
    'Studio · ampia': '171804-7b3a2', 'Studio · controcampo': '171810-aa956'
  };
  const AUTO = {
    p6: [['soggiorno', '160938-166d7'], ['camera', '160946-07469'], ['bagno', '162234-b0f94']],
    p2: [['cucina', '161020-0cd9f'], ['soggiorno', '162154-21bd9'], ['camera', '161007-557f8']],
    p7: [['soggiorno', '162222-73e97'], ['cucina', '162222-73e97'], ['camera', '155210-16a2a']],
    p12: [['camera', '161023-ae2ac']]
  };
  const trova = t => {
    if (!AUTO_PAGE) return SAB[t] || null;
    if (/controcampo/i.test(t)) return null;
    const l = t.toLowerCase(), r = (AUTO[PID] || []).find(([k]) => l.includes(k));
    return r ? r[1] : null;
  };
  const disponibile = nome => AUTO_PAGE ? !!trova(nome + ' · ampia') : !!SAB[nome + ' · ampia'];
  const cardDi = t => [...document.querySelectorAll('#rgal .card')].find(c => c.querySelector('.t span')?.textContent === t);
  const jobs = {};
  window.VETRINA_API = async (u, d) => {
    if (u.startsWith('/api/stato')) return { render: 0, crediti: 0 };
    if (u === '/api/avvia') { const id = Math.random().toString(36).slice(2); jobs[id] = { t: Date.now(), titolo: d.titolo, f: trova(d.titolo), wait: 6000 + Math.random() * 7000 }; return { id }; }
    if (u.startsWith('/api/lavoro')) {
      const j = jobs[new URLSearchParams(u.split('?')[1]).get('id')];
      if (!j.f) { const c = cardDi(j.titolo); if (c && /controcampo/.test(j.titolo)) c.remove(); return { stato: 'errore', errore: 'foto non inclusa in questa demo' }; }
      if (Date.now() - j.t < j.wait) return { stato: 'in lavorazione' };
      if (!j.done) { j.done = 1; const c = cardDi(j.titolo), im = c && c.querySelector('img'); if (im) im.src = BASE + 'coda/' + j.f + '_in.jpg'; }
      return { stato: 'fatto', url: BASE + j.f + '.jpg' };
    }
    return {};
  };
  // ambienti senza foto d'esempio: spenti
  let n = 0; const iv = setInterval(() => {
    const box = document.getElementById('ramb'); if (++n > 40) clearInterval(iv); if (!box || !box.children.length) return;
    const usate = new Set(); box.querySelectorAll('label').forEach(l => { const i = l.querySelector('input'), nome = l.textContent.trim(), f = trova(nome + ' · ampia'); if (!disponibile(nome) || usate.has(f)) { i.checked = false; i.disabled = true; l.style.opacity = .35; l.title = 'Non incluso nella demo'; } else { i.checked = true; usate.add(f); } });
    clearInterval(iv);
  }, 300);
})();
