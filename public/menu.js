/* Header menu + homepage trust/NAP/form fixes */
(() => {
  const header = document.querySelector('.site-header,.header');
  if (!header) return;
  const nav = header.querySelector('#nav');
  const button = header.querySelector('#menuToggle,.menu');
  const services = header.querySelector('.nav-services');
  const serviceButton = header.querySelector('.nav-services-toggle');
  const mobile = matchMedia('(max-width:850px)');
  if (!nav || !button || !services || !serviceButton) return;

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const primary = [...nav.querySelectorAll(':scope > a:not(.nav-call)')];
  const current = primary.find(a => (a.pathname.replace(/\/+$/, '') || '/') === path);
  if (current) current.setAttribute('aria-current', 'page');
  if (['/emergency-locksmith','/automotive-locksmith','/residential-locksmith'].includes(path)) {
    serviceButton.classList.add('current');
  }

  const setServices = open => {
    services.classList.toggle('open', open);
    serviceButton.setAttribute('aria-expanded', String(open));
  };
  const setMenu = open => {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open && mobile.matches);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const icon = button.querySelector('.menu-icon');
    const text = button.querySelector('.menu-text');
    if (icon) icon.textContent = open ? '\u2715' : '\u2630';
    if (text) text.textContent = open ? 'Close' : 'Menu';
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
    if (e.target === nav) { setMenu(false); return; }
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !header.contains(e.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
})();

(() => {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/') return;

  if (!document.querySelector('link[href*="form-fix.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/form-fix.css?v=20260929n';
    document.head.appendChild(link);
  }

  document.querySelectorAll('h2').forEach(h => {
    if (/NCmade simple/i.test(h.textContent) || /Charlotte, NC\s*made simple/i.test(h.textContent.replace(/\s+/g,' '))) {
      h.innerHTML = 'Locksmith services in Charlotte, NC';
    }
  });

  document.querySelectorAll('.hero-badges span, .proof-item strong, .proof-item small').forEach(el => {
    const t = el.textContent;
    if (/up to 30 minutes/i.test(t) || /30-minute arrival/i.test(t)) {
      if (el.tagName === 'STRONG') el.textContent = 'ID check before work';
      else el.textContent = 'Call to confirm arrival time*';
    }
    if (/Confirm availability for your address by phone/i.test(t)) {
      el.textContent = 'Proof of authorization required on every job';
    }
  });

  const footerBrand = document.querySelector('.site-footer p, footer p');
  if (footerBrand && /Charlotte, NC \u00b7 NC Locksmith License/.test(footerBrand.textContent) && !/Caldwell/.test(document.body.innerText)) {
    footerBrand.insertAdjacentHTML('afterend', '<p>Also known as ES Locksmith \u00b7 1009 N Caldwell St, Charlotte, NC 28206</p>');
  }

  if (!document.querySelector('#contact-form')) {
    const footer = document.querySelector('.site-footer, footer');
    if (footer) {
      const wrap = document.createElement('section');
      wrap.className = 'section contact';
      wrap.id = 'contact';
      wrap.innerHTML = '<div class="container"><p class="overline">Request service</p><h2>Tell us what happened.</h2><p>Urgent lockout? Call (704) 840-2555. For quotes, send the form below.</p><p id="form-availability"></p><form id="contact-form"><label>Name <input name="name" autocomplete="name" required></label><label>Phone <input name="phone" type="tel" autocomplete="tel" required></label><label>Email <input name="email" type="email" autocomplete="email"></label><label>City / address <input name="city" autocomplete="address-level2"></label><label>How can we help? <textarea name="message" rows="5" required></textarea></label><label class="trap" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label><button type="submit">Send request</button><p id="form-status" role="status" aria-live="polite"></p></form></div>';
      footer.parentNode.insertBefore(wrap, footer);
      const s = document.createElement('script');
      s.src = '/site.js?v=20260929n';
      document.body.appendChild(s);
    }
  }

  const photos = document.createElement('script');
  photos.src = '/job-photos.js?v=20260929n';
  document.body.appendChild(photos);
})();
