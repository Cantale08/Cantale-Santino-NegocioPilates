import { useCallback, useEffect, useState } from "react";
import { createClase, deleteClase, getClases, updateClase } from "../services/clasesService.js";

export function useClases() {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        getClases({ signal: controller.signal })
            .then((data) => {
                if (!controller.signal.aborted) {
                    setClases(data);
                }
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError") {
                    setError(requestError.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [attempt]);

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);
        setAttempt((current) => current + 1);
    }, []);

    const crear = useCallback(async (values) => {
        const creada = await createClase(values);
        setClases((current) => [...current, creada]);
        return creada;
    }, []);

    const modificar = useCallback(async (id, values) => {
        const modificada = await updateClase(id, values);
        setClases((current) => current.map((clase) => (clase.id === id ? modificada : clase)));
        return modificada;
    }, []);

    const eliminar = useCallback(async (id) => {
        const eliminada = await deleteClase(id);
        setClases((current) => current.filter((clase) => clase.id !== id));
        return eliminada;
    }, []);

    return { clases, loading, error, reload, crear, modificar, eliminar };
}
