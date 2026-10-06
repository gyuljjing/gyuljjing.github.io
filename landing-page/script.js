document.addEventListener('DOMContentLoaded', () => {
  // Existing Toast Handler
  const toast = document.getElementById('toast');
  let toastTimer;
  document.querySelectorAll('button.cta-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (!toast) return;
      toast.textContent = '아직 준비 중입니다.';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
    });
  });

  // Existing Accordion Handler
  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        document.querySelectorAll('.accordion details').forEach((other) => {
          if (other !== detail) other.open = false;
        });
      }
    });
  });

  // Existing Image Fallback Handler
  document.querySelectorAll('[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-fallback';
      placeholder.textContent = '이미지 준비 중';
      image.replaceWith(placeholder);
    }, { once: true });
  });

  // Existing Scroll Reveal Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  // --- GA4 Section View & CTA Click Measurement ---
  if (window._ga4TrackingInitialized) return;
  window._ga4TrackingInitialized = true;

  function sendGAEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, params);
      } catch (err) {
        console.warn('GA4 event send failed:', err);
      }
    }
  }

  // 1. Section View Tracking (IntersectionObserver)
  const trackedSections = new Set();
  const sectionTargets = [
    { selector: '#hero-title', name: 'hero' },
    { selector: '#detail-space-title', name: 'detail' },
    { selector: '#purchase-title', name: 'cta' }
  ];

  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.offsetHeight : 0;
  const rootMarginTop = headerHeight > 0 ? `-${headerHeight}px` : '0px';

  let sectionObserver = null;

  function initSectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    sectionObserver = new IntersectionObserver((entries) => {
      if (document.visibilityState !== 'visible') return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const sectionName = entry.target.dataset.gaSectionName;
          if (sectionName && !trackedSections.has(sectionName)) {
            trackedSections.add(sectionName);
            sendGAEvent('section_view', { section_name: sectionName });
            sectionObserver.unobserve(entry.target);
          }
        }
      });
    }, {
      root: null,
      rootMargin: `${rootMarginTop} 0px 0px 0px`,
      threshold: 0.5
    });

    sectionTargets.forEach(({ selector, name }) => {
      const el = document.querySelector(selector);
      if (el && !trackedSections.has(name)) {
        el.dataset.gaSectionName = name;
        sectionObserver.observe(el);
      }
    });
  }

  initSectionObserver();

  // Handle visibility change (re-check visible sections when returning from another tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && sectionObserver) {
      sectionTargets.forEach(({ selector, name }) => {
        if (trackedSections.has(name)) return;
        const el = document.querySelector(selector);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const topBound = headerHeight;
        const bottomBound = window.innerHeight || document.documentElement.clientHeight;

        const visibleTop = Math.max(rect.top, topBound);
        const visibleBottom = Math.min(rect.bottom, bottomBound);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (rect.height > 0 && (visibleHeight / rect.height) >= 0.5) {
          trackedSections.add(name);
          sendGAEvent('section_view', { section_name: name });
          sectionObserver.unobserve(el);
        }
      });
    }
  });

  // 2. CTA Click Tracking
  const ctaConfigs = [
    { selector: '#cta-hero, #hero-cta, [data-cta-location="hero"]', location: 'hero' },
    { selector: '#cta-final, #final-cta, [data-cta-location="final"]', location: 'final' }
  ];

  const boundElements = new WeakSet();

  ctaConfigs.forEach(({ selector, location }) => {
    const el = document.querySelector(selector);
    if (!el || boundElements.has(el)) return;
    boundElements.add(el);

    el.addEventListener('click', () => {
      sendGAEvent('cta_click', { button_location: location });
    });
  });
});
