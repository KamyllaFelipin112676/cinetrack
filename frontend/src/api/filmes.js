const URL_API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export class ErroApi extends Error {
    constructor(mensagem, status, detalhes = null) {
        super(mensagem);
        this.name = 'ErroApi';
        this.status = status;
        this.detalhes = detalhes;
    }
}

async function requisitar(caminho, { metodo = 'GET', corpo, signal } = {}) {
    const opcoes = { method: metodo, signal, headers: { Accept: 'application/json' } };
    if (corpo !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }

    let resposta;
    try {
        resposta = await fetch(`${URL_API}${caminho}`, opcoes);
    } catch (erro) {
        if (erro.name === 'AbortError') {
            throw erro;
        }
        throw new ErroApi('Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.', 0);
    }

    if (resposta.status === 204) {
        return null;
    }

    let dados = null;
    try {
        dados = await resposta.json();
    } catch {

    }

    if (!resposta.ok) {
        const mensagem = dados?.erro || `O servidor respondeu com o erro ${resposta.status}.`;
        throw new ErroApi(mensagem, resposta.status, dados?.detalhes || null);
    }

    return dados;
}

export function listarFilmes({ status, signal } = {}) {
    const consulta = status && status !== 'todos' ? `?status=${encodeURIComponent(status)}` : '';
    return requisitar(`/filmes${consulta}`, { signal });
}

export function buscarFilme(id) {
    return requisitar(`/filmes/${encodeURIComponent(id)}`);
}

export function criarFilme(filme) {
    return requisitar('/filmes', { metodo: 'POST', corpo: filme });
}

export function atualizarFilme(id, filme) {
    return requisitar(`/filmes/${encodeURIComponent(id)}`, { metodo: 'PUT', corpo: filme });
}

export function removerFilme(id) {
    return requisitar(`/filmes/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export async function tmdbDisponivel() {
    try {
        const resposta = await requisitar('/tmdb/status');
        return Boolean(resposta?.disponivel);
    } catch {
        return false;
    }
}

export function buscarNoTmdb(titulo) {
    return requisitar(`/tmdb/buscar?titulo=${encodeURIComponent(titulo)}`);
}
