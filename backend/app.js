/* ==========================================================
   Definição da API REST do CineTrack (rotas e middlewares).
   Fica separada do server.js para poder ser usada nos testes.
   ========================================================== */

import miniExpress, { HttpError } from './mini-express.js';
import { validarFilme, STATUS_VALIDOS } from './validacao.js';

// Qualquer porta de localhost / 127.0.0.1 é aceita (frontend em desenvolvimento).
const ORIGEM_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function cors(origensExtras) {
    return (req, res, next) => {
        const origem = req.headers.origin;
        if (origem && (ORIGEM_LOCAL.test(origem) || origensExtras.includes(origem))) {
            res.setHeader('Access-Control-Allow-Origin', origem);
            res.setHeader('Vary', 'Origin');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Max-Age', '600');
        }
        if (req.method === 'OPTIONS') {
            res.sendStatus(204); // resposta ao preflight
            return;
        }
        return next();
    };
}

function registrarAcesso(req, res, next) {
    const inicio = Date.now();
    res.on('finish', () => {
        console.log(`${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
    });
    return next();
}

function erroValidacao(erros) {
    const obrigatorios = ['titulo', 'ano'].filter((campo) => erros[campo]);
    const mensagem = obrigatorios.length > 0
        ? `Campo(s) obrigatório(s) ausente(s) ou inválido(s): ${obrigatorios.join(', ')}.`
        : 'Dados do filme inválidos.';
    return new HttpError(400, mensagem, erros);
}

/* ---------- Proxy TMDB (RF-07, opcional) ---------- */

function configuracaoTmdb(env) {
    if (env.TMDB_READ_TOKEN) {
        return { headers: { Authorization: `Bearer ${env.TMDB_READ_TOKEN}` }, chave: null };
    }
    if (env.TMDB_API_KEY) {
        return { headers: {}, chave: env.TMDB_API_KEY };
    }
    return null;
}

async function buscarNoTmdb(config, termo) {
    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('query', termo);
    url.searchParams.set('language', 'pt-BR');
    url.searchParams.set('include_adult', 'false');
    if (config.chave) {
        url.searchParams.set('api_key', config.chave);
    }

    let resposta;
    try {
        resposta = await fetch(url, {
            headers: { Accept: 'application/json', ...config.headers },
            signal: AbortSignal.timeout(8000)
        });
    } catch {
        throw new HttpError(502, 'Não foi possível contatar o TMDB.');
    }
    if (!resposta.ok) {
        const mensagem = resposta.status === 401
            ? 'Chave do TMDB inválida. Verifique o arquivo .env do backend.'
            : `O TMDB respondeu com erro ${resposta.status}.`;
        throw new HttpError(502, mensagem);
    }

    const dados = await resposta.json();
    // Só os campos necessários seguem para o navegador (a chave nunca sai do servidor).
    return (dados.results || []).slice(0, 8).map((item) => ({
        tmdbId: item.id,
        titulo: item.title,
        ano: item.release_date ? Number(item.release_date.slice(0, 4)) : null,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        sinopse: item.overview || ''
    }));
}

/* ---------- Aplicação ---------- */

export function criarApp({ repositorio, env = process.env }) {
    const app = miniExpress();
    const origensExtras = (env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

    if (env.NODE_ENV !== 'test') {
        app.use(registrarAcesso);
    }
    app.use(cors(origensExtras));

    app.get('/', (req, res) => {
        res.json({ nome: 'CineTrack API', rotas: ['/filmes', '/filmes/:id', '/tmdb/buscar?titulo='] });
    });

    // GET /filmes  (filtro opcional ?status=assistido|assistindo|quero)
    app.get('/filmes', async (req, res) => {
        const { status } = req.query;
        if (status !== undefined && status !== '' && !STATUS_VALIDOS.includes(status)) {
            throw new HttpError(400, `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`);
        }
        const filmes = await repositorio.listar();
        res.json(status ? filmes.filter((filme) => filme.status === status) : filmes);
    });

    // GET /filmes/:id
    app.get('/filmes/:id', async (req, res) => {
        const filme = await repositorio.buscar(req.params.id);
        if (!filme) {
            throw new HttpError(404, `Filme ${req.params.id} não encontrado.`);
        }
        res.json(filme);
    });

    // POST /filmes
    app.post('/filmes', async (req, res) => {
        const { filme, erros } = validarFilme(req.body);
        if (Object.keys(erros).length > 0) {
            throw erroValidacao(erros);
        }
        const criado = await repositorio.criar(filme);
        res.status(201).set('Location', `/filmes/${criado.id}`).json(criado);
    });

    // PUT /filmes/:id  (o id original é sempre preservado)
    app.put('/filmes/:id', async (req, res) => {
        if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
            throw new HttpError(400, 'Envie um objeto JSON com os dados do filme.');
        }

        const atualizado = await repositorio.atualizar(req.params.id, (atual) => {
            // Campos não enviados mantêm o valor atual; o resultado é validado por inteiro.
            const { filme, erros } = validarFilme({ ...atual, ...req.body });
            if (Object.keys(erros).length > 0) {
                throw erroValidacao(erros);
            }
            return filme;
        });

        if (!atualizado) {
            throw new HttpError(404, `Filme ${req.params.id} não encontrado.`);
        }
        res.json(atualizado);
    });

    // DELETE /filmes/:id
    app.delete('/filmes/:id', async (req, res) => {
        const removido = await repositorio.remover(req.params.id);
        if (!removido) {
            throw new HttpError(404, `Filme ${req.params.id} não encontrado.`);
        }
        res.sendStatus(204);
    });

    // GET /tmdb/status -> informa ao frontend se o proxy está configurado
    app.get('/tmdb/status', (req, res) => {
        res.json({ disponivel: configuracaoTmdb(env) !== null });
    });

    // GET /tmdb/buscar?titulo=...  (RF-07: a chave fica só no servidor)
    app.get('/tmdb/buscar', async (req, res) => {
        const config = configuracaoTmdb(env);
        if (!config) {
            throw new HttpError(503, 'Integração com o TMDB não configurada (defina TMDB_API_KEY ou TMDB_READ_TOKEN no .env).');
        }
        const termo = (req.query.titulo || '').trim();
        if (termo === '') {
            throw new HttpError(400, 'Informe o parâmetro ?titulo= para buscar.');
        }
        res.json(await buscarNoTmdb(config, termo));
    });

    return app;
}
