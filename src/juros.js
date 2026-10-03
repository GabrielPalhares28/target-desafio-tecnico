const TAXA_DIARIA_PERCENTUAL = 2.5;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Aceita "AAAA-MM-DD" ou "DD/MM/AAAA" e devolve a data (UTC, meia-noite). */
function parseData(texto) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  const [ano, mes, dia] = iso ? iso.slice(1).map(Number)
    : br ? [Number(br[3]), Number(br[2]), Number(br[1])]
    : [];

  const data = ano ? new Date(Date.UTC(ano, mes - 1, dia)) : null;
  const valida = data && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
  if (!valida) throw new Error('Data inválida. Use AAAA-MM-DD ou DD/MM/AAAA.');
  return data;
}

function diasDeAtraso(vencimento, hoje = new Date()) {
  const inicioHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.floor((inicioHoje - parseData(vencimento).getTime()) / MS_POR_DIA);
  return Math.max(0, dias);
}

/**
 * Juros simples de 2,5% ao dia sobre o valor, por dia de atraso.
 * @returns {{diasAtraso:number, juros:number, total:number}}
 */
function calcularJuros(valor, vencimento, hoje = new Date()) {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
    throw new Error('Valor deve ser um número maior que zero.');
  }
  const dias = diasDeAtraso(vencimento, hoje);
  const centavos = Math.round(valor * 100);
  const jurosCentavos = Math.round((centavos * TAXA_DIARIA_PERCENTUAL * dias) / 100);

  return {
    diasAtraso: dias,
    juros: jurosCentavos / 100,
    total: (centavos + jurosCentavos) / 100,
  };
}

module.exports = { calcularJuros, diasDeAtraso, parseData, TAXA_DIARIA_PERCENTUAL };