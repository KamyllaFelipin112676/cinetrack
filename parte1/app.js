'use strict';

/* ==========================================================
   CineTrack - Parte 1 (JavaScript puro, sem bibliotecas)
   ========================================================== */

const CHAVE_STORAGE = 'cinetrack:filmes';
const POSTER_PADRAO = 'https://placehold.co/200x300?text=Sem+poster';

const ROTULOS_STATUS = {
    assistido: 'Assistido',
    assistindo: 'Assistindo',
    quero: 'Quero assistir'
};

const poster = (codigo) => `https://image.tmdb.org/t/p/w600_and_h900_face/${codigo}.jpg`;

// Conjunto canônico da disciplina (Seção 5 da especificação).
const FILMES_INICIAIS = [
    { id: 1, titulo: 'A Origem', ano: 2010, genero: 'Ficção científica', poster: poster('9e3Dz7aCANy5aRUQF745IlNloJ1'), nota: 5, status: 'assistido', comentario: 'Revejo sempre.' },
    { id: 2, titulo: 'Parasita', ano: 2019, genero: 'Suspense', poster: poster('igw938inb6Fy0YVcwIyxQ7Lu5FO'), nota: 4, status: 'assistido', comentario: '' },
    { id: 3, titulo: 'O Auto da Compadecida', ano: 2000, genero: 'Comédia', poster: poster('imcOp1kJsCsAFCoOtY5OnPrFbAf'), nota: 5, status: 'assistido', comentario: 'Clássico nacional.' },
    { id: 4, titulo: 'Duna: Parte Dois', ano: 2024, genero: 'Ficção científica', poster: poster('8LJJjLjAzAwXS40S5mx79PJ2jSs'), nota: 4, status: 'assistindo', comentario: '' },
    { id: 5, titulo: 'Interestelar', ano: 2014, genero: 'Ficção científica', poster: poster('6ricSDD83BClJsFdGB6x7cM0MFQ'), nota: 5, status: 'quero', comentario: '' },
    { id: 6, titulo: 'Cidade de Deus', ano: 2002, genero: 'Drama', poster: poster('gfnXixcGC060QcG6JPxN6AMdVsq'), nota: 4, status: 'quero', comentario: '' }
];

/* ---------- Estado da aplicação ---------- */

let filmes = [];

/* ---------- Persistência (localStorage) ---------- */

function salvarFilmes() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(filmes));
    } catch (erro) {
        console.error('Não foi possível salvar os filmes:', erro);
    }
}

// Devolve a lista salva ou null quando não há dados válidos (primeira visita).
function carregarFilmes() {
    try {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        if (salvo !== null) {
            const lista = JSON.parse(salvo);
            if (Array.isArray(lista)) {
                return lista;
            }
        }
    } catch (erro) {
        console.error('Dados salvos inválidos, recarregando exemplos:', erro);
    }
    return null;
}

function gerarId() {
    return filmes.reduce((maior, filme) => Math.max(maior, filme.id), 0) + 1;
}

/* ---------- Renderização ---------- */

function textoEstrelas(nota) {
    return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

function criarBotaoAcao(rotulo, classe, acao, id, titulo) {
    const botao = criarElemento('button', classe, rotulo);
    botao.type = 'button';
    botao.dataset.acao = acao;
    botao.dataset.id = id;
    botao.setAttribute('aria-label', `${rotulo} ${titulo}`);
    return botao;
}

function criarCard(filme) {
    const card = criarElemento('article', 'card');

    const imagem = document.createElement('img');
    imagem.src = filme.poster || POSTER_PADRAO;
    imagem.alt = `Pôster do filme ${filme.titulo}`;
    imagem.loading = 'lazy';
    imagem.addEventListener('error', () => {
        if (imagem.src !== POSTER_PADRAO) {
            imagem.src = POSTER_PADRAO;
        }
    });

    const estrelas = criarElemento('span', 'estrelas', textoEstrelas(filme.nota));
    estrelas.setAttribute('role', 'img');
    estrelas.setAttribute('aria-label', `Nota ${filme.nota} de 5`);

    const nota = criarElemento('p', 'meta', 'Nota: ');
    nota.appendChild(estrelas);

    const badge = criarElemento('span', `badge badge-${filme.status}`, ROTULOS_STATUS[filme.status]);

    const acoes = criarElemento('div', 'acoes');
    acoes.append(
        criarBotaoAcao('Editar', 'editar', 'editar', filme.id, filme.titulo),
        criarBotaoAcao('Remover', 'remover', 'remover', filme.id, filme.titulo)
    );

    card.append(
        imagem,
        criarElemento('h2', '', filme.titulo),
        criarElemento('p', 'meta', `${filme.ano} • ${filme.genero}`),
        nota,
        badge
    );

    if (filme.comentario) {
        card.appendChild(criarElemento('p', 'comentario', `“${filme.comentario}”`));
    }

    card.appendChild(acoes);
    return card;
}

function renderizar() {
    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    lista.replaceChildren();

    if (filmes.length === 0) {
        lista.appendChild(criarElemento('p', 'vazio', 'Nenhum filme na lista. Clique em “+ Adicionar” para começar.'));
        resumo.textContent = '';
        return;
    }

    lista.append(...filmes.map(criarCard));
    resumo.textContent = `${filmes.length} ${filmes.length === 1 ? 'filme' : 'filmes'}`;
}

/* ---------- Inicialização ---------- */

function iniciar() {
    const salvos = carregarFilmes();
    if (salvos === null) {
        // Primeira visita: carrega os 6 filmes de exemplo e já os persiste.
        filmes = FILMES_INICIAIS.map((filme) => ({ ...filme }));
        salvarFilmes();
    } else {
        filmes = salvos;
    }
    renderizar();
}

document.addEventListener('DOMContentLoaded', iniciar);
