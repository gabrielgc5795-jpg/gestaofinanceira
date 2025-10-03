/**
 * Dashboard Executivo com KPIs Avançados
 * Fornece métricas executivas, alertas inteligentes e análises preditivas
 */

class ExecutiveDashboard {
  constructor() {
    this.kpis = new Map();
    this.alerts = [];
    this.trends = new Map();
    this.benchmarks = new Map();
    this.refreshInterval = 30000; // 30 segundos
    this.refreshTimer = null;
    this.init();
  }

  /**
   * Inicializa o dashboard executivo
   */
  init() {
    this.setupKPIs();
    this.setupBenchmarks();
    this.startAutoRefresh();
  }

  /**
   * Configura KPIs principais
   */
  setupKPIs() {
    this.kpis.set('revenue_growth', {
      name: 'Crescimento da Receita',
      icon: 'fas fa-chart-line',
      color: '#10b981',
      format: 'percentage',
      target: 15, // 15% de crescimento mensal
      critical: 5, // Abaixo de 5% é crítico
      calculate: () => this.calculateRevenueGrowth()
    });

    this.kpis.set('expense_ratio', {
      name: 'Índice de Despesas',
      icon: 'fas fa-percentage',
      color: '#f59e0b',
      format: 'percentage',
      target: 70, // Máximo 70% das receitas
      critical: 85, // Acima de 85% é crítico
      calculate: () => this.calculateExpenseRatio()
    });

    this.kpis.set('cash_flow', {
      name: 'Fluxo de Caixa',
      icon: 'fas fa-water',
      color: '#3b82f6',
      format: 'currency',
      target: 10000, // R$ 10.000 mínimo
      critical: 5000, // Abaixo de R$ 5.000 é crítico
      calculate: () => this.calculateCashFlow()
    });

    this.kpis.set('burn_rate', {
      name: 'Taxa de Queima',
      icon: 'fas fa-fire',
      color: '#B22222',
      format: 'currency',
      target: 8000, // Máximo R$ 8.000/mês
      critical: 12000, // Acima de R$ 12.000 é crítico
      calculate: () => this.calculateBurnRate()
    });

    this.kpis.set('runway', {
      name: 'Runway (Meses)',
      icon: 'fas fa-clock',
      color: '#8b5cf6',
      format: 'number',
      target: 12, // Mínimo 12 meses
      critical: 6, // Abaixo de 6 meses é crítico
      calculate: () => this.calculateRunway()
    });

    this.kpis.set('profit_margin', {
      name: 'Margem de Lucro',
      icon: 'fas fa-coins',
      color: '#059669',
      format: 'percentage',
      target: 20, // 20% de margem
      critical: 5, // Abaixo de 5% é crítico
      calculate: () => this.calculateProfitMargin()
    });
  }

  /**
   * Configura benchmarks da indústria
   */
  setupBenchmarks() {
    this.benchmarks.set('revenue_growth', { industry: 12, market: 8, competitors: 15 });
    this.benchmarks.set('expense_ratio', { industry: 75, market: 80, competitors: 68 });
    this.benchmarks.set('profit_margin', { industry: 18, market: 15, competitors: 22 });
  }

  /**
   * Calcula crescimento da receita
   */
  calculateRevenueGrowth() {
    const now = new Date();
    const currentMonth = this.getMonthlyRevenue(now);
    const lastMonth = this.getMonthlyRevenue(new Date(now.getFullYear(), now.getMonth() - 1));
    
    if (lastMonth === 0) return 0;
    return ((currentMonth - lastMonth) / lastMonth) * 100;
  }

  /**
   * Calcula índice de despesas
   */
  calculateExpenseRatio() {
    const now = new Date();
    const revenue = this.getMonthlyRevenue(now);
    const expenses = this.getMonthlyExpenses(now);
    
    if (revenue === 0) return 100;
    return (expenses / revenue) * 100;
  }

  /**
   * Calcula fluxo de caixa atual
   */
  calculateCashFlow() {
    const stats = this.getFinancialStats();
    return stats.saldo;
  }

