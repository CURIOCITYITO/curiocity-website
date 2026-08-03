document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const headerNav = document.getElementById('header-nav');
  const navLinks = headerNav.querySelectorAll('a');

  /* ---------- Header background on scroll ---------- */
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const closeNav = () => {
    headerNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    headerNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  navLinks.forEach((link) => link.addEventListener('click', closeNav));

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- About section particle field ---------- */
  const aboutSection = document.getElementById('about');
  const canvas = aboutSection && aboutSection.querySelector('.about__canvas');

  if (aboutSection && canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const PARTICLE_COUNT = 550;
    const MOUSE_RADIUS = 260;

    let width = 0;
    let height = 0;
    let particles = [];
    const mouse = { x: 0, y: 0, active: false };

    const resize = () => {
      width = aboutSection.clientWidth;
      height = aboutSection.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const STREAM_COLORS = [
      [255, 45, 138],  // pink
      [123, 47, 247],  // purple
      [40, 110, 255],  // blue
      [0, 209, 193],   // turquoise
    ];

    const lerp = (a, b, t) => a + (b - a) * t;

    const streamColor = (t) => {
      const scaled = Math.max(0, Math.min(1, t)) * (STREAM_COLORS.length - 1);
      const i = Math.min(STREAM_COLORS.length - 2, Math.floor(scaled));
      const localT = scaled - i;
      const c1 = STREAM_COLORS[i];
      const c2 = STREAM_COLORS[i + 1];
      return [
        Math.round(lerp(c1[0], c2[0], localT)),
        Math.round(lerp(c1[1], c2[1], localT)),
        Math.round(lerp(c1[2], c2[2], localT)),
      ];
    };

    const createParticles = () => {
      const waveCount = 0.85;
      const amplitude = height * 0.22;
      const baseline = height * 0.52;
      const bandWidth = height * 0.16;

      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const t = Math.random();
        const spread = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 2 * bandWidth;
        const pathX = t * width;
        const pathY = baseline + Math.sin(t * Math.PI * 2 * waveCount) * amplitude + spread;
        const [cr, cg, cb] = streamColor(t);

        return {
          baseX: pathX,
          baseY: pathY,
          x: pathX,
          y: pathY,
          r: Math.random() * 1.4 + 0.5,
          alpha: Math.random() * 0.35 + 0.35,
          color: `${cr}, ${cg}, ${cb}`,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.6 + 0.3,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.angle += 0.004 * p.speed;
        let targetX = p.baseX + Math.cos(p.angle) * 6;
        let targetY = p.baseY + Math.sin(p.angle * 1.3) * 6;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const factor = (1 - dist / MOUSE_RADIUS) * 2.6;
            targetX += dx * factor;
            targetY += dy * factor;
          }
        }

        p.x += (targetX - p.x) * 0.11;
        p.y += (targetY - p.y) * 0.11;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });
    };

    const loop = () => {
      draw();
      requestAnimationFrame(loop);
    };

    const handlePointerMove = (event) => {
      const rect = aboutSection.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouse.x = x;
        mouse.y = y;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
        if (prefersReducedMotion) draw();
      }, 200);
    };

    resize();
    createParticles();

    if (prefersReducedMotion) {
      draw();
    } else {
      loop();
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    window.addEventListener('resize', handleResize);
  }
});
