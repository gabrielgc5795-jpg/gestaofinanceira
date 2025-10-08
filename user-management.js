/**
 * Sistema de Gestão de Usuários Internos
 * Permite ao admin criar, editar e gerenciar perfis de usuário
 */

class UserManagementSystem {
  constructor() {
    this.users = this.loadUsers();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  async init() {
    this.setupEventListeners();
    await this.loadDefaultUsers();
  }

  /**
   * Carrega usuários do localStorage de forma segura
   */
  async loadUsers() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return await secureStorage.getItem('system_users') || [];
      } else {
        const savedUsers = localStorage.getItem('system_users');
        return savedUsers ? JSON.parse(savedUsers) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }

  /**
   * Salva usuários no localStorage de forma segura
   */
  async saveUsers() {
    if (typeof secureStorage !== 'undefined') {
      await secureStorage.setItem('system_users', this.users);
    } else {
      localStorage.setItem('system_users', JSON.stringify(this.users));
    }
  }

  /**
   * Carrega usuários padrão se não existirem
   */
  async loadDefaultUsers() {
    if (this.users.length === 0) {
      this.users = [
        {
          id: 1,
          username: 'admin',
          name: 'Administrador do Sistema',
          email: 'admin@gestaofinanceira.com',
          profile: 'admin',
          passwordHash: 'a1b2c3d4e5f6', // Hash da senha 'admin123'
          passwordSalt: 'salt123',
          active: true,
          createdAt: new Date().toISOString(),
          lastLogin: null,
          permissions: ['*']
        }
      ];
      await this.saveUsers();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando a página de usuários for carregada
  }

  /**
   * Obtém todos os usuários
   */
  getUsers() {
    return this.users.filter(user => user.active);
  }

  /**
   * Obtém usuário por ID
   */
  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  /**
   * Obtém usuário por username
   */
  getUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  /**
   * Cria novo usuário
   */
  createUser(userData) {
    // Validações
    if (!userData.username || !userData.password || !userData.name || !userData.email) {
      throw new Error('Todos os campos obrigatórios devem ser preenchidos');
    }

    if (this.getUserByUsername(userData.username)) {
      throw new Error('Nome de usuário já existe');
    }

    if (this.users.find(user => user.email === userData.email)) {
      throw new Error('Email já cadastrado');
    }

    // Cria novo usuário
    const newUser = {
      id: Math.max(...this.users.map(u => u.id), 0) + 1,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      profile: userData.profile || 'operator', // Default to operator
      password: userData.password,
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      permissions: this.getProfilePermissions(userData.profile || 'operator')
    };

    this.users.push(newUser);
    this.saveUsers();

    return newUser;
  }

  /**
   * Atualiza usuário existente
   */
  updateUser(id, userData) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const existingUser = this.users[userIndex];
    
    // Verifica se username não está sendo usado por outro usuário
    if (userData.username && userData.username !== existingUser.username) {
      if (this.getUserByUsername(userData.username)) {
        throw new Error('Nome de usuário já existe');
      }
    }

    // Verifica se email não está sendo usado por outro usuário
    if (userData.email && userData.email !== existingUser.email) {
      if (this.users.find(user => user.email === userData.email && user.id !== id)) {
        throw new Error('Email já cadastrado');
      }
    }

    // Atualiza dados
    const updatedUser = {
      ...existingUser,
      ...userData,
      id: existingUser.id, // Mantém ID original
      createdAt: existingUser.createdAt, // Mantém data de criação
      permissions: userData.profile ? this.getProfilePermissions(userData.profile) : existingUser.permissions
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    return updatedUser;
  }

  /**
   * Desativa usuário (soft delete)
   */
  deactivateUser(id) {
    const user = this.getUserById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    user.active = false;
    this.saveUsers();

    return user;
  }

  /**
   * Reativa usuário
   */
  activateUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    user.active = true;
    this.saveUsers();

    return user;
  }

  /**
   * Altera senha do usuário
   */
  changePassword(id, newPassword) {
    const user = this.getUserById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    user.password = newPassword;
    this.saveUsers();

    return user;
  }

