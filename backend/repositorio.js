/* ==========================================================
   Persistência dos filmes em arquivo JSON (módulos nativos do Node).
   Toda escrita grava o arquivo inteiro de forma atômica
   (arquivo temporário + rename) e as escritas são enfileiradas
   para que duas requisições simultâneas não se sobrescrevam.
   ========================================================== */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';

export function criarRepositorio(caminhoArquivo) {
    let fila = Promise.resolve();

    async function ler() {
        try {
            const texto = await readFile(caminhoArquivo, 'utf8');
            const dados = JSON.parse(texto);
            if (!Array.isArray(dados)) {
                throw new Error('o arquivo não contém uma lista');
            }
            return dados;
        } catch (erro) {
            if (erro.code === 'ENOENT') {
                return []; // arquivo ainda não existe: lista vazia
            }
            throw new Error(`Não foi possível ler ${caminhoArquivo}: ${erro.message}`);
        }
    }

    async function gravar(filmes) {
        await mkdir(path.dirname(caminhoArquivo), { recursive: true });
        const temporario = `${caminhoArquivo}.${process.pid}.tmp`;
        await writeFile(temporario, `${JSON.stringify(filmes, null, 2)}\n`, 'utf8');
        await rename(temporario, caminhoArquivo);
    }

    // Executa ler -> alterar -> gravar em sequência, um de cada vez.
    function alterar(transformacao) {
        const operacao = fila.then(async () => {
            const atuais = await ler();
            const { filmes, resultado } = await transformacao(atuais);
            if (filmes !== atuais) {
                await gravar(filmes);
            }
            return resultado;
        });
        fila = operacao.catch(() => {}); // uma falha não trava as próximas escritas
        return operacao;
    }

    async function listar() {
        await fila;
        return ler();
    }

    async function buscar(id) {
        const filmes = await listar();
        return filmes.find((filme) => String(filme.id) === String(id)) || null;
    }

    function criar(dados) {
        return alterar((filmes) => {
            const id = filmes.reduce((maior, filme) => Math.max(maior, Number(filme.id) || 0), 0) + 1;
            const novo = { id, ...dados };
            return { filmes: [...filmes, novo], resultado: novo };
        });
    }

    function atualizar(id, calcular) {
        return alterar((filmes) => {
            const atual = filmes.find((filme) => String(filme.id) === String(id));
            if (!atual) {
                return { filmes, resultado: null };
            }
            const atualizado = { ...calcular(atual), id: atual.id }; // o id original é preservado
            return {
                filmes: filmes.map((filme) => (filme === atual ? atualizado : filme)),
                resultado: atualizado
            };
        });
    }

    function remover(id) {
        return alterar((filmes) => {
            const restantes = filmes.filter((filme) => String(filme.id) !== String(id));
            if (restantes.length === filmes.length) {
                return { filmes, resultado: false };
            }
            return { filmes: restantes, resultado: true };
        });
    }

    function substituirTudo(lista) {
        return alterar(() => ({ filmes: lista.map((filme) => ({ ...filme })), resultado: lista.length }));
    }

    return { listar, buscar, criar, atualizar, remover, substituirTudo };
}
