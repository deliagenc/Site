/* ==============================================
   DELIVAX AGENCY — Main JavaScript
   ============================================== */

/* --- Sticky Nav --- */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* --- Active Nav Link --- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* --- Mobile Menu --- */
(function () {
  const toggle = document.querySelector('.nav-mobile-toggle');
  const menu   = document.querySelector('.mobile-menu');
  const close  = document.querySelector('.mobile-close');
  if (!toggle || !menu) return;

  const open  = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut  = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
})();

/* --- Scroll Reveal --- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();

/* --- Stats Counter --- */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const format = (n, suffix) => {
    if (suffix === '%') return Math.round(n) + '%';
    if (suffix === '+' && n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K+';
    return Math.round(n) + suffix;
  };

  const animateCounter = (el) => {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1800;
    const start   = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * ease, suffix);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = format(target, suffix);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    }),
    { threshold: 0.5 }
  );
  counters.forEach(c => obs.observe(c));
})();

/* --- Testimonials Carousel --- */
(function () {
  const wrap  = document.querySelector('.carousel-wrap');
  if (!wrap) return;
  const track = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dots   = wrap.querySelectorAll('.c-dot');
  const prev   = wrap.querySelector('.c-btn.prev');
  const next   = wrap.querySelector('.c-btn.next');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const go = (idx) => {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const autoPlay = () => { timer = setInterval(() => go(current + 1), 5500); };
  const reset    = () => { clearInterval(timer); autoPlay(); };

  if (prev) prev.addEventListener('click', () => { go(current - 1); reset(); });
  if (next) next.addEventListener('click', () => { go(current + 1); reset(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); reset(); }));

  /* touch swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); reset(); }
  }, { passive: true });

  go(0);
  autoPlay();
})();

/* --- Contact Form Validation --- */
(function () {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const rules = {
    firstName:   v => v.trim().length >= 2            || 'Please enter your first name.',
    lastName:    v => v.trim().length >= 2            || 'Please enter your last name.',
    email:       v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    phone:       v => v.trim() === '' || /^[\d\s\-\+\(\)]{7,}$/.test(v) || 'Enter a valid phone number.',
    businessType:v => v !== ''                        || 'Please select your business type.',
    message:     v => v.trim().length >= 20           || 'Please tell us a bit more (at least 20 characters).',
  };

  const showError = (field, msg) => {
    field.classList.add('error');
    const errEl = field.closest('.form-group').querySelector('.field-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
  };
  const clearError = (field) => {
    field.classList.remove('error');
    const errEl = field.closest('.form-group').querySelector('.field-error');
    if (errEl) errEl.classList.remove('show');
  };

  /* live validation */
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      const rule = rules[field.name];
      if (!rule) return;
      const result = rule(field.value);
      if (result === true) clearError(field);
      else showError(field, result);
    });
    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const result = rules[name](field.value);
      if (result === true) clearError(field);
      else { showError(field, result); valid = false; }
    });

    if (!valid) return;

    /* success state */
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      const success = document.querySelector('#formSuccess');
      if (success) success.classList.add('show');
    }, 1200);
  });
})();

/* --- Chart bar heights (hero mockup) --- */
(function () {
  const heights = [35, 50, 40, 65, 55, 80, 70, 95, 85, 100, 90, 88];
  document.querySelectorAll('.c-bar').forEach((bar, i) => {
    bar.style.height = (heights[i % heights.length]) + '%';
  });
})();
