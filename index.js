// Dentro da função executarAutoTeste() no teu index.js:
async function executarAutoTeste() {
  try {
    const checar = await pool.query("SELECT * FROM lojas WHERE nome = 'Império da Tecnologia'");
    if (checar.rows.length === 0) {
      console.log('⏳ Auto-teste: A registar a loja de teste...');
      await pool.query("INSERT INTO lojas (nome, nicho) VALUES ('Império da Tecnologia', 'Tecnologia')");
      console.log('🎉 SUCESSO! Loja "Império da Tecnologia" criada!');
    }
  } catch (err) {
    console.error('❌ Erro no auto-teste:', err.message);
  }
}
