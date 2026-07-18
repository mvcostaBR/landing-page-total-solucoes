/**
 * Camada de mensuração preparada para GTM, GA4, Google Ads, Meta Pixel e
 * Microsoft Clarity.
 *
 * Regras principais:
 * - IDs vazios mantêm as integrações desativadas durante a homologação;
 * - o contêiner GTM é carregado imediatamente para disponibilizar o Consent Mode,
 *   permitir o Tag Assistant e gerenciar as tags do contêiner;
 * - GA4, Google Ads, Meta Pixel e Clarity continuam respeitando as categorias
 *   de consentimento configuradas;
 * - eventos analíticos e publicitários respeitam categorias de consentimento separadas;
 * - URLs completas, mensagens, identificadores de clique brutos e dados pessoais
 *   não são enviados às plataformas de mensuração;
 * - cliques em "outros serviços" são registrados como interação, mas não como
 *   lead ou conversão desta landing page de higienização residencial Split.
 */
(() => {
  'use strict';

  /** Evita inicialização duplicada. */
  if (window.__TSP_ANALYTICS_INITIALIZED__) return;
  window.__TSP_ANALYTICS_INITIALIZED__ = true;

  const script = document.getElementById('tsp-analytics');
  if (!script) return;

  /** Configuração lida exclusivamente dos atributos do script no HTML. */
  const config = Object.freeze({
    gtmId: script.dataset.gtmId?.trim() || '',
    ga4Id: script.dataset.ga4Id?.trim() || '',
    googleAdsId: script.dataset.googleAdsId?.trim() || '',
    googleAdsLabel: script.dataset.googleAdsLabel?.trim() || '',
    metaPixelId: script.dataset.metaPixelId?.trim() || '',
    clarityId: script.dataset.clarityId?.trim() || '',
    debug: script.dataset.debug === 'true',
    enhancedConversions: false
  });

  const ATTRIBUTION_STORAGE_KEY = 'tsp-attribution-v1';
  const SERVICE_ID = 'higienizacao_split_residencial';

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

  const CLICK_IDS = Object.freeze(['gclid', 'wbraid', 'gbraid']);
  const CLICK_ID_FLAGS = Object.freeze({
    gclid: 'gclid_present',
    wbraid: 'wbraid_present',
    gbraid: 'gbraid_present'
  });

  /**
   * Chaves que não podem chegar ao dataLayer nem às plataformas.
   * A comparação é feita em minúsculas para impedir variações de capitalização.
   */
  const FORBIDDEN_KEYS = new Set([
    'name',
    'nome',
    'email',
    'phone',
    'telefone',
    'message',
    'mensagem',
    'href',
    'url',
    'full_url',
    'link_url',
    'page_url',
    ...CLICK_IDS
  ]);

  /** CTAs que não representam conversão do serviço desta landing page. */
  const NON_CONVERSION_CTA_LOCATIONS = new Set([
    'outros-servicos',
    'indefinido'
  ]);

  const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;
  const PARAMETER_NAME_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;

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
    if (typeof value === 'boolean') return value;

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value !== 'string') return undefined;

    const normalized = value.trim().slice(0, 160);
    return normalized || undefined;
  };

  /** Remove chaves proibidas, nomes inválidos e valores não escalares. */
  const sanitizeParameters = (parameters = {}) => Object.entries(parameters)
    .reduce((result, [key, value]) => {
      const normalizedKey = String(key).trim().toLowerCase();

      if (
        !PARAMETER_NAME_PATTERN.test(normalizedKey)
        || FORBIDDEN_KEYS.has(normalizedKey)
      ) {
        return result;
      }

      const sanitized = sanitizeValue(value);
      if (sanitized !== undefined) result[normalizedKey] = sanitized;
      return result;
    }, {});

  /** Valida nomes de eventos antes de qualquer envio. */
  const sanitizeEventName = (eventName) => {
    if (typeof eventName !== 'string') return '';

    const normalized = eventName.trim().toLowerCase();
    return EVENT_NAME_PATTERN.test(normalized) ? normalized : '';
  };

  /** Lê atribuição salva sem interromper navegadores em modo restritivo. */
  const readStoredAttribution = () => {
    try {
      const parsed = JSON.parse(
        window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}'
      );
      return sanitizeParameters(parsed);
    } catch {
      return {};
    }
  };

  /**
   * Captura somente parâmetros permitidos.
   * Identificadores de clique são convertidos em indicadores booleanos; seus
   * valores brutos não são persistidos nem enviados pelo código do projeto.
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
      window.sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify(attribution)
      );
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

  /**
   * Inicializa GTM ou gtag conforme os IDs oficiais disponíveis.
   *
   * O contêiner GTM é carregado mesmo antes de uma decisão de consentimento.
   * Isso é necessário para o Consent Mode avançado e para o Tag Assistant.
   * As tags internas do contêiner continuam subordinadas aos consentimentos
   * definidos por consent.js e às verificações adicionais configuradas no GTM.
   */
  const loadGoogle = (state) => {
    if (config.gtmId) {
      if (!loaded.has('tsp-gtm') && !document.getElementById('tsp-gtm')) {
        window.dataLayer.push({
          'gtm.start': Date.now(),
          event: 'gtm.js'
        });

        appendScript(
          `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`,
          'tsp-gtm'
        );
      }

      /** Marca como carregado também quando o elemento já existe na página. */
      if (document.getElementById('tsp-gtm')) loaded.add('tsp-gtm');
      return;
    }

    /** Integrações diretas continuam bloqueadas até consentimento aplicável. */
    if (!state.analytics && !state.marketing) return;

    /**
     * Modo direto é apenas fallback. Com GTM configurado, os IDs diretos devem
     * permanecer vazios no HTML para impedir duplicidade de mensuração.
     */
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
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
      configured.add(config.ga4Id);
    }

    if (
      state.marketing
      && config.googleAdsId
      && !configured.has(config.googleAdsId)
    ) {
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
    const normalizedState = {
      analytics: Boolean(state?.analytics),
      marketing: Boolean(state?.marketing)
    };

    /** GTM/Google pode atender Analytics, Marketing ou ambos. */
    loadGoogle(normalizedState);

    if (normalizedState.analytics) loadClarity();
    if (normalizedState.marketing) loadMeta();

    debugLog('Consentimento aplicado', normalizedState);
  };

  /** Coloca um evento sanitizado na camada de dados. */
  const pushEvent = (eventName, parameters) => {
    const cleanEventName = sanitizeEventName(eventName);
    if (!cleanEventName) {
      debugLog('Evento ignorado por nome inválido', eventName);
      return null;
    }

    const eventData = {
      event: cleanEventName,
      ...sanitizeParameters(parameters),
      event_timestamp: Date.now()
    };

    window.dataLayer.push(eventData);
    return eventData;
  };

  /** Envia um evento diretamente ao GA4 quando GTM não está em uso. */
  const sendDirectGa4 = (eventName, parameters) => {
    const cleanEventName = sanitizeEventName(eventName);
    if (!cleanEventName || !config.ga4Id || config.gtmId) return;

    window.gtag('event', cleanEventName, sanitizeParameters(parameters));
  };

  /** Determina se o clique pertence ao funil de higienização Split. */
  const isQualifiedWhatsAppLead = (parameters) => {
    const location = sanitizeValue(parameters.cta_location);

    return Boolean(
      location
      && !NON_CONVERSION_CTA_LOCATIONS.has(location.toLowerCase())
    );
  };

  /**
   * API pública para eventos de interação e conversão.
   * Um clique qualificado no WhatsApp gera sinais separados para diagnóstico,
   * GA4 e Google Ads, sempre conforme o consentimento correspondente.
   */
  window.tspTrack = (eventName, parameters = {}) => {
    const cleanEventName = sanitizeEventName(eventName);
    if (!cleanEventName) return;

    const consent = window.tspConsent?.get?.() || {
      analytics: false,
      marketing: false
    };

    const cleanParameters = sanitizeParameters(parameters);
    const common = {
      ...cleanParameters,
      ...attribution
    };

    /** Evento técnico e analítico geral do clique. */
    pushEvent(cleanEventName, common);

    if (consent.analytics) {
      sendDirectGa4(cleanEventName, common);
    }

    if (cleanEventName !== 'whatsapp_click') {
      debugLog('Evento', cleanEventName, common);
      return;
    }

    /**
     * "Outros serviços" permanece disponível para diagnóstico, mas não pode
     * alimentar a conversão desta campanha dedicada à higienização Split.
     */
    if (!isQualifiedWhatsAppLead(cleanParameters)) {
      debugLog('Clique de WhatsApp não qualificado como lead', common);
      return;
    }

    const leadParameters = {
      ...common,
      method: 'whatsapp',
      lead_channel: 'whatsapp',
      service: SERVICE_ID,
      lead_qualified: true
    };

    if (consent.analytics) {
      pushEvent('generate_lead', leadParameters);
      sendDirectGa4('generate_lead', leadParameters);
    }

    if (consent.marketing) {
      pushEvent('google_ads_whatsapp_conversion', leadParameters);

      /** Conversão direta usada somente quando não há GTM. */
      if (
        config.googleAdsId
        && config.googleAdsLabel
        && !config.gtmId
      ) {
        window.gtag('event', 'conversion', {
          send_to: `${config.googleAdsId}/${config.googleAdsLabel}`,
          event_callback: () => undefined,
          event_timeout: 2000
        });
      }

      if (window.fbq) {
        window.fbq('trackCustom', 'WhatsAppClick', {
          cta_location: cleanParameters.cta_location || 'indefinido',
          service: SERVICE_ID
        });
      }
    }

    debugLog('Evento', cleanEventName, common);
  };

  /** Reage a novas escolhas ou alterações nas preferências. */
  window.addEventListener('tsp:consent', (event) => {
    applyConsent(event.detail);
  });

  /** Restaura a preferência salva ou mantém opcionais negados. */
  applyConsent(window.tspConsent?.get?.() || {
    analytics: false,
    marketing: false
  });
})();
