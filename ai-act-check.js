(function () {
  'use strict';

  /* ======================== DATI ======================== */

  var ANNEX_III = ['hr', 'credito', 'istruzione', 'biometria', 'sanita'];

  var dimensions = {
    mapping: {
      label: 'Mappatura & classificazione',
      scope: 'Fondamenta',
      color: '#00B2FF',
      weight: 0.15,
      descriptions: [
        'Non sai quali sistemi AI girano in azienda: ogni obbligo parte da qui.',
        'C’è un’idea informale, ma nulla di scritto o classificato.',
        'I sistemi principali sono elencati e classificati a grandi linee.',
        'Registro aggiornato e classificazione per rischio, rivista quando cambia l’uso.'
      ],
      actions: [
        'Censisci in una settimana tutti gli strumenti AI in uso, ufficiali e non.',
        'Per ogni sistema annota owner, scopo, fornitore e categoria di rischio AI Act.',
        'Rivedi il registro a ogni nuovo tool o cambio d’uso, non una volta l’anno.'
      ]
    },
    prohibited: {
      label: 'Pratiche vietate (art. 5)',
      scope: 'Già in vigore',
      color: '#FF5C38',
      weight: 0.20,
      descriptions: [
        'Nessuna verifica sulle pratiche vietate: è il rischio sanzione più alto (fino a 35 M€ o 7% del fatturato).',
        'Pensi di essere a posto, ma senza un controllo formale non puoi dimostrarlo.',
        'Verifica fatta una tantum: serve un presidio continuo sui nuovi strumenti.',
        'Verifica documentata e ripetuta su ogni nuovo tool: presidio corretto.'
      ],
      actions: [
        'Verifica subito che nessun tool faccia social scoring, riconoscimento emozioni su dipendenti o scraping biometrico.',
        'Documenta la verifica: data, sistemi esaminati, esito, firma di chi l’ha fatta.',
        'Inserisci il controllo art. 5 nella procedura di adozione di ogni nuovo strumento.'
      ]
    },
    literacy: {
      label: 'Alfabetizzazione & policy (art. 4)',
      scope: 'Già in vigore',
      color: '#FFB200',
      weight: 0.20,
      descriptions: [
        'Nessuna formazione e nessuna regola: l’obbligo di alfabetizzazione è in vigore da febbraio 2025.',
        'Formazione lasciata ai singoli e indicazioni verbali: non dimostrabile.',
        'Formazione e policy esistono ma non coprono tutti né vengono applicate davvero.',
        'Formazione per ruolo tracciata e policy conosciuta e applicata: obbligo presidiato.'
      ],
      actions: [
        'Organizza una formazione AI di base per chi usa strumenti AI, e tieni il registro presenze.',
        'Scrivi una policy di una pagina: strumenti ammessi, dati vietati, casi d’uso approvati.',
        'Aggiorna formazione e policy quando cambiano strumenti o normativa.'
      ]
    },
    transparency: {
      label: 'Trasparenza (art. 50)',
      scope: 'Dal 2 agosto 2026',
      color: '#AB54F7',
      weight: 0.10,
      descriptions: [
        'Chatbot e contenuti AI non dichiarati: da agosto 2026 è una violazione.',
        'La trasparenza è lasciata al caso: serve una regola, non buone intenzioni.',
        'Dichiarato nei casi principali, ma senza un criterio uniforme.',
        'Interazioni e contenuti AI sempre dichiarati dove richiesto: pronto per l’art. 50.'
      ],
      actions: [
        'Aggiungi a ogni chatbot un messaggio chiaro: “Stai parlando con un assistente AI”.',
        'Definisci quali contenuti generati da AI vanno etichettati e come.',
        'Inserisci la regola di trasparenza nella policy e nei brief a fornitori e agenzie.'
      ]
    },
    highrisk: {
      label: 'Sistemi ad alto rischio (art. 26)',
      scope: 'Dal 2 agosto 2026',
      color: '#0072E3',
      weight: 0.20,
      descriptions: [
        'Usi AI in ambiti sensibili senza supervisione, log né valutazione d’impatto.',
        'Qualche cautela informale, ma nulla che regga un controllo.',
        'Supervisione e log esistono ma non sono formalizzati come richiede l’art. 26.',
        'Supervisione umana, log e valutazione d’impatto documentati: obblighi deployer presidiati.'
      ],
      actions: [
        'Assegna a una persona formata la supervisione delle decisioni AI in ambiti sensibili, con potere di ignorare l’output.',
        'Attiva la conservazione dei log (minimo 6 mesi) e una procedura per anomalie e incidenti.',
        'Fai una valutazione d’impatto sui diritti delle persone, integrata con la DPIA GDPR.'
      ]
    },
    genai: {
      label: 'Uso responsabile dell’AI generativa',
      scope: 'Operatività quotidiana',
      color: '#0072E3',
      weight: 0.20,
      descriptions: [
        'Output non verificati e dati riservati nei prompt: rischio operativo e legale quotidiano.',
        'Il controllo dipende dal buon senso dei singoli, senza regole condivise.',
        'Controlli previsti sui casi principali, ma non sistematici.',
        'Verifica degli output, regole sui dati nei prompt e gestione errori: uso maturo.'
      ],
      actions: [
        'Vieta esplicitamente l’inserimento di dati riservati o personali nei tool AI non approvati.',
        'Definisci chi verifica gli output AI prima che arrivino a clienti o decisioni.',
        'Raccogli gli errori e le allucinazioni trovate: sono la base della formazione interna.'
      ]
    },
    governance: {
      label: 'Governance & fornitori',
      scope: 'Presidio continuo',
      color: '#00AA3C',
      weight: 0.15,
      descriptions: [
        'Nessun responsabile e fornitori mai verificati: la compliance non ha un proprietario.',
        'Se ne parla, ma nessuno ha l’incarico né verifica i contratti.',
        'Un responsabile informale e qualche richiesta ai fornitori principali.',
        'Ruolo assegnato, raccordo con DPO/legale e checklist fornitori: presidio solido.'
      ],
      actions: [
        'Assegna formalmente la responsabilità della compliance AI, raccordata con privacy e legale.',
        'Prepara una checklist fornitori: istruzioni d’uso, conformità, clausole su dati e responsabilità.',
        'Porta la compliance AI in direzione almeno due volte l’anno.'
      ]
    }
  };

  function q(id, dimension, section, title, help, options) {
    return { id: id, dimension: dimension, section: section, title: title, help: help, options: options };
  }

  var QUESTIONS_CORE_1 = [
    q('q1', 'mapping', 'Fondamenta · Mappatura',
      'Sapete quali sistemi AI sono in uso in azienda?',
      'Contano anche gli strumenti che le persone usano per conto proprio.',
      ['Nessuna idea, ognuno usa quello che vuole',
       'Idea informale, nessun elenco scritto',
       'Elenco parziale dei tool principali',
       'Registro aggiornato con owner, scopo e fornitore per ogni sistema']),
    q('q2', 'mapping', 'Fondamenta · Classificazione',
      'Avete classificato ogni sistema secondo le categorie di rischio dell’AI Act?',
      'Le categorie: vietato, alto rischio, rischio limitato, rischio minimo.',
      ['Non sapevo esistessero categorie',
       'Ne ho sentito parlare, mai applicate',
       'Classificazione fatta a spanne sui sistemi principali',
       'Classificazione documentata e rivista quando cambia l’uso']),
    q('q3', 'prohibited', 'Già in vigore · Pratiche vietate',
      'Avete verificato di non usare pratiche vietate dall’art. 5?',
      'Social scoring, riconoscimento emozioni su dipendenti, manipolazione, scraping biometrico. In vigore da febbraio 2025.',
      ['Mai verificato',
       'Credo di no, ma nessun controllo formale',
       'Verifica fatta una tantum',
       'Verifica documentata più controllo su ogni nuovo tool']),
    q('q4', 'literacy', 'Già in vigore · Formazione',
      'Il personale che usa AI ha ricevuto formazione adeguata?',
      'L’obbligo di alfabetizzazione AI (art. 4) è in vigore da febbraio 2025.',
      ['Nessuna formazione',
       'Qualcuno si è formato da solo',
       'Formazione una tantum per alcuni ruoli',
       'Programma di formazione per ruolo, aggiornato e tracciato']),
    q('q5', 'literacy', 'Già in vigore · Policy',
      'Esiste una policy interna sull’uso dell’AI?',
      'Cosa si può fare, con quali dati, con quali strumenti.',
      ['Nessuna regola',
       'Indicazioni verbali sparse',
       'Policy scritta ma poco conosciuta o applicata',
       'Policy scritta e comunicata, con casi d’uso approvati e vietati'])
  ];

  var QUESTIONS_TRANSPARENCY = [
    q('q6', 'transparency', 'Trasparenza · Chatbot',
      'Chi interagisce con un vostro chatbot o voicebot sa che sta parlando con un’AI?',
      'Dal 2 agosto 2026 dichiararlo è un obbligo (art. 50).',
      ['Non lo dichiariamo, o non lo so',
       'Si capisce, ma non è esplicitato',
       'Dichiarato in alcuni canali',
       'Sempre dichiarato in modo chiaro']),
    q('q7', 'transparency', 'Trasparenza · Contenuti',
      'I contenuti generati o modificati da AI e pubblicati sono riconoscibili dove richiesto?',
      'Immagini, testi e video pubblicati verso clienti o pubblico.',
      ['No, nessuna etichettatura',
       'Ci pensiamo caso per caso',
       'Etichettiamo i casi più evidenti',
       'Regola chiara su cosa etichettare e come'])
  ];

  var QUESTIONS_HIGHRISK = [
    q('q8', 'highrisk', 'Alto rischio · Supervisione',
      'Sui sistemi AI usati in ambiti sensibili c’è supervisione umana reale?',
      'HR, credito, istruzione, biometria, sanità: obblighi deployer, art. 26.',
      ['Il sistema decide, nessuno controlla',
       'Controllo umano solo se qualcuno si lamenta',
       'Revisione umana prevista ma non formalizzata',
       'Ruoli di supervisione definiti e formati, con potere di ignorare l’output']),
    q('q9', 'highrisk', 'Alto rischio · Log e dati',
      'Conservate i log e controllate la qualità dei dati di input di questi sistemi?',
      'L’art. 26 richiede log per almeno sei mesi e monitoraggio del funzionamento.',
      ['No',
       'Log solo se il fornitore li tiene, mai guardati',
       'Log conservati, controlli saltuari',
       'Log conservati, monitoraggio del funzionamento e procedura per anomalie']),
    q('q10', 'highrisk', 'Alto rischio · Impatto',
      'Avete valutato l’impatto su diritti delle persone, in coordinamento con la DPIA GDPR?',
      'Per alcuni deployer è richiesta una valutazione d’impatto specifica (FRIA).',
      ['Nessuna valutazione',
       'Solo DPIA privacy, AI non considerata',
       'Valutazione informale',
       'Valutazione documentata e integrata con il GDPR'])
  ];

  var QUESTIONS_GENAI = [
    q('q8', 'genai', 'AI generativa · Controllo output',
      'Come controllate i contenuti prodotti dall’AI prima di usarli?',
      'Testi, analisi, email e codice generati con strumenti come ChatGPT o Copilot.',
      ['Si usano così come escono',
       'Ognuno controlla come crede',
       'Revisione prevista per i contenuti verso l’esterno',
       'Regole di verifica chiare, con responsabili per i casi sensibili']),
    q('q9', 'genai', 'AI generativa · Dati nei prompt',
      'Che regole avete sui dati inseriti nei prompt?',
      'Dati di clienti, dipendenti, prezzi e informazioni riservate.',
      ['Nessuna: ognuno incolla ciò che serve',
       'Raccomandazioni verbali generiche',
       'Regola scritta sui dati vietati, applicazione non verificata',
       'Regola scritta, strumenti approvati e controlli periodici']),
    q('q10', 'genai', 'AI generativa · Errori',
      'Come gestite errori e allucinazioni dell’AI?',
      'Un errore non intercettato può arrivare a un cliente o a una decisione.',
      ['Non ci abbiamo mai pensato',
       'Se qualcuno se ne accorge, corregge',
       'Verifica prevista sui contenuti importanti',
       'Verifica sistematica e raccolta degli errori per migliorare le regole'])
  ];

  var QUESTIONS_CORE_2 = [
    q('q11', 'governance', 'Governance · Responsabile',
      'C’è un responsabile della compliance AI, raccordato con privacy e legale?',
      'Qualcuno che risponde della conformità, non solo un interessato al tema.',
      ['Nessuno se ne occupa',
       'Se ne parla, nessun incarico',
       'Responsabile informale, part-time',
       'Ruolo assegnato, raccordo con DPO e legale, riporta alla direzione']),
    q('q12', 'governance', 'Governance · Fornitori',
      'Verificate i fornitori di sistemi AI?',
      'Documentazione, conformità, marcatura CE per l’alto rischio, clausole contrattuali.',
      ['Firmiamo e basta',
       'Guardiamo solo prezzo e funzioni',
       'Chiediamo documentazione ai fornitori principali',
       'Checklist fornitori: istruzioni d’uso, conformità, clausole su dati e responsabilità'])
  ];

  /* ======================== LOGICA PURA ======================== */

  function buildQuestions(profile) {
    var highRisk = profile.areas.some(function (a) { return ANNEX_III.indexOf(a) !== -1; });
    var list = QUESTIONS_CORE_1
      .concat(profile.publicAI ? QUESTIONS_TRANSPARENCY : [])
      .concat(highRisk ? QUESTIONS_HIGHRISK : QUESTIONS_GENAI)
      .concat(QUESTIONS_CORE_2);
    return { questions: list, highRisk: highRisk };
  }

  function computeResult(questions, answers) {
    var active = {};
    questions.forEach(function (item) {
      if (!active[item.dimension]) active[item.dimension] = [];
      active[item.dimension].push(item);
    });
    var scores = {};
    var totalWeight = 0;
    var weighted = 0;
    Object.keys(active).forEach(function (key) {
      var items = active[key];
      var raw = items.reduce(function (sum, item) { return sum + Number(answers[item.id] || 0); }, 0);
      var score = Math.round((raw / (items.length * 3)) * 100);
      scores[key] = score;
      totalWeight += dimensions[key].weight;
      weighted += score * dimensions[key].weight;
    });
    var overall = Math.round(weighted / totalWeight);
    var entries = Object.keys(scores).map(function (key) { return [key, scores[key]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    return {
      scores: scores,
      overall: overall,
      band: band(overall),
      strongest: entries[0][0],
      priority: entries[entries.length - 1][0],
      activeDims: Object.keys(active)
    };
  }

  function band(score) {
    if (score <= 25) return { level: 1, name: 'Esposto', headline: 'Gli obblighi già in vigore sono scoperti: il rischio sanzione è adesso, non nel 2026.' };
    if (score <= 50) return { level: 2, name: 'Iniziale', headline: 'La consapevolezza c’è, ma nulla è formalizzato: non potresti dimostrare la conformità.' };
    if (score <= 75) return { level: 3, name: 'In marcia', headline: 'Le basi ci sono: mancano documentazione e presidio dei punti sensibili.' };
    return { level: 4, name: 'Pronto', headline: 'Impianto solido: ora mantienilo e monitora gli aggiornamenti normativi.' };
  }

  function scoreIndex(score) {
    if (score < 25) return 0;
    if (score < 50) return 1;
    if (score < 75) return 2;
    return 3;
  }

  function buildDeadlines(profile, result, highRisk) {
    var items = [];
    var urgentGap = (result.scores.prohibited < 75) || (result.scores.literacy < 75);
    items.push({
      date: '2 febbraio 2025 — già in vigore',
      title: 'Pratiche vietate (art. 5) e alfabetizzazione AI (art. 4)',
      text: urgentGap
        ? 'Questa scadenza è già passata e dal tuo profilo risulta scoperta: verifica delle pratiche vietate e formazione del personale sono la priorità immediata.'
        : 'Obblighi già presidiati dal tuo profilo: mantieni verifiche e formazione aggiornate e documentate.'
    });
    if (profile.publicAI) {
      items.push({
        date: '2 agosto 2026',
        title: 'Trasparenza (art. 50)',
        text: 'Chatbot dichiarati e contenuti AI etichettati dove richiesto: riguarda direttamente i tuoi canali verso clienti e pubblico.'
      });
    }
    if (highRisk) {
      items.push({
        date: '2 agosto 2026',
        title: 'Obblighi deployer per sistemi ad alto rischio (art. 26)',
        text: 'Usi AI in ambiti Annex III (HR, credito, istruzione, biometria o sanità): servono supervisione umana formalizzata, log e valutazione d’impatto.'
      });
    }
    if (profile.role === 'provider' || profile.role === 'ibrido') {
      items.push({
        date: '2 agosto 2027',
        title: 'AI in prodotti regolamentati e obblighi provider',
        text: 'Sviluppi o integri AI in prodotti o servizi per clienti: valuta gli obblighi da provider, inclusa documentazione tecnica e marcatura CE dove applicabile.'
      });
    }
    if (profile.size === 'micro' || profile.size === 'piccola') {
      items.push({
        date: 'Semplificazioni PMI',
        title: 'L’AI Act prevede oneri ridotti per micro e piccole imprese',
        text: 'Documentazione semplificata e supporto dedicato: gli obblighi restano, ma il percorso è proporzionato alla tua dimensione.'
      });
    }
    return items;
  }

  function summaryText(result, highRisk) {
    var parts = [];
    if (result.scores.prohibited < 50 || result.scores.literacy < 50) {
      parts.push('Attenzione: le lacune più gravi sono su obblighi già in vigore da febbraio 2025, dove il rischio sanzione è immediato.');
    } else {
      parts.push('Gli obblighi già in vigore risultano ragionevolmente presidiati.');
    }
    parts.push('La priorità di lavoro è ' + dimensions[result.priority].label.toLowerCase() + '.');
    if (highRisk) {
      parts.push('Usando AI in ambiti sensibili, la scadenza di agosto 2026 sugli obblighi deployer ti riguarda direttamente.');
    }
    return parts.join(' ');
  }

  // esposto per test automatici; nessun effetto sull'uso in pagina
  if (typeof globalThis !== 'undefined') {
    globalThis.AIACT = { buildQuestions: buildQuestions, computeResult: computeResult, buildDeadlines: buildDeadlines, band: band, dimensions: dimensions };
  }

  if (typeof document === 'undefined') return;

  /* ======================== DOM ======================== */

  var state = {
    current: 0,
    answers: {},
    profile: { role: '', size: '', areas: [], publicAI: false },
    questions: [],
    highRisk: false,
    result: null
  };

  var screens = {
    intro: document.querySelector('[data-screen="intro"]'),
    profile: document.querySelector('[data-screen="profile"]'),
    question: document.querySelector('[data-screen="question"]'),
    result: document.querySelector('[data-screen="result"]')
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      var isActive = key === name;
      screens[key].hidden = !isActive;
      screens[key].classList.toggle('is-active', isActive);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    var item = state.questions[state.current];
    var progress = ((state.current + 1) / state.questions.length) * 100;
    screens.question.querySelector('.assessment-progress span').style.width = progress + '%';
    screens.question.querySelector('.assessment-phase').textContent = item.section;
    screens.question.querySelector('.assessment-count').textContent = (state.current + 1) + ' / ' + state.questions.length;
    screens.question.querySelector('.assessment-dimension').textContent = dimensions[item.dimension].label;
    screens.question.querySelector('.assessment-question-title').textContent = item.title;
    screens.question.querySelector('.assessment-question-help').textContent = item.help;

    var fieldset = screens.question.querySelector('.assessment-options');
    fieldset.innerHTML = '<legend class="sr-only">' + item.title + '</legend>';
    item.options.forEach(function (option, index) {
      var label = document.createElement('label');
      label.className = 'assessment-option';
      if (state.answers[item.id] === index) label.classList.add('is-selected');
      label.innerHTML =
        '<input type="radio" name="' + item.id + '" value="' + index + '"' +
          (state.answers[item.id] === index ? ' checked' : '') + '>' +
        '<span class="option-index">0' + (index + 1) + '</span>' +
        '<span>' + option + '</span>';
      fieldset.appendChild(label);
    });
    screens.question.querySelector('.assessment-next').textContent =
      state.current === state.questions.length - 1 ? 'Calcola il risultato' : 'Avanti';
    screens.question.querySelector('.assessment-error').hidden = true;
  }

  function renderResult() {
    state.result = computeResult(state.questions, state.answers);
    var r = state.result;
    screens.result.querySelector('.score-value').textContent = r.overall;
    screens.result.querySelector('.score-orbit').style.setProperty('--score', r.overall);
    screens.result.querySelector('.result-level').textContent = 'Fascia ' + r.band.level + ' / 4 · ' + r.band.name;
    screens.result.querySelector('.result-headline').textContent = r.band.headline;
    screens.result.querySelector('.result-copy').textContent = summaryText(r, state.highRisk);

    var strength = dimensions[r.strongest];
    var priority = dimensions[r.priority];
    screens.result.querySelector('.result-strength-title').textContent = strength.label;
    screens.result.querySelector('.result-strength-copy').textContent = strength.descriptions[scoreIndex(r.scores[r.strongest])];
    screens.result.querySelector('.result-priority-title').textContent = priority.label;
    screens.result.querySelector('.result-priority-copy').textContent = priority.actions[0];

    var dimensionReport = screens.result.querySelector('.dimension-report');
    dimensionReport.innerHTML = '';
    r.activeDims.forEach(function (key) {
      var dim = dimensions[key];
      var score = r.scores[key];
      var article = document.createElement('article');
      article.className = 'dimension-card';
      article.style.setProperty('--dim-color', dim.color);
      article.innerHTML =
        '<div class="dimension-card-top"><div><span>' + dim.scope + '</span><h3>' + dim.label + '</h3></div><b>' + score + '/100</b></div>' +
        '<div class="dimension-bar"><span style="width:' + score + '%"></span></div>' +
        '<p>' + dim.descriptions[scoreIndex(score)] + '</p>';
      dimensionReport.appendChild(article);
    });

    var actionKeys = [r.priority];
    r.activeDims
      .filter(function (key) { return key !== r.priority; })
      .sort(function (a, b) { return r.scores[a] - r.scores[b]; })
      .slice(0, 2)
      .forEach(function (key) { actionKeys.push(key); });
    screens.result.querySelector('.report-actions-list').innerHTML = actionKeys.map(function (key, i) {
      return '<li><span>0' + (i + 1) + '</span><div><b>' + dimensions[key].label + '</b><p>' + dimensions[key].actions[i] + '</p></div></li>';
    }).join('');

    var deadlines = buildDeadlines(state.profile, r, state.highRisk);
    screens.result.querySelector('.report-flags').innerHTML = deadlines.map(function (item) {
      return '<p><b>' + item.date + ' · ' + item.title + '.</b> ' + item.text + '</p>';
    }).join('');

    var subject = 'AI Act Compliance Check — ' + r.overall + '/100';
    var body = 'Risultato compliance check:%0A- Totale: ' + r.overall + '/100 (' + r.band.name + ')%0A- Priorità: ' +
      encodeURIComponent(priority.label) + '%0A- Profilo: ' + encodeURIComponent(state.profile.role + ', ' + state.profile.size);
    screens.result.querySelector('.assessment-mailto').href =
      'mailto:info@hubique.it?subject=' + encodeURIComponent(subject) + '&body=' + body;
    showScreen('result');
  }

  function readProfile() {
    var role = document.querySelector('input[name="actrole"]:checked');
    var size = document.querySelector('input[name="actsize"]:checked');
    var pub = document.querySelector('input[name="actpublic"]:checked');
    var areas = Array.prototype.slice.call(document.querySelectorAll('input[name="actarea"]:checked'))
      .map(function (el) { return el.value; });
    state.profile.role = role ? role.value : '';
    state.profile.size = size ? size.value : '';
    state.profile.publicAI = pub ? pub.value === 'si' : false;
    state.profile.areas = areas;
    return !!(role && size && pub && areas.length);
  }

  document.querySelector('.assessment-start').addEventListener('click', function () {
    showScreen('profile');
  });

  document.querySelector('.assessment-back').addEventListener('click', function () {
    showScreen('intro');
  });

  screens.profile.addEventListener('change', function () {
    document.querySelector('.assessment-profile-next').disabled = !readProfile();
  });

  document.querySelector('.assessment-profile-next').addEventListener('click', function () {
    var built = buildQuestions(state.profile);
    state.questions = built.questions;
    state.highRisk = built.highRisk;
    state.current = 0;
    state.answers = {};
    renderQuestion();
    showScreen('question');
  });

  document.querySelector('.assessment-options').addEventListener('change', function (event) {
    if (!event.target.matches('input[type="radio"]')) return;
    var item = state.questions[state.current];
    state.answers[item.id] = Number(event.target.value);
    document.querySelectorAll('.assessment-option').forEach(function (label) {
      label.classList.toggle('is-selected', label.contains(event.target));
    });
    screens.question.querySelector('.assessment-error').hidden = true;
  });

  document.querySelector('.assessment-next').addEventListener('click', function () {
    var item = state.questions[state.current];
    if (typeof state.answers[item.id] === 'undefined') {
      screens.question.querySelector('.assessment-error').hidden = false;
      return;
    }
    if (state.current === state.questions.length - 1) {
      renderResult();
      return;
    }
    state.current += 1;
    renderQuestion();
  });

  document.querySelector('.assessment-prev').addEventListener('click', function () {
    if (state.current === 0) {
      showScreen('profile');
      return;
    }
    state.current -= 1;
    renderQuestion();
  });

  document.querySelector('.assessment-restart').addEventListener('click', function () {
    state.current = 0;
    state.answers = {};
    state.result = null;
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
    /* invio del lead via FormSubmit (nessun backend proprio): la mail arriva
       a m.campagnoni@hubique.it con copia a info@hubique.it. Fire-and-forget:
       se la rete fallisce il report si sblocca comunque. */
    try {
      fetch('https://formsubmit.co/ajax/m.campagnoni@hubique.it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Lead test — AI Act Compliance Check (' + state.result.overall + '/100 · ' + state.result.band.name + ')',
          _cc: 'info@hubique.it',
          _template: 'table',
          test: 'AI Act Compliance Check',
          email: email,
          punteggio: state.result.overall + '/100',
          fascia: state.result.band.name,
          ruolo: state.profile.role,
          dimensione: state.profile.size,
          ambiti: state.profile.areas.join(', '),
          ai_verso_pubblico: state.profile.publicAI ? 'sì' : 'no',
          pagina: 'https://hubique.it/ai-act-check.html'
        })
      }).catch(function () {});
    } catch (e) {}
    try {
      localStorage.setItem('hubique_aiact_lead', JSON.stringify({
        email: email,
        consent: true,
        role: state.profile.role,
        size: state.profile.size,
        areas: state.profile.areas,
        publicAI: state.profile.publicAI,
        score: state.result.overall,
        band: state.result.band.name,
        createdAt: new Date().toISOString()
      }));
    } catch (e) {}
    form.querySelector('.email-status').textContent = 'Report sbloccato.';
    screens.result.querySelector('.report-gate').hidden = true;
    screens.result.querySelector('.full-report').hidden = false;
    setTimeout(function () {
      screens.result.querySelector('.full-report').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  });
})();
