/* ============================================================
   Meron Tours — Shared site scripts
   ============================================================ */

// Reveal on scroll
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// Mobile nav open/close
function openMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.add('open');
}
function closeMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.remove('open');
}

// Contact form -> WhatsApp
function sendToWhatsApp(e) {
  e.preventDefault();
  const f = e.target;
  const name = (f.name?.value || '').trim();
  const phone = (f.phone?.value || '').trim();
  const org = (f.org?.value || '').trim();
  const topic = (f.topic?.value || f.lecture?.value || '').trim();
  const msg = (f.msg?.value || '').trim();

  let text = `היי מירון,\n\nשמי ${name}`;
  if (org) text += ` מ${org}`;
  text += `.\n`;
  text += `הטלפון שלי: ${phone}\n`;
  if (topic) text += `הנושא: ${topic}\n`;
  if (msg) text += `\nהערות: ${msg}\n`;
  text += `\nאשמח לחזרה כדי לתאם.`;

  const url = `https://wa.me/972546488789?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  return false;
}
