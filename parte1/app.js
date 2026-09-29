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
let filtroStatus = 'todos';
let termoBusca = '';

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

/* ---------- Busca e filtro ---------- */

// Minúsculas e sem acentos, para "duna" encontrar "Duna" e "acao" encontrar "Ação".
function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Combina os dois critérios: status selecionado E título contendo o termo.
function filmesVisiveis() {
    const termo = normalizar(termoBusca);
    return filmes.filter((filme) => {
        const statusOk = filtroStatus === 'todos' || filme.status === filtroStatus;
        const tituloOk = normalizar(filme.titulo).includes(termo);
        return statusOk && tituloOk;
    });
}

// Adia a execução até o usuário parar de digitar por `espera` ms.
function debounce(funcao, espera) {
    let temporizador;
    return (...argumentos) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcao(...argumentos), espera);
    };
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
    const visiveis = filmesVisiveis();
    lista.replaceChildren();

    if (visiveis.length === 0) {
        const mensagem = filmes.length === 0
            ? 'Nenhum filme na lista. Clique em “+ Adicionar” para começar.'
            : 'Nenhum filme encontrado para essa busca ou filtro.';
        lista.appendChild(criarElemento('p', 'vazio', mensagem));
    } else {
        lista.append(...visiveis.map(criarCard));
    }

    resumo.textContent = filmes.length === 0
        ? ''
        : `Exibindo ${visiveis.length} de ${filmes.length} ${filmes.length === 1 ? 'filme' : 'filmes'}`;
}

function selecionarFiltro(status) {
    filtroStatus = status;
    document.querySelectorAll('.filtros button').forEach((botao) => {
        const ativo = botao.dataset.status === status;
        botao.classList.toggle('botao-ativo', ativo);
        botao.classList.toggle('botao-inativo', !ativo);
        botao.setAttribute('aria-pressed', String(ativo));
    });
    renderizar();
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

    const campoBusca = document.getElementById('busca');
    campoBusca.addEventListener('input', debounce(() => {
        termoBusca = campoBusca.value;
        renderizar();
    }, 250));

    // Enter na busca não deve recarregar a página.
    document.getElementById('form-busca').addEventListener('submit', (evento) => evento.preventDefault());

    document.querySelector('.filtros').addEventListener('click', (evento) => {
        const botao = evento.target.closest('button[data-status]');
        if (botao) {
            selecionarFiltro(botao.dataset.status);
        }
    });
}

document.addEventListener('DOMContentLoaded', iniciar);
