import { useEffect, useState } from 'react';

export function useDebounce(valor, espera = 250) {
    const [atrasado, setAtrasado] = useState(valor);

    useEffect(() => {
        const temporizador = setTimeout(() => setAtrasado(valor), espera);
        return () => clearTimeout(temporizador);
    }, [valor, espera]);

    return atrasado;
}
