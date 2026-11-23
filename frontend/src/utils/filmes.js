export const POSTER_PADRAO = 'https://placehold.co/200x300?text=Sem+poster';

export const ANO_MIN = 1888;
export const ANO_MAX = 2030;
export const MAX_TITULO = 120;
export const MAX_GENERO = 60;
export const MAX_COMENTARIO = 500;

export const ROTULOS_STATUS = {
    assistido: 'Assistido',
    assistindo: 'Assistindo',
    quero: 'Quero assistir'
};

export const FILTROS = [{ valor: 'todos', rotulo: 'Todos' }].concat(
    Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => ({ valor, rotulo }))
);

export const CAMPOS_FORMULARIO = ['titulo', 'ano', 'genero', 'poster', 'status', 'nota', 'comentario'];

export function normalizar(texto) {
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function correspondeAosFiltros(filme, termo, status) {
    const statusOk = status === 'todos' || filme.status === status;
    const tituloOk = normalizar(filme.titulo).includes(normalizar(termo));
    return statusOk && tituloOk;
}

export function filtrarFilmes(filmes, termo, status) {
    return filmes.filter((filme) => correspondeAosFiltros(filme, termo, status));
}

function urlValida(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function dadosDoFormulario(valores) {
    return {
        titulo: valores.titulo.trim(),
        ano: Number(valores.ano),
        genero: valores.genero.trim(),
        poster: valores.poster.trim(),
        status: valores.status,
        nota: Number(valores.nota),
        comentario: valores.comentario.trim()
    };
}

export function validarFilme(dados) {
    const erros = {};

    if (dados.titulo === '') {
        erros.titulo = 'Informe o título do filme.';
    } else if (dados.titulo.length > MAX_TITULO) {
        erros.titulo = `O título pode ter no máximo ${MAX_TITULO} caracteres.`;
    }

    if (!Number.isInteger(dados.ano) || dados.ano < ANO_MIN || dados.ano > ANO_MAX) {
        erros.ano = `Informe um ano inteiro entre ${ANO_MIN} e ${ANO_MAX}.`;
    }

    if (dados.genero === '') {
        erros.genero = 'Informe o gênero do filme.';
    } else if (dados.genero.length > MAX_GENERO) {
        erros.genero = `O gênero pode ter no máximo ${MAX_GENERO} caracteres.`;
    }

    if (dados.poster !== '' && !urlValida(dados.poster)) {
        erros.poster = 'Informe uma URL válida, começando com http:// ou https://.';
    }

    if (!Object.hasOwn(ROTULOS_STATUS, dados.status)) {
        erros.status = 'Selecione um status.';
    }

    if (!Number.isInteger(dados.nota) || dados.nota < 1 || dados.nota > 5) {
        erros.nota = 'Informe uma nota inteira de 1 a 5.';
    }

    if (dados.comentario.length > MAX_COMENTARIO) {
        erros.comentario = `O comentário pode ter no máximo ${MAX_COMENTARIO} caracteres.`;
    }

    return erros;
}
