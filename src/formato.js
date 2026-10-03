const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatarMoeda(valor) {
  return moeda.format(valor);
}

module.exports = { formatarMoeda };