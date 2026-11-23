const PAGINAS = [
    { id: 'inicio', rotulo: 'Início', href: '#/' },
    { id: 'sobre', rotulo: 'Sobre', href: '#/sobre' }
];

export default function Navegacao({ pagina }) {
    return (
        <nav aria-label="Navegação principal">
            <ul>
                {PAGINAS.map((item) => (
                    <li key={item.id}>
                        <a href={item.href} aria-current={pagina === item.id ? 'page' : undefined}>
                            {item.rotulo}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
