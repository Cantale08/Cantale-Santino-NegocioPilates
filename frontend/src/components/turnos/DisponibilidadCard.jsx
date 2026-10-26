import { formatFecha, formatLugares } from "../../utils/turnos.js";
import Button from "../ui/Button.jsx";
import "./DisponibilidadCard.css";

export default function DisponibilidadCard({ horario, reservado, usuario, onReservar }) {
    const completo = horario.disponibles === 0;

    const renderAction = () => {
        if (!usuario) {
            return (
                <Button to="/login" variant="secondary" size="sm">
                    Ingresá para reservar
                </Button>
            );
        }
        if (usuario.rol !== "cliente") {
            return null;
        }
        if (reservado) {
            return <p className="horario-card__status">Ya reservaste esta clase</p>;
        }
        return (
            <Button
                size="sm"
                disabled={completo}
                onClick={() => onReservar(horario)}
                aria-label={`Reservar ${horario.tipo}, ${formatFecha(horario.fecha)} ${horario.horario} hs`}
            >
                {completo ? "Sin cupo" : "Reservar"}
            </Button>
        );
    };

    return (
        <article className={`horario-card${completo ? " horario-card--completo" : ""}`}>
            <div>
                <h3>{horario.tipo}</h3>
                <p className="horario-card__schedule">
                    {`${formatFecha(horario.fecha)} · ${horario.horario} hs`}
                </p>
                <p className="horario-card__meta">
                    {`Instructor N.º ${horario.instructorId} · ${
                        completo ? "Clase completa" : formatLugares(horario.disponibles)
                    }`}
                </p>
            </div>
            {renderAction()}
        </article>
    );
}
