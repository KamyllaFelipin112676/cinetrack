import CardFilme from './CardFilme.jsx';

export default function ListaFilmes({
    filmes,
    total,
    carregando,
    erro,
    aoTentarNovamente,
    aoEditar,
    aoRemover,
    idRemovendo
}) {
    if (carregando) {
        return (
            <section id="lista" aria-label="Lista de filmes" aria-busy="true">
                <div className="estado estado-carregando" role="status">
                    <span className="spinner" aria-hidden="true" />
                    Carregando filmes…
                </div>
            </section>
        );
    }

    if (erro) {
        return (
            <section id="lista" aria-label="Lista de filmes">
                <div className="estado estado-erro" role="alert">
                    <p><strong>Não foi possível carregar a lista.</strong></p>
                    <p>{erro}</p>
                    <button type="button" className="botao-ativo" onClick={aoTentarNovamente}>
                        Tentar novamente
                    </button>
                </div>
            </section>
        );
    }

    const resumo = total === 0
        ? ''
        : `Exibindo ${filmes.length} de ${total} ${total === 1 ? 'filme' : 'filmes'}`;

    return (
        <>
            <p className="resumo" role="status">{resumo}</p>

            <section id="lista" aria-label="Lista de filmes">
                {filmes.length === 0 ? (
                    <p className="estado vazio">
                        {total === 0
                            ? 'Nenhum filme na lista. Clique em “+ Adicionar” para começar.'
                            : 'Nenhum filme encontrado para essa busca ou filtro.'}
                    </p>
                ) : (
                    filmes.map((filme) => (
                        <CardFilme
                            key={filme.id}
                            filme={filme}
                            aoEditar={aoEditar}
                            aoRemover={aoRemover}
                            removendo={idRemovendo === filme.id}
                        />
                    ))
                )}
            </section>
        </>
    );
}
