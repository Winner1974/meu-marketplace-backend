const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

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
    console.error('❌ Erro ao criar as tabelas no banco de dados:', erro);
  }
}

iniciarBancoDeDados();

app.get('/', (req, res) => {
  res.send('Servidor do Marketplace Ativo e Tabelas Prontas! 🚀');
});

app.get('/lojas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM lojas ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar lojas' });
  }
});

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
