import { useState } from 'react';
import { buscarNoTmdb } from '../api/filmes.js';

//Busca o título no TMDB via backend e preenche título, ano e pôster.
export default function BuscaTmdb({ titulo, aoEscolher, desabilitado }) {
    const [resultados, setResultados] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function buscar() {
        const termo = titulo.trim();
        if (termo === '') {
            setErro('Digite um título para buscar no TMDB.');
            return;
        }
        setCarregando(true);
        setErro('');
        try {
            setResultados(await buscarNoTmdb(termo));
        } catch (falha) {
            setResultados(null);
            setErro(falha.message);
        } finally {
            setCarregando(false);
        }
    }

    function escolher(resultado) {
        aoEscolher(resultado);
        setResultados(null);
    }

    return (
        <div className="busca-tmdb">
            <button type="button" className="botao-inativo" onClick={buscar} disabled={carregando || desabilitado}>
                {carregando ? 'Buscando…' : 'Preencher pelo TMDB'}
            </button>

            {erro && <p className="erro" role="alert">{erro}</p>}

            {resultados && (
                resultados.length === 0 ? (
                    <p className="meta" role="status">Nenhum resultado no TMDB.</p>
                ) : (
                    <ul className="resultados-tmdb" aria-label="Resultados do TMDB">
                        {resultados.map((item) => (
                            <li key={item.tmdbId}>
                                <button type="button" onClick={() => escolher(item)}>
                                    {item.poster && <img src={item.poster} alt="" loading="lazy" />}
                                    <span>
                                        {item.titulo}
                                        {item.ano ? ` (${item.ano})` : ''}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    );
}
