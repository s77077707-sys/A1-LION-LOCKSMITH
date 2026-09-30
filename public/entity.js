/* Shared GBP entity: consistent NAP + schema on every page */
(() => {
  const ORIGIN = 'https://es-locksmith.com';
  const BUSINESS_ID = ORIGIN + '/#business';
  const ENTITY = {
    name: 'A-1 Lion Locksmith',
    legalName: 'A1 Lion Locksmith LLC',
    alternateName: ['A1 Lion Locksmith', 'ES Locksmith', 'A-1 LION LOCKSMITH'],
    telephone: '+1-704-840-2555',
    telephoneDisplay: '(704) 840-2555',
    email: 'a1lionlocksmith@gmail.com',
    license: 'NC License #2313',
    streetAddress: '1009 N Caldwell St apt 1610',
    addressLocality: 'Charlotte',
    addressRegion: 'NC',
    postalCode: '28206',
    addressCountry: 'US',
    url: ORIGIN + '/',
    logo: ORIGIN + '/a1-lion-logo.webp',
    image: ORIGIN + '/og-charlotte-locksmith.png',
    sameAs: [
      'https://www.facebook.com/people/A-1-lion-locksmith/100091468285653/',
      'https://www.facebook.com/A1Lion.Locksmith'
    ]
  };

  const CITY_PAGES = {
    '/locksmith-in-charlotte': 'Charlotte',
    '/concord-locksmith': 'Concord',
    '/matthews-locksmith': 'Matthews',
    '/huntersville-locksmith': 'Huntersville',
    '/gastonia-locksmith': 'Gastonia',
    '/cornelius-locksmith': 'Cornelius',
    '/davidson-locksmith': 'Davidson',
    '/denver-locksmith': 'Denver',
    '/fairview-locksmith': 'Fairview',
    '/harrisburg-locksmith': 'Harrisburg',
    '/indian-trail-locksmith': 'Indian Trail',
    '/kannapolis-locksmith': 'Kannapolis',
    '/lincolnton-locksmith': 'Lincolnton',
    '/mint-hill-locksmith': 'Mint Hill',
    '/monroe-locksmith': 'Monroe',
    '/mooresville-locksmith': 'Mooresville',
    '/pineville-locksmith': 'Pineville',
    '/unionville-locksmith': 'Unionville',
    '/waxhaw-locksmith': 'Waxhaw',
    '/wesley-chapel-locksmith': 'Wesley Chapel'
  };

  const SERVICES = [
    'Emergency lockout',
    'Car lockout',
    'Car key replacement',
    'Key fob programming',
    'Residential rekeying',
    'Lock installation',
    'Smart lock installation',
    'Commercial locksmith'
  ];

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const cityName = CITY_PAGES[path] || null;
  const fullAddress = ENTITY.streetAddress + ', ' + ENTITY.addressLocality + ', ' + ENTITY.addressRegion + ' ' + ENTITY.postalCode;

  const addressNode = {
    '@type': 'PostalAddress',
    streetAddress: ENTITY.streetAddress,
    addressLocality: ENTITY.addressLocality,
    addressRegion: ENTITY.addressRegion,
    postalCode: ENTITY.postalCode,
    addressCountry: ENTITY.addressCountry
  };

  function businessNode(extra) {
    return Object.assign({
      '@type': ['Locksmith', 'LocalBusiness'],
      '@id': BUSINESS_ID,
      name: ENTITY.name,
      legalName: ENTITY.legalName,
      alternateName: ENTITY.alternateName,
      url: ENTITY.url,
      image: ENTITY.image,
      logo: ENTITY.logo,
      telephone: ENTITY.telephone,
      email: ENTITY.email,
      priceRange: '$$',
      address: addressNode,
      identifier: {
        '@type': 'PropertyValue',
        name: 'North Carolina locksmith license',
        value: '2313'
      },
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'North Carolina Locksmith License #2313',
        recognizedBy: {
          '@type': 'Organization',
          name: 'State of North Carolina'
        }
      },
      knowsAbout: SERVICES,
      areaServed: { '@type': 'AdministrativeArea', name: 'Charlotte metro, NC' },
      sameAs: ENTITY.sameAs
    }, extra || {});
  }

  function stripWeakLocksmithSchema() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
      if (node.id === 'a1-entity-schema') return;
      try {
        const data = JSON.parse(node.textContent);
        const graph = data['@graph'] || [data];
        const isWeakLocksmith = graph.some((item) => {
          const t = [].concat(item && item['@type'] || []);
          return t.includes('Locksmith') && (!item.address || !item['@id']);
        });
        if (isWeakLocksmith && !graph.some((item) => item && item['@id'] === BUSINESS_ID && item.address)) {
          node.remove();
        }
      } catch (e) {}
    });
  }

  function injectSchema() {
    stripWeakLocksmithSchema();
    const graph = [
      businessNode(cityName ? {
        areaServed: { '@type': 'City', name: cityName + ', NC' }
      } : null),
      {
        '@type': 'WebSite',
        '@id': ORIGIN + '/#website',
        url: ENTITY.url,
        name: ENTITY.name,
        publisher: { '@id': BUSINESS_ID }
      },
      {
        '@type': 'WebPage',
        '@id': ORIGIN + path + '/#webpage',
        url: ORIGIN + (path === '/' ? '/' : path + '/'),
        name: document.title,
        isPartOf: { '@id': ORIGIN + '/#website' },
        about: { '@id': BUSINESS_ID }
      }
    ];

    if (cityName) {
      graph.push({
        '@type': 'Service',
        '@id': ORIGIN + path + '/#service',
        name: 'Locksmith services in ' + cityName + ', NC',
        serviceType: 'Locksmith',
        provider: { '@id': BUSINESS_ID },
        areaServed: { '@type': 'City', name: cityName + ', NC' },
        availableChannel: {
          '@type': 'ServiceChannel',
          servicePhone: { '@type': 'ContactPoint', telephone: ENTITY.telephone, contactType: 'customer service' }
        }
      });
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'a1-entity-schema';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(script);
  }

  function normalizeFooter() {
    document.querySelectorAll('footer, .site-footer').forEach((footer) => {
      if (footer.dataset.napReady === '1') return;
      footer.dataset.napReady = '1';
      const brand = footer.querySelector('strong');
      if (brand) brand.textContent = ENTITY.name;

      let addressEl = footer.querySelector('.nap-address');
      if (!addressEl) {
        addressEl = document.createElement('p');
        addressEl.className = 'nap-address';
        const anchor = footer.querySelector('p') || brand;
        if (anchor) anchor.insertAdjacentElement('afterend', addressEl);
        else footer.insertBefore(addressEl, footer.firstChild);
      }
      addressEl.textContent = fullAddress;

      const licenseLine = [...footer.querySelectorAll('p')].find((p) => /License #2313/i.test(p.textContent));
      if (licenseLine && !/Charlotte, NC/.test(licenseLine.textContent)) {
        licenseLine.textContent = 'Charlotte, NC · NC Locksmith License #2313';
      } else if (!licenseLine && brand) {
        const p = document.createElement('p');
        p.textContent = 'Charlotte, NC · NC Locksmith License #2313';
        brand.insertAdjacentElement('afterend', p);
      }
    });
  }

  function ensureVisibleSignals() {
    if (!cityName) return;
    const hero = document.querySelector('.inner-hero-copy, .hero .wrap, main section');
    if (!hero || hero.querySelector('.entity-nap')) return;
    const box = document.createElement('p');
    box.className = 'entity-nap license-badge';
    box.innerHTML = ENTITY.name + ' · ' + cityName + ', NC · ' + ENTITY.license + ' · <a href="tel:+17048402555">' + ENTITY.telephoneDisplay + '</a>';
    const badge = hero.querySelector('.license-badge, .hero-actions');
    if (badge) badge.insertAdjacentElement('afterend', box);
    else hero.appendChild(box);
  }

  injectSchema();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      normalizeFooter();
      ensureVisibleSignals();
    });
  } else {
    normalizeFooter();
    ensureVisibleSignals();
  }
})();
