/**
 * Sistema de Confirmação para Ações Destrutivas
 * Fornece modais e confirmações elegantes para ações críticas
 */

class ConfirmationSystem {
  constructor() {
    this.activeModals = new Map();
    this.defaultOptions = {
      title: 'Confirmar Ação',
      message: 'Tem certeza que deseja continuar?',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning', // warning, danger, info
      showIcon: true,
      focusCancel: true,
      escapeToCancel: true,
      clickOutsideToCancel: true
    };
    this.init();
  }

  /**
   * Inicializa o sistema de confirmação
   */
  init() {
    this.setupStyles();
    this.setupKeyboardHandlers();
  }

  /**
   * Adiciona estilos CSS para os modais de confirmação
   */
  setupStyles() {
    if (document.getElementById('confirmation-styles')) return;

    const style = document.createElement('style');
    style.id = 'confirmation-styles';
    style.textContent = `
      /* Modal Overlay */
      .confirmation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        padding: 1rem;
      }

      .confirmation-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      /* Modal Container */
      .confirmation-modal {
        background: var(--bg-primary);
        border-radius: 0.75rem;
        box-shadow: var(--shadow-xl);
        max-width: 400px;
        width: 100%;
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .confirmation-overlay.active .confirmation-modal {
        transform: scale(1) translateY(0);
      }

      /* Modal Header */
      .confirmation-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem 1.5rem 1rem;
      }

      .confirmation-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .confirmation-icon.warning {
        background: var(--warning-light);
        color: var(--warning-color);
      }

      .confirmation-icon.danger {
        background: var(--error-light);
        color: var(--error-color);
      }

      .confirmation-icon.info {
        background: rgba(220, 38, 38, 0.1);
        color: var(--primary-color);
      }

      .confirmation-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
        line-height: 1.4;
      }

      /* Modal Body */
      .confirmation-body {
        padding: 0 1.5rem 1.5rem;
      }

      .confirmation-message {
        color: var(--gray-600);
        line-height: 1.5;
        margin: 0;
      }

      .confirmation-details {
        margin-top: 1rem;
        padding: 0.75rem;
        background: var(--gray-50);
        border-radius: 0.375rem;
        border-left: 4px solid var(--primary-color);
      }

      .confirmation-details-title {
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.5rem;
      }

      .confirmation-details-content {
        color: var(--gray-700);
        font-size: 0.875rem;
      }

      /* Modal Footer */
      .confirmation-footer {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: var(--gray-50);
        border-top: 1px solid var(--gray-200);
      }

      .confirmation-footer.reverse {
        flex-direction: row-reverse;
      }

      .confirmation-btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .confirmation-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      .confirmation-btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .confirmation-btn.primary:hover {
        background: var(--primary-dark);
      }

      .confirmation-btn.danger {
        background: var(--error-color);
        color: white;
      }

      .confirmation-btn.danger:hover {
        background: #228B22;
      }

      .confirmation-btn.secondary {
        background: var(--gray-200);
        color: var(--gray-700);
      }

      .confirmation-btn.secondary:hover {
        background: var(--gray-300);
      }

      .confirmation-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Loading state para botões */
      .confirmation-btn.loading {
        pointer-events: none;
      }

      .confirmation-btn.loading .btn-text {
        opacity: 0;
      }

      .confirmation-btn.loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Input de confirmação */
      .confirmation-input {
        margin-top: 1rem;
      }

      .confirmation-input label {
        display: block;
        font-weight: 500;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
      }

      .confirmation-input input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .confirmation-input input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      .confirmation-input.error input {
        border-color: var(--error-color);
      }

      .confirmation-input-error {
        color: var(--error-color);
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      /* Tema escuro */
      [data-theme="dark"] .confirmation-modal {
        background: var(--gray-800);
        color: var(--gray-100);
      }

      [data-theme="dark"] .confirmation-title {
        color: var(--gray-100);
      }

      [data-theme="dark"] .confirmation-message {
        color: var(--gray-300);
      }

      [data-theme="dark"] .confirmation-details {
        background: var(--gray-700);
        color: var(--gray-200);
      }

      [data-theme="dark"] .confirmation-footer {
        background: var(--gray-700);
        border-color: var(--gray-600);
      }

      [data-theme="dark"] .confirmation-btn.secondary {
        background: var(--gray-600);
        color: var(--gray-200);
      }

      [data-theme="dark"] .confirmation-btn.secondary:hover {
        background: var(--gray-500);
      }

      /* Animações */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Responsividade */
      @media (max-width: 640px) {
        .confirmation-modal {
          margin: 1rem;
          max-width: none;
        }

        .confirmation-header {
          padding: 1rem 1rem 0.5rem;
        }

        .confirmation-body {
          padding: 0 1rem 1rem;
        }

        .confirmation-footer {
          flex-direction: column;
          padding: 1rem;
        }

        .confirmation-footer.reverse {
          flex-direction: column-reverse;
        }
      }

      /* Acessibilidade */
      @media (prefers-reduced-motion: reduce) {
        .confirmation-overlay,
        .confirmation-modal,
        .confirmation-btn {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Configura handlers de teclado globais
   */
  setupKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      const activeModal = this.getActiveModal();
      if (!activeModal) return;

      if (e.key === 'Escape' && activeModal.options.escapeToCancel) {
        e.preventDefault();
        this.cancel(activeModal.id);
      }

      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('confirmation-btn')) {
          return; // Deixa o botão focado lidar com o enter
        }
        e.preventDefault();
        this.confirm(activeModal.id);
      }
    });
  }

  /**
   * Mostra modal de confirmação
   * @param {Object} options - Opções do modal
   * @returns {Promise} - Promise que resolve com true/false
   */
  show(options = {}) {
    const config = { ...this.defaultOptions, ...options };
    const id = this.generateId();

    return new Promise((resolve) => {
      const modal = this.createModal(id, config, resolve);
      document.body.appendChild(modal.overlay);
      
      // Armazena referência
      this.activeModals.set(id, {
        element: modal.overlay,
        options: config,
        resolve,
        id
      });

      // Mostra modal
      requestAnimationFrame(() => {
        modal.overlay.classList.add('active');
        
        // Foca no botão apropriado
        const focusTarget = config.focusCancel ? 
          modal.overlay.querySelector('.confirmation-btn.secondary') :
          modal.overlay.querySelector('.confirmation-btn.primary');
        
        if (focusTarget) {
          focusTarget.focus();
        }
      });

      // Previne scroll do body
      document.body.style.overflow = 'hidden';
    });
  }

  /**
   * Cria o elemento do modal
   */
  createModal(id, config, resolve) {
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    overlay.setAttribute('data-id', id);
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', `confirmation-title-${id}`);

    const icons = {
      warning: 'fas fa-exclamation-triangle',
      danger: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };

    overlay.innerHTML = `
      <div class="confirmation-modal">
        <div class="confirmation-header">
          ${config.showIcon ? `
            <div class="confirmation-icon ${config.type}">
              <i class="${icons[config.type]}"></i>
            </div>
          ` : ''}
          <h3 class="confirmation-title" id="confirmation-title-${id}">
            ${config.title}
          </h3>
        </div>
        <div class="confirmation-body">
          <p class="confirmation-message">${config.message}</p>
          ${config.details ? `
            <div class="confirmation-details">
              <div class="confirmation-details-title">${config.details.title}</div>
              <div class="confirmation-details-content">${config.details.content}</div>
            </div>
          ` : ''}
          ${config.requireConfirmation ? `
            <div class="confirmation-input">
              <label for="confirmation-text-${id}">
                Digite "${config.confirmationText}" para confirmar:
              </label>
              <input 
                type="text" 
                id="confirmation-text-${id}"
                placeholder="${config.confirmationText}"
                autocomplete="off"
              >
              <div class="confirmation-input-error" style="display: none;">
                Texto de confirmação incorreto
              </div>
            </div>
          ` : ''}
        </div>
        <div class="confirmation-footer ${config.reverseButtons ? 'reverse' : ''}">
          <button class="confirmation-btn secondary" data-action="cancel">
            <span class="btn-text">${config.cancelText}</span>
          </button>
          <button class="confirmation-btn ${config.type === 'danger' ? 'danger' : 'primary'}" data-action="confirm">
            <span class="btn-text">${config.confirmText}</span>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    const cancelBtn = overlay.querySelector('[data-action="cancel"]');
    const confirmBtn = overlay.querySelector('[data-action="confirm"]');
    const confirmInput = overlay.querySelector(`#confirmation-text-${id}`);

    cancelBtn.addEventListener('click', () => this.cancel(id));
    confirmBtn.addEventListener('click', () => this.confirm(id));

    // Click fora para cancelar
    if (config.clickOutsideToCancel) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.cancel(id);
        }
      });
    }

    // Validação de texto de confirmação
    if (config.requireConfirmation) {
      const updateConfirmButton = () => {
        const isValid = confirmInput.value === config.confirmationText;
        confirmBtn.disabled = !isValid;
        
        const errorEl = overlay.querySelector('.confirmation-input-error');
        const inputContainer = overlay.querySelector('.confirmation-input');
        
        if (confirmInput.value && !isValid) {
          errorEl.style.display = 'block';
          inputContainer.classList.add('error');
        } else {
          errorEl.style.display = 'none';
          inputContainer.classList.remove('error');
        }
      };

      confirmInput.addEventListener('input', updateConfirmButton);
      confirmBtn.disabled = true;
    }

    return { overlay, cancelBtn, confirmBtn };
  }

  /**
   * Confirma a ação
   */
  async confirm(id) {
    const modal = this.activeModals.get(id);
    if (!modal) return;

    const confirmBtn = modal.element.querySelector('[data-action="confirm"]');
    
    // Se há callback assíncrono, mostra loading
    if (modal.options.onConfirm) {
      confirmBtn.classList.add('loading');
      confirmBtn.disabled = true;
      
      try {
        const result = await modal.options.onConfirm();
        if (result === false) {
          // Callback retornou false, não fecha o modal
          confirmBtn.classList.remove('loading');
          confirmBtn.disabled = false;
          return;
        }
      } catch (error) {
        confirmBtn.classList.remove('loading');
        confirmBtn.disabled = false;
        
        // Mostra erro se disponível
        if (typeof showError === 'function') {
          showError('Erro', 'Ocorreu um erro ao processar a ação');
        }
        return;
      }
    }

    this.close(id, true);
  }

  /**
   * Cancela a ação
   */
  cancel(id) {
    this.close(id, false);
  }

  /**
   * Fecha o modal
   */
  close(id, result) {
    const modal = this.activeModals.get(id);
    if (!modal) return;

    modal.element.classList.remove('active');
    
    setTimeout(() => {
      if (modal.element.parentNode) {
        modal.element.parentNode.removeChild(modal.element);
      }
      
      // Restaura scroll se não há outros modais
      if (this.activeModals.size === 1) {
        document.body.style.overflow = '';
      }
      
      this.activeModals.delete(id);
      modal.resolve(result);
    }, 300);
  }

  /**
   * Retorna o modal ativo (último aberto)
   */
  getActiveModal() {
    const modals = Array.from(this.activeModals.values());
    return modals[modals.length - 1];
  }

  /**
   * Gera ID único
   */
  generateId() {
    return `confirmation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Métodos de conveniência
   */
  
  /**
   * Confirmação simples
   */
  async confirm(title, message, options = {}) {
    return this.show({
      title,
      message,
      type: 'info',
      ...options
    });
  }

  /**
   * Aviso de ação destrutiva
   */
  async warning(title, message, options = {}) {
    return this.show({
      title,
      message,
      type: 'warning',
      confirmText: 'Continuar',
      ...options
    });
  }

  /**
   * Confirmação de exclusão
   */
  async delete(itemName, options = {}) {
    return this.show({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir "${itemName}"?`,
      details: {
        title: 'Atenção',
        content: 'Esta ação não pode ser desfeita.'
      },
      type: 'danger',
      confirmText: 'Excluir',
      focusCancel: true,
      ...options
    });
  }

  /**
   * Confirmação com texto obrigatório
   */
  async requireText(title, message, confirmationText, options = {}) {
    return this.show({
      title,
      message,
      type: 'danger',
      requireConfirmation: true,
      confirmationText,
      confirmText: 'Confirmar',
      ...options
    });
  }
}

// Instância global
const confirmationSystem = new ConfirmationSystem();

// Funções de conveniência globais
window.confirmAction = (title, message, options) => confirmationSystem.confirm(title, message, options);
window.confirmWarning = (title, message, options) => confirmationSystem.warning(title, message, options);
window.confirmDelete = (itemName, options) => confirmationSystem.delete(itemName, options);
window.confirmWithText = (title, message, text, options) => confirmationSystem.requireText(title, message, text, options);
