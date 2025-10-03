/**
 * Sistema de Controle Financeiro Completo
 * Gerencia contas, fluxo de caixa, boletos e controle financeiro
 */

class FinancialControlSystem {
  constructor() {
    this.accounts = this.loadAccounts();
    this.cashFlow = this.loadCashFlow();
    this.bills = this.loadBills();
    this.bankTransactions = this.loadBankTransactions();
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
   * Carrega contas do localStorage
   */
  loadAccounts() {
    const savedAccounts = localStorage.getItem('financial_accounts');
    return savedAccounts ? JSON.parse(savedAccounts) : [];
  }

  /**
   * Salva contas no localStorage
   */
  saveAccounts() {
    localStorage.setItem('financial_accounts', JSON.stringify(this.accounts));
  }

  /**
   * Carrega fluxo de caixa do localStorage
   */
  loadCashFlow() {
    const savedCashFlow = localStorage.getItem('financial_cashflow');
    return savedCashFlow ? JSON.parse(savedCashFlow) : [];
  }

  /**
   * Salva fluxo de caixa no localStorage
   */
  saveCashFlow() {
    localStorage.setItem('financial_cashflow', JSON.stringify(this.cashFlow));
  }

  /**
   * Carrega boletos do localStorage
   */
  loadBills() {
    const savedBills = localStorage.getItem('financial_bills');
    return savedBills ? JSON.parse(savedBills) : [];
  }

  /**
   * Salva boletos no localStorage
   */
  saveBills() {
    localStorage.setItem('financial_bills', JSON.stringify(this.bills));
  }

  /**
   * Carrega transações bancárias do localStorage
   */
  loadBankTransactions() {
    const savedTransactions = localStorage.getItem('financial_bank_transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  }

  /**
   * Salva transações bancárias no localStorage
   */
  saveBankTransactions() {
    localStorage.setItem('financial_bank_transactions', JSON.stringify(this.bankTransactions));
  }

  /**
   * Carrega dados padrão se não existirem
   */
  loadDefaultData() {
    if (this.accounts.length === 0) {
      this.accounts = [
        {
          id: 1,
          name: 'Conta Corrente Principal',
          type: 'current',
          bank: 'Banco do Brasil',
          agency: '1234',
          account: '12345-6',
          balance: 15000.00,
          currency: 'BRL',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Poupança',
          type: 'savings',
          bank: 'Caixa Econômica',
          agency: '5678',
          account: '98765-4',
          balance: 25000.00,
          currency: 'BRL',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Caixa',
          type: 'cash',
          bank: null,
          agency: null,
          account: null,
          balance: 5000.00,
          currency: 'BRL',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      this.saveAccounts();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando as páginas forem carregadas
  }

  // ===== GESTÃO DE CONTAS =====

  /**
   * Obtém todas as contas
   */
  getAccounts() {
    return this.accounts.filter(account => account.active);
  }

  /**
   * Obtém conta por ID
   */
  getAccountById(id) {
    return this.accounts.find(account => account.id === id);
  }

  /**
   * Cria nova conta
   */
  createAccount(accountData) {
    const newAccount = {
      id: Math.max(...this.accounts.map(a => a.id), 0) + 1,
      name: accountData.name,
      type: accountData.type,
      bank: accountData.bank || null,
      agency: accountData.agency || null,
      account: accountData.account || null,
      balance: parseFloat(accountData.balance) || 0,
      currency: accountData.currency || 'BRL',
      active: true,
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    this.saveAccounts();

    return newAccount;
  }

  /**
   * Atualiza conta existente
   */
  updateAccount(id, accountData) {
    const accountIndex = this.accounts.findIndex(account => account.id === id);
    if (accountIndex === -1) {
      throw new Error('Conta não encontrada');
    }

    const updatedAccount = {
      ...this.accounts[accountIndex],
      ...accountData,
      id: this.accounts[accountIndex].id,
      createdAt: this.accounts[accountIndex].createdAt
    };

    this.accounts[accountIndex] = updatedAccount;
    this.saveAccounts();

    return updatedAccount;
  }

  /**
   * Remove conta (soft delete)
   */
  removeAccount(id) {
    const account = this.getAccountById(id);
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    account.active = false;
    this.saveAccounts();

    return account;
  }

  /**
   * Atualiza saldo da conta
   */
  updateAccountBalance(id, newBalance) {
    const account = this.getAccountById(id);
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    account.balance = parseFloat(newBalance);
    this.saveAccounts();

    return account;
  }

  // ===== FLUXO DE CAIXA =====

  /**
   * Obtém fluxo de caixa por período
   */
  getCashFlow(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.cashFlow.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Adiciona entrada ao fluxo de caixa
   */
  addCashFlowEntry(entryData) {
    const newEntry = {
      id: Math.max(...this.cashFlow.map(e => e.id), 0) + 1,
      date: entryData.date,
      type: entryData.type, // 'income' ou 'expense'
      category: entryData.category,
      description: entryData.description,
      amount: parseFloat(entryData.amount),
      accountId: entryData.accountId,
      tags: entryData.tags || [],
      createdAt: new Date().toISOString()
    };

    this.cashFlow.push(newEntry);
    this.saveCashFlow();

    // Atualiza saldo da conta
    const account = this.getAccountById(entryData.accountId);
    if (account) {
      if (entryData.type === 'income') {
        account.balance += parseFloat(entryData.amount);
      } else {
        account.balance -= parseFloat(entryData.amount);
      }
      this.saveAccounts();
    }

    return newEntry;
  }

  /**
   * Obtém projeção de fluxo de caixa
   */
  getCashFlowProjection(days = 30) {
    const today = new Date();
    const projection = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayEntries = this.cashFlow.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === date.toDateString();
      });

      const totalIncome = dayEntries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);

      const totalExpense = dayEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);

      projection.push({
        date: date.toISOString().split('T')[0],
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
        entries: dayEntries.length
      });
    }

    return projection;
  }

  // ===== GESTÃO DE BOLETOS =====

  /**
   * Obtém todos os boletos
   */
  getBills() {
    return this.bills;
  }

  /**
   * Obtém boleto por ID
   */
  getBillById(id) {
    return this.bills.find(bill => bill.id === id);
  }

  /**
   * Cria novo boleto
   */
  createBill(billData) {
    const newBill = {
      id: Math.max(...this.bills.map(b => b.id), 0) + 1,
      title: billData.title,
      description: billData.description,
      amount: parseFloat(billData.amount),
      dueDate: billData.dueDate,
      status: 'pending', // pending, paid, overdue, cancelled
      type: billData.type, // 'payable' ou 'receivable'
      payer: billData.payer,
      beneficiary: billData.beneficiary,
      barcode: billData.barcode || this.generateBarcode(),
      accountId: billData.accountId,
      category: billData.category,
      tags: billData.tags || [],
      createdAt: new Date().toISOString()
    };

    this.bills.push(newBill);
    this.saveBills();

    return newBill;
  }

  /**
   * Atualiza status do boleto
   */
  updateBillStatus(id, status) {
    const bill = this.getBillById(id);
    if (!bill) {
      throw new Error('Boleto não encontrado');
    }

    bill.status = status;
    bill.updatedAt = new Date().toISOString();

    // Se foi pago, adiciona ao fluxo de caixa
    if (status === 'paid') {
      this.addCashFlowEntry({
        date: new Date().toISOString().split('T')[0],
        type: bill.type === 'payable' ? 'expense' : 'income',
        category: bill.category,
        description: `Pagamento: ${bill.title}`,
        amount: bill.amount,
        accountId: bill.accountId,
        tags: ['boleto', ...bill.tags]
      });
    }

    this.saveBills();

    return bill;
  }

  /**
   * Gera código de barras fictício
   */
  generateBarcode() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Obtém boletos vencidos
   */
  getOverdueBills() {
    const today = new Date().toISOString().split('T')[0];
    return this.bills.filter(bill => 
      bill.dueDate < today && bill.status === 'pending'
    );
  }

  // ===== TRANSAÇÕES BANCÁRIAS =====

  /**
   * Obtém transações bancárias por conta
   */
  getBankTransactions(accountId, startDate, endDate) {
    let transactions = this.bankTransactions.filter(t => t.accountId === accountId);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Adiciona transação bancária
   */
  addBankTransaction(transactionData) {
    const newTransaction = {
      id: Math.max(...this.bankTransactions.map(t => t.id), 0) + 1,
      accountId: transactionData.accountId,
      date: transactionData.date,
      type: transactionData.type, // 'credit' ou 'debit'
      amount: parseFloat(transactionData.amount),
      description: transactionData.description,
      reference: transactionData.reference,
      category: transactionData.category,
      balance: transactionData.balance,
      createdAt: new Date().toISOString()
    };

    this.bankTransactions.push(newTransaction);
    this.saveBankTransactions();

    // Atualiza saldo da conta
    const account = this.getAccountById(transactionData.accountId);
    if (account) {
      account.balance = parseFloat(transactionData.balance);
      this.saveAccounts();
    }

    return newTransaction;
  }

  // ===== RELATÓRIOS FINANCEIROS =====

  /**
   * Obtém resumo financeiro
   */
  getFinancialSummary() {
    const totalAccountsBalance = this.accounts
      .filter(account => account.active)
      .reduce((sum, account) => sum + account.balance, 0);

    const pendingBills = this.bills.filter(bill => bill.status === 'pending');
    const totalPendingAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);

    const overdueBills = this.getOverdueBills();
    const totalOverdueAmount = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);

    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);

    const monthlyCashFlow = this.getCashFlow(
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    );

    const monthlyIncome = monthlyCashFlow
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const monthlyExpense = monthlyCashFlow
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalBalance: totalAccountsBalance,
      pendingBills: {
        count: pendingBills.length,
        amount: totalPendingAmount
      },
      overdueBills: {
        count: overdueBills.length,
        amount: totalOverdueAmount
      },
      monthlyCashFlow: {
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyIncome - monthlyExpense
      },
      accounts: this.accounts.filter(account => account.active).length
    };
  }

