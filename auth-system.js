/**
 * Sistema de Autenticação e Controle de Acesso
 * Fornece login, logout, controle de sessão e permissões por perfil
 */

class AuthenticationSystem {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
    this.sessionTimer = null;
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
   * Realiza login do usuário
   */
  async login(username, password, rememberMe = false) {
    try {
      // Simula validação (em produção seria uma API)
      const user = await this.validateCredentials(username, password);
      
      if (user) {
        this.currentUser = user;
        this.saveSession(rememberMe);
        this.startSessionTimer();
        this.updateUI();
        
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
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      if (typeof showError === 'function') {
        showError('Erro no Login', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida credenciais do usuário
   */
  async validateCredentials(username, password) {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usa sistema de gestão de usuários se disponível
    if (typeof userManagement !== 'undefined') {
      return userManagement.validateUserCredentials(username, password);
    }
    
    // Fallback para usuários demo (compatibilidade)
    const demoUsers = {
      'admin': {
        password: 'admin123',
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
        password: 'gerente123',
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
        password: 'operador123',
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
        password: 'viewer123',
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
    if (userCredentials && userCredentials.password === password) {
      return userCredentials.user;
    }
    
    return null;
  }

  /**
   * Salva sessão no localStorage
   */
  saveSession(rememberMe = false) {
    const session = {
      user: this.currentUser,
      expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout),
      createdAt: Date.now()
    };
    
    localStorage.setItem('auth_session', JSON.stringify(session));
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
      // Atualiza expiração na sessão salva
      this.saveSession();
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
   * Realiza logout do usuário
   */
  logout(reason = null) {
    const wasAuthenticated = this.isAuthenticated();
    
    // Log da ação
    if (typeof analytics !== 'undefined' && this.currentUser) {
      analytics.trackEvent('user_logout', {
        username: this.currentUser.username,
        reason: reason || 'manual'
      }, 'auth');
    }
    
    // Limpa dados da sessão
    this.currentUser = null;
    this.clearSessionTimer();
    localStorage.removeItem('auth_session');
    
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
