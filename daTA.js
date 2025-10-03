/**
 * @fileoverview Gerenciamento de dados e localStorage do sistema
 * @author Grill Gestão
 * @version 1.0.0
 */

/**
 * Array global que armazena todas as transações do sistema
 * Carregado automaticamente do localStorage na inicialização
 * @type {Array<Object>}
 * @global
 */
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

/**
 * Salva o array de transações no localStorage
 * Converte o array para JSON e armazena com a chave "transacoes"
 * @example
 * transacoes.push(novaTransacao);
 * salvarTransacoes(); // Persiste as mudanças
 */
function salvarTransacoes() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}