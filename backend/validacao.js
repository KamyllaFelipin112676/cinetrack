export const STATUS_VALIDOS = ['assistido', 'assistindo', 'quero'];

const ANO_MIN = 1888;
const ANO_MAX = 2030;
const MAX_TITULO = 120;
const MAX_GENERO = 60;
const MAX_COMENTARIO = 500;

const vazio = (valor) => valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

function urlValida(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : valor;
}

export function validarFilme(corpo) {
    const erros = {};

    if (corpo === null || typeof corpo !== 'object' || Array.isArray(corpo)) {
        return { filme: null, erros: { corpo: 'Envie um objeto JSON com os dados do filme.' } };
    }

    const filme = {
        titulo: texto(corpo.titulo),
        ano: vazio(corpo.ano) ? corpo.ano : Number(corpo.ano),
        genero: vazio(corpo.genero) ? '' : texto(corpo.genero),
        poster: vazio(corpo.poster) ? '' : texto(corpo.poster),
        status: vazio(corpo.status) ? 'quero' : corpo.status,
        nota: vazio(corpo.nota) ? null : Number(corpo.nota),
        comentario: vazio(corpo.comentario) ? '' : texto(corpo.comentario)
    };

    if (vazio(filme.titulo)) {
        erros.titulo = 'O título é obrigatório.';
    } else if (typeof filme.titulo !== 'string') {
        erros.titulo = 'O título deve ser um texto.';
    } else if (filme.titulo.length > MAX_TITULO) {
        erros.titulo = `O título pode ter no máximo ${MAX_TITULO} caracteres.`;
    }

    if (vazio(filme.ano)) {
        erros.ano = 'O ano é obrigatório.';
    } else if (!Number.isInteger(filme.ano) || filme.ano < ANO_MIN || filme.ano > ANO_MAX) {
        erros.ano = `O ano deve ser um inteiro entre ${ANO_MIN} e ${ANO_MAX}.`;
    }

    if (typeof filme.genero !== 'string') {
        erros.genero = 'O gênero deve ser um texto.';
    } else if (filme.genero.length > MAX_GENERO) {
        erros.genero = `O gênero pode ter no máximo ${MAX_GENERO} caracteres.`;
    }

    if (filme.poster !== '' && (typeof filme.poster !== 'string' || !urlValida(filme.poster))) {
        erros.poster = 'O pôster deve ser uma URL http:// ou https://.';
    }

    if (!STATUS_VALIDOS.includes(filme.status)) {
        erros.status = `O status deve ser um destes: ${STATUS_VALIDOS.join(', ')}.`;
    }

    if (filme.nota !== null && (!Number.isInteger(filme.nota) || filme.nota < 1 || filme.nota > 5)) {
        erros.nota = 'A nota deve ser um inteiro de 1 a 5.';
    }

    if (typeof filme.comentario !== 'string') {
        erros.comentario = 'O comentário deve ser um texto.';
    } else if (filme.comentario.length > MAX_COMENTARIO) {
        erros.comentario = `O comentário pode ter no máximo ${MAX_COMENTARIO} caracteres.`;
    }

    return { filme, erros };
}
