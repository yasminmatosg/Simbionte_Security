// ======================================================
// Módulo de Criptografia - Projeto Simbionte
// Subgrupo D - Segurança e Regras
//
// Bibliotecas utilizadas:
// npm install bcrypt
// npm install dotenv (para leitura de variáveis de ambiente)
//
// Fluxo:
//
// Cadastro:
// Senha em texto -> gerarHashSenha() -> Hash -> Banco de Dados
//
// Login:
// Senha digitada + Hash do Banco -> verificarSenha() -> true/false
// ======================================================

require('dotenv').config();
const bcrypt = require('bcrypt');

// Define o custo de processamento do hash consumindo o valor do .env.
// Caso o .env falhe, mantém 10 como medida de segurança padrão.
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

/**
 * Gera o hash seguro da senha informada pelo usuário.
 *
 * @param {string} senhaTextoPlano
 * @returns {Promise<string>}
 */
async function gerarHashSenha(senhaTextoPlano) {
    try {
        const hash = await bcrypt.hash(senhaTextoPlano, saltRounds);
        return hash;
    } catch (erro) {
        console.error("Erro ao gerar hash da senha:", erro);
        throw erro;
    }
}

/**
 * Compara a senha digitada no login
 * com o hash armazenado no banco.
 *
 * Retorna:
 * true  -> senha correta
 * false -> senha incorreta
 *
 * @param {string} senhaTextoPlano
 * @param {string} senhaHasheada
 * @returns {Promise<boolean>}
 */
async function verificarSenha(senhaTextoPlano, senhaHasheada) {
    try {
        return await bcrypt.compare(
            senhaTextoPlano,
            senhaHasheada
        );
    } catch (erro) {
        console.error("Erro ao verificar a senha:", erro);
        throw erro;
    }
}

async function testarModulo() {

    console.log("\n========================================");
    console.log("TESTE DO MÓDULO DE CRIPTOGRAFIA");
    console.log("========================================\n");

    const senhaOriginal = "Simbionte2026!";

    console.log("Senha original:");
    console.log(senhaOriginal);

    console.log("\nGerando hash...");

    const hash = await gerarHashSenha(senhaOriginal);

    console.log("\nHash gerado:");
    console.log(hash);

    console.log("\nTestando senha correta...");

    const senhaCorreta = await verificarSenha(
        "Simbionte2026!",
        hash
    );

    console.log("Resultado:", senhaCorreta);

    console.log("\nTestando senha incorreta...");

    const senhaErrada = await verificarSenha(
        "senhaErrada123",
        hash
    );

    console.log("Resultado:", senhaErrada);

    console.log("\nFim dos testes.");
}

// Executa apenas quando este arquivo é chamado diretamente
if (require.main === module) {
    testarModulo().catch(console.error);
}

// ======================================================
// Exportação do módulo
// Será utilizado nas rotasde cadastro e login.
// ======================================================

module.exports = {
    gerarHashSenha,
    verificarSenha
};