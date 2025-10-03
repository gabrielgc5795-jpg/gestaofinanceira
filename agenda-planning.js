/**
 * Sistema de Agenda e Planejamento de Atividades
 * Gerencia agenda, eventos, tarefas e planejamento
 */

class AgendaPlanningSystem {
  constructor() {
    this.events = this.loadEvents();
    this.tasks = this.loadTasks();
    this.categories = this.loadCategories();
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
   * Carrega eventos do localStorage
   */
  loadEvents() {
    const savedEvents = localStorage.getItem('agenda_events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  }

  /**
   * Salva eventos no localStorage
   */
  saveEvents() {
    localStorage.setItem('agenda_events', JSON.stringify(this.events));
  }

  /**
   * Carrega tarefas do localStorage
   */
  loadTasks() {
    const savedTasks = localStorage.getItem('agenda_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  }

  /**
   * Salva tarefas no localStorage
   */
  saveTasks() {
    localStorage.setItem('agenda_tasks', JSON.stringify(this.tasks));
  }

  /**
   * Carrega categorias do localStorage
   */
  loadCategories() {
    const savedCategories = localStorage.getItem('agenda_categories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  }

  /**
   * Salva categorias no localStorage
   */
  saveCategories() {
    localStorage.setItem('agenda_categories', JSON.stringify(this.categories));
  }

  /**
   * Carrega dados padrão se não existirem
   */
  loadDefaultData() {
    if (this.categories.length === 0) {
      this.categories = [
        { id: 1, name: 'Reunião', color: '#3b82f6' },
        { id: 2, name: 'Tarefa', color: '#10b981' },
        { id: 3, name: 'Lembrete', color: '#f59e0b' },
        { id: 4, name: 'Evento', color: '#B22222' },
        { id: 5, name: 'Pessoal', color: '#8b5cf6' }
      ];
      this.saveCategories();
    }

    if (this.events.length === 0) {
      this.events = [
        {
          id: 1,
          title: 'Reunião semanal',
          description: 'Reunião de acompanhamento semanal',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          category: 'Reunião',
          location: 'Sala de reuniões',
          attendees: ['João Silva', 'Maria Santos'],
          status: 'scheduled', // scheduled, in_progress, completed, cancelled
          priority: 'normal',
          reminder: 15, // minutos antes
          createdAt: new Date().toISOString()
        }
      ];
      this.saveEvents();
    }

    if (this.tasks.length === 0) {
      this.tasks = [
        {
          id: 1,
          title: 'Revisar relatórios mensais',
          description: 'Revisar e aprovar relatórios do mês anterior',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Tarefa',
          priority: 'high',
          status: 'pending', // pending, in_progress, completed, cancelled
          assignee: 'João Silva',
          estimatedTime: 120, // minutos
          actualTime: null,
          tags: ['relatórios', 'aprovação'],
          createdAt: new Date().toISOString()
        }
      ];
      this.saveTasks();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event listeners serão configurados quando as páginas forem carregadas
  }

  // ===== GESTÃO DE EVENTOS =====

  /**
   * Obtém todos os eventos
   */
  getEvents() {
    return this.events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  /**
   * Obtém evento por ID
   */
  getEventById(id) {
    return this.events.find(event => event.id === id);
  }

  /**
   * Obtém eventos por data
   */
  getEventsByDate(date) {
    const targetDate = new Date(date).toDateString();
    return this.events.filter(event => {
      const eventDate = new Date(event.startDate).toDateString();
      return eventDate === targetDate;
    });
  }

  /**
   * Obtém eventos do mês
   */
  getEventsByMonth(year, month) {
    return this.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }

  /**
   * Cria novo evento
   */
  createEvent(eventData) {
    // Validações
    if (!eventData.title || !eventData.startDate) {
      throw new Error('Título e data de início são obrigatórios');
    }

    const newEvent = {
      id: Math.max(...this.events.map(e => e.id), 0) + 1,
      title: eventData.title,
      description: eventData.description || '',
      startDate: eventData.startDate,
      endDate: eventData.endDate || eventData.startDate,
      category: eventData.category || 'Evento',
      location: eventData.location || '',
      attendees: eventData.attendees || [],
      status: 'scheduled',
      priority: eventData.priority || 'normal',
      reminder: parseInt(eventData.reminder) || 0,
      createdAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    this.saveEvents();

    return newEvent;
  }

  /**
   * Atualiza evento existente
   */
  updateEvent(id, eventData) {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Evento não encontrado');
    }

    const updatedEvent = {
      ...this.events[eventIndex],
      ...eventData,
      id: this.events[eventIndex].id,
      createdAt: this.events[eventIndex].createdAt
    };

    this.events[eventIndex] = updatedEvent;
    this.saveEvents();

    return updatedEvent;
  }

  /**
   * Remove evento
   */
  removeEvent(id) {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Evento não encontrado');
    }

    this.events.splice(eventIndex, 1);
    this.saveEvents();

    return true;
  }

  // ===== GESTÃO DE TAREFAS =====

  /**
   * Obtém todas as tarefas
   */
  getTasks() {
    return this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  /**
   * Obtém tarefa por ID
   */
  getTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }

  /**
   * Obtém tarefas por status
   */
  getTasksByStatus(status) {
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * Obtém tarefas pendentes
   */
  getPendingTasks() {
    return this.getTasksByStatus('pending');
  }

  /**
   * Obtém tarefas em andamento
   */
  getInProgressTasks() {
    return this.getTasksByStatus('in_progress');
  }

  /**
   * Obtém tarefas concluídas
   */
  getCompletedTasks() {
    return this.getTasksByStatus('completed');
  }

  /**
   * Cria nova tarefa
   */
  createTask(taskData) {
    // Validações
    if (!taskData.title) {
      throw new Error('Título é obrigatório');
    }

    const newTask = {
      id: Math.max(...this.tasks.map(t => t.id), 0) + 1,
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || new Date().toISOString(),
      category: taskData.category || 'Tarefa',
      priority: taskData.priority || 'normal',
      status: 'pending',
      assignee: taskData.assignee || '',
      estimatedTime: parseInt(taskData.estimatedTime) || 0,
      actualTime: null,
      tags: taskData.tags || [],
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.saveTasks();

    return newTask;
  }

  /**
   * Atualiza tarefa existente
   */
  updateTask(id, taskData) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Tarefa não encontrada');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...taskData,
      id: this.tasks[taskIndex].id,
      createdAt: this.tasks[taskIndex].createdAt
    };

    this.tasks[taskIndex] = updatedTask;
    this.saveTasks();

    return updatedTask;
  }

  /**
   * Atualiza status da tarefa
   */
  updateTaskStatus(id, status) {
    const task = this.getTaskById(id);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    task.status = status;
    this.saveTasks();

    return task;
  }

  /**
   * Remove tarefa
   */
  removeTask(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Tarefa não encontrada');
    }

    this.tasks.splice(taskIndex, 1);
    this.saveTasks();

    return true;
  }

  // ===== GESTÃO DE CATEGORIAS =====

  /**
   * Obtém todas as categorias
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Obtém categoria por ID
   */
  getCategoryById(id) {
    return this.categories.find(category => category.id === id);
  }

  /**
   * Cria nova categoria
   */
  createCategory(categoryData) {
    const newCategory = {
      id: Math.max(...this.categories.map(c => c.id), 0) + 1,
      name: categoryData.name,
      color: categoryData.color || '#6b7280'
    };

    this.categories.push(newCategory);
    this.saveCategories();

    return newCategory;
  }

  // ===== RELATÓRIOS E ESTATÍSTICAS =====

  /**
   * Obtém estatísticas da agenda
   */
  getAgendaStats() {
    const totalEvents = this.events.length;
    const totalTasks = this.tasks.length;
    const pendingTasks = this.getPendingTasks().length;
    const inProgressTasks = this.getInProgressTasks().length;
    const completedTasks = this.getCompletedTasks().length;

    const todayEvents = this.getEventsByDate(new Date().toISOString());
    const overdueTasks = this.tasks.filter(task => 
      task.status !== 'completed' && 
      new Date(task.dueDate) < new Date()
    ).length;

    return {
      totalEvents,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      todayEvents: todayEvents.length,
      overdueTasks
    };
  }

  /**
   * Obtém eventos de hoje
   */
  getTodayEvents() {
    return this.getEventsByDate(new Date().toISOString());
  }

  /**
   * Obtém tarefas vencidas
   */
  getOverdueTasks() {
    return this.tasks.filter(task => 
      task.status !== 'completed' && 
      new Date(task.dueDate) < new Date()
    );
  }

  /**
   * Renderiza dashboard da agenda
   */
  renderAgendaDashboard() {
    const container = document.getElementById('agenda-dashboard-container');
    if (!container) return;

    const stats = this.getAgendaStats();
    const todayEvents = this.getTodayEvents();
    const pendingTasks = this.getPendingTasks();
    const overdueTasks = this.getOverdueTasks();

    container.innerHTML = `
      <div class="agenda-dashboard">
        <div class="page-header">
          <h2>Agenda e Planejamento</h2>
          <div class="header-actions">
            <button class="primary-btn" onclick="agendaPlanning.openEventModal()">
              <i class="fas fa-plus"></i>
              Novo Evento
            </button>
            <button class="primary-btn" onclick="agendaPlanning.openTaskModal()">
              <i class="fas fa-tasks"></i>
              Nova Tarefa
            </button>
            <button class="primary-btn" onclick="agendaPlanning.showCalendar()">
              <i class="fas fa-calendar"></i>
              Calendário
            </button>
          </div>
        </div>

        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.totalEvents}</h3>
              <p>Total de Eventos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.totalTasks}</h3>
              <p>Total de Tarefas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.todayEvents}</h3>
              <p>Eventos Hoje</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.overdueTasks}</h3>
              <p>Tarefas Atrasadas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.inProgressTasks}</h3>
              <p>Em Andamento</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>${stats.completedTasks}</h3>
              <p>Concluídas</p>
            </div>
          </div>
        </div>

        <!-- Alertas de Tarefas Atrasadas -->
        ${overdueTasks.length > 0 ? `
          <div class="overdue-tasks-section">
            <h3>Tarefas Atrasadas</h3>
            <div class="tasks-grid">
              ${overdueTasks.slice(0, 6).map(task => this.renderTaskCard(task)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Eventos de Hoje -->
        ${todayEvents.length > 0 ? `
          <div class="today-events-section">
            <h3>Eventos de Hoje</h3>
            <div class="events-grid">
              ${todayEvents.map(event => this.renderEventCard(event)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tarefas Pendentes -->
        ${pendingTasks.length > 0 ? `
          <div class="pending-tasks-section">
            <h3>Tarefas Pendentes</h3>
            <div class="tasks-grid">
              ${pendingTasks.slice(0, 6).map(task => this.renderTaskCard(task)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Renderiza card do evento
   */
  renderEventCard(event) {
    const category = this.categories.find(cat => cat.name === event.category);
    const startTime = new Date(event.startDate).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(event.endDate).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <div class="event-card">
        <div class="event-header">
          <div class="event-time">
            <span class="time-start">${startTime}</span>
            <span class="time-end">${endTime}</span>
          </div>
          <div class="event-category" style="background: ${category?.color || '#6b7280'}">
            ${event.category}
          </div>
        </div>
        
        <div class="event-content">
          <h4>${event.title}</h4>
          ${event.description ? `<p>${event.description}</p>` : ''}
          ${event.location ? `<p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
          ${event.attendees.length > 0 ? `
            <p><i class="fas fa-users"></i> ${event.attendees.join(', ')}</p>
          ` : ''}
        </div>
        
        <div class="event-actions">
          <button class="btn-icon" onclick="agendaPlanning.openEventModal(${event.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="agendaPlanning.removeEvent(${event.id})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza card da tarefa
   */
  renderTaskCard(task) {
    const category = this.categories.find(cat => cat.name === task.category);
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const dueDate = new Date(task.dueDate).toLocaleDateString('pt-BR');

    return `
      <div class="task-card ${isOverdue ? 'overdue' : ''}" data-status="${task.status}">
        <div class="task-header">
          <div class="task-priority priority-${task.priority}"></div>
          <div class="task-category" style="background: ${category?.color || '#6b7280'}">
            ${task.category}
          </div>
        </div>
        
        <div class="task-content">
          <h4>${task.title}</h4>
          ${task.description ? `<p>${task.description}</p>` : ''}
          <div class="task-meta">
            <p><i class="fas fa-calendar"></i> ${dueDate}</p>
            ${task.assignee ? `<p><i class="fas fa-user"></i> ${task.assignee}</p>` : ''}
            ${task.estimatedTime ? `<p><i class="fas fa-clock"></i> ${task.estimatedTime}min</p>` : ''}
          </div>
        </div>
        
        <div class="task-actions">
          <button class="btn-icon" onclick="agendaPlanning.openTaskModal(${task.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          ${task.status === 'pending' ? `
            <button class="btn-icon" onclick="agendaPlanning.updateTaskStatus(${task.id}, 'in_progress')" title="Iniciar">
              <i class="fas fa-play"></i>
            </button>
          ` : ''}
          ${task.status === 'in_progress' ? `
            <button class="btn-icon" onclick="agendaPlanning.updateTaskStatus(${task.id}, 'completed')" title="Concluir">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
          <button class="btn-icon btn-danger" onclick="agendaPlanning.removeTask(${task.id})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Abre modal para criar/editar evento
   */
  openEventModal(eventId = null) {
    const event = eventId ? this.getEventById(eventId) : null;
    const modal = this.createEventModal(event);
    document.body.appendChild(modal);
  }

  /**
   * Abre modal para criar/editar tarefa
   */
  openTaskModal(taskId = null) {
    const task = taskId ? this.getTaskById(taskId) : null;
    const modal = this.createTaskModal(task);
    document.body.appendChild(modal);
  }

  /**
   * Cria modal de evento
   */
  createEventModal(event = null) {
    const isEdit = !!event;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Evento' : 'Novo Evento'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="event-form">
          <div class="form-group">
            <label for="event-title">Título *</label>
            <input type="text" id="event-title" name="title" value="${event?.title || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="event-description">Descrição</label>
            <textarea id="event-description" name="description" rows="3">${event?.description || ''}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="event-start">Data/Hora Início *</label>
              <input type="datetime-local" id="event-start" name="startDate" value="${event ? this.formatDateTimeLocal(event.startDate) : ''}" required>
            </div>
            <div class="form-group">
              <label for="event-end">Data/Hora Fim</label>
              <input type="datetime-local" id="event-end" name="endDate" value="${event ? this.formatDateTimeLocal(event.endDate) : ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="event-category">Categoria</label>
              <select id="event-category" name="category">
                ${this.getCategories().map(category => `
                  <option value="${category.name}" ${event?.category === category.name ? 'selected' : ''}>
                    ${category.name}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="event-priority">Prioridade</label>
              <select id="event-priority" name="priority">
                <option value="low" ${event?.priority === 'low' ? 'selected' : ''}>Baixa</option>
                <option value="normal" ${event?.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${event?.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="urgent" ${event?.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="event-location">Localização</label>
            <input type="text" id="event-location" name="location" value="${event?.location || ''}">
          </div>
          
          <div class="form-group">
            <label for="event-attendees">Participantes (separados por vírgula)</label>
            <input type="text" id="event-attendees" name="attendees" value="${event?.attendees?.join(', ') || ''}">
          </div>
          
          <div class="form-group">
            <label for="event-reminder">Lembrete (minutos antes)</label>
            <input type="number" id="event-reminder" name="reminder" value="${event?.reminder || '0'}" min="0">
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

    // Configura evento de submit
    const form = modal.querySelector('#event-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const eventData = {
        ...Object.fromEntries(formData),
        attendees: formData.get('attendees') ? 
          formData.get('attendees').split(',').map(a => a.trim()).filter(a => a) : []
      };

      try {
        if (isEdit) {
          this.updateEvent(event.id, eventData);
          showSuccess('Evento atualizado com sucesso!');
        } else {
          this.createEvent(eventData);
          showSuccess('Evento criado com sucesso!');
        }
        modal.remove();
        this.renderAgendaDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Cria modal de tarefa
   */
  createTaskModal(task = null) {
    const isEdit = !!task;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="modal-form" id="task-form">
          <div class="form-group">
            <label for="task-title">Título *</label>
            <input type="text" id="task-title" name="title" value="${task?.title || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="task-description">Descrição</label>
            <textarea id="task-description" name="description" rows="3">${task?.description || ''}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="task-due-date">Data de Vencimento</label>
              <input type="date" id="task-due-date" name="dueDate" value="${task ? new Date(task.dueDate).toISOString().split('T')[0] : ''}">
            </div>
            <div class="form-group">
              <label for="task-category">Categoria</label>
              <select id="task-category" name="category">
                ${this.getCategories().map(category => `
                  <option value="${category.name}" ${task?.category === category.name ? 'selected' : ''}>
                    ${category.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="task-priority">Prioridade</label>
              <select id="task-priority" name="priority">
                <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Baixa</option>
                <option value="normal" ${task?.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="urgent" ${task?.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
              </select>
            </div>
            <div class="form-group">
              <label for="task-assignee">Responsável</label>
              <input type="text" id="task-assignee" name="assignee" value="${task?.assignee || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="task-estimated-time">Tempo Estimado (minutos)</label>
            <input type="number" id="task-estimated-time" name="estimatedTime" value="${task?.estimatedTime || '0'}" min="0">
          </div>
          
          <div class="form-group">
            <label for="task-tags">Tags (separadas por vírgula)</label>
            <input type="text" id="task-tags" name="tags" value="${task?.tags?.join(', ') || ''}">
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

    // Configura evento de submit
    const form = modal.querySelector('#task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const taskData = {
        ...Object.fromEntries(formData),
        tags: formData.get('tags') ? 
          formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
      };

      try {
        if (isEdit) {
          this.updateTask(task.id, taskData);
          showSuccess('Tarefa atualizada com sucesso!');
        } else {
          this.createTask(taskData);
          showSuccess('Tarefa criada com sucesso!');
        }
        modal.remove();
        this.renderAgendaDashboard();
      } catch (error) {
        showError('Erro', error.message);
      }
    });

    return modal;
  }

  /**
   * Formata data/hora para input datetime-local
   */
  formatDateTimeLocal(dateTime) {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Atualiza status da tarefa
   */
  async updateTaskStatus(taskId, status) {
    try {
      this.updateTaskStatus(taskId, status);
      showSuccess(`Tarefa ${status === 'completed' ? 'concluída' : 'iniciada'}!`);
      this.renderAgendaDashboard();
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Remove evento
   */
  async removeEvent(eventId) {
    try {
      const confirmed = await confirmAction(
        'Remover Evento',
        'Tem certeza que deseja remover este evento?',
        'Remover'
      );

      if (confirmed) {
        this.removeEvent(eventId);
        showSuccess('Evento removido com sucesso!');
        this.renderAgendaDashboard();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Remove tarefa
   */
  async removeTask(taskId) {
    try {
      const confirmed = await confirmAction(
        'Remover Tarefa',
        'Tem certeza que deseja remover esta tarefa?',
        'Remover'
      );

      if (confirmed) {
        this.removeTask(taskId);
        showSuccess('Tarefa removida com sucesso!');
        this.renderAgendaDashboard();
      }
    } catch (error) {
      showError('Erro', error.message);
    }
  }

  /**
   * Mostra calendário (placeholder)
   */
  showCalendar() {
    showInfo('Calendário', 'Funcionalidade de calendário será implementada em breve!');
  }
}

// Instância global
const agendaPlanning = new AgendaPlanningSystem();

// Exporta para uso global
window.agendaPlanning = agendaPlanning;
