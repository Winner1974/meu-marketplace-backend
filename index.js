const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

// Ligação com o Banco de Dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

// Criar tabelas se não existirem
async function iniciarBancoDeDados() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        nicho VARCHAR(50) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela de lojas verificada/criada.');

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
    console.error('❌ Erro ao criar as tabelas:', erro);
  }
}
iniciarBancoDeDados();

// --- ROTAS DO MARKETPLACE ---

// Rota Inicial
app.get('/', (req, res) => {
  res.send('Servidor do Marketplace Ativo e Pronto para Receber Dados! 🚀');
});

// 1. REGISTAR UMA NOVA LOJA (POST)
app.post('/lojas', async (req, res) => {
  const { nome, nicho } = req.body;
  
  if (!nome || !nicho) {
    return res.status(400).json({ error: 'Nome e nicho são obrigatórios!' });
  }

  try {
    const query = 'INSERT INTO lojas (nome, nicho) VALUES ($1, $2) RETURNING *';
    const resultado = await pool.query(query, [nome, nicho]);
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao registar a loja no banco de dados' });
  }
});

// 2. LISTAR TODAS AS LOJAS (GET)
app.get('/lojas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM lojas ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar lojas' });
  }
});

// 3. CADASTRAR UM NOVO PRODUTO (POST)
app.post('/produtos', async (req, res) => {
  const { loja_id, nome, preco, descricao } = req.body;

  if (!loja_id || !nome || !preco) {
    return res.status(400).json({ error: 'Loja_id, nome e preco são obrigatórios!' });
  }

  try {
    const query = 'INSERT INTO produtos (loja_id, nome, preco, descricao) VALUES ($1, $2, $3, $4) RETURNING *';
    const resultado = await pool.query(query, [loja_id, nome, preco, descricao]);
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao cadastrar o produto' });
  }
});

// 4. LISTAR TODOS OS PRODUTOS (GET)
app.get('/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor a rodar na porta ${port}`);
});
