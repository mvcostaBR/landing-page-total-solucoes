/**
 * Gerenciador de preferências de privacidade.
 *
 * Regras implementadas:
 * - Consent Mode v2 inicia negado para análise e marketing;
 * - recursos essenciais permanecem ativos;
 * - a janela de preferências é exibida no primeiro acesso;
 * - escolhas são salvas localmente e podem ser revistas no rodapé;
 * - controles opcionais usam toggle switches acessíveis.
 */
(() => {
  'use strict';

  /** Evita inicialização duplicada. */
  if (window.__TSP_CONSENT_INITIALIZED__) return;
  window.__TSP_CONSENT_INITIALIZED__ = true;

  const STORAGE_KEY = 'tsp-consent-v3';
  const DEFAULT_STATE = Object.freeze({
    analytics: false,
    marketing: false
  });

  const doc = document;

  /** Garante a existência da fila antes de qualquer tag de mensuração. */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  /** Estado padrão: opcionais negados até manifestação do visitante. */
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /** Converte o conteúdo salvo em um estado previsível. */
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

  /** Lê a preferência local sem interromper a página em navegadores restritos. */
  const readConsent = () => {
    try {
      return safeParse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  };

  /** Atualiza Consent Mode e informa os demais módulos da aplicação. */
  const dispatchConsent = (state) => {
    window.__TSP_CONSENT__ = state;

    window.gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied'
    });

    window.dispatchEvent(new CustomEvent('tsp:consent', {
      detail: state
    }));
  };

  /** Salva e aplica um estado normalizado. */
  const saveConsent = (state) => {
    const normalized = {
      analytics: Boolean(state.analytics),
      marketing: Boolean(state.marketing)
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      /* Em file:// ou modo restritivo, a escolha permanece apenas na sessão. */
    }

    dispatchConsent(normalized);
    return normalized;
  };

  /** API pública usada pelo módulo de analytics. */
  window.tspConsent = {
    get: () => window.__TSP_CONSENT__ || readConsent() || DEFAULT_STATE,
    set: saveConsent
  };

  const storedConsent = readConsent();
  if (storedConsent) dispatchConsent(storedConsent);

  /** Cria a interface depois que o body estiver disponível. */
  const createInterface = () => {
    const modal = doc.createElement('div');
    modal.className = 'consent-modal';
    modal.hidden = true;

    modal.innerHTML = `
      <section
        class="consent-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        aria-describedby="consent-description"
        tabindex="-1"
        data-consent-dialog
      >
        <header class="consent-modal__header">
          <div>
            <h2 id="consent-title">Preferências de privacidade</h2>
            <p id="consent-description">Escolha quais recursos opcionais podem ser utilizados neste navegador.</p>
          </div>
          <button class="consent-modal__close" type="button" aria-label="Fechar preferências de privacidade" data-consent-close>×</button>
        </header>

        <div class="consent-option">
          <div>
            <strong>Essenciais</strong>
            <small>Mantêm a página funcionando com segurança e lembram suas escolhas de privacidade.</small>
          </div>
          <label class="consent-switch">
            <span class="visually-hidden">Recursos essenciais sempre ativos</span>
            <input type="checkbox" checked disabled>
            <span class="consent-switch__track" aria-hidden="true"></span>
          </label>
        </div>

        <div class="consent-option">
          <div>
            <strong>Análise</strong>
            <small>Permite entender como a página é usada para melhorar conteúdo, navegação e desempenho.</small>
          </div>
          <label class="consent-switch">
            <span class="visually-hidden">Permitir recursos de análise</span>
            <input type="checkbox" data-consent-analytics>
            <span class="consent-switch__track" aria-hidden="true"></span>
          </label>
        </div>

        <div class="consent-option">
          <div>
            <strong>Marketing</strong>
            <small>Ajuda a medir resultados dos anúncios e a tornar as campanhas mais relevantes.</small>
          </div>
          <label class="consent-switch">
            <span class="visually-hidden">Permitir recursos de marketing</span>
            <input type="checkbox" data-consent-marketing>
            <span class="consent-switch__track" aria-hidden="true"></span>
          </label>
        </div>

        <footer class="consent-modal__actions">
          <button class="consent-button" type="button" data-consent-reject>Usar somente essenciais</button>
          <button class="consent-button" type="button" data-consent-save>Salvar preferências</button>
          <button class="consent-button consent-button--primary" type="button" data-consent-accept>Aceitar todos</button>
        </footer>
      </section>
    `;

    doc.body.append(modal);

    const dialog = modal.querySelector('[data-consent-dialog]');
    const analyticsInput = modal.querySelector('[data-consent-analytics]');
    const marketingInput = modal.querySelector('[data-consent-marketing]');
    const closeButton = modal.querySelector('[data-consent-close]');
    let lastFocusedElement = null;

    /** Retorna todos os elementos focáveis da janela. */
    const getFocusableElements = () => [...modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )];

    /** Abre a janela com o estado atual. */
    const openModal = () => {
      const current = window.tspConsent.get();

      analyticsInput.checked = current.analytics;
      marketingInput.checked = current.marketing;
      lastFocusedElement = doc.activeElement;
      modal.hidden = false;
      doc.body.classList.add('privacy-modal-open');

      window.requestAnimationFrame(() => {
        closeButton?.focus();
      });
    };

    /** Fecha a janela e devolve o foco ao acionador. */
    const closeModal = () => {
      modal.hidden = true;
      doc.body.classList.remove('privacy-modal-open');
      lastFocusedElement?.focus?.();
    };

    /** Aceita as duas categorias opcionais. */
    const acceptAll = () => {
      saveConsent({ analytics: true, marketing: true });
      closeModal();
    };

    /** Mantém somente os recursos essenciais. */
    const rejectOptional = () => {
      saveConsent(DEFAULT_STATE);
      closeModal();
    };

    closeButton?.addEventListener('click', closeModal);
    modal.querySelector('[data-consent-reject]')?.addEventListener('click', rejectOptional);
    modal.querySelector('[data-consent-accept]')?.addEventListener('click', acceptAll);

    modal.querySelector('[data-consent-save]')?.addEventListener('click', () => {
      saveConsent({
        analytics: analyticsInput.checked,
        marketing: marketingInput.checked
      });

      closeModal();
    });

    /** Link permanente no rodapé para revisar as escolhas. */
    doc.querySelectorAll('[data-privacy-open]').forEach((button) => {
      button.addEventListener('click', openModal);
    });

    /** Clique no fundo fecha a janela sem alterar a escolha. */
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    /** Escape fecha; Tab permanece dentro da janela. */
    doc.addEventListener('keydown', (event) => {
      if (modal.hidden) return;

      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /** Exibe as preferências na primeira visita, conforme solicitado. */
    if (!storedConsent) openModal();
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', createInterface, { once: true });
  } else {
    createInterface();
  }
})();
