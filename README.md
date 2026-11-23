# CineTrack

Gerenciador pessoal de listas de filmes, desenvolvido para a disciplina de **Programação de Sistemas Web** (Departamento de Informática, Universidade Estadual de Maringá - UEM).

Com o CineTrack você registra os filmes que já assistiu, os que está assistindo e os que quer assistir, avalia cada um com 1 a 5 estrelas e deixa um comentário.

## Aluna

| Nome                       |  RA    |
|----------------------------|--------|
| Kamylla Battistela Felipin | 112676 |

## Versões

| Tag    | Conteúdo                                                            |
|--------|---------------------------------------------------------------------|
| `v1.0` | Parte 1 - frontend em HTML, CSS e JavaScript puro (pasta `parte1/`) |
| `v2.0` | Parte 2 - aplicação full stack: React (Vite) + API REST em Node.js com mini-Express e persistência em JSON |

---

## Parte 2 - Aplicação Full Stack

A interface foi reescrita em **React** com componentes reutilizáveis e conversa com uma **API REST** em **Node.js**, construída sobre um mini-Express próprio (`backend/mini-express.js`, só com o módulo nativo `http`). Os filmes ficam salvos em `backend/data/filmes.json`, então sobrevivem ao reinício do servidor.

### Pré-requisitos

- **Node.js 20.12 ou mais recente** (testado no Node 22). O backend não tem dependências externas.

### Como executar

São dois processos, cada um em um terminal.

