/**
 * Sistema de Loading States e Skeleton Screens
 * Fornece feedback visual durante carregamentos e operações assíncronas
 */

class LoadingSystem {
  constructor() {
    this.activeLoaders = new Map();
    this.init();
  }

  /**
   * Inicializa o sistema de loading
   */
  init() {
    this.setupStyles();
    this.setupGlobalLoader();
  }

  /**
   * Adiciona estilos CSS para loading states
   */
  setupStyles() {
    if (document.getElementById('loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
      /* Loading Overlay Global */
      .global-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .global-loading-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      [data-theme="dark"] .global-loading-overlay {
        background: rgba(15, 23, 42, 0.9);
      }

      /* Spinner Principal */
      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--gray-200);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-spinner.small {
        width: 24px;
        height: 24px;
        border-width: 2px;
      }

      .loading-spinner.large {
        width: 64px;
        height: 64px;
        border-width: 6px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Loading Content */
      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
      }

      .loading-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
      }

      .loading-message {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin: 0;
      }

      [data-theme="dark"] .loading-title {
        color: var(--gray-100);
      }

      [data-theme="dark"] .loading-message {
        color: var(--gray-400);
      }

      /* Loading States para Botões */
      .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .btn-loading .btn-text {
        opacity: 0;
      }

      .btn-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Loading States para Cards */
      .card-loading {
        position: relative;
        overflow: hidden;
      }

      .card-loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .card-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border: 2px solid var(--gray-300);
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 11;
      }

      /* Skeleton Screens */
      .skeleton {
        background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 0.25rem;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      [data-theme="dark"] .skeleton {
        background: linear-gradient(90deg, var(--gray-700) 25%, var(--gray-600) 50%, var(--gray-700) 75%);
        background-size: 200% 100%;
      }

      /* Skeleton Components */
      .skeleton-text {
        height: 1rem;
        margin-bottom: 0.5rem;
      }

      .skeleton-text.large {
        height: 1.5rem;
      }

      .skeleton-text.small {
        height: 0.75rem;
      }

      .skeleton-title {
        height: 1.25rem;
        width: 60%;
        margin-bottom: 1rem;
      }

      .skeleton-paragraph {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .skeleton-avatar.small {
        width: 32px;
        height: 32px;
      }

      .skeleton-avatar.large {
        width: 64px;
        height: 64px;
      }

      .skeleton-card {
        padding: 1rem;
        border: 1px solid var(--gray-200);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }

      .skeleton-list-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--gray-100);
      }

      .skeleton-list-item:last-child {
        border-bottom: none;
      }

