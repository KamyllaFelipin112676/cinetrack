import { PORTA, ARQUIVO_DADOS } from './config.js';
import { criarRepositorio } from './repositorio.js';
import { criarApp } from './app.js';

const repositorio = criarRepositorio(ARQUIVO_DADOS);
const app = criarApp({ repositorio });

const servidor = app.listen(PORTA, () => {
    console.log(`CineTrack API em http://localhost:${PORTA}`);
    console.log(`Dados em ${ARQUIVO_DADOS}`);
});

servidor.on('error', (erro) => {
    if (erro.code === 'EADDRINUSE') {
        console.error(`A porta ${PORTA} já está em uso. Altere PORT no arquivo .env.`);
        process.exit(1);
    }
    throw erro;
});

repositorio.listar()
    .then((filmes) => {
        if (filmes.length === 0) {
            console.log('A lista está vazia. Rode "npm run seed" para carregar os 6 filmes de exemplo.');
        }
    })
    .catch((erro) => console.error(erro.message));
