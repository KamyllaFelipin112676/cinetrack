import { useEffect } from 'react';

// Aviso de sucesso ou de falha de requisição.
export default function Aviso({ aviso, aoFechar }) {
    useEffect(() => {
        if (!aviso) return undefined;
        const temporizador = setTimeout(aoFechar, aviso.tipo === 'erro' ? 8000 : 4000);
        return () => clearTimeout(temporizador);
    }, [aviso, aoFechar]);

    if (!aviso) return null;

    return (
        <div className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
            <span>{aviso.texto}</span>
            <button type="button" onClick={aoFechar} aria-label="Fechar aviso">×</button>
        </div>
    );
}
