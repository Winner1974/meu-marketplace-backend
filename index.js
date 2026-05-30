async function iniciarBancoDeDados() {
  try {
    // Teste de conexão simples
    await pool.query('SELECT NOW()');
    console.log('✅ Ligação ao banco de dados OK!');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        nicho VARCHAR(50) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "lojas" verificada.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
        nome VARCHAR(150) NOT NULL,
        preco NUMERIC(10, 2) NOT NULL,
        descricao TEXT,
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "produtos" verificada.');

  } catch (erro) {
    console.error('❌ ERRO CRÍTICO NO BANCO DE DADOS:', erro.message);
  }
}
