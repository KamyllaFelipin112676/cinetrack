export default function Rodape({ pagina }) {
    return (
        <footer>
            <p>CineTrack - UEM</p>
            {pagina === 'sobre'
                ? <a href="#/">Voltar para a lista</a>
                : <a href="#/sobre">Sobre - CineTrack</a>}
        </footer>
    );
}
