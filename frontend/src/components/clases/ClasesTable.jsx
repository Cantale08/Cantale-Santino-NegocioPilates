import { formatDia, formatHorario } from "../../utils/clases.js";
import Button from "../ui/Button.jsx";
import "./ClasesTable.css";

export default function ClasesTable({ clases, editingId, onEdit, onDelete }) {
    return (
        <div className="table-wrapper" role="region" aria-label="Tabla de clases" tabIndex={0}>
            <table className="clases-table">
                <caption className="visually-hidden">Listado de clases cargadas</caption>
                <thead>
                    <tr>
                        <th scope="col">Clase</th>
                        <th scope="col">Día</th>
                        <th scope="col">Horario</th>
                        <th scope="col">Cupo</th>
                        <th scope="col">Instructor</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clases.map((clase) => {
                        const nombre = `${clase.tipo} del ${formatDia(clase.dia)} a las ${clase.horario}`;
                        return (
                            <tr key={clase.id} className={clase.id === editingId ? "is-editing" : ""}>
                                <th scope="row">{clase.tipo}</th>
                                <td>{formatDia(clase.dia)}</td>
                                <td>{formatHorario(clase.horario)}</td>
                                <td>{clase.cupoMaximo}</td>
                                <td>N.º {clase.instructorId}</td>
                                <td>
                                    <div className="clases-table__actions">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onEdit(clase)}
                                            aria-label={`Editar ${nombre}`}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => onDelete(clase)}
                                            aria-label={`Eliminar ${nombre}`}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
