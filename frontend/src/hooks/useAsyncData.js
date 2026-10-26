import { useCallback, useEffect, useState } from "react";

// Carga datos con una función de servicio que acepta { signal }.
export function useAsyncData(fetcher) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        fetcher({ signal: controller.signal })
            .then((result) => {
                if (!controller.signal.aborted) {
                    setData(result);
                    setError(null);
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
    }, [fetcher, attempt]);

    const reload = useCallback(() => setAttempt((current) => current + 1), []);

    return { data, loading, error, reload };
}
