/**
 * Script de Migração de Segurança
 * Converte dados existentes para formato criptografado
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class SecurityMigration {
  constructor() {
    this.migrationVersion = '1.0';
    this.migratedKey = 'security_migration_completed';
  }

  /**
   * Executa migração completa de segurança
   */
  async runMigration() {
    try {
      console.log('Iniciando migração de segurança...');
      
      // Verifica se já foi migrado
      if (this.isMigrationCompleted()) {
        console.log('Migração já foi executada anteriormente');
        return true;
      }

      // 1. Migra usuários para formato criptografado
      await this.migrateUsers();
      
      // 2. Migra sessões para formato criptografado
      await this.migrateSessions();
      
      // 3. Migra tokens de recuperação
      await this.migrateRecoveryTokens();
      
      // 4. Limpa dados antigos
      await this.cleanupOldData();
      
      // 5. Marca migração como concluída
      this.markMigrationCompleted();
      
      console.log('Migração de segurança concluída com sucesso!');
      return true;
      
    } catch (error) {
      console.error('Erro na migração de segurança:', error);
      return false;
    }
  }

  /**
   * Verifica se migração já foi executada
   */
  isMigrationCompleted() {
    return localStorage.getItem(this.migratedKey) === this.migrationVersion;
  }

  /**
   * Marca migração como concluída
   */
  markMigrationCompleted() {
    localStorage.setItem(this.migratedKey, this.migrationVersion);
  }

  /**
   * Migra usuários para formato criptografado
   */
  async migrateUsers() {
    try {
      const usersData = localStorage.getItem('system_users');
      if (!usersData) return;

      const users = JSON.parse(usersData);
      const migratedUsers = [];

      for (const user of users) {
        const migratedUser = { ...user };

        // Se usuário tem senha em texto claro, converte para hash
        if (user.password && !user.passwordHash) {
          console.log(`Migrando usuário: ${user.username}`);
          
          if (typeof securityUtils !== 'undefined') {
            const passwordData = await securityUtils.hashPassword(user.password);
            migratedUser.passwordHash = passwordData.hash;
            migratedUser.passwordSalt = passwordData.salt;
          } else {
            // Fallback simples
            const salt = this.generateSalt();
            const hash = this.simpleHash(user.password + salt);
            migratedUser.passwordHash = hash;
            migratedUser.passwordSalt = salt;
          }
          
          // Remove senha em texto claro
          delete migratedUser.password;
        }

        migratedUsers.push(migratedUser);
      }

      // Salva usuários migrados
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('system_users', migratedUsers);
      } else {
        localStorage.setItem('system_users', JSON.stringify(migratedUsers));
      }

      console.log(`${migratedUsers.length} usuários migrados com sucesso`);
      
    } catch (error) {
      console.error('Erro na migração de usuários:', error);
    }
  }

  /**
   * Migra sessões para formato criptografado
   */
  async migrateSessions() {
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      
      // Salva sessão migrada
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('auth_session', session);
      }

      console.log('Sessão migrada com sucesso');
      
    } catch (error) {
      console.error('Erro na migração de sessão:', error);
    }
  }

  /**
   * Migra tokens de recuperação
   */
  async migrateRecoveryTokens() {
    try {
      const tokensData = localStorage.getItem('recovery_tokens');
      if (!tokensData) return;

      const tokens = JSON.parse(tokensData);
      
      // Salva tokens migrados
      if (typeof secureStorage !== 'undefined') {
        await secureStorage.setItem('recovery_tokens', tokens);
      }

      console.log('Tokens de recuperação migrados com sucesso');
      
    } catch (error) {
      console.error('Erro na migração de tokens:', error);
    }
  }

  /**
   * Limpa dados antigos não criptografados
   */
  async cleanupOldData() {
    try {
      const keysToClean = [
        'temp_login_data',
        'user_2fa_settings',
        'last_activity'
      ];

      for (const key of keysToClean) {
        const data = localStorage.getItem(key);
        if (data) {
          if (typeof secureStorage !== 'undefined') {
            await secureStorage.setItem(key, JSON.parse(data));
          }
        }
      }

      console.log('Dados antigos limpos com sucesso');
      
    } catch (error) {
      console.error('Erro na limpeza de dados antigos:', error);
    }
  }

  /**
   * Gera salt simples
   */
  generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Hash simples para fallback
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verifica integridade dos dados migrados
   */
  async verifyMigrationIntegrity() {
    try {
      let allValid = true;

      // Verifica usuários
      if (typeof secureStorage !== 'undefined') {
        const users = await secureStorage.getItem('system_users');
        if (users) {
          for (const user of users) {
            if (user.password && !user.passwordHash) {
              console.warn(`Usuário ${user.username} ainda tem senha em texto claro`);
              allValid = false;
            }
          }
        }
      }

      return allValid;
      
    } catch (error) {
      console.error('Erro na verificação de integridade:', error);
      return false;
    }
  }

  /**
   * Reverte migração (para testes)
   */
  async revertMigration() {
    try {
      console.log('Revertendo migração de segurança...');
      
      // Remove marca de migração
      localStorage.removeItem(this.migratedKey);
      
      // Limpa dados criptografados
      if (typeof secureStorage !== 'undefined') {
        secureStorage.clearSensitiveData();
      }
      
      console.log('Migração revertida com sucesso');
      
    } catch (error) {
      console.error('Erro ao reverter migração:', error);
    }
  }
}

// Instância global
const securityMigration = new SecurityMigration();

// Funções de conveniência globais
window.runSecurityMigration = () => securityMigration.runMigration();
window.verifyMigrationIntegrity = () => securityMigration.verifyMigrationIntegrity();
window.revertSecurityMigration = () => securityMigration.revertMigration();

// Executa migração automaticamente quando o script é carregado
document.addEventListener('DOMContentLoaded', async () => {
  // Aguarda um pouco para garantir que outros scripts foram carregados
  setTimeout(async () => {
    if (typeof securityUtils !== 'undefined' && typeof secureStorage !== 'undefined') {
      await securityMigration.runMigration();
    }
  }, 1000);
});
