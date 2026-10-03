const test = require('node:test');
const assert = require('node:assert/strict');
const { Estoque } = require('../src/estoque');

const novoEstoque = () =>
  new Estoque([{ codigoProduto: 101, descricaoProduto: 'Caneta Azul', estoque: 150 }]);

test('entrada soma ao estoque e retorna o saldo final', () => {
  const m = novoEstoque().movimentar({
    codigoProduto: 101, tipo: 'entrada', quantidade: 50, descricao: 'Compra',
  });
  assert.equal(m.estoqueFinal, 200);
  assert.equal(m.descricao, 'Compra');
});

test('saída subtrai do estoque', () => {
  const m = novoEstoque().movimentar({
    codigoProduto: 101, tipo: 'saida', quantidade: 30, descricao: 'Venda',
  });
  assert.equal(m.estoqueFinal, 120);
});

test('cada movimentação recebe um id único', () => {
  const e = novoEstoque();
  const dados = { codigoProduto: 101, tipo: 'entrada', quantidade: 1, descricao: 'x' };
  const ids = [e.movimentar(dados).id, e.movimentar(dados).id, e.movimentar(dados).id];
  assert.equal(new Set(ids).size, 3);
});

test('não permite saída maior que o estoque', () => {
  const e = novoEstoque();
  assert.throws(
    () => e.movimentar({ codigoProduto: 101, tipo: 'saida', quantidade: 151, descricao: 'Venda' }),
    /insuficiente/
  );
  assert.equal(e.consultar(101).estoque, 150);
});

test('valida produto, tipo, quantidade e descrição', () => {
  const e = novoEstoque();
  const base = { codigoProduto: 101, tipo: 'entrada', quantidade: 1, descricao: 'x' };
  assert.throws(() => e.movimentar({ ...base, codigoProduto: 999 }), /não encontrado/);
  assert.throws(() => e.movimentar({ ...base, tipo: 'troca' }), /Tipo inválido/);
  assert.throws(() => e.movimentar({ ...base, quantidade: 0 }), /Quantidade/);
  assert.throws(() => e.movimentar({ ...base, quantidade: 1.5 }), /Quantidade/);
  assert.throws(() => e.movimentar({ ...base, descricao: ' ' }), /Descrição/);
});

test('não altera o array original de produtos', () => {
  const produtos = [{ codigoProduto: 101, descricaoProduto: 'Caneta Azul', estoque: 150 }];
  new Estoque(produtos).movimentar({ codigoProduto: 101, tipo: 'saida', quantidade: 10, descricao: 'x' });
  assert.equal(produtos[0].estoque, 150);
});