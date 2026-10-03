// Faixas em centavos, da maior para a menor (usamos centavos inteiros
// para evitar erros de ponto flutuante).
const FAIXAS = [
  { minimo: 50000, percentual: 5 }, // a partir de R$ 500,00 -> 5%
  { minimo: 10000, percentual: 1 }, // a partir de R$ 100,00 (e abaixo de 500) -> 1%
];                                  // abaixo de R$ 100,00 -> sem comissão

const paraCentavos = (valor) => Math.round(valor * 100);

function validarVenda(venda) {
  if (!venda || typeof venda.vendedor !== 'string' || venda.vendedor.trim() === '') {
    throw new Error('Venda inválida: vendedor é obrigatório.');
  }
  if (typeof venda.valor !== 'number' || !Number.isFinite(venda.valor) || venda.valor < 0) {
    throw new Error(`Venda inválida para ${venda.vendedor}: valor deve ser um número >= 0.`);
  }
}

function comissaoDaVendaEmCentavos(valor) {
  const centavos = paraCentavos(valor);
  const faixa = FAIXAS.find((f) => centavos >= f.minimo);
  return faixa ? Math.round((centavos * faixa.percentual) / 100) : 0;
}

/**em reais. */
function calcularComissaoVenda(valor) {
  return comissaoDaVendaEmCentavos(valor) / 100;
}

/**
 * Agrupa as vendas por vendedor e calcula a comissão de cada um.
 * @returns {{vendedor: string, totalVendas: number, comissao: number}[]}
 */
function calcularComissoes(vendas) {
  if (!Array.isArray(vendas)) throw new Error('"vendas" deve ser uma lista.');

  const porVendedor = new Map();
  for (const venda of vendas) {
    validarVenda(venda);
    const acc = porVendedor.get(venda.vendedor) ?? { total: 0, comissao: 0 };
    acc.total += paraCentavos(venda.valor);
    acc.comissao += comissaoDaVendaEmCentavos(venda.valor);
    porVendedor.set(venda.vendedor, acc);
  }

  return [...porVendedor].map(([vendedor, { total, comissao }]) => ({
    vendedor,
    totalVendas: total / 100,
    comissao: comissao / 100,
  }));
}

module.exports = { calcularComissaoVenda, calcularComissoes };