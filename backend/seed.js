/* ==========================================================
   Popula o arquivo de dados com os 6 filmes de exemplo da Parte 1.
   Uso: npm run seed   (ATENÇÃO: substitui o conteúdo atual)
   ========================================================== */

import { ARQUIVO_DADOS } from './config.js';
import { criarRepositorio } from './repositorio.js';
import { FILMES_EXEMPLO } from './filmes-exemplo.js';

const repositorio = criarRepositorio(ARQUIVO_DADOS);

try {
    const total = await repositorio.substituirTudo(FILMES_EXEMPLO);
    console.log(`${total} filmes de exemplo gravados em ${ARQUIVO_DADOS}`);
} catch (erro) {
    console.error('Falha ao popular o arquivo de dados:', erro.message);
    process.exitCode = 1;
}
