import { useEffect, useRef, useState } from 'react';
import BuscaTmdb from './BuscaTmdb.jsx';
import {
    ANO_MAX,
    ANO_MIN,
    CAMPOS_FORMULARIO,
    MAX_COMENTARIO,
    MAX_GENERO,
    MAX_TITULO,
    ROTULOS_STATUS,
    dadosDoFormulario,
    validarFilme
} from '../utils/filmes.js';

function valoresIniciais(filme) {
    return {
        titulo: filme?.titulo ?? '',
        ano: filme?.ano != null ? String(filme.ano) : '',
        genero: filme?.genero ?? '',
        poster: filme?.poster ?? '',
        status: filme?.status ?? 'assistido',
        nota: filme?.nota != null ? String(filme.nota) : '',
        comentario: filme?.comentario ?? ''
    };
}

export default function FormularioFilme({ filme, aoSalvar, aoFechar, tmdbDisponivel }) {
    const dialogo = useRef(null);
    const [valores, setValores] = useState(() => valoresIniciais(filme));
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState('');
    const [salvando, setSalvando] = useState(false);
    const editando = Boolean(filme);

    useEffect(() => {
        const elemento = dialogo.current;
        if (!elemento.open) {
            elemento.showModal();
        }
        return () => {
            if (elemento.open) {
                elemento.close();
            }
        };
    }, []);

    function focarCampo(campo) {
        document.getElementById(campo)?.focus();
    }

    function alterarCampo(evento) {
        const { name, value } = evento.target;
        setValores((atuais) => ({ ...atuais, [name]: value }));
        // Apaga a mensagem de erro quando o campo é preenchido pelo usuário
        if (erros[name]) {
            setErros(({ [name]: _removido, ...restantes }) => restantes);
        }
    }

    function preencherPeloTmdb(resultado) {
        setValores((atuais) => ({
            ...atuais,
            titulo: resultado.titulo || atuais.titulo,
            ano: resultado.ano ? String(resultado.ano) : atuais.ano,
            poster: resultado.poster || atuais.poster
        }));
        setErros(({ titulo: _t, ano: _a, poster: _p, ...restantes }) => restantes);
    }

    async function enviar(evento) {
        evento.preventDefault();
        if (salvando) return;

        const dados = dadosDoFormulario(valores);
        const novosErros = validarFilme(dados);
        setErros(novosErros);
        setErroGeral('');

        const primeiroComErro = CAMPOS_FORMULARIO.find((campo) => novosErros[campo]);
        if (primeiroComErro) {
            focarCampo(primeiroComErro);
            return; // O envio carrega apenas quando não tem maius erros
        }

        setSalvando(true);
        try {
            await aoSalvar(dados);
        } catch (falha) {
            const errosServidor = Object.fromEntries(
                Object.entries(falha.detalhes || {}).filter(([campo]) => CAMPOS_FORMULARIO.includes(campo))
            );
            setErros(errosServidor);
            setErroGeral(falha.message || 'Não foi possível salvar o filme.');
            setSalvando(false);
        }
    }

    // Fecha ao Cancelar, dar Esc ou depois de salvar.
    function aoFecharDialogo() {
        if (dialogo.current?.open) return;
        aoFechar();
    }

    function aoCancelarDialogo(evento) {
        if (salvando) {
            evento.preventDefault();
        }
    }

    const propsCampo = (campo) => ({
        id: campo,
        name: campo,
        value: valores[campo],
        onChange: alterarCampo,
        className: 'caixa-texto',
        'aria-invalid': erros[campo] ? 'true' : undefined,
        'aria-describedby': `erro-${campo}`,
        disabled: salvando
    });

    const mensagem = (campo) => (
        <p className="erro" id={`erro-${campo}`} role="alert">{erros[campo] || ''}</p>
    );

    return (
        <dialog ref={dialogo} aria-labelledby="modal-titulo" onClose={aoFecharDialogo} onCancel={aoCancelarDialogo}>
            <form onSubmit={enviar} noValidate>
                <h2 id="modal-titulo">{editando ? 'Editar filme' : 'Adicionar filme'}</h2>

                <div className="campo">
                    <label htmlFor="titulo">Título</label>
                    <input {...propsCampo('titulo')} type="text" maxLength={MAX_TITULO} autoFocus />
                    {mensagem('titulo')}
                    {tmdbDisponivel && (
                        <BuscaTmdb titulo={valores.titulo} aoEscolher={preencherPeloTmdb} desabilitado={salvando} />
                    )}
                </div>

                <div className="campo">
                    <label htmlFor="ano">Ano</label>
                    <input {...propsCampo('ano')} type="number" min={ANO_MIN} max={ANO_MAX} />
                    {mensagem('ano')}
                </div>

                <div className="campo">
                    <label htmlFor="genero">Gênero</label>
                    <input {...propsCampo('genero')} type="text" maxLength={MAX_GENERO} />
                    {mensagem('genero')}
                </div>

                <div className="campo">
                    <label htmlFor="poster">URL do pôster (opcional)</label>
                    <input {...propsCampo('poster')} type="text" inputMode="url" placeholder="https://..." />
                    {mensagem('poster')}
                </div>

                <div className="campo">
                    <label htmlFor="status">Status</label>
                    <select {...propsCampo('status')}>
                        {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
                            <option key={valor} value={valor}>{rotulo}</option>
                        ))}
                    </select>
                    {mensagem('status')}
                </div>

                <div className="campo">
                    <label htmlFor="nota">Nota (1 a 5)</label>
                    <input {...propsCampo('nota')} type="number" min="1" max="5" step="1" />
                    {mensagem('nota')}
                </div>

                <div className="campo">
                    <label htmlFor="comentario">Comentário (opcional)</label>
                    <textarea {...propsCampo('comentario')} rows={4} maxLength={MAX_COMENTARIO} />
                    {mensagem('comentario')}
                </div>

                {/* Perto dos botões para ficar visível logo após clicar em Salvar */}
                {erroGeral && (
                    <div className="alerta alerta-erro" role="alert">{erroGeral}</div>
                )}

                <div className="acoes-form">
                    <button type="submit" className="botao-salvar" disabled={salvando}>
                        {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button
                        type="button"
                        className="botao-cancelar"
                        onClick={() => dialogo.current.close()}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </dialog>
    );
}
