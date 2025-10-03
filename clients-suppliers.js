/**
 * Sistema de Cadastro de Clientes e Fornecedores
 * Gerencia cadastro completo de clientes e fornecedores
 */

class ClientsSuppliersSystem {
  constructor() {
    this.clients = this.loadClients();
    this.suppliers = this.loadSuppliers();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
  }

  /**
   * Carrega clientes do localStorage
   */
  loadClients() {
    const savedClients = localStorage.getItem('clients_data');
    return savedClients ? JSON.parse(savedClients) : [];
  }

  /**
   * Salva clientes no localStorage
   */
  saveClients() {
    localStorage.setItem('clients_data', JSON.stringify(this.clients));
  }

  /**
   * Carrega fornecedores do localStorage
   */
  loadSuppliers() {
    const savedSuppliers = localStorage.getItem('suppliers_data');
    return savedSuppliers ? JSON.parse(savedSuppliers) : [];
  }

  /**
   * Salva fornecedores no localStorage
   */
  saveSuppliers() {
    localStorage.setItem('suppliers_data', JSON.stringify(this.suppliers));
  }

  /**
   * Carrega dados padrão se não existirem
   */
  loadDefaultData() {
    if (this.clients.length === 0) {
      this.clients = [
        {
          id: 1,
          name: 'João Silva',
          type: 'individual', // individual ou company
          document: '123.456.789-00',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          address: {
            street: 'Rua das Flores, 123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          },
          status: 'active', // active, inactive, blocked
          category: 'Varejo',
          tags: ['premium', 'frequente'],
          notes: 'Cliente preferencial',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Empresa ABC Ltda',
          type: 'company',
          document: '12.345.678/0001-90',
          email: 'contato@empresaabc.com',
          phone: '(11) 3333-4444',
          address: {
            street: 'Av. Paulista, 1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100'
          },
          status: 'active',
          category: 'Corporativo',
          tags: ['corporativo', 'grande-volume'],
          notes: 'Pagamento em 30 dias',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveClients();
    }

    if (this.suppliers.length === 0) {
      this.suppliers = [
        {
          id: 1,
          name: 'Fornecedor XYZ Ltda',
          type: 'company',
          document: '98.765.432/0001-10',
          email: 'vendas@fornecedorxyz.com',
          phone: '(11) 2222-3333',
          address: {
            street: 'Rua Industrial, 500',
            neighborhood: 'Distrito Industrial',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '02000-000'
          },
          status: 'active',
          category: 'Materiais',
          paymentTerms: '30 dias',
          tags: ['confiavel', 'rapida-entrega'],
          notes: 'Desconto de 5% para pagamento à vista',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveSuppliers();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando as páginas forem carregadas
  }

  // ===== GESTÃO DE CLIENTES =====

  /**
   * Obtém todos os clientes
   */
  getClients() {
    return this.clients.filter(client => client.status !== 'deleted');
  }

  /**
   * Obtém cliente por ID
   */
  getClientById(id) {
    return this.clients.find(client => client.id === id);
  }

  /**
   * Cria novo cliente
   */
  createClient(clientData) {
    // Validações
    if (!clientData.name || !clientData.document) {
      throw new Error('Nome e documento são obrigatórios');
    }

    if (this.clients.find(client => client.document === clientData.document)) {
      throw new Error('Documento já cadastrado');
    }

    const newClient = {
      id: Math.max(...this.clients.map(c => c.id), 0) + 1,
      name: clientData.name,
      type: clientData.type || 'individual',
      document: clientData.document,
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: {
        street: clientData.address?.street || '',
        neighborhood: clientData.address?.neighborhood || '',
        city: clientData.address?.city || '',
        state: clientData.address?.state || '',
        zipCode: clientData.address?.zipCode || ''
      },
      status: 'active',
      category: clientData.category || '',
      tags: clientData.tags || [],
      notes: clientData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.clients.push(newClient);
    this.saveClients();

    return newClient;
  }

  /**
   * Atualiza cliente existente
   */
  updateClient(id, clientData) {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      throw new Error('Cliente não encontrado');
    }

    // Verifica se documento não está sendo usado por outro cliente
    if (clientData.document && clientData.document !== this.clients[clientIndex].document) {
      if (this.clients.find(client => client.document === clientData.document && client.id !== id)) {
        throw new Error('Documento já cadastrado');
      }
    }

    const updatedClient = {
      ...this.clients[clientIndex],
      ...clientData,
      id: this.clients[clientIndex].id,
      createdAt: this.clients[clientIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    this.clients[clientIndex] = updatedClient;
    this.saveClients();

    return updatedClient;
  }

  /**
   * Remove cliente (soft delete)
   */
  removeClient(id) {
    const client = this.getClientById(id);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    client.status = 'deleted';
    client.updatedAt = new Date().toISOString();
    this.saveClients();

    return client;
  }

  /**
   * Busca clientes
   */
  searchClients(query) {
    const searchTerm = query.toLowerCase();
    return this.getClients().filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.document.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.category.toLowerCase().includes(searchTerm)
    );
  }

  // ===== GESTÃO DE FORNECEDORES =====

  /**
   * Obtém todos os fornecedores
   */
  getSuppliers() {
    return this.suppliers.filter(supplier => supplier.status !== 'deleted');
  }

  /**
   * Obtém fornecedor por ID
   */
  getSupplierById(id) {
    return this.suppliers.find(supplier => supplier.id === id);
  }

  /**
   * Cria novo fornecedor
   */
  createSupplier(supplierData) {
    // Validações
    if (!supplierData.name || !supplierData.document) {
      throw new Error('Nome e documento são obrigatórios');
    }

    if (this.suppliers.find(supplier => supplier.document === supplierData.document)) {
      throw new Error('Documento já cadastrado');
    }

    const newSupplier = {
      id: Math.max(...this.suppliers.map(s => s.id), 0) + 1,
      name: supplierData.name,
      type: supplierData.type || 'company',
      document: supplierData.document,
      email: supplierData.email || '',
      phone: supplierData.phone || '',
      address: {
        street: supplierData.address?.street || '',
        neighborhood: supplierData.address?.neighborhood || '',
        city: supplierData.address?.city || '',
        state: supplierData.address?.state || '',
        zipCode: supplierData.address?.zipCode || ''
      },
      status: 'active',
      category: supplierData.category || '',
      paymentTerms: supplierData.paymentTerms || '30 dias',
      tags: supplierData.tags || [],
      notes: supplierData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.suppliers.push(newSupplier);
    this.saveSuppliers();

    return newSupplier;
  }

  /**
   * Atualiza fornecedor existente
   */
  updateSupplier(id, supplierData) {
    const supplierIndex = this.suppliers.findIndex(supplier => supplier.id === id);
    if (supplierIndex === -1) {
      throw new Error('Fornecedor não encontrado');
    }

    // Verifica se documento não está sendo usado por outro fornecedor
    if (supplierData.document && supplierData.document !== this.suppliers[supplierIndex].document) {
      if (this.suppliers.find(supplier => supplier.document === supplierData.document && supplier.id !== id)) {
        throw new Error('Documento já cadastrado');
      }
    }

    const updatedSupplier = {
      ...this.suppliers[supplierIndex],
      ...supplierData,
      id: this.suppliers[supplierIndex].id,
      createdAt: this.suppliers[supplierIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    this.suppliers[supplierIndex] = updatedSupplier;
    this.saveSuppliers();

    return updatedSupplier;
  }

  /**
   * Remove fornecedor (soft delete)
   */
  removeSupplier(id) {
    const supplier = this.getSupplierById(id);
    if (!supplier) {
      throw new Error('Fornecedor não encontrado');
    }

    supplier.status = 'deleted';
    supplier.updatedAt = new Date().toISOString();
    this.saveSuppliers();

    return supplier;
  }

  /**
   * Busca fornecedores
   */
  searchSuppliers(query) {
    const searchTerm = query.toLowerCase();
    return this.getSuppliers().filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm) ||
      supplier.document.includes(searchTerm) ||
      supplier.email.toLowerCase().includes(searchTerm) ||
      supplier.category.toLowerCase().includes(searchTerm)
    );
  }

  // ===== RELATÓRIOS E ESTATÍSTICAS =====

  /**
   * Obtém estatísticas de clientes e fornecedores
   */
  getStats() {
    const activeClients = this.getClients().filter(client => client.status === 'active');
    const activeSuppliers = this.getSuppliers().filter(supplier => supplier.status === 'active');

    const clientTypes = {};
    activeClients.forEach(client => {
      clientTypes[client.type] = (clientTypes[client.type] || 0) + 1;
    });

    const supplierCategories = {};
    activeSuppliers.forEach(supplier => {
      supplierCategories[supplier.category] = (supplierCategories[supplier.category] || 0) + 1;
    });

    return {
      clients: {
        total: activeClients.length,
        byType: clientTypes,
        byCategory: this.getClientCategories()
      },
      suppliers: {
        total: activeSuppliers.length,
        byCategory: supplierCategories
      }
    };
  }

  /**
   * Obtém categorias de clientes
   */
  getClientCategories() {
    const categories = {};
    this.getClients().forEach(client => {
      if (client.category) {
        categories[client.category] = (categories[client.category] || 0) + 1;
      }
    });
    return categories;
  }

  /**
   * Renderiza interface de clientes
   */
  renderClientsInterface() {
    const container = document.getElementById('clients-container');
    if (!container) return;

    const clients = this.getClients();
    const stats = this.getStats();

    container.innerHTML = `
      <div class="clients-interface">
        <div class="page-header">
          <h2>Clientes</h2>
          <button class="primary-btn" onclick="clientsSuppliers.openClientModal()">
            <i class="fas fa-plus"></i>
            Novo Cliente
          </button>
        </div>

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.clients.total}</h3>
              <p>Total de Clientes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.clients.byType.individual || 0}</h3>
              <p>Pessoas Físicas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.clients.byType.company || 0}</h3>
              <p>Pessoas Jurídicas</p>
            </div>
          </div>
        </div>

        <!-- Filtros e Busca -->
        <div class="filters-section">
          <div class="search-box">
            <input type="text" id="client-search" placeholder="Buscar clientes..." onkeyup="clientsSuppliers.searchClients()">
            <i class="fas fa-search"></i>
          </div>
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">Todos</button>
            <button class="filter-btn" data-filter="individual">Pessoa Física</button>
            <button class="filter-btn" data-filter="company">Pessoa Jurídica</button>
            <button class="filter-btn" data-filter="active">Ativos</button>
          </div>
        </div>

        <!-- Lista de Clientes -->
        <div class="clients-grid" id="clients-grid">
          ${clients.map(client => this.renderClientCard(client)).join('')}
        </div>
      </div>
    `;

    // Configura filtros
    this.setupClientFilters();
  }

  /**
   * Renderiza card do cliente
   */
  renderClientCard(client) {
    return `
      <div class="client-card" data-type="${client.type}" data-status="${client.status}">
        <div class="card-header">
          <div class="client-avatar">
            <i class="fas fa-${client.type === 'individual' ? 'user' : 'building'}"></i>
          </div>
          <div class="client-info">
            <h4>${client.name}</h4>
            <p class="client-type">${client.type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
          </div>
          <div class="client-status">
            <span class="status-badge status-${client.status}">${client.status}</span>
          </div>
        </div>
        
        <div class="card-content">
          <div class="client-details">
            <p><i class="fas fa-id-card"></i> ${client.document}</p>
            ${client.email ? `<p><i class="fas fa-envelope"></i> ${client.email}</p>` : ''}
            ${client.phone ? `<p><i class="fas fa-phone"></i> ${client.phone}</p>` : ''}
            ${client.category ? `<p><i class="fas fa-tag"></i> ${client.category}</p>` : ''}
          </div>
          
          ${client.tags.length > 0 ? `
            <div class="client-tags">
              ${client.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="card-actions">
          <button class="btn-icon" onclick="clientsSuppliers.openClientModal(${client.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="clientsSuppliers.viewClientDetails(${client.id})" title="Ver Detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="clientsSuppliers.removeClient(${client.id})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza interface de fornecedores
   */
  renderSuppliersInterface() {
    const container = document.getElementById('suppliers-container');
    if (!container) return;

    const suppliers = this.getSuppliers();
    const stats = this.getStats();

    container.innerHTML = `
      <div class="suppliers-interface">
        <div class="page-header">
          <h2>Fornecedores</h2>
          <button class="primary-btn" onclick="clientsSuppliers.openSupplierModal()">
            <i class="fas fa-plus"></i>
            Novo Fornecedor
          </button>
        </div>

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.suppliers.total}</h3>
              <p>Total de Fornecedores</p>
            </div>
          </div>
        </div>

        <!-- Filtros e Busca -->
        <div class="filters-section">
          <div class="search-box">
            <input type="text" id="supplier-search" placeholder="Buscar fornecedores..." onkeyup="clientsSuppliers.searchSuppliers()">
            <i class="fas fa-search"></i>
          </div>
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">Todos</button>
            <button class="filter-btn" data-filter="active">Ativos</button>
          </div>
        </div>

        <!-- Lista de Fornecedores -->
        <div class="suppliers-grid" id="suppliers-grid">
          ${suppliers.map(supplier => this.renderSupplierCard(supplier)).join('')}
        </div>
      </div>
    `;

    // Configura filtros
    this.setupSupplierFilters();
  }

  /**
   * Renderiza card do fornecedor
   */
  renderSupplierCard(supplier) {
    return `
      <div class="supplier-card" data-status="${supplier.status}">
        <div class="card-header">
          <div class="supplier-avatar">
            <i class="fas fa-building"></i>
          </div>
          <div class="supplier-info">
            <h4>${supplier.name}</h4>
            <p class="supplier-category">${supplier.category}</p>
          </div>
          <div class="supplier-status">
            <span class="status-badge status-${supplier.status}">${supplier.status}</span>
          </div>
        </div>
        
        <div class="card-content">
          <div class="supplier-details">
            <p><i class="fas fa-id-card"></i> ${supplier.document}</p>
            ${supplier.email ? `<p><i class="fas fa-envelope"></i> ${supplier.email}</p>` : ''}
            ${supplier.phone ? `<p><i class="fas fa-phone"></i> ${supplier.phone}</p>` : ''}
            ${supplier.paymentTerms ? `<p><i class="fas fa-calendar"></i> ${supplier.paymentTerms}</p>` : ''}
          </div>
          
          ${supplier.tags.length > 0 ? `
            <div class="supplier-tags">
              ${supplier.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="card-actions">
          <button class="btn-icon" onclick="clientsSuppliers.openSupplierModal(${supplier.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="clientsSuppliers.viewSupplierDetails(${supplier.id})" title="Ver Detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="clientsSuppliers.removeSupplier(${supplier.id})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Configura filtros de clientes
   */
  setupClientFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        this.filterClients(filter);
      });
    });
  }

  /**
   * Configura filtros de fornecedores
   */
  setupSupplierFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        this.filterSuppliers(filter);
      });
    });
  }

  /**
   * Filtra clientes
   */
  filterClients(filter) {
    const cards = document.querySelectorAll('.client-card');
    cards.forEach(card => {
      const type = card.getAttribute('data-type');
      const status = card.getAttribute('data-status');
      
      let show = true;
      
      switch (filter) {
        case 'individual':
          show = type === 'individual';
          break;
        case 'company':
          show = type === 'company';
          break;
        case 'active':
          show = status === 'active';
          break;
        case 'all':
        default:
          show = true;
          break;
      }
      
      card.style.display = show ? 'block' : 'none';
    });
  }

  /**
   * Filtra fornecedores
   */
  filterSuppliers(filter) {
    const cards = document.querySelectorAll('.supplier-card');
    cards.forEach(card => {
      const status = card.getAttribute('data-status');
      
      let show = true;
      
      switch (filter) {
        case 'active':
          show = status === 'active';
          break;
        case 'all':
        default:
          show = true;
          break;
      }
      
      card.style.display = show ? 'block' : 'none';
    });
  }

  /**
   * Busca clientes
   */
  searchClients() {
    const query = document.getElementById('client-search')?.value || '';
    const clients = this.searchClients(query);
    
    const grid = document.getElementById('clients-grid');
    if (grid) {
      grid.innerHTML = clients.map(client => this.renderClientCard(client)).join('');
    }
  }

  /**
   * Busca fornecedores
   */
  searchSuppliers() {
    const query = document.getElementById('supplier-search')?.value || '';
    const suppliers = this.searchSuppliers(query);
    
    const grid = document.getElementById('suppliers-grid');
    if (grid) {
      grid.innerHTML = suppliers.map(supplier => this.renderSupplierCard(supplier)).join('');
    }
  }

  /**
   * Abre modal para criar/editar cliente
   */
  openClientModal(clientId = null) {
    const client = clientId ? this.getClientById(clientId) : null;
    const modal = this.createClientModal(client);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para criar/editar fornecedor
   */
  openSupplierModal(supplierId = null) {
    const supplier = supplierId ? this.getSupplierById(supplierId) : null;
    const modal = this.createSupplierModal(supplier);
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de cliente
   */
  createClientModal(client = null) {
    const isEdit = !!client;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="client-form">
          <div class="form-row">
            <div class="form-group">
              <label for="client-name">Nome/Razão Social *</label>
              <input type="text" id="client-name" name="name" value="${client?.name || ''}" required>
            </div>
            <div class="form-group">
              <label for="client-type">Tipo *</label>
              <select id="client-type" name="type" required>
                <option value="individual" ${client?.type === 'individual' ? 'selected' : ''}>Pessoa Física</option>
                <option value="company" ${client?.type === 'company' ? 'selected' : ''}>Pessoa Jurídica</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="client-document">CPF/CNPJ *</label>
              <input type="text" id="client-document" name="document" value="${client?.document || ''}" required>
            </div>
            <div class="form-group">
              <label for="client-category">Categoria</label>
              <input type="text" id="client-category" name="category" value="${client?.category || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="client-email">Email</label>
              <input type="email" id="client-email" name="email" value="${client?.email || ''}">
            </div>
            <div class="form-group">
              <label for="client-phone">Telefone</label>
              <input type="text" id="client-phone" name="phone" value="${client?.phone || ''}">
            </div>
          </div>
          
          <div class="form-section">
            <h4>Endereço</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="client-street">Rua</label>
                <input type="text" id="client-street" name="address.street" value="${client?.address?.street || ''}">
              </div>
              <div class="form-group">
                <label for="client-neighborhood">Bairro</label>
                <input type="text" id="client-neighborhood" name="address.neighborhood" value="${client?.address?.neighborhood || ''}">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="client-city">Cidade</label>
                <input type="text" id="client-city" name="address.city" value="${client?.address?.city || ''}">
              </div>
              <div class="form-group">
                <label for="client-state">Estado</label>
                <input type="text" id="client-state" name="address.state" value="${client?.address?.state || ''}">
              </div>
              <div class="form-group">
                <label for="client-zipcode">CEP</label>
                <input type="text" id="client-zipcode" name="address.zipCode" value="${client?.address?.zipCode || ''}">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="client-notes">Observações</label>
            <textarea id="client-notes" name="notes" rows="3">${client?.notes || ''}</textarea>
          </div>
          
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
    const form = modal.querySelector('#client-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Converte FormData para objeto
      const clientData = {
        name: formData.get('name'),
        type: formData.get('type'),
        document: formData.get('document'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        category: formData.get('category'),
        notes: formData.get('notes'),
        address: {
          street: formData.get('address.street'),
          neighborhood: formData.get('address.neighborhood'),
          city: formData.get('address.city'),
          state: formData.get('address.state'),
          zipCode: formData.get('address.zipCode')
        }
      };

      try {
        if (isEdit) {
          this.updateClient(client.id, clientData);
          showSuccess('Cliente atualizado com sucesso!');
        } else {
          this.createClient(clientData);
          showSuccess('Cliente criado com sucesso!');
        }
        modal.remove();
        this.renderClientsInterface();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de fornecedor
   */
  createSupplierModal(supplier = null) {
    const isEdit = !!supplier;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="supplier-form">
          <div class="form-row">
            <div class="form-group">
              <label for="supplier-name">Nome/Razão Social *</label>
              <input type="text" id="supplier-name" name="name" value="${supplier?.name || ''}" required>
            </div>
            <div class="form-group">
              <label for="supplier-category">Categoria</label>
              <input type="text" id="supplier-category" name="category" value="${supplier?.category || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="supplier-document">CNPJ *</label>
              <input type="text" id="supplier-document" name="document" value="${supplier?.document || ''}" required>
            </div>
            <div class="form-group">
              <label for="supplier-payment-terms">Condições de Pagamento</label>
              <input type="text" id="supplier-payment-terms" name="paymentTerms" value="${supplier?.paymentTerms || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="supplier-email">Email</label>
              <input type="email" id="supplier-email" name="email" value="${supplier?.email || ''}">
            </div>
            <div class="form-group">
              <label for="supplier-phone">Telefone</label>
              <input type="text" id="supplier-phone" name="phone" value="${supplier?.phone || ''}">
            </div>
          </div>
          
          <div class="form-section">
            <h4>Endereço</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="supplier-street">Rua</label>
                <input type="text" id="supplier-street" name="address.street" value="${supplier?.address?.street || ''}">
              </div>
              <div class="form-group">
                <label for="supplier-neighborhood">Bairro</label>
                <input type="text" id="supplier-neighborhood" name="address.neighborhood" value="${supplier?.address?.neighborhood || ''}">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="supplier-city">Cidade</label>
                <input type="text" id="supplier-city" name="address.city" value="${supplier?.address?.city || ''}">
              </div>
              <div class="form-group">
                <label for="supplier-state">Estado</label>
                <input type="text" id="supplier-state" name="address.state" value="${supplier?.address?.state || ''}">
              </div>
              <div class="form-group">
                <label for="supplier-zipcode">CEP</label>
                <input type="text" id="supplier-zipcode" name="address.zipCode" value="${supplier?.address?.zipCode || ''}">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="supplier-notes">Observações</label>
            <textarea id="supplier-notes" name="notes" rows="3">${supplier?.notes || ''}</textarea>
          </div>
          
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
    const form = modal.querySelector('#supplier-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Converte FormData para objeto
      const supplierData = {
        name: formData.get('name'),
        type: 'company', // Fornecedores são sempre empresas
        document: formData.get('document'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        category: formData.get('category'),
        paymentTerms: formData.get('paymentTerms'),
        notes: formData.get('notes'),
        address: {
          street: formData.get('address.street'),
          neighborhood: formData.get('address.neighborhood'),
          city: formData.get('address.city'),
          state: formData.get('address.state'),
          zipCode: formData.get('address.zipCode')
        }
      };

      try {
        if (isEdit) {
          this.updateSupplier(supplier.id, supplierData);
          showSuccess('Fornecedor atualizado com sucesso!');
        } else {
          this.createSupplier(supplierData);
          showSuccess('Fornecedor criado com sucesso!');
        }
        modal.remove();
        this.renderSuppliersInterface();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Remove cliente
   */
  async removeClient(id) {
    try {
      const confirmed = await confirmAction(
        'Remover Cliente',
        'Tem certeza que deseja remover este cliente?',
        'Remover'
      );

      if (confirmed) {
        this.removeClient(id);
        showSuccess('Cliente removido com sucesso!');
        this.renderClientsInterface();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Remove fornecedor
   */
  async removeSupplier(id) {
    try {
      const confirmed = await confirmAction(
        'Remover Fornecedor',
        'Tem certeza que deseja remover este fornecedor?',
        'Remover'
      );

      if (confirmed) {
        this.removeSupplier(id);
        showSuccess('Fornecedor removido com sucesso!');
        this.renderSuppliersInterface();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Visualiza detalhes do cliente
   */
  viewClientDetails(id) {
    const client = this.getClientById(id);
    if (!client) return;

    showInfo('Detalhes do Cliente', `
      <strong>Nome:</strong> ${client.name}<br>
      <strong>Tipo:</strong> ${client.type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica'}<br>
      <strong>Documento:</strong> ${client.document}<br>
      <strong>Email:</strong> ${client.email || 'Não informado'}<br>
      <strong>Telefone:</strong> ${client.phone || 'Não informado'}<br>
      <strong>Categoria:</strong> ${client.category || 'Não informado'}<br>
      <strong>Status:</strong> ${client.status}<br>
      <strong>Observações:</strong> ${client.notes || 'Nenhuma'}
    `);
  }

  /**
   * Visualiza detalhes do fornecedor
   */
  viewSupplierDetails(id) {
    const supplier = this.getSupplierById(id);
    if (!supplier) return;

    showInfo('Detalhes do Fornecedor', `
      <strong>Nome:</strong> ${supplier.name}<br>
      <strong>Documento:</strong> ${supplier.document}<br>
      <strong>Email:</strong> ${supplier.email || 'Não informado'}<br>
      <strong>Telefone:</strong> ${supplier.phone || 'Não informado'}<br>
      <strong>Categoria:</strong> ${supplier.category || 'Não informado'}<br>
      <strong>Condições de Pagamento:</strong> ${supplier.paymentTerms || 'Não informado'}<br>
      <strong>Status:</strong> ${supplier.status}<br>
      <strong>Observações:</strong> ${supplier.notes || 'Nenhuma'}
    `);
  }
}

// Instância global
const clientsSuppliers = new ClientsSuppliersSystem();

// Exporta para uso global
window.clientsSuppliers = clientsSuppliers;
