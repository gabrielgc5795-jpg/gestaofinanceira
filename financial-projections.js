/**
 * Sistema de Projeções Financeiras Avançadas
 * Visualização de entradas e saídas em tempo real e projeções para curto, médio e longo prazo
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class FinancialProjectionsSystem {
  constructor() {
    this.projectionData = this.loadProjectionData();
    this.scenarios = this.loadScenarios();
    this.assumptions = this.loadAssumptions();
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
   * Carrega dados de projeção
   */
  loadProjectionData() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('financial_projections') || [];
      } else {
        const data = localStorage.getItem('financial_projections');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar dados de projeção:', error);
      return [];
    }
  }

  /**
   * Carrega cenários
   */
  loadScenarios() {
    return [
      {
        id: 'optimistic',
        name: 'Otimista',
        description: 'Cenário com crescimento acima da média',
        multiplier: 1.2,
        color: '#10b981'
      },
      {
        id: 'realistic',
        name: 'Realista',
        description: 'Cenário baseado em dados históricos',
        multiplier: 1.0,
        color: '#3b82f6'
      },
      {
        id: 'pessimistic',
        name: 'Pessimista',
        description: 'Cenário com dificuldades econômicas',
        multiplier: 0.8,
        color: '#ef4444'
      }
    ];
  }

  /**
   * Carrega premissas
   */
  loadAssumptions() {
    return {
      inflationRate: 0.05, // 5% ao ano
      growthRate: 0.10, // 10% ao ano
      discountRate: 0.12, // 12% ao ano
      taxRate: 0.25, // 25%
      workingCapitalRatio: 0.15, // 15% da receita
      capexRatio: 0.08, // 8% da receita
      seasonalityFactors: {
        jan: 0.8, feb: 0.9, mar: 1.1, apr: 1.0,
        may: 1.0, jun: 1.2, jul: 1.1, aug: 1.0,
        sep: 1.1, oct: 1.0, nov: 1.2, dec: 1.3
      }
    };
  }

  /**
   * Salva dados de projeção
   */
  async saveProjectionData() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('financial_projections', this.projectionData);
      } else {
        localStorage.setItem('financial_projections', JSON.stringify(this.projectionData));
      }
    } catch (error) {
      console.error('Erro ao salvar dados de projeção:', error);
    }
  }

  // ===== PROJEÇÕES DE FLUXO DE CAIXA =====

  /**
   * Gera projeção de fluxo de caixa
   */
  generateCashFlowProjection(period = '12months', scenario = 'realistic') {
    const periods = this.getPeriods(period);
    const scenarioData = this.scenarios.find(s => s.id === scenario);
    const historicalData = this.getHistoricalData();
    
    const projection = periods.map(period => {
      const baseAmount = this.calculateBaseAmount(period, historicalData);
      const seasonalFactor = this.getSeasonalFactor(period.month);
      const scenarioMultiplier = scenarioData.multiplier;
      
      const projectedIncome = baseAmount.income * seasonalFactor * scenarioMultiplier;
      const projectedExpense = baseAmount.expense * seasonalFactor * scenarioMultiplier;
      
      return {
        period: period.label,
        date: period.date,
        month: period.month,
        year: period.year,
        projectedIncome,
        projectedExpense,
        netCashFlow: projectedIncome - projectedExpense,
        cumulativeCashFlow: 0, // Será calculado depois
        confidence: this.calculateConfidence(period, historicalData)
      };
    });

    // Calcula fluxo de caixa cumulativo
    let cumulative = 0;
    projection.forEach(period => {
      cumulative += period.netCashFlow;
      period.cumulativeCashFlow = cumulative;
    });

    return projection;
  }

  /**
   * Gera projeção avançada com múltiplos cenários
   */
  generateAdvancedProjection(period = '12months', options = {}) {
    const scenarios = options.scenarios || ['pessimistic', 'realistic', 'optimistic'];
    const includeMonteCarlo = options.includeMonteCarlo || false;
    const sensitivityAnalysis = options.sensitivityAnalysis || false;
    
    const projections = scenarios.map(scenario => ({
      scenario,
      data: this.generateCashFlowProjection(period, scenario),
      metrics: this.calculateProjectionMetrics(this.generateCashFlowProjection(period, scenario))
    }));

    const result = {
      period,
      scenarios: projections,
      summary: this.calculateProjectionSummary(projections),
      recommendations: this.generateProjectionRecommendations(projections)
    };

    if (includeMonteCarlo) {
      result.monteCarlo = this.performMonteCarloAnalysis(period, 1000);
    }

    if (sensitivityAnalysis) {
      result.sensitivity = this.performSensitivityAnalysis(projections[1].data, [
        'revenue_growth',
        'expense_inflation',
        'seasonality',
        'market_conditions'
      ]);
    }

    return result;
  }

  /**
   * Calcula métricas da projeção
   */
  calculateProjectionMetrics(projection) {
    const totalRevenue = projection.reduce((sum, p) => sum + p.projectedIncome, 0);
    const totalExpenses = projection.reduce((sum, p) => sum + p.projectedExpense, 0);
    const netProfit = totalRevenue - totalExpenses;
    const avgMonthlyRevenue = totalRevenue / projection.length;
    const avgMonthlyExpenses = totalExpenses / projection.length;
    
    // Calcula volatilidade
    const revenueValues = projection.map(p => p.projectedIncome);
    const revenueVolatility = this.calculateVolatility(revenueValues);
    
    // Calcula crescimento médio
    const revenueGrowth = this.calculateAverageGrowth(revenueValues);
    const expenseGrowth = this.calculateAverageGrowth(projection.map(p => p.projectedExpense));
    
    // Calcula ponto de equilíbrio
    const breakEven = this.calculateBreakEvenPoint(projection);
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      avgMonthlyRevenue,
      avgMonthlyExpenses,
      revenueVolatility,
      revenueGrowth,
      expenseGrowth,
      breakEven,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      expenseRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
    };
  }

  /**
   * Calcula resumo das projeções
   */
  calculateProjectionSummary(projections) {
    const realistic = projections.find(p => p.scenario === 'realistic');
    const optimistic = projections.find(p => p.scenario === 'optimistic');
    const pessimistic = projections.find(p => p.scenario === 'pessimistic');
    
    return {
      bestCase: {
        netProfit: optimistic.metrics.netProfit,
        revenue: optimistic.metrics.totalRevenue,
        profitMargin: optimistic.metrics.profitMargin
      },
      worstCase: {
        netProfit: pessimistic.metrics.netProfit,
        revenue: pessimistic.metrics.totalRevenue,
        profitMargin: pessimistic.metrics.profitMargin
      },
      mostLikely: {
        netProfit: realistic.metrics.netProfit,
        revenue: realistic.metrics.totalRevenue,
        profitMargin: realistic.metrics.profitMargin
      },
      riskAssessment: this.assessProjectionRisk(projections)
    };
  }

  /**
   * Avalia risco das projeções
   */
  assessProjectionRisk(projections) {
    const realistic = projections.find(p => p.scenario === 'realistic');
    const optimistic = projections.find(p => p.scenario === 'optimistic');
    const pessimistic = projections.find(p => p.scenario === 'pessimistic');
    
    const profitVariance = optimistic.metrics.netProfit - pessimistic.metrics.netProfit;
    const revenueVariance = optimistic.metrics.totalRevenue - pessimistic.metrics.totalRevenue;
    
    const riskScore = this.calculateRiskScore(realistic.metrics);
    
    return {
      profitVariance,
      revenueVariance,
      riskScore,
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      recommendations: this.generateRiskRecommendations(riskScore, realistic.metrics)
    };
  }

  /**
   * Calcula score de risco
   */
  calculateRiskScore(metrics) {
    let score = 0;
    
    // Volatilidade da receita
    if (metrics.revenueVolatility > 0.3) score += 0.3;
    else if (metrics.revenueVolatility > 0.2) score += 0.2;
    else if (metrics.revenueVolatility > 0.1) score += 0.1;
    
    // Margem de lucro
    if (metrics.profitMargin < 5) score += 0.3;
    else if (metrics.profitMargin < 10) score += 0.2;
    else if (metrics.profitMargin < 15) score += 0.1;
    
    // Crescimento da receita
    if (metrics.revenueGrowth < 0) score += 0.2;
    else if (metrics.revenueGrowth < 0.05) score += 0.1;
    
    // Crescimento das despesas
    if (metrics.expenseGrowth > 0.15) score += 0.2;
    else if (metrics.expenseGrowth > 0.10) score += 0.1;
    
    return Math.min(score, 1);
  }

  /**
   * Gera recomendações de risco
   */
  generateRiskRecommendations(riskScore, metrics) {
    const recommendations = [];
    
    if (riskScore > 0.7) {
      recommendations.push({
        type: 'high_risk',
        priority: 'critical',
        title: 'Alto Risco Financeiro',
        description: 'As projeções indicam alto risco financeiro',
        actions: [
          'Revisar estratégia de negócio',
          'Implementar controles de custos rigorosos',
          'Diversificar fontes de receita',
          'Considerar reserva de emergência'
        ]
      });
    }
    
    if (metrics.revenueVolatility > 0.3) {
      recommendations.push({
        type: 'volatility',
        priority: 'high',
        title: 'Alta Volatilidade de Receita',
        description: 'A receita apresenta alta variabilidade',
        actions: [
          'Implementar contratos de longo prazo',
          'Diversificar base de clientes',
          'Criar reserva para períodos de baixa receita'
        ]
      });
    }
    
    if (metrics.profitMargin < 10) {
      recommendations.push({
        type: 'low_margin',
        priority: 'high',
        title: 'Margem de Lucro Baixa',
        description: 'A margem de lucro está abaixo do ideal',
        actions: [
          'Revisar preços de venda',
          'Otimizar custos operacionais',
          'Aumentar eficiência produtiva'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Executa análise de Monte Carlo
   */
  performMonteCarloAnalysis(period, iterations = 1000) {
    const periods = this.getPeriods(period);
    const historicalData = this.getHistoricalData();
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const simulation = periods.map(period => {
        // Simula variações aleatórias baseadas em dados históricos
        const baseIncome = historicalData.income * (1 + (Math.random() - 0.5) * 0.4);
        const baseExpense = historicalData.expense * (1 + (Math.random() - 0.5) * 0.2);
        
        const seasonalFactor = this.getSeasonalFactor(period.month);
        const randomFactor = 1 + (Math.random() - 0.5) * 0.3;
        
        const projectedIncome = baseIncome * seasonalFactor * randomFactor;
        const projectedExpense = baseExpense * seasonalFactor * randomFactor;
        
        return {
          projectedIncome,
          projectedExpense,
          netCashFlow: projectedIncome - projectedExpense
        };
      });
      
      const totalNetCashFlow = simulation.reduce((sum, s) => sum + s.netCashFlow, 0);
      results.push(totalNetCashFlow);
    }
    
    // Calcula estatísticas
    results.sort((a, b) => a - b);
    const mean = results.reduce((sum, r) => sum + r, 0) / results.length;
    const median = results[Math.floor(results.length / 2)];
    const p10 = results[Math.floor(results.length * 0.1)];
    const p90 = results[Math.floor(results.length * 0.9)];
    const stdDev = Math.sqrt(results.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / results.length);
    
    return {
      mean,
      median,
      p10,
      p90,
      stdDev,
      confidenceInterval: {
        lower: p10,
        upper: p90
      },
      probabilityOfProfit: results.filter(r => r > 0).length / results.length
    };
  }

  /**
   * Gera projeção de receitas
   */
  generateRevenueProjection(period = '12months', scenario = 'realistic') {
    const periods = this.getPeriods(period);
    const scenarioData = this.scenarios.find(s => s.id === scenario);
    const historicalRevenue = this.getHistoricalRevenue();
    
    return periods.map(period => {
      const baseRevenue = this.calculateBaseRevenue(period, historicalRevenue);
      const seasonalFactor = this.getSeasonalFactor(period.month);
      const scenarioMultiplier = scenarioData.multiplier;
      
      const projectedRevenue = baseRevenue * seasonalFactor * scenarioMultiplier;
      
      return {
        period: period.label,
        date: period.date,
        month: period.month,
        year: period.year,
        projectedRevenue,
        growthRate: this.calculateGrowthRate(period, historicalRevenue),
        confidence: this.calculateConfidence(period, historicalRevenue)
      };
    });
  }

  /**
   * Gera projeção de despesas
   */
  generateExpenseProjection(period = '12months', scenario = 'realistic') {
    const periods = this.getPeriods(period);
    const scenarioData = this.scenarios.find(s => s.id === scenario);
    const historicalExpenses = this.getHistoricalExpenses();
    
    return periods.map(period => {
      const baseExpense = this.calculateBaseExpense(period, historicalExpenses);
      const seasonalFactor = this.getSeasonalFactor(period.month);
      const scenarioMultiplier = scenarioData.multiplier;
      
      const projectedExpense = baseExpense * seasonalFactor * scenarioMultiplier;
      
      return {
        period: period.label,
        date: period.date,
        month: period.month,
        year: period.year,
        projectedExpense,
        fixedCosts: this.calculateFixedCosts(period),
        variableCosts: projectedExpense - this.calculateFixedCosts(period),
        confidence: this.calculateConfidence(period, historicalExpenses)
      };
    });
  }

  // ===== ANÁLISE DE CENÁRIOS =====

  /**
   * Compara cenários
   */
  compareScenarios(period = '12months') {
    const scenarios = this.scenarios.map(scenario => {
      const projection = this.generateCashFlowProjection(period, scenario.id);
      const totalCashFlow = projection.reduce((sum, p) => sum + p.netCashFlow, 0);
      const avgMonthlyCashFlow = totalCashFlow / projection.length;
      const volatility = this.calculateVolatility(projection);
      
      return {
        ...scenario,
        projection,
        totalCashFlow,
        avgMonthlyCashFlow,
        volatility,
        riskLevel: this.calculateRiskLevel(volatility, avgMonthlyCashFlow)
      };
    });

    return scenarios;
  }

  /**
   * Análise de sensibilidade
   */
  performSensitivityAnalysis(baseProjection, variables) {
    const results = [];
    
    variables.forEach(variable => {
      const variations = [-0.2, -0.1, 0, 0.1, 0.2]; // -20%, -10%, 0%, +10%, +20%
      
      variations.forEach(variation => {
        const modifiedProjection = this.applyVariation(baseProjection, variable, variation);
        const totalImpact = this.calculateTotalImpact(modifiedProjection, baseProjection);
        
        results.push({
          variable,
          variation: variation * 100,
          totalImpact,
          projection: modifiedProjection
        });
      });
    });

    return results;
  }

  // ===== ANÁLISE DE VIABILIDADE =====

  /**
   * Calcula ponto de equilíbrio
   */
  calculateBreakEvenPoint(projection) {
    const fixedCosts = projection.reduce((sum, p) => sum + p.fixedCosts, 0) / projection.length;
    const avgRevenue = projection.reduce((sum, p) => sum + p.projectedIncome, 0) / projection.length;
    const avgVariableCosts = projection.reduce((sum, p) => sum + p.variableCosts, 0) / projection.length;
    
    const contributionMargin = avgRevenue - avgVariableCosts;
    const breakEvenUnits = fixedCosts / contributionMargin;
    
    return {
      breakEvenUnits,
      breakEvenRevenue: breakEvenUnits * avgRevenue,
      contributionMargin,
      marginOfSafety: (avgRevenue - breakEvenUnits * avgRevenue) / avgRevenue
    };
  }

  /**
   * Calcula métricas de viabilidade
   */
  calculateViabilityMetrics(projection) {
    const totalRevenue = projection.reduce((sum, p) => sum + p.projectedIncome, 0);
    const totalExpenses = projection.reduce((sum, p) => sum + p.projectedExpense, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const avgMonthlyRevenue = totalRevenue / projection.length;
    const avgMonthlyExpenses = totalExpenses / projection.length;
    
    return {
      netProfit,
      profitMargin: netProfit / totalRevenue,
      avgMonthlyRevenue,
      avgMonthlyExpenses,
      revenueGrowth: this.calculateGrowthRate(projection[projection.length - 1], projection[0]),
      expenseGrowth: this.calculateExpenseGrowth(projection),
      cashFlowStability: this.calculateCashFlowStability(projection)
    };
  }

  // ===== ALERTAS E RECOMENDAÇÕES =====

  /**
   * Gera alertas de projeção
   */
  generateProjectionAlerts(projection) {
    const alerts = [];
    
    // Alerta para fluxo de caixa negativo
    const negativeCashFlow = projection.filter(p => p.cumulativeCashFlow < 0);
    if (negativeCashFlow.length > 0) {
      alerts.push({
        type: 'negative_cash_flow',
        severity: 'high',
        message: `Fluxo de caixa negativo previsto em ${negativeCashFlow.length} períodos`,
        periods: negativeCashFlow.map(p => p.period)
      });
    }
    
    // Alerta para baixa confiança
    const lowConfidence = projection.filter(p => p.confidence < 0.7);
    if (lowConfidence.length > 0) {
      alerts.push({
        type: 'low_confidence',
        severity: 'medium',
        message: `Baixa confiança nas projeções para ${lowConfidence.length} períodos`,
        periods: lowConfidence.map(p => p.period)
      });
    }
    
    // Alerta para alta volatilidade
    const volatility = this.calculateVolatility(projection);
    if (volatility > 0.3) {
      alerts.push({
        type: 'high_volatility',
        severity: 'medium',
        message: `Alta volatilidade nas projeções (${(volatility * 100).toFixed(1)}%)`,
        volatility
      });
    }
    
    return alerts;
  }

  /**
   * Gera recomendações
   */
  generateRecommendations(projection, metrics) {
    const recommendations = [];
    
    // Recomendação baseada na margem de lucro
    if (metrics.profitMargin < 0.1) {
      recommendations.push({
        type: 'profit_margin',
        priority: 'high',
        title: 'Melhorar Margem de Lucro',
        description: 'A margem de lucro está abaixo de 10%. Considere reduzir custos ou aumentar preços.',
        actions: [
          'Revisar estrutura de custos',
          'Analisar preços de venda',
          'Identificar oportunidades de otimização'
        ]
      });
    }
    
    // Recomendação baseada no crescimento
    if (metrics.revenueGrowth < 0.05) {
      recommendations.push({
        type: 'growth',
        priority: 'medium',
        title: 'Acelerar Crescimento',
        description: 'O crescimento de receita está abaixo de 5% ao mês.',
        actions: [
          'Investir em marketing',
          'Expandir base de clientes',
          'Desenvolver novos produtos/serviços'
        ]
      });
    }
    
    // Recomendação baseada na estabilidade
    if (metrics.cashFlowStability < 0.7) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        title: 'Melhorar Estabilidade do Fluxo de Caixa',
        description: 'O fluxo de caixa apresenta alta variabilidade.',
        actions: [
          'Diversificar fontes de receita',
          'Implementar reserva de emergência',
          'Revisar políticas de cobrança'
        ]
      });
    }
    
    return recommendations;
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtém períodos para projeção
   */
  getPeriods(period) {
    const periods = [];
    const today = new Date();
    
    let months = 12;
    if (period === '3months') months = 3;
    else if (period === '6months') months = 6;
    else if (period === '24months') months = 24;
    else if (period === '36months') months = 36;
    
    for (let i = 1; i <= months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      periods.push({
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        date: date.toISOString().split('T')[0],
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    }
    
    return periods;
  }

  /**
   * Obtém dados históricos
   */
  getHistoricalData() {
    // Integra com sistema financeiro existente
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      const last12Months = cashFlow.slice(-12);
      
      return {
        income: last12Months.filter(c => c.type === 'income').reduce((sum, c) => sum + c.amount, 0) / 12,
        expense: last12Months.filter(c => c.type === 'expense').reduce((sum, c) => sum + c.amount, 0) / 12
      };
    }
    
    return { income: 10000, expense: 8000 }; // Valores padrão
  }

  /**
   * Obtém receita histórica
   */
  getHistoricalRevenue() {
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      return cashFlow.filter(c => c.type === 'income').map(c => c.amount);
    }
    
    return [10000, 11000, 12000, 13000, 14000, 15000]; // Dados de exemplo
  }

  /**
   * Obtém despesas históricas
   */
  getHistoricalExpenses() {
    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      return cashFlow.filter(c => c.type === 'expense').map(c => c.amount);
    }
    
    return [8000, 8500, 9000, 9500, 10000, 10500]; // Dados de exemplo
  }

  /**
   * Calcula valor base
   */
  calculateBaseAmount(period, historicalData) {
    // Implementa lógica de cálculo baseada em dados históricos
    return {
      income: historicalData.income * (1 + this.assumptions.growthRate),
      expense: historicalData.expense * (1 + this.assumptions.inflationRate)
    };
  }

  /**
   * Calcula receita base
   */
  calculateBaseRevenue(period, historicalRevenue) {
    if (historicalRevenue.length === 0) return 10000;
    
    const avgRevenue = historicalRevenue.reduce((sum, r) => sum + r, 0) / historicalRevenue.length;
    const growthRate = this.assumptions.growthRate;
    
    return avgRevenue * (1 + growthRate);
  }

  /**
   * Calcula despesa base
   */
  calculateBaseExpense(period, historicalExpenses) {
    if (historicalExpenses.length === 0) return 8000;
    
    const avgExpense = historicalExpenses.reduce((sum, e) => sum + e, 0) / historicalExpenses.length;
    const inflationRate = this.assumptions.inflationRate;
    
    return avgExpense * (1 + inflationRate);
  }

  /**
   * Obtém fator sazonal
   */
  getSeasonalFactor(month) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return this.assumptions.seasonalityFactors[monthNames[month - 1]] || 1.0;
  }

  /**
   * Calcula confiança
   */
  calculateConfidence(period, historicalData) {
    // Baseado na quantidade de dados históricos e variabilidade
    const dataPoints = Array.isArray(historicalData) ? historicalData.length : 12;
    const baseConfidence = Math.min(dataPoints / 12, 1.0);
    
    // Reduz confiança para períodos mais distantes
    const monthsAhead = period.month - new Date().getMonth();
    const distanceFactor = Math.max(0.5, 1 - (monthsAhead * 0.1));
    
    return baseConfidence * distanceFactor;
  }

  /**
   * Calcula volatilidade
   */
  calculateVolatility(projection) {
    const values = projection.map(p => p.netCashFlow);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / Math.abs(mean);
  }

  /**
   * Calcula nível de risco
   */
  calculateRiskLevel(volatility, avgCashFlow) {
    if (volatility < 0.1) return 'low';
    if (volatility < 0.2) return 'medium';
    return 'high';
  }

  /**
   * Aplica variação
   */
  applyVariation(projection, variable, variation) {
    return projection.map(period => {
      const modified = { ...period };
      
      if (variable === 'revenue') {
        modified.projectedIncome *= (1 + variation);
        modified.netCashFlow = modified.projectedIncome - modified.projectedExpense;
      } else if (variable === 'expense') {
        modified.projectedExpense *= (1 + variation);
        modified.netCashFlow = modified.projectedIncome - modified.projectedExpense;
      }
      
      return modified;
    });
  }

  /**
   * Calcula impacto total
   */
  calculateTotalImpact(modifiedProjection, baseProjection) {
    const modifiedTotal = modifiedProjection.reduce((sum, p) => sum + p.netCashFlow, 0);
    const baseTotal = baseProjection.reduce((sum, p) => sum + p.netCashFlow, 0);
    return modifiedTotal - baseTotal;
  }

  /**
   * Calcula taxa de crescimento
   */
  calculateGrowthRate(currentPeriod, basePeriod) {
    if (basePeriod.projectedIncome === 0) return 0;
    return (currentPeriod.projectedIncome - basePeriod.projectedIncome) / basePeriod.projectedIncome;
  }

  /**
   * Calcula crescimento de despesas
   */
  calculateExpenseGrowth(projection) {
    if (projection.length < 2) return 0;
    const first = projection[0].projectedExpense;
    const last = projection[projection.length - 1].projectedExpense;
    return (last - first) / first;
  }

  /**
   * Calcula custos fixos
   */
  calculateFixedCosts(period) {
    // 60% das despesas são consideradas fixas
    return period.projectedExpense * 0.6;
  }

  /**
   * Calcula estabilidade do fluxo de caixa
   */
  calculateCashFlowStability(projection) {
    const values = projection.map(p => p.netCashFlow);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Estabilidade é inversamente proporcional ao coeficiente de variação
    return Math.max(0, 1 - (stdDev / Math.abs(mean)));
  }

  /**
   * Carrega dados padrão
   */
  loadDefaultData() {
    if (this.projectionData.length === 0) {
      // Adiciona dados de exemplo se necessário
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando a página for carregada
  }
}

// Instância global
const financialProjections = new FinancialProjectionsSystem();

// Exporta para uso global
window.financialProjections = financialProjections;
