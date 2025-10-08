// Funcionalidades Avançadas de Gestão Financeira

// Sistema de Orçamento
let orcamento = JSON.parse(localStorage.getItem("orcamento")) || {};

function inicializarOrcamento() {
  const categorias = [
    { nome: "Alimentação", key: "alimentacao", emoji: "🍽️" },
    { nome: "Transporte", key: "transporte", emoji: "🚗" },
    { nome: "Lazer", key: "lazer", emoji: "🎮" },
    { nome: "Saúde", key: "saude", emoji: "🏥" },
    { nome: "Educação", key: "educacao", emoji: "📚" },
    { nome: "Vestuário", key: "vestuario", emoji: "👕" },
    { nome: "Casa", key: "casa", emoji: "🏠" },
    { nome: "Investimentos", key: "investimentos", emoji: "📈" }
  ];

  const container = document.getElementById("categorias-orcamento");
  container.innerHTML = "";

  categorias.forEach(cat => {
    const div = document.createElement("div");
    div.className = "categoria-orcamento";
    div.innerHTML = `
      <label>${cat.emoji} ${cat.nome}</label>
      <input type="number" id="orc-${cat.key}" placeholder="R$ 0,00" value="${orcamento[cat.key] || ''}">
    `;
    container.appendChild(div);
  });
}

function salvarOrcamento() {
  const categorias = ["alimentacao", "transporte", "lazer", "saude", "educacao", "vestuario", "casa", "investimentos"];
  
  categorias.forEach(cat => {
    const valor = document.getElementById(`orc-${cat}`).value;
    if (valor) {
      orcamento[cat] = parseFloat(valor);
    }
  });

  localStorage.setItem("orcamento", JSON.stringify(orcamento));
  atualizarStatusOrcamento();
  alert("Orçamento salvo com sucesso! 💾");
}

function atualizarStatusOrcamento() {
  const container = document.getElementById("status-orcamento");
  container.innerHTML = "";

  const gastosPorCategoria = {};
  const categorias = ["alimentacao", "transporte", "lazer", "saude", "educacao", "vestuario", "casa", "investimentos"];
  
  // Calcular gastos por categoria
  transacoes.forEach(t => {
    if (t.tipo === "despesa" && categorias.includes(t.categoria)) {
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
    }
  });

  categorias.forEach(cat => {
    const limite = orcamento[cat] || 0;
    const gasto = gastosPorCategoria[cat] || 0;
    const percentual = limite > 0 ? (gasto / limite) * 100 : 0;
    
    if (limite > 0) {
      const div = document.createElement("div");
      div.className = "status-categoria";
      div.innerHTML = `
        <div class="categoria-info">
          <span class="categoria-nome">${getCategoriaNome(cat)}</span>
          <span class="categoria-valores">R$ ${gasto.toFixed(2)} / R$ ${limite.toFixed(2)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(percentual, 100)}%; background-color: ${percentual > 100 ? '#dc3545' : percentual > 80 ? '#ffc107' : '#28a745'}"></div>
        </div>
        <div class="percentual">${percentual.toFixed(1)}%</div>
      `;
      container.appendChild(div);
    }
  });
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
    investimentos: "📈 Investimentos"
  };
  return nomes[key] || key;
}

// Sistema de Metas Múltiplas
let metas = JSON.parse(localStorage.getItem("metas")) || [];

function adicionarMeta() {
  const nome = document.getElementById("meta-nome").value;
  const valor = parseFloat(document.getElementById("meta-valor").value);
  const data = document.getElementById("meta-data").value;

  if (!nome || !valor || !data) {
    alert("Preencha todos os campos! ⚠️");
    return;
  }

  const novaMeta = {
    id: Date.now(),
    nome,
    valor,
    dataLimite: data,
    valorAtual: 0,
    criadaEm: new Date().toISOString()
  };

  metas.push(novaMeta);
  localStorage.setItem("metas", JSON.stringify(metas));
  
  document.getElementById("meta-nome").value = "";
  document.getElementById("meta-valor").value = "";
  document.getElementById("meta-data").value = "";
  
  atualizarListaMetas();
  alert("Meta adicionada com sucesso! 🎯");
}

