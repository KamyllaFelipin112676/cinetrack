import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import Aviso from './components/Aviso.jsx';
import Cabecalho from './components/Cabecalho.jsx';
import FiltrosStatus from './components/FiltrosStatus.jsx';
import FormularioFilme from './components/FormularioFilme.jsx';
import ListaFilmes from './components/ListaFilmes.jsx';
import Navegacao from './components/Navegacao.jsx';
import Rodape from './components/Rodape.jsx';
import Sobre from './components/Sobre.jsx';

import * as api from './api/filmes.js';
import { useDebounce } from './hooks/useDebounce.js';
import { correspondeAosFiltros, filtrarFilmes } from './utils/filmes.js';


function assinarHash(aoMudar) {
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
}

function usePagina() {
    const hash = useSyncExternalStore(assinarHash, () => window.location.hash);
    return hash === '#/sobre' ? 'sobre' : 'inicio';
}


export default function App() {
    const pagina = usePagina();

    const [filmes, setFilmes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState(null);

    const [textoBusca, setTextoBusca] = useState('');
    const termoBusca = useDebounce(textoBusca, 250);
    const [filtro, setFiltro] = useState('todos');

    const [formulario, setFormulario] = useState(null);
    const [idRemovendo, setIdRemovendo] = useState(null);
    const [aviso, setAviso] = useState(null);
    const [tmdbDisponivel, setTmdbDisponivel] = useState(false);

    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        const controle = new AbortController();

        async function carregar() {
            try {
                const lista = await api.listarFilmes({ signal: controle.signal });
                setFilmes(lista);
                setErroCarregamento(null);
            } catch (erro) {
                if (erro.name === 'AbortError') return;
                setErroCarregamento(erro.message);
            } finally {
                if (!controle.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        carregar();
        return () => controle.abort();
    }, [tentativa]);

    useEffect(() => {
        let ativo = true;
        api.tmdbDisponivel().then((disponivel) => ativo && setTmdbDisponivel(disponivel));
        return () => {
            ativo = false;
        };
    }, []);

    function tentarNovamente() {
        setCarregando(true);
        setErroCarregamento(null);
        setTentativa((valor) => valor + 1);
    }

    const visiveis = useMemo(
        () => filtrarFilmes(filmes, termoBusca, filtro),
        [filmes, termoBusca, filtro]
    );

    const fecharAviso = useCallback(() => setAviso(null), []);

    async function salvarFilme(dados) {
        const editando = formulario?.filme;
        let salvo;

        if (editando) {
            salvo = await api.atualizarFilme(editando.id, dados);
            setFilmes((atuais) => atuais.map((filme) => (filme.id === salvo.id ? salvo : filme)));
        } else {
            salvo = await api.criarFilme(dados);
            setFilmes((atuais) => [...atuais, salvo]);
        }

        if (!correspondeAosFiltros(salvo, textoBusca, filtro)) {
            setTextoBusca('');
            setFiltro('todos');
        }

        setFormulario(null);
        setAviso({
            tipo: 'sucesso',
            texto: editando ? `“${salvo.titulo}” foi atualizado.` : `“${salvo.titulo}” foi adicionado.`
        });
    }

    async function removerFilme(filme) {
        if (!window.confirm(`Remover "${filme.titulo}" da sua lista?`)) {
            return;
        }

        setIdRemovendo(filme.id);
        try {
            await api.removerFilme(filme.id);
            setFilmes((atuais) => atuais.filter((item) => item.id !== filme.id));
            setAviso({ tipo: 'sucesso', texto: `“${filme.titulo}” foi removido.` });
        } catch (erro) {
            if (erro.status === 404) {
                setFilmes((atuais) => atuais.filter((item) => item.id !== filme.id));
            }
            setAviso({ tipo: 'erro', texto: `Não foi possível remover “${filme.titulo}”: ${erro.message}` });
        } finally {
            setIdRemovendo(null);
        }
    }

    return (
        <>
            <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>

            <Cabecalho
                busca={textoBusca}
                aoMudarBusca={setTextoBusca}
                aoAdicionar={() => setFormulario({ filme: null })}
                mostrarBusca={pagina === 'inicio'}
            />
            <Navegacao pagina={pagina} />

            <main id="conteudo" tabIndex={-1}>
                {pagina === 'sobre' ? (
                    <Sobre />
                ) : (
                    <>
                        <FiltrosStatus filtro={filtro} aoMudar={setFiltro} />
                        <ListaFilmes
                            filmes={visiveis}
                            total={filmes.length}
                            carregando={carregando}
                            erro={erroCarregamento}
                            aoTentarNovamente={tentarNovamente}
                            aoEditar={(filme) => setFormulario({ filme })}
                            aoRemover={removerFilme}
                            idRemovendo={idRemovendo}
                        />
                    </>
                )}
            </main>

            <Rodape pagina={pagina} />

            {formulario && (
                <FormularioFilme
                    filme={formulario.filme}
                    aoSalvar={salvarFilme}
                    aoFechar={() => setFormulario(null)}
                    tmdbDisponivel={tmdbDisponivel}
                />
            )}

            <Aviso aviso={aviso} aoFechar={fecharAviso} />
        </>
    );
}