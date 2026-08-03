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

  /* ---------- About section cursor-revealed video ---------- */
  const aboutSection = document.getElementById('about');
  const overlay = document.getElementById('about-overlay');

  if (aboutSection && overlay) {
    const bgVideo = aboutSection.querySelector('.about__video-bg video');

    const handlePointerMove = (event) => {
      const rect = aboutSection.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      if (inside) {
        overlay.style.setProperty('--spot-x', `${x}px`);
        overlay.style.setProperty('--spot-y', `${y}px`);
        if (bgVideo && bgVideo.paused) {
          bgVideo.play().catch(() => {});
        }
      } else {
        overlay.style.setProperty('--spot-x', '-9999px');
        overlay.style.setProperty('--spot-y', '-9999px');
        if (bgVideo && !bgVideo.paused) {
          bgVideo.pause();
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
  }
});
