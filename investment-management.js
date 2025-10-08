/**
 * Sistema de Gestão de Investimentos e Patrimônio
 * Monitoramento de aplicações financeiras, cálculo de rentabilidade e riscos
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class InvestmentManagementSystem {
  constructor() {
    this.investments = this.loadInvestments();
    this.assets = this.loadAssets();
    this.portfolios = this.loadPortfolios();
    this.marketData = this.loadMarketData();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.startMarketMonitoring();
  }

  /**
   * Carrega investimentos
   */
  loadInvestments() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('investments') || [];
      } else {
        const data = localStorage.getItem('investments');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      return [];
    }
  }

  /**
   * Carrega ativos
   */
  loadAssets() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('assets') || [];
      } else {
        const data = localStorage.getItem('assets');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      return [];
    }
  }

  /**
   * Carrega portfólios
   */
  loadPortfolios() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('portfolios') || [];
      } else {
        const data = localStorage.getItem('portfolios');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar portfólios:', error);
      return [];
    }
  }

  /**
   * Carrega dados de mercado
   */
  loadMarketData() {
    return {
      riskFreeRate: 0.05, // 5% ao ano
      marketReturn: 0.12, // 12% ao ano
      inflationRate: 0.05, // 5% ao ano
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Salva investimentos
   */
  async saveInvestments() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('investments', this.investments);
      } else {
        localStorage.setItem('investments', JSON.stringify(this.investments));
      }
    } catch (error) {
      console.error('Erro ao salvar investimentos:', error);
    }
  }

  /**
   * Salva ativos
   */
  async saveAssets() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('assets', this.assets);
      } else {
        localStorage.setItem('assets', JSON.stringify(this.assets));
      }
    } catch (error) {
      console.error('Erro ao salvar ativos:', error);
    }
  }

  /**
   * Salva portfólios
   */
  async savePortfolios() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('portfolios', this.portfolios);
      } else {
        localStorage.setItem('portfolios', JSON.stringify(this.portfolios));
      }
    } catch (error) {
      console.error('Erro ao salvar portfólios:', error);
    }
  }

  // ===== GESTÃO DE INVESTIMENTOS =====

  /**
   * Adiciona novo investimento
   */
  async addInvestment(investmentData) {
    const newInvestment = {
      id: Math.max(...this.investments.map(i => i.id), 0) + 1,
      name: investmentData.name,
      type: investmentData.type, // stock, bond, fund, crypto, real_estate, other
      symbol: investmentData.symbol || '',
      initialAmount: parseFloat(investmentData.initialAmount),
      currentAmount: parseFloat(investmentData.initialAmount),
      quantity: parseFloat(investmentData.quantity) || 1,
      purchasePrice: parseFloat(investmentData.purchasePrice),
      currentPrice: parseFloat(investmentData.purchasePrice),
      purchaseDate: investmentData.purchaseDate || new Date().toISOString().split('T')[0],
      portfolioId: investmentData.portfolioId || null,
      riskLevel: investmentData.riskLevel || 'medium', // low, medium, high
      expectedReturn: investmentData.expectedReturn || 0.10,
      actualReturn: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      status: 'active', // active, sold, suspended
      notes: investmentData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema'
    };

    this.investments.push(newInvestment);
    await this.saveInvestments();

    // Atualiza portfólio se especificado
    if (newInvestment.portfolioId) {
      await this.updatePortfolio(newInvestment.portfolioId);
    }

    return newInvestment;
  }

  /**
   * Atualiza preço do investimento
   */
  async updateInvestmentPrice(investmentId, newPrice) {
    const investment = this.investments.find(i => i.id === investmentId);
    if (!investment) {
      throw new Error('Investimento não encontrado');
    }

    const oldPrice = investment.currentPrice;
    investment.currentPrice = parseFloat(newPrice);
    investment.currentAmount = investment.quantity * investment.currentPrice;
    
    // Calcula retornos
    investment.actualReturn = investment.currentAmount - investment.initialAmount;
    investment.totalReturn = investment.actualReturn;
    investment.totalReturnPercentage = investment.initialAmount > 0 ? 
      (investment.actualReturn / investment.initialAmount) * 100 : 0;

    // Calcula retorno anualizado
    const daysHeld = Math.max(1, Math.floor((new Date() - new Date(investment.purchaseDate)) / (1000 * 60 * 60 * 24)));
    const yearsHeld = daysHeld / 365;
    investment.annualizedReturn = yearsHeld > 0 ? 
      Math.pow(investment.currentAmount / investment.initialAmount, 1 / yearsHeld) - 1 : 0;

    // Atualiza portfólio
    if (investment.portfolioId) {
      await this.updatePortfolio(investment.portfolioId);
    }

    await this.saveInvestments();
    return investment;
  }

  /**
   * Vende investimento
   */
  async sellInvestment(investmentId, sellData) {
    const investment = this.investments.find(i => i.id === investmentId);
    if (!investment) {
      throw new Error('Investimento não encontrado');
    }

    const sellPrice = parseFloat(sellData.price);
    const sellQuantity = parseFloat(sellData.quantity) || investment.quantity;
    const sellDate = sellData.date || new Date().toISOString().split('T')[0];

    // Calcula ganho/perda
    const totalSellAmount = sellQuantity * sellPrice;
    const costBasis = (sellQuantity / investment.quantity) * investment.initialAmount;
    const gainLoss = totalSellAmount - costBasis;

    // Atualiza investimento
    investment.quantity -= sellQuantity;
    investment.currentAmount = investment.quantity * investment.currentPrice;
    investment.status = investment.quantity <= 0 ? 'sold' : 'active';

    // Cria registro de venda
    const saleRecord = {
      id: Math.max(...this.investments.map(i => i.id), 0) + 1,
      parentInvestmentId: investmentId,
      type: 'sale',
      quantity: sellQuantity,
      price: sellPrice,
      amount: totalSellAmount,
      costBasis: costBasis,
      gainLoss: gainLoss,
      gainLossPercentage: costBasis > 0 ? (gainLoss / costBasis) * 100 : 0,
      date: sellDate,
      notes: sellData.notes || '',
      createdAt: new Date().toISOString()
    };

    this.investments.push(saleRecord);
    await this.saveInvestments();

    // Atualiza portfólio
    if (investment.portfolioId) {
      await this.updatePortfolio(investment.portfolioId);
    }

    return saleRecord;
  }

  // ===== GESTÃO DE ATIVOS =====

  /**
   * Adiciona novo ativo
   */
  async addAsset(assetData) {
    const newAsset = {
      id: Math.max(...this.assets.map(a => a.id), 0) + 1,
      name: assetData.name,
      type: assetData.type, // real_estate, vehicle, equipment, intellectual_property, other
      category: assetData.category,
      description: assetData.description,
      purchaseValue: parseFloat(assetData.purchaseValue),
      currentValue: parseFloat(assetData.currentValue) || parseFloat(assetData.purchaseValue),
      purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
      depreciationMethod: assetData.depreciationMethod || 'straight_line', // straight_line, declining_balance
      usefulLife: assetData.usefulLife || 5, // anos
      depreciationRate: assetData.depreciationRate || 0.2, // 20% ao ano
      accumulatedDepreciation: 0,
      netBookValue: parseFloat(assetData.purchaseValue),
      appreciation: 0,
      appreciationPercentage: 0,
      location: assetData.location || '',
      condition: assetData.condition || 'good', // excellent, good, fair, poor
      warrantyExpiry: assetData.warrantyExpiry || null,
      insuranceValue: assetData.insuranceValue || 0,
      status: 'active', // active, sold, disposed, under_maintenance
      notes: assetData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema'
    };

    // Calcula depreciação inicial
    this.calculateDepreciation(newAsset);

    this.assets.push(newAsset);
    await this.saveAssets();

    return newAsset;
  }

  /**
   * Calcula depreciação do ativo
   */
  calculateDepreciation(asset) {
    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = new Date();
    const yearsOwned = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);

    if (asset.depreciationMethod === 'straight_line') {
      const annualDepreciation = asset.purchaseValue / asset.usefulLife;
      asset.accumulatedDepreciation = Math.min(annualDepreciation * yearsOwned, asset.purchaseValue);
    } else if (asset.depreciationMethod === 'declining_balance') {
      const rate = asset.depreciationRate;
      let remainingValue = asset.purchaseValue;
      
      for (let year = 0; year < Math.floor(yearsOwned); year++) {
        const yearlyDepreciation = remainingValue * rate;
        asset.accumulatedDepreciation += yearlyDepreciation;
        remainingValue -= yearlyDepreciation;
      }
      
      // Depreciação parcial do ano atual
      const partialYear = yearsOwned - Math.floor(yearsOwned);
      if (partialYear > 0) {
        const partialDepreciation = remainingValue * rate * partialYear;
        asset.accumulatedDepreciation += partialDepreciation;
      }
    }

    asset.netBookValue = asset.purchaseValue - asset.accumulatedDepreciation;
    asset.appreciation = asset.currentValue - asset.purchaseValue;
    asset.appreciationPercentage = asset.purchaseValue > 0 ? 
      (asset.appreciation / asset.purchaseValue) * 100 : 0;
  }

  /**
   * Atualiza valor do ativo
   */
  async updateAssetValue(assetId, newValue) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) {
      throw new Error('Ativo não encontrado');
    }

    asset.currentValue = parseFloat(newValue);
    this.calculateDepreciation(asset);
    await this.saveAssets();

    return asset;
  }

  // ===== GESTÃO DE PORTFÓLIOS =====

  /**
   * Cria novo portfólio
   */
  async createPortfolio(portfolioData) {
    const newPortfolio = {
      id: Math.max(...this.portfolios.map(p => p.id), 0) + 1,
      name: portfolioData.name,
      description: portfolioData.description,
      strategy: portfolioData.strategy || 'balanced', // conservative, balanced, aggressive
      targetReturn: portfolioData.targetReturn || 0.10,
      maxRisk: portfolioData.maxRisk || 0.15,
      rebalanceFrequency: portfolioData.rebalanceFrequency || 'quarterly', // monthly, quarterly, annually
      investments: [],
      totalValue: 0,
      totalCost: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      diversification: 0,
      lastRebalance: null,
      nextRebalance: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema'
    };

    this.portfolios.push(newPortfolio);
    await this.savePortfolios();

    return newPortfolio;
  }

  /**
   * Adiciona investimento ao portfólio
   */
  async addInvestmentToPortfolio(portfolioId, investmentId, allocation) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    const investment = this.investments.find(i => i.id === investmentId);
    
    if (!portfolio || !investment) {
      throw new Error('Portfólio ou investimento não encontrado');
    }

    // Atualiza investimento
    investment.portfolioId = portfolioId;
    investment.allocation = parseFloat(allocation);

    // Adiciona ao portfólio
    if (!portfolio.investments.includes(investmentId)) {
      portfolio.investments.push(investmentId);
    }

    await this.updatePortfolio(portfolioId);
    await this.saveInvestments();
    await this.savePortfolios();

    return portfolio;
  }

  /**
   * Atualiza portfólio
   */
  async updatePortfolio(portfolioId) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;

    const portfolioInvestments = this.investments.filter(i => 
      i.portfolioId === portfolioId && i.status === 'active'
    );

    // Calcula métricas do portfólio
    portfolio.totalValue = portfolioInvestments.reduce((sum, i) => sum + i.currentAmount, 0);
    portfolio.totalCost = portfolioInvestments.reduce((sum, i) => sum + i.initialAmount, 0);
    portfolio.totalReturn = portfolio.totalValue - portfolio.totalCost;
    portfolio.totalReturnPercentage = portfolio.totalCost > 0 ? 
      (portfolio.totalReturn / portfolio.totalCost) * 100 : 0;

    // Calcula retorno anualizado
    const oldestInvestment = portfolioInvestments.reduce((oldest, current) => 
      new Date(current.purchaseDate) < new Date(oldest.purchaseDate) ? current : oldest
    );
    
    if (oldestInvestment) {
      const daysHeld = Math.max(1, Math.floor((new Date() - new Date(oldestInvestment.purchaseDate)) / (1000 * 60 * 60 * 24)));
      const yearsHeld = daysHeld / 365;
      portfolio.annualizedReturn = yearsHeld > 0 ? 
        Math.pow(portfolio.totalValue / portfolio.totalCost, 1 / yearsHeld) - 1 : 0;
    }

    // Calcula volatilidade (simplificada)
    portfolio.volatility = this.calculatePortfolioVolatility(portfolioInvestments);

    // Calcula Sharpe Ratio
    portfolio.sharpeRatio = this.calculateSharpeRatio(portfolio.annualizedReturn, portfolio.volatility);

    // Calcula diversificação
    portfolio.diversification = this.calculateDiversification(portfolioInvestments);

    portfolio.lastUpdated = new Date().toISOString();
    await this.savePortfolios();
  }

  /**
   * Calcula volatilidade do portfólio
   */
  calculatePortfolioVolatility(investments) {
    if (investments.length === 0) return 0;

    // Simplificado: média ponderada da volatilidade individual
    const totalValue = investments.reduce((sum, i) => sum + i.currentAmount, 0);
    let weightedVolatility = 0;

    investments.forEach(investment => {
      const weight = investment.currentAmount / totalValue;
      const investmentVolatility = this.estimateInvestmentVolatility(investment);
      weightedVolatility += weight * investmentVolatility;
    });

    return weightedVolatility;
  }

  /**
   * Estima volatilidade do investimento
   */
  estimateInvestmentVolatility(investment) {
    // Estimativas baseadas no tipo de investimento
    const volatilityMap = {
      'stock': 0.25,
      'bond': 0.08,
      'fund': 0.15,
      'crypto': 0.60,
      'real_estate': 0.12,
      'other': 0.20
    };

    return volatilityMap[investment.type] || 0.20;
  }

  /**
   * Calcula Sharpe Ratio
   */
  calculateSharpeRatio(returnRate, volatility) {
    if (volatility === 0) return 0;
    return (returnRate - this.marketData.riskFreeRate) / volatility;
  }

  /**
   * Calcula diversificação
   */
  calculateDiversification(investments) {
    if (investments.length <= 1) return 0;

    const totalValue = investments.reduce((sum, i) => sum + i.currentAmount, 0);
    let herfindahlIndex = 0;

    investments.forEach(investment => {
      const weight = investment.currentAmount / totalValue;
      herfindahlIndex += weight * weight;
    });

    // Diversificação é o inverso do índice de Herfindahl
    return 1 - herfindahlIndex;
  }

  // ===== ANÁLISES E RELATÓRIOS =====

  /**
   * Obtém análise de portfólio
   */
  getPortfolioAnalysis(portfolioId) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return null;

    const investments = this.investments.filter(i => 
      i.portfolioId === portfolioId && i.status === 'active'
    );

    return {
      portfolio,
      investments,
      analysis: {
        totalValue: portfolio.totalValue,
        totalCost: portfolio.totalCost,
        totalReturn: portfolio.totalReturn,
        totalReturnPercentage: portfolio.totalReturnPercentage,
        annualizedReturn: portfolio.annualizedReturn,
        volatility: portfolio.volatility,
        sharpeRatio: portfolio.sharpeRatio,
        diversification: portfolio.diversification,
        riskLevel: this.getRiskLevel(portfolio.volatility),
        performance: this.getPerformanceRating(portfolio.sharpeRatio),
        recommendations: this.getPortfolioRecommendations(portfolio, investments)
      }
    };
  }

  /**
   * Obtém nível de risco
   */
  getRiskLevel(volatility) {
    if (volatility < 0.1) return 'Baixo';
    if (volatility < 0.2) return 'Médio';
    if (volatility < 0.3) return 'Alto';
    return 'Muito Alto';
  }

  /**
   * Obtém classificação de performance
   */
  getPerformanceRating(sharpeRatio) {
    if (sharpeRatio > 1.5) return 'Excelente';
    if (sharpeRatio > 1.0) return 'Boa';
    if (sharpeRatio > 0.5) return 'Regular';
    return 'Ruim';
  }

  /**
   * Obtém recomendações do portfólio
   */
  getPortfolioRecommendations(portfolio, investments) {
    const recommendations = [];

    // Recomendação de diversificação
    if (portfolio.diversification < 0.5) {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        title: 'Melhorar Diversificação',
        description: 'O portfólio está concentrado em poucos investimentos',
        action: 'Considerar adicionar investimentos de diferentes setores ou tipos'
      });
    }

    // Recomendação de rebalanceamento
    const lastRebalance = portfolio.lastRebalance ? new Date(portfolio.lastRebalance) : null;
    const monthsSinceRebalance = lastRebalance ? 
      (new Date() - lastRebalance) / (1000 * 60 * 60 * 24 * 30) : 12;

    if (monthsSinceRebalance > 3) {
      recommendations.push({
        type: 'rebalancing',
        priority: 'medium',
        title: 'Rebalancear Portfólio',
        description: 'O portfólio não foi rebalanceado há mais de 3 meses',
        action: 'Considerar rebalancear para manter a alocação desejada'
      });
    }

    // Recomendação de risco
    if (portfolio.volatility > portfolio.maxRisk) {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        title: 'Reduzir Risco',
        description: 'A volatilidade está acima do limite estabelecido',
        action: 'Considerar reduzir posições de maior risco'
      });
    }

    return recommendations;
  }

  /**
   * Obtém resumo patrimonial
   */
  getWealthSummary() {
    const totalInvestments = this.investments
      .filter(i => i.status === 'active')
      .reduce((sum, i) => sum + i.currentAmount, 0);

    const totalAssets = this.assets
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + a.currentValue, 0);

    const totalWealth = totalInvestments + totalAssets;

    return {
      totalWealth,
      totalInvestments,
      totalAssets,
      investmentPercentage: totalWealth > 0 ? (totalInvestments / totalWealth) * 100 : 0,
      assetPercentage: totalWealth > 0 ? (totalAssets / totalWealth) * 100 : 0,
      topInvestments: this.getTopInvestments(),
      topAssets: this.getTopAssets(),
      performance: this.getOverallPerformance()
    };
  }

  /**
   * Obtém principais investimentos
   */
  getTopInvestments() {
    return this.investments
      .filter(i => i.status === 'active')
      .sort((a, b) => b.currentAmount - a.currentAmount)
      .slice(0, 5);
  }

  /**
   * Obtém principais ativos
   */
  getTopAssets() {
    return this.assets
      .filter(a => a.status === 'active')
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);
  }

  /**
   * Obtém performance geral
   */
  getOverallPerformance() {
    const activeInvestments = this.investments.filter(i => i.status === 'active');
    
    if (activeInvestments.length === 0) {
      return { totalReturn: 0, totalReturnPercentage: 0, annualizedReturn: 0 };
    }

    const totalCost = activeInvestments.reduce((sum, i) => sum + i.initialAmount, 0);
    const totalValue = activeInvestments.reduce((sum, i) => sum + i.currentAmount, 0);
    const totalReturn = totalValue - totalCost;
    const totalReturnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      totalReturn,
      totalReturnPercentage,
      annualizedReturn: this.calculateOverallAnnualizedReturn(activeInvestments)
    };
  }

  /**
   * Calcula retorno anualizado geral
   */
  calculateOverallAnnualizedReturn(investments) {
    if (investments.length === 0) return 0;

    const oldestInvestment = investments.reduce((oldest, current) => 
      new Date(current.purchaseDate) < new Date(oldest.purchaseDate) ? current : oldest
    );

    const daysHeld = Math.max(1, Math.floor((new Date() - new Date(oldestInvestment.purchaseDate)) / (1000 * 60 * 60 * 24)));
    const yearsHeld = daysHeld / 365;

    const totalCost = investments.reduce((sum, i) => sum + i.initialAmount, 0);
    const totalValue = investments.reduce((sum, i) => sum + i.currentAmount, 0);

    return yearsHeld > 0 ? Math.pow(totalValue / totalCost, 1 / yearsHeld) - 1 : 0;
  }

  // ===== MONITORAMENTO DE MERCADO =====

  /**
   * Inicia monitoramento de mercado
   */
  startMarketMonitoring() {
    // Simula atualização de preços a cada 5 minutos
    setInterval(() => {
      this.updateMarketPrices();
    }, 5 * 60 * 1000);

    // Atualiza preços imediatamente
    this.updateMarketPrices();
  }

  /**
   * Atualiza preços de mercado
   */
  async updateMarketPrices() {
    // Em um sistema real, isso faria chamadas para APIs de mercado
    // Por enquanto, simula pequenas variações de preço
    
    this.investments.forEach(investment => {
      if (investment.status === 'active' && investment.type !== 'real_estate') {
        // Simula variação de preço de -2% a +2%
        const variation = (Math.random() - 0.5) * 0.04;
        const newPrice = investment.currentPrice * (1 + variation);
        
        this.updateInvestmentPrice(investment.id, newPrice);
      }
    });
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
    if (this.investments.length === 0 && this.assets.length === 0) {
      this.createSampleData();
    }
  }

  /**
   * Cria dados de exemplo
   */
  async createSampleData() {
    // Investimento de exemplo
    await this.addInvestment({
      name: 'Ações da Empresa ABC',
      type: 'stock',
      symbol: 'ABC3',
      initialAmount: 10000,
      quantity: 100,
      purchasePrice: 100,
      purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      riskLevel: 'medium',
      expectedReturn: 0.12
    });

    // Ativo de exemplo
    await this.addAsset({
      name: 'Veículo Corporativo',
      type: 'vehicle',
      category: 'Transporte',
      description: 'Carro para uso corporativo',
      purchaseValue: 50000,
      purchaseDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      depreciationMethod: 'straight_line',
      usefulLife: 5
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
const investmentManagement = new InvestmentManagementSystem();

// Exporta para uso global
window.investmentManagement = investmentManagement;
