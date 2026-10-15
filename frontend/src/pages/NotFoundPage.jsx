import Button from "../components/ui/Button.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFoundPage() {
    useDocumentTitle("Página no encontrada");

    return (
        <section className="section" aria-labelledby="no-encontrada-titulo">
            <div className="container not-found">
                <h1 id="no-encontrada-titulo">No encontramos esta página</h1>
                <p>La dirección que ingresaste no existe o fue movida.</p>
                <Button to="/">Volver al inicio</Button>
            </div>
        </section>
    );
}
