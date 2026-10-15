import { IMAGENES_CLASES } from "../../data/contenido.js";
import ClaseCard from "../clases/ClaseCard.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import LoadingState from "../ui/LoadingState.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import "./ClassesSection.css";

const MAX_VISIBLE = 3;

export default function ClassesSection({ clases, loading, error, onRetry }) {
    const visibles = clases.slice(0, MAX_VISIBLE);

    const renderContent = () => {
        if (loading) {
            return <LoadingState label="Cargando clases..." />;
        }
        if (error) {
            return <ErrorState message={error} onRetry={onRetry} />;
        }
        if (clases.length === 0) {
            return (
                <EmptyState title="Todavía no hay clases publicadas">
                    <p>Cuando se carguen, vas a poder verlas acá.</p>
                    <Button to="/admin/clases" variant="secondary" size="sm">
                        Cargar una clase
                    </Button>
                </EmptyState>
            );
        }
        return (
            <ul className="classes__grid">
                {visibles.map((clase, index) => (
                    <li key={clase.id}>
                        <ClaseCard clase={clase} imagen={IMAGENES_CLASES[index % IMAGENES_CLASES.length]} />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <section id="clases" tabIndex={-1} className="section" aria-labelledby="clases-titulo">
            <div className="container classes__inner">
                <div className="classes__intro">
                    <SectionHeading id="clases-titulo" title="Nuestras clases">
                        Clases grupales e individuales a cargo de instructores, con camas Reformer, tabla
                        de salto y box para trabajar fuerza, equilibrio y control.
                    </SectionHeading>
                    <Button to="/admin/clases" variant="secondary">
                        Ver todas las clases
                    </Button>
                </div>
                <div className="classes__content">{renderContent()}</div>
            </div>
        </section>
    );
}
