/* Global helpers */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // YEAR in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // NAV TOGGLE (mobile)
  const navToggle = $('#nav-toggle');
  const mainNav = $('#main-nav');
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
    // Reinicia la animación de salto si se toca varias veces
    navToggle.classList.remove('jump');
    void navToggle.offsetWidth; // trigger reflow
    navToggle.classList.add('jump');
    setTimeout(() => navToggle.classList.remove('jump'), 350);
  });

  // SHRINK HEADER ON SCROLL
  const header = document.getElementById('site-header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const sc = window.scrollY;
    if (sc > 50) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
    lastScroll = sc;
    highlightNavOnScroll();
  });

  // SMOOTH SCROLL / NAV LINKS
  const navLinks = $$('.nav-link');
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      // close mobile menu if open
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      // default behavior handled by CSS scroll-behavior
    });
  });

  // SCROLL SPY
  const sections = $$('.section');
  function highlightNavOnScroll(){
    const pos = window.scrollY + 120; // offset
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id = sec.id;
      const link = document.querySelector(`.nav a[href="#${id}"]`);
      if (!link) return;
      if (pos >= top && pos < bottom) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  highlightNavOnScroll();

  // TABS (CATÁLOGO)
  const tabs = $$('.tab');
  const panels = $$('.panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // deactivate
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
      // activate target
      tab.classList.add('active');
      const target = tab.dataset.target;
      const panel = document.getElementById(target);
      panel.classList.add('active');
      panel.hidden = false;
      // accessibility attributes
      tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
    });
  });

  // CAROUSEL
  const slidesWrap = $('.slides');
  const slides = $$('.slide', slidesWrap);
  const prevBtn = $('.carousel-control.prev');
  const nextBtn = $('.carousel-control.next');
  const indicatorsWrap = $('.carousel-indicators');
  let current = 0;
  let autoplay = true;
  let interval = null;

  // create indicators
  slides.forEach((s,i) => {
    const btn = document.createElement('button');
    btn.className = i === 0 ? 'active' : '';
    btn.addEventListener('click', () => goTo(i));
    indicatorsWrap.appendChild(btn);
  });

  function updateCarousel() {
    const width = slidesWrap.clientWidth;
    slidesWrap.style.transform = `translateX(-${current * width}px)`;
    // indicators
    $$('button', indicatorsWrap).forEach((b,i)=> b.classList.toggle('active', i===current));
  }

  function goTo(i){
    current = (i + slides.length) % slides.length;
    updateCarousel();
  }
  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  window.addEventListener('resize', updateCarousel);

  function startAutoplay(){
    if(interval) clearInterval(interval);
    interval = setInterval(() => { next(); }, 3000); // Cambiado a 3 segundos
  }
  function resetAutoplay(){
    if(interval) clearInterval(interval);
    if(autoplay) startAutoplay();
  }

  // init carousel
  updateCarousel();
  startAutoplay();

  // CAROUSEL TOUCH FOR MOBILE
  function isMobile() {
    return window.innerWidth <= 680;
  }

  const carousel = $('.carousel');
  let startX = null;

  // Tocar costado izquierdo/derecho para cambiar slide en móvil
  carousel.addEventListener('click', function(e) {
    if (!isMobile()) return;
    const rect = carousel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.33) {
      prev();
      resetAutoplay();
    } else if (x > rect.width * 0.66) {
      next();
      resetAutoplay();
    }
    // Si tocan el centro, no hace nada
  });

  // Swipe táctil (opcional, mejora UX)
  carousel.addEventListener('touchstart', function(e) {
    if (!isMobile()) return;
    startX = e.touches[0].clientX;
  });
  carousel.addEventListener('touchend', function(e) {
    if (!isMobile() || startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
      resetAutoplay();
    }
    startX = null;
  });

  // Close mobile nav when clicking outside (optional)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#main-nav') && !e.target.closest('#nav-toggle')) {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
      }
    }
  });

  // Scroll horizontal para catálogo
  document.querySelectorAll('.product-row').forEach(row => {
    const leftBtn = row.querySelector('.scroll-btn.left');
    const rightBtn = row.querySelector('.scroll-btn.right');
    const cards = row.querySelector('.cards.scrollable');
    if (!cards) return;
    leftBtn?.addEventListener('click', () => {
      cards.scrollBy({ left: -cards.offsetWidth * 0.8, behavior: 'smooth' });
    });
    rightBtn?.addEventListener('click', () => {
      cards.scrollBy({ left: cards.offsetWidth * 0.8, behavior: 'smooth' });
    });
  });
});
