# Requisitos CineTrack

## Campos de um filme

Cada filme cadastrado no sistema deve possuir os seguintes sete campos:

1. Título
2. Gênero
3. Ano de lançamento
4. Diretor
5. Duração
6. Status
7. Nota

## Áreas da interface

A interface principal do CineTrack será dividida nas seguintes áreas:

- Cabeçalho: apresenta o nome do sistema e opções principais.
- Barra de busca: Permite pesquisar filmes cadastrados.
- Lista de filmes: Exibe os filmes cadastrados pelo usuário.
- Área de detalhes: Apresenta as informações completas do filme selecionado.
- Área de ações: Contém botões para adicionar, editar e remover filmes.

## Tabela de ações, métodos e rotas

| Ação | Método | Rota |

| Listar filmes | GET | /filmes |
| Buscar um filme | GET | /filmes/:id |
| Adicionar filme | POST | /filmes |
| Editar filme | PUT | /filmes/:id |
| Excluir filme | DELETE | /filmes/:id |