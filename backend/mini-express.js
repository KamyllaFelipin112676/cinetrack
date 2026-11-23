/* ==========================================================
   mini-express.js - micro framework HTTP inspirado no Express
   Usa apenas o módulo nativo `http` do Node.

   Recursos:
   - app.use(middleware)                      -> middlewares globais
   - app.get/post/put/patch/delete(rota, fn)  -> rotas com parâmetros (/filmes/:id)
   - req.params, req.query, req.body (JSON)
   - res.status(), res.set(), res.json(), res.send(), res.sendStatus()
   - handlers async: erros lançados viram resposta 500 em JSON
   ========================================================== */

import http from 'node:http';

const TAMANHO_MAX_CORPO = 1024 * 1024; // 1 MB

const MENSAGENS_STATUS = {
    400: 'Requisição inválida.',
    404: 'Recurso não encontrado.',
    413: 'Corpo da requisição muito grande.',
    415: 'O corpo deve ser enviado como application/json.',
    500: 'Erro interno do servidor.'
};

// Erro com código HTTP associado, útil para interromper um handler com uma resposta específica.
export class HttpError extends Error {
    constructor(status, mensagem, detalhes) {
        super(mensagem || MENSAGENS_STATUS[status] || 'Erro.');
        this.status = status;
        this.detalhes = detalhes;
    }
}

// Converte "/filmes/:id" em uma expressão regular e na lista de nomes de parâmetros.
function compilarRota(caminho) {
    const nomes = [];
    const padrao = caminho
        .replace(/\/+$/, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/:(\w+)/g, (_, nome) => {
            nomes.push(nome);
            return '([^/]+)';
        });
    return { regex: new RegExp(`^${padrao}/?$`), nomes };
}

// Lê o corpo da requisição e faz o parse de JSON (apenas para métodos com corpo).
function lerCorpo(req) {
    return new Promise((resolve, reject) => {
        const partes = [];
        let tamanho = 0;

        req.on('data', (parte) => {
            tamanho += parte.length;
            if (tamanho > TAMANHO_MAX_CORPO) {
                reject(new HttpError(413));
                req.destroy();
                return;
            }
            partes.push(parte);
        });

        req.on('end', () => {
            const texto = Buffer.concat(partes).toString('utf8');
            if (texto.trim() === '') {
                resolve(undefined);
                return;
            }
            const tipo = req.headers['content-type'] || '';
            if (!tipo.includes('application/json')) {
                reject(new HttpError(415));
                return;
            }
            try {
                resolve(JSON.parse(texto));
            } catch {
                reject(new HttpError(400, 'JSON inválido no corpo da requisição.'));
            }
        });

        req.on('error', reject);
    });
}

// Acrescenta ao objeto de resposta nativo os métodos no estilo Express.
function decorarResposta(res) {
    res.status = (codigo) => {
        res.statusCode = codigo;
        return res;
    };

    res.set = (nome, valor) => {
        res.setHeader(nome, valor);
        return res;
    };

    res.json = (dados) => {
        if (res.writableEnded) return res;
        const corpo = JSON.stringify(dados);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(corpo));
        res.end(corpo);
        return res;
    };

    res.send = (dados) => {
        if (res.writableEnded) return res;
        if (dados === undefined || dados === null) {
            res.end();
        } else if (typeof dados === 'object' && !Buffer.isBuffer(dados)) {
            res.json(dados);
        } else {
            res.end(dados);
        }
        return res;
    };

    // Responde só com o código (ex.: 204 sem corpo).
    res.sendStatus = (codigo) => {
        res.statusCode = codigo;
        if (codigo === 204 || codigo === 304) {
            res.end();
        } else {
            res.json({ erro: MENSAGENS_STATUS[codigo] || http.STATUS_CODES[codigo] });
        }
        return res;
    };

    return res;
}

export default function miniExpress() {
    const middlewares = [];
    const rotas = [];

    const registrar = (metodo) => (caminho, ...handlers) => {
        rotas.push({ metodo, caminho, ...compilarRota(caminho), handlers });
        return app;
    };

    // Executa uma lista de funções (req, res, next) em sequência.
    async function executar(funcoes, req, res) {
        let indice = 0;
        const proximo = async (erro) => {
            if (erro) throw erro;
            const funcao = funcoes[indice++];
            if (!funcao || res.writableEnded) return;
            await funcao(req, res, proximo);
        };
        await proximo();
    }

    async function tratar(req, res) {
        decorarResposta(res);

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.path = decodeURIComponent(url.pathname);
        req.query = Object.fromEntries(url.searchParams);
        req.params = {};

        try {
            await executar(middlewares, req, res);
            if (res.writableEnded) return;

            const candidatas = rotas.filter((rota) => rota.regex.test(req.path));
            const rota = candidatas.find((r) => r.metodo === req.method);

            if (!rota) {
                if (candidatas.length > 0) {
                    res.setHeader('Allow', [...new Set(candidatas.map((r) => r.metodo))].join(', '));
                    res.status(405).json({ erro: `Método ${req.method} não permitido em ${req.path}.` });
                } else {
                    res.status(404).json({ erro: `Rota ${req.method} ${req.path} não encontrada.` });
                }
                return;
            }

            const valores = req.path.match(rota.regex).slice(1);
            rota.nomes.forEach((nome, i) => {
                req.params[nome] = decodeURIComponent(valores[i]);
            });

            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                req.body = await lerCorpo(req);
            }

            await executar(rota.handlers, req, res);

            if (!res.writableEnded) {
                res.status(500).json({ erro: 'A rota não enviou resposta.' });
            }
        } catch (erro) {
            if (res.writableEnded) return;
            const status = erro instanceof HttpError ? erro.status : 500;
            if (status === 500) {
                console.error('[mini-express] erro não tratado:', erro);
            }
            const corpo = { erro: status === 500 ? MENSAGENS_STATUS[500] : erro.message };
            if (erro.detalhes) corpo.detalhes = erro.detalhes;
            res.status(status).json(corpo);
        }
    }

    const app = {
        use(middleware) {
            middlewares.push(middleware);
            return app;
        },
        get: registrar('GET'),
        post: registrar('POST'),
        put: registrar('PUT'),
        patch: registrar('PATCH'),
        delete: registrar('DELETE'),
        // Permite usar o app diretamente em http.createServer (útil nos testes).
        handler: tratar,
        listen(porta, ...resto) {
            const servidor = http.createServer(tratar);
            return servidor.listen(porta, ...resto);
        }
    };

    return app;
}
