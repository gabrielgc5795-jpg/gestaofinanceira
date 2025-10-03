/**
 * Sistema de Gestão de Ordens de Serviço
 * Gerencia criação, acompanhamento e controle de ordens de serviço
 */

class ServiceOrdersSystem {
  constructor() {
    this.orders = this.loadOrders();
    this.services = this.loadServices();
    this.technicians = this.loadTechnicians();
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
   * Carrega ordens de serviço do localStorage
   */
  loadOrders() {
    const savedOrders = localStorage.getItem('service_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  }

  /**
   * Salva ordens de serviço no localStorage
   */
  saveOrders() {
    localStorage.setItem('service_orders', JSON.stringify(this.orders));
  }

  /**
   * Carrega serviços do localStorage
   */
  loadServices() {
    const savedServices = localStorage.getItem('service_catalog');
    return savedServices ? JSON.parse(savedServices) : [];
  }

  /**
   * Salva serviços no localStorage
   */
  saveServices() {
    localStorage.setItem('service_catalog', JSON.stringify(this.services));
  }

  /**
   * Carrega técnicos do localStorage
   */
  loadTechnicians() {
    const savedTechnicians = localStorage.getItem('technicians');
    return savedTechnicians ? JSON.parse(savedTechnicians) : [];
  }

  /**
   * Salva técnicos no localStorage
   */
  saveTechnicians() {
    localStorage.setItem('technicians', JSON.stringify(this.technicians));
  }

  /**
   * Carrega dados padrão se não existirem
   */
  loadDefaultData() {
    if (this.services.length === 0) {
      this.services = [
        {
          id: 1,
          name: 'Instalação de Sistema',
          description: 'Instalação completa de sistema',
          category: 'Instalação',
          price: 150.00,
          estimatedTime: 120, // minutos
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Manutenção Preventiva',
          description: 'Manutenção preventiva de equipamentos',
          category: 'Manutenção',
          price: 80.00,
          estimatedTime: 60,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Reparo de Hardware',
          description: 'Reparo de componentes de hardware',
          category: 'Reparo',
          price: 100.00,
          estimatedTime: 90,
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      this.saveServices();
    }

    if (this.technicians.length === 0) {
      this.technicians = [
        {
          id: 1,
          name: 'João Silva',
          specialization: 'Sistemas',
          phone: '(11) 99999-1111',
          email: 'joao@empresa.com',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Maria Santos',
          specialization: 'Hardware',
          phone: '(11) 99999-2222',
          email: 'maria@empresa.com',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      this.saveTechnicians();
    }

    if (this.orders.length === 0) {
      this.orders = [
        {
          id: 1,
          orderNumber: 'OS-2024-001',
          clientId: 1,
          clientName: 'João Silva',
          serviceId: 1,
          serviceName: 'Instalação de Sistema',
          technicianId: 1,
          technicianName: 'João Silva',
          status: 'pending', // pending, in_progress, completed, cancelled
          priority: 'normal', // low, normal, high, urgent
          description: 'Instalação de sistema operacional e configuração',
          scheduledDate: new Date().toISOString().split('T')[0],
          estimatedDuration: 120,
          actualDuration: null,
          startTime: null,
          endTime: null,
          totalCost: 150.00,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveOrders();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando as páginas forem carregadas
  }

  // ===== GESTÃO DE ORDENS DE SERVIÇO =====

  /**
   * Obtém todas as ordens de serviço
   */
  getOrders() {
    return this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Obtém ordem por ID
   */
  getOrderById(id) {
    return this.orders.find(order => order.id === id);
  }

  /**
   * Cria nova ordem de serviço
   */
  createOrder(orderData) {
    // Validações
    if (!orderData.clientId || !orderData.serviceId) {
      throw new Error('Cliente e serviço são obrigatórios');
    }

    const newOrder = {
      id: Math.max(...this.orders.map(o => o.id), 0) + 1,
      orderNumber: this.generateOrderNumber(),
      clientId: orderData.clientId,
      clientName: orderData.clientName,
      serviceId: orderData.serviceId,
      serviceName: orderData.serviceName,
      technicianId: orderData.technicianId || null,
      technicianName: orderData.technicianName || '',
      status: 'pending',
      priority: orderData.priority || 'normal',
      description: orderData.description || '',
      scheduledDate: orderData.scheduledDate || new Date().toISOString().split('T')[0],
      estimatedDuration: orderData.estimatedDuration || 60,
      actualDuration: null,
      startTime: null,
      endTime: null,
      totalCost: orderData.totalCost || 0,
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.push(newOrder);
    this.saveOrders();

    return newOrder;
  }

  /**
   * Atualiza ordem de serviço existente
   */
  updateOrder(id, orderData) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new Error('Ordem de serviço não encontrada');
    }

    const updatedOrder = {
      ...this.orders[orderIndex],
      ...orderData,
      id: this.orders[orderIndex].id,
      orderNumber: this.orders[orderIndex].orderNumber,
      createdAt: this.orders[orderIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    this.orders[orderIndex] = updatedOrder;
    this.saveOrders();

    return updatedOrder;
  }

  /**
   * Gera número da ordem de serviço
   */
  generateOrderNumber() {
    const year = new Date().getFullYear();
    const lastOrder = this.orders
      .filter(order => order.orderNumber.startsWith(`OS-${year}-`))
      .sort((a, b) => {
        const aNum = parseInt(a.orderNumber.split('-')[2]);
        const bNum = parseInt(b.orderNumber.split('-')[2]);
        return bNum - aNum;
      })[0];

    const nextNumber = lastOrder ? 
      parseInt(lastOrder.orderNumber.split('-')[2]) + 1 : 1;

    return `OS-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Atualiza status da ordem
   */
  updateOrderStatus(id, status) {
    const order = this.getOrderById(id);
    if (!order) {
      throw new Error('Ordem de serviço não encontrada');
    }

    const now = new Date().toISOString();

    if (status === 'in_progress' && !order.startTime) {
      order.startTime = now;
    } else if (status === 'completed' && order.startTime && !order.endTime) {
      order.endTime = now;
      order.actualDuration = Math.round(
        (new Date(order.endTime) - new Date(order.startTime)) / 60000
      );
    }

    order.status = status;
    order.updatedAt = now;

    this.saveOrders();

    return order;
  }

  /**
   * Obtém ordens por status
   */
  getOrdersByStatus(status) {
    return this.orders.filter(order => order.status === status);
  }

  /**
   * Obtém ordens por técnico
   */
  getOrdersByTechnician(technicianId) {
    return this.orders.filter(order => order.technicianId === technicianId);
  }

  /**
   * Obtém ordens por cliente
   */
  getOrdersByClient(clientId) {
    return this.orders.filter(order => order.clientId === clientId);
  }

  // ===== GESTÃO DE SERVIÇOS =====

  /**
   * Obtém todos os serviços
   */
  getServices() {
    return this.services.filter(service => service.active);
  }

  /**
   * Obtém serviço por ID
   */
  getServiceById(id) {
    return this.services.find(service => service.id === id);
  }

  /**
   * Cria novo serviço
   */
  createService(serviceData) {
    const newService = {
      id: Math.max(...this.services.map(s => s.id), 0) + 1,
      name: serviceData.name,
      description: serviceData.description || '',
      category: serviceData.category || '',
      price: parseFloat(serviceData.price) || 0,
      estimatedTime: parseInt(serviceData.estimatedTime) || 60,
      active: true,
      createdAt: new Date().toISOString()
    };

    this.services.push(newService);
    this.saveServices();

    return newService;
  }

  // ===== GESTÃO DE TÉCNICOS =====

  /**
   * Obtém todos os técnicos
   */
  getTechnicians() {
    return this.technicians.filter(technician => technician.active);
  }

  /**
   * Obtém técnico por ID
   */
  getTechnicianById(id) {
    return this.technicians.find(technician => technician.id === id);
  }

  /**
   * Cria novo técnico
   */
  createTechnician(technicianData) {
    const newTechnician = {
      id: Math.max(...this.technicians.map(t => t.id), 0) + 1,
      name: technicianData.name,
      specialization: technicianData.specialization || '',
      phone: technicianData.phone || '',
      email: technicianData.email || '',
      active: true,
      createdAt: new Date().toISOString()
    };

    this.technicians.push(newTechnician);
    this.saveTechnicians();

    return newTechnician;
  }

  // ===== RELATÓRIOS E ESTATÍSTICAS =====

  /**
   * Obtém estatísticas das ordens de serviço
   */
  getOrderStats() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.getOrdersByStatus('pending').length;
    const inProgressOrders = this.getOrdersByStatus('in_progress').length;
    const completedOrders = this.getOrdersByStatus('completed').length;
    const cancelledOrders = this.getOrdersByStatus('cancelled').length;

    const totalRevenue = this.orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.totalCost, 0);

    const averageDuration = this.orders
      .filter(order => order.actualDuration)
      .reduce((sum, order) => sum + order.actualDuration, 0) / 
      this.orders.filter(order => order.actualDuration).length || 0;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageDuration
    };
  }

  /**
   * Obtém ordens pendentes
   */
  getPendingOrders() {
    return this.getOrdersByStatus('pending')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * Obtém ordens em andamento
   */
  getInProgressOrders() {
    return this.getOrdersByStatus('in_progress');
  }

  /**
   * Renderiza dashboard de ordens de serviço
   */
  renderServiceOrdersDashboard() {
    const container = document.getElementById('service-orders-dashboard-container');
    if (!container) return;

    const stats = this.getOrderStats();
    const pendingOrders = this.getPendingOrders();
    const inProgressOrders = this.getInProgressOrders();

    container.innerHTML = `
      <div class="service-orders-dashboard">
        <div class="page-header">
          <h2>Ordens de Serviço</h2>
          <div class="header-actions">
            <button class="primary-btn" onclick="serviceOrders.openOrderModal()">
              <i class="fas fa-plus"></i>
              Nova Ordem
            </button>
            <button class="primary-btn" onclick="serviceOrders.openServiceModal()">
              <i class="fas fa-cog"></i>
              Serviços
            </button>
            <button class="primary-btn" onclick="serviceOrders.openTechnicianModal()">
              <i class="fas fa-user-tie"></i>
              Técnicos
            </button>
          </div>
        </div>

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.totalOrders}</h3>
              <p>Total de Ordens</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.pendingOrders}</h3>
              <p>Pendentes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.inProgressOrders}</h3>
              <p>Em Andamento</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.completedOrders}</h3>
              <p>Concluídas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <h3>R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <p>Receita Total</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-stopwatch"></i>
            </div>
            <div class="stat-content">
              <h3>${Math.round(stats.averageDuration)}min</h3>
              <p>Tempo Médio</p>
            </div>
          </div>
        </div>

        <!-- Ordens Pendentes -->
        ${pendingOrders.length > 0 ? `
          <div class="pending-orders-section">
            <h3>Ordens Pendentes</h3>
            <div class="orders-grid">
              ${pendingOrders.slice(0, 6).map(order => this.renderOrderCard(order)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Ordens em Andamento -->
        ${inProgressOrders.length > 0 ? `
          <div class="in-progress-orders-section">
            <h3>Ordens em Andamento</h3>
            <div class="orders-grid">
              ${inProgressOrders.map(order => this.renderOrderCard(order)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Renderiza card da ordem de serviço
   */
  renderOrderCard(order) {
    const priorityColors = {
      urgent: '#228B22',
      high: '#f59e0b',
      normal: '#3b82f6',
      low: '#6b7280'
    };

    const statusColors = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      completed: '#10b981',
      cancelled: '#228B22'
    };

    return `
      <div class="order-card" data-status="${order.status}">
        <div class="order-header">
          <div class="order-info">
            <h4>${order.orderNumber}</h4>
            <p class="order-client">${order.clientName}</p>
          </div>
          <div class="order-badges">
            <span class="priority-badge" style="background: ${priorityColors[order.priority]}">
              ${order.priority.toUpperCase()}
            </span>
            <span class="status-badge" style="background: ${statusColors[order.status]}">
              ${this.getStatusDisplayName(order.status)}
            </span>
          </div>
        </div>
        
        <div class="order-content">
          <div class="order-details">
            <p><strong>Serviço:</strong> ${order.serviceName}</p>
            <p><strong>Data:</strong> ${new Date(order.scheduledDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Técnico:</strong> ${order.technicianName || 'Não atribuído'}</p>
            <p><strong>Valor:</strong> R$ ${order.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          ${order.description ? `
            <div class="order-description">
              <p><strong>Descrição:</strong> ${order.description}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="order-actions">
          <button class="btn-icon" onclick="serviceOrders.openOrderModal(${order.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          ${order.status === 'pending' ? `
            <button class="btn-icon" onclick="serviceOrders.startOrder(${order.id})" title="Iniciar">
              <i class="fas fa-play"></i>
            </button>
          ` : ''}
          ${order.status === 'in_progress' ? `
            <button class="btn-icon" onclick="serviceOrders.completeOrder(${order.id})" title="Concluir">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
          <button class="btn-icon" onclick="serviceOrders.viewOrderDetails(${order.id})" title="Ver Detalhes">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Obtém nome de exibição do status
   */
  getStatusDisplayName(status) {
    const names = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return names[status] || status;
  }

  /**
   * Abre modal para criar/editar ordem
   */
  openOrderModal(orderId = null) {
    const order = orderId ? this.getOrderById(orderId) : null;
    const modal = this.createOrderModal(order);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para criar/editar serviço
   */
  openServiceModal() {
    const modal = this.createServiceModal();
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para criar/editar técnico
   */
  openTechnicianModal() {
    const modal = this.createTechnicianModal();
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de ordem de serviço
   */
  createOrderModal(order = null) {
    const isEdit = !!order;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="order-form">
          <div class="form-row">
            <div class="form-group">
              <label for="order-client">Cliente *</label>
              <select id="order-client" name="clientId" required>
                <option value="">Selecione um cliente</option>
                ${typeof clientsSuppliers !== 'undefined' ? 
                  clientsSuppliers.getClients().map(client => `
                    <option value="${client.id}" ${order?.clientId === client.id ? 'selected' : ''}>
                      ${client.name}
                    </option>
                  `).join('') : ''
                }
              </select>
            </div>
            <div class="form-group">
              <label for="order-service">Serviço *</label>
              <select id="order-service" name="serviceId" required>
                <option value="">Selecione um serviço</option>
                ${this.getServices().map(service => `
                  <option value="${service.id}" ${order?.serviceId === service.id ? 'selected' : ''}>
                    ${service.name} - R$ ${service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="order-technician">Técnico</label>
              <select id="order-technician" name="technicianId">
                <option value="">Selecione um técnico</option>
                ${this.getTechnicians().map(technician => `
                  <option value="${technician.id}" ${order?.technicianId === technician.id ? 'selected' : ''}>
                    ${technician.name} - ${technician.specialization}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="order-priority">Prioridade</label>
              <select id="order-priority" name="priority">
                <option value="low" ${order?.priority === 'low' ? 'selected' : ''}>Baixa</option>
                <option value="normal" ${order?.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${order?.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="urgent" ${order?.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="order-date">Data Agendada</label>
              <input type="date" id="order-date" name="scheduledDate" value="${order?.scheduledDate || new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label for="order-cost">Valor Total</label>
              <input type="number" id="order-cost" name="totalCost" step="0.01" value="${order?.totalCost || '0.00'}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="order-description">Descrição do Serviço</label>
            <textarea id="order-description" name="description" rows="3">${order?.description || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="order-notes">Observações</label>
            <textarea id="order-notes" name="notes" rows="2">${order?.notes || ''}</textarea>
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

    // Atualiza campos quando serviço é selecionado
    const serviceSelect = modal.querySelector('#order-service');
    const costInput = modal.querySelector('#order-cost');
    
    serviceSelect.addEventListener('change', () => {
      const selectedService = this.getServiceById(parseInt(serviceSelect.value));
      if (selectedService) {
        costInput.value = selectedService.price;
      }
    });

    // Configura evento de submit
    const form = modal.querySelector('#order-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Obtém nomes dos relacionamentos
      const clientId = formData.get('clientId');
      const serviceId = formData.get('serviceId');
      const technicianId = formData.get('technicianId');
      
      const client = typeof clientsSuppliers !== 'undefined' ? 
        clientsSuppliers.getClientById(parseInt(clientId)) : null;
      const service = this.getServiceById(parseInt(serviceId));
      const technician = technicianId ? this.getTechnicianById(parseInt(technicianId)) : null;

      const orderData = {
        ...Object.fromEntries(formData),
        clientName: client?.name || '',
        serviceName: service?.name || '',
        technicianName: technician?.name || '',
        estimatedDuration: service?.estimatedTime || 60
      };

      try {
        if (isEdit) {
          this.updateOrder(order.id, orderData);
          showSuccess('Ordem atualizada com sucesso!');
        } else {
          this.createOrder(orderData);
          showSuccess('Ordem criada com sucesso!');
        }
        modal.remove();
        this.renderServiceOrdersDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de serviço
   */
  createServiceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Novo Serviço</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="service-form">
          <div class="form-group">
            <label for="service-name">Nome do Serviço *</label>
            <input type="text" id="service-name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="service-category">Categoria</label>
            <input type="text" id="service-category" name="category">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="service-price">Preço *</label>
              <input type="number" id="service-price" name="price" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="service-time">Tempo Estimado (min)</label>
              <input type="number" id="service-time" name="estimatedTime" value="60">
            </div>
          </div>
          
          <div class="form-group">
            <label for="service-description">Descrição</label>
            <textarea id="service-description" name="description" rows="3"></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Criar
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#service-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const serviceData = Object.fromEntries(formData);

      try {
        this.createService(serviceData);
        showSuccess('Serviço criado com sucesso!');
        modal.remove();
        this.renderServiceOrdersDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de técnico
   */
  createTechnicianModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Novo Técnico</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="technician-form">
          <div class="form-group">
            <label for="technician-name">Nome do Técnico *</label>
            <input type="text" id="technician-name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="technician-specialization">Especialização</label>
            <input type="text" id="technician-specialization" name="specialization">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="technician-phone">Telefone</label>
              <input type="text" id="technician-phone" name="phone">
            </div>
            <div class="form-group">
              <label for="technician-email">Email</label>
              <input type="email" id="technician-email" name="email">
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Criar
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#technician-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const technicianData = Object.fromEntries(formData);

      try {
        this.createTechnician(technicianData);
        showSuccess('Técnico criado com sucesso!');
        modal.remove();
        this.renderServiceOrdersDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Inicia ordem de serviço
   */
  async startOrder(orderId) {
    try {
      this.updateOrderStatus(orderId, 'in_progress');
      showSuccess('Ordem de serviço iniciada!');
      this.renderServiceOrdersDashboard();
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Conclui ordem de serviço
   */
  async completeOrder(orderId) {
    try {
      this.updateOrderStatus(orderId, 'completed');
      showSuccess('Ordem de serviço concluída!');
      this.renderServiceOrdersDashboard();
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Visualiza detalhes da ordem
   */
  viewOrderDetails(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) return;

    let detailsHtml = `
      <h4>Detalhes da Ordem - ${order.orderNumber}</h4>
      <div class="order-details-content">
        <div class="detail-row">
          <strong>Cliente:</strong> ${order.clientName}
        </div>
        <div class="detail-row">
          <strong>Serviço:</strong> ${order.serviceName}
        </div>
        <div class="detail-row">
          <strong>Técnico:</strong> ${order.technicianName || 'Não atribuído'}
        </div>
        <div class="detail-row">
          <strong>Status:</strong> ${this.getStatusDisplayName(order.status)}
        </div>
        <div class="detail-row">
          <strong>Prioridade:</strong> ${order.priority.toUpperCase()}
        </div>
        <div class="detail-row">
          <strong>Data Agendada:</strong> ${new Date(order.scheduledDate).toLocaleDateString('pt-BR')}
        </div>
        <div class="detail-row">
          <strong>Valor:</strong> R$ ${order.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
    `;

    if (order.startTime) {
      detailsHtml += `
        <div class="detail-row">
          <strong>Iniciado em:</strong> ${new Date(order.startTime).toLocaleString('pt-BR')}
        </div>
      `;
    }

    if (order.endTime) {
      detailsHtml += `
        <div class="detail-row">
          <strong>Concluído em:</strong> ${new Date(order.endTime).toLocaleString('pt-BR')}
        </div>
        <div class="detail-row">
          <strong>Duração Real:</strong> ${order.actualDuration} minutos
        </div>
      `;
    }

    if (order.description) {
      detailsHtml += `
        <div class="detail-row">
          <strong>Descrição:</strong> ${order.description}
        </div>
      `;
    }

    if (order.notes) {
      detailsHtml += `
        <div class="detail-row">
          <strong>Observações:</strong> ${order.notes}
        </div>
      `;
    }

    detailsHtml += `
        <div class="detail-row">
          <strong>Criado em:</strong> ${new Date(order.createdAt).toLocaleString('pt-BR')}
        </div>
        <div class="detail-row">
          <strong>Última atualização:</strong> ${new Date(order.updatedAt).toLocaleString('pt-BR')}
        </div>
      </div>
    `;

    showInfo('Detalhes da Ordem', detailsHtml);
  }
}

// Instância global
const serviceOrders = new ServiceOrdersSystem();

// Exporta para uso global
window.serviceOrders = serviceOrders;