      /* Progress Bar */
      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--gray-200);
        border-radius: 4px;
        overflow: hidden;
        margin: 1rem 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--primary-color);
        border-radius: 4px;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-fill.animated::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
          to right,
          transparent 0%,
          rgba(255, 255, 255, 0.6) 50%,
          transparent 100%
        );
        animation: progress-shine 1.5s infinite;
      }

      @keyframes progress-shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Pulse Animation */
      .pulse {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Dots Loading */
      .loading-dots {
        display: inline-flex;
        gap: 0.25rem;
      }

      .loading-dots .dot {
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: dots-loading 1.4s infinite ease-in-out;
      }

      .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
      .loading-dots .dot:nth-child(3) { animation-delay: 0s; }

      @keyframes dots-loading {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* Loading Table */
      .table-loading {
        position: relative;
      }

      .table-loading tbody tr {
        opacity: 0.5;
        pointer-events: none;
      }

      .table-loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--primary-color);
        animation: table-loading 2s infinite;
      }

      @keyframes table-loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Responsive */
      @media (max-width: 640px) {
        .loading-spinner {
          width: 40px;
          height: 40px;
        }
        
        .loading-title {
          font-size: 1rem;
        }
        
        .loading-message {
          font-size: 0.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Configura o overlay de loading global
   */
  setupGlobalLoader() {
    if (document.getElementById('global-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'global-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3 class="loading-title">Carregando...</h3>
        <p class="loading-message">Aguarde um momento</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * Mostra loading global
   * @param {string} title - Título do loading
   * @param {string} message - Mensagem do loading
   */
  showGlobal(title = 'Carregando...', message = 'Aguarde um momento') {
    const overlay = document.getElementById('global-loading-overlay');
    const titleEl = overlay.querySelector('.loading-title');
    const messageEl = overlay.querySelector('.loading-message');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    overlay.classList.add('active');
    
    // Previne scroll do body
    document.body.style.overflow = 'hidden';
  }

  /**
   * Esconde loading global
   */
  hideGlobal() {
    const overlay = document.getElementById('global-loading-overlay');
    overlay.classList.remove('active');
    
    // Restaura scroll do body
    document.body.style.overflow = '';
  }

  /**
   * Adiciona loading state a um botão
   * @param {HTMLElement|string} button - Elemento do botão ou seletor
   * @param {string} loadingText - Texto durante o loading
   */
  setButtonLoading(button, loadingText = '') {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    if (!btn) return;

    const originalText = btn.textContent;
    btn.classList.add('btn-loading');
    btn.disabled = true;
    
    // Envolve o texto original
    if (!btn.querySelector('.btn-text')) {
      btn.innerHTML = `<span class="btn-text">${btn.innerHTML}</span>`;
    }
    
    if (loadingText) {
      btn.querySelector('.btn-text').textContent = loadingText;
    }
    
    // Armazena estado original
    btn._originalState = {
      text: originalText,
      disabled: btn.disabled
    };
  }

  /**
   * Remove loading state de um botão
   * @param {HTMLElement|string} button - Elemento do botão ou seletor
   */
  removeButtonLoading(button) {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    if (!btn || !btn._originalState) return;

    btn.classList.remove('btn-loading');
    btn.disabled = btn._originalState.disabled;
    
    const textEl = btn.querySelector('.btn-text');
    if (textEl) {
      textEl.textContent = btn._originalState.text;
    }
    
    delete btn._originalState;
  }

  /**
   * Adiciona loading state a um card
   * @param {HTMLElement|string} card - Elemento do card ou seletor
   */
  setCardLoading(card) {
    const cardEl = typeof card === 'string' ? document.querySelector(card) : card;
    if (!cardEl) return;

    cardEl.classList.add('card-loading');
  }

  /**
   * Remove loading state de um card
   * @param {HTMLElement|string} card - Elemento do card ou seletor
   */
  removeCardLoading(card) {
    const cardEl = typeof card === 'string' ? document.querySelector(card) : card;
    if (!cardEl) return;

    cardEl.classList.remove('card-loading');
  }

  /**
   * Cria skeleton screen para lista
   * @param {HTMLElement} container - Container onde inserir o skeleton
   * @param {number} items - Número de itens do skeleton
   * @param {Object} options - Opções de configuração
   */
  createListSkeleton(container, items = 5, options = {}) {
    const { showAvatar = true, showMeta = true } = options;
    
    container.innerHTML = '';
    
    for (let i = 0; i < items; i++) {
      const item = document.createElement('div');
      item.className = 'skeleton-list-item';
      item.innerHTML = `
        ${showAvatar ? '<div class="skeleton skeleton-avatar"></div>' : ''}
        <div style="flex: 1;">
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
          ${showMeta ? '<div class="skeleton skeleton-text small" style="width: 40%;"></div>' : ''}
        </div>
        <div class="skeleton skeleton-text small" style="width: 60px;"></div>
      `;
      container.appendChild(item);
    }
  }

  /**
   * Cria skeleton screen para cards
   * @param {HTMLElement} container - Container onde inserir o skeleton
   * @param {number} cards - Número de cards do skeleton
   */
  createCardsSkeleton(container, cards = 3) {
    container.innerHTML = '';
    
    for (let i = 0; i < cards; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.innerHTML = `
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton-paragraph">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
      `;
      container.appendChild(card);
    }
  }

  /**
   * Cria barra de progresso
   * @param {HTMLElement} container - Container da barra
   * @param {number} progress - Progresso inicial (0-100)
   * @param {Object} options - Opções de configuração
   */
  createProgressBar(container, progress = 0, options = {}) {
    const { animated = true, showPercentage = true } = options;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
      <div class="progress-fill ${animated ? 'animated' : ''}" style="width: ${progress}%"></div>
    `;
    
    if (showPercentage) {
      const percentage = document.createElement('div');
      percentage.className = 'progress-percentage';
      percentage.textContent = `${progress}%`;
      percentage.style.cssText = 'text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray-600);';
      progressBar.appendChild(percentage);
    }
    
    container.appendChild(progressBar);
    return progressBar;
  }

  /**
   * Atualiza barra de progresso
   * @param {HTMLElement} progressBar - Elemento da barra de progresso
   * @param {number} progress - Novo progresso (0-100)
   */
  updateProgress(progressBar, progress) {
    const fill = progressBar.querySelector('.progress-fill');
    const percentage = progressBar.querySelector('.progress-percentage');
    
    if (fill) fill.style.width = `${progress}%`;
    if (percentage) percentage.textContent = `${progress}%`;
  }

  /**
   * Simula loading com progresso
   * @param {HTMLElement} container - Container para a barra
   * @param {number} duration - Duração em ms
   * @param {function} callback - Callback ao completar
   */
  simulateProgress(container, duration = 3000, callback = null) {
    const progressBar = this.createProgressBar(container, 0, { animated: true });
    let progress = 0;
    const increment = 100 / (duration / 50);
    
    const interval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (callback) callback();
        }, 500);
      }
      this.updateProgress(progressBar, Math.round(progress));
    }, 50);
    
    return interval;
  }

  /**
   * Wrapper para operações assíncronas com loading
   * @param {function} asyncOperation - Operação assíncrona
   * @param {Object} options - Opções de loading
   */
  async withLoading(asyncOperation, options = {}) {
    const {
      global = false,
      button = null,
      card = null,
      title = 'Processando...',
      message = 'Aguarde um momento'
    } = options;

    try {
      // Ativa loading states
      if (global) this.showGlobal(title, message);
      if (button) this.setButtonLoading(button);
      if (card) this.setCardLoading(card);

      // Executa operação
      const result = await asyncOperation();
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      // Remove loading states
      if (global) this.hideGlobal();
      if (button) this.removeButtonLoading(button);
      if (card) this.removeCardLoading(card);
    }
  }
}

// Instância global do sistema de loading
const loadingSystem = new LoadingSystem();

// Funções de conveniência globais
window.showLoading = (title, message) => loadingSystem.showGlobal(title, message);
window.hideLoading = () => loadingSystem.hideGlobal();
window.withLoading = (operation, options) => loadingSystem.withLoading(operation, options);
