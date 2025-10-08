// ===== SISTEMA DE NOTAS FISCAIS =====

// Array para armazenar as notas fiscais
let notasFiscais = JSON.parse(localStorage.getItem("notasFiscais")) || [];

// Função para salvar notas fiscais no localStorage
function salvarNotasFiscais() {
  localStorage.setItem("notasFiscais", JSON.stringify(notasFiscais));
}

// Função para adicionar nova nota fiscal
function adicionarNotaFiscal(dadosNota) {
  const novaNota = {
    id: Date.now(),
    numero: dadosNota.numero,
    serie: dadosNota.serie,
    dataEmissao: dadosNota.dataEmissao,
    dataVencimento: dadosNota.dataVencimento,
    fornecedor: dadosNota.fornecedor,
    cnpjCpf: dadosNota.cnpjCpf,
    valorTotal: parseFloat(dadosNota.valorTotal),
    tipo: dadosNota.tipo,
    categoria: dadosNota.categoria,
    status: dadosNota.status,
    observacoes: dadosNota.observacoes || '',
    dataCadastro: new Date().toISOString()
  };

  notasFiscais.push(novaNota);
  salvarNotasFiscais();
  atualizarListaNotasFiscais();
  
  return novaNota;
}

// Função para atualizar lista de notas fiscais
function atualizarListaNotasFiscais() {
  const container = document.getElementById("lista-notas-fiscais");
  if (!container) return;
  
  container.innerHTML = "";

  let totalValor = 0;
  let totalNotas = notasFiscais.length;
  let notasVencidas = 0;

  notasFiscais.forEach(nota => {
    totalValor += nota.valorTotal;
    
    // Verificar se está vencida
    const hoje = new Date();
    const dataVencimento = new Date(nota.dataVencimento);
    if (dataVencimento < hoje && nota.status !== 'paga' && nota.status !== 'cancelada') {
      notasVencidas++;
    }

    const notaElement = criarElementoNotaFiscal(nota);
    container.appendChild(notaElement);
  });

  // Atualizar estatísticas
  document.getElementById("total-notas").textContent = `Total: ${totalNotas} notas fiscais`;
  document.getElementById("valor-total-notas").textContent = `Valor total: R$ ${totalValor.toFixed(2)}`;
  document.getElementById("notas-vencidas").textContent = `Vencidas: ${notasVencidas}`;
}

// Função para criar elemento HTML da nota fiscal
function criarElementoNotaFiscal(nota) {
  const div = document.createElement("div");
  div.className = "nota-fiscal-card";
  
  const hoje = new Date();
  const dataVencimento = new Date(nota.dataVencimento);
  const diasParaVencimento = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
  
  let statusClass = "";
  let statusIcon = "";
  let statusText = "";
  
  switch(nota.status) {
    case 'pendente':
      statusClass = "status-pendente";
      statusIcon = "⏳";
      statusText = diasParaVencimento < 0 ? "Vencida" : `${diasParaVencimento} dias`;
      break;
    case 'paga':
      statusClass = "status-paga";
      statusIcon = "✅";
      statusText = "Paga";
      break;
    case 'vencida':
      statusClass = "status-vencida";
      statusIcon = "❌";
      statusText = "Vencida";
      break;
    case 'cancelada':
      statusClass = "status-cancelada";
      statusIcon = "🚫";
      statusText = "Cancelada";
      break;
  }

  div.innerHTML = `
    <div class="nota-header">
      <div class="nota-info-principal">
        <h4>Nota ${nota.numero}/${nota.serie}</h4>
        <span class="nota-fornecedor">${nota.fornecedor}</span>
      </div>
      <div class="nota-valor">
        <span class="valor">R$ ${nota.valorTotal.toFixed(2)}</span>
        <span class="status ${statusClass}">
          ${statusIcon} ${statusText}
        </span>
      </div>
    </div>
    
    <div class="nota-detalhes">
      <div class="detalhe-item">
        <i class="fas fa-calendar"></i>
        <span>Emissão: ${new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="detalhe-item">
        <i class="fas fa-calendar-check"></i>
        <span>Vencimento: ${new Date(nota.dataVencimento).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="detalhe-item">
        <i class="fas fa-exchange-alt"></i>
        <span>Tipo: ${nota.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span>
      </div>
      <div class="detalhe-item">
        <i class="fas fa-tags"></i>
        <span>${getCategoriaNome(nota.categoria)}</span>
      </div>
    </div>
    
    ${nota.observacoes ? `
      <div class="nota-observacoes">
        <i class="fas fa-sticky-note"></i>
        <span>${nota.observacoes}</span>
      </div>
    ` : ''}
    
    <div class="nota-actions">
      <button onclick="editarNotaFiscal(${nota.id})" class="btn-edit">
        <i class="fas fa-edit"></i> Editar
      </button>
      <button onclick="alterarStatusNota(${nota.id})" class="btn-status">
        <i class="fas fa-check"></i> Status
      </button>
      <button onclick="removerNotaFiscal(${nota.id})" class="btn-remove">
        <i class="fas fa-trash"></i> Remover
      </button>
    </div>
  `;
  
  return div;
}

