/* Defer this file after the existing page scripts. It controls only the header. */
(() => {
  const header = document.querySelector('.site-header,.header');
  if (!header) return;
  const nav = header.querySelector('#nav');
  const button = header.querySelector('#menuToggle,.menu');
  const services = header.querySelector('.nav-services');
  const serviceButton = header.querySelector('.nav-services-toggle');
  const mobile = matchMedia('(max-width:850px)');
  if (!nav || !button || !services || !serviceButton) return;

  const setServices = open => {
    services.classList.toggle('open', open);
    serviceButton.setAttribute('aria-expanded', String(open));
  };
  const setMenu = open => {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open && mobile.matches);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.querySelector('.menu-icon').textContent = open ? '✕' : '☰';
    button.querySelector('.menu-text').textContent = open ? 'Close' : 'Menu';
    if (!open) setServices(false);
  };

  button.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  serviceButton.addEventListener('click', () => setServices(mobile.matches ? !services.classList.contains('open') : true));
  services.addEventListener('pointerenter', () => { if (!mobile.matches) setServices(true); });
  services.addEventListener('pointerleave', () => { if (!mobile.matches) setServices(false); });
  services.addEventListener('focusin', () => { if (!mobile.matches) setServices(true); });
  services.addEventListener('focusout', e => {
    if (!mobile.matches && !services.contains(e.relatedTarget)) setServices(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('open')) { setMenu(false); button.focus(); }
    else if (services.classList.contains('open')) { serviceButton.focus(); setServices(false); }
  });
  nav.addEventListener('click', e => {
    if (e.target === nav) { setMenu(false); return; } // dark empty overlay
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !header.contains(e.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
})();
