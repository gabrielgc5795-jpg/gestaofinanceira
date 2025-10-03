/**
 * Sistema de Notificações Toast Profissional
 * Fornece notificações elegantes e acessíveis para feedback do usuário
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.defaultOptions = {
      duration: 4000,
      position: 'top-right',
      showProgress: true,
      pauseOnHover: true,
      closeButton: true,
      animation: 'slide'
    };
    this.init();
  }

  /**
   * Inicializa o sistema de notificações
   */
  init() {
    this.createContainer();
    this.setupStyles();
    this.setupKeyboardNavigation();
  }

  /**
   * Cria o container principal das notificações
   */
  createContainer() {
    if (document.getElementById('notification-container')) return;

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'notification-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', 'Notificações');
    document.body.appendChild(this.container);
  }

  /**
   * Adiciona estilos CSS para as notificações
   */
  setupStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      }

      .notification-container.bottom-right {
        top: auto;
        bottom: 1rem;
      }

      .notification-container.top-left {
        right: auto;
        left: 1rem;
      }

      .notification-container.bottom-left {
        top: auto;
        bottom: 1rem;
        right: auto;
        left: 1rem;
      }

      .notification-container.top-center {
        right: 50%;
        transform: translateX(50%);
      }

      .notification-container.bottom-center {
        top: auto;
        bottom: 1rem;
        right: 50%;
        transform: translateX(50%);
      }

      .toast-notification {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        padding: 1rem;
        background: var(--bg-primary);
        border: 1px solid var(--gray-200);
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        min-width: 300px;
        max-width: 400px;
        transition: all 0.3s ease;
      }

      .toast-notification.success {
        border-left: 4px solid var(--success-color);
        background: var(--success-light);
      }

      .toast-notification.error {
        border-left: 4px solid var(--error-color);
        background: var(--error-light);
      }

      .toast-notification.warning {
        border-left: 4px solid var(--warning-color);
        background: var(--warning-light);
      }

      .toast-notification.info {
        border-left: 4px solid var(--primary-color);
        background: rgba(220, 38, 38, 0.05);
      }

      .toast-icon {
        font-size: 1.25rem;
        margin-top: 0.125rem;
        flex-shrink: 0;
      }

      .toast-notification.success .toast-icon {
        color: var(--success-color);
      }

      .toast-notification.error .toast-icon {
        color: var(--error-color);
      }

      .toast-notification.warning .toast-icon {
        color: var(--warning-color);
      }

      .toast-notification.info .toast-icon {
        color: var(--primary-color);
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-title {
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
        color: var(--gray-900);
      }

      .toast-message {
        font-size: 0.875rem;
        color: var(--gray-700);
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        color: var(--gray-400);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: color 0.2s ease;
        flex-shrink: 0;
      }

      .toast-close:hover {
        color: var(--gray-600);
        background: rgba(0, 0, 0, 0.05);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--primary-color);
        transition: width 0.1s ease;
      }

      .toast-notification.success .toast-progress {
        background: var(--success-color);
      }

      .toast-notification.error .toast-progress {
        background: var(--error-color);
      }

      .toast-notification.warning .toast-progress {
        background: var(--warning-color);
      }

      /* Animações */
      .toast-notification.slide-enter {
        transform: translateX(100%);
        opacity: 0;
      }

      .toast-notification.slide-enter-active {
        transform: translateX(0);
        opacity: 1;
      }

      .toast-notification.slide-exit {
        transform: translateX(100%);
        opacity: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        max-height: 0;
      }

      .toast-notification.fade-enter {
        opacity: 0;
        transform: scale(0.9);
      }

      .toast-notification.fade-enter-active {
        opacity: 1;
        transform: scale(1);
      }

      .toast-notification.fade-exit {
        opacity: 0;
        transform: scale(0.9);
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        max-height: 0;
      }

      .toast-notification.bounce-enter {
        opacity: 0;
        transform: scale(0.3);
      }

      .toast-notification.bounce-enter-active {
        opacity: 1;
        transform: scale(1);
        animation: bounceIn 0.5s ease;
      }

      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }

      .toast-notification.paused .toast-progress {
        animation-play-state: paused;
      }

      /* Tema escuro */
      [data-theme="dark"] .toast-notification {
        background: var(--gray-800);
        border-color: var(--gray-700);
        color: var(--gray-100);
      }

      [data-theme="dark"] .toast-title {
        color: var(--gray-100);
      }

      [data-theme="dark"] .toast-message {
        color: var(--gray-300);
      }

      [data-theme="dark"] .toast-close {
        color: var(--gray-400);
      }

      [data-theme="dark"] .toast-close:hover {
        color: var(--gray-200);
        background: rgba(255, 255, 255, 0.1);
      }

      /* Responsividade */
      @media (max-width: 640px) {
        .notification-container {
          left: 1rem;
          right: 1rem;
          max-width: none;
        }

        .toast-notification {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Configura navegação por teclado
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearAll();
      }
    });
  }

  /**
   * Mostra uma notificação
   * @param {string} type - Tipo da notificação (success, error, warning, info)
   * @param {string} title - Título da notificação
   * @param {string} message - Mensagem da notificação
   * @param {Object} options - Opções adicionais
   * @returns {string} - ID da notificação
   */
  show(type, title, message = '', options = {}) {
    const config = { ...this.defaultOptions, ...options };
    const id = this.generateId();
    
    const notification = this.createNotification(id, type, title, message, config);
    this.container.appendChild(notification);
    
    // Aplica posição do container
    this.container.className = `notification-container ${config.position}`;
    
    // Animação de entrada
    this.animateIn(notification, config.animation);
    
    // Configura auto-dismiss
    if (config.duration > 0) {
      this.setupAutoDismiss(id, config.duration, config.showProgress, config.pauseOnHover);
    }
    
    // Armazena referência
    this.notifications.set(id, {
      element: notification,
      config,
      timer: null
    });
    
    return id;
  }

  /**
   * Métodos de conveniência para diferentes tipos
   */
  success(title, message, options) {
    return this.show('success', title, message, options);
  }

  error(title, message, options) {
    return this.show('error', title, message, { duration: 6000, ...options });
  }

  warning(title, message, options) {
    return this.show('warning', title, message, options);
  }

  info(title, message, options) {
    return this.show('info', title, message, options);
  }

  /**
   * Cria o elemento da notificação
   */
  createNotification(id, type, title, message, config) {
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.setAttribute('data-id', id);
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
      <div class="toast-icon">
        <i class="${icons[type]}"></i>
      </div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      ${config.closeButton ? `
        <button class="toast-close" aria-label="Fechar notificação">
          <i class="fas fa-times"></i>
        </button>
      ` : ''}
      ${config.showProgress && config.duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;
    
    // Event listeners
    if (config.closeButton) {
      const closeBtn = notification.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.dismiss(id));
    }
    
    // Clique na notificação para fechar (opcional)
    if (config.clickToClose) {
      notification.addEventListener('click', () => this.dismiss(id));
      notification.style.cursor = 'pointer';
    }
    
    return notification;
  }

  /**
   * Anima entrada da notificação
   */
  animateIn(notification, animation) {
    notification.classList.add(`${animation}-enter`);
    
    requestAnimationFrame(() => {
      notification.classList.remove(`${animation}-enter`);
      notification.classList.add(`${animation}-enter-active`);
    });
  }

  /**
   * Configura auto-dismiss com barra de progresso
   */
  setupAutoDismiss(id, duration, showProgress, pauseOnHover) {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    const element = notification.element;
    const progressBar = element.querySelector('.toast-progress');
    
    let startTime = Date.now();
    let remainingTime = duration;
    let isPaused = false;
    
    const updateProgress = () => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, (remainingTime - elapsed) / duration * 100);
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      if (elapsed >= remainingTime) {
        this.dismiss(id);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };
    
    // Pause on hover
    if (pauseOnHover) {
      element.addEventListener('mouseenter', () => {
        isPaused = true;
        element.classList.add('paused');
      });
      
      element.addEventListener('mouseleave', () => {
        isPaused = false;
        startTime = Date.now();
        remainingTime = remainingTime - (Date.now() - startTime);
        element.classList.remove('paused');
      });
    }
    
    if (showProgress) {
      updateProgress();
    } else {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /**
   * Remove uma notificação
   * @param {string} id - ID da notificação
   */
  dismiss(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    const element = notification.element;
    const config = notification.config;
    
    // Animação de saída
    element.classList.add(`${config.animation}-exit`);
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.notifications.delete(id);
    }, 300);
  }

  /**
   * Remove todas as notificações
   */
  clearAll() {
    const ids = Array.from(this.notifications.keys());
    ids.forEach(id => this.dismiss(id));
  }

  /**
   * Atualiza uma notificação existente
   * @param {string} id - ID da notificação
   * @param {Object} updates - Atualizações a aplicar
   */
  update(id, updates) {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    const element = notification.element;
    
    if (updates.title !== undefined) {
      const titleEl = element.querySelector('.toast-title');
      if (titleEl) titleEl.textContent = updates.title;
    }
    
    if (updates.message !== undefined) {
      const messageEl = element.querySelector('.toast-message');
      if (messageEl) messageEl.textContent = updates.message;
    }
    
    if (updates.type !== undefined) {
      element.className = `toast-notification ${updates.type}`;
    }
  }

  /**
   * Gera ID único para notificação
   */
  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configura posição global das notificações
   * @param {string} position - Posição (top-right, top-left, bottom-right, etc.)
   */
  setPosition(position) {
    this.defaultOptions.position = position;
    this.container.className = `notification-container ${position}`;
  }

  /**
   * Retorna estatísticas das notificações
   */
  getStats() {
    return {
      total: this.notifications.size,
      byType: Array.from(this.notifications.values()).reduce((acc, notif) => {
        const type = notif.element.classList[1];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Instância global do sistema de notificações
const notifications = new NotificationSystem();

// Funções de conveniência globais
window.showSuccess = (title, message, options) => notifications.success(title, message, options);
window.showError = (title, message, options) => notifications.error(title, message, options);
window.showWarning = (title, message, options) => notifications.warning(title, message, options);
window.showInfo = (title, message, options) => notifications.info(title, message, options);

// Integração com sistema de validação
if (typeof validator !== 'undefined') {
  // Sobrescreve alerts padrão com notificações
  const originalAlert = window.alert;
  window.alert = function(message) {
    notifications.info('Aviso', message);
  };
}