  /**
   * Obtém permissões por perfil
   */
  getProfilePermissions(profile) {
    const profilePermissions = {
      admin: ['*'],
      manager: [
        'dashboard.view', 'transacoes.view', 'transacoes.create', 'transacoes.edit',
        'relatorios.view', 'relatorios.export', 'orcamento.view', 'orcamento.edit',
        'metas.view', 'metas.create', 'notas-fiscais.view', 'backup.create',
        'users.view', 'clients.view', 'clients.create', 'clients.edit',
        'suppliers.view', 'suppliers.create', 'suppliers.edit', 'inventory.view'
      ],
      operator: [
        'dashboard.view', 'transacoes.view', 'transacoes.create',
        'notas-fiscais.view', 'notas-fiscais.create', 'notas-fiscais.edit',
        'clients.view', 'clients.create', 'suppliers.view', 'suppliers.create',
        'inventory.view', 'inventory.create'
      ]
    };

    return profilePermissions[profile] || profilePermissions.operator; // Default to operator
  }

  /**
   * Obtém estatísticas de usuários
   */
  getUsersStats() {
    const activeUsers = this.users.filter(user => user.active);
    const inactiveUsers = this.users.filter(user => !user.active);
    
    const profileCounts = {};
    activeUsers.forEach(user => {
      profileCounts[user.profile] = (profileCounts[user.profile] || 0) + 1;
    });

    return {
      total: this.users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      byProfile: profileCounts,
      recentLogins: activeUsers
        .filter(user => user.lastLogin)
        .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
        .slice(0, 5)
    };
  }

