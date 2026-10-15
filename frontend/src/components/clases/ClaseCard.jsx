import { formatCupo, formatDia, formatHorario } from "../../utils/clases.js";
import "./ClaseCard.css";

export default function ClaseCard({ clase, imagen }) {
    return (
        <article className="clase-card">
            <img src={imagen.src} alt={imagen.alt} width="300" height="400" loading="lazy" />
            <div className="clase-card__body">
                <h3>{clase.tipo}</h3>
                <p className="clase-card__schedule">
                    {formatDia(clase.dia)} · {formatHorario(clase.horario)}
                </p>
                <p>Cupo: {formatCupo(clase.cupoMaximo)}</p>
                <p>Instructor N.º {clase.instructorId}</p>
            </div>
        </article>
    );
}
