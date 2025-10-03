let grafico;

function atualizarGrafico() {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const saldoPorMes = new Array(12).fill(0);

  transacoes.forEach(t => {
    const mes = new Date(t.data).getMonth();
    saldoPorMes[mes] += t.tipo === "receita" ? t.valor : -t.valor;
  });

  if (grafico) grafico.destroy();

  const ctx = document.getElementById("grafico-saldo").getContext("2d");
  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [{
        label: "Saldo Mensal",
        data: saldoPorMes,
        borderColor: "blue",
        fill: false
      }]
    }
  });
}