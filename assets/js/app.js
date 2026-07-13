/**
 * ============================================================================
 * TOTAL SOLUÇÕES PREDIAIS — APP.JS
 * Landing Page: Higienização de Ar Condicionado Residencial Split
 * ============================================================================
 *
 * Responsabilidades:
 * - aprimorar o header sticky e a navegação por âncoras;
 * - controlar o accordion nativo da FAQ;
 * - aplicar animações progressivas com Intersection Observer;
 * - aplicar lazy loading em imagens não críticas;
 * - criar o botão flutuante do WhatsApp usando o sprite SVG inline;
 * - criar o botão "Voltar ao topo" sem adicionar outro SVG;
 * - emitir eventos técnicos, sem dados pessoais, para analytics.js;
 * - preservar acessibilidade e baixo custo de execução.
 *
 * Dependências externas:
 * - nenhuma.
 */

(() => {
  "use strict";

  /** -------------------------------------------------------------------------
   * CONFIGURAÇÃO CENTRAL
   * ---------------------------------------------------------------------- */
  const CONFIG = Object.freeze({
    version: "1.1.0-svg-inline",
    selectors: Object.freeze({
      header: ".site-header",
      hero: ".hero",
      finalCta: ".final-cta",
      faqList: ".faq__list",
      faqItem: ".faq__list details",
      whatsappCta: '[data-cta="whatsapp"]',
      primaryWhatsappCta:
        '[data-cta="whatsapp"][data-cta-position="hero"]',
      whatsappSymbol: "#tsp-icon-whatsapp",
      revealTargets: [
        ".section-heading",
        ".benefit-card",
        ".analogy",
        ".service-card",
        ".service-scope",
        ".table-wrapper",
        ".pricing__secondary-cta",
        ".review-card",
        ".coverage-card",
        ".business-hours",
        ".authority-card",
        ".faq details",
        ".final-cta header"
      ].join(",")
    }),
    classes: Object.freeze({
      visible: "is-visible",
      enhanced: "is-enhanced"
    }),
    scroll: Object.freeze({
      headerThreshold: 16,
      backToTopThreshold: 720,
      depthMarks: Object.freeze([25, 50, 75, 90])
    }),
    observer: Object.freeze({
      revealRootMargin: "0px 0px -10% 0px",
      sectionRootMargin: "-20% 0px -45% 0px"
    })
  });

  /** -------------------------------------------------------------------------
   * UTILITÁRIOS
   * ---------------------------------------------------------------------- */

  /** Atalho seguro para querySelector. */
  const $ = (selector, scope = document) => scope.querySelector(selector);

  /** Atalho seguro para querySelectorAll convertido em Array. */
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector)
  ];

  /** Detecta preferência por movimento reduzido. */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /**
   * Limita callbacks de scroll/resize a um por frame de pintura.
   */
  const createRafScheduler = (callback) => {
    let frameId = 0;

    return (...args) => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        callback(...args);
      });
    };
  };

  /**
   * Agenda tarefas não críticas quando o navegador estiver ocioso.
   */
  const runWhenIdle = (callback, timeout = 1500) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout });
      return;
    }

    window.setTimeout(callback, 1);
  };

  /**
   * Emite eventos internos desacoplados.
   * O detail contém apenas dados técnicos e nunca informações pessoais.
   */
  const emit = (name, detail = {}) => {
    document.dispatchEvent(
      new CustomEvent(name, {
        bubbles: false,
        cancelable: false,
        detail
      })
    );
  };

  /** -------------------------------------------------------------------------
   * HEADER STICKY E NAVEGAÇÃO POR ÂNCORAS
   * ---------------------------------------------------------------------- */
  const initStickyHeader = () => {
    const header = $(CONFIG.selectors.header);
    if (!header) return;

    /** Sincroniza o offset real usado por :target e scroll programático. */
    const syncHeaderOffset = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--header-offset",
        `${height + 12}px`
      );
    };

    /** Aplica estado visual discreto após o início da rolagem. */
    const updateHeaderState = () => {
      const isScrolled = window.scrollY > CONFIG.scroll.headerThreshold;
      header.toggleAttribute("data-scrolled", isScrolled);
    };

    const scheduledHeaderUpdate = createRafScheduler(updateHeaderState);

    syncHeaderOffset();
    updateHeaderState();

    window.addEventListener("scroll", scheduledHeaderUpdate, {
      passive: true
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(syncHeaderOffset);
      resizeObserver.observe(header);
    } else {
      window.addEventListener("resize", createRafScheduler(syncHeaderOffset), {
        passive: true
      });
    }

    /**
     * Scroll suave com compensação do header e foco no destino.
     */
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const targetId = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header.getBoundingClientRect().height;
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        12;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion.matches ? "auto" : "smooth"
      });

      window.setTimeout(() => {
        target.focus({ preventScroll: true });
      }, prefersReducedMotion.matches ? 0 : 420);
    });
  };

  /** -------------------------------------------------------------------------
   * FAQ: APENAS UM ITEM ABERTO POR VEZ
   * ---------------------------------------------------------------------- */
  const initFaq = () => {
    const list = $(CONFIG.selectors.faqList);
    if (!list) return;

    const items = $$(CONFIG.selectors.faqItem);
    if (!items.length) return;

    items.forEach((details, index) => {
      const summary = $("summary", details);
      if (!summary) return;

      summary.setAttribute("aria-expanded", String(details.open));

      details.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(details.open));

        if (details.open) {
          items.forEach((otherItem) => {
            if (otherItem !== details && otherItem.open) {
              otherItem.open = false;
            }
          });
        }

        emit("tsp:faq-toggle", {
          question: summary.textContent.trim(),
          state: details.open ? "open" : "closed",
          position: index + 1
        });
      });
    });

    list.classList.add(CONFIG.classes.enhanced);
  };

  /** -------------------------------------------------------------------------
   * ANIMAÇÕES PROGRESSIVAS
   * Usadas somente quando Scroll-driven Animations não estiver disponível.
   * ---------------------------------------------------------------------- */
  const initRevealAnimations = () => {
    if (prefersReducedMotion.matches) return;

    const hasNativeScrollTimeline = window.CSS?.supports?.(
      "animation-timeline: view()"
    );
    if (hasNativeScrollTimeline) return;

    const targets = $$(CONFIG.selectors.revealTargets);
    if (!targets.length) return;

    if (
      !("IntersectionObserver" in window) ||
      !("animate" in Element.prototype)
    ) {
      return;
    }

    targets.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(22px)";
      element.style.willChange = "opacity, transform";
    });

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const siblings = element.parentElement
            ? [...element.parentElement.children]
            : [];
          const index = Math.max(0, siblings.indexOf(element));
          const delay = Math.min(index * 55, 220);

          element
            .animate(
              [
                { opacity: 0, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 520,
                delay,
                easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
                fill: "forwards"
              }
            )
            .finished.catch(() => {
              /* Cancelamentos de animação podem rejeitar a Promise. */
            })
            .finally(() => {
              element.style.opacity = "";
              element.style.transform = "";
              element.style.willChange = "";
            });

          currentObserver.unobserve(element);
        });
      },
      {
        rootMargin: CONFIG.observer.revealRootMargin,
        threshold: 0.12
      }
    );

    targets.forEach((element) => observer.observe(element));
  };

  /** -------------------------------------------------------------------------
   * LAZY LOADING DE IMAGENS
   * ---------------------------------------------------------------------- */
  const initLazyLoading = () => {
    const images = $$("img");
    if (!images.length) return;

    images.forEach((image) => {
      const isCritical =
        image.closest(CONFIG.selectors.hero) ||
        image.getAttribute("fetchpriority") === "high";

      if (!isCritical) {
        image.loading = "lazy";
        image.decoding = "async";
      }
    });

    const deferredImages = $$('img[data-src], img[data-srcset]');
    if (!deferredImages.length) return;

    const revealImage = (image) => {
      if (image.dataset.src) {
        image.src = image.dataset.src;
        delete image.dataset.src;
      }

      if (image.dataset.srcset) {
        image.srcset = image.dataset.srcset;
        delete image.dataset.srcset;
      }
    };

    if (!("IntersectionObserver" in window)) {
      deferredImages.forEach(revealImage);
      return;
    }

    const imageObserver = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          revealImage(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "320px 0px" }
    );

    deferredImages.forEach((image) => imageObserver.observe(image));
  };

  /** -------------------------------------------------------------------------
   * BOTÃO FLUTUANTE DO WHATSAPP
   * Reutiliza o href do CTA principal e o símbolo SVG inline existente.
   * ---------------------------------------------------------------------- */
  const initFloatingWhatsapp = () => {
    const sourceCta =
      $(CONFIG.selectors.primaryWhatsappCta) ||
      $(CONFIG.selectors.whatsappCta);

    const whatsappSymbol = $(CONFIG.selectors.whatsappSymbol);

    if (!sourceCta || !whatsappSymbol) return;

    const button = document.createElement("a");
    button.className = "floating-whatsapp";
    button.href = sourceCta.href;
    button.target = "_blank";
    button.rel = "noopener noreferrer external";
    button.dataset.cta = "whatsapp";
    button.dataset.ctaPosition = "floating";
    button.setAttribute(
      "aria-label",
      "Garantir Meu Ar Puro Agora pelo WhatsApp — abre em uma nova aba"
    );

    button.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href="#tsp-icon-whatsapp"></use>
      </svg>
      <span class="floating-whatsapp__label">Garantir Meu Ar Puro Agora</span>
    `;

    document.body.append(button);

    const hero = $(CONFIG.selectors.hero);
    const finalCta = $(CONFIG.selectors.finalCta);

    const visibility = {
      heroVisible: Boolean(hero),
      finalVisible: false
    };

    const updateVisibility = () => {
      const shouldShow =
        !visibility.heroVisible &&
        !visibility.finalVisible &&
        !document.hidden;

      button.classList.toggle(CONFIG.classes.visible, shouldShow);
      button.setAttribute("aria-hidden", String(!shouldShow));
      button.tabIndex = shouldShow ? 0 : -1;
    };

    if ("IntersectionObserver" in window && (hero || finalCta)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === hero) {
              visibility.heroVisible = entry.isIntersecting;
            }

            if (entry.target === finalCta) {
              visibility.finalVisible = entry.isIntersecting;
            }
          });

          updateVisibility();
        },
        { threshold: 0.08 }
      );

      if (hero) observer.observe(hero);
      if (finalCta) observer.observe(finalCta);
    } else {
      const updateFallback = () => {
        visibility.heroVisible = window.scrollY < window.innerHeight * 0.7;
        updateVisibility();
      };

      window.addEventListener("scroll", createRafScheduler(updateFallback), {
        passive: true
      });
      updateFallback();
    }

    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
  };

  /** -------------------------------------------------------------------------
   * BOTÃO VOLTAR AO TOPO
   * Usa caractere tipográfico, evitando criar um SVG fora do catálogo pedido.
   * ---------------------------------------------------------------------- */
  const initBackToTop = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.innerHTML = '<span aria-hidden="true">↑</span>';
    button.tabIndex = -1;

    document.body.append(button);

    const updateVisibility = () => {
      const shouldShow =
        window.scrollY > CONFIG.scroll.backToTopThreshold && !document.hidden;

      button.classList.toggle(CONFIG.classes.visible, shouldShow);
      button.setAttribute("aria-hidden", String(!shouldShow));
      button.tabIndex = shouldShow ? 0 : -1;
    };

    const scheduledUpdate = createRafScheduler(updateVisibility);

    window.addEventListener("scroll", scheduledUpdate, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth"
      });

      emit("tsp:back-to-top");
    });

    updateVisibility();
  };

  /** -------------------------------------------------------------------------
   * EVENTOS DE CONVERSÃO
   * ---------------------------------------------------------------------- */
  const initCtaTracking = () => {
    document.addEventListener("click", (event) => {
      const cta = event.target.closest(CONFIG.selectors.whatsappCta);
      if (!cta) return;

      emit("tsp:cta-click", {
        position: cta.dataset.ctaPosition || "unknown",
        label:
          cta.textContent.replace(/\s+/g, " ").trim() ||
          "Garantir Meu Ar Puro Agora"
      });
    });
  };

  /** -------------------------------------------------------------------------
   * VISUALIZAÇÕES DE SEÇÃO
   * ---------------------------------------------------------------------- */
  const initSectionTracking = () => {
    const sections = $$("main > section[id]");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const viewed = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || viewed.has(entry.target.id)) return;

          viewed.add(entry.target.id);

          const heading = entry.target.querySelector("h1, h2");
          emit("tsp:section-view", {
            sectionId: entry.target.id,
            sectionName: heading?.textContent.trim() || entry.target.id
          });
        });
      },
      {
        rootMargin: CONFIG.observer.sectionRootMargin,
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /** -------------------------------------------------------------------------
   * PROFUNDIDADE DE ROLAGEM
   * ---------------------------------------------------------------------- */
  const initScrollDepth = () => {
    const sent = new Set();

    const calculateDepth = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = Math.max(1, documentHeight - viewportHeight);
      const percent = Math.round((window.scrollY / scrollable) * 100);

      CONFIG.scroll.depthMarks.forEach((mark) => {
        if (percent < mark || sent.has(mark)) return;

        sent.add(mark);
        emit("tsp:scroll-depth", { percent: mark });
      });
    };

    const scheduledDepth = createRafScheduler(calculateDepth);

    window.addEventListener("scroll", scheduledDepth, { passive: true });
    window.addEventListener("resize", scheduledDepth, { passive: true });
    calculateDepth();
  };

  /** -------------------------------------------------------------------------
   * INICIALIZAÇÃO
   * ---------------------------------------------------------------------- */
  const init = () => {
    initStickyHeader();
    initFaq();
    initLazyLoading();
    initCtaTracking();

    runWhenIdle(() => {
      initRevealAnimations();
      initFloatingWhatsapp();
      initBackToTop();
      initSectionTracking();
      initScrollDepth();

      emit("tsp:app-ready", {
        version: CONFIG.version
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
