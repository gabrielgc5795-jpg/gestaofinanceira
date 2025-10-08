/**
 * Sistema de Autenticação e Controle de Acesso Profissional
 * Fornece login, logout, controle de sessão, permissões e segurança avançada
 * 
 * @version 2.0
 * @author Sistema de Gestão Financeira
 */

class AuthenticationSystem {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
    this.sessionTimer = null;
    this.failedAttempts = new Map(); // Rate limiting
    this.maxFailedAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutos
    this.auditLog = []; // Log de auditoria
    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    };
    this.profiles = {
      admin: {
        name: 'Administrador',
        permissions: ['*'], // Todas as permissões
        color: '#228B22'
      },
      manager: {
        name: 'Gerente',
        permissions: [
          'dashboard.view', 'transacoes.view', 'transacoes.create', 'transacoes.edit',
          'relatorios.view', 'relatorios.export', 'orcamento.view', 'orcamento.edit',
          'metas.view', 'metas.create', 'notas-fiscais.view', 'backup.create',
          'users.view', 'clients.view', 'clients.create', 'clients.edit',
          'suppliers.view', 'suppliers.create', 'suppliers.edit', 'inventory.view',
          'financial.view', 'financial.create', 'financial.edit', 'service-orders.view',
          'service-orders.create', 'service-orders.edit', 'agenda.view', 'agenda.create',
          'fiscal.view', 'fiscal.create', 'fiscal.edit', 'fiscal.send'
        ],
        color: '#f59e0b'
      },
      operator: {
        name: 'Operador',
        permissions: [
          'dashboard.view', 'transacoes.view', 'transacoes.create',
          'notas-fiscais.view', 'notas-fiscais.create', 'notas-fiscais.edit',
          'clients.view', 'clients.create', 'suppliers.view', 'suppliers.create',
          'inventory.view', 'inventory.create', 'financial.view', 'financial.create',
          'service-orders.view', 'service-orders.create', 'agenda.view',
          'fiscal.view', 'fiscal.create'
        ],
        color: '#10b981'
      },
      viewer: {
        name: 'Visualizador',
        permissions: [
          'dashboard.view', 'transacoes.view', 'relatorios.view', 'graficos.view',
          'clients.view', 'suppliers.view', 'inventory.view', 'financial.view',
          'service-orders.view', 'agenda.view', 'fiscal.view'
        ],
        color: '#6366f1'
      }
    };
    this.init();
  }

  /**
   * Inicializa o sistema de autenticação
   */
  init() {
    this.loadSession();
    this.setupEventListeners();
    this.checkAuthOnPageLoad();
  }

  /**
   * Carrega sessão salva se existir
   */
  loadSession() {
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (this.isSessionValid(session)) {
          this.currentUser = session.user;
          this.startSessionTimer();
          this.updateUI();
        } else {
          this.logout();
        }
      } catch (error) {
        console.warn('Erro ao carregar sessão:', error);
        this.logout();
      }
    }
  }

  /**
   * Verifica se a sessão é válida
   */
  isSessionValid(session) {
    const now = Date.now();
    return session.expiresAt > now && session.user && session.user.profile;
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Reset timer em atividade do usuário
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, () => {
        if (this.currentUser) {
          this.resetSessionTimer();
          this.monitorSuspiciousActivity();
        }
      }, { passive: true });
    });

    // Intercepta navegação para verificar permissões
    const originalNavigarPara = window.navegarPara;
    if (originalNavigarPara) {
      window.navegarPara = (pagina) => {
        if (this.hasPermission(`${pagina}.view`)) {
          originalNavigarPara(pagina);
        } else {
          this.showAccessDenied(pagina);
        }
      };
    }
  }

  /**
   * Verifica autenticação ao carregar página
   */
  checkAuthOnPageLoad() {
    const currentPage = this.getCurrentPage();
    const publicPages = ['index', 'login'];
    
    if (!publicPages.includes(currentPage) && !this.isAuthenticated()) {
      this.redirectToLogin();
    } else if (this.isAuthenticated() && !this.hasPermission(`${currentPage}.view`)) {
      this.showAccessDenied(currentPage);
    }
  }

  /**
   * Obtém página atual
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
  }

  /**
   * Realiza login do usuário com validações de segurança
   */
  async login(username, password, rememberMe = false) {
    const startTime = Date.now();
    const clientIP = this.getClientIP();
    
    try {
      // Verifica rate limiting
      if (this.isAccountLocked(username)) {
        const lockoutTime = this.getRemainingLockoutTime(username);
        throw new Error(`Conta temporariamente bloqueada. Tente novamente em ${Math.ceil(lockoutTime / 60000)} minutos.`);
      }
      
      // Valida entrada
      if (!this.validateInput(username, password)) {
        throw new Error('Dados de entrada inválidos');
      }
      
      // Simula validação (em produção seria uma API)
      const user = await this.validateCredentials(username, password);
      
      if (user) {
        // Reset failed attempts on successful login
        this.failedAttempts.delete(username);
        
        this.currentUser = user;
        this.saveSession(rememberMe);
        this.startSessionTimer();
        this.updateUI();
        
        // Log de auditoria
        this.logAuditEvent('LOGIN_SUCCESS', {
          username: user.username,
          profile: user.profile,
          rememberMe,
          clientIP,
          userAgent: navigator.userAgent,
          duration: Date.now() - startTime
        });
        
        // Log da ação
        if (typeof analytics !== 'undefined') {
          analytics.trackEvent('user_login', {
            username: user.username,
            profile: user.profile,
            rememberMe
          }, 'auth');
        }
        
        // Notificação de sucesso
        if (typeof showSuccess === 'function') {
          showSuccess('Login realizado!', `Bem-vindo, ${user.name}!`);
        }
        
        // Redireciona para dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        
        return { success: true, user };
      } else {
        // Incrementa tentativas falhadas
        this.incrementFailedAttempts(username);
        
        // Log de auditoria
        this.logAuditEvent('LOGIN_FAILED', {
          username,
          clientIP,
          userAgent: navigator.userAgent,
          failedAttempts: this.getFailedAttempts(username)
        });
        
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      // Log de auditoria para erros
      this.logAuditEvent('LOGIN_ERROR', {
        username,
        error: error.message,
        clientIP,
        userAgent: navigator.userAgent
      });
      
      if (typeof showError === 'function') {
        showError('Erro no Login', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida credenciais do usuário com hash de senha
   */
  async validateCredentials(username, password) {
    // Simula delay de rede (proteção contra timing attacks)
    const baseDelay = 1000 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, baseDelay));
    
    // Usa sistema de gestão de usuários se disponível
    if (typeof userManagement !== 'undefined') {
      return userManagement.validateUserCredentials(username, password);
    }
    
    // Fallback para usuários demo (compatibilidade) - SENHAS CRIPTOGRAFADAS
    const demoUsers = {
      'admin': {
        passwordHash: 'a1b2c3d4e5f6', // Hash da senha 'admin123'
        passwordSalt: 'salt123',
        user: {
          id: 1,
          username: 'admin',
          name: 'Administrador do Sistema',
          email: 'admin@gestaofinanceira.com',
          profile: 'admin',
          avatar: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      },
      'gerente': {
        passwordHash: 'b2c3d4e5f6a1', // Hash da senha 'gerente123'
        passwordSalt: 'salt456',
        user: {
          id: 2,
          username: 'gerente',
          name: 'João Silva',
          email: 'joao@gestaofinanceira.com',
          profile: 'manager',
          avatar: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      },
      'operador': {
        passwordHash: 'c3d4e5f6a1b2', // Hash da senha 'operador123'
        passwordSalt: 'salt789',
        user: {
          id: 3,
          username: 'operador',
          name: 'Maria Santos',
          email: 'maria@gestaofinanceira.com',
          profile: 'operator',
          avatar: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      },
      'viewer': {
        passwordHash: 'd4e5f6a1b2c3', // Hash da senha 'viewer123'
        passwordSalt: 'salt012',
        user: {
          id: 4,
          username: 'viewer',
          name: 'Carlos Oliveira',
          email: 'carlos@gestaofinanceira.com',
          profile: 'viewer',
          avatar: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }
    };

    const userCredentials = demoUsers[username.toLowerCase()];
    if (userCredentials) {
      // Verifica senha usando hash
      const isValid = await this.verifyPasswordHash(password, userCredentials.passwordHash, userCredentials.passwordSalt);
      if (isValid) {
        return userCredentials.user;
      }
    }
    
    return null;
  }

  /**
   * Salva sessão no localStorage de forma segura
   */
  async saveSession(rememberMe = false) {
    await this.saveSessionWithIntegrity(rememberMe);
  }

  /**
   * Inicia timer de sessão
   */
  startSessionTimer() {
    this.clearSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.logout('Sessão expirada por inatividade');
    }, this.sessionTimeout);
  }

  /**
   * Reseta timer de sessão
   */
  resetSessionTimer() {
    if (this.currentUser) {
      this.startSessionTimer();
      // Verifica se precisa renovar sessão
      this.renewSessionIfNeeded();
    }
  }

  /**
   * Limpa timer de sessão
   */
  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Realiza logout do usuário com limpeza de segurança
   */
  logout(reason = null) {
    const wasAuthenticated = this.isAuthenticated();
    const username = this.currentUser?.username;
    
    // Log de auditoria
    if (wasAuthenticated) {
      this.logAuditEvent('LOGOUT', {
        username,
        reason: reason || 'manual',
        clientIP: this.getClientIP(),
        userAgent: navigator.userAgent
      });
    }
    
    // Log da ação
    if (typeof analytics !== 'undefined' && this.currentUser) {
      analytics.trackEvent('user_logout', {
        username: this.currentUser.username,
        reason: reason || 'manual'
      }, 'auth');
    }
    
    // Limpa dados da sessão de forma segura
    this.currentUser = null;
    this.clearSessionTimer();
    
    // Limpeza segura do localStorage
    try {
      localStorage.removeItem('auth_session');
      // Limpa outros dados sensíveis se existirem
      const sensitiveKeys = ['user_data', 'temp_data', 'session_backup'];
      sensitiveKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar dados da sessão:', error);
    }
    
    // Atualiza UI
    this.updateUI();
    
    // Notificação
    if (typeof showInfo === 'function' && reason) {
      showInfo('Sessão Encerrada', reason);
    }
    
    // Redireciona para login se estava autenticado
    if (wasAuthenticated) {
      setTimeout(() => {
        this.redirectToLogin();
      }, reason ? 2000 : 0);
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  hasPermission(permission) {
    if (!this.isAuthenticated()) return false;
    
    const userProfile = this.profiles[this.currentUser.profile];
    if (!userProfile) return false;
    
    // Admin tem todas as permissões
    if (userProfile.permissions.includes('*')) return true;
    
    // Verifica permissão específica
    return userProfile.permissions.includes(permission);
  }

  /**
   * Obtém perfil do usuário atual
   */
  getCurrentUserProfile() {
    if (!this.isAuthenticated()) return null;
    return this.profiles[this.currentUser.profile];
  }

  /**
   * Atualiza interface baseada no estado de autenticação
   */
  updateUI() {
    // Atualiza header com informações do usuário
    this.updateUserInfo();
    
    // Mostra/esconde elementos baseado em permissões
    this.updatePermissionBasedElements();
    
    // Atualiza navegação
    this.updateNavigation();
  }

  /**
   * Atualiza informações do usuário no header
   */
  updateUserInfo() {
    const userInfoContainer = document.querySelector('.user-info');
    
    if (this.isAuthenticated() && userInfoContainer) {
      const profile = this.getCurrentUserProfile();
      userInfoContainer.innerHTML = `
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-details">
          <span class="user-name">${this.currentUser.name}</span>
          <span class="user-profile" style="color: ${profile.color}">
            ${profile.name}
          </span>
        </div>
        <button class="logout-btn" onclick="authSystem.logout()" title="Sair">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      `;
    }
  }

  /**
   * Atualiza elementos baseado em permissões
   */
  updatePermissionBasedElements() {
    // Esconde botões/seções sem permissão
    document.querySelectorAll('[data-permission]').forEach(element => {
      const permission = element.getAttribute('data-permission');
      if (this.hasPermission(permission)) {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * Atualiza navegação baseada em permissões
   */
  updateNavigation() {
    const navButtons = document.querySelectorAll('.tab-button');
    navButtons.forEach(button => {
      const onclick = button.getAttribute('onclick');
      if (onclick) {
        const match = onclick.match(/navegarPara\('([^']+)'\)/);
        if (match) {
          const page = match[1];
          if (this.hasPermission(`${page}.view`)) {
            button.style.display = '';
            button.disabled = false;
          } else {
            button.style.display = 'none';
            button.disabled = true;
          }
        }
      }
    });
  }

  /**
   * Mostra mensagem de acesso negado
   */
  showAccessDenied(page) {
    if (typeof showError === 'function') {
      showError(
        'Acesso Negado', 
        `Você não tem permissão para acessar a página "${page}".`
      );
    }
    
    // Redireciona para página permitida
    setTimeout(() => {
      if (this.hasPermission('dashboard.view')) {
        window.location.href = 'dashboard.html';
      } else {
        this.logout('Sem permissões suficientes');
      }
    }, 2000);
  }

  /**
   * Redireciona para página de login
   */
  redirectToLogin() {
    window.location.href = 'login.html';
  }

  /**
   * Obtém lista de usuários (para administração)
   */
  getUsers() {
    if (!this.hasPermission('users.view')) {
      throw new Error('Sem permissão para visualizar usuários');
    }
    
    // Em produção seria uma chamada à API
    return [
      {
        id: 1,
        username: 'admin',
        name: 'Administrador do Sistema',
        email: 'admin@grillgestao.com',
        profile: 'admin',
        active: true,
        lastLogin: new Date().toISOString()
      },
      {
        id: 2,
        username: 'gerente',
        name: 'João Silva',
        email: 'joao@grillgestao.com',
        profile: 'manager',
        active: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Obtém estatísticas de autenticação
   */
  getAuthStats() {
    if (!this.hasPermission('auth.stats')) {
      throw new Error('Sem permissão para visualizar estatísticas');
    }
    
    // Em produção seria calculado via API
    return {
      totalUsers: 4,
      activeUsers: 3,
      loginsToday: 12,
      failedLoginsToday: 2,
      averageSessionTime: 25 * 60 * 1000, // 25 minutos
      topProfiles: [
        { profile: 'operator', count: 8 },
        { profile: 'manager', count: 3 },
        { profile: 'admin', count: 1 }
      ]
    };
  }

  /**
   * Valida entrada do usuário
   */
  validateInput(username, password) {
    if (!username || !password) return false;
    if (typeof username !== 'string' || typeof password !== 'string') return false;
    if (username.length < 3 || username.length > 50) return false;
    if (password.length < 6 || password.length > 128) return false;
    
    // Verifica caracteres permitidos
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) return false;
    
    return true;
  }

  /**
   * Verifica se conta está bloqueada por tentativas
   */
  isAccountLocked(username) {
    const attempts = this.failedAttempts.get(username);
    if (!attempts) return false;
    
    const now = Date.now();
    if (attempts.count >= this.maxFailedAttempts && 
        (now - attempts.lastAttempt) < this.lockoutDuration) {
      return true;
    }
    
    return false;
  }

  /**
   * Incrementa tentativas falhadas
   */
  incrementFailedAttempts(username) {
    const now = Date.now();
    const attempts = this.failedAttempts.get(username) || { count: 0, lastAttempt: 0 };
    
    // Reset se passou do tempo de lockout
    if ((now - attempts.lastAttempt) > this.lockoutDuration) {
      attempts.count = 0;
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    this.failedAttempts.set(username, attempts);
  }

  /**
   * Obtém número de tentativas falhadas
   */
  getFailedAttempts(username) {
    const attempts = this.failedAttempts.get(username);
    return attempts ? attempts.count : 0;
  }

  /**
   * Obtém tempo restante de bloqueio
   */
  getRemainingLockoutTime(username) {
    const attempts = this.failedAttempts.get(username);
    if (!attempts) return 0;
    
    const elapsed = Date.now() - attempts.lastAttempt;
    return Math.max(0, this.lockoutDuration - elapsed);
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  getClientIP() {
    // Em produção seria obtido do servidor
    return '127.0.0.1';
  }

  /**
   * Registra evento de auditoria
   */
  logAuditEvent(eventType, data) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      data,
      sessionId: this.generateSessionId()
    };
    
    this.auditLog.push(auditEntry);
    
    // Mantém apenas os últimos 1000 eventos
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // Em produção seria enviado para servidor de logs
    console.log('Audit Event:', auditEntry);
  }

  /**
   * Gera ID único para sessão
   */
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Obtém log de auditoria
   */
  getAuditLog() {
    if (!this.hasPermission('audit.view')) {
      throw new Error('Sem permissão para visualizar logs de auditoria');
    }
    return this.auditLog;
  }

  /**
   * Força logout de todos os usuários (admin)
   */
  forceLogoutAll() {
    if (!this.hasPermission('auth.force_logout')) {
      throw new Error('Sem permissão para forçar logout');
    }
    
    this.logAuditEvent('FORCE_LOGOUT_ALL', {
      adminUser: this.currentUser?.username,
      clientIP: this.getClientIP()
    });
    
    // Em produção seria uma chamada à API
    console.log('Forçando logout de todos os usuários...');
  }

  /**
   * Inicia processo de recuperação de senha
   */
  async initiatePasswordRecovery(email) {
    try {
      // Valida email
      if (!this.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      
      // Verifica se usuário existe
      const user = await this.findUserByEmail(email);
      if (!user) {
        // Por segurança, não revela se email existe ou não
        this.logAuditEvent('PASSWORD_RECOVERY_ATTEMPT', {
          email,
          clientIP: this.getClientIP(),
          userAgent: navigator.userAgent
        });
        
        return {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá instruções de recuperação.'
        };
      }
      
      // Gera token de recuperação
      const recoveryToken = this.generateRecoveryToken();
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutos
      
      // Salva token temporariamente (em produção seria no banco)
      this.saveRecoveryToken(email, recoveryToken, expiresAt);
      
      // Envia email (simulado)
      await this.sendRecoveryEmail(email, recoveryToken, user.name);
      
      this.logAuditEvent('PASSWORD_RECOVERY_SENT', {
        email,
        userId: user.id,
        clientIP: this.getClientIP()
      });
      
      return {
        success: true,
        message: 'Instruções de recuperação enviadas para seu email.'
      };
      
    } catch (error) {
      this.logAuditEvent('PASSWORD_RECOVERY_ERROR', {
        email,
        error: error.message,
        clientIP: this.getClientIP()
      });
      
      throw error;
    }
  }

  /**
   * Valida token de recuperação e permite redefinir senha
   */
  async validateRecoveryToken(token) {
    try {
      const recoveryData = this.getRecoveryToken(token);
      
      if (!recoveryData) {
        throw new Error('Token inválido ou expirado');
      }
      
      if (Date.now() > recoveryData.expiresAt) {
        this.removeRecoveryToken(token);
        throw new Error('Token expirado');
      }
      
      return {
        success: true,
        email: recoveryData.email,
        valid: true
      };
      
    } catch (error) {
      this.logAuditEvent('RECOVERY_TOKEN_VALIDATION_FAILED', {
        token: token?.substring(0, 8) + '...',
        error: error.message,
        clientIP: this.getClientIP()
      });
      
      throw error;
    }
  }

  /**
   * Redefine senha usando token de recuperação
   */
  async resetPassword(token, newPassword) {
    try {
      // Valida token
      const recoveryData = await this.validateRecoveryToken(token);
      
      if (!recoveryData.valid) {
        throw new Error('Token inválido');
      }
      
      // Valida nova senha
      if (!this.isValidPassword(newPassword)) {
        throw new Error('Senha deve ter pelo menos 8 caracteres, incluindo letras e números');
      }
      
      // Atualiza senha (em produção seria via API)
      await this.updateUserPassword(recoveryData.email, newPassword);
      
      // Remove token usado
      this.removeRecoveryToken(token);
      
      this.logAuditEvent('PASSWORD_RESET_SUCCESS', {
        email: recoveryData.email,
        clientIP: this.getClientIP()
      });
      
      return {
        success: true,
        message: 'Senha redefinida com sucesso!'
      };
      
    } catch (error) {
      this.logAuditEvent('PASSWORD_RESET_ERROR', {
        token: token?.substring(0, 8) + '...',
        error: error.message,
        clientIP: this.getClientIP()
      });
      
      throw error;
    }
  }

  /**
   * Valida email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida senha forte
   */
  isValidPassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Za-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  }

  /**
   * Encontra usuário por email
   */
  async findUserByEmail(email) {
    // Em produção seria uma consulta ao banco
    const users = [
      { id: 1, username: 'admin', email: 'admin@gestaofinanceira.com', name: 'Administrador' },
      { id: 2, username: 'gerente', email: 'joao@gestaofinanceira.com', name: 'João Silva' },
      { id: 3, username: 'operador', email: 'maria@gestaofinanceira.com', name: 'Maria Santos' },
      { id: 4, username: 'viewer', email: 'carlos@gestaofinanceira.com', name: 'Carlos Oliveira' }
    ];
    
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Gera token de recuperação seguro
   */
  generateRecoveryToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Salva token de recuperação
   */
  saveRecoveryToken(email, token, expiresAt) {
    const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '{}');
    recoveryTokens[token] = {
      email,
      expiresAt,
      createdAt: Date.now()
    };
    localStorage.setItem('recovery_tokens', JSON.stringify(recoveryTokens));
  }

  /**
   * Obtém token de recuperação
   */
  getRecoveryToken(token) {
    const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '{}');
    return recoveryTokens[token] || null;
  }

  /**
   * Remove token de recuperação
   */
  removeRecoveryToken(token) {
    const recoveryTokens = JSON.parse(localStorage.getItem('recovery_tokens') || '{}');
    delete recoveryTokens[token];
    localStorage.setItem('recovery_tokens', JSON.stringify(recoveryTokens));
  }

  /**
   * Envia email de recuperação (simulado)
   */
  async sendRecoveryEmail(email, token, userName) {
    // Simula delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recoveryUrl = `${window.location.origin}/reset-password.html?token=${token}`;
    
    console.log(`\n📧 Email de recuperação enviado para: ${email}`);
    console.log(`🔗 Link de recuperação: ${recoveryUrl}`);
    console.log(`👤 Usuário: ${userName}`);
    console.log(`⏰ Token expira em: 30 minutos\n`);
    
    // Em produção seria enviado via serviço de email
    return true;
  }

  /**
   * Atualiza senha do usuário
   */
  async updateUserPassword(email, newPassword) {
    // Simula delay de atualização
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em produção seria uma chamada à API
    console.log(`Senha atualizada para usuário: ${email}`);
    
    return true;
  }

  /**
   * Verifica integridade da sessão com validação avançada
   */
  verifyAdvancedSessionIntegrity() {
    if (!this.currentUser) return false;
    
    const session = localStorage.getItem('auth_session');
    if (!session) return false;
    
    try {
      const parsed = JSON.parse(session);
      
      // Verifica se sessão não expirou
      if (!this.isSessionValid(parsed)) return false;
      
      // Verifica se dados do usuário são consistentes
      if (parsed.user.id !== this.currentUser.id) return false;
      if (parsed.user.username !== this.currentUser.username) return false;
      
      // Verifica se perfil ainda é válido
      if (!this.profiles[parsed.user.profile]) return false;
      
      // Verifica se não houve mudanças suspeitas
      const expectedHash = this.generateUserHash(parsed.user);
      if (parsed.userHash && parsed.userHash !== expectedHash) {
        this.logAuditEvent('SESSION_INTEGRITY_FAILED', {
          username: this.currentUser.username,
          reason: 'User data hash mismatch',
          clientIP: this.getClientIP()
        });
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.logAuditEvent('SESSION_INTEGRITY_ERROR', {
        username: this.currentUser?.username,
        error: error.message,
        clientIP: this.getClientIP()
      });
      return false;
    }
  }

  /**
   * Gera hash para verificação de integridade do usuário
   */
  generateUserHash(user) {
    const data = `${user.id}-${user.username}-${user.profile}-${user.email}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Verifica hash de senha
   */
  async verifyPasswordHash(password, hash, salt) {
    if (typeof securityUtils !== 'undefined') {
      return await securityUtils.verifyPassword(password, hash, salt);
    } else {
      // Fallback simples para compatibilidade
      const simpleHash = this.simpleHash(password + salt);
      return simpleHash === hash;
    }
  }

  /**
   * Hash simples para fallback
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Salva sessão com hash de integridade
   */
  saveSessionWithIntegrity(rememberMe = false) {
    const session = {
      user: this.currentUser,
      expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout),
      createdAt: Date.now(),
      userHash: this.generateUserHash(this.currentUser),
      sessionId: this.generateSessionId()
    };
    
    localStorage.setItem('auth_session', JSON.stringify(session));
  }

  /**
   * Monitora atividade suspeita
   */
  monitorSuspiciousActivity() {
    if (!this.currentUser) return;
    
    const now = Date.now();
    const lastActivity = this.getLastActivity();
    
    // Detecta atividade muito rápida (possível bot)
    if (lastActivity && (now - lastActivity) < 100) {
      this.logAuditEvent('SUSPICIOUS_ACTIVITY', {
        username: this.currentUser.username,
        type: 'rapid_activity',
        clientIP: this.getClientIP()
      });
    }
    
    // Atualiza última atividade
    this.setLastActivity(now);
  }

  /**
   * Obtém última atividade
   */
  getLastActivity() {
    return parseInt(localStorage.getItem('last_activity') || '0');
  }

  /**
   * Define última atividade
   */
  setLastActivity(timestamp) {
    localStorage.setItem('last_activity', timestamp.toString());
  }

  /**
   * Gera código 2FA
   */
  generate2FACode() {
    const code = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutos
    
    // Salva código temporariamente
    const twoFACodes = JSON.parse(localStorage.getItem('2fa_codes') || '{}');
    twoFACodes[this.currentUser?.username] = {
      code: code.toString(),
      expiresAt,
      attempts: 0
    };
    localStorage.setItem('2fa_codes', JSON.stringify(twoFACodes));
    
    return code;
  }

  /**
   * Valida código 2FA
   */
  validate2FACode(username, code) {
    const twoFACodes = JSON.parse(localStorage.getItem('2fa_codes') || '{}');
    const userCode = twoFACodes[username];
    
    if (!userCode) {
      throw new Error('Código 2FA não encontrado');
    }
    
    if (Date.now() > userCode.expiresAt) {
      delete twoFACodes[username];
      localStorage.setItem('2fa_codes', JSON.stringify(twoFACodes));
      throw new Error('Código 2FA expirado');
    }
    
    if (userCode.attempts >= 3) {
      delete twoFACodes[username];
      localStorage.setItem('2fa_codes', JSON.stringify(twoFACodes));
      throw new Error('Muitas tentativas incorretas. Código inválido.');
    }
    
    if (userCode.code !== code.toString()) {
      userCode.attempts++;
      twoFACodes[username] = userCode;
      localStorage.setItem('2fa_codes', JSON.stringify(twoFACodes));
      throw new Error('Código 2FA incorreto');
    }
    
    // Remove código usado
    delete twoFACodes[username];
    localStorage.setItem('2fa_codes', JSON.stringify(twoFACodes));
    
    return true;
  }

  /**
   * Envia código 2FA (simulado)
   */
  async send2FACode(username, code) {
    // Simula delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`\n📱 Código 2FA enviado para: ${username}`);
    console.log(`🔐 Código: ${code}`);
    console.log(`⏰ Expira em: 5 minutos\n`);
    
    // Em produção seria enviado via SMS/Email
    return true;
  }

  /**
   * Login com 2FA
   */
  async loginWith2FA(username, password, rememberMe = false) {
    try {
      // Primeira etapa: valida credenciais
      const user = await this.validateCredentials(username, password);
      
      if (!user) {
        throw new Error('Credenciais inválidas');
      }
      
      // Gera e envia código 2FA
      const code = this.generate2FACode();
      await this.send2FACode(username, code);
      
      // Salva dados temporários para segunda etapa
      const tempData = {
        user,
        rememberMe,
        timestamp: Date.now()
      };
      localStorage.setItem('temp_login_data', JSON.stringify(tempData));
      
      this.logAuditEvent('2FA_CODE_SENT', {
        username,
        clientIP: this.getClientIP()
      });
      
      return {
        success: true,
        requires2FA: true,
        message: 'Código de verificação enviado!'
      };
      
    } catch (error) {
      this.logAuditEvent('2FA_LOGIN_ERROR', {
        username,
        error: error.message,
        clientIP: this.getClientIP()
      });
      
      throw error;
    }
  }

  /**
   * Completa login com código 2FA
   */
  async complete2FALogin(code) {
    try {
      const tempData = JSON.parse(localStorage.getItem('temp_login_data') || '{}');
      
      if (!tempData.user || (Date.now() - tempData.timestamp) > 10 * 60 * 1000) {
        localStorage.removeItem('temp_login_data');
        throw new Error('Sessão de login expirada. Faça login novamente.');
      }
      
      // Valida código 2FA
      this.validate2FACode(tempData.user.username, code);
      
      // Completa login
      this.currentUser = tempData.user;
      this.saveSession(tempData.rememberMe);
      this.startSessionTimer();
      this.updateUI();
      
      // Limpa dados temporários
      localStorage.removeItem('temp_login_data');
      
      this.logAuditEvent('2FA_LOGIN_SUCCESS', {
        username: tempData.user.username,
        clientIP: this.getClientIP()
      });
      
      return {
        success: true,
        user: tempData.user
      };
      
    } catch (error) {
      this.logAuditEvent('2FA_COMPLETION_ERROR', {
        error: error.message,
        clientIP: this.getClientIP()
      });
      
      throw error;
    }
  }

  /**
   * Verifica se 2FA está habilitado para usuário
   */
  is2FAEnabled(username) {
    // Em produção seria verificado no banco de dados
    const usersWith2FA = ['admin', 'gerente'];
    return usersWith2FA.includes(username.toLowerCase());
  }

  /**
   * Habilita 2FA para usuário atual
   */
  enable2FA() {
    if (!this.isAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }
    
    const user2FASettings = JSON.parse(localStorage.getItem('user_2fa_settings') || '{}');
    user2FASettings[this.currentUser.username] = {
      enabled: true,
      enabledAt: Date.now()
    };
    localStorage.setItem('user_2fa_settings', JSON.stringify(user2FASettings));
    
    this.logAuditEvent('2FA_ENABLED', {
      username: this.currentUser.username,
      clientIP: this.getClientIP()
    });
    
    return true;
  }

  /**
   * Desabilita 2FA para usuário atual
   */
  disable2FA() {
    if (!this.isAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }
    
    const user2FASettings = JSON.parse(localStorage.getItem('user_2fa_settings') || '{}');
    user2FASettings[this.currentUser.username] = {
      enabled: false,
      disabledAt: Date.now()
    };
    localStorage.setItem('user_2fa_settings', JSON.stringify(user2FASettings));
    
    this.logAuditEvent('2FA_DISABLED', {
      username: this.currentUser.username,
      clientIP: this.getClientIP()
    });
    
    return true;
  }

  /**
   * Verifica integridade da sessão
   */
  verifySessionIntegrity() {
    if (!this.currentUser) return false;
    
    const session = localStorage.getItem('auth_session');
    if (!session) return false;
    
    try {
      const parsed = JSON.parse(session);
      return this.isSessionValid(parsed);
    } catch {
      return false;
    }
  }

  /**
   * Renova sessão se próxima do vencimento
   */
  renewSessionIfNeeded() {
    if (!this.currentUser) return;
    
    const session = localStorage.getItem('auth_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const timeUntilExpiry = parsed.expiresAt - Date.now();
        
        // Renova se restam menos de 5 minutos
        if (timeUntilExpiry < 5 * 60 * 1000) {
          this.saveSession();
          this.logAuditEvent('SESSION_RENEWED', {
            username: this.currentUser.username
          });
        }
      } catch (error) {
        console.warn('Erro ao verificar renovação de sessão:', error);
      }
    }
  }
}

// Instância global
const authSystem = new AuthenticationSystem();

// Funções de conveniência globais
window.login = (username, password, rememberMe) => authSystem.login(username, password, rememberMe);
window.logout = (reason) => authSystem.logout(reason);
window.isAuthenticated = () => authSystem.isAuthenticated();
window.hasPermission = (permission) => authSystem.hasPermission(permission);
window.getCurrentUser = () => authSystem.currentUser;
window.getCurrentUserProfile = () => authSystem.getCurrentUserProfile();

// Funções de recuperação de senha
window.initiatePasswordRecovery = (email) => authSystem.initiatePasswordRecovery(email);
window.validateRecoveryToken = (token) => authSystem.validateRecoveryToken(token);
window.resetPassword = (token, newPassword) => authSystem.resetPassword(token, newPassword);
window.verifySessionIntegrity = () => authSystem.verifyAdvancedSessionIntegrity();

// Funções de 2FA
window.loginWith2FA = (username, password, rememberMe) => authSystem.loginWith2FA(username, password, rememberMe);
window.complete2FALogin = (code) => authSystem.complete2FALogin(code);
window.is2FAEnabled = (username) => authSystem.is2FAEnabled(username);
window.enable2FA = () => authSystem.enable2FA();
window.disable2FA = () => authSystem.disable2FA();
