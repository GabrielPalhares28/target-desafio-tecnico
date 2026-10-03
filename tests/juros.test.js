const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularJuros, diasDeAtraso, parseData } = require('../src/juros');

const hoje = new Date(2026, 9, 3); // 03/10/2026 (horário local)

test('conta dias de atraso', () => {
  assert.equal(diasDeAtraso('2026-09-30', hoje), 3);
  assert.equal(diasDeAtraso('30/09/2026', hoje), 3);
});

test('sem atraso (vence hoje ou no futuro) não há juros', () => {
  assert.equal(calcularJuros(1000, '2026-10-03', hoje).juros, 0);
  assert.deepEqual(calcularJuros(1000, '2026-12-01', hoje), { diasAtraso: 0, juros: 0, total: 1000 });
});

test('juros simples de 2,5% ao dia', () => {
  // 4 dias * 2,5% de 1000 = 100
  assert.deepEqual(calcularJuros(1000, '2026-09-29', hoje), { diasAtraso: 4, juros: 100, total: 1100 });
  // 1 dia de atraso de R$ 199,99 -> 4,99975 -> 5,00
  assert.equal(calcularJuros(199.99, '2026-10-02', hoje).juros, 5);
});

test('rejeita datas e valores inválidos', () => {
  assert.throws(() => parseData('2026-02-30'), /Data inválida/);
  assert.throws(() => parseData('abc'), /Data inválida/);
  assert.throws(() => calcularJuros(0, '2026-10-01', hoje), /Valor/);
  assert.throws(() => calcularJuros('10', '2026-10-01', hoje), /Valor/);
});