/**
 * Configurações de Segurança
 * Centraliza todas as configurações de segurança do sistema
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

const SecurityConfig = {
  // Configurações de senha
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxLength: 128
  },

  // Configurações de sessão
  session: {
    timeout: 30 * 60 * 1000, // 30 minutos
    rememberMeTimeout: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxInactiveTime: 15 * 60 * 1000, // 15 minutos
    renewThreshold: 5 * 60 * 1000 // 5 minutos antes do vencimento
  },

  // Configurações de rate limiting
  rateLimit: {
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    windowSize: 60 * 1000, // 1 minuto
    maxRequestsPerWindow: 10
  },

  // Configurações de 2FA
  twoFactor: {
    codeLength: 6,
    codeExpiry: 5 * 60 * 1000, // 5 minutos
    maxAttempts: 3,
    enabledForProfiles: ['admin', 'manager']
  },

  // Configurações de recuperação de senha
  passwordRecovery: {
    tokenLength: 32,
    tokenExpiry: 30 * 60 * 1000, // 30 minutos
    maxTokensPerUser: 3,
    cooldownPeriod: 5 * 60 * 1000 // 5 minutos entre tentativas
  },

  // Configurações de criptografia
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 32,
    iterations: 100000,
    digest: 'sha512'
  },

  // Configurações de validação de entrada
  inputValidation: {
    maxUsernameLength: 50,
    maxEmailLength: 254,
    maxNameLength: 100,
    allowedUsernameChars: /^[a-zA-Z0-9._-]+$/,
    maxTextLength: 255,
    maxTextAreaLength: 1000
  },

  // Configurações de logs de auditoria
  audit: {
    maxLogEntries: 1000,
    logRetentionDays: 30,
    sensitiveFields: ['password', 'passwordHash', 'passwordSalt', 'token'],
    logLevels: ['INFO', 'WARN', 'ERROR', 'SECURITY']
  },

  // Configurações de CSP
  csp: {
    defaultSrc: "'self'",
    scriptSrc: "'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    styleSrc: "'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    fontSrc: "'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    imgSrc: "'self' data:",
    connectSrc: "'self'",
    objectSrc: "'none'",
    baseUri: "'self'",
    formAction: "'self'"
  },

  // Configurações de headers de segurança
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },

  // Configurações de limpeza de dados
  dataCleanup: {
    expiredTokensInterval: 60 * 60 * 1000, // 1 hora
    oldLogsInterval: 24 * 60 * 60 * 1000, // 24 horas
    sessionCleanupInterval: 5 * 60 * 1000 // 5 minutos
  },

  // Configurações de monitoramento
  monitoring: {
    suspiciousActivityThreshold: 10, // tentativas por minuto
    botDetectionThreshold: 5, // cliques por segundo
    anomalyDetectionEnabled: true,
    alertThresholds: {
      failedLogins: 10,
      suspiciousActivity: 5,
      dataBreach: 1
    }
  },

  // Configurações de backup de segurança
  securityBackup: {
    enabled: true,
    interval: 24 * 60 * 60 * 1000, // 24 horas
    maxBackups: 7,
    encryptBackups: true,
    includeAuditLogs: true
  },

  // Configurações de desenvolvimento vs produção
  environment: {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    enableDebugLogs: false,
    strictValidation: true,
    allowInsecureConnections: false
  },

  /**
   * Obtém configuração por chave
   */
  get(key) {
    const keys = key.split('.');
    let value = this;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        return null;
      }
    }
    
    return value;
  },

  /**
   * Define configuração por chave
   */
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let target = this;
    
    for (const k of keys) {
      if (!target[k]) {
        target[k] = {};
      }
      target = target[k];
    }
    
    target[lastKey] = value;
  },

  /**
   * Valida configuração
   */
  validate() {
    const errors = [];
    
    // Valida configurações de senha
    if (this.password.minLength < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    // Valida configurações de sessão
    if (this.session.timeout < 5 * 60 * 1000) {
      errors.push('Timeout de sessão muito baixo');
    }
    
    // Valida configurações de rate limiting
    if (this.rateLimit.maxFailedAttempts < 3) {
      errors.push('Máximo de tentativas falhadas muito baixo');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Aplica configurações de segurança ao DOM
   */
  applySecuritySettings() {
    // Aplica CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      const cspValue = Object.entries(this.csp)
        .map(([key, value]) => `${key} ${value}`)
        .join('; ');
      cspMeta.setAttribute('content', cspValue);
    }

    // Aplica headers de segurança via meta tags
    Object.entries(this.securityHeaders).forEach(([header, value]) => {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', header);
      meta.setAttribute('content', value);
      document.head.appendChild(meta);
    });
  },

  /**
   * Obtém configurações para ambiente atual
   */
  getEnvironmentConfig() {
    const isDev = this.environment.isDevelopment;
    
    return {
      password: {
        ...this.password,
        minLength: isDev ? 8 : this.password.minLength
      },
      session: {
        ...this.session,
        timeout: isDev ? 60 * 60 * 1000 : this.session.timeout // 1 hora em dev
      },
      rateLimit: {
        ...this.rateLimit,
        maxFailedAttempts: isDev ? 10 : this.rateLimit.maxFailedAttempts
      },
      monitoring: {
        ...this.monitoring,
        enableDebugLogs: isDev
      }
    };
  }
};

// Exporta para uso global
window.SecurityConfig = SecurityConfig;

// Aplica configurações automaticamente
document.addEventListener('DOMContentLoaded', () => {
  SecurityConfig.applySecuritySettings();
});
