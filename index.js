const express = require('express');
const { Pool } = require('pg');
const { validarNovaLoja, validarNovoProduto } = require('./validacao');

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
    // Validar dados recebidos
    const validacao = validarNovaLoja(req.body);
    
    if (!validacao.valido) {
        return res.status(400).json({ sucesso: false, erro: validacao.erro });
    }
    
    const { nome_loja, responsavel_id, categoria_principal } = validacao.dados;
    
    try {
        // Verificar se a loja já existe
        const lojaExistente = await pool.query(
            'SELECT id FROM lojas WHERE nome_loja = $1',
            [nome_loja]
        );
        
        if (lojaExistente.rows.length > 0) {
            return res.status(409).json({ 
                sucesso: false, 
                erro: 'Uma loja com este nome já existe' 
            });
        }
        
        const novaLoja = await pool.query(
            `INSERT INTO lojas (nome_loja, responsavel_id, categoria_principal) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nome_loja, responsavel_id, categoria_principal]
        );
        
        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Loja criada com sucesso! 🎉',
            loja: novaLoja.rows[0] 
        });
    } catch (erro) {
        console.error('Erro ao criar loja:', erro);
        res.status(500).json({ 
            sucesso: false, 
            erro: 'Erro ao criar loja. Tente novamente mais tarde.' 
        });
    }
});

// 📦 ROTA: CADASTRAR UM NOVO PRODUTO
app.post('/api/produtos', async (req, res) => {
    // Validar dados recebidos
    const validacao = validarNovoProduto(req.body);
    
    if (!validacao.valido) {
        return res.status(400).json({ sucesso: false, erro: validacao.erro });
    }
    
    const { loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria } = validacao.dados;
    
    try {
        // Verificar se a loja existe
        const lojaExiste = await pool.query(
            'SELECT id FROM lojas WHERE id = $1',
            [loja_id]
        );
        
        if (lojaExiste.rows.length === 0) {
            return res.status(404).json({ 
                sucesso: false, 
                erro: 'Loja não encontrada' 
            });
        }
        
        // Verificar se o produto já existe na loja
        const produtoExistente = await pool.query(
            'SELECT id FROM produtos WHERE nome_produto = $1 AND loja_id = $2',
            [nome_produto, loja_id]
        );
        
        if (produtoExistente.rows.length > 0) {
            return res.status(409).json({ 
                sucesso: false, 
                erro: 'Este produto já existe nesta loja' 
            });
        }
        
        const novoProduto = await pool.query(
            `INSERT INTO produtos (loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [loja_id, nome_produto, descricao, preco, estoque, imagem_url, categoria]
        );
        
        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Produto cadastrado com sucesso! 📦',
            produto: novoProduto.rows[0] 
        });
    } catch (erro) {
        console.error('Erro ao criar produto:', erro);
        res.status(500).json({ 
            sucesso: false, 
            erro: 'Erro ao cadastrar produto. Tente novamente mais tarde.' 
        });
    }
});

// 🛍️ ROTA: BUSCAR TODOS OS PRODUTOS (VITRINE DO APP)
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await pool.query(
            `SELECT p.*, l.nome_loja 
             FROM produtos p 
             JOIN lojas l ON p.loja_id = l.id 
             WHERE p.estoque > 0
             ORDER BY p.id DESC`
        );
        
        res.status(200).json({ 
            sucesso: true,
            total: produtos.rows.length,
            produtos: produtos.rows 
        });
    } catch (erro) {
        console.error('Erro ao buscar produtos:', erro);
        res.status(500).json({ 
            sucesso: false, 
            erro: 'Erro ao buscar produtos' 
        });
    }
});

// 🏪 ROTA: BUSCAR TODAS AS LOJAS
app.get('/api/lojas', async (req, res) => {
    try {
        const lojas = await pool.query(
            'SELECT * FROM lojas ORDER BY id DESC'
        );
        
        res.status(200).json({ 
            sucesso: true,
            total: lojas.rows.length,
            lojas: lojas.rows 
        });
    } catch (erro) {
        console.error('Erro ao buscar lojas:', erro);
        res.status(500).json({ 
            sucesso: false, 
            erro: 'Erro ao buscar lojas' 
        });
    }
});

// 🏥 ROTA: TESTE DE SAÚDE DO SERVIDOR
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        sucesso: true, 
        mensagem: 'Servidor ativo e funcionando! 🚀' 
    });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({ 
        sucesso: false, 
        erro: 'Rota não encontrada' 
    });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
