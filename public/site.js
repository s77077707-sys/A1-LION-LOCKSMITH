const form = document.querySelector('#contact-form');
const availability = document.querySelector('#form-availability');
const MAILTO = 'a1lionlocksmith@gmail.com';

function payloadFrom(formEl) {
  return Object.fromEntries(new FormData(formEl));
}

function mailtoFallback(data) {
  const body = [`Name: ${data.name || ''}`, `Phone: ${data.phone || ''}`, `Email: ${data.email || ''}`, `City: ${data.city || ''}`, '', data.message || ''].join('\n');
  window.location.href = `mailto:${MAILTO}?subject=${encodeURIComponent('A-1 Lion inquiry from ' + (data.name || 'website'))}&body=${encodeURIComponent(body)}`;
}

if (form) {
  form.hidden = false;
  fetch('/api/contact', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { available: false }))
    .then((r) => {
      if (availability && r.available) availability.textContent = 'You can send the form or call (704) 840-2555.';
    })
    .catch(() => {});

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.querySelector('#form-status');
    const button = form.querySelector('button');
    const data = payloadFrom(form);
    if (data.website) return;
    button.disabled = true;
    if (status) status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) {
        if (status) status.textContent = 'Thank you. Your request was sent.';
        form.reset();
      } else {
        mailtoFallback(data);
        if (status) status.textContent = 'Opening your email app so the request can be sent.';
      }
    } catch {
      mailtoFallback(data);
      if (status) status.textContent = 'Opening your email app so the request can be sent.';
    } finally {
      button.disabled = false;
    }
  });
}
