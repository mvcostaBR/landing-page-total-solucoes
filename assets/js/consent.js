/**
 * Gerenciador de consentimento local.
 * Implementa preferências simples e compatíveis com Consent Mode v2.
 */
(() => {
  'use strict';

  if (window.__TSP_CONSENT_INITIALIZED__) return;
  window.__TSP_CONSENT_INITIALIZED__ = true;

  const STORAGE_KEY = 'tsp-consent-v2';
  const DEFAULT_STATE = Object.freeze({ analytics: false, marketing: false });
  const doc = document;

  /** Garante que a fila do Google exista antes de qualquer tag. */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  /** Estado padrão negado até manifestação do usuário. */
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  const safeParse = (value) => {
    try {
      const parsed = JSON.parse(value);
      return {
        analytics: Boolean(parsed?.analytics),
        marketing: Boolean(parsed?.marketing)
      };
    } catch {
      return null;
    }
  };

  const readConsent = () => {
    try {
      return safeParse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  };

  const dispatchConsent = (state) => {
    window.__TSP_CONSENT__ = state;

    window.gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied'
    });

    window.dispatchEvent(new CustomEvent('tsp:consent', { detail: state }));
  };

  const saveConsent = (state) => {
    const normalized = {
      analytics: Boolean(state.analytics),
      marketing: Boolean(state.marketing)
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      /* Em file:// ou navegadores restritivos, mantém a preferência apenas na sessão. */
    }
    dispatchConsent(normalized);
    return normalized;
  };

  window.tspConsent = {
    get: () => window.__TSP_CONSENT__ || readConsent() || DEFAULT_STATE,
    set: saveConsent
  };

  const storedConsent = readConsent();
  if (storedConsent) dispatchConsent(storedConsent);

  const createInterface = () => {
    const banner = doc.createElement('aside');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferências de privacidade');
    banner.hidden = Boolean(storedConsent);
    banner.innerHTML = `
      <p>Usamos recursos essenciais para o funcionamento da página. Com sua autorização, também podemos medir acessos e campanhas para melhorar o atendimento.</p>
      <div class="consent-banner__actions">
        <button class="consent-button" type="button" data-consent-reject>Recusar opcionais</button>
        <button class="consent-button" type="button" data-consent-settings>Configurar</button>
        <button class="consent-button consent-button--primary" type="button" data-consent-accept>Aceitar todos</button>
      </div>
    `;

    const modal = doc.createElement('div');
    modal.className = 'consent-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="consent-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div class="consent-modal__header">
          <div>
            <h2 id="consent-title">Preferências de privacidade</h2>
            <p>Escolha quais recursos opcionais podem ser utilizados neste navegador.</p>
          </div>
          <button class="consent-modal__close" type="button" aria-label="Fechar preferências" data-consent-close>×</button>
        </div>
        <div class="consent-option">
          <div><strong>Essenciais</strong><small>Necessários para funcionamento, segurança e registro das preferências.</small></div>
          <input type="checkbox" checked disabled aria-label="Cookies essenciais sempre ativos">
        </div>
        <label class="consent-option">
          <span><strong>Análise</strong><small>Ajuda a entender o uso da página e o desempenho das campanhas.</small></span>
          <input type="checkbox" data-consent-analytics>
        </label>
        <label class="consent-option">
          <span><strong>Marketing</strong><small>Permite mensuração de anúncios e públicos, quando as tags forem configuradas.</small></span>
          <input type="checkbox" data-consent-marketing>
        </label>
        <div class="consent-modal__actions">
          <button class="consent-button" type="button" data-consent-reject>Recusar opcionais</button>
          <button class="consent-button consent-button--primary" type="button" data-consent-save>Salvar preferências</button>
        </div>
      </div>
    `;

    doc.body.append(banner, modal);

    const analyticsInput = modal.querySelector('[data-consent-analytics]');
    const marketingInput = modal.querySelector('[data-consent-marketing]');
    let lastFocusedElement = null;

    const hideBanner = () => { banner.hidden = true; };

    const openModal = () => {
      const current = window.tspConsent.get();
      analyticsInput.checked = current.analytics;
      marketingInput.checked = current.marketing;
      lastFocusedElement = doc.activeElement;
      modal.hidden = false;
      modal.querySelector('[data-consent-close]')?.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      lastFocusedElement?.focus?.();
    };

    const acceptAll = () => {
      saveConsent({ analytics: true, marketing: true });
      hideBanner();
      closeModal();
    };

    const rejectOptional = () => {
      saveConsent(DEFAULT_STATE);
      hideBanner();
      closeModal();
    };

    banner.querySelector('[data-consent-accept]')?.addEventListener('click', acceptAll);
    banner.querySelector('[data-consent-reject]')?.addEventListener('click', rejectOptional);
    banner.querySelector('[data-consent-settings]')?.addEventListener('click', openModal);

    modal.querySelector('[data-consent-close]')?.addEventListener('click', closeModal);
    modal.querySelector('[data-consent-reject]')?.addEventListener('click', rejectOptional);
    modal.querySelector('[data-consent-save]')?.addEventListener('click', () => {
      saveConsent({
        analytics: analyticsInput.checked,
        marketing: marketingInput.checked
      });
      hideBanner();
      closeModal();
    });

    doc.querySelectorAll('[data-privacy-open]').forEach((button) => button.addEventListener('click', openModal));

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', createInterface, { once: true });
  } else {
    createInterface();
  }
})();
