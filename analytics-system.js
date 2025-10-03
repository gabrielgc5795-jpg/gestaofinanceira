/**
 * Sistema de Logs e Analytics Básico
 * Fornece rastreamento de ações do usuário e métricas de uso
 */

class AnalyticsSystem {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.maxEvents = 1000; // Limite de eventos na memória
    this.init();
  }

  /**
   * Inicializa o sistema de analytics
   */
  init() {
    this.setupEventListeners();
    this.trackPageView();
    this.setupPeriodicSave();
    this.loadStoredEvents();
  }

  /**
   * Gera ID único para a sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configura listeners para eventos automáticos
   */
  setupEventListeners() {
    // Rastreia cliques em botões importantes
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, .tab-button, .primary-btn, .secondary-btn');
      if (target) {
        this.trackEvent('button_click', {
          buttonText: target.textContent?.trim(),
          buttonClass: target.className,
          page: this.getCurrentPage()
        });
      }
    });

    // Rastreia submissões de formulários
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          formId: form.id,
          formClass: form.className,
          page: this.getCurrentPage()
        });
      }
    });

    // Rastreia mudanças de tema
    const originalToggleTheme = window.toggleTheme;
    if (originalToggleTheme) {
      window.toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.trackEvent('theme_change', {
          from: currentTheme,
          to: newTheme
        });
        
        originalToggleTheme();
      };
    }

    // Rastreia tempo na página
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_exit', {
        timeOnPage: Date.now() - this.startTime,
        page: this.getCurrentPage()
      });
      this.saveEvents();
    });

    // Rastreia erros JavaScript
    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        page: this.getCurrentPage()
      });
    });
  }

  /**
   * Obtém a página atual
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
  }

  /**
   * Rastreia visualização de página
   */
  trackPageView() {
    this.trackEvent('page_view', {
      page: this.getCurrentPage(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  /**
   * Rastreia um evento personalizado
   * @param {string} eventName - Nome do evento
   * @param {Object} properties - Propriedades do evento
   * @param {string} category - Categoria do evento (opcional)
   */
  trackEvent(eventName, properties = {}, category = 'general') {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      category,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: this.getCurrentPage(),
      url: window.location.href
    };

    this.events.push(event);

    // Limita o número de eventos na memória
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log para desenvolvimento
    if (this.isDebugMode()) {
      console.log('📊 Analytics Event:', event);
    }
  }

  /**
   * Gera ID único para evento
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se está em modo debug
   */
  isDebugMode() {
    return localStorage.getItem('analytics_debug') === 'true' || 
           window.location.search.includes('debug=true');
  }

  /**
   * Configura salvamento periódico
   */
  setupPeriodicSave() {
    // Salva eventos a cada 30 segundos
    setInterval(() => {
      this.saveEvents();
    }, 30000);
  }

  /**
   * Salva eventos no localStorage
   */
  saveEvents() {
    try {
      const data = {
        sessionId: this.sessionId,
        events: this.events,
        lastSaved: Date.now()
      };
      
      localStorage.setItem('analytics_events', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar eventos de analytics:', error);
    }
  }

  /**
   * Carrega eventos salvos
   */
  loadStoredEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Carrega eventos da sessão atual ou recentes
        const recentEvents = data.events.filter(event => 
          event.sessionId === this.sessionId || 
          (Date.now() - event.timestamp) < 24 * 60 * 60 * 1000 // Últimas 24h
        );
        
        this.events = [...recentEvents, ...this.events];
      }
    } catch (error) {
      console.warn('Erro ao carregar eventos salvos:', error);
    }
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp > last24h);
    const weekEvents = this.events.filter(e => e.timestamp > last7d);

    // Páginas mais visitadas
    const pageViews = weekEvents
      .filter(e => e.name === 'page_view')
      .reduce((acc, e) => {
        acc[e.properties.page] = (acc[e.properties.page] || 0) + 1;
        return acc;
      }, {});

    // Ações mais comuns
    const actions = recentEvents
      .filter(e => e.name !== 'page_view')
      .reduce((acc, e) => {
        acc[e.name] = (acc[e.name] || 0) + 1;
        return acc;
      }, {});

    // Tempo médio por sessão
    const sessions = [...new Set(weekEvents.map(e => e.sessionId))];
    const sessionTimes = sessions.map(sessionId => {
      const sessionEvents = weekEvents.filter(e => e.sessionId === sessionId);
      if (sessionEvents.length < 2) return 0;
      
      const start = Math.min(...sessionEvents.map(e => e.timestamp));
      const end = Math.max(...sessionEvents.map(e => e.timestamp));
      return end - start;
    });

    const avgSessionTime = sessionTimes.length > 0 
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
      : 0;

    return {
      totalEvents: this.events.length,
      eventsLast24h: recentEvents.length,
      eventsLast7d: weekEvents.length,
      uniqueSessions: sessions.length,
      avgSessionTime: Math.round(avgSessionTime / 1000), // em segundos
      topPages: Object.entries(pageViews)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topActions: Object.entries(actions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      currentSession: {
        id: this.sessionId,
        duration: Math.round((now - this.startTime) / 1000),
        events: this.events.filter(e => e.sessionId === this.sessionId).length
      }
    };
  }

  /**
   * Obtém eventos por categoria
   */
  getEventsByCategory(category, limit = 50) {
    return this.events
      .filter(e => e.category === category)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Obtém eventos por período
   */
  getEventsByTimeRange(startTime, endTime) {
    return this.events.filter(e => 
      e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Exporta dados de analytics
   */
  exportData(format = 'json') {
    const data = {
      sessionId: this.sessionId,
      exportTime: Date.now(),
      stats: this.getUsageStats(),
      events: this.events
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(this.events);
    }

    return data;
  }

  /**
   * Converte eventos para CSV
   */
  convertToCSV(events) {
    if (events.length === 0) return '';

    const headers = ['timestamp', 'name', 'category', 'page', 'sessionId', 'properties'];
    const rows = events.map(event => [
      new Date(event.timestamp).toISOString(),
      event.name,
      event.category,
      event.page,
      event.sessionId,
      JSON.stringify(event.properties)
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  /**
   * Limpa dados antigos
   */
  cleanupOldData(daysToKeep = 30) {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.events.length;
    
    this.events = this.events.filter(e => e.timestamp > cutoff);
    
    const removed = initialCount - this.events.length;
    if (removed > 0) {
      console.log(`🧹 Analytics: Removidos ${removed} eventos antigos`);
      this.saveEvents();
    }
  }

  /**
   * Rastreia métricas de performance
   */
  trackPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;

      this.trackEvent('performance', {
        loadTime,
        domReady,
        page: this.getCurrentPage()
      }, 'performance');
    }
  }

  /**
   * Rastreia erros de validação
   */
  trackValidationError(field, error) {
    this.trackEvent('validation_error', {
      field,
      error,
      page: this.getCurrentPage()
    }, 'validation');
  }

  /**
   * Rastreia ações de backup
   */
  trackBackupAction(action, details = {}) {
    this.trackEvent('backup_action', {
      action,
      ...details
    }, 'backup');
  }

  /**
   * Rastreia uso de notificações
   */
  trackNotification(type, title) {
    this.trackEvent('notification_shown', {
      type,
      title
    }, 'ui');
  }
}

// Instância global
const analytics = new AnalyticsSystem();

// Funções de conveniência globais
window.trackEvent = (name, properties, category) => analytics.trackEvent(name, properties, category);
window.getUsageStats = () => analytics.getUsageStats();
window.exportAnalytics = (format) => analytics.exportData(format);

// Integração com outros sistemas
if (typeof notifications !== 'undefined') {
  // Intercepta notificações para rastrear
  const originalShow = notifications.show.bind(notifications);
  notifications.show = function(type, title, message, options) {
    analytics.trackNotification(type, title);
    return originalShow(type, title, message, options);
  };
}

// Rastreia performance quando a página carrega
window.addEventListener('load', () => {
  setTimeout(() => analytics.trackPerformance(), 1000);
});

// Limpeza automática de dados antigos (executa uma vez por dia)
const lastCleanup = localStorage.getItem('analytics_last_cleanup');
const now = Date.now();
if (!lastCleanup || (now - parseInt(lastCleanup)) > 24 * 60 * 60 * 1000) {
  analytics.cleanupOldData();
  localStorage.setItem('analytics_last_cleanup', now.toString());
}
