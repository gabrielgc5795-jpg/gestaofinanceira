/**
 * Sistema de Backup e Restore de Dados
 * Fornece funcionalidades para backup, restore e sincronização de dados
 */

class BackupSystem {
  constructor() {
    this.backupKeys = ['transacoes', 'orcamento', 'metas', 'notasFiscais', 'theme'];
    this.compressionEnabled = true;
    this.init();
  }

  /**
   * Inicializa o sistema de backup
   */
  init() {
    this.setupAutoBackup();
    this.setupStorageListener();
  }

  /**
   * Configura backup automático
   */
  setupAutoBackup() {
    // Backup automático a cada 5 minutos se houver mudanças
    setInterval(() => {
      if (this.hasChanges()) {
        this.createAutoBackup();
      }
    }, 5 * 60 * 1000);

    // Backup ao fechar a página
    window.addEventListener('beforeunload', () => {
      this.createAutoBackup();
    });
  }

  /**
   * Monitora mudanças no localStorage
   */
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (this.backupKeys.includes(e.key)) {
        this.markAsChanged();
      }
    });
  }

  /**
   * Verifica se há mudanças desde o último backup
   */
  hasChanges() {
    const lastBackup = localStorage.getItem('lastBackupHash');
    const currentHash = this.generateDataHash();
    return lastBackup !== currentHash;
  }

  /**
   * Marca dados como alterados
   */
  markAsChanged() {
    localStorage.setItem('dataChanged', Date.now().toString());
  }

  /**
   * Gera hash dos dados atuais
   */
  generateDataHash() {
    const data = this.getAllData();
    const dataString = JSON.stringify(data);
    return this.simpleHash(dataString);
  }

  /**
   * Hash simples para comparação
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Obtém todos os dados do sistema
   */
  getAllData() {
    const data = {};
    this.backupKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
    });
    return data;
  }

  /**
   * Cria backup completo
   * @param {string} name - Nome do backup (opcional)
   * @returns {Object} - Dados do backup
   */
  createBackup(name = null) {
    const timestamp = new Date().toISOString();
    const data = this.getAllData();
    
    const backup = {
      name: name || `Backup ${new Date().toLocaleString('pt-BR')}`,
      timestamp,
      version: '1.0',
      data,
      hash: this.generateDataHash(),
      size: JSON.stringify(data).length
    };

    // Salva na lista de backups
    this.saveBackupToList(backup);
    
    // Atualiza hash do último backup
    localStorage.setItem('lastBackupHash', backup.hash);
    
    return backup;
  }

  /**
   * Cria backup automático
   */
  createAutoBackup() {
    const backup = this.createBackup('Backup Automático');
    
    // Mantém apenas os últimos 5 backups automáticos
    this.cleanupAutoBackups();
    
    return backup;
  }

  /**
   * Salva backup na lista
   */
  saveBackupToList(backup) {
    let backups = this.getBackupList();
    
    // Adiciona novo backup
    backups.unshift(backup);
    
    // Mantém apenas os últimos 20 backups
    backups = backups.slice(0, 20);
    
    localStorage.setItem('backupList', JSON.stringify(backups));
  }

  /**
   * Obtém lista de backups
   */
  getBackupList() {
    try {
      return JSON.parse(localStorage.getItem('backupList') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Remove backups automáticos antigos
   */
  cleanupAutoBackups() {
    let backups = this.getBackupList();
    const autoBackups = backups.filter(b => b.name.includes('Automático'));
    
    if (autoBackups.length > 5) {
      // Remove backups automáticos mais antigos
      const toRemove = autoBackups.slice(5);
      backups = backups.filter(b => !toRemove.includes(b));
      localStorage.setItem('backupList', JSON.stringify(backups));
    }
  }

  /**
   * Restaura dados de um backup
   * @param {Object} backup - Dados do backup
   * @returns {boolean} - Sucesso da operação
   */
  async restoreBackup(backup) {
    try {
      // Cria backup atual antes de restaurar
      const currentBackup = this.createBackup('Backup antes de restaurar');
      
      // Restaura cada chave
      Object.entries(backup.data).forEach(([key, value]) => {
        if (this.backupKeys.includes(key)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      
      // Atualiza hash
      localStorage.setItem('lastBackupHash', backup.hash);
      
      // Dispara evento de dados restaurados
      window.dispatchEvent(new CustomEvent('dataRestored', { 
        detail: { backup, currentBackup } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  /**
   * Exporta backup como arquivo
   * @param {Object} backup - Backup a ser exportado
   * @param {string} format - Formato do arquivo (json, txt)
   */
  exportBackup(backup, format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `grill-gestao-backup-${timestamp}`;
    let content = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        filename += '.json';
        content = JSON.stringify(backup, null, 2);
        mimeType = 'application/json';
        break;
        
      case 'txt':
        filename += '.txt';
        content = this.formatBackupAsText(backup);
        mimeType = 'text/plain';
        break;
        
      default:
        throw new Error('Formato não suportado');
    }

    this.downloadFile(content, filename, mimeType);
  }

  /**
   * Formata backup como texto legível
   */
  formatBackupAsText(backup) {
    let text = `BACKUP GESTÃO FINANCEIRA\n`;
    text += `==================\n\n`;
    text += `Nome: ${backup.name}\n`;
    text += `Data: ${new Date(backup.timestamp).toLocaleString('pt-BR')}\n`;
    text += `Versão: ${backup.version}\n`;
    text += `Tamanho: ${(backup.size / 1024).toFixed(2)} KB\n\n`;

    // Transações
    if (backup.data.transacoes) {
      text += `TRANSAÇÕES (${backup.data.transacoes.length})\n`;
      text += `${'-'.repeat(50)}\n`;
      backup.data.transacoes.forEach((t, i) => {
        text += `${i + 1}. ${t.descricao} - ${t.tipo === 'receita' ? '+' : '-'}R$ ${t.valor.toFixed(2)}\n`;
        text += `   Categoria: ${t.categoria} | Data: ${new Date(t.data).toLocaleDateString('pt-BR')}\n\n`;
      });
    }

    // Metas
    if (backup.data.metas) {
      text += `METAS (${backup.data.metas.length})\n`;
      text += `${'-'.repeat(50)}\n`;
      backup.data.metas.forEach((m, i) => {
        text += `${i + 1}. ${m.nome} - Meta: R$ ${m.valorMeta.toFixed(2)}\n`;
        text += `   Atual: R$ ${m.valorAtual.toFixed(2)} | Prazo: ${new Date(m.prazo).toLocaleDateString('pt-BR')}\n\n`;
      });
    }

    // Orçamento
    if (backup.data.orcamento) {
      text += `ORÇAMENTO\n`;
      text += `${'-'.repeat(50)}\n`;
      Object.entries(backup.data.orcamento).forEach(([categoria, valor]) => {
        text += `${categoria}: R$ ${valor.toFixed(2)}\n`;
      });
      text += '\n';
    }

    return text;
  }

  /**
   * Importa backup de arquivo
   * @param {File} file - Arquivo de backup
   * @returns {Promise<Object>} - Dados do backup importado
   */
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let backup;
          
          if (file.name.endsWith('.json')) {
            backup = JSON.parse(content);
          } else {
            reject(new Error('Formato de arquivo não suportado'));
            return;
          }
          
          // Valida estrutura do backup
          if (!this.validateBackup(backup)) {
            reject(new Error('Arquivo de backup inválido'));
            return;
          }
          
          resolve(backup);
        } catch (error) {
          reject(new Error('Erro ao ler arquivo de backup'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Valida estrutura do backup
   */
  validateBackup(backup) {
    return backup && 
           backup.data && 
           backup.timestamp && 
           backup.version &&
           typeof backup.data === 'object';
  }

  /**
   * Faz download de arquivo
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Limpa todos os dados
   */
  async clearAllData() {
    // Cria backup antes de limpar
    const backup = this.createBackup('Backup antes de limpar dados');
    
    // Remove dados principais
    this.backupKeys.forEach(key => {
      if (key !== 'theme') { // Mantém tema
        localStorage.removeItem(key);
      }
    });
    
    // Dispara evento
    window.dispatchEvent(new CustomEvent('dataCleared', { 
      detail: { backup } 
    }));
    
    return backup;
  }

  /**
   * Obtém estatísticas dos dados
   */
  getDataStats() {
    const data = this.getAllData();
    const stats = {
      totalSize: JSON.stringify(data).length,
      transacoes: data.transacoes ? data.transacoes.length : 0,
      metas: data.metas ? data.metas.length : 0,
      notasFiscais: data.notasFiscais ? data.notasFiscais.length : 0,
      backups: this.getBackupList().length,
      lastBackup: null
    };
    
    const backups = this.getBackupList();
    if (backups.length > 0) {
      stats.lastBackup = new Date(backups[0].timestamp);
    }
    
    return stats;
  }

  /**
   * Sincroniza dados entre abas
   */
  syncData() {
    // Força atualização em outras abas
    localStorage.setItem('syncTrigger', Date.now().toString());
    
    // Remove trigger após um tempo
    setTimeout(() => {
      localStorage.removeItem('syncTrigger');
    }, 1000);
  }

  /**
   * Compara dois backups
   */
  compareBackups(backup1, backup2) {
    const differences = {
      transacoes: {
        added: [],
        removed: [],
        modified: []
      },
      metas: {
        added: [],
        removed: [],
        modified: []
      },
      orcamento: {
        changed: []
      }
    };

    // Compara transações
    const t1 = backup1.data.transacoes || [];
    const t2 = backup2.data.transacoes || [];
    
    // Transações adicionadas
    differences.transacoes.added = t2.filter(t => 
      !t1.find(t1Item => t1Item.data === t.data && t1Item.descricao === t.descricao)
    );
    
    // Transações removidas
    differences.transacoes.removed = t1.filter(t => 
      !t2.find(t2Item => t2Item.data === t.data && t2Item.descricao === t.descricao)
    );

    return differences;
  }
}

// Instância global
const backupSystem = new BackupSystem();

// Funções de conveniência globais
window.createBackup = (name) => backupSystem.createBackup(name);
window.restoreBackup = (backup) => backupSystem.restoreBackup(backup);
window.exportBackup = (backup, format) => backupSystem.exportBackup(backup, format);
window.importBackup = (file) => backupSystem.importBackup(file);
window.getBackupList = () => backupSystem.getBackupList();
window.clearAllData = () => backupSystem.clearAllData();
window.getDataStats = () => backupSystem.getDataStats();
