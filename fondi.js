/* Hubique — "Quanto copre il fondo": dieci domande, stima di fondi e voucher
   applicabili a un progetto AI fatto come formazione, quota a carico.
   Stesso schema del test AI: schermate, gate email via FormSubmit, report. */
(function () {
  'use strict';

  var questions = [
    { id: 'region', section: 'Azienda · Sede', title: 'Dove ha sede legale l’azienda?', help: 'I voucher regionali e camerali dipendono da qui.',
      options: [['lom', 'Lombardia'], ['pie', 'Piemonte'], ['ven', 'Veneto'], ['emr', 'Emilia-Romagna'], ['fvg', 'Friuli-Venezia Giulia'], ['nord', 'Altra regione del Nord'], ['centro', 'Centro'], ['sud', 'Sud e isole']] },
    { id: 'size', section: 'Azienda · Dimensione', title: 'Quanti dipendenti avete?', help: 'Contano i dipendenti in busta paga, non i collaboratori.',
      options: [['s1', '1–9'], ['s2', '10–20'], ['s3', '21–50'], ['s4', '51–100'], ['s5', '101–250'], ['s6', 'Più di 250']] },
    { id: 'sector', section: 'Azienda · Contratto', title: 'Che contratto applicate alla maggior parte dei dipendenti?', help: 'Se non lo sapete, scegliete il settore: lo verifichiamo insieme.',
      options: [['ind', 'Industria: metalmeccanico, legno-arredo, chimica, alimentare, edilizia industria'], ['art', 'Artigianato'], ['com', 'Commercio, servizi, turismo'], ['stu', 'Studio professionale'], ['agr', 'Agricoltura'], ['ns', 'Non lo so']] },
    { id: 'fund', section: 'Fondo · Adesione', title: 'A quale fondo interprofessionale aderite?', help: 'È scritto nella denuncia mensile UniEmens che fa il consulente del lavoro. «Non lo so» è la risposta più comune.',
      options: [['fondimpresa', 'Fondimpresa'], ['forte', 'For.Te'], ['fondoprof', 'Fondoprofessioni'], ['fonarcom', 'FonARCom'], ['fapi', 'Fapi'], ['fondart', 'Fondartigianato'], ['altro', 'Un altro fondo'], ['nessuno', 'Nessuno, non abbiamo aderito'], ['ns', 'Non lo so']] },
    { id: 'used', section: 'Fondo · Conto', title: 'Avete usato il conto formazione negli ultimi due anni?', help: 'Se no, i versamenti si sono accumulati. Dopo due anni si perdono.',
      options: [['no', 'No, mai'], ['poco', 'Qualche corso, non tutto'], ['si', 'Sì, lo usiamo regolarmente'], ['ns', 'Non lo so']] },
    { id: 'dir', section: 'Fondo · Dirigenti', title: 'Avete dirigenti con contratto da dirigente?', help: 'Per loro esiste un fondo separato che paga coaching e affiancamento.',
      options: [['si', 'Sì'], ['no', 'No']] },
    { id: 'dem', section: 'Voucher · Aiuti', title: 'Negli ultimi tre anni avete ricevuto contributi pubblici a fondo perduto?', help: 'Conta per il tetto degli aiuti «de minimis» dei voucher: 300 mila euro in tre anni.',
      options: [['no', 'No'], ['poco', 'Sì, meno di 100 mila euro in tutto'], ['tanto', 'Sì, più di 100 mila euro'], ['ns', 'Non lo so']] },
    { id: 'payroll', section: 'Fondo · Retribuzioni', title: 'Quanto pesano le retribuzioni lorde in un anno, più o meno?', help: 'Serve per stimare il conto formazione, lo 0,30% che versate. Se non lo sapete, stimiamo noi dai dipendenti.',
      options: [['p1', 'Fino a 500 mila euro'], ['p2', 'Da 500 mila a 1 milione'], ['p3', 'Da 1 a 2,5 milioni'], ['p4', 'Da 2,5 a 6 milioni'], ['p5', 'Oltre 6 milioni'], ['ns', 'Non lo so']] },
    { id: 'proc', section: 'Progetto · Processo', title: 'Cosa vorreste automatizzare per primo?', help: 'Una cosa sola. La seconda viene dopo.',
      options: [['prev', 'Preventivi e offerte'], ['rich', 'Richieste dei clienti e prima risposta'], ['doc', 'Documenti, manuali, base di conoscenza'], ['scad', 'Scadenze, rapportini, follow-up'], ['altro', 'Altro, ne parliamo']] },
    { id: 'budget', section: 'Progetto · Taglio', title: 'Su un primo progetto, quanto immaginate di investire?', help: 'Serve per mostrarvi la quota a carico sul taglio giusto.',
      options: [['b1', 'Fino a 10 mila euro'], ['b2', 'Da 10 a 25 mila'], ['b3', 'Da 25 a 50 mila'], ['b4', 'Oltre 50 mila'], ['ns', 'Non lo so ancora']] }
  ];

  var LABELS = {
    size: { s1: '1–9', s2: '10–20', s3: '21–50', s4: '51–100', s5: '101–250', s6: 'oltre 250' },
    fund: { fondimpresa: 'Fondimpresa', forte: 'For.Te', fondoprof: 'Fondoprofessioni', fonarcom: 'FonARCom', fapi: 'Fapi', fondart: 'Fondartigianato', altro: 'un fondo di categoria', nessuno: 'nessun fondo', ns: 'da verificare' },
    region: { lom: 'Lombardia', pie: 'Piemonte', ven: 'Veneto', emr: 'Emilia-Romagna', fvg: 'Friuli-Venezia Giulia', nord: 'Nord', centro: 'Centro', sud: 'Sud e isole' },
    proc: { prev: 'preventivi e offerte', rich: 'richieste dei clienti', doc: 'documenti e base di conoscenza', scad: 'scadenze, rapportini e follow-up', altro: 'da definire' },
    budget: { b1: 'fino a 10 mila', b2: '10–25 mila', b3: '25–50 mila', b4: 'oltre 50 mila', ns: 'non definito' }
  };
  var SIZE = { s1: 5, s2: 15, s3: 35, s4: 75, s5: 175, s6: 400 };
  var PAY = { p1: 350e3, p2: 750e3, p3: 1.7e6, p4: 4e6, p5: 8e6 };
  var PROJECTS = [
    { key: 'sprint', label: 'Un processo, 40 ore, due settimane', total: 6000, training: .9 },
    { key: 'perc', label: 'Tre processi, 100 ore, un trimestre', total: 15000, training: .8 },
    { key: 'prog', label: 'Programma con progetto digitale, 6–9 mesi', total: 40000, training: .6 }
  ];

  var state = { current: 0, answers: {}, result: null };
  var screens = {
    intro: document.querySelector('[data-screen="intro"]'),
    question: document.querySelector('[data-screen="question"]'),
    result: document.querySelector('[data-screen="result"]')
  };

  function eurText(n) {
    var v = n >= 1000 ? Math.round(n / 100) * 100 : Math.round(n);
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }
  function eur(n) { return '<b>' + eurText(n) + '</b>'; }
  function round500(n) { return Math.round(n / 500) * 500; }

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      var active = key === name;
      screens[key].hidden = !active;
      screens[key].classList.toggle('is-active', active);
    });
    /* sulle domande la pagina resta ferma: scorrono solo le risposte */
    document.body.classList.toggle('fondi-lock', name === 'question');
    document.documentElement.classList.toggle('fondi-lock', name === 'question');
    window.scrollTo({ top: 0, behavior: name === 'question' ? 'auto' : 'smooth' });
  }

  function renderQuestion() {
    var q = questions[state.current];
    var progress = ((state.current + 1) / questions.length) * 100;
    screens.question.querySelector('.assessment-progress span').style.width = progress + '%';
    screens.question.querySelector('.assessment-phase').textContent = q.section;
    screens.question.querySelector('.assessment-count').textContent = (state.current + 1) + ' / ' + questions.length;
    screens.question.querySelector('.assessment-dimension').textContent = state.current < 3 ? 'circa 3 minuti' : (state.current < 7 ? 'circa 1 minuto' : 'quasi finito');
    screens.question.querySelector('.assessment-question-title').textContent = q.title;
    screens.question.querySelector('.assessment-question-help').textContent = q.help;
    var fieldset = screens.question.querySelector('.assessment-options');
    fieldset.innerHTML = '<legend class="sr-only">' + q.title + '</legend>';
    q.options.forEach(function (option, index) {
      var label = document.createElement('label');
      label.className = 'assessment-option';
      if (state.answers[q.id] === option[0]) label.classList.add('is-selected');
      label.innerHTML =
        '<input type="radio" name="' + q.id + '" value="' + option[0] + '"' + (state.answers[q.id] === option[0] ? ' checked' : '') + '>' +
        '<span class="option-index">' + (index < 9 ? '0' : '') + (index + 1) + '</span>' +
        '<span>' + option[1] + '</span>';
      fieldset.appendChild(label);
    });
    screens.question.querySelector('.assessment-next').textContent =
      state.current === questions.length - 1 ? 'Vedi il quadro' : 'Avanti';
    screens.question.querySelector('.assessment-error').hidden = true;
    drumReset();
  }

  /* riquadro risposte: a ogni domanda si riparte dall'alto */
  var drum = screens.question.querySelector('.fondi-drum');
  function drumReset() { if (drum) drum.scrollTop = 0; }
  /* la rotella ovunque sulla schermata domanda scorre le risposte */
  if (drum) {
    screens.question.addEventListener('wheel', function (event) {
      if (event.target.closest && event.target.closest('.fondi-drum')) return;
      drum.scrollTop += event.deltaY;
      event.preventDefault();
      if (window.scrollY) window.scrollTo(0, 0);
    }, { passive: false });
  }

  /* ---------- motore ---------- */
  function guessFund(A) {
    if (A.fund !== 'ns') return A.fund;
    return { ind: 'fondimpresa', art: 'fondart', com: 'forte', stu: 'fondoprof', agr: 'altro', ns: 'fondimpresa' }[A.sector] || 'fondimpresa';
  }

  function buildTools(A, ctx) {
    var t = [];
    var yearly = ctx.payroll * 0.003;
    var conto = A.used === 'si' ? .35 : (A.used === 'poco' ? .7 : 1);
    var dim = ctx.dim, fund = ctx.fund, size = ctx.size;
    var estNote = A.payroll === 'ns' ? ' (stimato dai dipendenti)' : '';

    if (fund === 'fondimpresa') {
      var c = round500(yearly * .7 * 2 * conto);
      t.push({ name: 'Fondimpresa · Conto Formazione', tag: 'open', tagText: 'sempre aperto', color: 'grass',
        what: 'Il 70–80% dello 0,30% che versate torna come conto aziendale, spendibile entro due anni. Paga docenza e affiancamento in azienda. Non serve un ente accreditato.',
        est: 'Conto disponibile stimato: circa ' + eur(c) + estNote,
        need: 'Piano formativo condiviso con le rappresentanze sindacali, registro presenze, attestati. Istruttoria 30 giorni, rimborso dopo il rendiconto.', c: c });
      if (dim !== 'grande') t.push({ name: 'Fondimpresa · Contributo aggiuntivo PMI', tag: 'open', tagText: 'termini riaperti', color: 'grass',
        what: 'Integra il conto delle PMI con un contributo da 1.500 a 10.000 euro quando il conto è piccolo.',
        est: 'Fino a ' + eur(10000) + ', da verificare sul conto', need: 'Stessa pratica del conto formazione.', c: dim === 'micro' ? 6000 : 10000 });
      t.push({ name: 'Fondimpresa · Avviso 3/2026 Innovazione', tag: 'soon', tagText: '29 set – 30 ott 2026', color: 'tang',
        what: 'Piani da 40 a 150 mila euro per formazione legata a un progetto reale di innovazione digitale. Presentato da un ente qualificato con cui lavoriamo.',
        est: 'Copre la formazione di un programma intero, non le licenze', need: 'Progetto digitale concreto, ente proponente, tempi 2–4 mesi.', c: 0, prog: 35000 });
      t.push({ name: 'Fondimpresa · Avviso 4/2026 Competenze avanzate (area IA)', tag: 'soon', tagText: 'piani aziende 1 – 22 dic 2026', color: 'tang',
        what: 'Corsi a catalogo fino a 40 ore, fino a 150 euro l’ora, con un’area dedicata all’intelligenza artificiale.',
        est: 'Copre un percorso da 40 ore, circa ' + eur(6000), need: 'Corso a catalogo di un ente qualificato; pesa in parte sul vostro conto.', c: 0, sprint: 6000 });
    } else if (fund === 'forte') {
      var cf = round500(yearly * .7 * 2 * conto);
      t.push({ name: 'For.Te · Conto individuale aziendale', tag: 'open', tagText: 'sempre aperto', color: 'grass',
        what: 'Il versato torna come conto aziendale per formazione, anche on the job e coaching.',
        est: 'Conto disponibile stimato: circa ' + eur(cf) + estNote, need: 'Piano condiviso, ente attuatore, registro e attestati.', c: cf });
      if (A.size === 's4' || A.size === 's5') t.push({ name: 'For.Te · Avviso 2/2026', tag: 'soon', tagText: 'entro il 20 ott 2026', color: 'tang',
        what: 'Riservato ad aziende da 51 a 249 dipendenti: aula, affiancamento, coaching.',
        est: 'Copre la formazione di un percorso intero', need: 'Ente attuatore, presentazione entro il 20 ottobre.', c: 0, perc: 15000, prog: 30000 });
      else t.push({ name: 'For.Te · Catalogo voucher 2026–27', tag: 'open', tagText: 'aperto', color: 'grass',
        what: 'Per aziende da 1 a 50 dipendenti: corsi a catalogo pagati con voucher.',
        est: 'Copre corsi brevi a catalogo, fino a circa ' + eur(4000), need: 'Corso inserito nel catalogo For.Te di un ente.', c: 0, sprint: 4000 });
    } else if (fund === 'fondoprof') {
      t.push({ name: 'Fondoprofessioni · Avviso 01/26', tag: 'soon', tagText: 'sportello fino al 9 ott 2026', color: 'tang',
        what: 'Piani monoaziendali fino a 20 mila euro, 8–40 ore, temi AI e digitale, per studi e aziende aderenti.',
        est: 'Fino a ' + eur(20000) + ' di formazione', need: 'Ente attuatore accreditato al fondo, presenza o aula virtuale.', c: 0, sprint: 6000, perc: 15000, prog: 20000 });
    } else if (fund === 'fonarcom') {
      t.push({ name: 'FonARCom · Voucher Azienda 04/2026', tag: 'open', tagText: 'fino al 30 apr 2027', color: 'grass',
        what: 'Voucher per corsi acquistati sul mercato, fino a circa 6.500 euro per azienda.',
        est: 'Fino a ' + eur(6500) + ' di formazione', need: 'Domanda a sportello, corso di un fornitore qualificato.', c: 0, sprint: 6000, perc: 6500, prog: 6500 });
      if (dim === 'media' || dim === 'grande') { var cn = round500(yearly * .9 * 2 * conto);
        t.push({ name: 'FonARCom · Conto Formazione', tag: 'open', tagText: 'sempre aperto', color: 'grass',
          what: 'Per medie e grandi imprese: fino al 92% del versato torna come conto.', est: 'Stima: circa ' + eur(cn), need: 'Piano aziendale.', c: cn }); }
    } else if (fund === 'fapi') {
      t.push({ name: 'Fapi · Sportello Impresa 2/2026', tag: 'open', tagText: 'fino al 12 dic 2026', color: 'grass',
        what: 'Piani aziendali per le PMI aderenti a Fapi (Confapi).', est: 'Copre la formazione di un percorso', need: 'Piano presentato a sportello.', c: 0, sprint: 6000, perc: 15000, prog: 25000 });
    } else if (fund === 'fondart') {
      t.push({ name: 'Fondartigianato', tag: 'open', tagText: 'avvisi periodici', color: 'grass',
        what: 'Fondo delle imprese artigiane: piani aziendali e voucher a bando.', est: 'Da verificare sull’avviso in corso', need: 'Ente attuatore.', c: 0, sprint: 3000, perc: 5000, prog: 5000 });
    } else if (fund === 'nessuno') {
      t.push({ name: 'Adesione a un fondo interprofessionale', tag: 'wait', tagText: 'da fare ora', color: 'sky',
        what: 'Non costa nulla: si sceglie sul modello UniEmens del mese. Da lì lo 0,30% che già versate all’INPS inizia a tornare come conto formazione.',
        est: 'Effetto dal mese successivo all’adesione', need: 'Una riga sul cedolino, la fa il consulente del lavoro.', c: 0 });
    } else {
      var ca = round500(yearly * .6 * 2 * conto);
      t.push({ name: 'Il vostro fondo interprofessionale', tag: 'open', tagText: 'da verificare', color: 'grass',
        what: 'Quasi tutti i fondi hanno un conto aziendale o avvisi per formazione su digitale e AI.', est: 'Stima prudente: ' + eur(ca), need: 'Verifica di dieci minuti con noi.', c: ca });
    }
    if (A.dir === 'si') t.push({ name: 'Fondirigenti · Conto Formazione', tag: 'open', tagText: 'sempre aperto', color: 'grape',
      what: 'Per i dirigenti: coaching e affiancamento sull’AI ammessi, docente con almeno cinque anni di esperienza.',
      est: 'Qualche migliaio di euro per dirigente', need: 'Piano sul conto dell’azienda.', c: 3000 });

    var dem = A.dem === 'tanto';
    if (A.region === 'pie' && dim !== 'grande') {
      var pct = { micro: .65, piccola: .60, media: .50 }[dim];
      t.push({ name: 'Regione Piemonte · Voucher digitalizzazione PMI 2026', tag: 'soon', tagText: 'domande 22 ott – 15 dic 2026', color: 'sky',
        what: 'Fondo perduto al ' + Math.round(pct * 100) + '% su software, cloud, AI e canoni fino a due anni; consulenza e formazione fino al 30% del progetto. Massimo 25.000 euro. Ordine cronologico: si parte il 22 ottobre alle 11.',
        est: 'Su un progetto da 40 mila: circa ' + eur(Math.min(25000, 40000 * pct)),
        need: 'Self-assessment digitale obbligatorio, fornitore qualificato (Hubique lo è), spese solo dopo la domanda.' + (dem ? ' Attenzione al tetto de minimis.' : ''), v: pct, vmax: 25000 });
    }
    if (A.region === 'lom' && dim !== 'grande') {
      var n = Math.min(size, 10);
      t.push({ name: 'Regione Lombardia · Formazione continua IV edizione', tag: 'open', tagText: 'fino al 31 mar 2027', color: 'sky',
        what: 'Voucher fino a 2.000 euro per lavoratore e 50.000 per azienda l’anno, su corsi a catalogo di enti accreditati. Cofinanziamento dal 10% al 50% secondo la taglia.',
        est: 'Per ' + n + ' persone in formazione: fino a ' + eur(n * 2000), need: 'Corso nel catalogo regionale di un ente accreditato con cui lavoriamo.',
        c: n * 2000 * (dim === 'micro' ? .9 : dim === 'piccola' ? .7 : .5) });
      t.push({ name: 'Camera di Commercio Milano MB Lodi · Voucher doppia transizione', tag: 'open', tagText: 'spese entro il 30 apr 2027', color: 'sky',
        what: '50% a fondo perduto fino a 10.000 euro su consulenza e formazione digitale, investimento minimo 4.000.',
        est: 'Fino a ' + eur(10000) + ', solo per le province di Milano, Monza Brianza e Lodi', need: 'Fornitore qualificato, domanda a sportello.', v: .5, vmax: 10000 });
    }
    if (A.region === 'ven' && dim !== 'grande') t.push({ name: 'Camere di Commercio venete · Voucher digitali', tag: 'soon', tagText: 'Padova e Treviso entro il 23 ott 2026', color: 'sky',
      what: 'Contributo al 50% su consulenza e formazione digitale, importi tipici fino a 10.000 euro; varia per provincia.',
      est: 'Fino a ' + eur(10000) + ', da verificare per la vostra provincia', need: 'Fornitore qualificato.', v: .5, vmax: 10000 });
    if (A.region === 'emr' && dim !== 'grande') t.push({ name: 'Camera di Commercio di Bologna e avvisi di filiera regionali', tag: 'soon', tagText: 'Bologna entro il 15 ott 2026', color: 'sky',
      what: 'Voucher digitali camerali al 50% e avvisi regionali di filiera per la formazione tramite enti accreditati.',
      est: 'Fino a ' + eur(10000) + ' camerali, da verificare per provincia', need: 'Fornitore qualificato o ente accreditato.', v: .5, vmax: 10000 });
    if (A.region === 'fvg' && dim !== 'grande') t.push({ name: 'Voucher camerali e avvisi FVG', tag: 'open', tagText: 'da verificare', color: 'sky',
      what: 'Le Camere di Commercio del Friuli-Venezia Giulia attivano voucher digitali periodici; la Regione ha avvisi per la formazione continua.',
      est: 'Da verificare con noi', need: 'Fornitore qualificato.', v: .5, vmax: 8000 });
    if (A.region === 'nord' || A.region === 'centro' || A.region === 'sud') t.push({ name: 'Voucher camerali della vostra provincia', tag: 'open', tagText: 'da verificare', color: 'sky',
      what: 'Molte Camere di Commercio aderiscono al «Voucher doppia transizione» con contributi al 50% su consulenza e formazione digitale.',
      est: 'Tipicamente fino a ' + eur(10000), need: 'Verifica per provincia.', v: .5, vmax: 8000 });
    if (A.region === 'sud' && dim !== 'grande') t.push({ name: 'MIMIT · Sviluppo competenze PMI (Mezzogiorno)', tag: 'soon', tagText: 'sportello 10 set – 21 dic 2026', color: 'sky',
      what: 'Contributo dal 50 al 70% su formazione e consulenza per le PMI del Sud.', est: 'Fino al 70% delle spese ammesse', need: 'Domanda a sportello.', v: .6, vmax: 20000 });
    t.push({ name: 'Fondo Nuove Competenze (4ª edizione)', tag: 'wait', tagText: 'attesa fine 2026', color: 'sun',
      what: 'Paga le ore dei lavoratori in formazione (non la docenza), con accordo sindacale. La terza edizione è chiusa; la quarta è attesa.',
      est: 'Si somma agli altri: copre il costo del tempo delle persone', need: 'Accordo sindacale, ente accreditato.', c: 0 });
    return t;
  }

  function calculate() {
    var A = state.answers;
    var size = SIZE[A.size];
    var dim = A.size === 's1' ? 'micro' : ((A.size === 's2' || A.size === 's3') ? 'piccola' : ((A.size === 's4' || A.size === 's5') ? 'media' : 'grande'));
    var payroll = PAY[A.payroll] || size * 32000;
    var fund = guessFund(A);
    var ctx = { size: size, dim: dim, payroll: payroll, fund: fund };
    var tools = buildTools(A, ctx);

    var res = {};
    PROJECTS.forEach(function (p) {
      var trainCost = p.total * p.training, softCost = p.total - trainCost;
      var train = 0;
      tools.forEach(function (t) { if (t.c) train += t.c; if (t[p.key]) train = Math.max(train, t[p.key]); });
      train = Math.min(train, trainCost);
      var soft = 0;
      tools.forEach(function (t) { if (t.v) soft = Math.max(soft, Math.min(t.vmax, (softCost + trainCost * .3) * t.v)); });
      soft = Math.min(soft, softCost + Math.max(0, trainCost - train));
      var covered = Math.min(p.total, train + soft);
      res[p.key] = { label: p.label, total: p.total, covered: covered, left: p.total - covered };
    });
    var pick = { b1: 'sprint', b2: 'perc', b3: 'prog', b4: 'prog' }[A.budget] || 'sprint';
    var main = res[pick];
    var pct = Math.round(main.covered / main.total * 100);
    var soon = tools.filter(function (t) { return t.tag === 'soon'; });
    var now = tools.filter(function (t) { return t.tag !== 'wait'; });
    return { ctx: ctx, tools: tools, res: res, pick: pick, main: main, pct: pct, zero: main.left <= 500, soon: soon, now: now, guessed: A.fund === 'ns' || A.fund === 'altro' };
  }

  function whyText(r) {
    var A = state.answers, parts = [];
    if (r.zero) {
      parts.push('<b>La formazione la paga il fondo</b> a cui versate; gli strumenti rientrano nel voucher.');
      parts.push('<b>Resta da verificare il conto reale</b> sul vostro cedolino: dieci minuti.');
      return parts;
    }
    if (A.used === 'si') parts.push('<b>Usate già il conto formazione:</b> il residuo è più basso.');
    if (!r.tools.some(function (t) { return t.v; })) parts.push('<b>Nessun voucher aperto per le licenze</b> nella vostra regione oggi: la parte strumenti resta a carico.');
    if (r.ctx.dim === 'micro') parts.push('<b>Sotto i dieci dipendenti</b> il conto formazione è piccolo: pesano di più voucher e avvisi.');
    if (r.ctx.fund === 'nessuno') parts.push('<b>Senza adesione a un fondo</b> il versato resta all’INPS. Aderire non costa nulla.');
    parts.push('<b>La cifra è prudente:</b> al telefono, con i dati veri, spesso migliora.');
    return parts;
  }

  function renderResult() {
    state.result = calculate();
    var r = state.result, A = state.answers;
    var R = screens.result;
    R.querySelector('.fondi-result-title').textContent = r.zero
      ? 'Nel vostro caso il primo progetto può arrivare a costo zero.'
      : 'Nel vostro caso il fondo copre circa il ' + r.pct + '% del primo progetto.';
    R.querySelector('.score-value').textContent = r.pct;
    R.querySelector('.score-orbit').style.setProperty('--score', r.pct);
    R.querySelector('.result-level').textContent = 'Azienda ' + r.ctx.dim + ' · ' + LABELS.size[A.size] + ' dipendenti · ' + LABELS.region[A.region];
    R.querySelector('.result-headline').textContent = r.zero ? 'Copertura piena sul taglio scelto.' : 'Copertura stimata ' + r.pct + '% sul taglio scelto.';
    R.querySelector('.result-copy').textContent =
      (r.guessed ? 'Non conoscete il fondo: dal contratto indicato è probabile ' + LABELS.fund[r.ctx.fund] + ', e la stima parte da lì. ' : 'Fondo indicato: ' + LABELS.fund[r.ctx.fund] + '. ') +
      'Taglio di progetto considerato: ' + r.main.label.toLowerCase() + ', ' + eurText(r.main.total) + '.';
    R.querySelector('.fondi-left').textContent = r.zero ? 'zero' : eurText(r.main.left);
    R.querySelector('.fondi-count').textContent = r.now.length;

    var first = r.tools.filter(function (t) { return t.c; })[0] || r.now[0];
    R.querySelector('.result-strength-title').textContent = first ? first.name : '—';
    R.querySelector('.result-strength-copy').innerHTML = first ? first.est : '';
    var deadline = r.soon[0];
    R.querySelector('.result-priority-title').textContent = deadline ? deadline.tagText : 'Nessuna scadenza stretta';
    R.querySelector('.result-priority-copy').textContent = deadline ? deadline.name : 'Gli strumenti applicabili sono a sportello aperto: si parte quando volete.';

    R.querySelector('.fondi-tools').innerHTML = r.tools.map(function (t) {
      return '<article class="dimension-card fondi-tool" style="--dim-color: var(--' + t.color + ')">' +
        '<div class="dimension-card-top"><span>' + t.tagText + '</span><b class="fondi-tag fondi-tag-' + t.tag + '">' + ({ open: 'aperto', soon: 'scadenza', wait: 'in attesa' })[t.tag] + '</b></div>' +
        '<h3>' + t.name + '</h3><p>' + t.what + '</p><p class="fondi-est">' + t.est + '</p><p class="fondi-need"><em>Cosa serve:</em> ' + t.need + '</p></article>';
    }).join('');

    R.querySelector('.fondi-table').innerHTML =
      '<tr><th>Progetto</th><th>Costo</th><th>Coperto</th><th>A vostro carico</th></tr>' +
      PROJECTS.map(function (p) {
        var x = r.res[p.key];
        return '<tr' + (p.key === r.pick ? ' class="is-pick"' : '') + '><td>' + x.label + '</td><td>' + eurText(x.total) + '</td><td>' + eurText(x.covered) + '</td><td>' + (x.left <= 500 ? '<b>zero</b>' : '<b>' + eurText(x.left) + '</b>') + '</td></tr>';
      }).join('');

    R.querySelector('.fondi-why-title').textContent = r.zero ? 'Perché zero' : 'Perché non è zero';
    R.querySelector('.fondi-why').innerHTML = whyText(r).map(function (s) { return '<p>' + s + '</p>'; }).join('');

    var subject = 'Verifica del fondo in 10 minuti — ' + LABELS.region[A.region] + ', ' + LABELS.size[A.size] + ' dipendenti';
    var body = encodeURIComponent('Buongiorno, ho fatto il test "Quanto copre il fondo" (copertura stimata ' + r.pct + '%, fondo ' + LABELS.fund[r.ctx.fund] + ', processo: ' + LABELS.proc[A.proc] + '). Vorrei la verifica di dieci minuti al telefono.\n\nAzienda: \nTelefono: \nQuando: ');
    R.querySelector('.assessment-mailto').href = 'mailto:m.campagnoni@hubique.it?subject=' + encodeURIComponent(subject) + '&body=' + body;
  }

  /* ---------- eventi ---------- */
  screens.intro.querySelector('.assessment-start').addEventListener('click', function () {
    state.current = 0; renderQuestion(); showScreen('question');
  });
  screens.question.querySelector('.assessment-prev').addEventListener('click', function () {
    if (state.current === 0) { showScreen('intro'); return; }
    state.current -= 1; renderQuestion(); showScreen('question');
  });
  screens.question.querySelector('.assessment-options').addEventListener('change', function (event) {
    if (event.target.name !== questions[state.current].id) return;
    state.answers[event.target.name] = event.target.value;
    screens.question.querySelectorAll('.assessment-option').forEach(function (l) { l.classList.toggle('is-selected', l.querySelector('input').checked); });
    screens.question.querySelector('.assessment-error').hidden = true;
    /* la scelta fa avanzare da sola: niente scroll fino al pulsante */
    var answered = state.current;
    setTimeout(function () {
      if (state.current !== answered) return;
      if (state.current === questions.length - 1) { renderResult(); showScreen('result'); return; }
      state.current += 1; renderQuestion(); showScreen('question');
    }, 260);
  });
  screens.question.querySelector('.assessment-next').addEventListener('click', function () {
    var q = questions[state.current];
    if (!state.answers[q.id]) { screens.question.querySelector('.assessment-error').hidden = false; return; }
    if (state.current === questions.length - 1) { renderResult(); showScreen('result'); return; }
    state.current += 1; renderQuestion(); showScreen('question');
  });
  screens.result.querySelector('.assessment-restart').addEventListener('click', function () {
    state.current = 0; state.answers = {}; state.result = null;
    screens.result.querySelector('.full-report').hidden = true;
    screens.result.querySelector('.report-gate').hidden = false;
    document.querySelector('.assessment-email-form').reset();
    showScreen('intro');
  });

  document.querySelector('.assessment-email-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    if (!form.reportValidity()) return;
    var email = form.elements.email.value.trim();
    var A = state.answers, r = state.result;
    /* lead via FormSubmit come per il test AI: arriva a m.campagnoni@hubique.it
       con copia a info@hubique.it e le risposte in tabella. Fire-and-forget. */
    try {
      fetch('https://formsubmit.co/ajax/m.campagnoni@hubique.it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Lead fondi — copertura ' + r.pct + '% (' + LABELS.region[A.region] + ', ' + LABELS.size[A.size] + ' dip.)',
          _cc: 'info@hubique.it',
          _template: 'table',
          test: 'Quanto copre il fondo',
          email: email,
          copertura: r.pct + '% sul taglio ' + r.main.label,
          quota_a_carico: r.zero ? 'zero' : eurText(r.main.left),
          regione: LABELS.region[A.region],
          dipendenti: LABELS.size[A.size],
          contratto: A.sector,
          fondo_dichiarato: A.fund,
          fondo_stimato: LABELS.fund[r.ctx.fund],
          conto_usato: A.used,
          dirigenti: A.dir,
          aiuti_de_minimis: A.dem,
          retribuzioni: A.payroll,
          processo: LABELS.proc[A.proc],
          budget: LABELS.budget[A.budget],
          strumenti: r.now.map(function (t) { return t.name; }).join(' | '),
          pagina: 'https://hubique.it/fondi.html'
        })
      }).catch(function () {});
    } catch (e) {}
    try {
      localStorage.setItem('hubique_fondi_lead', JSON.stringify({ email: email, answers: A, pct: r.pct, createdAt: new Date().toISOString() }));
    } catch (e) {}
    form.querySelector('.email-status').textContent = 'Quadro sbloccato.';
    screens.result.querySelector('.report-gate').hidden = true;
    screens.result.querySelector('.full-report').hidden = false;
    setTimeout(function () {
      screens.result.querySelector('.full-report').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  });
})();
