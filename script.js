// Função para controlar as abas
function abrirAba(evt, nomeAba) {
  // Esconder todas as abas
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
  }

  // Remover classe active de todos os botões
  const tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  // Mostrar a aba selecionada e marcar o botão como ativo
  document.getElementById(nomeAba).classList.add("active");
  evt.currentTarget.classList.add("active");

  // Atualizar gráfico quando abrir aba de gráficos
  if (nomeAba === 'graficos') {
    setTimeout(() => {
      atualizarGrafico();
    }, 100);
  }
  
  // Atualizar relatórios quando abrir aba de relatórios
  if (nomeAba === 'relatorios') {
    setTimeout(() => {
      gerarRelatorios();
    }, 100);
  }
  
  // Atualizar orçamento quando abrir aba de orçamento
  if (nomeAba === 'orcamento') {
    setTimeout(() => {
      atualizarStatusOrcamento();
    }, 100);
  }
  
  // Atualizar metas quando abrir aba de metas
  if (nomeAba === 'metas') {
    setTimeout(() => {
      atualizarListaMetas();
    }, 100);
  }
}

// Função para alternar tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Atualizar ícone do botão
  const themeBtn = document.querySelector('.theme-btn i');
  themeBtn.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Carregar tema salvo
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeBtn = document.querySelector('.theme-btn i');
  themeBtn.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function atualizarInterface() {
  const lista = document.getElementById("lista-transacoes");
  lista.innerHTML = "";

  let saldo = 0;
  let receitas = 0;
  let despesas = 0;

  transacoes.forEach((t, i) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div class="transacao-item">
        <div class="transacao-info">
          <span class="transacao-emoji">${t.tipo === "receita" ? "💰" : "💸"}</span>
          <span class="transacao-descricao">${t.descricao}</span>
          <span class="transacao-categoria">${getCategoriaNome(t.categoria)}</span>
        </div>
        <div class="transacao-valor" style="color: ${t.tipo === "receita" ? "var(--success-color)" : "var(--error-color)"}">
          ${t.tipo === "receita" ? "+" : "-"}R$ ${t.valor.toFixed(2)}
        </div>
        <div class="transacao-data">${new Date(t.data).toLocaleDateString('pt-BR')}</div>
      </div>
    `;
    lista.appendChild(item);
    
    if (t.tipo === "receita") {
      saldo += t.valor;
      receitas += t.valor;
    } else {
      saldo -= t.valor;
      despesas += t.valor;
    }
  });

  // Atualizar valores no dashboard
  document.getElementById("valor-saldo").textContent = `R$ ${saldo.toFixed(2)}`;
  document.getElementById("total-receitas").textContent = `R$ ${receitas.toFixed(2)}`;
  document.getElementById("total-despesas").textContent = `R$ ${despesas.toFixed(2)}`;
  document.getElementById("total-transacoes-dash").textContent = transacoes.length;
  
  // Atualizar header
  document.getElementById("header-saldo").textContent = `R$ ${saldo.toFixed(2)}`;
  document.getElementById("header-transacoes").textContent = transacoes.length;
  
  atualizarGrafico();
  verificarMeta();
}

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

document.getElementById("form-transacao").addEventListener("submit", function(e) {
  e.preventDefault();
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const categoria = document.getElementById("categoria").value;

  transacoes.push({
    descricao,
    valor,
    tipo,
    categoria,
    data: new Date().toISOString()
  });

  salvarTransacoes();
  atualizarInterface();
  e.target.reset();
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  loadTheme();
  atualizarInterface();
});