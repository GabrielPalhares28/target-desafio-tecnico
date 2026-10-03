#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');

const { calcularComissoes } = require('./comissao');
const { Estoque } = require('./estoque');
const { calcularJuros } = require('./juros');
const { formatarMoeda } = require('./formato');

const DATA_DIR = path.join(__dirname, '..', 'data');
const lerJson = (arquivo) => JSON.parse(fs.readFileSync(arquivo, 'utf8'));

function comandoComissao(arquivo = path.join(DATA_DIR, 'vendas.json')) {
  const { vendas } = lerJson(arquivo);
  for (const r of calcularComissoes(vendas)) {
    console.log(
      `${r.vendedor.padEnd(18)} vendas: ${formatarMoeda(r.totalVendas).padStart(14)}   comissão: ${formatarMoeda(r.comissao).padStart(12)}`
    );
  }
}

async function comandoEstoque(arquivo = path.join(DATA_DIR, 'estoque.json')) {
  const estoque = new Estoque(lerJson(arquivo).estoque);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('Produtos:');
  for (const p of estoque.produtos.values()) {
    console.log(`  ${p.codigoProduto} - ${p.descricaoProduto} (${p.estoque})`);
  }
  console.log('\nEnter vazio no código encerra.\n');

  while (true) {
    const codigo = (await rl.question('Código do produto: ')).trim();
    if (!codigo) break;
    try {
      const tipo = (await rl.question('Tipo (entrada/saida): ')).trim().toLowerCase();
      const quantidade = Number((await rl.question('Quantidade: ')).trim());
      const descricao = await rl.question('Descrição da movimentação: ');
      const m = estoque.movimentar({ codigoProduto: Number(codigo), tipo, quantidade, descricao });
      console.log(`\nMovimentação #${m.id} registrada (${m.descricao}).`);
      console.log(`Estoque final de ${m.descricaoProduto}: ${m.estoqueFinal}\n`);
    } catch (erro) {
      console.log(`\nErro: ${erro.message}\n`);
    }
  }
  rl.close();
}

function comandoJuros(valor, vencimento) {
  if (!valor || !vencimento) throw new Error('Uso: juros <valor> <vencimento>');
  const numero = Number(String(valor).replace(',', '.'));
  const r = calcularJuros(numero, vencimento);
  console.log(`Dias de atraso: ${r.diasAtraso}`);
  console.log(`Juros: ${formatarMoeda(r.juros)}`);
  console.log(`Total a pagar: ${formatarMoeda(r.total)}`);
}

async function main() {
  const [comando, ...args] = process.argv.slice(2);
  switch (comando) {
    case 'comissao': return comandoComissao(...args);
    case 'estoque': return comandoEstoque(...args);
    case 'juros': return comandoJuros(...args);
    default:
      console.log('Uso:\n  node src/cli.js comissao [arquivo.json]\n  node src/cli.js estoque [arquivo.json]\n  node src/cli.js juros <valor> <vencimento>');
  }
}

main().catch((erro) => {
  console.error(`Erro: ${erro.message}`);
  process.exitCode = 1;
});