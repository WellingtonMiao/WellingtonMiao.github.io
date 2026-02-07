(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const progressBar = document.getElementById('progressBar');
  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  const backToTop = document.getElementById('backToTop');
  const toast = document.getElementById('toast');

  const THEME_KEY = 'v2-theme';

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => toast.classList.remove('show'), 1400);
  }

  function syncThemeLabel() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? 'Light' : 'Dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    syncThemeLabel();
  }

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  menuToggle.addEventListener('click', () => {
    const opened = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(opened));
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = ratio + '%';
    backToTop.classList.toggle('show', window.scrollY > 320);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const hashNavLinks = Array.from(navLinks).filter((link) => link.getAttribute('href').startsWith('#'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      hashNavLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.45 });
  sections.forEach((section) => observer.observe(section));

  document.querySelectorAll('[data-pub]').forEach((card) => {
    const toggle = card.querySelector('[data-pub-toggle]');
    toggle.addEventListener('click', () => card.classList.toggle('open'));
  });

  document.querySelectorAll('.copy-bib').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-bib-target');
      const node = document.getElementById(id);
      if (!node) return;
      try {
        await navigator.clipboard.writeText(node.textContent.trim());
        showToast('BibTeX copied');
      } catch (_err) {
        showToast('Copy failed');
      }
    });
  });

  document.querySelectorAll('.skeleton-image').forEach((img) => {
    const wrapper = img.closest('.image-skeleton');

    const done = () => {
      img.classList.add('loaded');
      if (wrapper) wrapper.classList.add('loaded');
    };

    if (img.complete) done();
    else img.addEventListener('load', done, { once: true });

    const hoverSrc = img.getAttribute('data-hover-src');
    if (hoverSrc) {
      const origin = img.getAttribute('src');
      img.addEventListener('mouseenter', () => { img.setAttribute('src', hoverSrc); });
      img.addEventListener('mouseleave', () => { img.setAttribute('src', origin); });
    }
  });

  setTheme(localStorage.getItem(THEME_KEY) || 'light');
})();
