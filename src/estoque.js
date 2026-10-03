const TIPOS = { ENTRADA: 'entrada', SAIDA: 'saida' };

class Estoque {
  /** @param {{codigoProduto:number, descricaoProduto:string, estoque:number}[]} produtos */
  constructor(produtos) {
    this.produtos = new Map(produtos.map((p) => [p.codigoProduto, { ...p }]));
    this.movimentacoes = [];
    this.proximoId = 1;
  }

  consultar(codigoProduto) {
    const produto = this.produtos.get(codigoProduto);
    if (!produto) throw new Error(`Produto ${codigoProduto} não encontrado.`);
    return produto;
  }

  /**
   * Registra uma entrada ou saída e retorna a movimentação com o estoque final.
   */
  movimentar({ codigoProduto, tipo, quantidade, descricao }) {
    const produto = this.consultar(codigoProduto);

    if (!Object.values(TIPOS).includes(tipo)) {
      throw new Error('Tipo inválido: use "entrada" ou "saida".');
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error('Quantidade deve ser um número inteiro maior que zero.');
    }
    if (typeof descricao !== 'string' || descricao.trim() === '') {
      throw new Error('Descrição da movimentação é obrigatória.');
    }
    if (tipo === TIPOS.SAIDA && quantidade > produto.estoque) {
      throw new Error(
        `Estoque insuficiente: ${produto.descricaoProduto} tem ${produto.estoque}, saída de ${quantidade}.`
      );
    }

    produto.estoque += tipo === TIPOS.ENTRADA ? quantidade : -quantidade;

    const movimentacao = {
      id: this.proximoId++,
      codigoProduto,
      descricaoProduto: produto.descricaoProduto,
      tipo,
      quantidade,
      descricao: descricao.trim(),
      estoqueFinal: produto.estoque,
    };
    this.movimentacoes.push(movimentacao);
    return movimentacao;
  }
}

module.exports = { Estoque, TIPOS };