/**
 * Sistema de Auditoria e Histórico Completo
 * Rastreamento de todas as operações, mudanças e acessos do sistema
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class AuditSystem {
  constructor() {
    this.auditLogs = this.loadAuditLogs();
    this.settings = this.loadSettings();
    this.retentionPolicies = this.loadRetentionPolicies();
    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    this.setupEventListeners();
    this.loadDefaultData();
    this.startCleanupProcess();
  }

  /**
   * Carrega logs de auditoria
   */
  loadAuditLogs() {
    try {
      if (typeof secureStorage !== 'undefined') {
        return secureStorage.getItem('audit_logs') || [];
      } else {
        const data = localStorage.getItem('audit_logs');
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      return [];
    }
  }

  /**
   * Carrega configurações
   */
  loadSettings() {
    return {
      enableAudit: true,
      logLevel: 'detailed', // minimal, standard, detailed, comprehensive
      retentionDays: 365,
      maxLogSize: 10000,
      enableRealTimeAlerts: true,
      sensitiveFields: ['password', 'token', 'secret', 'key'],
      excludedActions: ['view', 'list'],
      includeUserAgent: true,
      includeIPAddress: true,
      enableEncryption: true
    };
  }

  /**
   * Carrega políticas de retenção
   */
  loadRetentionPolicies() {
    return {
      financial_transactions: 2555, // 7 anos
      user_actions: 365, // 1 ano
      system_events: 90, // 3 meses
      login_attempts: 180, // 6 meses
      data_changes: 1095, // 3 anos
      audit_logs: 365 // 1 ano
    };
  }

  /**
   * Salva logs de auditoria
   */
  async saveAuditLogs() {
    try {
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('audit_logs', this.auditLogs);
      } else {
        localStorage.setItem('audit_logs', JSON.stringify(this.auditLogs));
      }
    } catch (error) {
      console.error('Erro ao salvar logs de auditoria:', error);
    }
  }

  // ===== REGISTRO DE EVENTOS =====

  /**
   * Registra evento de auditoria
   */
  async logEvent(eventData) {
    if (!this.settings.enableAudit) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      username: this.getCurrentUsername(),
      sessionId: this.getCurrentSessionId(),
      action: eventData.action,
      entity: eventData.entity,
      entityId: eventData.entityId,
      entityType: eventData.entityType,
      operation: eventData.operation, // create, read, update, delete, login, logout
      details: this.sanitizeDetails(eventData.details),
      oldValues: this.sanitizeDetails(eventData.oldValues),
      newValues: this.sanitizeDetails(eventData.newValues),
      ipAddress: this.getClientIP(),
      userAgent: this.settings.includeUserAgent ? navigator.userAgent : null,
      severity: eventData.severity || 'info', // low, info, warning, error, critical
      category: eventData.category || 'general', // financial, user, system, security
      source: eventData.source || 'web',
      tags: eventData.tags || [],
      metadata: eventData.metadata || {}
    };

    this.auditLogs.push(auditEntry);
    
    // Limita tamanho do log
    if (this.auditLogs.length > this.settings.maxLogSize) {
      this.auditLogs = this.auditLogs.slice(-this.settings.maxLogSize);
    }

    await this.saveAuditLogs();

    // Verifica alertas em tempo real
    if (this.settings.enableRealTimeAlerts) {
      await this.checkRealTimeAlerts(auditEntry);
    }

    return auditEntry;
  }

  /**
   * Registra login do usuário
   */
  async logLogin(userId, username, success, details = {}) {
    return await this.logEvent({
      action: 'user_login',
      entity: 'user',
      entityId: userId,
      entityType: 'user',
      operation: 'login',
      details: {
        success,
        loginMethod: details.loginMethod || 'password',
        ...details
      },
      severity: success ? 'info' : 'warning',
      category: 'security',
      tags: ['authentication', success ? 'success' : 'failure']
    });
  }

  /**
   * Registra logout do usuário
   */
  async logLogout(userId, username, details = {}) {
    return await this.logEvent({
      action: 'user_logout',
      entity: 'user',
      entityId: userId,
      entityType: 'user',
      operation: 'logout',
      details,
      severity: 'info',
      category: 'security',
      tags: ['authentication', 'logout']
    });
  }

  /**
   * Registra criação de entidade
   */
  async logCreate(entity, entityId, entityType, details = {}) {
    return await this.logEvent({
      action: 'entity_create',
      entity,
      entityId,
      entityType,
      operation: 'create',
      details,
      severity: 'info',
      category: 'data',
      tags: ['create', entityType]
    });
  }

  /**
   * Registra atualização de entidade
   */
  async logUpdate(entity, entityId, entityType, oldValues, newValues, details = {}) {
    return await this.logEvent({
      action: 'entity_update',
      entity,
      entityId,
      entityType,
      operation: 'update',
      oldValues,
      newValues,
      details,
      severity: 'info',
      category: 'data',
      tags: ['update', entityType]
    });
  }

  /**
   * Registra exclusão de entidade
   */
  async logDelete(entity, entityId, entityType, details = {}) {
    return await this.logEvent({
      action: 'entity_delete',
      entity,
      entityId,
      entityType,
      operation: 'delete',
      details,
      severity: 'warning',
      category: 'data',
      tags: ['delete', entityType]
    });
  }

  /**
   * Registra transação financeira
   */
  async logFinancialTransaction(transactionId, transactionType, amount, details = {}) {
    return await this.logEvent({
      action: 'financial_transaction',
      entity: 'transaction',
      entityId: transactionId,
      entityType: 'financial',
      operation: 'create',
      details: {
        transactionType,
        amount,
        ...details
      },
      severity: 'info',
      category: 'financial',
      tags: ['transaction', transactionType]
    });
  }

  /**
   * Registra acesso a dados sensíveis
   */
  async logSensitiveAccess(entity, entityId, entityType, details = {}) {
    return await this.logEvent({
      action: 'sensitive_access',
      entity,
      entityId,
      entityType,
      operation: 'read',
      details,
      severity: 'warning',
      category: 'security',
      tags: ['sensitive', 'access']
    });
  }

  /**
   * Registra erro do sistema
   */
  async logError(error, context = {}) {
    return await this.logEvent({
      action: 'system_error',
      entity: 'system',
      entityId: 'error',
      entityType: 'system',
      operation: 'error',
      details: {
        errorMessage: error.message,
        errorStack: error.stack,
        ...context
      },
      severity: 'error',
      category: 'system',
      tags: ['error', 'system']
    });
  }

  // ===== CONSULTAS E RELATÓRIOS =====

  /**
   * Busca logs por critérios
   */
  searchLogs(criteria = {}) {
    let filteredLogs = [...this.auditLogs];

    // Filtro por usuário
    if (criteria.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === criteria.userId);
    }

    // Filtro por ação
    if (criteria.action) {
      filteredLogs = filteredLogs.filter(log => log.action === criteria.action);
    }

    // Filtro por entidade
    if (criteria.entity) {
      filteredLogs = filteredLogs.filter(log => log.entity === criteria.entity);
    }

    // Filtro por operação
    if (criteria.operation) {
      filteredLogs = filteredLogs.filter(log => log.operation === criteria.operation);
    }

    // Filtro por severidade
    if (criteria.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === criteria.severity);
    }

    // Filtro por categoria
    if (criteria.category) {
      filteredLogs = filteredLogs.filter(log => log.category === criteria.category);
    }

    // Filtro por período
    if (criteria.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(criteria.startDate)
      );
    }

    if (criteria.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(criteria.endDate)
      );
    }

    // Filtro por tags
    if (criteria.tags && criteria.tags.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        criteria.tags.some(tag => log.tags.includes(tag))
      );
    }

    // Ordenação
    const sortBy = criteria.sortBy || 'timestamp';
    const sortOrder = criteria.sortOrder || 'desc';
    
    filteredLogs.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginação
    const page = criteria.page || 1;
    const limit = criteria.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      logs: filteredLogs.slice(startIndex, endIndex),
      total: filteredLogs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLogs.length / limit)
    };
  }

  /**
   * Gera relatório de auditoria
   */
  generateAuditReport(criteria = {}) {
    const searchResult = this.searchLogs(criteria);
    const logs = searchResult.logs;

    const report = {
      summary: this.generateSummary(logs),
      statistics: this.generateStatistics(logs),
      timeline: this.generateTimeline(logs),
      topUsers: this.getTopUsers(logs),
      topActions: this.getTopActions(logs),
      securityEvents: this.getSecurityEvents(logs),
      dataChanges: this.getDataChanges(logs),
      errors: this.getErrors(logs),
      generatedAt: new Date().toISOString(),
      criteria
    };

    return report;
  }

  /**
   * Gera resumo do relatório
   */
  generateSummary(logs) {
    const totalEvents = logs.length;
    const uniqueUsers = new Set(logs.map(log => log.userId)).size;
    const dateRange = this.getDateRange(logs);
    
    const severityCounts = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEvents,
      uniqueUsers,
      dateRange,
      severityCounts,
      categoryCounts
    };
  }

  /**
   * Gera estatísticas
   */
  generateStatistics(logs) {
    const hourlyDistribution = this.getHourlyDistribution(logs);
    const dailyDistribution = this.getDailyDistribution(logs);
    const operationDistribution = this.getOperationDistribution(logs);
    const entityDistribution = this.getEntityDistribution(logs);

    return {
      hourlyDistribution,
      dailyDistribution,
      operationDistribution,
      entityDistribution
    };
  }

  /**
   * Gera timeline de eventos
   */
  generateTimeline(logs) {
    return logs
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        entity: log.entity,
        userId: log.userId,
        severity: log.severity,
        details: log.details
      }));
  }

  // ===== ALERTAS E MONITORAMENTO =====

  /**
   * Verifica alertas em tempo real
   */
  async checkRealTimeAlerts(auditEntry) {
    const alerts = [];

    // Alerta para múltiplas tentativas de login falhadas
    if (auditEntry.action === 'user_login' && !auditEntry.details.success) {
      const recentFailedLogins = this.auditLogs
        .filter(log => 
          log.action === 'user_login' && 
          !log.details.success && 
          log.userId === auditEntry.userId &&
          new Date(log.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
        ).length;

      if (recentFailedLogins >= 5) {
        alerts.push({
          type: 'multiple_failed_logins',
          severity: 'critical',
          message: `Múltiplas tentativas de login falhadas para usuário ${auditEntry.userId}`,
          userId: auditEntry.userId,
          count: recentFailedLogins
        });
      }
    }

    // Alerta para acesso a dados sensíveis
    if (auditEntry.action === 'sensitive_access') {
      alerts.push({
        type: 'sensitive_data_access',
        severity: 'warning',
        message: `Acesso a dados sensíveis: ${auditEntry.entity}`,
        userId: auditEntry.userId,
        entity: auditEntry.entity
      });
    }

    // Alerta para operações de exclusão
    if (auditEntry.operation === 'delete') {
      alerts.push({
        type: 'data_deletion',
        severity: 'warning',
        message: `Exclusão de ${auditEntry.entityType}: ${auditEntry.entity}`,
        userId: auditEntry.userId,
        entity: auditEntry.entity
      });
    }

    // Processa alertas
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  /**
   * Processa alerta
   */
  async processAlert(alert) {
    // Salva alerta
    await this.saveAlert(alert);

    // Envia notificação se disponível
    if (typeof showWarning === 'function') {
      showWarning('Alerta de Auditoria', alert.message);
    }

    // Log do alerta
    await this.logEvent({
      action: 'audit_alert',
      entity: 'alert',
      entityId: alert.type,
      entityType: 'system',
      operation: 'create',
      details: alert,
      severity: alert.severity,
      category: 'security',
      tags: ['alert', alert.type]
    });
  }

  /**
   * Salva alerta
   */
  async saveAlert(alert) {
    // Implementação para salvar alertas
    console.log('Alerta de auditoria:', alert);
  }

  // ===== LIMPEZA E MANUTENÇÃO =====

  /**
   * Inicia processo de limpeza
   */
  startCleanupProcess() {
    // Executa limpeza diariamente
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // 24 horas

    // Executa limpeza imediatamente
    this.cleanupOldLogs();
  }

  /**
   * Remove logs antigos
   */
  cleanupOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.retentionDays);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );

    const removedCount = initialCount - this.auditLogs.length;
    
    if (removedCount > 0) {
      this.saveAuditLogs();
      console.log(`Limpeza de auditoria: ${removedCount} logs removidos`);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Gera ID único para auditoria
   */
  generateAuditId() {
    return 'AUDIT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Sanitiza dados sensíveis
   */
  sanitizeDetails(details) {
    if (!details || typeof details !== 'object') return details;

    const sanitized = { ...details };
    
    this.settings.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Obtém ID do usuário atual
   */
  getCurrentUserId() {
    if (typeof getCurrentUser === 'function') {
      const user = getCurrentUser();
      return user ? user.id : 'anonymous';
    }
    return 'anonymous';
  }

  /**
   * Obtém nome do usuário atual
   */
  getCurrentUsername() {
    if (typeof getCurrentUser === 'function') {
      const user = getCurrentUser();
      return user ? user.username : 'anonymous';
    }
    return 'anonymous';
  }

  /**
   * Obtém ID da sessão atual
   */
  getCurrentSessionId() {
    return sessionStorage.getItem('sessionId') || 'unknown';
  }

  /**
   * Obtém IP do cliente
   */
  getClientIP() {
    // Em um ambiente real, isso seria obtido do servidor
    return '127.0.0.1';
  }

  /**
   * Obtém intervalo de datas dos logs
   */
  getDateRange(logs) {
    if (logs.length === 0) return null;

    const timestamps = logs.map(log => new Date(log.timestamp));
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    return {
      start: minDate.toISOString(),
      end: maxDate.toISOString()
    };
  }

  /**
   * Obtém distribuição por hora
   */
  getHourlyDistribution(logs) {
    const distribution = Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      distribution[hour]++;
    });

    return distribution;
  }

  /**
   * Obtém distribuição por dia
   */
  getDailyDistribution(logs) {
    const distribution = {};
    
    logs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      distribution[date] = (distribution[date] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Obtém distribuição por operação
   */
  getOperationDistribution(logs) {
    const distribution = {};
    
    logs.forEach(log => {
      distribution[log.operation] = (distribution[log.operation] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Obtém distribuição por entidade
   */
  getEntityDistribution(logs) {
    const distribution = {};
    
    logs.forEach(log => {
      distribution[log.entity] = (distribution[log.entity] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Obtém principais usuários
   */
  getTopUsers(logs) {
    const userCounts = {};
    
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));
  }

  /**
   * Obtém principais ações
   */
  getTopActions(logs) {
    const actionCounts = {};
    
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  /**
   * Obtém eventos de segurança
   */
  getSecurityEvents(logs) {
    return logs.filter(log => log.category === 'security');
  }

  /**
   * Obtém mudanças de dados
   */
  getDataChanges(logs) {
    return logs.filter(log => 
      log.operation === 'create' || 
      log.operation === 'update' || 
      log.operation === 'delete'
    );
  }

  /**
   * Obtém erros
   */
  getErrors(logs) {
    return logs.filter(log => log.severity === 'error' || log.severity === 'critical');
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
}

// Instância global
const auditSystem = new AuditSystem();

// Exporta para uso global
window.auditSystem = auditSystem;
