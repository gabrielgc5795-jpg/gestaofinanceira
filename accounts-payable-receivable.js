/**
 * Sistema de Contas a Pagar e Receber
 * Gerencia vencimentos, pagamentos pendentes, recebimentos futuros e alertas
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class AccountsPayableReceivableSystem {
  constructor() {
    this.accountsPayable = this.loadAccountsPayable();
    this.accountsReceivable = this.loadAccountsReceivable();
    this.paymentMethods = this.loadPaymentMethods();
    this.suppliers = this.loadSuppliers();
    this.clients = this.loadClients();
    this.alerts = this.loadAlerts();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.startAlertMonitoring();
  }

  /**
   * Carrega contas a pagar
   */
  loadAccountsPayable() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('accounts_payable') || [];
      } else {
        const data = localStorage.getItem('accounts_payable');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      return [];
    }
  }

  /**
   * Carrega contas a receber
   */
  loadAccountsReceivable() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('accounts_receivable') || [];
      } else {
        const data = localStorage.getItem('accounts_receivable');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      return [];
    }
  }

  /**
   * Carrega métodos de pagamento
   */
  loadPaymentMethods() {
    return [
      { id: 1, name: 'Dinheiro', type: 'cash', icon: 'fas fa-money-bill' },
      { id: 2, name: 'PIX', type: 'pix', icon: 'fas fa-qrcode' },
      { id: 3, name: 'Cartão de Crédito', type: 'credit_card', icon: 'fas fa-credit-card' },
      { id: 4, name: 'Cartão de Débito', type: 'debit_card', icon: 'fas fa-credit-card' },
      { id: 5, name: 'Transferência Bancária', type: 'bank_transfer', icon: 'fas fa-university' },
      { id: 6, name: 'Boleto Bancário', type: 'bank_slip', icon: 'fas fa-file-invoice' },
      { id: 7, name: 'Cheque', type: 'check', icon: 'fas fa-file-invoice-dollar' }
    ];
  }

  /**
   * Carrega fornecedores
   */
  loadSuppliers() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('suppliers_data') || [];
      } else {
        const data = localStorage.getItem('suppliers_data');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      return [];
    }
  }

  /**
   * Carrega clientes
   */
  loadClients() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('clients_data') || [];
      } else {
        const data = localStorage.getItem('clients_data');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  }

  /**
   * Carrega alertas
   */
  loadAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('financial_alerts') || [];
      } else {
        const data = localStorage.getItem('financial_alerts');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      return [];
    }
  }

  /**
   * Salva contas a pagar
   */
  async saveAccountsPayable() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('accounts_payable', this.accountsPayable);
      } else {
        localStorage.setItem('accounts_payable', JSON.stringify(this.accountsPayable));
      }
    } catch (error) {
      console.error('Erro ao salvar contas a pagar:', error);
    }
  }

  /**
   * Salva contas a receber
   */
  async saveAccountsReceivable() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('accounts_receivable', this.accountsReceivable);
      } else {
        localStorage.setItem('accounts_receivable', JSON.stringify(this.accountsReceivable));
      }
    } catch (error) {
      console.error('Erro ao salvar contas a receber:', error);
    }
  }

  /**
   * Salva alertas
   */
  async saveAlerts() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('financial_alerts', this.alerts);
      } else {
        localStorage.setItem('financial_alerts', JSON.stringify(this.alerts));
      }
    } catch (error) {
      console.error('Erro ao salvar alertas:', error);
    }
  }

  // ===== CONTAS A PAGAR =====

  /**
   * Adiciona conta a pagar
   */
  async addAccountPayable(accountData) {
    const newAccount = {
      id: Math.max(...this.accountsPayable.map(a => a.id), 0) + 1,
      supplierId: accountData.supplierId,
      supplierName: accountData.supplierName,
      description: accountData.description,
      amount: parseFloat(accountData.amount),
      dueDate: accountData.dueDate,
      paymentMethod: accountData.paymentMethod,
      category: accountData.category,
      status: 'pending', // pending, paid, overdue, cancelled
      priority: accountData.priority || 'normal', // low, normal, high, urgent
      tags: accountData.tags || [],
      notes: accountData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema',
      paidAt: null,
      paidAmount: 0,
      paymentReference: '',
      installment: accountData.installment || 1,
      totalInstallments: accountData.totalInstallments || 1,
      parentAccountId: accountData.parentAccountId || null
    };

    this.accountsPayable.push(newAccount);
    await this.saveAccountsPayable();
    
    // Verifica alertas
    this.checkDueDateAlerts(newAccount);
    
    return newAccount;
  }

  /**
   * Adiciona conta a receber
   */
  async addAccountReceivable(accountData) {
    const newAccount = {
      id: Math.max(...this.accountsReceivable.map(a => a.id), 0) + 1,
      clientId: accountData.clientId,
      clientName: accountData.clientName,
      description: accountData.description,
      amount: parseFloat(accountData.amount),
      dueDate: accountData.dueDate,
      paymentMethod: accountData.paymentMethod,
      category: accountData.category,
      status: 'pending', // pending, received, overdue, cancelled
      priority: accountData.priority || 'normal',
      tags: accountData.tags || [],
      notes: accountData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()?.username || 'Sistema',
      receivedAt: null,
      receivedAmount: 0,
      paymentReference: '',
      installment: accountData.installment || 1,
      totalInstallments: accountData.totalInstallments || 1,
      parentAccountId: accountData.parentAccountId || null
    };

    this.accountsReceivable.push(newAccount);
    await this.saveAccountsReceivable();
    
    // Verifica alertas
    this.checkDueDateAlerts(newAccount);
    
    return newAccount;
  }

  /**
   * Marca conta a pagar como paga
   */
  async markAccountPayableAsPaid(accountId, paymentData) {
    const account = this.accountsPayable.find(a => a.id === accountId);
    if (!account) {
      throw new Error('Conta a pagar não encontrada');
    }

    account.status = 'paid';
    account.paidAt = new Date().toISOString();
    account.paidAmount = parseFloat(paymentData.amount);
    account.paymentReference = paymentData.reference || '';
    account.paymentMethod = paymentData.paymentMethod || account.paymentMethod;
    account.notes = account.notes + `\n[PAGO] ${paymentData.notes || ''}`;

    await this.saveAccountsPayable();
    
    // Cria movimentação no fluxo de caixa
    if (typeof financialControl !== 'undefined') {
      financialControl.addCashFlowEntry({
        date: account.paidAt.split('T')[0],
        type: 'expense',
        category: account.category,
        description: `Pagamento: ${account.description}`,
        amount: account.paidAmount,
        accountId: paymentData.accountId || 1
      });
    }

    return account;
  }

  /**
   * Marca conta a receber como recebida
   */
  async markAccountReceivableAsReceived(accountId, paymentData) {
    const account = this.accountsReceivable.find(a => a.id === accountId);
    if (!account) {
      throw new Error('Conta a receber não encontrada');
    }

    account.status = 'received';
    account.receivedAt = new Date().toISOString();
    account.receivedAmount = parseFloat(paymentData.amount);
    account.paymentReference = paymentData.reference || '';
    account.paymentMethod = paymentData.paymentMethod || account.paymentMethod;
    account.notes = account.notes + `\n[RECEBIDO] ${paymentData.notes || ''}`;

    await this.saveAccountsReceivable();
    
    // Cria movimentação no fluxo de caixa
    if (typeof financialControl !== 'undefined') {
      financialControl.addCashFlowEntry({
        date: account.receivedAt.split('T')[0],
        type: 'income',
        category: account.category,
        description: `Recebimento: ${account.description}`,
        amount: account.receivedAmount,
        accountId: paymentData.accountId || 1
      });
    }

    return account;
  }

  /**
   * Obtém contas a pagar por status
   */
  getAccountsPayableByStatus(status) {
    return this.accountsPayable.filter(account => account.status === status);
  }

  /**
   * Obtém contas a receber por status
   */
  getAccountsReceivableByStatus(status) {
    return this.accountsReceivable.filter(account => account.status === status);
  }

  /**
   * Obtém contas vencidas
   */
  getOverdueAccounts() {
    const today = new Date().toISOString().split('T')[0];
    
    const overduePayable = this.accountsPayable.filter(account => 
      account.status === 'pending' && account.dueDate < today
    );
    
    const overdueReceivable = this.accountsReceivable.filter(account => 
      account.status === 'pending' && account.dueDate < today
    );

    return {
      payable: overduePayable,
      receivable: overdueReceivable,
      total: overduePayable.length + overdueReceivable.length
    };
  }

  /**
   * Obtém análise de inadimplência
   */
  getDelinquencyAnalysis() {
    const overdue = this.getOverdueAccounts();
    const today = new Date();
    
    const analysis = {
      totalOverdue: overdue.total,
      totalOverdueAmount: 0,
      agingAnalysis: {
        '1-30': { count: 0, amount: 0 },
        '31-60': { count: 0, amount: 0 },
        '61-90': { count: 0, amount: 0 },
        '90+': { count: 0, amount: 0 }
      },
      riskLevels: {
        low: { count: 0, amount: 0 },
        medium: { count: 0, amount: 0 },
        high: { count: 0, amount: 0 },
        critical: { count: 0, amount: 0 }
      },
      recommendations: []
    };

    // Analisa contas a pagar vencidas
    overdue.payable.forEach(account => {
      const daysOverdue = Math.floor((today - new Date(account.dueDate)) / (1000 * 60 * 60 * 24));
      analysis.totalOverdueAmount += account.amount;
      
      // Análise por faixa etária
      if (daysOverdue <= 30) {
        analysis.agingAnalysis['1-30'].count++;
        analysis.agingAnalysis['1-30'].amount += account.amount;
      } else if (daysOverdue <= 60) {
        analysis.agingAnalysis['31-60'].count++;
        analysis.agingAnalysis['31-60'].amount += account.amount;
      } else if (daysOverdue <= 90) {
        analysis.agingAnalysis['61-90'].count++;
        analysis.agingAnalysis['61-90'].amount += account.amount;
      } else {
        analysis.agingAnalysis['90+'].count++;
        analysis.agingAnalysis['90+'].amount += account.amount;
      }

      // Análise de risco
      const riskLevel = this.calculateRiskLevel(account, daysOverdue);
      analysis.riskLevels[riskLevel].count++;
      analysis.riskLevels[riskLevel].amount += account.amount;
    });

    // Analisa contas a receber vencidas
    overdue.receivable.forEach(account => {
      const daysOverdue = Math.floor((today - new Date(account.dueDate)) / (1000 * 60 * 60 * 24));
      analysis.totalOverdueAmount += account.amount;
      
      // Análise por faixa etária
      if (daysOverdue <= 30) {
        analysis.agingAnalysis['1-30'].count++;
        analysis.agingAnalysis['1-30'].amount += account.amount;
      } else if (daysOverdue <= 60) {
        analysis.agingAnalysis['31-60'].count++;
        analysis.agingAnalysis['31-60'].amount += account.amount;
      } else if (daysOverdue <= 90) {
        analysis.agingAnalysis['61-90'].count++;
        analysis.agingAnalysis['61-90'].amount += account.amount;
      } else {
        analysis.agingAnalysis['90+'].count++;
        analysis.agingAnalysis['90+'].amount += account.amount;
      }

      // Análise de risco
      const riskLevel = this.calculateRiskLevel(account, daysOverdue);
      analysis.riskLevels[riskLevel].count++;
      analysis.riskLevels[riskLevel].amount += account.amount;
    });

    // Gera recomendações
    analysis.recommendations = this.generateDelinquencyRecommendations(analysis);

    return analysis;
  }

  /**
   * Calcula nível de risco da conta
   */
  calculateRiskLevel(account, daysOverdue) {
    const amount = account.amount;
    const priority = account.priority || 'normal';
    
    // Fatores de risco
    let riskScore = 0;
    
    // Dias em atraso
    if (daysOverdue > 90) riskScore += 4;
    else if (daysOverdue > 60) riskScore += 3;
    else if (daysOverdue > 30) riskScore += 2;
    else if (daysOverdue > 7) riskScore += 1;
    
    // Valor da conta
    if (amount > 10000) riskScore += 2;
    else if (amount > 5000) riskScore += 1;
    
    // Prioridade
    if (priority === 'urgent') riskScore += 2;
    else if (priority === 'high') riskScore += 1;
    
    // Categoria de risco
    if (riskScore >= 6) return 'critical';
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Gera recomendações para inadimplência
   */
  generateDelinquencyRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.agingAnalysis['90+'].count > 0) {
      recommendations.push({
        type: 'critical',
        title: 'Contas Críticas em Atraso',
        description: `${analysis.agingAnalysis['90+'].count} contas estão vencidas há mais de 90 dias`,
        action: 'Considerar ação judicial ou negociação especial',
        priority: 'high'
      });
    }
    
    if (analysis.riskLevels.critical.amount > 50000) {
      recommendations.push({
        type: 'financial',
        title: 'Exposição Financeira Crítica',
        description: `R$ ${analysis.riskLevels.critical.amount.toLocaleString('pt-BR')} em contas de alto risco`,
        action: 'Revisar políticas de crédito e cobrança',
        priority: 'high'
      });
    }
    
    if (analysis.totalOverdue > 10) {
      recommendations.push({
        type: 'process',
        title: 'Volume Alto de Inadimplência',
        description: `${analysis.totalOverdue} contas em atraso`,
        action: 'Implementar processo automatizado de cobrança',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Obtém contas próximas do vencimento
   */
  getUpcomingAccounts(days = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];
    
    const upcomingPayable = this.accountsPayable.filter(account => 
      account.status === 'pending' && 
      account.dueDate >= todayStr && 
      account.dueDate <= futureStr
    );
    
    const upcomingReceivable = this.accountsReceivable.filter(account => 
      account.status === 'pending' && 
      account.dueDate >= todayStr && 
      account.dueDate <= futureStr
    );

    return {
      payable: upcomingPayable,
      receivable: upcomingReceivable,
      total: upcomingPayable.length + upcomingReceivable.length
    };
  }

  // ===== ALERTAS E NOTIFICAÇÕES =====

  /**
   * Verifica alertas de vencimento
   */
  checkDueDateAlerts(account) {
    const today = new Date();
    const dueDate = new Date(account.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    // Alerta para vencimento em 3 dias
    if (daysUntilDue <= 3 && daysUntilDue >= 0) {
      this.createAlert({
        type: 'due_soon',
        title: 'Vencimento Próximo',
        message: `${account.description} vence em ${daysUntilDue} dias`,
        accountId: account.id,
        accountType: 'payable' in account ? 'payable' : 'receivable',
        priority: 'normal'
      });
    }

    // Alerta para conta vencida
    if (daysUntilDue < 0) {
      this.createAlert({
        type: 'overdue',
        title: 'Conta Vencida',
        message: `${account.description} está vencida há ${Math.abs(daysUntilDue)} dias`,
        accountId: account.id,
        accountType: 'payable' in account ? 'payable' : 'receivable',
        priority: 'high'
      });
    }
  }

  /**
   * Cria alerta
   */
  async createAlert(alertData) {
    const newAlert = {
      id: Math.max(...this.alerts.map(a => a.id), 0) + 1,
      type: alertData.type,
      title: alertData.title,
      message: alertData.message,
      accountId: alertData.accountId,
      accountType: alertData.accountType,
      priority: alertData.priority || 'normal',
      status: 'active', // active, dismissed, resolved
      createdAt: new Date().toISOString(),
      dismissedAt: null,
      resolvedAt: null
    };

    this.alerts.push(newAlert);
    await this.saveAlerts();

    // Mostra notificação se disponível
    if (typeof showWarning === 'function') {
      showWarning(alertData.title, alertData.message);
    }

    return newAlert;
  }

  /**
   * Inicia monitoramento de alertas
   */
  startAlertMonitoring() {
    // Verifica alertas a cada 5 minutos
    setInterval(() => {
      this.checkAllDueDates();
    }, 5 * 60 * 1000);

    // Verifica alertas imediatamente
    this.checkAllDueDates();
  }

  /**
   * Verifica todas as datas de vencimento
   */
  checkAllDueDates() {
    const allAccounts = [...this.accountsPayable, ...this.accountsReceivable];
    
    allAccounts.forEach(account => {
      if (account.status === 'pending') {
        this.checkDueDateAlerts(account);
      }
    });
  }

  // ===== RELATÓRIOS E ANÁLISES =====

  /**
   * Obtém resumo financeiro
   */
  getFinancialSummary() {
    const today = new Date().toISOString().split('T')[0];
    
    const pendingPayable = this.accountsPayable
      .filter(a => a.status === 'pending')
      .reduce((sum, a) => sum + a.amount, 0);
    
    const pendingReceivable = this.accountsReceivable
      .filter(a => a.status === 'pending')
      .reduce((sum, a) => sum + a.amount, 0);
    
    const overduePayable = this.accountsPayable
      .filter(a => a.status === 'pending' && a.dueDate < today)
      .reduce((sum, a) => sum + a.amount, 0);
    
    const overdueReceivable = this.accountsReceivable
      .filter(a => a.status === 'pending' && a.dueDate < today)
      .reduce((sum, a) => sum + a.amount, 0);

    return {
      pendingPayable: {
        count: this.accountsPayable.filter(a => a.status === 'pending').length,
        amount: pendingPayable
      },
      pendingReceivable: {
        count: this.accountsReceivable.filter(a => a.status === 'pending').length,
        amount: pendingReceivable
      },
      overduePayable: {
        count: this.accountsPayable.filter(a => a.status === 'pending' && a.dueDate < today).length,
        amount: overduePayable
      },
      overdueReceivable: {
        count: this.accountsReceivable.filter(a => a.status === 'pending' && a.dueDate < today).length,
        amount: overdueReceivable
      },
      netPosition: pendingReceivable - pendingPayable,
      totalOverdue: overdueReceivable - overduePayable
    };
  }

  /**
   * Obtém fluxo de caixa previsto
   */
  getProjectedCashFlow(days = 30) {
    const today = new Date();
    const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    const todayStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const projectedPayable = this.accountsPayable
      .filter(a => a.status === 'pending' && a.dueDate >= todayStr && a.dueDate <= endStr)
      .reduce((acc, a) => {
        const date = a.dueDate;
        if (!acc[date]) acc[date] = 0;
        acc[date] -= a.amount;
        return acc;
      }, {});

    const projectedReceivable = this.accountsReceivable
      .filter(a => a.status === 'pending' && a.dueDate >= todayStr && a.dueDate <= endStr)
      .reduce((acc, a) => {
        const date = a.dueDate;
        if (!acc[date]) acc[date] = 0;
        acc[date] += a.amount;
        return acc;
      }, {});

    // Combina projeções
    const allDates = new Set([
      ...Object.keys(projectedPayable),
      ...Object.keys(projectedReceivable)
    ]);

    const projection = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        payable: projectedPayable[date] || 0,
        receivable: projectedReceivable[date] || 0,
        net: (projectedReceivable[date] || 0) + (projectedPayable[date] || 0)
      }));

    return projection;
  }

  /**
   * Obtém estatísticas por categoria
   */
  getCategoryStats() {
    const payableStats = this.accountsPayable
      .filter(a => a.status === 'pending')
      .reduce((acc, a) => {
        if (!acc[a.category]) {
          acc[a.category] = { count: 0, amount: 0 };
        }
        acc[a.category].count++;
        acc[a.category].amount += a.amount;
        return acc;
      }, {});

    const receivableStats = this.accountsReceivable
      .filter(a => a.status === 'pending')
      .reduce((acc, a) => {
        if (!acc[a.category]) {
          acc[a.category] = { count: 0, amount: 0 };
        }
        acc[a.category].count++;
        acc[a.category].amount += a.amount;
        return acc;
      }, {});

    return {
      payable: payableStats,
      receivable: receivableStats
    };
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
    if (this.accountsPayable.length === 0 && this.accountsReceivable.length === 0) {
      // Adiciona alguns dados de exemplo
      this.addSampleData();
    }
  }

  /**
   * Adiciona dados de exemplo
   */
  async addSampleData() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
    const nextMonth = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Contas a pagar de exemplo
    await this.addAccountPayable({
      supplierId: 1,
      supplierName: 'Fornecedor Exemplo',
      description: 'Fornecimento de materiais',
      amount: 1500.00,
      dueDate: nextWeek.toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      category: 'Fornecimentos',
      priority: 'normal'
    });

    // Contas a receber de exemplo
    await this.addAccountReceivable({
      clientId: 1,
      clientName: 'Cliente Exemplo',
      description: 'Prestação de serviços',
      amount: 2500.00,
      dueDate: nextMonth.toISOString().split('T')[0],
      paymentMethod: 'pix',
      category: 'Serviços',
      priority: 'normal'
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
const accountsPayableReceivable = new AccountsPayableReceivableSystem();

// Exporta para uso global
window.accountsPayableReceivable = accountsPayableReceivable;
