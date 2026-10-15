import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToHash() {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;

        if (!target) {
            window.scrollTo({ top: 0 });
            return;
        }

        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        target.focus({ preventScroll: true });
    }, [pathname, hash, key]);
}
