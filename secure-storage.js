/**
 * Sistema de Armazenamento Seguro
 * Fornece criptografia transparente para dados sensíveis no localStorage
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class SecureStorage {
  constructor() {
    this.securityUtils = new SecurityUtils();
    this.encryptedKeys = new Set([
      'auth_session',
      'system_users',
      'recovery_tokens',
      '2fa_codes',
      'temp_login_data',
      'user_2fa_settings',
      'last_activity',
      'master_key'
    ]);
  }

  /**
   * Salva dados de forma segura
   */
  async setItem(key, value) {
    try {
      if (this.encryptedKeys.has(key)) {
        // Criptografa dados sensíveis
        const encrypted = await this.securityUtils.encryptData(value);
        localStorage.setItem(key, JSON.stringify(encrypted));
      } else {
        // Dados não sensíveis são salvos normalmente
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw new Error(`Falha ao salvar dados: ${key}`);
    }
  }

  /**
   * Recupera dados de forma segura
   */
  async getItem(key) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      if (this.encryptedKeys.has(key)) {
        // Descriptografa dados sensíveis
        return await this.securityUtils.decryptData(parsed);
      } else {
        // Dados não sensíveis são retornados normalmente
        return parsed;
      }
    } catch (error) {
      console.error(`Erro ao recuperar ${key}:`, error);
      // Tenta retornar dados não criptografados (migração)
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    }
  }

  /**
   * Remove item do armazenamento
   */
  removeItem(key) {
    localStorage.removeItem(key);
  }

  /**
   * Limpa todos os dados sensíveis
   */
  clearSensitiveData() {
    this.encryptedKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Migra dados existentes para formato criptografado
   */
  async migrateToEncrypted() {
    const migrationKeys = ['system_users', 'auth_session'];
    
    for (const key of migrationKeys) {
      try {
        const existingData = localStorage.getItem(key);
        if (existingData) {
          const parsed = JSON.parse(existingData);
          // Verifica se já está criptografado
          if (!parsed.salt && !parsed.iv) {
            console.log(`Migrando ${key} para formato criptografado...`);
            await this.setItem(key, parsed);
          }
        }
      } catch (error) {
        console.error(`Erro na migração de ${key}:`, error);
      }
    }
  }

  /**
   * Verifica integridade dos dados
   */
  async verifyDataIntegrity(key) {
    try {
      const data = await this.getItem(key);
      if (!data) return true;

      // Verifica se dados críticos estão presentes
      if (key === 'system_users') {
        return Array.isArray(data) && data.every(user => 
          user.id && user.username && user.email
        );
      }
      
      if (key === 'auth_session') {
        return data.user && data.expiresAt && data.createdAt;
      }

      return true;
    } catch (error) {
      console.error(`Erro na verificação de integridade de ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtém estatísticas de armazenamento
   */
  getStorageStats() {
    const stats = {
      totalKeys: 0,
      encryptedKeys: 0,
      unencryptedKeys: 0,
      totalSize: 0,
      encryptedSize: 0
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      stats.totalKeys++;
      stats.totalSize += value.length;
      
      if (this.encryptedKeys.has(key)) {
        stats.encryptedKeys++;
        stats.encryptedSize += value.length;
      } else {
        stats.unencryptedKeys++;
      }
    }

    return stats;
  }

  /**
   * Limpa dados expirados
   */
  async cleanupExpiredData() {
    const now = Date.now();
    const keysToCheck = ['recovery_tokens', '2fa_codes', 'temp_login_data'];

    for (const key of keysToCheck) {
      try {
        const data = await this.getItem(key);
        if (data) {
          let hasExpired = false;

          if (key === 'recovery_tokens' || key === '2fa_codes') {
            // Verifica tokens expirados
            Object.keys(data).forEach(tokenKey => {
              if (data[tokenKey].expiresAt && data[tokenKey].expiresAt < now) {
                delete data[tokenKey];
                hasExpired = true;
              }
            });
          }

          if (key === 'temp_login_data') {
            // Verifica dados temporários expirados (10 minutos)
            if (data.timestamp && (now - data.timestamp) > 10 * 60 * 1000) {
              data = null;
              hasExpired = true;
            }
          }

          if (hasExpired) {
            if (data && Object.keys(data).length > 0) {
              await this.setItem(key, data);
            } else {
              this.removeItem(key);
            }
          }
        }
      } catch (error) {
        console.error(`Erro na limpeza de ${key}:`, error);
      }
    }
  }

  /**
   * Backup seguro dos dados
   */
  async createSecureBackup() {
    const backup = {};
    
    for (const key of this.encryptedKeys) {
      try {
        const data = await this.getItem(key);
        if (data) {
          backup[key] = data;
        }
      } catch (error) {
        console.error(`Erro no backup de ${key}:`, error);
      }
    }

    return backup;
  }

  /**
   * Restaura backup seguro
   */
  async restoreSecureBackup(backup) {
    for (const [key, data] of Object.entries(backup)) {
      try {
        if (this.encryptedKeys.has(key)) {
          await this.setItem(key, data);
        }
      } catch (error) {
        console.error(`Erro na restauração de ${key}:`, error);
      }
    }
  }
}

// Instância global
const secureStorage = new SecureStorage();

// Funções de conveniência globais
window.secureSetItem = (key, value) => secureStorage.setItem(key, value);
window.secureGetItem = (key) => secureStorage.getItem(key);
window.secureRemoveItem = (key) => secureStorage.removeItem(key);
window.secureClearSensitive = () => secureStorage.clearSensitiveData();
window.secureMigrate = () => secureStorage.migrateToEncrypted();
window.secureCleanup = () => secureStorage.cleanupExpiredData();
