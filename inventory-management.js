/**
 * Sistema de Gestão de Estoque
 * Gerencia entradas, saídas, inventário e alertas de estoque
 */

class InventoryManagementSystem {
  constructor() {
    this.products = this.loadProducts();
    this.movements = this.loadMovements();
    this.categories = this.loadCategories();
    this.suppliers = this.loadSuppliers();
    this.alerts = this.loadAlerts();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.checkAlerts();
  }

  /**
   * Carrega produtos do localStorage
   */
  loadProducts() {
    const savedProducts = localStorage.getItem('inventory_products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  }

  /**
   * Salva produtos no localStorage
   */
  saveProducts() {
    localStorage.setItem('inventory_products', JSON.stringify(this.products));
  }

  /**
   * Carrega movimentações do localStorage
   */
  loadMovements() {
    const savedMovements = localStorage.getItem('inventory_movements');
    return savedMovements ? JSON.parse(savedMovements) : [];
  }

  /**
   * Salva movimentações no localStorage
   */
  saveMovements() {
    localStorage.setItem('inventory_movements', JSON.stringify(this.movements));
  }

  /**
   * Carrega categorias do localStorage
   */
  loadCategories() {
    const savedCategories = localStorage.getItem('inventory_categories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  }

  /**
   * Salva categorias no localStorage
   */
  saveCategories() {
    localStorage.setItem('inventory_categories', JSON.stringify(this.categories));
  }

  /**
   * Carrega fornecedores do localStorage
   */
  loadSuppliers() {
    const savedSuppliers = localStorage.getItem('inventory_suppliers');
    return savedSuppliers ? JSON.parse(savedSuppliers) : [];
  }

  /**
   * Salva fornecedores no localStorage
   */
  saveSuppliers() {
    localStorage.setItem('inventory_suppliers', JSON.stringify(this.suppliers));
  }

  /**
   * Carrega alertas do localStorage
   */
  loadAlerts() {
    const savedAlerts = localStorage.getItem('inventory_alerts');
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  }

  /**
   * Salva alertas no localStorage
   */
  saveAlerts() {
    localStorage.setItem('inventory_alerts', JSON.stringify(this.alerts));
  }

  /**
   * Carrega dados padrão se não existirem
   */
  loadDefaultData() {
    if (this.categories.length === 0) {
      this.categories = [
        { id: 1, name: 'Eletrônicos', description: 'Produtos eletrônicos' },
        { id: 2, name: 'Roupas', description: 'Vestuário' },
        { id: 3, name: 'Livros', description: 'Livros e materiais didáticos' },
        { id: 4, name: 'Casa e Jardim', description: 'Produtos para casa' }
      ];
      this.saveCategories();
    }

    if (this.products.length === 0) {
      this.products = [
        {
          id: 1,
          name: 'Smartphone Samsung Galaxy',
          sku: 'SMG001',
          category: 'Eletrônicos',
          description: 'Smartphone Samsung Galaxy A54',
          price: 1299.99,
          cost: 800.00,
          stock: 15,
          minStock: 5,
          maxStock: 50,
          unit: 'unidade',
          location: 'Prateleira A1',
          supplier: 'Fornecedor Tech',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Camiseta Básica',
          sku: 'CAM001',
          category: 'Roupas',
          description: 'Camiseta básica algodão',
          price: 29.99,
          cost: 15.00,
          stock: 100,
          minStock: 20,
          maxStock: 200,
          unit: 'unidade',
          location: 'Gaveta 1',
          supplier: 'Fornecedor Moda',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      this.saveProducts();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando as páginas forem carregadas
  }

  // ===== GESTÃO DE PRODUTOS =====

  /**
   * Obtém todos os produtos
   */
  getProducts() {
    return this.products.filter(product => product.status === 'active');
  }

  /**
   * Obtém produto por ID
   */
  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  /**
   * Obtém produto por SKU
   */
  getProductBySku(sku) {
    return this.products.find(product => product.sku === sku);
  }

  /**
   * Cria novo produto
   */
  createProduct(productData) {
    // Validações
    if (!productData.name || !productData.sku) {
      throw new Error('Nome e SKU são obrigatórios');
    }

    if (this.getProductBySku(productData.sku)) {
      throw new Error('SKU já cadastrado');
    }

    const newProduct = {
      id: Math.max(...this.products.map(p => p.id), 0) + 1,
      name: productData.name,
      sku: productData.sku,
      category: productData.category || '',
      description: productData.description || '',
      price: parseFloat(productData.price) || 0,
      cost: parseFloat(productData.cost) || 0,
      stock: parseInt(productData.stock) || 0,
      minStock: parseInt(productData.minStock) || 0,
      maxStock: parseInt(productData.maxStock) || 0,
      unit: productData.unit || 'unidade',
      location: productData.location || '',
      supplier: productData.supplier || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.products.push(newProduct);
    this.saveProducts();

    return newProduct;
  }

  /**
   * Atualiza produto existente
   */
  updateProduct(id, productData) {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      throw new Error('Produto não encontrado');
    }

    // Verifica se SKU não está sendo usado por outro produto
    if (productData.sku && productData.sku !== this.products[productIndex].sku) {
      if (this.getProductBySku(productData.sku)) {
        throw new Error('SKU já cadastrado');
      }
    }

    const updatedProduct = {
      ...this.products[productIndex],
      ...productData,
      id: this.products[productIndex].id,
      createdAt: this.products[productIndex].createdAt
    };

    this.products[productIndex] = updatedProduct;
    this.saveProducts();

    return updatedProduct;
  }

  /**
   * Remove produto (soft delete)
   */
  removeProduct(id) {
    const product = this.getProductById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    product.status = 'inactive';
    this.saveProducts();

    return product;
  }

  // ===== MOVIMENTAÇÕES DE ESTOQUE =====

  /**
   * Obtém todas as movimentações
   */
  getMovements() {
    return this.movements.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Obtém movimentações por produto
   */
  getMovementsByProduct(productId) {
    return this.movements
      .filter(movement => movement.productId === productId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Cria nova movimentação
   */
  createMovement(movementData) {
    const product = this.getProductById(movementData.productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    const newMovement = {
      id: Math.max(...this.movements.map(m => m.id), 0) + 1,
      productId: movementData.productId,
      type: movementData.type, // 'entry' ou 'exit'
      quantity: parseInt(movementData.quantity),
      reason: movementData.reason || '',
      reference: movementData.reference || '',
      date: movementData.date || new Date().toISOString().split('T')[0],
      user: movementData.user || 'Sistema',
      notes: movementData.notes || '',
      createdAt: new Date().toISOString()
    };

    // Atualiza estoque do produto
    if (movementData.type === 'entry') {
      product.stock += newMovement.quantity;
    } else {
      if (product.stock < newMovement.quantity) {
        throw new Error('Estoque insuficiente');
      }
      product.stock -= newMovement.quantity;
    }

    this.movements.push(newMovement);
    this.saveMovements();
    this.saveProducts();

    // Verifica alertas após movimentação
    this.checkProductAlerts(product);

    return newMovement;
  }

  // ===== CATEGORIAS =====

  /**
   * Obtém todas as categorias
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Cria nova categoria
   */
  createCategory(categoryData) {
    const newCategory = {
      id: Math.max(...this.categories.map(c => c.id), 0) + 1,
      name: categoryData.name,
      description: categoryData.description || ''
    };

    this.categories.push(newCategory);
    this.saveCategories();

    return newCategory;
  }

  // ===== ALERTAS DE ESTOQUE =====

  /**
   * Verifica alertas de estoque
   */
  checkAlerts() {
    this.alerts = [];
    
    this.getProducts().forEach(product => {
      this.checkProductAlerts(product);
    });

    this.saveAlerts();
  }

  /**
   * Verifica alertas de um produto específico
   */
  checkProductAlerts(product) {
    const alerts = [];

    // Estoque baixo
    if (product.stock <= product.minStock) {
      alerts.push({
        id: `low_stock_${product.id}`,
        productId: product.id,
        productName: product.name,
        type: 'low_stock',
        message: `Estoque baixo: ${product.stock} ${product.unit} (mínimo: ${product.minStock})`,
        severity: product.stock === 0 ? 'critical' : 'warning',
        createdAt: new Date().toISOString()
      });
    }

    // Estoque alto
    if (product.stock >= product.maxStock) {
      alerts.push({
        id: `high_stock_${product.id}`,
        productId: product.id,
        productName: product.name,
        type: 'high_stock',
        message: `Estoque alto: ${product.stock} ${product.unit} (máximo: ${product.maxStock})`,
        severity: 'info',
        createdAt: new Date().toISOString()
      });
    }

    // Remove alertas antigos do produto
    this.alerts = this.alerts.filter(alert => alert.productId !== product.id);
    
    // Adiciona novos alertas
    this.alerts.push(...alerts);
  }

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts() {
    return this.alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Remove alerta
   */
  removeAlert(alertId) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.saveAlerts();
  }

  // ===== RELATÓRIOS E ESTATÍSTICAS =====

  /**
   * Obtém estatísticas do estoque
   */
  getInventoryStats() {
    const products = this.getProducts();
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
    const lowStockCount = products.filter(product => product.stock <= product.minStock).length;
    const zeroStockCount = products.filter(product => product.stock === 0).length;

    const categoryStats = {};
    products.forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      zeroStockCount,
      categoryStats,
      activeAlerts: this.getActiveAlerts().length
    };
  }

  /**
   * Obtém produtos com estoque baixo
   */
  getLowStockProducts() {
    return this.getProducts().filter(product => product.stock <= product.minStock);
  }

  /**
   * Obtém produtos sem estoque
   */
  getOutOfStockProducts() {
    return this.getProducts().filter(product => product.stock === 0);
  }

  /**
   * Obtém movimentações recentes
   */
  getRecentMovements(limit = 10) {
    return this.getMovements().slice(0, limit);
  }

  /**
   * Renderiza dashboard de estoque
   */
  renderInventoryDashboard() {
    const container = document.getElementById('inventory-dashboard-container');
    if (!container) return;

    const stats = this.getInventoryStats();
    const lowStockProducts = this.getLowStockProducts();
    const outOfStockProducts = this.getOutOfStockProducts();
    const recentMovements = this.getRecentMovements();
    const activeAlerts = this.getActiveAlerts();

    container.innerHTML = `
      <div class="inventory-dashboard">
        <div class="page-header">
          <h2>Gestão de Estoque</h2>
          <div class="header-actions">
            <button class="primary-btn" onclick="inventoryManagement.openProductModal()">
              <i class="fas fa-plus"></i>
              Novo Produto
            </button>
            <button class="primary-btn" onclick="inventoryManagement.openMovementModal()">
              <i class="fas fa-exchange-alt"></i>
              Movimentação
            </button>
            <button class="primary-btn" onclick="inventoryManagement.openCategoryModal()">
              <i class="fas fa-tags"></i>
              Categoria
            </button>
          </div>
        </div>

        <!-- Alertas -->
        ${activeAlerts.length > 0 ? `
          <div class="alerts-section">
            <h3>Alertas de Estoque</h3>
            <div class="alerts-grid">
              ${activeAlerts.map(alert => `
                <div class="alert alert-${alert.severity}">
                  <div class="alert-content">
                    <i class="fas fa-${alert.severity === 'critical' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <div>
                      <strong>${alert.productName}</strong>
                      <p>${alert.message}</p>
                    </div>
                  </div>
                  <button class="alert-close" onclick="inventoryManagement.removeAlert('${alert.id}')">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.totalProducts}</h3>
              <p>Total de Produtos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <h3>R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <p>Valor Total em Estoque</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.lowStockCount}</h3>
              <p>Produtos com Estoque Baixo</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.zeroStockCount}</h3>
              <p>Produtos sem Estoque</p>
            </div>
          </div>
        </div>

        <!-- Produtos com Estoque Baixo -->
        ${lowStockProducts.length > 0 ? `
          <div class="low-stock-section">
            <h3>Produtos com Estoque Baixo</h3>
            <div class="products-grid">
              ${lowStockProducts.map(product => `
                <div class="product-card low-stock">
                  <div class="product-header">
                    <h4>${product.name}</h4>
                    <span class="stock-badge low">${product.stock} ${product.unit}</span>
                  </div>
                  <div class="product-details">
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Categoria:</strong> ${product.category}</p>
                    <p><strong>Estoque Mínimo:</strong> ${product.minStock} ${product.unit}</p>
                  </div>
                  <div class="product-actions">
                    <button class="btn-icon" onclick="inventoryManagement.openProductModal(${product.id})" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="inventoryManagement.openMovementModal(${product.id})" title="Movimentação">
                      <i class="fas fa-exchange-alt"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Movimentações Recentes -->
        <div class="recent-movements-section">
          <h3>Movimentações Recentes</h3>
          <div class="movements-table-container">
            <table class="movements-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                ${recentMovements.map(movement => {
                  const product = this.getProductById(movement.productId);
                  return `
                    <tr>
                      <td>${new Date(movement.date).toLocaleDateString('pt-BR')}</td>
                      <td>${product ? product.name : 'Produto não encontrado'}</td>
                      <td>
                        <span class="movement-type ${movement.type}">
                          ${movement.type === 'entry' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td>${movement.quantity}</td>
                      <td>${movement.user}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza lista de produtos
   */
  renderProductsList() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const products = this.getProducts();
    const stats = this.getInventoryStats();

    container.innerHTML = `
      <div class="products-interface">
        <div class="page-header">
          <h2>Produtos</h2>
          <button class="primary-btn" onclick="inventoryManagement.openProductModal()">
            <i class="fas fa-plus"></i>
            Novo Produto
          </button>
        </div>

        <!-- Filtros e Busca -->
        <div class="filters-section">
          <div class="search-box">
            <input type="text" id="product-search" placeholder="Buscar produtos..." onkeyup="inventoryManagement.searchProducts()">
            <i class="fas fa-search"></i>
          </div>
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">Todos</button>
            <button class="filter-btn" data-filter="low-stock">Estoque Baixo</button>
            <button class="filter-btn" data-filter="out-of-stock">Sem Estoque</button>
          </div>
        </div>

        <!-- Lista de Produtos -->
        <div class="products-grid" id="products-grid">
          ${products.map(product => this.renderProductCard(product)).join('')}
        </div>
      </div>
    `;

    this.setupProductFilters();
  }

  /**
   * Renderiza card do produto
   */
  renderProductCard(product) {
    const stockStatus = product.stock === 0 ? 'out' : 
                       product.stock <= product.minStock ? 'low' : 'normal';

    return `
      <div class="product-card ${stockStatus}" data-status="${stockStatus}">
        <div class="product-header">
          <div class="product-info">
            <h4>${product.name}</h4>
            <p class="product-sku">SKU: ${product.sku}</p>
          </div>
          <div class="stock-info">
            <span class="stock-badge ${stockStatus}">${product.stock} ${product.unit}</span>
          </div>
        </div>
        
        <div class="product-content">
          <div class="product-details">
            <p><strong>Categoria:</strong> ${product.category}</p>
            <p><strong>Preço:</strong> R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><strong>Custo:</strong> R$ ${product.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><strong>Localização:</strong> ${product.location}</p>
          </div>
          
          <div class="stock-limits">
            <div class="limit-item">
              <span class="limit-label">Mín:</span>
              <span class="limit-value">${product.minStock} ${product.unit}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">Máx:</span>
              <span class="limit-value">${product.maxStock} ${product.unit}</span>
            </div>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="btn-icon" onclick="inventoryManagement.openProductModal(${product.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="inventoryManagement.openMovementModal(${product.id})" title="Movimentação">
            <i class="fas fa-exchange-alt"></i>
          </button>
          <button class="btn-icon" onclick="inventoryManagement.viewProductHistory(${product.id})" title="Histórico">
            <i class="fas fa-history"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="inventoryManagement.removeProduct(${product.id})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Configura filtros de produtos
   */
  setupProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        this.filterProducts(filter);
      });
    });
  }

  /**
   * Filtra produtos
   */
  filterProducts(filter) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const status = card.getAttribute('data-status');
      
      let show = true;
      
      switch (filter) {
        case 'low-stock':
          show = status === 'low';
          break;
        case 'out-of-stock':
          show = status === 'out';
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
   * Busca produtos
   */
  searchProducts() {
    const query = document.getElementById('product-search')?.value || '';
    const products = this.getProducts().filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }
  }

  /**
   * Abre modal para criar/editar produto
   */
  openProductModal(productId = null) {
    const product = productId ? this.getProductById(productId) : null;
    const modal = this.createProductModal(product);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para movimentação
   */
  openMovementModal(productId = null) {
    const modal = this.createMovementModal(productId);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para categoria
   */
  openCategoryModal() {
    const modal = this.createCategoryModal();
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de produto
   */
  createProductModal(product = null) {
    const isEdit = !!product;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="product-form">
          <div class="form-row">
            <div class="form-group">
              <label for="product-name">Nome do Produto *</label>
              <input type="text" id="product-name" name="name" value="${product?.name || ''}" required>
            </div>
            <div class="form-group">
              <label for="product-sku">SKU *</label>
              <input type="text" id="product-sku" name="sku" value="${product?.sku || ''}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="product-category">Categoria</label>
              <select id="product-category" name="category">
                <option value="">Selecione uma categoria</option>
                ${this.getCategories().map(cat => `
                  <option value="${cat.name}" ${product?.category === cat.name ? 'selected' : ''}>${cat.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="product-unit">Unidade</label>
              <select id="product-unit" name="unit">
                <option value="unidade" ${product?.unit === 'unidade' ? 'selected' : ''}>Unidade</option>
                <option value="kg" ${product?.unit === 'kg' ? 'selected' : ''}>Quilograma</option>
                <option value="litro" ${product?.unit === 'litro' ? 'selected' : ''}>Litro</option>
                <option value="metro" ${product?.unit === 'metro' ? 'selected' : ''}>Metro</option>
                <option value="caixa" ${product?.unit === 'caixa' ? 'selected' : ''}>Caixa</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="product-price">Preço de Venda</label>
              <input type="number" id="product-price" name="price" step="0.01" value="${product?.price || '0.00'}">
            </div>
            <div class="form-group">
              <label for="product-cost">Custo</label>
              <input type="number" id="product-cost" name="cost" step="0.01" value="${product?.cost || '0.00'}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="product-stock">Estoque Atual</label>
              <input type="number" id="product-stock" name="stock" value="${product?.stock || '0'}">
            </div>
            <div class="form-group">
              <label for="product-location">Localização</label>
              <input type="text" id="product-location" name="location" value="${product?.location || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="product-min-stock">Estoque Mínimo</label>
              <input type="number" id="product-min-stock" name="minStock" value="${product?.minStock || '0'}">
            </div>
            <div class="form-group">
              <label for="product-max-stock">Estoque Máximo</label>
              <input type="number" id="product-max-stock" name="maxStock" value="${product?.maxStock || '0'}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="product-description">Descrição</label>
            <textarea id="product-description" name="description" rows="3">${product?.description || ''}</textarea>
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
    const form = modal.querySelector('#product-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const productData = Object.fromEntries(formData);

      try {
        if (isEdit) {
          this.updateProduct(product.id, productData);
          showSuccess('Produto atualizado com sucesso!');
        } else {
          this.createProduct(productData);
          showSuccess('Produto criado com sucesso!');
        }
        modal.remove();
        this.renderInventoryDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de movimentação
   */
  createMovementModal(productId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Nova Movimentação</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="movement-form">
          <div class="form-group">
            <label for="movement-product">Produto *</label>
            <select id="movement-product" name="productId" required>
              <option value="">Selecione um produto</option>
              ${this.getProducts().map(product => `
                <option value="${product.id}" ${productId === product.id ? 'selected' : ''}>
                  ${product.name} (${product.sku}) - Estoque: ${product.stock}
                </option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="movement-type">Tipo de Movimentação *</label>
            <select id="movement-type" name="type" required>
              <option value="entry">Entrada</option>
              <option value="exit">Saída</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="movement-quantity">Quantidade *</label>
            <input type="number" id="movement-quantity" name="quantity" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="movement-reason">Motivo</label>
            <select id="movement-reason" name="reason">
              <option value="">Selecione um motivo</option>
              <option value="compra">Compra</option>
              <option value="venda">Venda</option>
              <option value="ajuste">Ajuste de Inventário</option>
              <option value="transferencia">Transferência</option>
              <option value="perda">Perda/Dano</option>
              <option value="devolucao">Devolução</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="movement-reference">Referência</label>
            <input type="text" id="movement-reference" name="reference" placeholder="Número da nota, pedido, etc.">
          </div>
          
          <div class="form-group">
            <label for="movement-date">Data</label>
            <input type="date" id="movement-date" name="date" value="${new Date().toISOString().split('T')[0]}">
          </div>
          
          <div class="form-group">
            <label for="movement-notes">Observações</label>
            <textarea id="movement-notes" name="notes" rows="3"></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Registrar Movimentação
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#movement-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const movementData = Object.fromEntries(formData);

      try {
        this.createMovement(movementData);
        showSuccess('Movimentação registrada com sucesso!');
        modal.remove();
        this.renderInventoryDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de categoria
   */
  createCategoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Nova Categoria</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="category-form">
          <div class="form-group">
            <label for="category-name">Nome da Categoria *</label>
            <input type="text" id="category-name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="category-description">Descrição</label>
            <textarea id="category-description" name="description" rows="3"></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#category-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const categoryData = Object.fromEntries(formData);

      try {
        this.createCategory(categoryData);
        showSuccess('Categoria criada com sucesso!');
        modal.remove();
        this.renderInventoryDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Remove produto
   */
  async removeProduct(id) {
    try {
      const confirmed = await confirmAction(
        'Remover Produto',
        'Tem certeza que deseja remover este produto?',
        'Remover'
      );

      if (confirmed) {
        this.removeProduct(id);
        showSuccess('Produto removido com sucesso!');
        this.renderProductsList();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Visualiza histórico do produto
   */
  viewProductHistory(productId) {
    const product = this.getProductById(productId);
    const movements = this.getMovementsByProduct(productId);

    if (!product) return;

    let historyHtml = `
      <h4>Histórico de Movimentações - ${product.name}</h4>
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Motivo</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
    `;

    movements.forEach(movement => {
      historyHtml += `
        <tr>
          <td>${new Date(movement.date).toLocaleDateString('pt-BR')}</td>
          <td>
            <span class="movement-type ${movement.type}">
              ${movement.type === 'entry' ? 'Entrada' : 'Saída'}
            </span>
          </td>
          <td>${movement.quantity}</td>
          <td>${movement.reason || '-'}</td>
          <td>${movement.user}</td>
        </tr>
      `;
    });

    historyHtml += `
          </tbody>
        </table>
      </div>
    `;

    showInfo('Histórico do Produto', historyHtml);
  }
}

// Instância global
const inventoryManagement = new InventoryManagementSystem();

// Exporta para uso global
window.inventoryManagement = inventoryManagement;
