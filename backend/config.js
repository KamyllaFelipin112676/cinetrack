// Carrega o arquivo .env (se existir) com o recurso nativo do Node (>= 20.12)
// e centraliza as configurações do backend.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaBackend = path.dirname(fileURLToPath(import.meta.url));
const arquivoEnv = path.join(pastaBackend, '.env');

if (existsSync(arquivoEnv)) {
    process.loadEnvFile(arquivoEnv);
}

export const PORTA = Number(process.env.PORT) || 3000;

export const ARQUIVO_DADOS = process.env.DATA_FILE
    ? path.resolve(pastaBackend, process.env.DATA_FILE)
    : path.join(pastaBackend, 'data', 'filmes.json');
