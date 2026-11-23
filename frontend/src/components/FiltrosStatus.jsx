import { FILTROS } from '../utils/filmes.js';

// Botões de filtro por status
export default function FiltrosStatus({ filtro, aoMudar }) {
    return (
        <div className="filtros" role="group" aria-label="Filtrar por status">
            {FILTROS.map(({ valor, rotulo }) => {
                const ativo = filtro === valor;
                return (
                    <button
                        key={valor}
                        type="button"
                        className={ativo ? 'botao-ativo' : 'botao-inativo'}
                        aria-pressed={ativo}
                        onClick={() => aoMudar(valor)}
                    >
                        {rotulo}
                    </button>
                );
            })}
        </div>
    );
}