function atualizarListaMetas() {
  const container = document.getElementById("lista-metas");
  container.innerHTML = "";

  metas.forEach(meta => {
    const div = document.createElement("div");
    div.className = "meta-item";
    
    const dataLimite = new Date(meta.dataLimite);
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataLimite - hoje) / (1000 * 60 * 60 * 24));
    
    let statusClass = "";
    let statusText = "";
    
    if (meta.valorAtual >= meta.valor) {
      statusClass = "completa";
      statusText = "✅ Concluída!";
    } else if (diasRestantes < 0) {
      statusClass = "vencida";
      statusText = "⏰ Vencida";
    } else {
      statusText = `⏳ ${diasRestantes} dias restantes`;
    }

    const percentual = (meta.valorAtual / meta.valor) * 100;

    div.innerHTML = `
      <div class="meta-header">
        <h4>${meta.nome}</h4>
        <span class="meta-status ${statusClass}">${statusText}</span>
      </div>
      <div class="meta-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(percentual, 100)}%"></div>
        </div>
        <div class="meta-valores">
          R$ ${meta.valorAtual.toFixed(2)} / R$ ${meta.valor.toFixed(2)} (${percentual.toFixed(1)}%)
        </div>
      </div>
      <div class="meta-actions">
        <button onclick="adicionarValorMeta(${meta.id})" class="btn-add">➕ Adicionar</button>
        <button onclick="removerMeta(${meta.id})" class="btn-remove">🗑️ Remover</button>
      </div>
    `;
    
    container.appendChild(div);
  });
}

function adicionarValorMeta(metaId) {
  const valor = prompt("Quanto deseja adicionar à esta meta?");
  if (valor && !isNaN(valor)) {
    const meta = metas.find(m => m.id === metaId);
    if (meta) {
      meta.valorAtual += parseFloat(valor);
      localStorage.setItem("metas", JSON.stringify(metas));
      atualizarListaMetas();
    }
  }
}

async function removerMeta(metaId) {
  const confirmed = await confirmDelete('esta meta');
  if (confirmed) {
    metas = metas.filter(m => m.id !== metaId);
    localStorage.setItem("metas", JSON.stringify(metas));
    atualizarListaMetas();
  }
}

// Sistema de Filtros
function aplicarFiltros() {
  const descricao = document.getElementById("busca-descricao").value.toLowerCase();
  const categoria = document.getElementById("filtro-categoria").value;
  const tipo = document.getElementById("filtro-tipo").value;
  const dataInicio = document.getElementById("filtro-data-inicio").value;
  const dataFim = document.getElementById("filtro-data-fim").value;

  let transacoesFiltradas = transacoes.filter(t => {
    let passa = true;

    if (descricao && !t.descricao.toLowerCase().includes(descricao)) {
      passa = false;
    }
    if (categoria && t.categoria !== categoria) {
      passa = false;
    }
    if (tipo && t.tipo !== tipo) {
      passa = false;
    }
    if (dataInicio && new Date(t.data) < new Date(dataInicio)) {
      passa = false;
    }
    if (dataFim && new Date(t.data) > new Date(dataFim)) {
      passa = false;
    }

    return passa;
  });

  exibirTransacoesFiltradas(transacoesFiltradas);
}

function limparFiltros() {
  document.getElementById("busca-descricao").value = "";
  document.getElementById("filtro-categoria").value = "";
  document.getElementById("filtro-tipo").value = "";
  document.getElementById("filtro-data-inicio").value = "";
  document.getElementById("filtro-data-fim").value = "";
  
  atualizarInterface();
}

function exibirTransacoesFiltradas(transacoesFiltradas) {
  const lista = document.getElementById("lista-transacoes");
  lista.innerHTML = "";

  let saldo = 0;
  let totalReceitas = 0;
  let totalDespesas = 0;

  transacoesFiltradas.forEach((t, i) => {
    const item = document.createElement("li");
    const data = new Date(t.data).toLocaleDateString('pt-BR');
    const emoji = t.tipo === "receita" ? "💰" : "💸";
    const cor = t.tipo === "receita" ? "green" : "red";
    
    item.innerHTML = `
      <div class="transacao-item">
        <div class="transacao-info">
          <span class="transacao-emoji">${emoji}</span>
          <span class="transacao-descricao">${t.descricao}</span>
          <span class="transacao-categoria">${getCategoriaNome(t.categoria)}</span>
        </div>
        <div class="transacao-valor" style="color: ${cor}">
          ${t.tipo === "receita" ? "+" : "-"}R$ ${t.valor.toFixed(2)}
        </div>
        <div class="transacao-data">${data}</div>
      </div>
    `;
    lista.appendChild(item);
    
    if (t.tipo === "receita") {
      saldo += t.valor;
      totalReceitas += t.valor;
    } else {
      saldo -= t.valor;
      totalDespesas += t.valor;
    }
  });

  document.getElementById("total-transacoes").textContent = `Total: ${transacoesFiltradas.length} transações`;
  document.getElementById("valor-total").textContent = `Saldo: R$ ${saldo.toFixed(2)}`;
}

// Relatórios Avançados
function gerarRelatorios() {
  gerarGraficoCategorias();
  gerarResumoMensal();
  gerarTopGastos();
  gerarTendencias();
}

