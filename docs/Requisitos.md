# Requisitos CineTrack

## Campos de um filme

Cada filme cadastrado no sistema possui os seguintes campos:

1. Título
2. Ano de lançamento (número inteiro)
3. Gênero
4. Pôster (URL da imagem de capa, opcional)
5. Nota (de 1 a 5 estrelas)
6. Status: assistido, assistindo ou quero assistir
7. Comentário (texto livre, opcional)

## Áreas da interface

A interface principal do CineTrack é dividida nas seguintes áreas:

- Cabeçalho: apresenta o nome do sistema, a busca e o botão "+ Adicionar".
- Barra de busca: permite pesquisar filmes pelo título.
- Filtros: mostram apenas os filmes de um status (Todos, Assistido, Assistindo, Quero assistir).
- Lista de filmes: exibe os filmes em cards, com pôster, título, ano, gênero, nota, status e comentário.
- Ações do card: botões para editar e remover cada filme.
- Formulário (modal): usado para adicionar e para editar filmes.

## Rotas planejadas para a Parte 2

Na Parte 1 não há servidor: os dados ficam no `localStorage` do navegador. A tabela abaixo
descreve a API prevista para a Parte 2 (full stack).

| Ação | Método | Rota |
|---|---|---|
| Listar filmes | GET | /filmes |
| Buscar um filme | GET | /filmes/:id |
| Adicionar filme | POST | /filmes |
| Editar filme | PUT | /filmes/:id |
| Excluir filme | DELETE | /filmes/:id |
