let meta = parseFloat(localStorage.getItem("meta")) || 0;

function definirMeta() {
  meta = parseFloat(document.getElementById("meta-valor").value);
  localStorage.setItem("meta", meta);
  verificarMeta();
}

function verificarMeta() {
  const saldoAtual = transacoes.reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);
  const status = saldoAtual >= meta ? "Meta alcançada! 🎉" : `Faltam R$ ${(meta - saldoAtual).toFixed(2)} para atingir a meta.`;
  document.getElementById("status-meta").textContent = status;
}