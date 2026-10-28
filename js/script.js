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

  /* ---------- Nav overlay toggle ---------- */
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
    }
  });

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

  /* ---------- Text reveal (gray sweep, then final color) ---------- */
  const textRevealTargets = document.querySelectorAll('.text-reveal');

  if (textRevealTargets.length) {
    if ('IntersectionObserver' in window) {
      const textRevealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealing');
              textRevealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      textRevealTargets.forEach((el) => textRevealObserver.observe(el));
    } else {
      textRevealTargets.forEach((el) => el.classList.add('is-revealing'));
    }
  }

  /* ---------- Hero title: roulette-style scramble reveal ---------- */
  const heroTitleLines = document.querySelectorAll('.hero__title-line');

  if (heroTitleLines.length) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const FLIP_INTERVAL = 45; // ms between random-character flips
    const STAGGER = 32; // ms added lock-delay per subsequent character
    const HOLD = 250; // ms every character scrambles before the first one locks

    const scrambleReveal = (el, finalText) => {
      const chars = finalText.split('').map((ch, i) => ({
        ch,
        isSpace: ch === ' ',
        lockAt: HOLD + i * STAGGER,
        lastFlip: -Infinity,
        locked: false,
      }));

      el.textContent = '';
      const spans = chars.map(({ ch, isSpace }) => {
        const span = document.createElement('span');
        span.className = 'hero__title-char';
        span.textContent = isSpace ? ' ' : ch;
        el.appendChild(span);
        return span;
      });

      const start = performance.now();
      const tick = (now) => {
        const t = now - start;
        let allLocked = true;

        chars.forEach((c, i) => {
          if (c.isSpace || c.locked) return;

          if (t >= c.lockAt) {
            c.locked = true;
            spans[i].textContent = c.ch;
          } else {
            allLocked = false;
            if (t - c.lastFlip >= FLIP_INTERVAL) {
              spans[i].textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
              c.lastFlip = t;
            }
          }
        });

        if (!allLocked) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    heroTitleLines.forEach((line, index) => {
      const finalText = line.textContent;

      if (prefersReducedMotion) {
        line.classList.add('is-revealing');
        line.textContent = finalText;
        return;
      }

      setTimeout(() => {
        line.classList.add('is-revealing');
        scrambleReveal(line, finalText);
      }, index * 450 + 200);
    });
  }

  /* ---------- Cursor ripples (spawn a ring where the pointer moves) ---------- */
  const prefersReducedMotionRipple = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotionRipple) {
    const MIN_DISTANCE = 140; // px the pointer must travel before the next ring
    const MIN_INTERVAL = 450; // ms between rings
    const MAX_RINGS = 8;

    document.querySelectorAll('.about, .about-hero').forEach((section) => {
      const layer = section.querySelector('.about__motion, .about-hero__motion');
      if (!layer) return;

      let lastX = -Infinity;
      let lastY = -Infinity;
      let lastTime = 0;
      let ringCount = 0;

      section.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;

        const now = performance.now();
        if (now - lastTime < MIN_INTERVAL || ringCount >= MAX_RINGS) return;

        const rect = layer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (Math.hypot(x - lastX, y - lastY) < MIN_DISTANCE) return;

        lastX = x;
        lastY = y;
        lastTime = now;
        ringCount += 1;

        const ring = document.createElement('span');
        ring.className = 'ripple ripple--cursor';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.addEventListener('animationend', () => {
          ring.remove();
          ringCount -= 1;
        });
        layer.appendChild(ring);
      }, { passive: true });
    });
  }
});
