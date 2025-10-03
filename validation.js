/**
 * Sistema de Validação Profissional
 * Fornece validação robusta para formulários com feedback visual
 */

class ValidationSystem {
  constructor() {
    this.validators = new Map();
    this.errorMessages = new Map();
    this.init();
  }

  /**
   * Inicializa o sistema de validação
   */
  init() {
    this.setupDefaultValidators();
    this.setupStyles();
  }

  /**
   * Configura validadores padrão
   */
  setupDefaultValidators() {
    // Validador para campos obrigatórios
    this.addValidator('required', (value) => {
      return value !== null && value !== undefined && value.toString().trim() !== '';
    }, 'Este campo é obrigatório');

    // Validador para email
    this.addValidator('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, 'Digite um email válido');

    // Validador para números
    this.addValidator('number', (value) => {
      return !isNaN(value) && isFinite(value);
    }, 'Digite um número válido');

    // Validador para números positivos
    this.addValidator('positive', (value) => {
      return parseFloat(value) > 0;
    }, 'O valor deve ser maior que zero');

    // Validador para CNPJ/CPF
    this.addValidator('cnpj_cpf', (value) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 11 || cleaned.length === 14;
    }, 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido');

    // Validador para datas
    this.addValidator('date', (value) => {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date);
    }, 'Digite uma data válida');

    // Validador para datas futuras
    this.addValidator('future_date', (value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'A data deve ser hoje ou no futuro');

    // Validador para comprimento mínimo
    this.addValidator('min_length', (value, minLength) => {
      return value.toString().length >= minLength;
    }, 'Muito curto');

    // Validador para comprimento máximo
    this.addValidator('max_length', (value, maxLength) => {
      return value.toString().length <= maxLength;
    }, 'Muito longo');
  }

  /**
   * Adiciona estilos CSS para validação
   */
  setupStyles() {
    if (document.getElementById('validation-styles')) return;

    const style = document.createElement('style');
    style.id = 'validation-styles';
    style.textContent = `
      .form-field {
        position: relative;
        margin-bottom: 1.5rem;
      }

      .form-field.error input,
      .form-field.error select,
      .form-field.error textarea {
        border-color: var(--error-color);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .form-field.success input,
      .form-field.success select,
      .form-field.success textarea {
        border-color: var(--success-color);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: var(--error-light);
        border: 1px solid var(--error-color);
        border-radius: 0.375rem;
        color: var(--error-color);
        font-size: 0.875rem;
        animation: slideDown 0.3s ease-out;
      }

      .success-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: var(--success-light);
        border: 1px solid var(--success-color);
        border-radius: 0.375rem;
        color: var(--success-color);
        font-size: 0.875rem;
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .validation-icon {
        font-size: 1rem;
      }

      .form-field input:focus,
      .form-field select:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      .loading-input {
        position: relative;
      }

      .loading-input::after {
        content: '';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid var(--gray-300);
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: translateY(-50%) rotate(0deg); }
        100% { transform: translateY(-50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Adiciona um novo validador
   * @param {string} name - Nome do validador
   * @param {function} validator - Função de validação
   * @param {string} message - Mensagem de erro padrão
   */
  addValidator(name, validator, message) {
    this.validators.set(name, validator);
    this.errorMessages.set(name, message);
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} field - Campo a ser validado
   * @param {Array} rules - Regras de validação
   * @returns {boolean} - True se válido
   */
  validateField(field, rules = []) {
    const value = field.value;
    const fieldContainer = field.closest('.form-field') || field.parentElement;
    
    // Remove mensagens anteriores
    this.clearFieldMessages(fieldContainer);
    
    // Remove classes de estado
    fieldContainer.classList.remove('error', 'success');

    // Valida cada regra
    for (const rule of rules) {
      const { validator: validatorName, params = [], message } = this.parseRule(rule);
      
      if (!this.validators.has(validatorName)) {
        console.warn(`Validador '${validatorName}' não encontrado`);
        continue;
      }

      const validator = this.validators.get(validatorName);
      const isValid = validator(value, ...params);

      if (!isValid) {
        const errorMessage = message || this.errorMessages.get(validatorName);
        this.showFieldError(fieldContainer, errorMessage);
        return false;
      }
    }

    // Campo válido
    this.showFieldSuccess(fieldContainer);
    return true;
  }

  /**
   * Valida um formulário completo
   * @param {HTMLFormElement} form - Formulário a ser validado
   * @param {Object} fieldRules - Regras por campo
   * @returns {boolean} - True se todo o formulário é válido
   */
  validateForm(form, fieldRules = {}) {
    let isFormValid = true;
    const firstErrorField = null;

    // Valida cada campo com regras definidas
    Object.entries(fieldRules).forEach(([fieldName, rules]) => {
      const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
      if (field) {
        const isFieldValid = this.validateField(field, rules);
        if (!isFieldValid && isFormValid) {
          isFormValid = false;
          // Foca no primeiro campo com erro
          setTimeout(() => field.focus(), 100);
        }
      }
    });

    return isFormValid;
  }

  /**
   * Configura validação em tempo real para um campo
   * @param {HTMLElement} field - Campo a ser monitorado
   * @param {Array} rules - Regras de validação
   * @param {number} debounceTime - Tempo de debounce em ms
   */
  setupRealTimeValidation(field, rules, debounceTime = 500) {
    let timeout;
    
    const validate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (field.value.trim() !== '') {
          this.validateField(field, rules);
        } else {
          const fieldContainer = field.closest('.form-field') || field.parentElement;
          this.clearFieldMessages(fieldContainer);
          fieldContainer.classList.remove('error', 'success');
        }
      }, debounceTime);
    };

    field.addEventListener('input', validate);
    field.addEventListener('blur', () => {
      clearTimeout(timeout);
      this.validateField(field, rules);
    });
  }

  /**
   * Analisa uma regra de validação
   * @param {string|Object} rule - Regra a ser analisada
   * @returns {Object} - Objeto com validador, parâmetros e mensagem
   */
  parseRule(rule) {
    if (typeof rule === 'string') {
      const parts = rule.split(':');
      const validator = parts[0];
      const params = parts[1] ? parts[1].split(',') : [];
      return { validator, params };
    }
    
    return rule;
  }

  /**
   * Mostra erro em um campo
   * @param {HTMLElement} container - Container do campo
   * @param {string} message - Mensagem de erro
   */
  showFieldError(container, message) {
    container.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle validation-icon"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(errorDiv);
  }

  /**
   * Mostra sucesso em um campo
   * @param {HTMLElement} container - Container do campo
   */
  showFieldSuccess(container) {
    container.classList.add('success');
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle validation-icon"></i>
      <span>Campo válido</span>
    `;
    
    container.appendChild(successDiv);
    
    // Remove mensagem de sucesso após 2 segundos
    setTimeout(() => {
      if (successDiv.parentElement) {
        successDiv.remove();
        container.classList.remove('success');
      }
    }, 2000);
  }

  /**
   * Remove mensagens de um campo
   * @param {HTMLElement} container - Container do campo
   */
  clearFieldMessages(container) {
    const messages = container.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
  }

  /**
   * Adiciona máscara a um campo
   * @param {HTMLElement} field - Campo a receber a máscara
   * @param {string} mask - Tipo de máscara (cpf, cnpj, phone, etc.)
   */
  addMask(field, mask) {
    const masks = {
      cpf: '000.000.000-00',
      cnpj: '00.000.000/0000-00',
      phone: '(00) 00000-0000',
      cep: '00000-000',
      currency: 'R$ 0,00'
    };

    if (!masks[mask]) return;

    field.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (mask === 'currency') {
        value = (parseFloat(value) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      } else {
        const maskPattern = masks[mask];
        let maskedValue = '';
        let valueIndex = 0;
        
        for (let i = 0; i < maskPattern.length && valueIndex < value.length; i++) {
          if (maskPattern[i] === '0') {
            maskedValue += value[valueIndex];
            valueIndex++;
          } else {
            maskedValue += maskPattern[i];
          }
        }
        value = maskedValue;
      }
      
      e.target.value = value;
    });
  }
}

// Instância global do sistema de validação
const validator = new ValidationSystem();

// Função auxiliar para configurar validação em formulários
function setupFormValidation(formSelector, fieldRules, options = {}) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  // Configura validação em tempo real para cada campo
  Object.entries(fieldRules).forEach(([fieldName, rules]) => {
    const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
    if (field) {
      // Envolve o campo em um container se necessário
      if (!field.closest('.form-field')) {
        const container = document.createElement('div');
        container.className = 'form-field';
        field.parentNode.insertBefore(container, field);
        container.appendChild(field);
      }
      
      validator.setupRealTimeValidation(field, rules, options.debounceTime);
    }
  });

  // Intercepta o submit do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const isValid = validator.validateForm(form, fieldRules);
    
    if (isValid && options.onSubmit) {
      options.onSubmit(form);
    }
  });
}
