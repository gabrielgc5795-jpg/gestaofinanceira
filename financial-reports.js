/**
 * Sistema de Relatórios Financeiros Profissionais
 * Geração de DRE, Balanço Patrimonial, Fluxo de Caixa e outros relatórios essenciais
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class FinancialReportsSystem {
  constructor() {
    this.reports = this.loadReports();
    this.templates = this.loadTemplates();
    this.settings = this.loadSettings();
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
   * Carrega relatórios
   */
  loadReports() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('financial_reports') || [];
      } else {
        const data = localStorage.getItem('financial_reports');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      return [];
    }
  }

  /**
   * Carrega templates
   */
  loadTemplates() {
    return {
      dre: {
        name: 'Demonstração do Resultado do Exercício',
        sections: [
          { id: 'revenue', name: 'Receitas', type: 'positive' },
          { id: 'cost_of_sales', name: 'Custo dos Produtos/Serviços Vendidos', type: 'negative' },
          { id: 'gross_profit', name: 'Lucro Bruto', type: 'calculated' },
          { id: 'operating_expenses', name: 'Despesas Operacionais', type: 'negative' },
          { id: 'operating_profit', name: 'Lucro Operacional', type: 'calculated' },
          { id: 'financial_result', name: 'Resultado Financeiro', type: 'calculated' },
          { id: 'net_profit', name: 'Lucro Líquido', type: 'calculated' }
        ]
      },
      balance_sheet: {
        name: 'Balanço Patrimonial',
        sections: [
          { id: 'current_assets', name: 'Ativo Circulante', type: 'positive' },
          { id: 'non_current_assets', name: 'Ativo Não Circulante', type: 'positive' },
          { id: 'total_assets', name: 'Total do Ativo', type: 'calculated' },
          { id: 'current_liabilities', name: 'Passivo Circulante', type: 'negative' },
          { id: 'non_current_liabilities', name: 'Passivo Não Circulante', type: 'negative' },
          { id: 'total_liabilities', name: 'Total do Passivo', type: 'calculated' },
          { id: 'equity', name: 'Patrimônio Líquido', type: 'calculated' }
        ]
      },
      cash_flow: {
        name: 'Demonstração do Fluxo de Caixa',
        sections: [
          { id: 'operating_activities', name: 'Atividades Operacionais', type: 'calculated' },
          { id: 'investing_activities', name: 'Atividades de Investimento', type: 'calculated' },
          { id: 'financing_activities', name: 'Atividades de Financiamento', type: 'calculated' },
          { id: 'net_cash_flow', name: 'Variação Líquida do Caixa', type: 'calculated' },
          { id: 'opening_cash', name: 'Saldo Inicial do Caixa', type: 'positive' },
          { id: 'closing_cash', name: 'Saldo Final do Caixa', type: 'calculated' }
        ]
      }
    };
  }

  /**
   * Carrega configurações
   */
  loadSettings() {
    return {
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      decimalPlaces: 2,
      showPercentages: true,
      includeCharts: true,
      autoGenerate: true
    };
  }

  /**
   * Salva relatórios
   */
  async saveReports() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('financial_reports', this.reports);
      } else {
        localStorage.setItem('financial_reports', JSON.stringify(this.reports));
      }
    } catch (error) {
      console.error('Erro ao salvar relatórios:', error);
    }
  }

  // ===== GERAÇÃO DE RELATÓRIOS =====

  /**
   * Gera DRE (Demonstração do Resultado do Exercício)
   */
  async generateDRE(period, options = {}) {
    const dreData = await this.calculateDREData(period);
    
    const report = {
      id: this.generateReportId(),
      type: 'dre',
      name: `DRE - ${period.startDate} a ${period.endDate}`,
      period: period,
      data: dreData,
      generatedAt: new Date().toISOString(),
      generatedBy: this.getCurrentUser()?.username || 'Sistema',
      status: 'completed'
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  /**
   * Calcula dados da DRE
   */
  async calculateDREData(period) {
    const financialData = await this.getFinancialData(period);
    
    // Receitas
    const revenue = this.calculateRevenue(financialData);
    
    // Custo dos produtos/serviços vendidos
    const costOfSales = this.calculateCostOfSales(financialData);
    
    // Lucro bruto
    const grossProfit = revenue - costOfSales;
    
    // Despesas operacionais
    const operatingExpenses = this.calculateOperatingExpenses(financialData);
    
    // Lucro operacional
    const operatingProfit = grossProfit - operatingExpenses;
    
    // Resultado financeiro
    const financialResult = this.calculateFinancialResult(financialData);
    
    // Lucro líquido
    const netProfit = operatingProfit + financialResult;

    return {
      revenue: {
        amount: revenue,
        percentage: 100
      },
      costOfSales: {
        amount: costOfSales,
        percentage: revenue > 0 ? (costOfSales / revenue) * 100 : 0
      },
      grossProfit: {
        amount: grossProfit,
        percentage: revenue > 0 ? (grossProfit / revenue) * 100 : 0
      },
      operatingExpenses: {
        amount: operatingExpenses,
        percentage: revenue > 0 ? (operatingExpenses / revenue) * 100 : 0
      },
      operatingProfit: {
        amount: operatingProfit,
        percentage: revenue > 0 ? (operatingProfit / revenue) * 100 : 0
      },
      financialResult: {
        amount: financialResult,
        percentage: revenue > 0 ? (financialResult / revenue) * 100 : 0
      },
      netProfit: {
        amount: netProfit,
        percentage: revenue > 0 ? (netProfit / revenue) * 100 : 0
      },
      margins: {
        grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        operatingMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
        netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
      }
    };
  }

  /**
   * Gera Balanço Patrimonial
   */
  async generateBalanceSheet(date, options = {}) {
    const balanceData = await this.calculateBalanceSheetData(date);
    
    const report = {
      id: this.generateReportId(),
      type: 'balance_sheet',
      name: `Balanço Patrimonial - ${date}`,
      date: date,
      data: balanceData,
      generatedAt: new Date().toISOString(),
      generatedBy: this.getCurrentUser()?.username || 'Sistema',
      status: 'completed'
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  /**
   * Calcula dados do Balanço Patrimonial
   */
  async calculateBalanceSheetData(date) {
    const assets = await this.calculateAssets(date);
    const liabilities = await this.calculateLiabilities(date);
    const equity = await this.calculateEquity(date, assets, liabilities);

    return {
      assets: {
        current: assets.current,
        nonCurrent: assets.nonCurrent,
        total: assets.total
      },
      liabilities: {
        current: liabilities.current,
        nonCurrent: liabilities.nonCurrent,
        total: liabilities.total
      },
      equity: equity,
      balance: {
        assets: assets.total,
        liabilitiesAndEquity: liabilities.total + equity.total,
        isBalanced: Math.abs(assets.total - (liabilities.total + equity.total)) < 0.01
      }
    };
  }

  /**
   * Gera Fluxo de Caixa
   */
  async generateCashFlow(period, options = {}) {
    const cashFlowData = await this.calculateCashFlowData(period);
    
    const report = {
      id: this.generateReportId(),
      type: 'cash_flow',
      name: `Fluxo de Caixa - ${period.startDate} a ${period.endDate}`,
      period: period,
      data: cashFlowData,
      generatedAt: new Date().toISOString(),
      generatedBy: this.getCurrentUser()?.username || 'Sistema',
      status: 'completed'
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  /**
   * Calcula dados do Fluxo de Caixa
   */
  async calculateCashFlowData(period) {
    const operatingActivities = await this.calculateOperatingActivities(period);
    const investingActivities = await this.calculateInvestingActivities(period);
    const financingActivities = await this.calculateFinancingActivities(period);
    
    const netCashFlow = operatingActivities + investingActivities + financingActivities;
    const openingCash = await this.getOpeningCashBalance(period.startDate);
    const closingCash = openingCash + netCashFlow;

    return {
      operatingActivities: {
        amount: operatingActivities,
        details: await this.getOperatingActivitiesDetails(period)
      },
      investingActivities: {
        amount: investingActivities,
        details: await this.getInvestingActivitiesDetails(period)
      },
      financingActivities: {
        amount: financingActivities,
        details: await this.getFinancingActivitiesDetails(period)
      },
      netCashFlow: netCashFlow,
      openingCash: openingCash,
      closingCash: closingCash
    };
  }

  // ===== CÁLCULOS ESPECÍFICOS =====

  /**
   * Calcula receitas
   */
  calculateRevenue(financialData) {
    return financialData.income.reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Calcula custo dos produtos/serviços vendidos
   */
  calculateCostOfSales(financialData) {
    return financialData.expenses
      .filter(expense => expense.category === 'cost_of_sales')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Calcula despesas operacionais
   */
  calculateOperatingExpenses(financialData) {
    return financialData.expenses
      .filter(expense => expense.category !== 'cost_of_sales')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Calcula resultado financeiro
   */
  calculateFinancialResult(financialData) {
    const financialIncome = financialData.income
      .filter(item => item.category === 'financial')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const financialExpenses = financialData.expenses
      .filter(expense => expense.category === 'financial')
      .reduce((sum, expense) => sum + expense.amount, 0);

    return financialIncome - financialExpenses;
  }

  /**
   * Calcula ativos
   */
  async calculateAssets(date) {
    const currentAssets = await this.calculateCurrentAssets(date);
    const nonCurrentAssets = await this.calculateNonCurrentAssets(date);

    return {
      current: currentAssets,
      nonCurrent: nonCurrentAssets,
      total: currentAssets + nonCurrentAssets
    };
  }

  /**
   * Calcula ativo circulante
   */
  async calculateCurrentAssets(date) {
    // Caixa e equivalentes
    const cash = await this.getCashBalance(date);
    
    // Contas a receber
    const accountsReceivable = await this.getAccountsReceivable(date);
    
    // Estoque
    const inventory = await this.getInventoryValue(date);
    
    // Outros ativos circulantes
    const otherCurrentAssets = await this.getOtherCurrentAssets(date);

    return cash + accountsReceivable + inventory + otherCurrentAssets;
  }

  /**
   * Calcula ativo não circulante
   */
  async calculateNonCurrentAssets(date) {
    // Imobilizado
    const fixedAssets = await this.getFixedAssetsValue(date);
    
    // Investimentos
    const investments = await this.getInvestmentsValue(date);
    
    // Intangível
    const intangibleAssets = await this.getIntangibleAssetsValue(date);

    return fixedAssets + investments + intangibleAssets;
  }

  /**
   * Calcula passivos
   */
  async calculateLiabilities(date) {
    const currentLiabilities = await this.calculateCurrentLiabilities(date);
    const nonCurrentLiabilities = await this.calculateNonCurrentLiabilities(date);

    return {
      current: currentLiabilities,
      nonCurrent: nonCurrentLiabilities,
      total: currentLiabilities + nonCurrentLiabilities
    };
  }

  /**
   * Calcula passivo circulante
   */
  async calculateCurrentLiabilities(date) {
    // Contas a pagar
    const accountsPayable = await this.getAccountsPayable(date);
    
    // Empréstimos de curto prazo
    const shortTermLoans = await this.getShortTermLoans(date);
    
    // Outros passivos circulantes
    const otherCurrentLiabilities = await this.getOtherCurrentLiabilities(date);

    return accountsPayable + shortTermLoans + otherCurrentLiabilities;
  }

  /**
   * Calcula passivo não circulante
   */
  async calculateNonCurrentLiabilities(date) {
    // Empréstimos de longo prazo
    const longTermLoans = await this.getLongTermLoans(date);
    
    // Outros passivos não circulantes
    const otherNonCurrentLiabilities = await this.getOtherNonCurrentLiabilities(date);

    return longTermLoans + otherNonCurrentLiabilities;
  }

  /**
   * Calcula patrimônio líquido
   */
  async calculateEquity(date, assets, liabilities) {
    const capital = await this.getCapital(date);
    const retainedEarnings = await this.getRetainedEarnings(date);
    const otherEquity = await this.getOtherEquity(date);

    return {
      capital: capital,
      retainedEarnings: retainedEarnings,
      other: otherEquity,
      total: capital + retainedEarnings + otherEquity
    };
  }

  // ===== ATIVIDADES DO FLUXO DE CAIXA =====

  /**
   * Calcula atividades operacionais
   */
  async calculateOperatingActivities(period) {
    const operatingIncome = await this.getOperatingIncome(period);
    const operatingExpenses = await this.getOperatingExpenses(period);
    const workingCapitalChanges = await this.getWorkingCapitalChanges(period);

    return operatingIncome - operatingExpenses + workingCapitalChanges;
  }

  /**
   * Calcula atividades de investimento
   */
  async calculateInvestingActivities(period) {
    const assetPurchases = await this.getAssetPurchases(period);
    const assetSales = await this.getAssetSales(period);
    const investmentPurchases = await this.getInvestmentPurchases(period);
    const investmentSales = await this.getInvestmentSales(period);

    return (assetSales + investmentSales) - (assetPurchases + investmentPurchases);
  }

  /**
   * Calcula atividades de financiamento
   */
  async calculateFinancingActivities(period) {
    const loanProceeds = await this.getLoanProceeds(period);
    const loanPayments = await this.getLoanPayments(period);
    const capitalContributions = await this.getCapitalContributions(period);
    const dividends = await this.getDividends(period);

    return (loanProceeds + capitalContributions) - (loanPayments + dividends);
  }

  // ===== ANÁLISES E INDICADORES =====

  /**
   * Gera análise de indicadores financeiros
   */
  async generateFinancialAnalysis(period) {
    const dreData = await this.calculateDREData(period);
    const balanceData = await this.calculateBalanceSheetData(period.endDate);
    const cashFlowData = await this.calculateCashFlowData(period);

    return {
      profitability: this.calculateProfitabilityRatios(dreData, balanceData),
      liquidity: this.calculateLiquidityRatios(balanceData),
      efficiency: this.calculateEfficiencyRatios(dreData, balanceData),
      leverage: this.calculateLeverageRatios(balanceData),
      cashFlow: this.calculateCashFlowRatios(cashFlowData, dreData)
    };
  }

  /**
   * Calcula indicadores de rentabilidade
   */
  calculateProfitabilityRatios(dreData, balanceData) {
    const revenue = dreData.revenue.amount;
    const netProfit = dreData.netProfit.amount;
    const totalAssets = balanceData.assets.total;
    const equity = balanceData.equity.total;

    return {
      netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      roa: totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0,
      roe: equity > 0 ? (netProfit / equity) * 100 : 0,
      grossMargin: dreData.margins.grossMargin,
      operatingMargin: dreData.margins.operatingMargin
    };
  }

  /**
   * Calcula indicadores de liquidez
   */
  calculateLiquidityRatios(balanceData) {
    const currentAssets = balanceData.assets.current;
    const currentLiabilities = balanceData.liabilities.current;

    return {
      currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
      quickRatio: currentLiabilities > 0 ? (currentAssets - 0) / currentLiabilities : 0, // Assumindo estoque = 0 para simplicidade
      cashRatio: currentLiabilities > 0 ? 0 / currentLiabilities : 0 // Assumindo caixa = 0 para simplicidade
    };
  }

  /**
   * Calcula indicadores de eficiência
   */
  calculateEfficiencyRatios(dreData, balanceData) {
    const revenue = dreData.revenue.amount;
    const totalAssets = balanceData.assets.total;

    return {
      assetTurnover: totalAssets > 0 ? revenue / totalAssets : 0,
      inventoryTurnover: 0, // Seria calculado com dados de estoque
      receivablesTurnover: 0 // Seria calculado com dados de contas a receber
    };
  }

  /**
   * Calcula indicadores de alavancagem
   */
  calculateLeverageRatios(balanceData) {
    const totalLiabilities = balanceData.liabilities.total;
    const totalAssets = balanceData.assets.total;
    const equity = balanceData.equity.total;

    return {
      debtToAssets: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0,
      debtToEquity: equity > 0 ? (totalLiabilities / equity) * 100 : 0,
      equityRatio: totalAssets > 0 ? (equity / totalAssets) * 100 : 0
    };
  }

  /**
   * Calcula indicadores de fluxo de caixa
   */
  calculateCashFlowRatios(cashFlowData, dreData) {
    const operatingCashFlow = cashFlowData.operatingActivities.amount;
    const netProfit = dreData.netProfit.amount;
    const revenue = dreData.revenue.amount;

    return {
      operatingCashFlowMargin: revenue > 0 ? (operatingCashFlow / revenue) * 100 : 0,
      cashFlowToNetIncome: netProfit > 0 ? operatingCashFlow / netProfit : 0,
      freeCashFlow: operatingCashFlow + cashFlowData.investingActivities.amount
    };
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtém dados financeiros do período
   */
  async getFinancialData(period) {
    // Integra com sistemas existentes
    const income = [];
    const expenses = [];

    if (typeof financialControl !== 'undefined') {
      const cashFlow = financialControl.getCashFlow();
      const periodData = cashFlow.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(period.startDate) && entryDate <= new Date(period.endDate);
      });

      income.push(...periodData.filter(entry => entry.type === 'income'));
      expenses.push(...periodData.filter(entry => entry.type === 'expense'));
    }

    return { income, expenses };
  }

  /**
   * Gera ID único para relatório
   */
  generateReportId() {
    return 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    // Dados padrão serão carregados conforme necessário
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando a página for carregada
  }

  // ===== MÉTODOS DE INTEGRAÇÃO COM SISTEMAS EXISTENTES =====

  /**
   * Obtém saldo de caixa
   */
  async getCashBalance(date) {
    if (typeof financialControl !== 'undefined') {
      return financialControl.getCashBalance(date);
    }
    return 0;
  }

  /**
   * Obtém contas a receber
   */
  async getAccountsReceivable(date) {
    if (typeof accountsPayableReceivable !== 'undefined') {
      const summary = accountsPayableReceivable.getFinancialSummary();
      return summary.pendingReceivable.amount;
    }
    return 0;
  }

  /**
   * Obtém contas a pagar
   */
  async getAccountsPayable(date) {
    if (typeof accountsPayableReceivable !== 'undefined') {
      const summary = accountsPayableReceivable.getFinancialSummary();
      return summary.pendingPayable.amount;
    }
    return 0;
  }

  /**
   * Obtém valor do estoque
   */
  async getInventoryValue(date) {
    if (typeof inventoryManagement !== 'undefined') {
      return inventoryManagement.getTotalInventoryValue();
    }
    return 0;
  }

  /**
   * Obtém valor dos investimentos
   */
  async getInvestmentsValue(date) {
    if (typeof investmentManagement !== 'undefined') {
      const summary = investmentManagement.getWealthSummary();
      return summary.totalInvestments;
    }
    return 0;
  }

  /**
   * Obtém valor dos ativos fixos
   */
  async getFixedAssetsValue(date) {
    if (typeof investmentManagement !== 'undefined') {
      const summary = investmentManagement.getWealthSummary();
      return summary.totalAssets;
    }
    return 0;
  }

  // Implementação dos outros métodos auxiliares...
  // (métodos stub para manter o código funcional)

  async getOtherCurrentAssets(date) { return 0; }
  async getIntangibleAssetsValue(date) { return 0; }
  async getShortTermLoans(date) { return 0; }
  async getOtherCurrentLiabilities(date) { return 0; }
  async getLongTermLoans(date) { return 0; }
  async getOtherNonCurrentLiabilities(date) { return 0; }
  async getCapital(date) { return 0; }
  async getRetainedEarnings(date) { return 0; }
  async getOtherEquity(date) { return 0; }
  async getOpeningCashBalance(date) { return 0; }
  async getOperatingIncome(period) { return 0; }
  async getOperatingExpenses(period) { return 0; }
  async getWorkingCapitalChanges(period) { return 0; }
  async getAssetPurchases(period) { return 0; }
  async getAssetSales(period) { return 0; }
  async getInvestmentPurchases(period) { return 0; }
  async getInvestmentSales(period) { return 0; }
  async getLoanProceeds(period) { return 0; }
  async getLoanPayments(period) { return 0; }
  async getCapitalContributions(period) { return 0; }
  async getDividends(period) { return 0; }
  async getOperatingActivitiesDetails(period) { return []; }
  async getInvestingActivitiesDetails(period) { return []; }
  async getFinancingActivitiesDetails(period) { return []; }
}

// Instância global
const financialReports = new FinancialReportsSystem();

// Exporta para uso global
window.financialReports = financialReports;
