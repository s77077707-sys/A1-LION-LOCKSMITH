# A-1 Lion Locksmith menu

The live site already uses this menu. To apply it elsewhere:

1. Replace the existing homepage `<header>...</header>` with this markup. On internal pages keep the existing logo `<img>` instead of the homepage `.logo-original` span, and set All services to `/#services`.
2. Load `/menu.css` after the existing page CSS.
3. Load `/menu.js` with `defer` and remove the old menu click handler. Keep the other page scripts and the mobile call bar.

```html
<header class="site-header"><div class="container header-inner">
<a class="brand" href="/" aria-label="A-1 Lion Locksmith home"><span class="logo-original" role="img" aria-label="A-1 Lion Locksmith logo"></span></a><button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-label="Open menu" aria-controls="nav" type="button"><span class="menu-text">Menu</span><span class="menu-icon" aria-hidden="true">☰</span></button><nav class="nav" id="nav" aria-label="Main navigation"><a class="nav-call" href="tel:+17048402555">Call (704) 840-2555</a><div class="nav-services">
<button class="nav-services-toggle" type="button" aria-expanded="false" aria-controls="services-submenu">Services <span class="nav-chevron" aria-hidden="true">⌄</span></button><div class="nav-services-menu" id="services-submenu">
<a href="/emergency-locksmith/">Emergency lockout</a><a href="/automotive-locksmith/">Car keys</a><a href="/residential-locksmith/">Rekeying</a><a href="/residential-locksmith/">Lock installation</a><a href="/residential-locksmith/">Smart locks</a><a href="#services">All services</a>
</div>
</div>
<a href="/service-areas/">Service areas</a><a href="/about-us/">About</a><a href="/contact-us/">Contact</a></nav><a class="header-call" href="tel:+17048402555">Call (704) 840-2555</a>
</div></header>
  
```

The style and behavior are in [`public/menu.css`](public/menu.css) and [`public/menu.js`](public/menu.js).
