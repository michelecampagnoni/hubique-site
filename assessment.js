(function () {
  'use strict';

  var questions = [
    {
      id: 'q1', scope: 'company', dimension: 'strategy', section: 'Azienda · Strategia',
      title: 'Come decidete dove applicare l’AI?',
      help: 'Pensa a chi sceglie le priorità, assegna risorse e verifica i risultati.',
      options: [
        'Non è ancora un tema aziendale',
        'Le persone sperimentano liberamente, senza priorità comuni',
        'Alcuni manager hanno individuato casi d’uso, ma senza una roadmap',
        'Esistono priorità, responsabile, budget e risultati attesi'
      ]
    },
    {
      id: 'q2', scope: 'company', dimension: 'strategy', section: 'Azienda · Strategia',
      title: 'Quanto è coinvolta la direzione?',
      help: 'Non basta approvare una licenza: conta la capacità di guidare scelte e cambiamento.',
      options: [
        'Non ne parla o considera l’AI irrilevante',
        'La cita, ma non prende iniziative concrete',
        'Sponsorizza alcuni progetti e chiede aggiornamenti',
        'Comunica una visione, rimuove ostacoli e rivede periodicamente i risultati'
      ]
    },
    {
      id: 'q3', scope: 'company', dimension: 'value', section: 'Azienda · Processi',
      title: 'Come viene usata oggi l’AI nel lavoro quotidiano?',
      help: 'Considera anche gli strumenti usati autonomamente dai dipendenti.',
      options: [
        'Non viene usata',
        'Con account personali e senza indicazioni aziendali',
        'Con strumenti approvati, ma solo in alcuni reparti o attività',
        'Dentro processi definiti, collegati agli strumenti aziendali'
      ]
    },
    {
      id: 'q4', scope: 'company', dimension: 'value', section: 'Azienda · Processi',
      title: 'Quali risultati avete già ottenuto?',
      help: 'Il livello cresce quando il valore è misurato, non quando aumenta il numero di demo.',
      options: [
        'Nessun progetto o risultato osservabile',
        'Esperimenti e prove individuali',
        'Uno o più piloti con KPI e responsabili',
        'Soluzioni in produzione con benefici misurati e ripetibili'
      ]
    },
    {
      id: 'q5', scope: 'company', dimension: 'data', section: 'Azienda · Dati',
      title: 'Quanto sono organizzati dati, documenti e conoscenza?',
      help: 'Cataloghi, listini, CRM, procedure e storico delle decisioni.',
      options: [
        'Sono dispersi tra persone, email e cartelle locali',
        'Esistono cartelle condivise, ma qualità e versioni sono incoerenti',
        'Le fonti principali sono centralizzate e hanno responsabili',
        'Dati e documenti sono governati, aggiornati e accessibili via integrazioni'
      ]
    },
    {
      id: 'q6', scope: 'company', dimension: 'data', section: 'Azienda · Dati',
      title: 'Quanto l’AI è collegata ai sistemi aziendali?',
      help: 'Email, CRM, gestionale, ticketing, documenti e strumenti operativi.',
      options: [
        'Non è collegata: tutto avviene con copia e incolla',
        'Usiamo esportazioni o caricamenti manuali',
        'Esistono alcune integrazioni controllate, soprattutto in lettura',
        'Legge e aggiorna i sistemi con permessi, log e possibilità di blocco'
      ]
    },
    {
      id: 'q7', scope: 'company', dimension: 'governance', section: 'Azienda · Regole',
      title: 'Quali regole avete definito per usare l’AI?',
      help: 'Dati ammessi, strumenti approvati, responsabilità e casi vietati.',
      options: [
        'Nessuna regola',
        'Indicazioni informali, diverse da reparto a reparto',
        'Una policy scritta e comunicata alle persone',
        'Policy, registro dei casi d’uso, ruoli e revisione periodica'
      ]
    },
    {
      id: 'q8', scope: 'company', dimension: 'governance', section: 'Azienda · Regole',
      title: 'Come controllate decisioni e comunicazioni prodotte dall’AI?',
      help: 'Pensa soprattutto a clienti, dipendenti, prezzi, offerte e dati riservati.',
      options: [
        'Non esistono controlli definiti',
        'Le persone controllano quando lo ritengono necessario',
        'Le azioni sensibili richiedono un’approvazione umana',
        'I controlli dipendono dal rischio e sono documentati, tracciati e verificati'
      ]
    },
    {
      id: 'q9', scope: 'person', dimension: 'skills', section: 'Persona · Competenze',
      title: 'Quanto spesso usi personalmente strumenti AI?',
      help: 'Conta l’uso nel lavoro, non la semplice curiosità.',
      options: [
        'Mai o quasi mai',
        'Qualche volta al mese',
        'Ogni settimana, su attività specifiche',
        'Ogni giorno, in più fasi del mio lavoro'
      ]
    },
    {
      id: 'q10', scope: 'person', dimension: 'skills', section: 'Persona · Competenze',
      title: 'Quanto sai verificare e trasformare un output AI in lavoro affidabile?',
      help: 'Valuta la tua capacità di controllare fonti, errori, dati e qualità.',
      options: [
        'Fatico a capire quando il risultato è sbagliato',
        'Rivedo il testo, ma senza un metodo preciso',
        'Controllo fonti e dati e so scegliere lo strumento adatto',
        'Progetto workflow, misuro risultati e aiuto altre persone a usarli'
      ]
    },
    {
      id: 'q11', scope: 'person', dimension: 'change', section: 'Persona · Adozione',
      title: 'Come reagisci quando l’AI cambia un processo che conosci bene?',
      help: 'Non cerchiamo entusiasmo: cerchiamo disponibilità a testare e correggere.',
      options: [
        'Preferisco evitare il cambiamento',
        'Sono curioso, ma torno rapidamente al metodo precedente',
        'Provo il nuovo processo e condivido ciò che funziona',
        'Coinvolgo gli altri, raccolgo feedback e aiuto a migliorarlo'
      ]
    },
    {
      id: 'q12', scope: 'person', dimension: 'change', section: 'Persona · Adozione',
      title: 'Quanto investi nell’apprendimento e nella sperimentazione?',
      help: 'Conta il tempo dedicato a prove su attività vere, non il numero di corsi acquistati.',
      options: [
        'Non dedico tempo specifico',
        'Seguo contenuti o corsi occasionalmente',
        'Faccio esperimenti regolari e annoto cosa funziona',
        'Ho una routine, misuro il tempo risparmiato e aggiorno il mio metodo'
      ]
    }
  ];

  var dimensions = {
    strategy: {
      label: 'Strategia & leadership',
      scope: 'Azienda',
      color: '#FFB200',
      descriptions: [
        'L’AI non ha ancora una direzione condivisa.',
        'Esiste interesse, ma le iniziative dipendono dai singoli.',
        'Le priorità stanno diventando concrete e coordinate.',
        'Direzione, responsabilità e risultati attesi sono chiari.'
      ],
      actions: [
        'Nomina un responsabile e scegli un solo processo prioritario.',
        'Trasforma le idee disperse in una roadmap di 90 giorni.',
        'Collega ogni progetto a un KPI operativo o commerciale.'
      ]
    },
    value: {
      label: 'Processi & valore',
      scope: 'Azienda',
      color: '#FF5C38',
      descriptions: [
        'Non ci sono ancora casi d’uso osservabili.',
        'L’uso è spontaneo e non produce valore misurabile.',
        'Esistono piloti o applicazioni circoscritte.',
        'L’AI è parte di processi reali con benefici misurati.'
      ],
      actions: [
        'Scegli un’attività ripetitiva e misura il tempo attuale.',
        'Costruisci un pilota con proprietario, baseline e soglia di successo.',
        'Estendi soltanto i casi che restituiscono ore o aumentano conversioni.'
      ]
    },
    data: {
      label: 'Dati & integrazioni',
      scope: 'Azienda',
      color: '#00B2FF',
      descriptions: [
        'Dati e conoscenza sono troppo frammentati per applicazioni affidabili.',
        'Le fonti esistono, ma accesso e qualità richiedono lavoro manuale.',
        'Le basi informative principali sono accessibili e abbastanza ordinate.',
        'Dati, permessi e integrazioni supportano processi AI scalabili.'
      ],
      actions: [
        'Mappa le cinque fonti informative più usate dalle persone chiave.',
        'Assegna proprietari, frequenza di aggiornamento e regole di accesso.',
        'Integra prima in lettura; abilita le scritture solo con log e permessi.'
      ]
    },
    governance: {
      label: 'Governance & rischio',
      scope: 'Azienda',
      color: '#AB54F7',
      descriptions: [
        'L’uso dell’AI non è governato e può creare rischi invisibili.',
        'Esistono cautele informali, ma non sono uniformi né dimostrabili.',
        'Regole e supervisione sono definite per gli usi principali.',
        'Il controllo è proporzionato al rischio, tracciato e aggiornato.'
      ],
      actions: [
        'Crea un registro degli strumenti e dei casi d’uso già presenti.',
        'Scrivi una policy breve: dati, strumenti, approvazioni e divieti.',
        'Applica controlli più forti a clienti, persone e decisioni sensibili.'
      ]
    },
    skills: {
      label: 'Competenze & pratica',
      scope: 'Persona',
      color: '#00AA3C',
      descriptions: [
        'L’uso personale è ancora assente o difficile da verificare.',
        'La pratica è occasionale e dipende da tentativi.',
        'Sai usare e controllare l’AI su attività definite.',
        'Sai progettare workflow, misurare risultati e trasferire competenze.'
      ],
      actions: [
        'Scegli un’attività settimanale e costruisci una checklist di verifica.',
        'Confronta output, fonti e tempo impiegato con e senza AI.',
        'Documenta un workflow riuscito e insegnalo a un collega.'
      ]
    },
    change: {
      label: 'Adozione & cambiamento',
      scope: 'Persona',
      color: '#35C759',
      descriptions: [
        'Il cambiamento viene evitato o subito.',
        'C’è curiosità, ma non ancora un’abitudine sostenibile.',
        'Sperimentazione e condivisione stanno diventando regolari.',
        'Sai coinvolgere altri, raccogliere feedback e migliorare il processo.'
      ],
      actions: [
        'Riserva 30 minuti a settimana a un esperimento su lavoro reale.',
        'Condividi un successo e un fallimento, spiegando cosa hai imparato.',
        'Coinvolgi chi userà il processo prima di automatizzarlo.'
      ]
    }
  };

  var state = {
    current: 0,
    answers: {},
    profile: { role: '', size: '' },
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
      var active = key === name;
      screens[key].hidden = !active;
      screens[key].classList.toggle('is-active', active);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    var q = questions[state.current];
    var progress = ((state.current + 1) / questions.length) * 100;
    screens.question.querySelector('.assessment-progress span').style.width = progress + '%';
    screens.question.querySelector('.assessment-phase').textContent = q.section;
    screens.question.querySelector('.assessment-count').textContent = (state.current + 1) + ' / ' + questions.length;
    screens.question.querySelector('.assessment-dimension').textContent = dimensions[q.dimension].label;
    screens.question.querySelector('.assessment-question-title').textContent = q.title;
    screens.question.querySelector('.assessment-question-help').textContent = q.help;

    var fieldset = screens.question.querySelector('.assessment-options');
    fieldset.innerHTML = '<legend class="sr-only">' + q.title + '</legend>';
    q.options.forEach(function (option, index) {
      var label = document.createElement('label');
      label.className = 'assessment-option';
      if (state.answers[q.id] === index) label.classList.add('is-selected');
      label.innerHTML =
        '<input type="radio" name="' + q.id + '" value="' + index + '"' +
          (state.answers[q.id] === index ? ' checked' : '') + '>' +
        '<span class="option-index">0' + (index + 1) + '</span>' +
        '<span>' + option + '</span>';
      fieldset.appendChild(label);
    });
    screens.question.querySelector('.assessment-next').textContent =
      state.current === questions.length - 1 ? 'Calcola il risultato' : 'Avanti';
    screens.question.querySelector('.assessment-error').hidden = true;
  }

  function dimensionScores() {
    var result = {};
    Object.keys(dimensions).forEach(function (key) {
      var items = questions.filter(function (q) { return q.dimension === key; });
      var raw = items.reduce(function (sum, q) { return sum + Number(state.answers[q.id] || 0); }, 0);
      result[key] = Math.round((raw / (items.length * 3)) * 100);
    });
    return result;
  }

  function weightedCompany(scores) {
    return Math.round(
      scores.strategy * .25 +
      scores.value * .25 +
      scores.data * .20 +
      scores.governance * .30
    );
  }

  function weightedPerson(scores) {
    return Math.round(scores.skills * .55 + scores.change * .45);
  }

  function overallScore(company, person) {
    if (company === 0 || person === 0) return 0;
    return Math.round(100 * Math.pow(company / 100, .70) * Math.pow(person / 100, .30));
  }

  function band(score) {
    if (score < 25) return { level: 1, name: 'Esplorazione', headline: 'Prima di accelerare, crea le condizioni.' };
    if (score < 45) return { level: 2, name: 'Uso spontaneo', headline: 'L’AI è entrata in azienda, ma non è ancora un sistema.' };
    if (score < 65) return { level: 3, name: 'Piloti governati', headline: 'Hai superato la curiosità: ora serve metodo.' };
    if (score < 80) return { level: 4, name: 'Adozione operativa', headline: 'L’AI produce valore: il prossimo passo è scalarlo.' };
    return { level: 5, name: 'Scalabilità', headline: 'La base è solida: concentra l’AI sui processi distintivi.' };
  }

  function scoreIndex(score) {
    if (score < 25) return 0;
    if (score < 50) return 1;
    if (score < 75) return 2;
    return 3;
  }

  function buildFlags(scores, company, person) {
    var flags = [];
    if (state.answers.q3 === 1) {
      flags.push('<b>Shadow AI.</b> Account personali e strumenti non approvati rendono invisibili dati, costi e responsabilità.');
    }
    if (state.answers.q7 < 2 && state.answers.q3 >= 2) {
      flags.push('<b>Uso più veloce delle regole.</b> Gli strumenti si stanno diffondendo prima di policy e responsabilità.');
    }
    if (state.answers.q8 < 2 && state.answers.q4 >= 2) {
      flags.push('<b>Supervisione insufficiente.</b> Piloti o sistemi operativi richiedono gate umani sulle azioni sensibili.');
    }
    if (scores.data < 45) {
      flags.push('<b>Base informativa fragile.</b> Prima di un agente autonomo serve ordinare fonti, accessi e aggiornamenti.');
    }
    if (Math.abs(company - person) >= 25) {
      flags.push('<b>Disallineamento.</b> Maturità personale e aziendale sono distanti: il cambiamento rischia di dipendere da poche persone.');
    }
    if (!flags.length) {
      flags.push('<b>Nessun blocco evidente.</b> Mantieni comunque registro dei casi d’uso, supervisione e revisione periodica.');
    }
    return flags;
  }

  function calculate() {
    var scores = dimensionScores();
    var company = weightedCompany(scores);
    var person = weightedPerson(scores);
    var overall = overallScore(company, person);
    var entries = Object.keys(scores).map(function (key) { return [key, scores[key]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    var strongest = entries[0][0];
    var priority = entries[entries.length - 1][0];
    return {
      scores: scores,
      company: company,
      person: person,
      overall: overall,
      band: band(overall),
      strongest: strongest,
      priority: priority,
      flags: buildFlags(scores, company, person)
    };
  }

  function summaryText(result) {
    var gap = result.company - result.person;
    var alignment;
    if (Math.abs(gap) < 12) alignment = 'Azienda e persona stanno avanzando con un livello abbastanza allineato.';
    else if (gap > 0) alignment = 'L’organizzazione è più avanti della pratica personale: concentra la formazione su attività reali.';
    else alignment = 'La competenza personale corre più dell’organizzazione: trasformala in processi, regole e risultati condivisi.';
    return alignment + ' La priorità è ' + dimensions[result.priority].label.toLowerCase() + '.';
  }

  function renderResult() {
    state.result = calculate();
    var r = state.result;
    screens.result.querySelector('.score-value').textContent = r.overall;
    screens.result.querySelector('.score-orbit').style.setProperty('--score', r.overall);
    screens.result.querySelector('.result-level').textContent = 'Livello ' + r.band.level + ' / 5 · ' + r.band.name;
    screens.result.querySelector('.result-headline').textContent = r.band.headline;
    screens.result.querySelector('.result-copy').textContent = summaryText(r);
    screens.result.querySelector('.company-score').textContent = r.company;
    screens.result.querySelector('.person-score').textContent = r.person;

    var strength = dimensions[r.strongest];
    var priority = dimensions[r.priority];
    screens.result.querySelector('.result-strength-title').textContent = strength.label;
    screens.result.querySelector('.result-strength-copy').textContent = strength.descriptions[scoreIndex(r.scores[r.strongest])];
    screens.result.querySelector('.result-priority-title').textContent = priority.label;
    screens.result.querySelector('.result-priority-copy').textContent = priority.actions[0];

    var dimensionReport = screens.result.querySelector('.dimension-report');
    dimensionReport.innerHTML = '';
    Object.keys(dimensions).forEach(function (key) {
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
    Object.keys(r.scores)
      .filter(function (key) { return key !== r.priority; })
      .sort(function (a, b) { return r.scores[a] - r.scores[b]; })
      .slice(0, 2)
      .forEach(function (key) { actionKeys.push(key); });
    screens.result.querySelector('.report-actions-list').innerHTML = actionKeys.map(function (key, i) {
      return '<li><span>0' + (i + 1) + '</span><div><b>' + dimensions[key].label + '</b><p>' + dimensions[key].actions[i] + '</p></div></li>';
    }).join('');
    screens.result.querySelector('.report-flags').innerHTML = r.flags.map(function (flag) {
      return '<p>' + flag + '</p>';
    }).join('');

    var subject = 'Assessment AI — ' + r.overall + '/100';
    var body = 'Risultato assessment:%0A- Totale: ' + r.overall + '/100%0A- Azienda: ' + r.company +
      '/100%0A- Persona: ' + r.person + '/100%0A- Priorità: ' + encodeURIComponent(priority.label);
    screens.result.querySelector('.assessment-mailto').href =
      'mailto:info@hubique.it?subject=' + encodeURIComponent(subject) + '&body=' + body;
    showScreen('result');
  }

  document.querySelector('.assessment-start').addEventListener('click', function () {
    showScreen('profile');
  });

  document.querySelector('.assessment-back').addEventListener('click', function () {
    showScreen('intro');
  });

  document.querySelectorAll('.assessment-profile input').forEach(function (input) {
    input.addEventListener('change', function () {
      var role = document.querySelector('input[name="role"]:checked');
      var size = document.querySelector('input[name="size"]:checked');
      state.profile.role = role ? role.value : '';
      state.profile.size = size ? size.value : '';
      document.querySelector('.assessment-profile-next').disabled = !(role && size);
    });
  });

  document.querySelector('.assessment-profile-next').addEventListener('click', function () {
    state.current = 0;
    renderQuestion();
    showScreen('question');
  });

  document.querySelector('.assessment-options').addEventListener('change', function (event) {
    if (!event.target.matches('input[type="radio"]')) return;
    var q = questions[state.current];
    state.answers[q.id] = Number(event.target.value);
    document.querySelectorAll('.assessment-option').forEach(function (label) {
      label.classList.toggle('is-selected', label.contains(event.target));
    });
    screens.question.querySelector('.assessment-error').hidden = true;
  });

  document.querySelector('.assessment-next').addEventListener('click', function () {
    var q = questions[state.current];
    if (typeof state.answers[q.id] === 'undefined') {
      screens.question.querySelector('.assessment-error').hidden = false;
      return;
    }
    if (state.current === questions.length - 1) {
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
    try {
      localStorage.setItem('hubique_assessment_lead', JSON.stringify({
        email: email,
        consent: true,
        role: state.profile.role,
        size: state.profile.size,
        score: state.result.overall,
        company: state.result.company,
        person: state.result.person,
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
