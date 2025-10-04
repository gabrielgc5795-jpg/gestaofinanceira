/**
 * @fileoverview Funções compartilhadas entre todas as páginas do sistema
 * @author Gestão Financeira
 * @version 1.0.0
 */

// ===== FUNÇÕES COMPARTILHADAS =====

/**
 * Navega para uma página específica do sistema
 * @param {string} pagina - Nome da página (sem extensão .html)
 * @example
 * navegarPara('dashboard'); // Navega para dashboard.html
 */
function navegarPara(pagina) {
  window.location.href = `${pagina}.html`;
}

/**
 * Alterna entre tema claro e escuro
 * Salva a preferência no localStorage e atualiza o ícone do botão
 * @example
 * toggleTheme(); // Alterna o tema atual
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Atualizar ícone do botão
  const themeBtn = document.querySelector('.theme-btn i');
  if (themeBtn) {
    themeBtn.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/**
 * Carrega o tema salvo no localStorage
 * Aplica o tema e atualiza o ícone correspondente
 * @example
 * loadTheme(); // Carrega tema salvo ou usa 'light' como padrão
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeBtn = document.querySelector('.theme-btn i');
  if (themeBtn) {
    themeBtn.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/**
 * Converte chave de categoria em nome legível com emoji
 * @param {string} key - Chave da categoria (ex: 'alimentacao')
 * @returns {string} Nome formatado da categoria com emoji
 * @example
 * getCategoriaNome('alimentacao'); // Retorna "🍽️ Alimentação"
 */
function getCategoriaNome(key) {
  const nomes = {
    alimentacao: "🍽️ Alimentação",
    transporte: "🚗 Transporte", 
    lazer: "🎮 Lazer",
    saude: "🏥 Saúde",
    educacao: "📚 Educação",
    vestuario: "👕 Vestuário",
    casa: "🏠 Casa",
    investimentos: "📈 Investimentos",
    salario: "💰 Salário",
    freelance: "💼 Freelance",
    outros: "📦 Outros"
  };
  return nomes[key] || key;
}

/**
 * Atualiza as estatísticas exibidas no header da página
 * Calcula saldo total e número de transações e atualiza os elementos do DOM
 * @example
 * atualizarHeader(); // Atualiza saldo e contador de transações no header
 */
function atualizarHeader() {
  let saldo = 0;
  let receitas = 0;
  let despesas = 0;

  transacoes.forEach(t => {
    if (t.tipo === "receita") {
      saldo += t.valor;
      receitas += t.valor;
    } else {
      saldo -= t.valor;
      despesas += t.valor;
    }
  });

  // Atualizar header se os elementos existirem
  const headerSaldo = document.getElementById("header-saldo");
  const headerTransacoes = document.getElementById("header-transacoes");
  
  if (headerSaldo) headerSaldo.textContent = `R$ ${saldo.toFixed(2)}`;
  if (headerTransacoes) headerTransacoes.textContent = transacoes.length;
}

/**
 * Calcula estatísticas financeiras gerais do sistema
 * @returns {Object} Objeto com saldo, receitas, despesas e total de transações
 * @example
 * const stats = calcularEstatisticas();
 * console.log(stats.saldo); // Saldo atual
 * console.log(stats.receitas); // Total de receitas
 */
function calcularEstatisticas() {
  let saldo = 0;
  let receitas = 0;
  let despesas = 0;

  transacoes.forEach(t => {
    if (t.tipo === "receita") {
      saldo += t.valor;
      receitas += t.valor;
    } else {
      saldo -= t.valor;
      despesas += t.valor;
    }
  });

  return {
    saldo,
    receitas,
    despesas,
    totalTransacoes: transacoes.length
  };
}

/**
 * Adiciona uma nova transação ao sistema
 * @param {string} descricao - Descrição da transação
 * @param {number} valor - Valor da transação
 * @param {string} tipo - Tipo da transação ('receita' ou 'despesa')
 * @param {string} categoria - Categoria da transação
 * @example
 * adicionarTransacao('Salário', 3000, 'receita', 'salario');
 * adicionarTransacao('Almoço', 25.50, 'despesa', 'alimentacao');
 */
function adicionarTransacao(descricao, valor, tipo, categoria) {
  transacoes.push({
    descricao,
    valor: parseFloat(valor),
    tipo,
    categoria,
    data: new Date().toISOString()
  });

  salvarTransacoes();
  atualizarHeader();
}

/**
 * Marca o botão de navegação ativo baseado na página atual
 * @param {string} paginaAtiva - Nome da página ativa
 * @example
 * renderizarNavegacaoAtiva('Dashboard'); // Marca botão do dashboard como ativo
 */
function renderizarNavegacaoAtiva(paginaAtiva) {
  const navButtons = document.querySelectorAll('.tab-button');
  navButtons.forEach(button => {
    button.classList.remove('active');
    if (button.textContent.trim().toLowerCase() === paginaAtiva.toLowerCase()) {
      button.classList.add('active');
    }
  });
}

/**
 * Inicialização comum executada em todas as páginas
 * Carrega tema salvo e atualiza estatísticas do header
 */
document.addEventListener('DOMContentLoaded', function() {
  loadTheme();
  atualizarHeader();
});
