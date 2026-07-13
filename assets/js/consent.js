/**
 * ==========================================================================
 * TOTAL SOLUÇÕES PREDIAIS — CONSENT.JS
 * Google Consent Mode v2, preferência local e interface acessível.
 * ==========================================================================
 */
(() => {
  "use strict";

  const CONFIG = Object.freeze({
    storageKey: "tsp_consent_preferences",
    version: "2.0",
    ids: Object.freeze({
      banner: "tsp-consent-banner",
      dialog: "tsp-consent-dialog",
      analytics: "tsp-consent-analytics",
      marketing: "tsp-consent-marketing"
    })
  });

  const defaultState = Object.freeze({
    necessary: true,
    analytics: false,
    marketing: false,
    hasDecision: false,
    version: CONFIG.version,
    source: "default"
  });

  let state = { ...defaultState };
  let previousFocus = null;

  const ensureDataLayer = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  };

  /** Consentimento opcional começa negado antes de qualquer tag externa. */
  const setDefaultConsent = () => {
    ensureDataLayer();
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      personalization_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500
    });
  };

  const updateGoogleConsent = () => {
    ensureDataLayer();
    window.gtag("consent", "update", {
      analytics_storage: state.analytics ? "granted" : "denied",
      ad_storage: state.marketing ? "granted" : "denied",
      ad_user_data: state.marketing ? "granted" : "denied",
      ad_personalization: state.marketing ? "granted" : "denied",
      personalization_storage: state.marketing ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted"
    });
  };

  const publicState = () => ({ ...state });

  const readStored = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "null");
      if (!parsed || parsed.version !== CONFIG.version) return null;
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        hasDecision: true,
        version: CONFIG.version,
        source: "stored"
      };
    } catch { return null; }
  };

  const persist = () => {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        version: CONFIG.version,
        analytics: state.analytics,
        marketing: state.marketing
      }));
    } catch { /* A preferência continua válida na sessão atual. */ }
  };

  const emit = (source) => {
    window.TSP_CONSENT = publicState();
    window.dispatchEvent(new CustomEvent("tsp:consent-updated", { detail: { ...publicState(), source } }));
  };

  const syncDocument = () => {
    document.documentElement.dataset.consentDecision = state.hasDecision ? "decided" : "pending";
    document.documentElement.dataset.consentAnalytics = state.analytics ? "granted" : "denied";
    document.documentElement.dataset.consentMarketing = state.marketing ? "granted" : "denied";
  };

  const createBanner = () => {
    let banner = document.getElementById(CONFIG.ids.banner);
    if (banner) return banner;
    banner = document.createElement("section");
    banner.id = CONFIG.ids.banner;
    banner.className = "tsp-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Preferências de privacidade");
    banner.innerHTML = `
      <div class="tsp-consent__content">
        <h2 class="tsp-consent__title">Preferências de privacidade</h2>
        <p class="tsp-consent__text">Tecnologias opcionais medem uso, conversões publicitárias e desempenho. Você pode aceitar, recusar ou personalizar. Recursos necessários permanecem ativos.</p>
      </div>
      <div class="tsp-consent__actions">
        <button type="button" class="tsp-consent__button" data-consent-action="necessary">Somente necessários</button>
        <button type="button" class="tsp-consent__button" data-consent-action="customize">Personalizar</button>
        <button type="button" class="tsp-consent__button tsp-consent__button--primary" data-consent-action="accept-all">Aceitar todos</button>
      </div>`;
    document.body.append(banner);
    return banner;
  };

  const createDialog = () => {
    let dialog = document.getElementById(CONFIG.ids.dialog);
    if (dialog) return dialog;
    dialog = document.createElement("div");
    dialog.id = CONFIG.ids.dialog;
    dialog.className = "tsp-consent-dialog";
    dialog.hidden = true;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "tsp-consent-dialog-title");
    dialog.innerHTML = `
      <div class="tsp-consent-dialog__panel" tabindex="-1">
        <header class="tsp-consent-dialog__header">
          <h2 id="tsp-consent-dialog-title">Personalizar preferências</h2>
          <button type="button" class="tsp-consent-dialog__close" data-consent-action="close" aria-label="Fechar preferências">×</button>
        </header>
        <p class="tsp-consent-dialog__intro">Escolha quais categorias opcionais podem ser ativadas neste navegador.</p>
        <div class="tsp-consent-option"><div><h3>Necessários</h3><p>Funcionamento básico e armazenamento da sua escolha.</p></div><button type="button" class="tsp-consent-switch" role="switch" aria-checked="true" disabled aria-label="Recursos necessários sempre ativos"></button></div>
        <div class="tsp-consent-option"><div><h3>Analytics</h3><p>GA4 e Microsoft Clarity, quando configurados.</p></div><button type="button" id="${CONFIG.ids.analytics}" class="tsp-consent-switch" role="switch" aria-checked="false" data-consent-toggle="analytics" aria-label="Permitir analytics"></button></div>
        <div class="tsp-consent-option"><div><h3>Marketing</h3><p>Google Ads, remarketing, Meta Pixel e dados publicitários, quando configurados.</p></div><button type="button" id="${CONFIG.ids.marketing}" class="tsp-consent-switch" role="switch" aria-checked="false" data-consent-toggle="marketing" aria-label="Permitir marketing"></button></div>
        <div class="tsp-consent-dialog__actions"><button type="button" class="tsp-consent__button" data-consent-action="necessary">Somente necessários</button><button type="button" class="tsp-consent__button tsp-consent__button--primary" data-consent-action="save">Salvar preferências</button></div>
      </div>`;
    document.body.append(dialog);
    return dialog;
  };

  const focusable = (container) => [...container.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hidden);

  const openDialog = () => {
    const dialog = createDialog();
    previousFocus = document.activeElement;
    document.getElementById(CONFIG.ids.analytics).setAttribute("aria-checked", String(state.analytics));
    document.getElementById(CONFIG.ids.marketing).setAttribute("aria-checked", String(state.marketing));
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    dialog.querySelector(".tsp-consent-dialog__panel")?.focus();
  };

  const closeDialog = () => {
    const dialog = document.getElementById(CONFIG.ids.dialog);
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = "";
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  const apply = (analytics, marketing, source) => {
    state = { necessary: true, analytics: Boolean(analytics), marketing: Boolean(marketing), hasDecision: true, version: CONFIG.version, source };
    persist();
    updateGoogleConsent();
    syncDocument();
    createBanner().hidden = true;
    closeDialog();
    emit(source);
  };

  const handleAction = (action) => {
    if (action === "accept-all") apply(true, true, "accept_all");
    if (action === "necessary") apply(false, false, "necessary_only");
    if (action === "customize") openDialog();
    if (action === "close") closeDialog();
    if (action === "save") apply(
      document.getElementById(CONFIG.ids.analytics)?.getAttribute("aria-checked") === "true",
      document.getElementById(CONFIG.ids.marketing)?.getAttribute("aria-checked") === "true",
      "custom"
    );
  };

  const bind = () => {
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-consent-open]");
      if (open) { openDialog(); return; }
      const toggle = event.target.closest("[data-consent-toggle]");
      if (toggle && !toggle.disabled) {
        toggle.setAttribute("aria-checked", String(toggle.getAttribute("aria-checked") !== "true"));
        return;
      }
      const action = event.target.closest("[data-consent-action]");
      if (action) handleAction(action.dataset.consentAction);
      const dialog = document.getElementById(CONFIG.ids.dialog);
      if (dialog && event.target === dialog) closeDialog();
    });

    document.addEventListener("keydown", (event) => {
      const dialog = document.getElementById(CONFIG.ids.dialog);
      if (event.key === "Escape") { closeDialog(); return; }
      if (!dialog || dialog.hidden || event.key !== "Tab") return;
      const items = focusable(dialog);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    });
  };

  const expose = () => {
    window.TSPConsent = Object.freeze({
      getState: publicState,
      open: openDialog,
      reset: () => {
        try { localStorage.removeItem(CONFIG.storageKey); } catch { /* sem ação adicional */ }
        state = { ...defaultState };
        setDefaultConsent();
        syncDocument();
        createBanner().hidden = false;
        emit("reset");
      }
    });
  };

  const init = () => {
    setDefaultConsent();
    const stored = readStored();
    if (stored) { state = stored; updateGoogleConsent(); }
    window.TSP_CONSENT = publicState();
    syncDocument();
    createDialog();
    const banner = createBanner();
    banner.hidden = state.hasDecision;
    bind();
    expose();
    emit(state.source);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
