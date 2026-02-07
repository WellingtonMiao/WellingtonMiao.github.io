(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const state = { particles: [], cfg: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seedParticles() {
    state.particles = [];
    const count = state.cfg.count || 64;
    for (let i = 0; i < count; i += 1) {
      state.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * state.cfg.speed,
        vy: (Math.random() - 0.5) * state.cfg.speed,
        r: Math.random() * (state.cfg.size.max - state.cfg.size.min) + state.cfg.size.min,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.6 + Math.random() * 0.9
      });
    }
  }

  function step(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = (timestamp || 0) * 0.001;

    for (let i = 0; i < state.particles.length; i += 1) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      p.alpha = state.cfg.opacity * (0.18 + 0.82 * ((Math.sin(time * p.twinkle + p.phase) + 1) / 2));

      ctx.beginPath();
      ctx.fillStyle = state.cfg.color;
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < state.particles.length; i += 1) {
      for (let j = i + 1; j < state.particles.length; j += 1) {
        const a = state.particles[i];
        const b = state.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < state.cfg.linkDistance) {
          const alphaRaw = Math.min(a.alpha, b.alpha) * (1 - dist / state.cfg.linkDistance) * 3.2;
          const alpha = Math.min(alphaRaw, 0.82);
          if (alpha < 0.03) continue;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#3f67cf';
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  fetch('./particles.json')
    .then((r) => r.json())
    .then((cfg) => {
      state.cfg = cfg;
      resize();
      seedParticles();
      step();
      window.addEventListener('resize', () => {
        resize();
        seedParticles();
      });
    })
    .catch(() => {
      state.cfg = {
        count: 56,
        speed: 0.35,
        color: '#6fa8ff',
        opacity: 0.25,
        linkDistance: 120,
        size: { min: 0.8, max: 2.2 }
      };
      resize();
      seedParticles();
      step();
    });
})();