  /**
   * Calcula taxa de queima mensal
   */
  calculateBurnRate() {
    const now = new Date();
    return this.getMonthlyExpenses(now);
  }

  /**
   * Calcula runway em meses
   */
  calculateRunway() {
    const cashFlow = this.calculateCashFlow();
    const burnRate = this.calculateBurnRate();
    
    if (burnRate <= 0) return Infinity;
    return Math.max(0, cashFlow / burnRate);
  }

  /**
   * Calcula margem de lucro
   */
  calculateProfitMargin() {
    const now = new Date();
    const revenue = this.getMonthlyRevenue(now);
    const expenses = this.getMonthlyExpenses(now);
    
    if (revenue === 0) return 0;
    return ((revenue - expenses) / revenue) * 100;
  }

  /**
   * Obtém receita mensal
   */
  getMonthlyRevenue(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return transacoes
      .filter(t => {
        const transactionDate = new Date(t.data);
        return t.tipo === 'receita' && 
               transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth;
      })
      .reduce((sum, t) => sum + t.valor, 0);
  }

  /**
   * Obtém despesas mensais
   */
  getMonthlyExpenses(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return transacoes
      .filter(t => {
        const transactionDate = new Date(t.data);
        return t.tipo === 'despesa' && 
               transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth;
      })
      .reduce((sum, t) => sum + t.valor, 0);
  }

  /**
   * Obtém estatísticas financeiras
   */
  getFinancialStats() {
    let saldo = 0;
    let receitas = 0;
    let despesas = 0;

    transacoes.forEach(t => {
      if (t.tipo === 'receita') {
        saldo += t.valor;
        receitas += t.valor;
      } else {
        saldo -= t.valor;
        despesas += t.valor;
      }
    });

    return { saldo, receitas, despesas };
  }

  /**
   * Calcula todos os KPIs
   */
  calculateAllKPIs() {
    const results = new Map();
    
    this.kpis.forEach((kpi, key) => {
      try {
        const value = kpi.calculate();
        const status = this.getKPIStatus(key, value);
        const trend = this.calculateTrend(key, value);
        
        results.set(key, {
          ...kpi,
          value,
          status,
          trend,
          benchmark: this.benchmarks.get(key)
        });
      } catch (error) {
        console.error(`Erro ao calcular KPI ${key}:`, error);
        results.set(key, {
          ...kpi,
          value: 0,
          status: 'error',
          trend: 'stable',
          error: error.message
        });
      }
    });
    
    return results;
  }

  /**
   * Determina status do KPI
   */
  getKPIStatus(key, value) {
    const kpi = this.kpis.get(key);
    if (!kpi) return 'unknown';

    // KPIs onde menor é melhor (expense_ratio, burn_rate)
    const lowerIsBetter = ['expense_ratio', 'burn_rate'];
    
    if (lowerIsBetter.includes(key)) {
      if (value >= kpi.critical) return 'critical';
      if (value >= kpi.target) return 'warning';
      return 'good';
    } else {
      // KPIs onde maior é melhor
      if (value <= kpi.critical) return 'critical';
      if (value <= kpi.target) return 'warning';
      return 'good';
    }
  }

