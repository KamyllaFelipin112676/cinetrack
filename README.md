# CineTrack

Gerenciador pessoal de listas de filmes, desenvolvido para a disciplina de **Programação de Sistemas Web** (Departamento de Informática, Universidade Estadual de Maringá - UEM).

Com o CineTrack você registra os filmes que já assistiu, os que está assistindo e os que quer assistir, avalia cada um com 1 a 5 estrelas e deixa um comentário.

## Aluno

| Nome | RA |
|---|---|
| Kamylla Battistela Felipin | 112676 |

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

### Estrutura

```
cinetrack/
|-- README.md
|-- .gitignore
|-- docs/         # requisitos, rascunho da tela e análise HTTP
`-- parte1/
    |-- index.html
    |-- sobre.html
    |-- style.css
    `-- app.js
```
