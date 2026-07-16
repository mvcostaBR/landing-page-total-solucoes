/**
 * Camada de mensuração preparada para GTM, GA4, Google Ads, Meta Pixel e
 * Microsoft Clarity.
 *
 * IDs vazios mantêm as integrações desativadas durante a homologação.
 * A implementação respeita Consent Mode v2, não envia dados pessoais e não
 * transmite os valores brutos de identificadores de clique.
 */
(() => {
  'use strict';

  /** Evita inicialização duplicada. */
  if (window.__TSP_ANALYTICS_INITIALIZED__) return;
  window.__TSP_ANALYTICS_INITIALIZED__ = true;

  const script = document.getElementById('tsp-analytics');
  if (!script) return;

  /** Configuração lida exclusivamente dos atributos do script no HTML. */
  const config = {
    gtmId: script.dataset.gtmId?.trim() || '',
    ga4Id: script.dataset.ga4Id?.trim() || '',
    googleAdsId: script.dataset.googleAdsId?.trim() || '',
    googleAdsLabel: script.dataset.googleAdsLabel?.trim() || '',
    metaPixelId: script.dataset.metaPixelId?.trim() || '',
    clarityId: script.dataset.clarityId?.trim() || '',
    debug: script.dataset.debug === 'true',
    enhancedConversions: false
  };

  const ATTRIBUTION_STORAGE_KEY = 'tsp-attribution-v1';
  const ALLOWED_ATTRIBUTION = Object.freeze([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_id',
    'utm_term',
    'utm_content',
    'utm_source_platform',
    'network',
    'device',
    'matchtype',
    'adgroupid'
  ]);
  const CLICK_IDS = Object.freeze(["gclid", "wbraid", "gbraid"]);
  const CLICK_ID_FLAGS = Object.freeze({
    gclid: "gclid_present",
    wbraid: "wbraid_present",
    gbraid: "gbraid_present"
  });
  const FORBIDDEN_KEYS = new Set([
    'name',
    'nome',
    'email',
    'phone',
    'telefone',
    'message',
    'mensagem',
    'full_url',
    ...CLICK_IDS
  ]);

  const loaded = new Set();
  const configured = new Set();
  let gtagInitialized = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  /** Log opcional para ambiente de desenvolvimento. */
  const debugLog = (...args) => {
    if (config.debug) console.info('[TSP Analytics]', ...args);
  };

  /** Normaliza valores curtos antes de colocá-los na camada de dados. */
  const sanitizeValue = (value) => {
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value !== 'string') return undefined;

    const normalized = value.trim().slice(0, 160);
    return normalized || undefined;
  };

  /** Remove chaves proibidas e valores não escalares. */
  const sanitizeParameters = (parameters = {}) => Object.entries(parameters)
    .reduce((result, [key, value]) => {
      if (FORBIDDEN_KEYS.has(key)) return result;

      const sanitized = sanitizeValue(value);
      if (sanitized !== undefined) result[key] = sanitized;
      return result;
    }, {});

  /** Lê atribuição salva sem interromper navegadores em modo restritivo. */
  const readStoredAttribution = () => {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}');
      return sanitizeParameters(parsed);
    } catch {
      return {};
    }
  };

  /**
   * Captura somente parâmetros permitidos.
   * Identificadores de clique são convertidos em indicadores booleanos.
   */
  const captureAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    const attribution = readStoredAttribution();

    ALLOWED_ATTRIBUTION.forEach((key) => {
      const value = sanitizeValue(params.get(key) || '');
      if (value !== undefined) attribution[key] = value;
    });

    Object.entries(CLICK_ID_FLAGS).forEach(([key, flag]) => {
      attribution[flag] = params.has(key) || Boolean(attribution[flag]);
    });

    try {
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      /* A atribuição permanece disponível apenas na memória desta página. */
    }

    return attribution;
  };

  const attribution = captureAttribution();

  /** Insere scripts externos uma única vez. */
  const appendScript = (src, id, attributes = {}) => {
    if (!src || loaded.has(id) || document.getElementById(id)) return;

    const element = document.createElement('script');
    element.id = id;
    element.async = true;
    element.src = src;

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    document.head.appendChild(element);
    loaded.add(id);
  };

  /** Inicializa GTM ou gtag conforme consentimento e IDs oficiais disponíveis. */
  const loadGoogle = (state) => {
    if (!state.analytics && !state.marketing) return;

    if (config.gtmId) {
      if (!loaded.has('tsp-gtm')) {
        window.dataLayer.push({
          'gtm.start': Date.now(),
          event: 'gtm.js'
        });

        appendScript(
          `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`,
          'tsp-gtm'
        );
      }
      return;
    }

    const primaryId = (state.analytics && config.ga4Id)
      || (state.marketing && config.googleAdsId);

    if (!primaryId) return;

    appendScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`,
      'tsp-gtag'
    );

    if (!gtagInitialized) {
      window.gtag('js', new Date());
      gtagInitialized = true;
    }

    if (state.analytics && config.ga4Id && !configured.has(config.ga4Id)) {
      window.gtag('config', config.ga4Id, {
        send_page_view: true,
        allow_google_signals: false
      });
      configured.add(config.ga4Id);
    }

    if (state.marketing && config.googleAdsId && !configured.has(config.googleAdsId)) {
      window.gtag('config', config.googleAdsId, {
        allow_enhanced_conversions: false
      });
      configured.add(config.googleAdsId);
    }
  };

  /** Carrega o Meta Pixel somente após consentimento de marketing. */
  const loadMeta = () => {
    if (!config.metaPixelId || window.fbq) return;

    window.fbq = function fbq() {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
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

  /** Carrega o Microsoft Clarity somente após consentimento de análise. */
  const loadClarity = () => {
    if (!config.clarityId || window.clarity) return;

    window.clarity = function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    appendScript(
      `https://www.clarity.ms/tag/${encodeURIComponent(config.clarityId)}`,
      'tsp-clarity'
    );
  };

  /** Aplica as integrações permitidas pela escolha atual. */
  const applyConsent = (state) => {
    loadGoogle(state);

    if (state.analytics) loadClarity();
    if (state.marketing) loadMeta();

    debugLog('Consentimento aplicado', state);
  };

  /** Coloca um evento sanitizado na camada de dados. */
  const pushEvent = (eventName, parameters) => {
    const eventData = {
      event: eventName,
      ...sanitizeParameters(parameters),
      event_timestamp: Date.now()
    };

    window.dataLayer.push(eventData);
    return eventData;
  };

  /** Envia um evento diretamente ao GA4 quando GTM não está em uso. */
  const sendDirectGa4 = (eventName, parameters) => {
    if (!config.ga4Id || config.gtmId) return;
    window.gtag('event', eventName, sanitizeParameters(parameters));
  };

  /**
   * API pública para eventos de interação e conversão.
   * Um clique no WhatsApp gera sinais separados para diagnóstico, GA4 e Ads.
   */
  window.tspTrack = (eventName, parameters = {}) => {
    const consent = window.tspConsent?.get?.() || {
      analytics: false,
      marketing: false
    };
    const cleanParameters = sanitizeParameters(parameters);
    const common = {
      ...cleanParameters,
      ...attribution
    };

    pushEvent(eventName, common);

    if (consent.analytics) {
      sendDirectGa4(eventName, common);
    }

    if (eventName === 'whatsapp_click') {
      const leadParameters = {
        ...common,
        method: 'WhatsApp',
        lead_channel: 'whatsapp',
        service: 'higienizacao_ar_condicionado',
        enhanced_conversions: false
      };

      if (consent.analytics) {
        pushEvent('generate_lead', leadParameters);
        sendDirectGa4('generate_lead', leadParameters);
      }

      if (consent.marketing) {
        pushEvent('google_ads_whatsapp_conversion', leadParameters);

        if (
          config.googleAdsId
          && config.googleAdsLabel
          && !config.gtmId
        ) {
          window.gtag('event', 'conversion', {
            send_to: `${config.googleAdsId}/${config.googleAdsLabel}`,
            event_callback: () => undefined
          });
        }

        if (window.fbq) {
          window.fbq('trackCustom', 'WhatsAppClick', {
            cta_location: cleanParameters.cta_location || 'indefinido',
            service: 'higienizacao_ar_condicionado'
          });
        }
      }
    }

    debugLog('Evento', eventName, common);
  };

  window.addEventListener('tsp:consent', (event) => {
    applyConsent(event.detail);
  });

  applyConsent(window.tspConsent?.get?.() || {
    analytics: false,
    marketing: false
  });
})();
