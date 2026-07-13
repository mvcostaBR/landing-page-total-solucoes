/**
 * ==========================================================================
 * TOTAL SOLUÇÕES PREDIAIS — APP.JS
 * Interface, acessibilidade e emissão de eventos técnicos sem dados pessoais.
 * ==========================================================================
 */
(() => {
  "use strict";

  const CONFIG = Object.freeze({
    version: "2.0.0-google-ads",
    selectors: Object.freeze({
      header: ".site-header",
      hero: ".hero",
      finalCta: ".final-cta",
      faqItem: ".faq__list details",
      whatsappCta: '[data-cta="whatsapp"]',
      primaryWhatsappCta: '[data-cta="whatsapp"][data-cta-position="hero"]'
    }),
    scroll: Object.freeze({ backToTopThreshold: 720, depthMarks: [25, 50, 75, 90] })
  });

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Emite eventos desacoplados. O detail contém somente metadados técnicos. */
  const emit = (name, detail = {}) => {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  };

  /** Limita atualizações de scroll a um callback por frame. */
  const rafSchedule = (callback) => {
    let frame = 0;
    return (...args) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        callback(...args);
      });
    };
  };

  /** Compensa o header sticky e preserva foco para navegação por teclado. */
  const initAnchorNavigation = () => {
    const header = $(CONFIG.selectors.header);
    if (!header) return;

    const syncOffset = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-offset", `${height + 12}px`);
    };

    syncOffset();
    if ("ResizeObserver" in window) new ResizeObserver(syncOffset).observe(header);

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + scrollY - header.offsetHeight - 12;
      scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? "auto" : "smooth" });
      setTimeout(() => target.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 420);
    });
  };

  /** Mantém somente uma resposta da FAQ aberta por vez e registra abertura. */
  const initFaq = () => {
    const items = $$(CONFIG.selectors.faqItem);
    items.forEach((details, index) => {
      const summary = $("summary", details);
      if (!summary) return;
      summary.setAttribute("aria-expanded", String(details.open));
      details.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(details.open));
        if (details.open) {
          items.forEach((other) => { if (other !== details) other.open = false; });
          emit("tsp:faq-open", { faq_position: index + 1, faq_question: summary.textContent.trim() });
        }
      });
    });
  };

  /** Emite a conversão de clique antes da abertura da nova aba do WhatsApp. */
  const initCtaTracking = () => {
    document.addEventListener("click", (event) => {
      const cta = event.target.closest(CONFIG.selectors.whatsappCta);
      if (!cta) return;
      emit("tsp:cta-click", {
        cta_type: cta.dataset.ctaType || "unknown",
        cta_position: cta.dataset.ctaPosition || "unknown",
        cta_label: cta.textContent.replace(/\s+/g, " ").trim(),
        service_variant: cta.dataset.serviceVariant || "split_residencial"
      });
    }, { capture: true });
  };

  /** Cria CTA flutuante reutilizando exatamente o link principal existente. */
  const initFloatingWhatsapp = () => {
    const source = $(CONFIG.selectors.primaryWhatsappCta) || $(CONFIG.selectors.whatsappCta);
    if (!source) return;

    const link = document.createElement("a");
    link.className = "floating-whatsapp";
    link.href = source.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer external";
    link.dataset.cta = "whatsapp";
    link.dataset.ctaType = "primary";
    link.dataset.ctaPosition = "floating";
    link.dataset.serviceVariant = "split_residencial";
    link.setAttribute("aria-label", "Garantir Meu Ar Puro Agora pelo WhatsApp, abre em nova aba");
    link.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-whatsapp"></use></svg><span class="floating-whatsapp__label">Garantir Meu Ar Puro Agora</span>';
    document.body.append(link);

    const hero = $(CONFIG.selectors.hero);
    const finalCta = $(CONFIG.selectors.finalCta);
    const visibility = { hero: Boolean(hero), final: false };
    const update = () => {
      const visible = !visibility.hero && !visibility.final && !document.hidden;
      link.classList.toggle("is-visible", visible);
      link.tabIndex = visible ? 0 : -1;
      link.setAttribute("aria-hidden", String(!visible));
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === hero) visibility.hero = entry.isIntersecting;
          if (entry.target === finalCta) visibility.final = entry.isIntersecting;
        });
        update();
      }, { threshold: .08 });
      if (hero) observer.observe(hero);
      if (finalCta) observer.observe(finalCta);
    }
    document.addEventListener("visibilitychange", update);
    update();
  };

  /** Cria controle acessível de retorno ao topo. */
  const initBackToTop = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.innerHTML = '<span aria-hidden="true">↑</span>';
    document.body.append(button);

    const update = rafSchedule(() => {
      const visible = scrollY > CONFIG.scroll.backToTopThreshold && !document.hidden;
      button.classList.toggle("is-visible", visible);
      button.tabIndex = visible ? 0 : -1;
      button.setAttribute("aria-hidden", String(!visible));
    });
    addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => {
      scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
      emit("tsp:back-to-top", { source: "floating_button" });
    });
    update();
  };

  /** Registra visualização de seções uma única vez, sem conteúdo pessoal. */
  const initSectionViews = () => {
    if (!("IntersectionObserver" in window)) return;
    const viewed = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || viewed.has(entry.target.id)) return;
        viewed.add(entry.target.id);
        emit("tsp:section-view", {
          section_id: entry.target.id,
          section_name: entry.target.querySelector("h1, h2")?.textContent.trim() || entry.target.id
        });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "-20% 0px -45% 0px", threshold: 0 });
    $$("main > section[id]").forEach((section) => observer.observe(section));
  };

  /** Registra marcos de profundidade, não o histórico completo de rolagem. */
  const initScrollDepth = () => {
    const sent = new Set();
    const calculate = rafSchedule(() => {
      const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const percent = Math.round((scrollY / available) * 100);
      CONFIG.scroll.depthMarks.forEach((mark) => {
        if (percent >= mark && !sent.has(mark)) {
          sent.add(mark);
          emit("tsp:scroll-depth", { percent_scrolled: mark });
        }
      });
    });
    addEventListener("scroll", calculate, { passive: true });
  };

  /** Imagens não críticas recebem carregamento e decodificação diferidos. */
  const initLazyImages = () => {
    $$("img").forEach((image) => {
      if (!image.closest(".hero") && image.getAttribute("fetchpriority") !== "high") {
        image.loading = "lazy";
        image.decoding = "async";
      }
    });
  };

  const init = () => {
    initAnchorNavigation();
    initFaq();
    initCtaTracking();
    initLazyImages();
    initFloatingWhatsapp();
    initBackToTop();
    initSectionViews();
    initScrollDepth();
    emit("tsp:app-ready", { app_version: CONFIG.version });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
