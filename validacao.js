// 🛡️ FUNÇÕES DE VALIDAÇÃO E SANITIZAÇÃO

// Validar campos obrigatórios
function validarCamposObrigatorios(dados, campos) {
  const camposFaltantes = [];
  
  campos.forEach(campo => {
    if (!dados[campo] || dados[campo].toString().trim() === '') {
      camposFaltantes.push(campo);
    }
  });
  
  if (camposFaltantes.length > 0) {
    return {
      valido: false,
      erro: `Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`
    };
  }
  
  return { valido: true };
}

// Validar comprimento de strings
function validarComprimento(valor, minimo, maximo, nomeCampo) {
  const comprimento = valor.toString().trim().length;
  
  if (comprimento < minimo) {
    return {
      valido: false,
      erro: `${nomeCampo} deve ter no mínimo ${minimo} caracteres`
    };
  }
  
  if (comprimento > maximo) {
    return {
      valido: false,
      erro: `${nomeCampo} não pode exceder ${maximo} caracteres`
    };
  }
  
  return { valido: true };
}

// Validar preço
function validarPreco(preco) {
  const precoNum = parseFloat(preco);
  
  if (isNaN(precoNum)) {
    return { valido: false, erro: 'Preço deve ser um número válido' };
  }
  
  if (precoNum <= 0) {
    return { valido: false, erro: 'Preço deve ser maior que 0' };
  }
  
  if (precoNum > 999999.99) {
    return { valido: false, erro: 'Preço muito alto' };
  }
  
  return { valido: true, valor: precoNum };
}

// Validar estoque
function validarEstoque(estoque) {
  const estoqueNum = parseInt(estoque);
  
  if (isNaN(estoqueNum)) {
    return { valido: false, erro: 'Estoque deve ser um número inteiro' };
  }
  
  if (estoqueNum < 0) {
    return { valido: false, erro: 'Estoque não pode ser negativo' };
  }
  
  return { valido: true, valor: estoqueNum };
}

// Validar ID
function validarId(id) {
  const idNum = parseInt(id);
  
  if (isNaN(idNum) || idNum <= 0) {
    return { valido: false, erro: 'ID inválido' };
  }
  
  return { valido: true, valor: idNum };
}

// Validar URL de imagem
function validarUrlImagem(url) {
  if (!url) {
    return { valido: true, valor: null }; // URL é opcional
  }
  
  try {
    new URL(url);
    return { valido: true, valor: url };
  } catch {
    return { valido: false, erro: 'URL de imagem inválida' };
  }
}

// Sanitizar string (remover espaços extras)
function sanitizarString(texto) {
  return texto.toString().trim();
}

// VALIDAÇÃO ESPECÍFICA PARA LOJAS
function validarNovaLoja(dados) {
  // Campos obrigatórios
  const validacaoCampos = validarCamposObrigatorios(dados, ['nome_loja', 'responsavel_id', 'categoria_principal']);
  if (!validacaoCampos.valido) {
    return validacaoCampos;
  }
  
  // Validar nome da loja
  const validacaoNome = validarComprimento(dados.nome_loja, 3, 100, 'Nome da loja');
  if (!validacaoNome.valido) {
    return validacaoNome;
  }
  
  // Validar responsável ID
  const validacaoResponsavel = validarId(dados.responsavel_id);
  if (!validacaoResponsavel.valido) {
    return validacaoResponsavel;
  }
  
  // Validar categoria
  const validacaoCategoria = validarComprimento(dados.categoria_principal, 3, 50, 'Categoria');
  if (!validacaoCategoria.valido) {
    return validacaoCategoria;
  }
  
  return {
    valido: true,
    dados: {
      nome_loja: sanitizarString(dados.nome_loja),
      responsavel_id: validacaoResponsavel.valor,
      categoria_principal: sanitizarString(dados.categoria_principal)
    }
  };
}

// VALIDAÇÃO ESPECÍFICA PARA PRODUTOS
function validarNovoProduto(dados) {
  // Campos obrigatórios
  const validacaoCampos = validarCamposObrigatorios(dados, ['loja_id', 'nome_produto', 'preco', 'categoria']);
  if (!validacaoCampos.valido) {
    return validacaoCampos;
  }
  
  // Validar loja ID
  const validacaoLoja = validarId(dados.loja_id);
  if (!validacaoLoja.valido) {
    return validacaoLoja;
  }
  
  // Validar nome do produto
  const validacaoNome = validarComprimento(dados.nome_produto, 3, 150, 'Nome do produto');
  if (!validacaoNome.valido) {
    return validacaoNome;
  }
  
  // Validar preço
  const validacaoPreco = validarPreco(dados.preco);
  if (!validacaoPreco.valido) {
    return validacaoPreco;
  }
  
  // Validar categoria
  const validacaoCategoria = validarComprimento(dados.categoria, 3, 50, 'Categoria');
  if (!validacaoCategoria.valido) {
    return validacaoCategoria;
  }
  
  // Validar descrição (opcional)
  const descricao = dados.descricao ? sanitizarString(dados.descricao) : null;
  if (descricao && descricao.length > 1000) {
    return { valido: false, erro: 'Descrição não pode exceder 1000 caracteres' };
  }
  
  // Validar estoque (opcional, padrão 0)
  const estoque = dados.estoque ? validarEstoque(dados.estoque) : { valido: true, valor: 0 };
  if (!estoque.valido) {
    return estoque;
  }
  
  // Validar URL de imagem (opcional)
  const validacaoImagem = validarUrlImagem(dados.imagem_url);
  if (!validacaoImagem.valido) {
    return validacaoImagem;
  }
  
  return {
    valido: true,
    dados: {
      loja_id: validacaoLoja.valor,
      nome_produto: sanitizarString(dados.nome_produto),
      descricao: descricao,
      preco: validacaoPreco.valor,
      estoque: estoque.valor,
      imagem_url: validacaoImagem.valor,
      categoria: sanitizarString(dados.categoria)
    }
  };
}

module.exports = {
  validarNovaLoja,
  validarNovoProduto,
  validarComprimento,
  validarPreco,
  validarEstoque,
  validarId,
  sanitizarString
};