function gerarGraficoCategorias() {
  const gastosPorCategoria = {};
  
  transacoes.forEach(t => {
    if (t.tipo === "despesa") {
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
    }
  });

  const ctx = document.getElementById("grafico-categorias").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(gastosPorCategoria).map(cat => getCategoriaNome(cat)),
      datasets: [{
        data: Object.values(gastosPorCategoria),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
          "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function gerarResumoMensal() {
  const mesAtual = new Date().getMonth();
  const transacoesMes = transacoes.filter(t => new Date(t.data).getMonth() === mesAtual);
  
  let receitas = 0;
  let despesas = 0;
  
  transacoesMes.forEach(t => {
    if (t.tipo === "receita") {
      receitas += t.valor;
    } else {
      despesas += t.valor;
    }
  });

  const saldo = receitas - despesas;
  const economia = saldo > 0 ? saldo : 0;

  document.getElementById("resumo-mensal").innerHTML = `
    <div class="resumo-item">
      <span class="resumo-label">💰 Receitas:</span>
      <span class="resumo-valor receita">R$ ${receitas.toFixed(2)}</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-label">💸 Despesas:</span>
      <span class="resumo-valor despesa">R$ ${despesas.toFixed(2)}</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-label">💵 Saldo:</span>
      <span class="resumo-valor ${saldo >= 0 ? 'receita' : 'despesa'}">R$ ${saldo.toFixed(2)}</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-label">🎯 Economia:</span>
      <span class="resumo-valor receita">R$ ${economia.toFixed(2)}</span>
    </div>
  `;
}

function gerarTopGastos() {
  const gastos = transacoes
    .filter(t => t.tipo === "despesa")
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const lista = document.getElementById("top-gastos");
  lista.innerHTML = "";

  gastos.forEach((gasto, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="posicao">${index + 1}º</span>
      <span class="descricao">${gasto.descricao}</span>
      <span class="valor">R$ ${gasto.valor.toFixed(2)}</span>
    `;
    lista.appendChild(item);
  });
}

function gerarTendencias() {
  const ultimos6Meses = [];
  const hoje = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const nomeMes = mes.toLocaleDateString('pt-BR', { month: 'short' });
    ultimos6Meses.push({ mes: nomeMes, receitas: 0, despesas: 0 });
  }

  transacoes.forEach(t => {
    const dataTransacao = new Date(t.data);
    const mesesAtras = (hoje.getMonth() - dataTransacao.getMonth()) + 
                      (hoje.getFullYear() - dataTransacao.getFullYear()) * 12;
    
    if (mesesAtras >= 0 && mesesAtras < 6) {
      if (t.tipo === "receita") {
        ultimos6Meses[5 - mesesAtras].receitas += t.valor;
      } else {
        ultimos6Meses[5 - mesesAtras].despesas += t.valor;
      }
    }
  });

  let tendenciaHTML = "<div class='tendencias-chart'>";
  ultimos6Meses.forEach(mes => {
    const saldo = mes.receitas - mes.despesas;
    const cor = saldo >= 0 ? "#28a745" : "#dc3545";
    tendenciaHTML += `
      <div class="tendencia-mes">
        <div class="mes-nome">${mes.mes}</div>
        <div class="mes-valores">
          <span class="receita">+R$ ${mes.receitas.toFixed(0)}</span>
          <span class="despesa">-R$ ${mes.despesas.toFixed(0)}</span>
          <span class="saldo" style="color: ${cor}">R$ ${saldo.toFixed(0)}</span>
        </div>
      </div>
    `;
  });
  tendenciaHTML += "</div>";

  document.getElementById("tendencias").innerHTML = tendenciaHTML;
}

// Exportação de Dados
function exportarDados() {
  const dados = {
    transacoes,
    orcamento,
    metas,
    dataExportacao: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `dados-financeiros-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

function gerarRelatorio() {
  const relatorio = `
RELATÓRIO FINANCEIRO
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO GERAL:
- Total de Transações: ${transacoes.length}
- Saldo Atual: R$ ${transacoes.reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0).toFixed(2)}

CATEGORIAS MAIS GASTAS:
${Object.entries(transacoes.filter(t => t.tipo === "despesa").reduce((acc, t) => {
  acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
  return acc;
}, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, valor]) => `- ${getCategoriaNome(cat)}: R$ ${valor.toFixed(2)}`).join('\n')}

METAS:
${metas.map(meta => `- ${meta.nome}: R$ ${meta.valorAtual.toFixed(2)} / R$ ${meta.valor.toFixed(2)}`).join('\n')}
  `;

  const blob = new Blob([relatorio], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  inicializarOrcamento();
  atualizarListaMetas();
  atualizarStatusOrcamento();
});
