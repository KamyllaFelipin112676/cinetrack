import Estrelas from './Estrelas.jsx';
import { POSTER_PADRAO, ROTULOS_STATUS } from '../utils/filmes.js';

function trocarPorPadrao(evento) {
    if (evento.currentTarget.src !== POSTER_PADRAO) {
        evento.currentTarget.src = POSTER_PADRAO;
    }
}

// Card de um filme, com as ações de editar e remover.
export default function CardFilme({ filme, aoEditar, aoRemover, removendo = false }) {
    return (
        <article className={removendo ? 'card card-ocupado' : 'card'} aria-busy={removendo}>
            <img
                src={filme.poster || POSTER_PADRAO}
                alt={`Pôster do filme ${filme.titulo}`}
                loading="lazy"
                onError={trocarPorPadrao}
            />
            <h2>{filme.titulo}</h2>
            <p className="meta">
                {filme.ano}
                {filme.genero && ` • ${filme.genero}`}
            </p>
            <p className="meta">
                Nota: <Estrelas nota={filme.nota} />
            </p>
            <span className={`badge badge-${filme.status}`}>{ROTULOS_STATUS[filme.status] || filme.status}</span>
            {filme.comentario && <p className="comentario">“{filme.comentario}”</p>}

            <div className="acoes">
                <button
                    type="button"
                    className="editar"
                    onClick={() => aoEditar(filme)}
                    disabled={removendo}
                    aria-label={`Editar ${filme.titulo}`}
                >
                    Editar
                </button>
                <button
                    type="button"
                    className="remover"
                    onClick={() => aoRemover(filme)}
                    disabled={removendo}
                    aria-label={`Remover ${filme.titulo}`}
                >
                    {removendo ? 'Removendo…' : 'Remover'}
                </button>
            </div>
        </article>
    );
}