// Função para editar nota fiscal
function editarNotaFiscal(id) {
  const nota = notasFiscais.find(n => n.id === id);
  if (!nota) return;
  
  // Preencher formulário com dados da nota
  document.getElementById("numero-nota").value = nota.numero;
  document.getElementById("serie-nota").value = nota.serie;
  document.getElementById("data-emissao").value = nota.dataEmissao;
  document.getElementById("data-vencimento").value = nota.dataVencimento;
  document.getElementById("fornecedor").value = nota.fornecedor;
  document.getElementById("cnpj-cpf").value = nota.cnpjCpf;
  document.getElementById("valor-total").value = nota.valorTotal;
  document.getElementById("tipo-nota").value = nota.tipo;
  document.getElementById("categoria-nota").value = nota.categoria;
  document.getElementById("status-nota").value = nota.status;
  document.getElementById("observacoes").value = nota.observacoes;
  
  // Remover nota da lista (será adicionada novamente ao salvar)
  notasFiscais = notasFiscais.filter(n => n.id !== id);
  salvarNotasFiscais();
  
  // Scroll para o formulário
  document.getElementById("form-nota-fiscal").scrollIntoView({ behavior: 'smooth' });
}

// Função para alterar status da nota
function alterarStatusNota(id) {
  const nota = notasFiscais.find(n => n.id === id);
  if (!nota) return;
  
  const statusAtual = nota.status;
  let novoStatus = "";
  
  switch(statusAtual) {
    case 'pendente':
      novoStatus = 'paga';
      break;
    case 'paga':
      novoStatus = 'cancelada';
      break;
    case 'cancelada':
      novoStatus = 'pendente';
      break;
    default:
      novoStatus = 'pendente';
  }
  
  nota.status = novoStatus;
  salvarNotasFiscais();
  atualizarListaNotasFiscais();
}

// Função para remover nota fiscal
async function removerNotaFiscal(id) {
  const confirmed = await confirmDelete('esta nota fiscal');
  if (confirmed) {
    notasFiscais = notasFiscais.filter(n => n.id !== id);
    salvarNotasFiscais();
    atualizarListaNotasFiscais();
  }
}

// Função para aplicar filtros
function aplicarFiltrosNotas() {
  const filtroStatus = document.getElementById("filtro-status-notas").value;
  const filtroTipo = document.getElementById("filtro-tipo-notas").value;
  
  let notasFiltradas = notasFiscais;
  
  if (filtroStatus) {
    notasFiltradas = notasFiltradas.filter(n => n.status === filtroStatus);
  }
  
  if (filtroTipo) {
    notasFiltradas = notasFiltradas.filter(n => n.tipo === filtroTipo);
  }
  
  exibirNotasFiltradas(notasFiltradas);
}

// Função para exibir notas filtradas
function exibirNotasFiltradas(notasFiltradas) {
  const container = document.getElementById("lista-notas-fiscais");
  container.innerHTML = "";

  let totalValor = 0;
  let notasVencidas = 0;

  notasFiltradas.forEach(nota => {
    totalValor += nota.valorTotal;
    
    const hoje = new Date();
    const dataVencimento = new Date(nota.dataVencimento);
    if (dataVencimento < hoje && nota.status !== 'paga' && nota.status !== 'cancelada') {
      notasVencidas++;
    }

    const notaElement = criarElementoNotaFiscal(nota);
    container.appendChild(notaElement);
  });

  document.getElementById("total-notas").textContent = `Total: ${notasFiltradas.length} notas fiscais`;
  document.getElementById("valor-total-notas").textContent = `Valor total: R$ ${totalValor.toFixed(2)}`;
  document.getElementById("notas-vencidas").textContent = `Vencidas: ${notasVencidas}`;
}

// Função para limpar filtros
function limparFiltrosNotas() {
  document.getElementById("filtro-status-notas").value = "";
  document.getElementById("filtro-tipo-notas").value = "";
  atualizarListaNotasFiscais();
}

// Event listener para formulário
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("form-nota-fiscal");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const dadosNota = {
        numero: document.getElementById("numero-nota").value,
        serie: document.getElementById("serie-nota").value,
        dataEmissao: document.getElementById("data-emissao").value,
        dataVencimento: document.getElementById("data-vencimento").value,
        fornecedor: document.getElementById("fornecedor").value,
        cnpjCpf: document.getElementById("cnpj-cpf").value,
        valorTotal: document.getElementById("valor-total").value,
        tipo: document.getElementById("tipo-nota").value,
        categoria: document.getElementById("categoria-nota").value,
        status: document.getElementById("status-nota").value,
        observacoes: document.getElementById("observacoes").value
      };
      
      adicionarNotaFiscal(dadosNota);
      
      // Limpar formulário
      e.target.reset();
      
      // Mostrar mensagem de sucesso
      alert("Nota fiscal cadastrada com sucesso! 📋");
    });
  }
});
