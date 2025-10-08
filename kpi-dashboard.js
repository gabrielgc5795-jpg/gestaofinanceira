/**
 * Sistema de KPIs e Dashboards Interativos
 * Métricas de performance, indicadores chave e visualizações em tempo real
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class KPIDashboardSystem {
  constructor() {
    this.kpis = this.loadKPIs();
    this.dashboards = this.loadDashboards();
    this.widgets = this.loadWidgets();
    this.alerts = this.loadKPIAlerts();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.startRealTimeUpdates();
  }

  /**
   * Carrega KPIs
   */
  loadKPIs() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('kpis') || [];
      } else {
        const data = localStorage.getItem('kpis');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
      return [];
    }
  }

  /**
   * Carrega dashboards
   */
  loadDashboards() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('dashboards') || [];
      } else {
        const data = localStorage.getItem('dashboards');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar dashboards:', error);
      return [];
    }
  }

  /**
   * Carrega widgets
   */
  loadWidgets() {
    return {
      'revenue_chart': {
        name: 'Gráfico de Receitas',
        type: 'chart',
        chartType: 'line',
        dataSource: 'revenue',
        refreshInterval: 300000, // 5 minutos
        size: { width: 6, height: 4 }
      },
      'expense_chart': {
        name: 'Gráfico de Despesas',
        type: 'chart',
        chartType: 'bar',
        dataSource: 'expenses',
        refreshInterval: 300000,
        size: { width: 6, height: 4 }
      },
      'cash_flow_gauge': {
        name: 'Indicador de Fluxo de Caixa',
        type: 'gauge',
        dataSource: 'cash_flow',
        refreshInterval: 60000, // 1 minuto
        size: { width: 3, height: 3 }
      },
      'profit_margin_gauge': {
        name: 'Margem de Lucro',
        type: 'gauge',
        dataSource: 'profit_margin',
        refreshInterval: 300000,
        size: { width: 3, height: 3 }
      },
      'top_customers': {
        name: 'Principais Clientes',
        type: 'table',
        dataSource: 'top_customers',
        refreshInterval: 600000, // 10 minutos
        size: { width: 6, height: 4 }
      },
      'overdue_accounts': {
        name: 'Contas em Atraso',
        type: 'alert_list',
        dataSource: 'overdue_accounts',
        refreshInterval: 60000,
        size: { width: 6, height: 3 }
      },
      'budget_status': {
        name: 'Status do Orçamento',
        type: 'progress_bars',
        dataSource: 'budget_status',
        refreshInterval: 300000,
        size: { width: 6, height: 4 }
      },
      'financial_ratios': {
        name: 'Indicadores Financeiros',
        type: 'metric_cards',
        dataSource: 'financial_ratios',
        refreshInterval: 300000,
        size: { width: 12, height: 2 }
      }
    };
  }

  /**
   * Carrega alertas de KPI
   */
  loadKPIAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('kpi_alerts') || [];
      } else {
        const data = localStorage.getItem('kpi_alerts');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar alertas de KPI:', error);
      return [];
    }
  }

  /**
   * Salva KPIs
   */
  async saveKPIs() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('kpis', this.kpis);
      } else {
        localStorage.setItem('kpis', JSON.stringify(this.kpis));
      }
    } catch (error) {
      console.error('Erro ao salvar KPIs:', error);
    }
  }

  /**
   * Salva dashboards
   */
  async saveDashboards() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('dashboards', this.dashboards);
      } else {
        localStorage.setItem('dashboards', JSON.stringify(this.dashboards));
      }
    } catch (error) {
      console.error('Erro ao salvar dashboards:', error);
    }
  }

  /**
   * Salva alertas
   */
  async saveAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('kpi_alerts', this.alerts);
      } else {
        localStorage.setItem('kpi_alerts', JSON.stringify(this.alerts));
      }
    } catch (error) {
      console.error('Erro ao salvar alertas:', error);
    }
  }

  // ===== GESTÃO DE KPIs =====

  /**
   * Cria novo KPI
   */
  async createKPI(kpiData) {
    const newKPI = {
      id: Math.max(...this.kpis.map(k => k.id), 0) + 1,
      name: kpiData.name,
      description: kpiData.description,
      category: kpiData.category, // financial, operational, customer, growth
      type: kpiData.type, // metric, ratio, trend, target
      dataSource: kpiData.dataSource,
      calculation: kpiData.calculation,
      unit: kpiData.unit || 'R$',
      format: kpiData.format || 'currency', // currency, percentage, number, decimal
      target: kpiData.target || null,
      threshold: kpiData.threshold || { warning: 0.8, critical: 0.9 },
      frequency: kpiData.frequency || 'daily', // real_time, hourly, daily, weekly, monthly
      status: 'active',
      currentValue: 0,
      previousValue: 0,
      change: 0,
      changePercentage: 0,
      trend: 'stable', // increasing, decreasing, stable
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema'
    };

    this.kpis.push(newKPI);
    await this.saveKPIs();

    // Calcula valor inicial
    await this.updateKPIValue(newKPI.id);

    return newKPI;
  }

  /**
   * Atualiza valor do KPI
   */
  async updateKPIValue(kpiId) {
    const kpi = this.kpis.find(k => k.id === kpiId);
    if (!kpi) return;

    const previousValue = kpi.currentValue;
    const newValue = await this.calculateKPIValue(kpi);
    
    kpi.previousValue = previousValue;
    kpi.currentValue = newValue;
    kpi.change = newValue - previousValue;
    kpi.changePercentage = previousValue > 0 ? (kpi.change / previousValue) * 100 : 0;
    kpi.trend = this.calculateTrend(kpi);
    kpi.lastUpdated = new Date().toISOString();

    // Verifica alertas
    await this.checkKPIAlerts(kpi);

    await this.saveKPIs();
    return kpi;
  }

  /**
   * Calcula valor do KPI
   */
  async calculateKPIValue(kpi) {
    try {
      switch (kpi.dataSource) {
        case 'revenue':
          return await this.getRevenueValue(kpi);
        case 'expenses':
          return await this.getExpensesValue(kpi);
        case 'profit':
          return await this.getProfitValue(kpi);
        case 'cash_flow':
          return await this.getCashFlowValue(kpi);
        case 'customers':
          return await this.getCustomersValue(kpi);
        case 'orders':
          return await this.getOrdersValue(kpi);
        case 'inventory':
          return await this.getInventoryValue(kpi);
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Erro ao calcular KPI ${kpi.name}:`, error);
      return 0;
    }
  }

  /**
   * Calcula tendência do KPI
   */
  calculateTrend(kpi) {
    if (kpi.changePercentage > 5) return 'increasing';
    if (kpi.changePercentage < -5) return 'decreasing';
    return 'stable';
  }

  // ===== GESTÃO DE DASHBOARDS =====

  /**
   * Cria novo dashboard
   */
  async createDashboard(dashboardData) {
    const newDashboard = {
      id: Math.max(...this.dashboards.map(d => d.id), 0) + 1,
      name: dashboardData.name,
      description: dashboardData.description,
      layout: dashboardData.layout || 'grid',
      widgets: dashboardData.widgets || [],
      filters: dashboardData.filters || {},
      refreshInterval: dashboardData.refreshInterval || 300000, // 5 minutos
      isPublic: dashboardData.isPublic || false,
      permissions: dashboardData.permissions || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema',
      lastUpdated: new Date().toISOString()
    };

    this.dashboards.push(newDashboard);
    await this.saveDashboards();

    return newDashboard;
  }

  /**
   * Adiciona widget ao dashboard
   */
  async addWidgetToDashboard(dashboardId, widgetData) {
    const dashboard = this.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard não encontrado');
    }

    const widget = {
      id: Math.max(...dashboard.widgets.map(w => w.id), 0) + 1,
      type: widgetData.type,
      widgetType: widgetData.widgetType,
      dataSource: widgetData.dataSource,
      position: widgetData.position || { x: 0, y: 0 },
      size: widgetData.size || { width: 6, height: 4 },
      config: widgetData.config || {},
      refreshInterval: widgetData.refreshInterval || 300000
    };

    dashboard.widgets.push(widget);
    dashboard.lastUpdated = new Date().toISOString();

    await this.saveDashboards();
    return widget;
  }

  /**
   * Obtém dados do dashboard
   */
  async getDashboardData(dashboardId) {
    const dashboard = this.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return null;

    const data = {
      dashboard,
      widgets: []
    };

    for (const widget of dashboard.widgets) {
      const widgetData = await this.getWidgetData(widget);
      data.widgets.push({
        ...widget,
        data: widgetData
      });
    }

    return data;
  }

  /**
   * Obtém dados do widget
   */
  async getWidgetData(widget) {
    try {
      switch (widget.dataSource) {
        case 'revenue':
          return await this.getRevenueData(widget);
        case 'expenses':
          return await this.getExpensesData(widget);
        case 'cash_flow':
          return await this.getCashFlowData(widget);
        case 'profit_margin':
          return await this.getProfitMarginData(widget);
        case 'top_customers':
          return await this.getTopCustomersData(widget);
        case 'overdue_accounts':
          return await this.getOverdueAccountsData(widget);
        case 'budget_status':
          return await this.getBudgetStatusData(widget);
        case 'financial_ratios':
          return await this.getFinancialRatiosData(widget);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Erro ao obter dados do widget ${widget.type}:`, error);
      return null;
    }
  }

  // ===== FONTES DE DADOS =====

  /**
   * Obtém dados de receita
   */
  async getRevenueData(widget) {
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      const revenue = cashFlow.filter(entry => entry.type === 'income');
      
      const last30Days = revenue.filter(entry => {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return entryDate >= thirtyDaysAgo;
      });

      return {
        total: last30Days.reduce((sum, entry) => sum + entry.amount, 0),
        daily: this.groupByDay(last30Days),
        trend: this.calculateTrend(last30Days.map(e => e.amount))
      };
    }
    return { total: 0, daily: [], trend: 'stable' };
  }

  /**
   * Obtém dados de despesas
   */
  async getExpensesData(widget) {
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      const expenses = cashFlow.filter(entry => entry.type === 'expense');
      
      const last30Days = expenses.filter(entry => {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return entryDate >= thirtyDaysAgo;
      });

      return {
        total: last30Days.reduce((sum, entry) => sum + entry.amount, 0),
        byCategory: this.groupByCategory(last30Days),
        daily: this.groupByDay(last30Days)
      };
    }
    return { total: 0, byCategory: {}, daily: [] };
  }

  /**
   * Obtém dados de fluxo de caixa
   */
  async getCashFlowData(widget) {
    if (typeof financialControl !== 'undefined') {
      const currentBalance = financialControl.getCurrentBalance();
      const projectedBalance = financialControl.getProjectedBalance(30);
      
      return {
        current: currentBalance,
        projected: projectedBalance,
        trend: projectedBalance > currentBalance ? 'increasing' : 'decreasing'
      };
    }
    return { current: 0, projected: 0, trend: 'stable' };
  }

  /**
   * Obtém dados de margem de lucro
   */
  async getProfitMarginData(widget) {
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      const last30Days = cashFlow.filter(entry => {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return entryDate >= thirtyDaysAgo;
      });

      const revenue = last30Days.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
      const expenses = last30Days.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        value: margin,
        profit: profit,
        revenue: revenue,
        expenses: expenses
      };
    }
    return { value: 0, profit: 0, revenue: 0, expenses: 0 };
  }

  /**
   * Obtém dados dos principais clientes
   */
  async getTopCustomersData(widget) {
    if (typeof clientsSuppliers !== 'undefined') {
      const clients = clientsSuppliers.getClients();
      // Simula dados de vendas por cliente
      return clients.slice(0, 5).map((client, index) => ({
        name: client.name,
        revenue: Math.random() * 10000 + 5000,
        orders: Math.floor(Math.random() * 20) + 5,
        lastOrder: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
    return [];
  }

  /**
   * Obtém dados de contas em atraso
   */
  async getOverdueAccountsData(widget) {
    if (typeof accountsPayableReceivable !== 'undefined') {
      const overdue = accountsPayableReceivable.getOverdueAccounts();
      return {
        payable: overdue.payable.slice(0, 5),
        receivable: overdue.receivable.slice(0, 5),
        total: overdue.total
      };
    }
    return { payable: [], receivable: [], total: 0 };
  }

  /**
   * Obtém dados de status do orçamento
   */
  async getBudgetStatusData(widget) {
    if (typeof budgetControl !== 'undefined') {
      const dashboardData = budgetControl.getDashboardData();
      return {
        totalBudgeted: dashboardData.totalBudgeted,
        totalActual: dashboardData.totalActual,
        variance: dashboardData.totalVariance,
        overBudgetCategories: dashboardData.overBudgetCategories.slice(0, 5)
      };
    }
    return { totalBudgeted: 0, totalActual: 0, variance: 0, overBudgetCategories: [] };
  }

  /**
   * Obtém dados de indicadores financeiros
   */
  async getFinancialRatiosData(widget) {
    const ratios = [];
    
    // Margem de lucro
    const profitMargin = await this.getProfitMarginData({});
    ratios.push({
      name: 'Margem de Lucro',
      value: profitMargin.value,
      unit: '%',
      trend: profitMargin.value > 10 ? 'good' : 'warning'
    });

    // Fluxo de caixa
    const cashFlow = await this.getCashFlowData({});
    ratios.push({
      name: 'Fluxo de Caixa',
      value: cashFlow.current,
      unit: 'R$',
      trend: cashFlow.trend
    });

    // Receita mensal
    const revenue = await this.getRevenueData({});
    ratios.push({
      name: 'Receita Mensal',
      value: revenue.total,
      unit: 'R$',
      trend: revenue.trend
    });

    return ratios;
  }

  // ===== ALERTAS E NOTIFICAÇÕES =====

  /**
   * Verifica alertas de KPI
   */
  async checkKPIAlerts(kpi) {
    if (!kpi.target) return;

    const utilization = kpi.currentValue / kpi.target;
    
    if (utilization >= kpi.threshold.critical) {
      await this.createKPIAlert({
        kpiId: kpi.id,
        type: 'critical',
        message: `${kpi.name} atingiu ${(utilization * 100).toFixed(1)}% da meta`,
        value: kpi.currentValue,
        target: kpi.target
      });
    } else if (utilization >= kpi.threshold.warning) {
      await this.createKPIAlert({
        kpiId: kpi.id,
        type: 'warning',
        message: `${kpi.name} está em ${(utilization * 100).toFixed(1)}% da meta`,
        value: kpi.currentValue,
        target: kpi.target
      });
    }
  }

  /**
   * Cria alerta de KPI
   */
  async createKPIAlert(alertData) {
    const newAlert = {
      id: Math.max(...this.alerts.map(a => a.id), 0) + 1,
      kpiId: alertData.kpiId,
      type: alertData.type,
      message: alertData.message,
      value: alertData.value,
      target: alertData.target,
      status: 'active',
      createdAt: new Date().toISOString(),
      dismissedAt: null
    };

    this.alerts.push(newAlert);
    await this.saveAlerts();

    // Mostra notificação se disponível
    if (typeof showWarning === 'function') {
      showWarning('Alerta de KPI', alertData.message);
    }

    return newAlert;
  }

  // ===== ATUALIZAÇÕES EM TEMPO REAL =====

  /**
   * Inicia atualizações em tempo real
   */
  startRealTimeUpdates() {
    // Atualiza KPIs a cada 5 minutos
    setInterval(() => {
      this.updateAllKPIs();
    }, 5 * 60 * 1000);

    // Atualiza KPIs críticos a cada minuto
    setInterval(() => {
      this.updateCriticalKPIs();
    }, 60 * 1000);

    // Atualiza imediatamente
    this.updateAllKPIs();
  }

  /**
   * Atualiza todos os KPIs
   */
  async updateAllKPIs() {
    for (const kpi of this.kpis) {
      if (kpi.status === 'active') {
        await this.updateKPIValue(kpi.id);
      }
    }
  }

  /**
   * Atualiza KPIs críticos
   */
  async updateCriticalKPIs() {
    const criticalKPIs = this.kpis.filter(kpi => 
      kpi.status === 'active' && 
      kpi.frequency === 'real_time' && 
      kpi.target && 
      (kpi.currentValue / kpi.target) >= kpi.threshold.warning
    );

    for (const kpi of criticalKPIs) {
      await this.updateKPIValue(kpi.id);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Agrupa dados por dia
   */
  groupByDay(data) {
    const grouped = {};
    data.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date] += entry.amount;
    });
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }

  /**
   * Agrupa dados por categoria
   */
  groupByCategory(data) {
    const grouped = {};
    data.forEach(entry => {
      const category = entry.category || 'Outros';
      if (!grouped[category]) {
        grouped[category] = 0;
      }
      grouped[category] += entry.amount;
    });
    return grouped;
  }

  /**
   * Calcula tendência de uma série de valores
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

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
    if (this.kpis.length === 0) {
      this.createDefaultKPIs();
    }
    if (this.dashboards.length === 0) {
      this.createDefaultDashboard();
    }
  }

  /**
   * Cria KPIs padrão
   */
  async createDefaultKPIs() {
    const defaultKPIs = [
      {
        name: 'Receita Mensal',
        description: 'Receita total do mês atual',
        category: 'financial',
        type: 'metric',
        dataSource: 'revenue',
        unit: 'R$',
        format: 'currency',
        target: 50000,
        frequency: 'daily'
      },
      {
        name: 'Margem de Lucro',
        description: 'Margem de lucro percentual',
        category: 'financial',
        type: 'ratio',
        dataSource: 'profit_margin',
        unit: '%',
        format: 'percentage',
        target: 15,
        frequency: 'daily'
      },
      {
        name: 'Fluxo de Caixa',
        description: 'Saldo atual de caixa',
        category: 'financial',
        type: 'metric',
        dataSource: 'cash_flow',
        unit: 'R$',
        format: 'currency',
        target: 10000,
        frequency: 'real_time'
      }
    ];

    for (const kpiData of defaultKPIs) {
      await this.createKPI(kpiData);
    }
  }

  /**
   * Cria dashboard padrão
   */
  async createDefaultDashboard() {
    await this.createDashboard({
      name: 'Dashboard Principal',
      description: 'Dashboard principal com indicadores financeiros',
      widgets: [
        {
          type: 'revenue_chart',
          position: { x: 0, y: 0 },
          size: { width: 6, height: 4 }
        },
        {
          type: 'expense_chart',
          position: { x: 6, y: 0 },
          size: { width: 6, height: 4 }
        },
        {
          type: 'cash_flow_gauge',
          position: { x: 0, y: 4 },
          size: { width: 3, height: 3 }
        },
        {
          type: 'profit_margin_gauge',
          position: { x: 3, y: 4 },
          size: { width: 3, height: 3 }
        },
        {
          type: 'financial_ratios',
          position: { x: 0, y: 7 },
          size: { width: 12, height: 2 }
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
const kpiDashboard = new KPIDashboardSystem();

// Exporta para uso global
window.kpiDashboard = kpiDashboard;
