const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularComissaoVenda, calcularComissoes } = require('../src/comissao');

test('venda abaixo de R$ 100 não gera comissão', () => {
  assert.equal(calcularComissaoVenda(99.99), 0);
  assert.equal(calcularComissaoVenda(0), 0);
});

test('venda de R$ 100 até R$ 499,99 gera 1%', () => {
  assert.equal(calcularComissaoVenda(100), 1);
  assert.equal(calcularComissaoVenda(250), 2.5);
  assert.equal(calcularComissaoVenda(499.99), 5);
});

test('venda a partir de R$ 500 gera 5%', () => {
  assert.equal(calcularComissaoVenda(500), 25);
  assert.equal(calcularComissaoVenda(1000), 50);
});

test('agrupa por vendedor somando total e comissão', () => {
  const r = calcularComissoes([
    { vendedor: 'A', valor: 1000 }, // 50
    { vendedor: 'A', valor: 200 },  // 2
    { vendedor: 'A', valor: 50 },   // 0
    { vendedor: 'B', valor: 500 },  // 25
  ]);
  assert.deepEqual(r, [
    { vendedor: 'A', totalVendas: 1250, comissao: 52 },
    { vendedor: 'B', totalVendas: 500, comissao: 25 },
  ]);
});

test('rejeita venda inválida', () => {
  assert.throws(() => calcularComissoes([{ vendedor: '', valor: 10 }]), /vendedor/);
  assert.throws(() => calcularComissoes([{ vendedor: 'A', valor: -1 }]), /valor/);
  assert.throws(() => calcularComissoes('x'), /lista/);
});

test('calcula os dados do desafio (Ana Lima)', () => {
  const { vendas } = require('../data/vendas.json');
  const ana = calcularComissoes(vendas).find((r) => r.vendedor === 'Ana Lima');
  // 5% sobre 1000, 1100.50, 1250.75, 1400.20, 1550.90, 1650 e 1% sobre 420.90, 315.40
  assert.equal(ana.comissao, 404.99);
});