**1. Backend (API em http://localhost:3000)**

```bash
cd backend
cp .env.example .env      # no Windows (PowerShell): copy .env.example .env
npm run seed              # (re)cria data/filmes.json com os 6 filmes de exemplo
npm start                 # ou: npm run dev (reinicia ao salvar arquivos)
```

**2. Frontend (http://localhost:5173)**

```bash
cd frontend
npm install
npm run dev
```

Abra <http://localhost:5173> no navegador. Se a API rodar em outro endereço, crie `frontend/.env` a partir de `frontend/.env.example` e ajuste `VITE_API_URL`.

Outros comandos úteis:

| Pasta      | Comando        | O que faz                                   |
|------------|----------------|---------------------------------------------|
| `backend/` | `npm test`     | Testes automatizados da API (`node --test`) |
| `backend/` | `npm run seed` | Restaura os 6 filmes de exemplo (**substitui** os dados atuais) |
| `frontend/` | `npm run build` | Gera a versão de produção em `frontend/dist/` |
| `frontend/` | `npm run lint` | Verifica o código com o oxlint |

### Variáveis de ambiente

O arquivo `backend/.env` existe só localmente (está no `.gitignore`). O modelo versionado é `backend/.env.example`, sem valores reais:

| Variável    | Obrigatória       | Descrição |
|-------------|-------------------|--------------|
| `PORT`      | não (padrão 3000) | Porta da API |
| `DATA_FILE` | não               | Caminho do arquivo de dados, relativo a `backend/` (padrão `data/filmes.json`) |
| `CORS_ORIGINS` | não | Origens extras liberadas no CORS; qualquer `http://localhost:<porta>` já é aceito |
| `TMDB_API_KEY` ou `TMDB_READ_TOKEN` | não | Credencial do TMDB para o proxy opcional (RF-07) |

### API REST

Todas as respostas usam `Content-Type: application/json`. Erros vêm no formato `{ "erro": "mensagem", "detalhes": { campo: mensagem } }`.

| Método | Rota                   | Descrição                                 | Respostas |
|--------|------------------------|-------------------------------------------|---|
| GET    | `/filmes`              | Lista todos os filmes; aceita `?status=assistido\|assistindo\|quero` | 200, 400 (status inválido) |
| GET    | `/filmes/:id`          | Retorna um filme | 200, 404 |
| POST   | `/filmes`              | Cria um filme (título e ano obrigatórios); o id é gerado pelo servidor | 201, 400|
| PUT    | `/filmes/:id`          | Atualiza o filme preservando o id original | 200, 400, 404 |
| DELETE | `/filmes/:id`          | Remove o filme | 204, 404 |
| GET    | `/tmdb/status`         | Informa se o proxy do TMDB está configurado | 200 |
| GET    | `/tmdb/buscar?titulo=` | (Opcional) Busca filmes no TMDB pelo backend | 200, 400, 502, 503 |

Exemplo:

```bash
curl -X POST http://localhost:3000/filmes \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Central do Brasil","ano":1998,"genero":"Drama","status":"quero","nota":5}'
```

### Como os requisitos foram atendidos

- **RF-01 - Componentes React:** `Cabecalho` (busca + adicionar), `FiltrosStatus`, `ListaFilmes`, `CardFilme`, `FormularioFilme` (modal com `<dialog>`), além de `Estrelas`, `Aviso`, `Navegacao`, `Rodape`, `Sobre` e `BuscaTmdb`. O estado é sempre atualizado sem mutação (`map`, `filter`, spread) e a remoção pede confirmação.
- **RF-02 - Acesso a dados:** toda a comunicação fica em `frontend/src/api/filmes.js` (`listarFilmes`, `buscarFilme`, `criarFilme`, `atualizarFilme`, `removerFilme`). A lista é carregada ao iniciar; criar, editar e remover usam `async/await` e só alteram a tela depois da resposta do servidor.
- **RF-03 - API REST:** `backend/app.js` define as rotas sobre o `mini-express.js` (rotas com parâmetros, `req.query`, corpo JSON, `res.status().json()`, tratamento de erros e 404/405). O CORS libera o frontend em `localhost` e responde ao preflight (`OPTIONS`).
- **RF-04 - Persistência em JSON:** `backend/repositorio.js` usa `fs/promises`; cada escrita grava o arquivo de forma atômica (arquivo temporário + `rename`) e as escritas são enfileiradas para que requisições simultâneas não se percam. `npm run seed` popula o arquivo com os 6 filmes da Parte 1.
- **RF-05 - Tratamento de erros:** a lista mostra os estados *carregando*, *erro* (com botão "Tentar novamente") e *vazio*. Falhas de rede ou respostas 4xx/5xx aparecem dentro do formulário (que continua aberto, sem perder o que foi digitado) ou em um aviso flutuante, sem travar a interface.
- **RF-06 - Funcionalidades da Parte 1:** busca por título (sem diferenciar maiúsculas/acentos, com debounce), filtro por status combinado com a busca, adição, edição, remoção com confirmação, validação de formulário, página Sobre, layout responsivo e modo escuro.
- **RF-07 - Proxy TMDB (opcional):** `GET /tmdb/buscar` consulta o TMDB com a chave lida do `.env`. A chave nunca chega ao navegador: o frontend só recebe título, ano e pôster. Com a chave configurada, o formulário mostra o botão "Preencher pelo TMDB".

### Estrutura

```
cinetrack/
|-- README.md
|-- .gitignore
|-- docs/                  # requisitos, rascunho da tela e análise HTTP
|-- parte1/                # Parte 1, preservada como na tag v1.0
|-- backend/
|   |-- server.js          # inicia o servidor
|   |-- app.js             # rotas da API, CORS e proxy TMDB
|   |-- mini-express.js    # micro framework HTTP (só módulo nativo http)
|   |-- repositorio.js     # leitura/gravação do arquivo JSON
|   |-- validacao.js       # regras de validação de um filme
|   |-- config.js          # carrega o .env e as configurações
|   |-- filmes-exemplo.js  # os 6 filmes da Parte 1
|   |-- seed.js            # popula data/filmes.json
|   |-- package.json
|   |-- .env.example
|   |-- data/
|   |   `-- filmes.json
|   `-- test/
|       `-- api.test.js
`-- frontend/
    |-- index.html
    |-- package.json
    |-- vite.config.js
    |-- .env.example
    `-- src/
        |-- main.jsx
        |-- App.jsx
        |-- index.css
        |-- api/filmes.js          # módulo único de acesso a dados
        |-- hooks/useDebounce.js
        |-- utils/filmes.js        # busca, filtro e validação
        `-- components/            # componentes React
```

---

## Parte 1 - Frontend interativo

Toda a lógica roda no navegador (HTML5, CSS3 e JavaScript puro), sem servidor, sem banco de dados e sem bibliotecas. A lista é salva no `localStorage`, então recarregar a página não perde os dados. Na primeira visita são carregados 6 filmes de exemplo.

### Funcionalidades

- Lista de filmes em cards, com pôster, título, ano, gênero, nota em estrelas, badge de status e comentário
- Busca por título (ignora maiúsculas e acentos, com debounce)
- Filtro por status, combinado com a busca
- Cadastro, edição e remoção de filmes, com validação e confirmação antes de remover
- Layout responsivo (de 320 px a 1920 px) e modo escuro automático

### Como executar

Não há nada para instalar. Escolha uma das opções:

1. **Direto no navegador:** abra o arquivo `parte1/index.html` (Chrome, Firefox ou Edge recentes).
2. **Servidor local opcional** (com Python instalado), a partir da raiz do repositório:

   ```bash
   python -m http.server 8000
   ```

   e acesse <http://localhost:8000/parte1/>.

Para voltar ao estado inicial, limpe os dados do site no navegador (ou execute `localStorage.clear()` no console) e recarregue a página.