  /**
   * Valida credenciais do usuário com hash de senha
   */
  async validateUserCredentials(username, password) {
    const user = this.getUserByUsername(username);
    
    if (!user || !user.active) {
      return null;
    }

    // Verifica senha usando hash se disponível
    if (user.passwordHash && user.passwordSalt) {
      const isValid = await this.verifyPasswordHash(password, user.passwordHash, user.passwordSalt);
      if (!isValid) {
        return null;
      }
    } else if (user.password !== password) {
      // Fallback para senhas antigas em texto claro
      return null;
    }

    // Atualiza último login
    user.lastLogin = new Date().toISOString();
    await this.saveUsers();

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      profile: user.profile,
      avatar: user.avatar,
      createdAt: user.createdAt,
      permissions: user.permissions
    };
  }

  /**
   * Renderiza interface de gestão de usuários
   */
  renderUserManagement() {
    const container = document.getElementById('user-management-container');
    if (!container) return;

    const stats = this.getUsersStats();
    const users = this.getUsers();

    container.innerHTML = `
      <div class="user-management">
        <div class="page-header">
          <h2>Gestão de Usuários</h2>
          <button class="primary-btn" onclick="userManagement.openCreateUserModal()">
            <i class="fas fa-plus"></i>
            Novo Usuário
          </button>
        </div>

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.total}</h3>
              <p>Total de Usuários</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.active}</h3>
              <p>Usuários Ativos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user-times"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.inactive}</h3>
              <p>Usuários Inativos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.byProfile.admin || 0}</h3>
              <p>Administradores</p>
            </div>
          </div>
        </div>

        <!-- Lista de Usuários -->
        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Email</th>
                <th>Último Login</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">
                        <i class="fas fa-user"></i>
                      </div>
                      <div>
                        <div class="user-name">${user.name}</div>
                        <div class="user-username">@${user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="profile-badge profile-${user.profile}">
                      ${this.getProfileDisplayName(user.profile)}
                    </span>
                  </td>
                  <td>${user.email}</td>
                  <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</td>
                  <td>
                    <span class="status-badge status-${user.active ? 'active' : 'inactive'}">
                      ${user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon" onclick="userManagement.openEditUserModal(${user.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon" onclick="userManagement.openChangePasswordModal(${user.id})" title="Alterar Senha">
                        <i class="fas fa-key"></i>
                      </button>
                      ${user.active ? 
                        `<button class="btn-icon btn-danger" onclick="userManagement.deactivateUser(${user.id})" title="Desativar">
                          <i class="fas fa-ban"></i>
                        </button>` :
                        `<button class="btn-icon btn-success" onclick="userManagement.activateUser(${user.id})" title="Ativar">
                          <i class="fas fa-check"></i>
                        </button>`
                      }
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Obtém nome de exibição do perfil
   */
  getProfileDisplayName(profile) {
    const names = {
      admin: 'Administrador',
      manager: 'Gerente',
      operator: 'Operador'
    };
    return names[profile] || profile;
  }

  /**
   * Abre modal para criar usuário
   */
  openCreateUserModal() {
    const modal = this.createUserModal();
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para editar usuário
   */
  openEditUserModal(userId) {
    const user = this.getUserById(userId);
    if (!user) return;

    const modal = this.createUserModal(user);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para alterar senha
   */
  openChangePasswordModal(userId) {
    const user = this.getUserById(userId);
    if (!user) return;

    const modal = this.createChangePasswordModal(user);
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de usuário
   */
  createUserModal(user = null) {
    const isEdit = !!user;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="user-form">
          <div class="form-group">
            <label for="username">Nome de Usuário *</label>
            <input type="text" id="username" name="username" value="${user?.username || ''}" required>
          </div>
          <div class="form-group">
            <label for="name">Nome Completo *</label>
            <input type="text" id="name" name="name" value="${user?.name || ''}" required>
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" value="${user?.email || ''}" required>
          </div>
          <div class="form-group">
            <label for="profile">Perfil *</label>
            <select id="profile" name="profile" required>
              <option value="operator" ${user?.profile === 'operator' ? 'selected' : ''}>Operador</option>
              <option value="manager" ${user?.profile === 'manager' ? 'selected' : ''}>Gerente</option>
              <option value="admin" ${user?.profile === 'admin' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
          ${!isEdit ? `
            <div class="form-group">
              <label for="password">Senha *</label>
              <input type="password" id="password" name="password" required>
            </div>
          ` : ''}
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              ${isEdit ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#user-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const userData = Object.fromEntries(formData);

      try {
        if (isEdit) {
          this.updateUser(user.id, userData);
          showSuccess('Usuário atualizado com sucesso!');
        } else {
          this.createUser(userData);
          showSuccess('Usuário criado com sucesso!');
        }
        modal.remove();
        this.renderUserManagement();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal para alterar senha
   */
  createChangePasswordModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Alterar Senha - ${user.name}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="password-form">
          <div class="form-group">
            <label for="new-password">Nova Senha *</label>
            <input type="password" id="new-password" name="password" required minlength="6">
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirmar Senha *</label>
            <input type="password" id="confirm-password" name="confirmPassword" required minlength="6">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#password-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        showError('Erro', 'As senhas não coincidem');
        return;
      }

      try {
        this.changePassword(user.id, password);
        showSuccess('Senha alterada com sucesso!');
        modal.remove();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(userId) {
    try {
      const confirmed = await confirmAction(
        'Desativar Usuário',
        'Tem certeza que deseja desativar este usuário?',
        'Desativar'
      );

      if (confirmed) {
        this.deactivateUser(userId);
        showSuccess('Usuário desativado com sucesso!');
        this.renderUserManagement();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(userId) {
    try {
      this.activateUser(userId);
      showSuccess('Usuário ativado com sucesso!');
      this.renderUserManagement();
    } catch (error) {
      showError('Erro', error.message);
    }
  }
}

// Instância global
const userManagement = new UserManagementSystem();

// Exporta para uso global
window.userManagement = userManagement;

// Adiciona métodos de criptografia à instância global
userManagement.hashPassword = async function(password) {
  if (typeof securityUtils !== 'undefined') {
    return await securityUtils.hashPassword(password);
  } else {
    // Fallback simples
    const salt = this.generateSalt();
    const hash = this.simpleHash(password + salt);
    return { hash, salt };
  }
};

userManagement.verifyPasswordHash = async function(password, hash, salt) {
  if (typeof securityUtils !== 'undefined') {
    return await securityUtils.verifyPassword(password, hash, salt);
  } else {
    // Fallback simples
    const simpleHash = this.simpleHash(password + salt);
    return simpleHash === hash;
  }
};

userManagement.generateSalt = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

userManagement.simpleHash = function(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};
