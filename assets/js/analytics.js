/**
 * Camada de mensuração preparada para GTM, GA4, Google Ads, Meta Pixel e Clarity.
 * IDs vazios mantêm as integrações desativadas, evitando requisições e duplicidade.
 */
(() => {
  'use strict';

  if (window.__TSP_ANALYTICS_INITIALIZED__) return;
  window.__TSP_ANALYTICS_INITIALIZED__ = true;

  const script = document.getElementById('tsp-analytics');
  if (!script) return;

  const config = {
    gtmId: script.dataset.gtmId?.trim() || '',
    ga4Id: script.dataset.ga4Id?.trim() || '',
    googleAdsId: script.dataset.googleAdsId?.trim() || '',
    googleAdsLabel: script.dataset.googleAdsLabel?.trim() || '',
    metaPixelId: script.dataset.metaPixelId?.trim() || '',
    clarityId: script.dataset.clarityId?.trim() || '',
    debug: script.dataset.debug === 'true'
  };

  const loaded = new Set();
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  const debugLog = (...args) => {
    if (config.debug) console.info('[TSP Analytics]', ...args);
  };

  const appendScript = (src, id, attributes = {}) => {
    if (!src || loaded.has(id) || document.getElementById(id)) return;
    const element = document.createElement('script');
    element.id = id;
    element.async = true;
    element.src = src;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
    loaded.add(id);
  };

  const loadGoogle = () => {
    if (config.gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      appendScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`, 'tsp-gtm');
      return;
    }

    const primaryId = config.ga4Id || config.googleAdsId;
    if (!primaryId) return;

    appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`, 'tsp-gtag');
    window.gtag('js', new Date());

    if (config.ga4Id) {
      window.gtag('config', config.ga4Id, {
        send_page_view: true,
        allow_google_signals: false
      });
    }

    if (config.googleAdsId) {
      window.gtag('config', config.googleAdsId);
    }
  };

  const loadMeta = () => {
    if (!config.metaPixelId || window.fbq) return;

    /* Inicialização oficial do Meta Pixel, executada apenas com consentimento. */
    window.fbq = function fbq() {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];

    appendScript('https://connect.facebook.net/en_US/fbevents.js', 'tsp-meta-pixel');
    window.fbq('init', config.metaPixelId);
    window.fbq('track', 'PageView');
  };

  const loadClarity = () => {
    if (!config.clarityId || window.clarity) return;

    window.clarity = function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    appendScript(`https://www.clarity.ms/tag/${encodeURIComponent(config.clarityId)}`, 'tsp-clarity');
  };

  const applyConsent = (state) => {
    if (state.analytics) {
      loadGoogle();
      loadClarity();
    }
    if (state.marketing) loadMeta();
    debugLog('Consentimento aplicado', state);
  };

  /** API pública e estável para eventos de interação. */
  window.tspTrack = (eventName, parameters = {}) => {
    const eventData = {
      event: eventName,
      ...parameters,
      event_timestamp: Date.now()
    };

    window.dataLayer.push(eventData);

    const consent = window.tspConsent?.get?.() || { analytics: false, marketing: false };

    if (consent.analytics && config.ga4Id && !config.gtmId) {
      window.gtag('event', eventName, parameters);
    }

    if (eventName === 'whatsapp_click' && consent.marketing && config.googleAdsId && config.googleAdsLabel && !config.gtmId) {
      window.gtag('event', 'conversion', {
        send_to: `${config.googleAdsId}/${config.googleAdsLabel}`,
        event_callback: () => undefined
      });
    }

    if (eventName === 'whatsapp_click' && consent.marketing && window.fbq) {
      window.fbq('trackCustom', 'WhatsAppClick', parameters);
    }

    debugLog('Evento', eventName, parameters);
  };

  window.addEventListener('tsp:consent', (event) => applyConsent(event.detail));
  applyConsent(window.tspConsent?.get?.() || { analytics: false, marketing: false });
})();
