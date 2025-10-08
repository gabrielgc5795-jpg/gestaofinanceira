/**
 * Sistema de Controle de Orçamento Avançado
 * Definição de metas de gastos por categoria e comparação entre valores planejados e realizados
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class BudgetControlSystem {
  constructor() {
    this.budgets = this.loadBudgets();
    this.categories = this.loadCategories();
    this.actuals = this.loadActuals();
    this.alerts = this.loadBudgetAlerts();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.startBudgetMonitoring();
  }

  /**
   * Carrega orçamentos
   */
  loadBudgets() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('budgets') || [];
      } else {
        const data = localStorage.getItem('budgets');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      return [];
    }
  }

  /**
   * Carrega categorias
   */
  loadCategories() {
    return [
      { id: 'operational', name: 'Operacional', color: '#3b82f6', icon: 'fas fa-cogs' },
      { id: 'marketing', name: 'Marketing', color: '#10b981', icon: 'fas fa-bullhorn' },
      { id: 'personnel', name: 'Pessoal', color: '#f59e0b', icon: 'fas fa-users' },
      { id: 'technology', name: 'Tecnologia', color: '#8b5cf6', icon: 'fas fa-laptop' },
      { id: 'facilities', name: 'Instalações', color: '#ef4444', icon: 'fas fa-building' },
      { id: 'travel', name: 'Viagens', color: '#06b6d4', icon: 'fas fa-plane' },
      { id: 'training', name: 'Treinamento', color: '#84cc16', icon: 'fas fa-graduation-cap' },
      { id: 'other', name: 'Outros', color: '#6b7280', icon: 'fas fa-ellipsis-h' }
    ];
  }

  /**
   * Carrega dados reais
   */
  loadActuals() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('budget_actuals') || [];
      } else {
        const data = localStorage.getItem('budget_actuals');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar dados reais:', error);
      return [];
    }
  }

  /**
   * Carrega alertas de orçamento
   */
  loadBudgetAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('budget_alerts') || [];
      } else {
        const data = localStorage.getItem('budget_alerts');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar alertas de orçamento:', error);
      return [];
    }
  }

  /**
   * Salva orçamentos
   */
  async saveBudgets() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('budgets', this.budgets);
      } else {
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
      }
    } catch (error) {
      console.error('Erro ao salvar orçamentos:', error);
    }
  }

  /**
   * Salva dados reais
   */
  async saveActuals() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('budget_actuals', this.actuals);
      } else {
        localStorage.setItem('budget_actuals', JSON.stringify(this.actuals));
      }
    } catch (error) {
      console.error('Erro ao salvar dados reais:', error);
    }
  }

  /**
   * Salva alertas
   */
  async saveAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('budget_alerts', this.alerts);
      } else {
        localStorage.setItem('budget_alerts', JSON.stringify(this.alerts));
      }
    } catch (error) {
      console.error('Erro ao salvar alertas:', error);
    }
  }

  // ===== GESTÃO DE ORÇAMENTOS =====

  /**
   * Cria novo orçamento
   */
  async createBudget(budgetData) {
    const newBudget = {
      id: Math.max(...this.budgets.map(b => b.id), 0) + 1,
      name: budgetData.name,
      description: budgetData.description,
      year: budgetData.year || new Date().getFullYear(),
      month: budgetData.month || new Date().getMonth() + 1,
      period: budgetData.period || 'monthly', // monthly, quarterly, yearly
      status: 'active', // active, archived, draft
      categories: budgetData.categories || [],
      totalBudget: 0,
      totalActual: 0,
      variance: 0,
      variancePercentage: 0,
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema',
      lastUpdated: new Date().toISOString()
    };

    // Calcula total do orçamento
    newBudget.totalBudget = newBudget.categories.reduce((sum, cat) => sum + cat.budgeted, 0);

    this.budgets.push(newBudget);
    await this.saveBudgets();

    return newBudget;
  }

  /**
   * Atualiza orçamento
   */
  async updateBudget(budgetId, budgetData) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    // Atualiza dados
    Object.keys(budgetData).forEach(key => {
      if (key !== 'id' && budgetData[key] !== undefined) {
        budget[key] = budgetData[key];
      }
    });

    // Recalcula totais
    budget.totalBudget = budget.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    budget.lastUpdated = new Date().toISOString();

    await this.saveBudgets();
    return budget;
  }

  /**
   * Adiciona categoria ao orçamento
   */
  async addBudgetCategory(budgetId, categoryData) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    const newCategory = {
      id: Math.max(...budget.categories.map(c => c.id), 0) + 1,
      categoryId: categoryData.categoryId,
      categoryName: categoryData.categoryName,
      budgeted: parseFloat(categoryData.budgeted),
      actual: 0,
      variance: 0,
      variancePercentage: 0,
      alertThreshold: categoryData.alertThreshold || 0.8, // 80% do orçamento
      notes: categoryData.notes || ''
    };

    budget.categories.push(newCategory);
    budget.totalBudget = budget.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    budget.lastUpdated = new Date().toISOString();

    await this.saveBudgets();
    return newCategory;
  }

  /**
   * Atualiza categoria do orçamento
   */
  async updateBudgetCategory(budgetId, categoryId, categoryData) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    const category = budget.categories.find(c => c.id === categoryId);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Atualiza dados
    Object.keys(categoryData).forEach(key => {
      if (key !== 'id' && categoryData[key] !== undefined) {
        category[key] = categoryData[key];
      }
    });

    // Recalcula totais
    budget.totalBudget = budget.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    budget.lastUpdated = new Date().toISOString();

    await this.saveBudgets();
    return category;
  }

  // ===== CONTROLE DE GASTOS =====

  /**
   * Registra gasto real
   */
  async recordActualExpense(expenseData) {
    const newActual = {
      id: Math.max(...this.actuals.map(a => a.id), 0) + 1,
      budgetId: expenseData.budgetId,
      categoryId: expenseData.categoryId,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      vendor: expenseData.vendor || '',
      reference: expenseData.reference || '',
      notes: expenseData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema'
    };

    this.actuals.push(newActual);
    await this.saveActuals();

    // Atualiza totais do orçamento
    await this.updateBudgetTotals(expenseData.budgetId);

    // Verifica alertas
    await this.checkBudgetAlerts(expenseData.budgetId);

    return newActual;
  }

  /**
   * Atualiza totais do orçamento
   */
  async updateBudgetTotals(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    // Calcula gastos reais por categoria
    const categoryActuals = {};
    this.actuals
      .filter(a => a.budgetId === budgetId)
      .forEach(actual => {
        if (!categoryActuals[actual.categoryId]) {
          categoryActuals[actual.categoryId] = 0;
        }
        categoryActuals[actual.categoryId] += actual.amount;
      });

    // Atualiza categorias
    budget.categories.forEach(category => {
      category.actual = categoryActuals[category.categoryId] || 0;
      category.variance = category.actual - category.budgeted;
      category.variancePercentage = category.budgeted > 0 ? 
        (category.variance / category.budgeted) * 100 : 0;
    });

    // Atualiza totais do orçamento
    budget.totalActual = budget.categories.reduce((sum, cat) => sum + cat.actual, 0);
    budget.variance = budget.totalActual - budget.totalBudget;
    budget.variancePercentage = budget.totalBudget > 0 ? 
      (budget.variance / budget.totalBudget) * 100 : 0;

    budget.lastUpdated = new Date().toISOString();
    await this.saveBudgets();
  }

  // ===== ANÁLISES E RELATÓRIOS =====

  /**
   * Obtém análise de orçamento
   */
  getBudgetAnalysis(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    const analysis = {
      budget,
      summary: {
        totalBudget: budget.totalBudget,
        totalActual: budget.totalActual,
        variance: budget.variance,
        variancePercentage: budget.variancePercentage,
        remainingBudget: budget.totalBudget - budget.totalActual,
        utilizationRate: budget.totalBudget > 0 ? (budget.totalActual / budget.totalBudget) * 100 : 0
      },
      categories: budget.categories.map(category => ({
        ...category,
        status: this.getCategoryStatus(category),
        trend: this.getCategoryTrend(budgetId, category.categoryId),
        recommendations: this.getCategoryRecommendations(category)
      })),
      alerts: this.getBudgetAlerts(budgetId),
      trends: this.getBudgetTrends(budgetId)
    };

    return analysis;
  }

  /**
   * Obtém status da categoria
   */
  getCategoryStatus(category) {
    const utilizationRate = category.budgeted > 0 ? (category.actual / category.budgeted) * 100 : 0;
    
    if (utilizationRate >= 100) return 'over_budget';
    if (utilizationRate >= category.alertThreshold * 100) return 'near_limit';
    if (utilizationRate >= 0.5 * 100) return 'on_track';
    return 'under_utilized';
  }

  /**
   * Obtém tendência da categoria
   */
  getCategoryTrend(budgetId, categoryId) {
    // Analisa gastos dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentExpenses = this.actuals
      .filter(a => a.budgetId === budgetId && 
                   a.categoryId === categoryId && 
                   new Date(a.date) >= threeMonthsAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (recentExpenses.length < 2) return 'stable';

    const firstMonth = recentExpenses.slice(0, Math.floor(recentExpenses.length / 2))
      .reduce((sum, e) => sum + e.amount, 0);
    const lastMonth = recentExpenses.slice(-Math.floor(recentExpenses.length / 2))
      .reduce((sum, e) => sum + e.amount, 0);

    const growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;

    if (growthRate > 20) return 'increasing';
    if (growthRate < -20) return 'decreasing';
    return 'stable';
  }

  /**
   * Obtém recomendações para categoria
   */
  getCategoryRecommendations(category) {
    const recommendations = [];
    const utilizationRate = category.budgeted > 0 ? (category.actual / category.budgeted) * 100 : 0;

    if (utilizationRate >= 100) {
      recommendations.push({
        type: 'over_budget',
        priority: 'high',
        message: 'Categoria excedeu o orçamento planejado',
        action: 'Revisar gastos ou aumentar orçamento'
      });
    } else if (utilizationRate >= category.alertThreshold * 100) {
      recommendations.push({
        type: 'near_limit',
        priority: 'medium',
        message: 'Categoria próxima do limite de alerta',
        action: 'Monitorar gastos mais de perto'
      });
    } else if (utilizationRate < 0.3 * 100) {
      recommendations.push({
        type: 'under_utilized',
        priority: 'low',
        message: 'Categoria subutilizada',
        action: 'Considerar realocar orçamento ou aumentar investimentos'
      });
    }

    return recommendations;
  }

  // ===== ALERTAS E MONITORAMENTO =====

  /**
   * Verifica alertas de orçamento
   */
  async checkBudgetAlerts(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    budget.categories.forEach(category => {
      const utilizationRate = category.budgeted > 0 ? (category.actual / category.budgeted) * 100 : 0;
      
      // Alerta para categoria próxima do limite
      if (utilizationRate >= category.alertThreshold * 100 && utilizationRate < 100) {
        this.createBudgetAlert({
          type: 'near_limit',
          budgetId,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          message: `${category.categoryName} está ${utilizationRate.toFixed(1)}% do orçamento`,
          priority: 'medium'
        });
      }
      
      // Alerta para categoria excedida
      if (utilizationRate >= 100) {
        this.createBudgetAlert({
          type: 'over_budget',
          budgetId,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          message: `${category.categoryName} excedeu o orçamento em ${(utilizationRate - 100).toFixed(1)}%`,
          priority: 'high'
        });
      }
    });
  }

  /**
   * Cria alerta de orçamento
   */
  async createBudgetAlert(alertData) {
    const newAlert = {
      id: Math.max(...this.alerts.map(a => a.id), 0) + 1,
      type: alertData.type,
      budgetId: alertData.budgetId,
      categoryId: alertData.categoryId,
      categoryName: alertData.categoryName,
      message: alertData.message,
      priority: alertData.priority,
      status: 'active',
      createdAt: new Date().toISOString(),
      dismissedAt: null
    };

    this.alerts.push(newAlert);
    await this.saveAlerts();

    // Mostra notificação se disponível
    if (typeof showWarning === 'function') {
      showWarning('Alerta de Orçamento', alertData.message);
    }

    return newAlert;
  }

  /**
   * Obtém alertas do orçamento
   */
  getBudgetAlerts(budgetId) {
    return this.alerts.filter(a => a.budgetId === budgetId && a.status === 'active');
  }

  /**
   * Inicia monitoramento de orçamento
   */
  startBudgetMonitoring() {
    // Verifica alertas a cada hora
    setInterval(() => {
      this.budgets.forEach(budget => {
        if (budget.status === 'active') {
          this.updateBudgetTotals(budget.id);
          this.checkBudgetAlerts(budget.id);
        }
      });
    }, 60 * 60 * 1000); // 1 hora

    // Verifica alertas imediatamente
    this.budgets.forEach(budget => {
      if (budget.status === 'active') {
        this.updateBudgetTotals(budget.id);
        this.checkBudgetAlerts(budget.id);
      }
    });
  }

  // ===== DASHBOARD E VISUALIZAÇÕES =====

  /**
   * Obtém dados para dashboard
   */
  getDashboardData() {
    const activeBudgets = this.budgets.filter(b => b.status === 'active');
    
    return {
      totalBudgets: this.budgets.length,
      activeBudgets: activeBudgets.length,
      totalBudgeted: activeBudgets.reduce((sum, b) => sum + b.totalBudget, 0),
      totalActual: activeBudgets.reduce((sum, b) => sum + b.totalActual, 0),
      totalVariance: activeBudgets.reduce((sum, b) => sum + b.variance, 0),
      overBudgetCategories: this.getOverBudgetCategories(),
      upcomingAlerts: this.getUpcomingAlerts(),
      topCategories: this.getTopCategories(activeBudgets)
    };
  }

  /**
   * Obtém categorias que excederam o orçamento
   */
  getOverBudgetCategories() {
    const overBudget = [];
    
    this.budgets.forEach(budget => {
      budget.categories.forEach(category => {
        if (category.actual > category.budgeted) {
          overBudget.push({
            budgetName: budget.name,
            categoryName: category.categoryName,
            budgeted: category.budgeted,
            actual: category.actual,
            variance: category.variance,
            variancePercentage: category.variancePercentage
          });
        }
      });
    });

    return overBudget.sort((a, b) => b.variancePercentage - a.variancePercentage);
  }

  /**
   * Obtém alertas próximos
   */
  getUpcomingAlerts() {
    return this.alerts
      .filter(a => a.status === 'active')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 5);
  }

  /**
   * Obtém principais categorias
   */
  getTopCategories(budgets) {
    const categoryTotals = {};
    
    budgets.forEach(budget => {
      budget.categories.forEach(category => {
        if (!categoryTotals[category.categoryId]) {
          categoryTotals[category.categoryId] = {
            name: category.categoryName,
            budgeted: 0,
            actual: 0
          };
        }
        categoryTotals[category.categoryId].budgeted += category.budgeted;
        categoryTotals[category.categoryId].actual += category.actual;
      });
    });

    return Object.values(categoryTotals)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }

  // ===== UTILITÁRIOS =====

  /**
   * Obtém usuário atual
   */
  getCurrentUser() {
    if (typeof getCurrentUser === 'function') {
      return getCurrentUser();
    }
    return null;
  }

  /**
   * Carrega dados padrão
   */
  loadDefaultData() {
    if (this.budgets.length === 0) {
      this.createSampleBudget();
    }
  }

  /**
   * Cria orçamento de exemplo
   */
  async createSampleBudget() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    await this.createBudget({
      name: `Orçamento ${currentMonth}/${currentYear}`,
      description: 'Orçamento mensal de exemplo',
      year: currentYear,
      month: currentMonth,
      period: 'monthly',
      categories: [
        {
          id: 1,
          categoryId: 'operational',
          categoryName: 'Operacional',
          budgeted: 5000,
          actual: 0,
          alertThreshold: 0.8
        },
        {
          id: 2,
          categoryId: 'marketing',
          categoryName: 'Marketing',
          budgeted: 2000,
          actual: 0,
          alertThreshold: 0.8
        },
        {
          id: 3,
          categoryId: 'personnel',
          categoryName: 'Pessoal',
          budgeted: 8000,
          actual: 0,
          alertThreshold: 0.9
        }
      ]
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando a página for carregada
  }
}

// Instância global
const budgetControl = new BudgetControlSystem();

// Exporta para uso global
window.budgetControl = budgetControl;
