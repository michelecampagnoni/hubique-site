/* Hubique — effetti di racconto.
   Principio: lo scroll accompagna la lettura, non la interrompe.
   Ogni effetto è additivo: senza JS o su browser vecchi la pagina
   resta completa e leggibile. */
(function () {
  'use strict';

  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* ---------- barra di avanzamento lettura ---------- */
  var bar = document.createElement('div');
  bar.id = 'fxbar';
  document.body.appendChild(bar);
  var barTick = false;
  function updateBar() {
    barTick = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', function () {
    if (!barTick) { barTick = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  if (reduced || !('IntersectionObserver' in window)) return;

  /* ---------- reveal on scroll ---------- */
  var targets = document.querySelectorAll(
    '.sec-head, .pain, .svc, .step, .case, .why, details, .callout, .demo, .hero-ill'
  );
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i % 6, 4) * 60 + 'ms';
    io.observe(el);
  });

  /* ---------- tratti che si disegnano (path.draw negli SVG) ---------- */
  var drawPaths = document.querySelectorAll('svg path.draw, svg line.draw, svg circle.draw');
  var ioDraw = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('drawn');
        ioDraw.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  drawPaths.forEach(function (p) {
    var len = 0;
    try { len = p.getTotalLength(); } catch (e) { return; }
    p.style.strokeDasharray = len + ' ' + len;
    p.style.strokeDashoffset = len;
    ioDraw.observe(p);
  });

  /* ---------- deriva parallasse leggera (.drift-1/.drift-2/.drift-3) ---------- */
  var drifters = document.querySelectorAll('.drift-1, .drift-2, .drift-3');
  if (drifters.length) {
    var speeds = { 'drift-1': 0.018, 'drift-2': 0.034, 'drift-3': 0.052 };
    var driftTick = false;
    function updateDrift() {
      driftTick = false;
      var y = window.scrollY || 0;
      drifters.forEach(function (el) {
        var cls = el.classList.contains('drift-3') ? 'drift-3'
                : el.classList.contains('drift-2') ? 'drift-2' : 'drift-1';
        el.style.transform = 'translateY(' + (-y * speeds[cls]).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!driftTick) { driftTick = true; requestAnimationFrame(updateDrift); }
    }, { passive: true });
    updateDrift();
  }

  /* ---------- easter egg: il logo gira ---------- */
  var logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', function () {
      logo.classList.remove('spin');
      void logo.offsetWidth;
      logo.classList.add('spin');
    });
  }
})();
