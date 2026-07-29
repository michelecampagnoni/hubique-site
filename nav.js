/* Hubique — navigazione mobile a pannello laterale.
   Progressive enhancement: senza JavaScript il footer resta la mappa
   completa del sito; con JS il menu specchia il rail desktop. */
(function () {
  'use strict';

  var body = document.body;
  var navBar = document.querySelector('header .nav');
  var navLinks = navBar && navBar.querySelector('.nav-links');
  if (!navBar || !navLinks) return;

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Apri il menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-drawer');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  navBar.appendChild(toggle);

  var scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  body.appendChild(scrim);

  var drawer = document.createElement('aside');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';
  drawer.setAttribute('aria-label', 'Menu di navigazione');

  var drawerHead = document.createElement('div');
  drawerHead.className = 'nav-drawer-head';
  drawerHead.innerHTML =
    '<a class="logo" href="index.html">hubique<span>.</span></a>' +
    '<button type="button" class="nav-close" aria-label="Chiudi il menu">&#10005;</button>';

  var drawerLinks = navLinks.cloneNode(true);
  drawerLinks.className = 'nav-drawer-links';

  /* Prodotti esiste solo come capitolo del menu mobile: sul rail desktop
     i quattro capitoli restano invariati. */
  var prodottiLink = document.createElement('a');
  prodottiLink.href = 'prodotti.html';
  prodottiLink.textContent = 'Prodotti';
  if (/(^|\/)prodotti\.html$/.test(window.location.pathname)) {
    prodottiLink.className = 'active';
  }
  drawerLinks.insertBefore(prodottiLink, drawerLinks.querySelector('.nav-resources'));

  drawer.appendChild(drawerHead);
  drawer.appendChild(drawerLinks);
  body.appendChild(drawer);

  function setDrawer(open) {
    body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }

  toggle.addEventListener('click', function () {
    setDrawer(!body.classList.contains('nav-open'));
  });
  drawerHead.querySelector('.nav-close').addEventListener('click', function () {
    setDrawer(false);
  });
  scrim.addEventListener('click', function () {
    setDrawer(false);
  });
  drawerLinks.addEventListener('click', function (event) {
    var link = event.target;
    while (link && link !== drawerLinks && link.tagName !== 'A') link = link.parentNode;
    if (link && link.tagName === 'A') setDrawer(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && body.classList.contains('nav-open')) setDrawer(false);
  });
})();
