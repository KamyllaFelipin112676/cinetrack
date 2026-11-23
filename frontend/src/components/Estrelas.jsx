export default function Estrelas({ nota }) {
    if (!nota) {
        return <span className="sem-nota">sem nota</span>;
    }
    return (
        <span className="estrelas" role="img" aria-label={`Nota ${nota} de 5`}>
            {'★'.repeat(nota) + '☆'.repeat(5 - nota)}
        </span>
    );
}
