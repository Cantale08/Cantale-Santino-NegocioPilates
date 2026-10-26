import { formatDia } from "../../utils/clases.js";
import { describirTurno, estadoTurno, formatFechaHora } from "../../utils/turnos.js";
import Button from "../ui/Button.jsx";
import "../clases/ClasesTable.css";
import "./TurnosTable.css";

export default function TurnosTable({ turnos, showCliente = false, onCancel }) {
    return (
        <div className="table-wrapper" role="region" aria-label="Tabla de turnos" tabIndex={0}>
            <table className="clases-table">
                <caption className="visually-hidden">Listado de turnos</caption>
                <thead>
                    <tr>
                        <th scope="col">Clase</th>
                        <th scope="col">Fecha y horario</th>
                        {showCliente && <th scope="col">Cliente</th>}
                        <th scope="col">Estado</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {turnos.map((turno) => {
                        const estado = estadoTurno(turno);
                        return (
                            <tr key={turno.id}>
                                <th scope="row">
                                    {turno.clase ? turno.clase.tipo : "Clase eliminada"}
                                    {turno.clase && (
                                        <span className="turnos-table__detail">
                                            {formatDia(turno.clase.dia)}
                                        </span>
                                    )}
                                </th>
                                <td>{formatFechaHora(turno.fechaHora)}</td>
                                {showCliente && (
                                    <td>
                                        {turno.cliente
                                            ? `${turno.cliente.nombre} ${turno.cliente.apellido}`
                                            : "—"}
                                        {turno.cliente && (
                                            <span className="turnos-table__detail">{turno.cliente.email}</span>
                                        )}
                                    </td>
                                )}
                                <td>
                                    <span className={`turno-badge turno-badge--${estado.value}`}>
                                        {estado.label}
                                    </span>
                                </td>
                                <td>
                                    {turno.vigente && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => onCancel(turno)}
                                            aria-label={`Cancelar turno: ${describirTurno(turno)}`}
                                        >
                                            Cancelar turno
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