  /**
   * Calcula tendência do KPI
   */
  calculateTrend(key, currentValue) {
    const history = this.trends.get(key) || [];
    history.push({ value: currentValue, timestamp: Date.now() });
    
    // Mantém apenas os últimos 10 valores
    if (history.length > 10) {
      history.shift();
    }
    
    this.trends.set(key, history);
    
    if (history.length < 3) return 'stable';
    
    // Calcula tendência baseada nos últimos 3 valores
    const recent = history.slice(-3);
    const first = recent[0].value;
    const last = recent[recent.length - 1].value;
    
    const change = ((last - first) / Math.abs(first)) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  /**
   * Gera alertas inteligentes
   */
  generateAlerts() {
    this.alerts = [];
    const kpis = this.calculateAllKPIs();
    
    kpis.forEach((kpi, key) => {
      if (kpi.status === 'critical') {
        this.alerts.push({
          id: `kpi_${key}_critical`,
          type: 'critical',
          title: `${kpi.name} Crítico`,
          message: this.getAlertMessage(key, kpi),
          timestamp: Date.now(),
          kpi: key,
          value: kpi.value,
          actions: this.getAlertActions(key)
        });
      } else if (kpi.status === 'warning') {
        this.alerts.push({
          id: `kpi_${key}_warning`,
          type: 'warning',
          title: `${kpi.name} em Atenção`,
          message: this.getAlertMessage(key, kpi),
          timestamp: Date.now(),
          kpi: key,
          value: kpi.value,
          actions: this.getAlertActions(key)
        });
      }
    });
    
    // Alertas específicos
    this.checkSpecificAlerts();
    
    return this.alerts;
  }

  /**
   * Gera mensagem do alerta
   */
  getAlertMessage(key, kpi) {
    const messages = {
      revenue_growth: `Crescimento da receita está em ${kpi.value.toFixed(1)}%. Meta: ${kpi.target}%`,
      expense_ratio: `Índice de despesas está em ${kpi.value.toFixed(1)}%. Meta: máximo ${kpi.target}%`,
      cash_flow: `Fluxo de caixa atual: ${this.formatCurrency(kpi.value)}. Meta: mínimo ${this.formatCurrency(kpi.target)}`,
      burn_rate: `Taxa de queima: ${this.formatCurrency(kpi.value)}/mês. Meta: máximo ${this.formatCurrency(kpi.target)}/mês`,
      runway: `Runway atual: ${kpi.value.toFixed(1)} meses. Meta: mínimo ${kpi.target} meses`,
      profit_margin: `Margem de lucro: ${kpi.value.toFixed(1)}%. Meta: mínimo ${kpi.target}%`
    };
    
    return messages[key] || `${kpi.name}: ${kpi.value}`;
  }

  /**
   * Obtém ações sugeridas para o alerta
   */
  getAlertActions(key) {
    const actions = {
      revenue_growth: [
        'Revisar estratégias de vendas',
        'Analisar novos mercados',
        'Otimizar pricing'
      ],
      expense_ratio: [
        'Revisar despesas não essenciais',
        'Renegociar contratos',
        'Automatizar processos'
      ],
      cash_flow: [
        'Acelerar recebimentos',
        'Postergar pagamentos não críticos',
        'Buscar financiamento'
      ],
      burn_rate: [
        'Cortar despesas desnecessárias',
        'Otimizar equipe',
        'Revisar fornecedores'
      ],
      runway: [
        'Reduzir burn rate urgentemente',
        'Buscar investimento',
        'Acelerar receitas'
      ],
      profit_margin: [
        'Aumentar preços',
        'Reduzir custos',
        'Melhorar eficiência'
      ]
    };
    
    return actions[key] || [];
  }

  /**
   * Verifica alertas específicos
   */
  checkSpecificAlerts() {
    // Alerta de vencimentos próximos
    const vencimentosProximos = this.checkUpcomingDueDates();
    if (vencimentosProximos.length > 0) {
      this.alerts.push({
        id: 'upcoming_due_dates',
        type: 'warning',
        title: 'Vencimentos Próximos',
        message: `${vencimentosProximos.length} nota(s) fiscal(is) vencem nos próximos 7 dias`,
        timestamp: Date.now(),
        data: vencimentosProximos,
        actions: ['Revisar notas fiscais', 'Programar pagamentos']
      });
    }
    
    // Alerta de metas não atingidas
    const metasAtrasadas = this.checkOverdueMetas();
    if (metasAtrasadas.length > 0) {
      this.alerts.push({
        id: 'overdue_metas',
        type: 'warning',
        title: 'Metas em Atraso',
        message: `${metasAtrasadas.length} meta(s) com prazo vencido`,
        timestamp: Date.now(),
        data: metasAtrasadas,
        actions: ['Revisar metas', 'Ajustar prazos', 'Acelerar ações']
      });
    }
  }

  /**
   * Verifica vencimentos próximos
   */
  checkUpcomingDueDates() {
    const notasFiscais = JSON.parse(localStorage.getItem('notasFiscais') || '[]');
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    return notasFiscais.filter(nota => {
      const vencimento = new Date(nota.dataVencimento);
      return nota.status === 'pendente' && vencimento <= sevenDaysFromNow;
    });
  }

  /**
   * Verifica metas atrasadas
   */
  checkOverdueMetas() {
    const metas = JSON.parse(localStorage.getItem('metas') || '[]');
    const hoje = new Date();
    
    return metas.filter(meta => {
      const prazo = new Date(meta.prazo);
      return prazo < hoje && meta.valorAtual < meta.valorMeta;
    });
  }

  /**
   * Formata valor como moeda
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata valor como percentual
   */
  formatPercentage(value) {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Gera projeções baseadas em tendências
   */
  generateProjections() {
    const kpis = this.calculateAllKPIs();
    const projections = new Map();
    
    kpis.forEach((kpi, key) => {
      const history = this.trends.get(key) || [];
      if (history.length < 3) {
        projections.set(key, {
          next_month: kpi.value,
          confidence: 'low',
          trend: 'insufficient_data'
        });
        return;
      }
      
      // Regressão linear simples
      const projection = this.calculateLinearProjection(history);
      projections.set(key, projection);
    });
    
    return projections;
  }

  /**
   * Calcula projeção linear
   */
  calculateLinearProjection(history) {
    const n = history.length;
    const x = history.map((_, i) => i);
    const y = history.map(h => h.value);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextValue = slope * n + intercept;
    const confidence = this.calculateConfidence(history, slope, intercept);
    
    return {
      next_month: nextValue,
      confidence: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      slope,
      r_squared: confidence
    };
  }

  /**
   * Calcula confiança da projeção (R²)
   */
  calculateConfidence(history, slope, intercept) {
    const y = history.map(h => h.value);
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    
    let ssRes = 0;
    let ssTot = 0;
    
    y.forEach((yi, i) => {
      const yPred = slope * i + intercept;
      ssRes += Math.pow(yi - yPred, 2);
      ssTot += Math.pow(yi - yMean, 2);
    });
    
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  }

  /**
   * Inicia atualização automática
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      this.refreshDashboard();
    }, this.refreshInterval);
  }

  /**
   * Para atualização automática
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Atualiza dashboard
   */
  refreshDashboard() {
    const kpis = this.calculateAllKPIs();
    const alerts = this.generateAlerts();
    const projections = this.generateProjections();
    
    // Dispara evento para atualizar UI
    window.dispatchEvent(new CustomEvent('executiveDashboardUpdate', {
      detail: { kpis, alerts, projections }
    }));
    
    return { kpis, alerts, projections };
  }

  /**
   * Obtém resumo executivo
   */
  getExecutiveSummary() {
    const kpis = this.calculateAllKPIs();
    const alerts = this.generateAlerts();
    
    const criticalKPIs = Array.from(kpis.entries())
      .filter(([_, kpi]) => kpi.status === 'critical')
      .length;
    
    const warningKPIs = Array.from(kpis.entries())
      .filter(([_, kpi]) => kpi.status === 'warning')
      .length;
    
    const goodKPIs = Array.from(kpis.entries())
      .filter(([_, kpi]) => kpi.status === 'good')
      .length;
    
    return {
      overall_health: criticalKPIs === 0 && warningKPIs <= 1 ? 'good' : 
                     criticalKPIs === 0 ? 'warning' : 'critical',
      kpi_summary: {
        total: kpis.size,
        good: goodKPIs,
        warning: warningKPIs,
        critical: criticalKPIs
      },
      alert_summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length
      },
      top_concerns: alerts.slice(0, 3),
      last_updated: new Date().toISOString()
    };
  }
}

// Instância global
const executiveDashboard = new ExecutiveDashboard();

// Funções de conveniência globais
window.getExecutiveKPIs = () => executiveDashboard.calculateAllKPIs();
window.getExecutiveAlerts = () => executiveDashboard.generateAlerts();
window.getExecutiveSummary = () => executiveDashboard.getExecutiveSummary();
window.getExecutiveProjections = () => executiveDashboard.generateProjections();
