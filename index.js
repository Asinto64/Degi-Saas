/* ==========================================================================
   DEGI — Vanilla JS (no GSAP, Lenis, or Three.js)
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initNav();
    initHeroWordReveal();
    initHeroParallax();
    initHeroMetric();
    initScrollReveal();
    initStatsCounter();
    initFeatureStagger();
    initPricingToggle();
    initDemoForm();
    initSmoothScroll();
  });

  /* ── Custom cursor — snappy dot, softer ring trail ── */
  function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    document.body.classList.add('has-custom-cursor');

    let targetX = 0;
    let targetY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    let visible = false;
    const dotLag = 0.62;  /* responsive core */
    const ringLag = 0.28; /* light trail */

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        dot.classList.add('is-visible');
        ring?.classList.add('is-visible');
        dotX = ringX = targetX;
        dotY = ringY = targetY;
      }
    });

    window.addEventListener('mouseleave', () => {
      dot.classList.remove('is-visible');
      ring?.classList.remove('is-visible');
      visible = false;
    });

    const hoverables = 'a, button, .glass-card, .btn, input, select, textarea';
    document.addEventListener('mouseover', (e) => {
      if (!e.target.closest(hoverables)) return;
      dot.classList.add('is-hovering');
      ring?.classList.add('is-hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (!e.target.closest(hoverables)) return;
      dot.classList.remove('is-hovering');
      ring?.classList.remove('is-hovering');
    });

    function tick() {
      dotX += (targetX - dotX) * dotLag;
      dotY += (targetY - dotY) * dotLag;
      ringX += (targetX - ringX) * ringLag;
      ringY += (targetY - ringY) * ringLag;

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Hero mockup parallax tilt ── */
  function initHeroParallax() {
    const wrap = document.getElementById('hero-mockup-wrap');
    const mockup = document.getElementById('hero-mockup');
    if (!wrap || !mockup || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const maxTilt = 7;
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = nx * maxTilt;
      targetRX = -ny * maxTilt * 0.85;
    });

    wrap.addEventListener('mouseleave', () => {
      targetRX = 0;
      targetRY = 0;
    });

    function animateTilt() {
      currentRX += (targetRX - currentRX) * 0.12;
      currentRY += (targetRY - currentRY) * 0.12;
      mockup.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      requestAnimationFrame(animateTilt);
    }
    animateTilt();
  }

  /* ── Hero floating metric count-up ── */
  function initHeroMetric() {
    const el = document.getElementById('hero-metric-comments');
    if (!el) return;
    const target = 47;
    const start = performance.now() + 1400;
    const duration = 1600;

    function run(now) {
      if (now < start) {
        requestAnimationFrame(run);
        return;
      }
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(run);
      else el.textContent = String(target);
    }
    if (prefersReducedMotion) el.textContent = String(target);
    else requestAnimationFrame(run);
  }

  /* ── Nav scroll + mobile ── */
  function initNav() {
    const nav = document.getElementById('main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.getElementById('nav-links');

    if (nav) {
      const onScroll = () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });

      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ── Hero word-by-word reveal ── */
  function initHeroWordReveal() {
    const headline = document.getElementById('hero-headline');
    if (!headline || prefersReducedMotion) {
      headline?.querySelectorAll('.hero-line').forEach((line) => {
        line.style.opacity = '1';
      });
      return;
    }

    headline.querySelectorAll('.hero-line').forEach((line) => {
      const text = line.textContent.trim();
      const words = text.split(/\s+/);
      line.textContent = '';
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.animationDelay = `${0.15 + i * 0.08}s`;
        line.appendChild(span);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* ── IntersectionObserver: fade-up 60px, 0.6s ── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-on-scroll');
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  /* ── Feature cards: stagger 100ms ── */
  function initFeatureStagger() {
    const cards = document.querySelectorAll('.bento-item.reveal-on-scroll');
    if (prefersReducedMotion) return;

    cards.forEach((card) => {
      const delay = (parseInt(card.getAttribute('data-stagger'), 10) || 0) * 100;
      card.style.transitionDelay = `${delay}ms`;
    });
  }

  /* ── Stats count-up ── */
  function initStatsCounter() {
    const nums = document.querySelectorAll('.stat-num[data-target]');
    if (!nums.length) return;

    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }
      const duration = 2000;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.floor(eased * target));
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    nums.forEach((n) => io.observe(n));
  }

  /* ── Pricing toggle ── */
  function initPricingToggle() {
    const toggle = document.getElementById('pricing-toggle');
    if (!toggle) return;

    const opts = toggle.querySelectorAll('.toggle-opt');
    const prices = document.querySelectorAll('.price-val[data-monthly]');

    const setPeriod = (annual) => {
      toggle.setAttribute('aria-pressed', String(annual));
      opts.forEach((o) => {
        const active =
          (annual && o.dataset.period === 'annual') ||
          (!annual && o.dataset.period === 'monthly');
        o.classList.toggle('toggle-opt--active', active);
      });
      prices.forEach((el) => {
        const val = annual ? el.dataset.annual : el.dataset.monthly;
        el.textContent = val === '0' ? '$0' : `$${val}`;
      });
    };

    toggle.addEventListener('click', () => {
      setPeriod(toggle.getAttribute('aria-pressed') !== 'true');
    });
  }

  /* ── Demo form ── */
  function initDemoForm() {
    const form = document.getElementById('demo-form');
    const success = document.getElementById('demo-success');
    if (!form || !success) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.hidden = true;
      success.hidden = false;
    });
  }

  /* ── Smooth scroll for anchor links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });
  }
})();
