export default function Cabecalho({ busca, aoMudarBusca, aoAdicionar, mostrarBusca = true }) {
    return (
        <header>
            <h1>CineTrack</h1>

            {mostrarBusca && (
                <form className="barra-busca" role="search" onSubmit={(evento) => evento.preventDefault()}>
                    <label htmlFor="busca" className="somente-leitor">Buscar filme por título</label>
                    <input
                        type="search"
                        id="busca"
                        className="caixa-texto"
                        placeholder="Buscar filme"
                        autoComplete="off"
                        value={busca}
                        onChange={(evento) => aoMudarBusca(evento.target.value)}
                    />
                    <button type="button" className="botao-adicionar" onClick={aoAdicionar}>
                        + Adicionar
                    </button>
                </form>
            )}
        </header>
    );
}
