/* Hubique — interactive editorial journey.
   Progressive enhancement only: without JavaScript every page remains
   complete, navigable and readable. */
(function () {
  'use strict';

  var reduced = false;
  var finePointer = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch (e) {}

  var body = document.body;
  var doc = document.documentElement;
  var page = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '');

  /* -----------------------------------------------------------------------
     Shared page language
     ----------------------------------------------------------------------- */
  var pageStories = {
    index: {
      kicker: 'Il percorso AI di una PMI',
      stages: ['Ascolta', 'Forma', 'Integra', 'Misura']
    },
    'ai-adoption': {
      kicker: 'Dalla curiosità alla competenza',
      stages: ['Assessment', 'Policy', 'Formazione', 'Adozione']
    },
    'ai-agents': {
      kicker: 'Un agente, dentro il processo',
      stages: ['Contesto', 'Conoscenza', 'Azione', 'Approva']
    },
    settori: {
      kicker: 'Un metodo, molti mondi',
      stages: ['Osserva', 'Adatta', 'Integra', 'Migliora']
    },
    'chi-siamo': {
      kicker: 'Esperienza che diventa metodo',
      stages: ['Campo', 'Ricerca', 'Persone', 'Risultati']
    }
  };
  var story = pageStories[page] || pageStories.index;

  /* Page-specific hero scenes. The original inline drawings remain the
     no-JS fallback; with enhancement enabled they become human AI stories. */
  var heroScenes = {
    'ai-adoption':
      '<svg viewBox="0 0 460 360" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="356" cy="78" r="48" fill="#FFB200"/>' +
        '<path d="M0 312 Q130 245 250 302 T460 278 V360 H0Z" fill="#00AA3C" opacity=".22"/>' +
        '<path d="M0 338 Q150 282 300 327 T460 309 V360 H0Z" fill="#00AA3C" opacity=".42"/>' +
        '<path class="draw" d="M58 286 C134 236 192 241 247 194 S340 117 410 125" fill="none" stroke="#111417" stroke-width="3" stroke-dasharray="8 10" opacity=".45"/>' +
        '<g class="float-slow">' +
          '<circle cx="166" cy="112" r="25" fill="#F4E9E1" stroke="#111417" stroke-width="3"/>' +
          '<path d="M121 154 Q165 122 209 154 L221 270 H109Z" fill="#0072E3" stroke="#111417" stroke-width="3"/>' +
          '<path d="M126 170 78 212M204 170l58-49" fill="none" stroke="#111417" stroke-width="12" stroke-linecap="round"/>' +
          '<path d="M133 270l-9 65M194 270l17 65" fill="none" stroke="#111417" stroke-width="15" stroke-linecap="round"/>' +
        '</g>' +
        '<g class="float-slower">' +
          '<rect x="255" y="92" width="126" height="88" rx="16" fill="#FFFFFF" stroke="#111417" stroke-width="3"/>' +
          '<circle cx="287" cy="126" r="14" fill="#AB54F7"/>' +
          '<path d="M315 119h40M315 133h28M275 158h80" stroke="#111417" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="m365 77 5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" fill="#FF5C38"/>' +
        '</g>' +
        '<g class="drift-2" fill="#00AA3C"><path d="M68 92c25 3 39 18 40 40-25-3-39-18-40-40Z"/><path d="M378 240c-24 1-39 14-43 35 24-1 39-14 43-35Z"/></g>' +
      '</svg>',
    'ai-agents':
      '<svg viewBox="0 0 460 360" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="draw" d="M52 286 C126 266 130 178 228 177 S326 95 405 78" fill="none" stroke="#111417" stroke-width="3" stroke-dasharray="8 10" opacity=".45"/>' +
        '<g class="float-slow"><circle cx="116" cy="116" r="24" fill="#F4E9E1" stroke="#111417" stroke-width="3"/><path d="M77 154q39-29 78 0l12 121H65Z" fill="#FFB200" stroke="#111417" stroke-width="3"/><path d="m82 171-38 51m105-51 45 21" fill="none" stroke="#111417" stroke-width="11" stroke-linecap="round"/></g>' +
        '<g class="float-slower"><circle cx="238" cy="177" r="48" fill="#AB54F7" stroke="#111417" stroke-width="3"/><circle cx="238" cy="177" r="15" fill="#FFFFFF"/><path d="M238 115v-18M300 177h18M238 239v18M176 177h-18M194 133l-13-13M282 221l13 13M282 133l13-13" stroke="#111417" stroke-width="4" stroke-linecap="round"/></g>' +
        '<g class="drift-2"><rect x="326" y="45" width="79" height="56" rx="10" fill="#00B2FF" stroke="#111417" stroke-width="3"/><path d="m330 52 35 25 36-25" fill="none" stroke="#111417" stroke-width="3"/><rect x="335" y="212" width="73" height="91" rx="10" fill="#FFFFFF" stroke="#111417" stroke-width="3"/><path d="M350 236h43M350 253h43M350 270h26" stroke="#111417" stroke-width="4" stroke-linecap="round"/></g>' +
        '<g class="float-slow"><circle cx="393" cy="146" r="29" fill="#00AA3C" stroke="#111417" stroke-width="3"/><path d="m380 146 10 10 18-23" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></g>' +
      '</svg>',
    'chi-siamo':
      '<svg viewBox="0 0 460 360" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 316Q230 275 460 316V360H0Z" fill="#00AA3C" opacity=".23"/>' +
        '<path class="draw" d="M230 315V164M230 230l-42-49M230 218l48-56" fill="none" stroke="#111417" stroke-width="6" stroke-linecap="round"/>' +
        '<g class="float-slower" fill="#00AA3C"><circle cx="230" cy="122" r="53"/><circle cx="179" cy="146" r="34" fill="#35C759"/><circle cx="284" cy="142" r="37" fill="#35C759"/><circle cx="205" cy="85" r="31" fill="#35C759"/><circle cx="267" cy="84" r="29"/></g>' +
        '<g class="float-slow"><circle cx="105" cy="161" r="21" fill="#F4E9E1" stroke="#111417" stroke-width="3"/><path d="M72 194q33-24 66 0l8 100H64Z" fill="#0072E3" stroke="#111417" stroke-width="3"/><path d="m77 208-36 39m92-39 52 12" fill="none" stroke="#111417" stroke-width="10" stroke-linecap="round"/></g>' +
        '<g class="float-slow"><circle cx="353" cy="164" r="21" fill="#F4E9E1" stroke="#111417" stroke-width="3"/><path d="M320 197q33-24 66 0l9 98h-84Z" fill="#FFB200" stroke="#111417" stroke-width="3"/><path d="m326 211-50 13m105-13 37 37" fill="none" stroke="#111417" stroke-width="10" stroke-linecap="round"/></g>' +
        '<path class="draw" d="M230 314c-22 22-48 28-78 29m78-29c22 22 48 28 78 29m-78-29v32" fill="none" stroke="#111417" stroke-width="3" stroke-linecap="round" opacity=".5"/>' +
        '<g fill="#FF5C38"><circle cx="195" cy="131" r="7"/><circle cx="265" cy="108" r="7"/></g><circle cx="235" cy="78" r="7" fill="#AB54F7"/>' +
      '</svg>'
  };
  var pageIllustration = document.querySelector('.hero-ill');
  if (pageIllustration && heroScenes[page]) {
    pageIllustration.innerHTML = heroScenes[page];
  }

  /* -----------------------------------------------------------------------
     Progress bar + compact journey HUD
     ----------------------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.id = 'fxbar';
  body.appendChild(bar);

  var hud = document.createElement('div');
  hud.id = 'journey-hud';
  hud.setAttribute('role', 'progressbar');
  hud.setAttribute('aria-label', 'Avanzamento nella pagina');
  hud.setAttribute('aria-valuemin', '0');
  hud.setAttribute('aria-valuemax', '100');
  hud.innerHTML =
    '<span class="hud-ring" aria-hidden="true"></span>' +
    '<span class="hud-copy"><b>Inizio del percorso</b><span>Livello 1</span></span>';
  body.appendChild(hud);

  var hudRing = hud.querySelector('.hud-ring');
  var hudTitle = hud.querySelector('b');
  var hudLevel = hud.querySelector('.hud-copy span');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section'));
  var sectionTitles = sections.map(function (section, i) {
    var heading = section.querySelector('h2');
    section.setAttribute('data-mission', 'Missione ' + String(i + 1).padStart(2, '0'));
    return heading ? heading.textContent.trim() : 'Tappa ' + (i + 1);
  });

  var progressTick = false;
  function updateProgress() {
    progressTick = false;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.max(0, Math.min(1, (window.scrollY || doc.scrollTop) / max)) : 0;
    var pct = Math.round(p * 100);
    bar.style.width = p * 100 + '%';
    hudRing.style.setProperty('--p', pct);
    hud.setAttribute('aria-valuenow', String(pct));

    var active = 0;
    sections.forEach(function (section, i) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * .52) active = i;
    });
    if (sectionTitles.length) {
      hudTitle.textContent = sectionTitles[active];
      hudLevel.textContent = 'Missione ' + (active + 1) + ' / ' + sectionTitles.length;
    }
  }
  window.addEventListener('scroll', function () {
    if (!progressTick) {
      progressTick = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* -----------------------------------------------------------------------
     Original illustrated bridge — people, AI orb, route and checkpoints
     ----------------------------------------------------------------------- */
  var main = document.querySelector('main');
  var hero = main && main.firstElementChild;
  if (main && hero) {
    var strip = document.createElement('div');
    strip.className = 'story-strip';
    strip.setAttribute('aria-hidden', 'true');
    strip.innerHTML =
      '<div class="story-strip-inner">' +
        '<span class="story-kicker">' + story.kicker + '</span>' +
        '<svg viewBox="0 0 1200 240" preserveAspectRatio="none">' +
          '<path d="M44 169 C190 78 274 178 398 128 S606 42 742 118 S960 199 1160 78" class="story-route"/>' +
          '<g fill="none" stroke="#111417" stroke-width="2">' +
            '<circle cx="112" cy="146" r="14" fill="#FFFFFF"/>' +
            '<circle cx="398" cy="128" r="14" fill="#FFFFFF"/>' +
            '<circle cx="742" cy="118" r="14" fill="#FFFFFF"/>' +
            '<circle cx="1082" cy="101" r="14" fill="#FFFFFF"/>' +
          '</g>' +
          '<g class="story-person">' +
            '<circle cx="246" cy="85" r="19" fill="#F4E9E1" stroke="#111417" stroke-width="2"/>' +
            '<path d="M215 112 Q246 91 277 112 L291 179 L203 179 Z" fill="#0072E3" stroke="#111417" stroke-width="2"/>' +
            '<path d="M221 122 L184 148 M272 122 L310 95" fill="none" stroke="#111417" stroke-width="8" stroke-linecap="round"/>' +
            '<path d="M225 179 L218 214 M268 179 L278 214" fill="none" stroke="#111417" stroke-width="10" stroke-linecap="round"/>' +
          '</g>' +
          '<g class="story-person" style="animation-delay:.28s">' +
            '<circle cx="881" cy="89" r="18" fill="#F4E9E1" stroke="#111417" stroke-width="2"/>' +
            '<path d="M850 114 Q881 96 912 114 L922 178 L842 178 Z" fill="#AB54F7" stroke="#111417" stroke-width="2"/>' +
            '<path d="M852 124 L820 102 M908 124 L944 147" fill="none" stroke="#111417" stroke-width="8" stroke-linecap="round"/>' +
            '<path d="M858 178 L850 214 M904 178 L913 214" fill="none" stroke="#111417" stroke-width="10" stroke-linecap="round"/>' +
          '</g>' +
          '<g class="story-orb">' +
            '<circle cx="607" cy="82" r="35" fill="#00AA3C" stroke="#111417" stroke-width="2"/>' +
            '<circle cx="607" cy="82" r="12" fill="#FFFFFF"/>' +
            '<path d="M607 37 V23 M652 82 H666 M607 127 V141 M562 82 H548" stroke="#111417" stroke-width="3" stroke-linecap="round"/>' +
          '</g>' +
          '<g class="story-leaf" fill="#00AA3C">' +
            '<path d="M1018 51 C1044 39 1061 21 1064 0 C1038 5 1022 23 1018 51Z"/>' +
            '<path d="M347 61 C327 54 314 38 313 20 C335 23 347 39 347 61Z"/>' +
          '</g>' +
          '<g fill="#FFFFFF" opacity=".55">' +
            '<circle cx="64" cy="40" r="9"/><circle cx="1126" cy="174" r="14"/>' +
            '<path d="M486 43 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6Z"/>' +
          '</g>' +
        '</svg>' +
        '<div class="story-stage-labels">' +
          story.stages.map(function (stage) { return '<span>' + stage + '</span>'; }).join('') +
        '</div>' +
      '</div>';
    hero.insertAdjacentElement('afterend', strip);
  }

  /* -----------------------------------------------------------------------
     Semantic, reusable mini illustrations for service and principle cards
     ----------------------------------------------------------------------- */
  var glyphs = [
    '<svg viewBox="0 0 48 48"><rect x="6" y="11" width="36" height="27" rx="5" fill="#fff" stroke="#111417" stroke-width="2.5"/><path d="m8 14 16 12 16-12" fill="none" stroke="#111417" stroke-width="2.5"/><path d="m33 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#FFB200" stroke="#111417" stroke-width="1.5"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="7" fill="#fff" stroke="#111417" stroke-width="2.5"/><circle cx="9" cy="13" r="4" fill="#fff" stroke="#111417" stroke-width="2"/><circle cx="39" cy="10" r="4" fill="#fff" stroke="#111417" stroke-width="2"/><circle cx="40" cy="37" r="4" fill="#fff" stroke="#111417" stroke-width="2"/><path d="M13 15 18 20M35 13 30 19M35 34 30 29" stroke="#111417" stroke-width="2.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><rect x="8" y="7" width="27" height="34" rx="4" fill="#fff" stroke="#111417" stroke-width="2.5"/><path d="M15 17h13M15 24h13M15 31h8" stroke="#111417" stroke-width="2.5" stroke-linecap="round"/><circle cx="37" cy="34" r="8" fill="#FF5C38" stroke="#111417" stroke-width="2"/><path d="m34 34 2 2 4-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M8 35V17l16-9 16 9v18l-16 8Z" fill="#fff" stroke="#111417" stroke-width="2.5"/><path d="m9 17 15 9 15-9M24 26v16" fill="none" stroke="#111417" stroke-width="2.5"/><circle cx="24" cy="17" r="4" fill="#00B2FF" stroke="#111417" stroke-width="1.5"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M10 39V19M24 39V9M38 39V25" stroke="#111417" stroke-width="5" stroke-linecap="round"/><circle cx="10" cy="15" r="5" fill="#fff" stroke="#111417" stroke-width="2"/><circle cx="24" cy="6" r="5" fill="#fff" stroke="#111417" stroke-width="2"/><circle cx="38" cy="21" r="5" fill="#fff" stroke="#111417" stroke-width="2"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#fff" stroke="#111417" stroke-width="2.5"/><path d="m17 25 5 5 10-12" fill="none" stroke="#111417" stroke-width="3" stroke-linecap="round"/><path d="M24 3v5M45 24h-5M24 45v-5M3 24h5" stroke="#111417" stroke-width="2.5" stroke-linecap="round"/></svg>'
  ];

  var illustratedCards = document.querySelectorAll('.svc, .step, .why');
  Array.prototype.forEach.call(illustratedCards, function (card, i) {
    if (!card.querySelector('.card-glyph')) {
      var glyph = document.createElement('span');
      glyph.className = 'card-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.innerHTML = glyphs[i % glyphs.length];
      card.insertBefore(glyph, card.firstChild);
    }
    var stamp = document.createElement('span');
    stamp.className = 'mission-stamp';
    stamp.setAttribute('aria-hidden', 'true');
    stamp.textContent = '✓';
    card.appendChild(stamp);
  });

  /* Home demo gains system-state feedback instead of decorative animation only. */
  var demo = document.querySelector('.demo');
  if (demo) {
    var liveRow = document.createElement('div');
    liveRow.className = 'demo-live-row';
    liveRow.setAttribute('aria-hidden', 'true');
    liveRow.innerHTML =
      '<span><i></i>Contesto letto</span>' +
      '<span><i></i>Fonti trovate</span>' +
      '<span><i></i>Umano in controllo</span>';
    demo.appendChild(liveRow);
  }

  /* -----------------------------------------------------------------------
     Reveal, drawn paths and mission completion
     ----------------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll(
      '.sec-head, .pain, .svc, .step, .case, .why, details, .callout, .demo, .hero-ill, .story-strip'
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.matches('.svc, .step, .why, .pain')) {
            entry.target.classList.add('mission-complete');
          }
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: .08 });

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 5, 4) * 55 + 'ms';
      io.observe(el);
    });

    var drawPaths = document.querySelectorAll('svg path.draw, svg line.draw, svg circle.draw');
    var drawIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          drawIo.unobserve(entry.target);
        }
      });
    }, { threshold: .35 });
    Array.prototype.forEach.call(drawPaths, function (path) {
      try {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len + ' ' + len;
        path.style.strokeDashoffset = len;
        drawIo.observe(path);
      } catch (e) {}
    });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      el.classList.add('in');
    });
  }

  if (reduced) return;

  /* -----------------------------------------------------------------------
     Pointer glow, physical cards and tactile buttons
     ----------------------------------------------------------------------- */
  if (finePointer) {
    var glow = document.createElement('div');
    glow.id = 'cursor-glow';
    body.appendChild(glow);

    var pointerTick = false;
    var pointerX = -500;
    var pointerY = -500;
    window.addEventListener('pointermove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      body.classList.add('pointer-on');
      if (!pointerTick) {
        pointerTick = true;
        requestAnimationFrame(function () {
          pointerTick = false;
          doc.style.setProperty('--pointer-x', pointerX + 'px');
          doc.style.setProperty('--pointer-y', pointerY + 'px');
        });
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      body.classList.remove('pointer-on');
    });

    var tiltCards = document.querySelectorAll('.pain, .svc, .step, .why, .case');
    Array.prototype.forEach.call(tiltCards, function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var rx = ((event.clientY - rect.top) / rect.height - .5) * -4;
        var ry = ((event.clientX - rect.left) / rect.width - .5) * 4;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });

    var buttons = document.querySelectorAll('.btn');
    Array.prototype.forEach.call(buttons, function (button) {
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.addEventListener('pointermove', function (event) {
        var rect = button.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * .08;
        var y = (event.clientY - rect.top - rect.height / 2) * .12;
        button.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      button.addEventListener('pointerleave', function () {
        button.style.transform = '';
      });
      button.addEventListener('pointerdown', function (event) {
        var rect = button.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'fx-ripple';
        ripple.style.left = event.clientX - rect.left + 'px';
        ripple.style.top = event.clientY - rect.top + 'px';
        button.appendChild(ripple);
        window.setTimeout(function () { ripple.remove(); }, 650);
      });
    });
  }

  /* -----------------------------------------------------------------------
     Slow illustration drift and the original logo easter egg
     ----------------------------------------------------------------------- */
  var drifters = document.querySelectorAll('.drift-1, .drift-2, .drift-3');
  if (drifters.length) {
    var driftTick = false;
    function updateDrift() {
      driftTick = false;
      var y = window.scrollY || 0;
      Array.prototype.forEach.call(drifters, function (el) {
        var speed = el.classList.contains('drift-3') ? .044 :
          el.classList.contains('drift-2') ? .028 : .016;
        el.style.transform = 'translateY(' + (-y * speed).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!driftTick) {
        driftTick = true;
        requestAnimationFrame(updateDrift);
      }
    }, { passive: true });
    updateDrift();
  }

  var logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', function () {
      logo.classList.remove('spin');
      void logo.offsetWidth;
      logo.classList.add('spin');
    });
  }
})();
