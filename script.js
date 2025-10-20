 
/* Animations JS + styles : ajoute dynamisme subtil (logo flottant, CTA pulse, reveal stagger, parallax) */
(() => {
  const css = `
  /* animation styles injected par JS */
  @keyframes floatY { 0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)} }
  @keyframes ctaPulse { 0%{transform:scale(1); box-shadow:0 8px 26px rgba(47,74,90,0.06)}50%{transform:scale(1.06); box-shadow:0 18px 44px rgba(143,109,63,0.14)}100%{transform:scale(1); box-shadow:0 8px 26px rgba(47,74,90,0.06)} }

  .anim-float { animation: floatY 6s ease-in-out infinite; will-change: transform; }
  .anim-cta-pulse { animation: ctaPulse 0.9s ease forwards; }
  .reveal { opacity:0; transform: translateY(12px); transition: opacity 520ms cubic-bezier(.2,.9,.2,1), transform 520ms cubic-bezier(.2,.9,.2,1); will-change: opacity, transform; }
  .reveal.visible { opacity:1; transform: none; }
  /* subtle focus ring for CTA when pulse happens */
  .cta-spot { box-shadow: 0 20px 48px rgba(143,109,63,0.10), inset 0 -6px 18px rgba(255,255,255,0.04); border-radius: 28px; }
  /* nav links smaller stagger effect */
  nav.main-nav a.reveal { display:inline-block; }
  `;

  const style = document.createElement('style');
  style.setAttribute('aria-hidden','true');
  style.textContent = css;
  document.head.appendChild(style);

  function onReady(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(() => {
    const logo = document.querySelector('.logo');
    const container = document.querySelector('.container');
    const cta = document.querySelector('.cta-btn');
    const navLinks = Array.from(document.querySelectorAll('nav.main-nav a'));
    const revealEls = Array.from(document.querySelectorAll('.container > *'));

    // 1) gentle float on logo
    if(logo) logo.classList.add('anim-float');

    // 2) staggered reveal for nav links + hero elements
    navLinks.forEach(a => a.classList.add('reveal'));
    revealEls.forEach(el => el.classList.add('reveal'));

    setTimeout(() => {
      navLinks.forEach((a, i) => setTimeout(() => a.classList.add('visible'), i * 90));
      revealEls.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 200 + i * 110));
    }, 100);

    // 3) micro parallax (mouse move) — subtle, only small transforms
    let lastMove = 0;
    document.addEventListener('mousemove', e => {
      const t = Date.now();
      if (t - lastMove < 16) return; // throttle ~60fps
      lastMove = t;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 .. 1
      const dy = (e.clientY - cy) / cy;
      if (logo) logo.style.transform = `translate(${dx * 6}px, ${dy * 5}px)`;
      if (container) container.style.transform = `translate(${dx * 3}px, ${dy * 2}px)`;
    });
    // reset on leave
    document.addEventListener('mouseleave', () => {
      if (logo) logo.style.transform = '';
      if (container) container.style.transform = '';
    });

    // 4) CTA periodic soft pulse to attract attention
    let pulseInterval;
    if (cta) {
      // pulse every ~4.5s
      pulseInterval = setInterval(() => {
        cta.classList.add('anim-cta-pulse', 'cta-spot');
        // remove after animation
        setTimeout(() => cta.classList.remove('anim-cta-pulse'), 920);
        setTimeout(() => cta.classList.remove('cta-spot'), 1200);
      }, 4500);

      // immediate micro-pulse on mouseenter
      cta.addEventListener('mouseenter', () => {
        cta.classList.add('anim-cta-pulse', 'cta-spot');
        setTimeout(() => cta.classList.remove('anim-cta-pulse'), 920);
        setTimeout(() => cta.classList.remove('cta-spot'), 1200);
      });
    }

    // 5) IntersectionObserver for services / sidebar reveal (on scroll)
    try {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            ent.target.classList.add('visible');
            io.unobserve(ent.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('.service, .sidebar, .member, footer').forEach(el => {
        if (!el.classList.contains('visible')) {
          el.classList.add('reveal');
          io.observe(el);
        }
      });
    } catch (e) {
      // IntersectionObserver absent -> fallback: make everything visible
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

    // 6) keep existing mobile menu behavior (if present in file)
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const opened = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // clean-up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(pulseInterval);
    });
  });
})();

