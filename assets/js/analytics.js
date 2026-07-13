/**
 * ==========================================================================
 * TOTAL SOLUÇÕES PREDIAIS — ANALYTICS.JS
 * GTM, GA4, Google Ads, remarketing, Meta Pixel e Microsoft Clarity.
 * ==========================================================================
 *
 * Regras de segurança:
 * - nenhum ID é inventado; configure os atributos data-* no index.html;
 * - nenhum nome, e-mail, telefone, mensagem ou URL completa é enviado;
 * - Enhanced Conversions permanece desativado porque a página não coleta
 *   dados primários do usuário e não possui formulário;
 * - com GTM configurado, as integrações diretas ficam desativadas;
 * - tags externas são carregadas somente após consentimento correspondente.
 */
(() => {
  "use strict";

  const script = document.getElementById("tsp-analytics");
  const config = Object.freeze({
    gtmId: script?.dataset.gtmId?.trim() || "",
    ga4Id: script?.dataset.ga4Id?.trim() || "",
    googleAdsId: script?.dataset.googleAdsId?.trim() || "",
    googleAdsLabel: script?.dataset.googleAdsLabel?.trim() || "",
    metaPixelId: script?.dataset.metaPixelId?.trim() || "",
    clarityId: script?.dataset.clarityId?.trim() || "",
    debug: script?.dataset.debug === "true"
  });

  const patterns = Object.freeze({
    gtm: /^GTM-[A-Z0-9]+$/i,
    ga4: /^G-[A-Z0-9]+$/i,
    ads: /^AW-\d+$/i,
    adsLabel: /^[A-Za-z0-9_-]{4,80}$/,
    meta: /^\d{5,20}$/,
    clarity: /^[a-z0-9]{5,30}$/i
  });

  const valid = (type, value) => Boolean(value && patterns[type].test(value));
  const usesGtm = valid("gtm", config.gtmId);
  const loaded = { gtm: false, google: false, ga4Configured: false, adsConfigured: false, meta: false, clarity: false };
  let googlePromise = null;
  let consent = { necessary: true, analytics: false, marketing: false, hasDecision: false };

  const debug = (...args) => { if (config.debug) console.info("[TSP Analytics]", ...args); };

  const ensureDataLayer = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  };

  /** Bloqueia parâmetros com possível dado pessoal e limita tamanho. */
  const sanitize = (params = {}) => {
    const blocked = new Set(["name", "nome", "email", "phone", "telefone", "message", "mensagem", "href", "url", "full_url", "gclid", "wbraid", "gbraid"]);
    return Object.entries(params).reduce((safe, [key, value]) => {
      if (blocked.has(key.toLowerCase())) return safe;
      if (!["string", "number", "boolean"].includes(typeof value)) return safe;
      safe[key] = typeof value === "string" ? value.slice(0, 160) : value;
      return safe;
    }, {});
  };

  const pushDataLayer = (event, params = {}) => {
    ensureDataLayer();
    window.dataLayer.push({ event, ...sanitize(params) });
  };

  /** Captura apenas UTMs conhecidos e indicadores de auto-tagging. */
  const getAttribution = () => {
    const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content", "utm_source_platform", "network", "device", "matchtype", "adgroupid"];
    const query = new URLSearchParams(location.search);
    const clean = (value) => String(value || "").replace(/[^\w.~-]/g, "_").slice(0, 120);
    const current = Object.fromEntries(allowed.map((key) => [key, clean(query.get(key))]).filter(([, value]) => value));

    try {
      if (Object.keys(current).length) sessionStorage.setItem("tsp_campaign_attribution", JSON.stringify(current));
      const stored = JSON.parse(sessionStorage.getItem("tsp_campaign_attribution") || "{}");
      return {
        ...stored,
        gclid_present: query.has("gclid"),
        wbraid_present: query.has("wbraid"),
        gbraid_present: query.has("gbraid")
      };
    } catch {
      return { ...current, gclid_present: query.has("gclid"), wbraid_present: query.has("wbraid"), gbraid_present: query.has("gbraid") };
    }
  };

  const appendScript = (id, src) => {
    if (document.getElementById(id)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.id = id;
      tag.async = true;
      tag.src = src;
      tag.addEventListener("load", resolve, { once: true });
      tag.addEventListener("error", () => reject(new Error(`Falha ao carregar ${id}`)), { once: true });
      document.head.append(tag);
    });
  };

  /** GTM é carregado quando Analytics ou Marketing foi autorizado. */
  const loadGtm = async () => {
    if (loaded.gtm || !usesGtm || (!consent.analytics && !consent.marketing)) return;
    ensureDataLayer();
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    try {
      await appendScript("tsp-gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`);
      loaded.gtm = true;
      debug("GTM carregado");
    } catch (error) { debug(error.message); }
  };

  /** Um único gtag.js atende GA4 e Google Ads no modo direto. */
  const loadGoogleTag = () => {
    if (usesGtm) return Promise.resolve();
    if (googlePromise) return googlePromise;
    const bootstrapId = valid("ga4", config.ga4Id) ? config.ga4Id : config.googleAdsId;
    if (!bootstrapId) return Promise.resolve();
    ensureDataLayer();
    window.gtag("js", new Date());
    googlePromise = appendScript("tsp-google-tag", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(bootstrapId)}`)
      .then(() => { loaded.google = true; });
    return googlePromise;
  };

  const configureGa4 = async () => {
    if (usesGtm || loaded.ga4Configured || !consent.analytics || !valid("ga4", config.ga4Id)) return;
    try {
      await loadGoogleTag();
      window.gtag("config", config.ga4Id, {
        send_page_view: true,
        allow_google_signals: consent.marketing,
        allow_ad_personalization_signals: consent.marketing
      });
      loaded.ga4Configured = true;
    } catch (error) { debug(error.message); }
  };

  /** A configuração AW em todas as páginas habilita mensuração e listas gerais. */
  const configureGoogleAds = async () => {
    if (usesGtm || loaded.adsConfigured || !consent.marketing || !valid("ads", config.googleAdsId)) return;
    try {
      await loadGoogleTag();
      window.gtag("config", config.googleAdsId, { send_page_view: true });
      loaded.adsConfigured = true;
    } catch (error) { debug(error.message); }
  };

  const loadMeta = async () => {
    if (usesGtm || loaded.meta || !consent.marketing || !valid("meta", config.metaPixelId)) return;
    if (!window.fbq) {
      const fbq = function fbq() { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; window.fbq = fbq;
    }
    try {
      await appendScript("tsp-meta", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", config.metaPixelId);
      window.fbq("consent", "grant");
      window.fbq("track", "PageView");
      loaded.meta = true;
    } catch (error) { debug(error.message); }
  };

  const loadClarity = async () => {
    if (usesGtm || loaded.clarity || !consent.analytics || !valid("clarity", config.clarityId)) return;
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
    try {
      await appendScript("tsp-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(config.clarityId)}`);
      window.clarity("consentv2", { ad_Storage: consent.marketing ? "granted" : "denied", analytics_Storage: "granted" });
      loaded.clarity = true;
    } catch (error) { debug(error.message); }
  };

  /** Atualiza fornecedores já carregados quando o visitante revoga ou concede. */
  const syncLoadedConsent = () => {
    if (!usesGtm && loaded.meta && typeof window.fbq === "function") {
      window.fbq("consent", consent.marketing ? "grant" : "revoke");
    }

    if (!usesGtm && loaded.clarity && typeof window.clarity === "function") {
      window.clarity("consentv2", {
        ad_Storage: consent.marketing ? "granted" : "denied",
        analytics_Storage: consent.analytics ? "granted" : "denied"
      });
    }
  };

  const syncVendors = () => {
    syncLoadedConsent();
    if (usesGtm) { loadGtm(); return; }
    if (consent.analytics) { configureGa4(); loadClarity(); }
    if (consent.marketing) { configureGoogleAds(); loadMeta(); }
  };

  /**
   * Conversão principal da página: clique em CTA de WhatsApp.
   * Eventos são separados por finalidade para que GTM respeite consentimento.
   */
  const trackCta = (detail = {}) => {
    const params = sanitize({
      method: "whatsapp",
      lead_channel: "whatsapp",
      cta_type: detail.cta_type || "unknown",
      cta_position: detail.cta_position || "unknown",
      cta_label: detail.cta_label || "Garantir Meu Ar Puro Agora",
      service: "higienizacao_split_residencial",
      service_variant: detail.service_variant || "split_residencial",
      page_path: location.pathname,
      ...getAttribution()
    });

    if (consent.analytics) {
      pushDataLayer("whatsapp_click", params);
      pushDataLayer("generate_lead", params);
      if (!usesGtm) {
        Promise.resolve(configureGa4()).then(() => {
          if (!loaded.ga4Configured || !consent.analytics) return;
          window.gtag("event", "whatsapp_click", params);
          window.gtag("event", "generate_lead", params);
        }).catch((error) => debug(error.message));
      }
      if (loaded.clarity) window.clarity?.("event", "whatsapp_click");
    }

    if (consent.marketing) {
      pushDataLayer("google_ads_whatsapp_conversion", params);
      if (!usesGtm && valid("adsLabel", config.googleAdsLabel)) {
        Promise.resolve(configureGoogleAds()).then(() => {
          if (!loaded.adsConfigured || !consent.marketing) return;
          window.gtag("event", "conversion", {
            send_to: `${config.googleAdsId}/${config.googleAdsLabel}`
          });
        }).catch((error) => debug(error.message));
      }

      if (!usesGtm) {
        Promise.resolve(loadMeta()).then(() => {
          if (!loaded.meta || !consent.marketing) return;
          window.fbq("track", "Lead", {
            content_name: "Higienização de Ar Condicionado Residencial Split"
          });
        }).catch((error) => debug(error.message));
      }
    }
  };

  const bindApplicationEvents = () => {
    document.addEventListener("tsp:cta-click", (event) => trackCta(event.detail));
    document.addEventListener("tsp:faq-open", (event) => {
      if (!consent.analytics) return;
      const params = sanitize(event.detail);
      pushDataLayer("faq_open", params);
      if (!usesGtm && loaded.ga4Configured) window.gtag("event", "faq_open", params);
    });
    document.addEventListener("tsp:section-view", (event) => {
      if (!consent.analytics) return;
      const params = sanitize(event.detail);
      pushDataLayer("section_view", params);
      if (!usesGtm && loaded.ga4Configured) window.gtag("event", "section_view", params);
    });
    document.addEventListener("tsp:scroll-depth", (event) => {
      if (!consent.analytics) return;
      const params = sanitize(event.detail);
      pushDataLayer("scroll_depth", params);
      if (!usesGtm && loaded.ga4Configured) window.gtag("event", "scroll_depth", params);
    });
  };

  const updateConsent = (event) => {
    consent = {
      necessary: true,
      analytics: Boolean(event.detail?.analytics),
      marketing: Boolean(event.detail?.marketing),
      hasDecision: Boolean(event.detail?.hasDecision)
    };
    syncVendors();
    pushDataLayer("consent_update", {
      analytics_consent: consent.analytics,
      marketing_consent: consent.marketing,
      consent_source: event.detail?.source || "unknown"
    });
  };

  const expose = () => {
    window.TSPAnalytics = Object.freeze({
      getConfig: () => ({
        hasGtm: valid("gtm", config.gtmId),
        hasGa4: valid("ga4", config.ga4Id),
        hasGoogleAds: valid("ads", config.googleAdsId),
        hasGoogleAdsLabel: valid("adsLabel", config.googleAdsLabel),
        hasMetaPixel: valid("meta", config.metaPixelId),
        hasClarity: valid("clarity", config.clarityId),
        enhancedConversions: false
      }),
      getState: () => ({ consent: { ...consent }, loaded: { ...loaded } }),
      trackCta
    });
  };

  const init = () => {
    ensureDataLayer();
    consent = window.TSPConsent?.getState?.() || window.TSP_CONSENT || consent;
    bindApplicationEvents();
    expose();
    syncVendors();
    window.addEventListener("tsp:consent-updated", updateConsent);
    pushDataLayer("analytics_ready", {
      integration_mode: usesGtm ? "gtm" : "direct_or_disabled",
      analytics_consent: Boolean(consent.analytics),
      marketing_consent: Boolean(consent.marketing),
      enhanced_conversions: false
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
