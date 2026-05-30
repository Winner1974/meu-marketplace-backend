// Script de teste para registar a primeira loja no teu servidor do Render
const urlDoServidor = 'https://meu-marketplace-backend.onrender.com/lojas';

// Dados da loja de teste que vamos enviar para a base de dados
const novaLoja = {
  nome: "Império da Tecnologia",
  nicho: "Tecnologia"
};

async function testarRegistoDeLoja() {
  console.log('⏳ A tentar enviar os dados para o servidor...');
  
  try {
    const resposta = await fetch(urlDoServidor, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novaLoja)
    });

    const dadosRecebidos = await resposta.json();

    if (resposta.ok) {
      console.log('🎉 SUCESSO! A tua loja foi guardada na base de dados:');
      console.log(dadosRecebidos);
    } else {
      console.log('⚠️ O servidor respondeu com um erro:', dadosRecebidos.error);
    }

  } catch (erro) {
    console.error('❌ Erro de ligação com o servidor Render:', erro.message);
  }
}

// Executar o teste
testarRegistoDeLoja();
