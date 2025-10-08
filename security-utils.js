/**
 * Sistema de Segurança e Criptografia
 * Fornece funções para hash de senhas, criptografia de dados e validação de entrada
 * 
 * @version 1.0
 * @author Sistema de Gestão Financeira
 */

class SecurityUtils {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.saltLength = 32;
    this.iterations = 100000;
    this.digest = 'sha512';
  }

  /**
   * Gera uma chave de criptografia baseada em uma senha mestra
   */
  generateKey(password, salt) {
    const key = crypto.subtle ? 
      this.generateKeyWebCrypto(password, salt) : 
      this.generateKeyNodeCrypto(password, salt);
    return key;
  }

  /**
   * Gera chave usando Web Crypto API (navegador)
   */
  async generateKeyWebCrypto(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: this.digest
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  }

  /**
   * Gera chave usando Node.js crypto (fallback)
   */
  generateKeyNodeCrypto(password, salt) {
    // Fallback para ambiente sem Web Crypto API
    const hash = this.simpleHash(password + salt);
    return hash.substring(0, 32);
  }

  /**
   * Gera salt aleatório
   */
  generateSalt() {
    if (crypto.getRandomValues) {
      const salt = new Uint8Array(this.saltLength);
      crypto.getRandomValues(salt);
      return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback para ambientes sem crypto.getRandomValues
      let salt = '';
      for (let i = 0; i < this.saltLength; i++) {
        salt += Math.floor(Math.random() * 16).toString(16);
      }
      return salt;
    }
  }

  /**
   * Gera IV aleatório
   */
  generateIV() {
    if (crypto.getRandomValues) {
      const iv = new Uint8Array(this.ivLength);
      crypto.getRandomValues(iv);
      return iv;
    } else {
      // Fallback
      const iv = new Array(this.ivLength);
      for (let i = 0; i < this.ivLength; i++) {
        iv[i] = Math.floor(Math.random() * 256);
      }
      return new Uint8Array(iv);
    }
  }

  /**
   * Cria hash de senha com salt
   */
  async hashPassword(password, salt = null) {
    if (!salt) {
      salt = this.generateSalt();
    }

    if (crypto.subtle) {
      // Usar Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const saltBuffer = this.hexToUint8Array(salt);
      
      const key = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const hash = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: this.iterations,
          hash: this.digest
        },
        key,
        256
      );

      return {
        hash: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''),
        salt: salt
      };
    } else {
      // Fallback usando função simples
      return this.simpleHashPassword(password, salt);
    }
  }

  /**
   * Verifica senha contra hash
   */
  async verifyPassword(password, hash, salt) {
    const result = await this.hashPassword(password, salt);
    return result.hash === hash;
  }

  /**
   * Criptografa dados sensíveis
   */
  async encryptData(data, password = null) {
    try {
      const masterPassword = password || this.getMasterPassword();
      const salt = this.generateSalt();
      const key = await this.generateKey(masterPassword, this.hexToUint8Array(salt));
      const iv = this.generateIV();
      
      const dataString = JSON.stringify(data);
      
      if (crypto.subtle) {
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          new TextEncoder().encode(dataString)
        );
        
        return {
          encrypted: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
          salt: salt,
          iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
        };
      } else {
        // Fallback para criptografia simples
        return this.simpleEncrypt(dataString, masterPassword);
      }
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia de dados');
    }
  }

  /**
   * Descriptografa dados sensíveis
   */
  async decryptData(encryptedData, password = null) {
    try {
      const masterPassword = password || this.getMasterPassword();
      
      if (encryptedData.salt && encryptedData.iv) {
        const key = await this.generateKey(masterPassword, this.hexToUint8Array(encryptedData.salt));
        const iv = this.hexToUint8Array(encryptedData.iv);
        
        if (crypto.subtle) {
          const encrypted = this.hexToUint8Array(encryptedData.encrypted);
          const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encrypted
          );
          
          const decryptedString = new TextDecoder().decode(decrypted);
          return JSON.parse(decryptedString);
        } else {
          // Fallback
          return this.simpleDecrypt(encryptedData.encrypted, masterPassword);
        }
      } else {
        // Dados antigos sem criptografia
        return encryptedData;
      }
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia de dados');
    }
  }

  /**
   * Obtém senha mestra do sistema
   */
  getMasterPassword() {
    // Em produção, isso deveria vir de uma variável de ambiente ou configuração segura
    const masterKey = localStorage.getItem('master_key');
    if (!masterKey) {
      const newKey = this.generateSalt();
      localStorage.setItem('master_key', newKey);
      return newKey;
    }
    return masterKey;
  }

  /**
   * Converte hex string para Uint8Array
   */
  hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Hash simples para fallback
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Hash de senha simples para fallback
   */
  simpleHashPassword(password, salt) {
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return {
      hash: Math.abs(hash).toString(16),
      salt: salt
    };
  }

  /**
   * Criptografia simples para fallback
   */
  simpleEncrypt(text, password) {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const passwordChar = password.charCodeAt(i % password.length);
      encrypted += String.fromCharCode(textChar ^ passwordChar);
    }
    return {
      encrypted: btoa(encrypted),
      salt: this.generateSalt(),
      iv: this.generateSalt()
    };
  }

  /**
   * Descriptografia simples para fallback
   */
  simpleDecrypt(encrypted, password) {
    try {
      const text = atob(encrypted);
      let decrypted = '';
      for (let i = 0; i < text.length; i++) {
        const textChar = text.charCodeAt(i);
        const passwordChar = password.charCodeAt(i % password.length);
        decrypted += String.fromCharCode(textChar ^ passwordChar);
      }
      return JSON.parse(decrypted);
    } catch (error) {
      return encrypted; // Retorna dados originais se falhar
    }
  }

  /**
   * Sanitiza entrada do usuário
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove aspas
      .replace(/[&<>"']/g, function(match) {
        const escape = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        };
        return escape[match];
      })
      .trim();
  }

  /**
   * Valida email
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Valida senha forte
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') return false;
    
    return password.length >= 12 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
  }

  /**
   * Valida entrada de texto
   */
  validateTextInput(input, maxLength = 255) {
    if (!input || typeof input !== 'string') return false;
    
    const sanitized = this.sanitizeInput(input);
    return sanitized.length > 0 && sanitized.length <= maxLength;
  }

  /**
   * Valida entrada numérica
   */
  validateNumericInput(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(input);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Gera token seguro
   */
  generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    if (crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
      }
    } else {
      // Fallback
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return token;
  }

  /**
   * Verifica integridade de dados
   */
  verifyDataIntegrity(data, expectedHash) {
    const dataString = JSON.stringify(data);
    const actualHash = this.simpleHash(dataString);
    return actualHash === expectedHash;
  }

  /**
   * Gera hash de integridade
   */
  generateDataHash(data) {
    const dataString = JSON.stringify(data);
    return this.simpleHash(dataString);
  }
}

// Instância global
const securityUtils = new SecurityUtils();

// Funções de conveniência globais
window.hashPassword = (password) => securityUtils.hashPassword(password);
window.verifyPassword = (password, hash, salt) => securityUtils.verifyPassword(password, hash, salt);
window.encryptData = (data) => securityUtils.encryptData(data);
window.decryptData = (encryptedData) => securityUtils.decryptData(encryptedData);
window.sanitizeInput = (input) => securityUtils.sanitizeInput(input);
window.validateEmail = (email) => securityUtils.validateEmail(email);
window.validatePassword = (password) => securityUtils.validatePassword(password);
window.generateSecureToken = (length) => securityUtils.generateSecureToken(length);
