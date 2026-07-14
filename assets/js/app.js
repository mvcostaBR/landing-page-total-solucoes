/**
 * Aplicação principal da landing page.
 * - Sem bibliotecas externas.
 * - Sem animações contínuas ou manipulação automática de rolagem.
 * - Todos os listeners são registrados uma única vez.
 */
(() => {
  'use strict';

  /** Evita inicialização duplicada caso o script seja carregado novamente. */
  if (window.__TSP_APP_INITIALIZED__) return;
  window.__TSP_APP_INITIALIZED__ = true;

  const doc = document;
  const body = doc.body;
  const header = doc.querySelector('[data-header]');
  const menuToggle = doc.querySelector('[data-menu-toggle]');
  const menu = doc.querySelector('[data-menu]');
  const backToTop = doc.querySelector('[data-back-to-top]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Atualiza o ano do copyright sem depender do servidor. */
  doc.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  /** Controla o menu mobile e mantém os atributos de acessibilidade sincronizados. */
  const closeMenu = () => {
    if (!menu || !menuToggle) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      body.classList.toggle('menu-open', willOpen);
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 840) closeMenu();
    }, { passive: true });
  }

  /**
   * Cabeçalho e botão de retorno ao topo.
   * requestAnimationFrame é usado apenas para limitar a frequência do evento,
   * sem alterar a posição da página ou criar movimento repetitivo.
   */
  let scrollTicking = false;
  const updateScrollState = () => {
    const scrollY = window.scrollY || doc.documentElement.scrollTop;
    header?.classList.toggle('is-scrolled', scrollY > 12);
    backToTop?.classList.toggle('is-visible', scrollY > 620);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollState);
  }, { passive: true });

  updateScrollState();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /** Accordion acessível. Apenas um item permanece aberto por vez. */
  doc.querySelectorAll('[data-accordion]').forEach((accordion) => {
    const buttons = [...accordion.querySelectorAll('.faq__question')];

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const answerId = button.getAttribute('aria-controls');
        const answer = answerId ? doc.getElementById(answerId) : null;
        const willOpen = button.getAttribute('aria-expanded') !== 'true';

        buttons.forEach((otherButton) => {
          const otherAnswerId = otherButton.getAttribute('aria-controls');
          const otherAnswer = otherAnswerId ? doc.getElementById(otherAnswerId) : null;
          otherButton.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.hidden = true;
        });

        button.setAttribute('aria-expanded', String(willOpen));
        if (answer) answer.hidden = !willOpen;
      });
    });
  });

  /**
   * Animações de entrada executadas uma única vez.
   * O elemento é removido do observer após aparecer, evitando loops visuais.
   */
  const revealElements = doc.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    document.documentElement.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /** Rastreia cliques de WhatsApp sem impedir a navegação do usuário. */
  doc.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.addEventListener('click', () => {
      const location = link.dataset.ctaLocation || 'indefinido';

      if (typeof window.tspTrack === 'function') {
        window.tspTrack('whatsapp_click', {
          cta_location: location,
          link_url: link.href,
          page_path: window.location.pathname
        });
      }
    });
  });
})();
