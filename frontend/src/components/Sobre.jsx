import rascunho from '../assets/rascunho-tela.jpeg';
import { ROTULOS_STATUS } from '../utils/filmes.js';

const EXEMPLOS = [
    { titulo: 'A Origem', ano: 2010, genero: 'Ficção científica', status: 'assistido' },
    { titulo: 'Parasita', ano: 2019, genero: 'Suspense', status: 'assistido' },
    { titulo: 'O Auto da Compadecida', ano: 2000, genero: 'Comédia', status: 'assistido' },
    { titulo: 'Duna: Parte Dois', ano: 2024, genero: 'Ficção científica', status: 'assistindo' },
    { titulo: 'Interestelar', ano: 2014, genero: 'Ficção científica', status: 'quero' },
    { titulo: 'Cidade de Deus', ano: 2002, genero: 'Drama', status: 'quero' }
];

const CAMPOS = [
    'Título',
    'Ano de lançamento',
    'Gênero',
    'Pôster (URL da imagem de capa)',
    'Nota (de 1 a 5 estrelas)',
    'Status (assistido, assistindo ou quero assistir)',
    'Comentário (opcional)'
];

export default function Sobre() {
    return (
        <>
            <section>
                <h2>O que é o CineTrack</h2>
                <p>
                    O CineTrack é um gerenciador pessoal de listas de filmes: você registra o que já
                    assistiu, o que está assistindo e o que quer assistir, dá uma nota de 1 a 5 estrelas
                    e deixa um comentário. Na Parte 2, a interface é feita em React e os dados ficam
                    salvos no servidor, em um arquivo JSON acessado por uma API REST.
                </p>
            </section>

            <section>
                <h2>Filmes de exemplo</h2>
                <table>
                    <caption>Filmes carregados pelo script de seed</caption>
                    <thead>
                        <tr>
                            <th scope="col">Título</th>
                            <th scope="col">Ano</th>
                            <th scope="col">Gênero</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EXEMPLOS.map((filme) => (
                            <tr key={filme.titulo}>
                                <td>{filme.titulo}</td>
                                <td>{filme.ano}</td>
                                <td>{filme.genero}</td>
                                <td>{ROTULOS_STATUS[filme.status]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Rascunho da tela</h2>
                <figure>
                    <img
                        src={rascunho}
                        alt="Rascunho da tela principal do CineTrack mostrando a organização da interface"
                    />
                    <figcaption>
                        O desenho mostra um rascunho da tela principal do CineTrack, incluindo busca,
                        filtros, a lista de filmes em cards e as principais ações disponíveis na interface.
                    </figcaption>
                </figure>
            </section>

            <section>
                <details>
                    <summary>Como os dados são organizados</summary>
                    <p>Cada filme do CineTrack possui os seguintes campos:</p>
                    <ul>
                        {CAMPOS.map((campo) => <li key={campo}>{campo}</li>)}
                    </ul>
                </details>
            </section>
        </>
    );
}
