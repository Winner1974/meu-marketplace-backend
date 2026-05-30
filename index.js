const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexão automática e segura com a base de dados do Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 🏪 ROTA: CADASTRAR UMA NOVA LOJA
app.post('/api/lojas', async (req, res) => {
    const { nome_loja, responsavel_id, categoria_principal } = req.body;
    try {
        const novaLoja = await pool.query(
            `INSERT INTO lojas (nome_loja, responsavel_id, categoria_principal) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nome_loja, responsavel_id, categoria_principal]
        );
        res.status(201).json({ sucesso: true, loja: novaLoja.rows[0] });
    } catch (erro) {
        res.status(500).json({ sucesso: false, erro: erro.message });
    }
});

// 📦 ROTA: CADASTRAR UM NOVO PRODUTO
app.post('/api/produtos', async (req, res) => {
    const { loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria } = req.body;
    try {
        const novoProduto = await pool.query(
            `INSERT INTO produtos (loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria]
        );
        res.status(201).json({ sucesso: true, produto: novoProduto.rows[0] });
    } catch (erro) {
        res.status(500).json({ sucesso: false, erro: erro.message });
    }
});

// 🛍️ ROTA: BUSCAR TODOS OS PRODUTOS (VITRINE DO APP)
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await pool.query(
            `SELECT p.*, l.nome_loja 
             FROM produtos p 
             JOIN lojas l ON p.loja_id = l.id 
             WHERE p.estoque > 0`
        );
        res.status(200).json(produtos.rows);
    } catch (erro) {
        res.status(500).json({ sucesso: false, erro: erro.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