  /**
   * Obtém categorias mais utilizadas
   */
  getTopCategories(limit = 10) {
    const categoryCount = {};
    
    this.cashFlow.forEach(entry => {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Renderiza dashboard financeiro
   */
  renderFinancialDashboard() {
    const container = document.getElementById('financial-dashboard-container');
    if (!container) return;

    const summary = this.getFinancialSummary();
    const topCategories = this.getTopCategories();
    const overdueBills = this.getOverdueBills();
    const accounts = this.getAccounts();

    container.innerHTML = `
      <div class="financial-dashboard">
        <div class="page-header">
          <h2>Controle Financeiro</h2>
          <div class="header-actions">
            <button class="primary-btn" onclick="financialControl.openAccountModal()">
              <i class="fas fa-plus"></i>
              Nova Conta
            </button>
            <button class="primary-btn" onclick="financialControl.openCashFlowModal()">
              <i class="fas fa-exchange-alt"></i>
              Movimentação
            </button>
            <button class="primary-btn" onclick="financialControl.openBillModal()">
              <i class="fas fa-file-invoice"></i>
              Novo Boleto
            </button>
          </div>
        </div>

        <!-- Resumo Financeiro -->
        <div class="financial-summary">
          <div class="summary-card total-balance">
            <div class="card-icon">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="card-content">
              <h3>Saldo Total</h3>
              <p class="amount">R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div class="summary-card monthly-income">
            <div class="card-icon">
              <i class="fas fa-arrow-up"></i>
            </div>
            <div class="card-content">
              <h3>Receitas do Mês</h3>
              <p class="amount income">R$ ${summary.monthlyCashFlow.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div class="summary-card monthly-expense">
            <div class="card-icon">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="card-content">
              <h3>Despesas do Mês</h3>
              <p class="amount expense">R$ ${summary.monthlyCashFlow.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div class="summary-card pending-bills">
            <div class="card-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="card-content">
              <h3>Boletos Pendentes</h3>
              <p class="amount">${summary.pendingBills.count} - R$ ${summary.pendingBills.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        ${overdueBills.length > 0 ? `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>${overdueBills.length} boleto(s) vencido(s)</strong>
            <p>Total em atraso: R$ ${summary.overdueBills.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        ` : ''}

        <!-- Contas -->
        <div class="accounts-section">
          <h3>Contas</h3>
          <div class="accounts-grid">
            ${accounts.map(account => `
              <div class="account-card">
                <div class="account-header">
                  <h4>${account.name}</h4>
                  <span class="account-type">${this.getAccountTypeDisplayName(account.type)}</span>
                </div>
                <div class="account-details">
                  ${account.bank ? `<p><strong>Banco:</strong> ${account.bank}</p>` : ''}
                  ${account.agency ? `<p><strong>Agência:</strong> ${account.agency}</p>` : ''}
                  ${account.account ? `<p><strong>Conta:</strong> ${account.account}</p>` : ''}
                </div>
                <div class="account-balance">
                  <span class="balance-label">Saldo</span>
                  <span class="balance-value">R$ ${account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="account-actions">
                  <button class="btn-icon" onclick="financialControl.openAccountModal(${account.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon" onclick="financialControl.viewAccountTransactions(${account.id})" title="Ver Transações">
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Categorias Mais Utilizadas -->
        <div class="categories-section">
          <h3>Categorias Mais Utilizadas</h3>
          <div class="categories-list">
            ${topCategories.map(category => `
              <div class="category-item">
                <span class="category-name">${category.category}</span>
                <span class="category-count">${category.count} transações</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Obtém nome de exibição do tipo de conta
   */
  getAccountTypeDisplayName(type) {
    const names = {
      current: 'Conta Corrente',
      savings: 'Poupança',
      cash: 'Caixa',
      investment: 'Investimento',
      credit: 'Cartão de Crédito'
    };
    return names[type] || type;
  }

  /**
   * Abre modal para criar/editar conta
   */
  openAccountModal(accountId = null) {
    const account = accountId ? this.getAccountById(accountId) : null;
    const modal = this.createAccountModal(account);
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de conta
   */
  createAccountModal(account = null) {
    const isEdit = !!account;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Conta' : 'Nova Conta'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="account-form">
          <div class="form-group">
            <label for="account-name">Nome da Conta *</label>
            <input type="text" id="account-name" name="name" value="${account?.name || ''}" required>
          </div>
          <div class="form-group">
            <label for="account-type">Tipo *</label>
            <select id="account-type" name="type" required>
              <option value="current" ${account?.type === 'current' ? 'selected' : ''}>Conta Corrente</option>
              <option value="savings" ${account?.type === 'savings' ? 'selected' : ''}>Poupança</option>
              <option value="cash" ${account?.type === 'cash' ? 'selected' : ''}>Caixa</option>
              <option value="investment" ${account?.type === 'investment' ? 'selected' : ''}>Investimento</option>
              <option value="credit" ${account?.type === 'credit' ? 'selected' : ''}>Cartão de Crédito</option>
            </select>
          </div>
          <div class="form-group" id="bank-fields">
            <label for="account-bank">Banco</label>
            <input type="text" id="account-bank" name="bank" value="${account?.bank || ''}">
          </div>
          <div class="form-group" id="agency-field">
            <label for="account-agency">Agência</label>
            <input type="text" id="account-agency" name="agency" value="${account?.agency || ''}">
          </div>
          <div class="form-group" id="account-number-field">
            <label for="account-number">Número da Conta</label>
            <input type="text" id="account-number" name="account" value="${account?.account || ''}">
          </div>
          <div class="form-group">
            <label for="account-balance">Saldo Inicial</label>
            <input type="number" id="account-balance" name="balance" step="0.01" value="${account?.balance || '0.00'}">
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

    // Mostra/esconde campos bancários baseado no tipo
    const typeSelect = modal.querySelector('#account-type');
    const bankFields = modal.querySelector('#bank-fields');
    const agencyField = modal.querySelector('#agency-field');
    const accountNumberField = modal.querySelector('#account-number-field');

    const toggleBankFields = () => {
      const type = typeSelect.value;
      const isCash = type === 'cash';
      
      bankFields.style.display = isCash ? 'none' : 'block';
      agencyField.style.display = isCash ? 'none' : 'block';
      accountNumberField.style.display = isCash ? 'none' : 'block';
    };

    typeSelect.addEventListener('change', toggleBankFields);
    toggleBankFields();

    // Configura evento de submit
    const form = modal.querySelector('#account-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const accountData = Object.fromEntries(formData);

      try {
        if (isEdit) {
          this.updateAccount(account.id, accountData);
          showSuccess('Conta atualizada com sucesso!');
        } else {
          this.createAccount(accountData);
          showSuccess('Conta criada com sucesso!');
        }
        modal.remove();
        this.renderFinancialDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Abre modal para movimentação de caixa
   */
  openCashFlowModal() {
    const modal = this.createCashFlowModal();
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de movimentação de caixa
   */
  createCashFlowModal() {
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
        <form class="modal-form" id="cashflow-form">
          <div class="form-group">
            <label for="cashflow-type">Tipo *</label>
            <select id="cashflow-type" name="type" required>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div class="form-group">
            <label for="cashflow-account">Conta *</label>
            <select id="cashflow-account" name="accountId" required>
              ${this.getAccounts().map(account => `
                <option value="${account.id}">${account.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="cashflow-amount">Valor *</label>
            <input type="number" id="cashflow-amount" name="amount" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="cashflow-category">Categoria *</label>
            <input type="text" id="cashflow-category" name="category" required>
          </div>
          <div class="form-group">
            <label for="cashflow-description">Descrição *</label>
            <input type="text" id="cashflow-description" name="description" required>
          </div>
          <div class="form-group">
            <label for="cashflow-date">Data *</label>
            <input type="date" id="cashflow-date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#cashflow-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const entryData = Object.fromEntries(formData);

      try {
        this.addCashFlowEntry(entryData);
        showSuccess('Movimentação adicionada com sucesso!');
        modal.remove();
        this.renderFinancialDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Abre modal para criar boleto
   */
  openBillModal() {
    const modal = this.createBillModal();
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de boleto
   */
  createBillModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Novo Boleto</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="bill-form">
          <div class="form-group">
            <label for="bill-type">Tipo *</label>
            <select id="bill-type" name="type" required>
              <option value="payable">Conta a Pagar</option>
              <option value="receivable">Conta a Receber</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bill-title">Título *</label>
            <input type="text" id="bill-title" name="title" required>
          </div>
          <div class="form-group">
            <label for="bill-description">Descrição</label>
            <input type="text" id="bill-description" name="description">
          </div>
          <div class="form-group">
            <label for="bill-amount">Valor *</label>
            <input type="number" id="bill-amount" name="amount" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="bill-due-date">Data de Vencimento *</label>
            <input type="date" id="bill-due-date" name="dueDate" required>
          </div>
          <div class="form-group">
            <label for="bill-account">Conta *</label>
            <select id="bill-account" name="accountId" required>
              ${this.getAccounts().map(account => `
                <option value="${account.id}">${account.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="bill-category">Categoria</label>
            <input type="text" id="bill-category" name="category">
          </div>
          <div class="form-group">
            <label for="bill-payer">Pagador/Recebedor</label>
            <input type="text" id="bill-payer" name="payer">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="primary-btn">
              Criar Boleto
            </button>
          </div>
        </form>
      </div>
    `;

    // Configura evento de submit
    const form = modal.querySelector('#bill-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const billData = Object.fromEntries(formData);

      try {
        this.createBill(billData);
        showSuccess('Boleto criado com sucesso!');
        modal.remove();
        this.renderFinancialDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Visualiza transações da conta
   */
  viewAccountTransactions(accountId) {
    const account = this.getAccountById(accountId);
    if (!account) return;

    // Implementar visualização de transações
    showInfo('Transações', `Visualizando transações da conta: ${account.name}`);
  }
}

// Instância global
const financialControl = new FinancialControlSystem();

// Exporta para uso global
window.financialControl = financialControl;
