const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

// Ligação segura à base de dados do Render usando a variável que configurámos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

// Função que cria as tabelas automaticamente se elas não existirem
async function iniciarBancoDeDados() {
  try {
    // 1. Criar Tabela de Lojas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        nicho VARCHAR(50) NOT NULL, -- Tecnologia ou Moda
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela de lojas verificada/criada.');

    // 2. Criar Tabela de Produtos (Ligada a uma loja)
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
    console.log('✅ Tabela de produtos verificada/criada.');

  } catch (erro) {
    console.error('❌ Erro ao criar as tabelas no banco de dados:', erro);
  }
}

// Ativar a criação das tabelas ao iniciar
iniciarBancoDeDados();

// --- ROTAS DO NOSSO MARKETPLACE ---

// Rota inicial de teste
app.get('/', (req, res) => {
  res.send('Servidor do Marketplace Ativo e Tabelas Prontas! 🚀');
});

// Rota para listar todas as lojas
app.get('/lojas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM lojas ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar lojas' });
  }
});

// Rota para listar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor a rodar perfeitamente na porta ${port}`);
});
