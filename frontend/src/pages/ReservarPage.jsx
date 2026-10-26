import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import FormField from "../components/ui/FormField.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import DisponibilidadCard from "../components/turnos/DisponibilidadCard.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { getDisponibilidad, getMisTurnos, reservarTurno } from "../services/turnosService.js";
import { formatFecha } from "../utils/turnos.js";
import "./ReservarPage.css";

export default function ReservarPage() {
    useDocumentTitle("Reservar clase");
    const { usuario } = useAuth();
    const notifications = useNotifications();
    const esCliente = usuario?.rol === "cliente";

    const fetchMisTurnos = useCallback(
        ({ signal }) => (esCliente ? getMisTurnos({ signal }) : Promise.resolve([])),
        [esCliente]
    );
    const disponibilidad = useAsyncData(getDisponibilidad);
    const misTurnos = useAsyncData(fetchMisTurnos);

    const [tipo, setTipo] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [reservando, setReservando] = useState(false);
    const [confirmacion, setConfirmacion] = useState(null);

    const tipos = useMemo(
        () => [...new Set(disponibilidad.data.map((horario) => horario.tipo))].sort(),
        [disponibilidad.data]
    );
    const visibles = disponibilidad.data.filter((horario) => !tipo || horario.tipo === tipo);
    const reservados = new Set(
        misTurnos.data.filter((turno) => turno.vigente).map((turno) => `${turno.claseId}|${turno.fechaHora}`)
    );

    const handleConfirm = async () => {
        setReservando(true);
        try {
            await reservarTurno(seleccionado.claseId, seleccionado.fecha);
            const mensaje = `Reservaste ${seleccionado.tipo} para el ${formatFecha(seleccionado.fecha)} a las ${seleccionado.horario} hs.`;
            notifications.success("¡Reserva confirmada!");
            setConfirmacion(mensaje);
        } catch (requestError) {
            notifications.error(requestError.message);
        } finally {
            setReservando(false);
            setSeleccionado(null);
            disponibilidad.reload();
            misTurnos.reload();
        }
    };

    const renderList = () => {
        if (disponibilidad.loading) {
            return <LoadingState label="Cargando horarios..." />;
        }
        if (disponibilidad.error) {
            return <ErrorState message={disponibilidad.error} onRetry={disponibilidad.reload} />;
        }
        if (visibles.length === 0) {
            return (
                <EmptyState title="No hay horarios disponibles">
                    <p>No encontramos clases en los próximos 14 días. Probá más tarde.</p>
                </EmptyState>
            );
        }
        return (
            <ul className="reservar__list">
                {visibles.map((horario) => (
                    <li key={`${horario.claseId}-${horario.fecha}`}>
                        <DisponibilidadCard
                            horario={horario}
                            usuario={usuario}
                            reservado={reservados.has(`${horario.claseId}|${horario.fechaHora}`)}
                            onReservar={setSeleccionado}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <section className="section reservar" aria-labelledby="reservar-titulo">
            <div className="container">
                <header className="reservar__header">
                    <h1 id="reservar-titulo">Reservar clase</h1>
                    <p>Elegí una clase y un horario de los próximos 14 días para reservar tu lugar.</p>
                    {!usuario && (
                        <p>
                            Para reservar necesitás <Link to="/login" state={{ from: "/reservar" }}>iniciar sesión</Link>{" "}
                            o <Link to="/registro" state={{ from: "/reservar" }}>crear una cuenta</Link>.
                        </p>
                    )}
                    {usuario && !esCliente && <p>Las reservas solo están disponibles para clientes.</p>}
                </header>

                {confirmacion && (
                    <div className="reservar__confirmacion" role="status">
                        <p>
                            <strong>¡Reserva confirmada!</strong> {confirmacion}
                        </p>
                        <Link to="/mis-turnos">Ver mis turnos</Link>
                    </div>
                )}

                {tipos.length > 1 && (
                    <div className="reservar__filtro">
                        <FormField
                            as="select"
                            label="Filtrar por clase"
                            name="tipo"
                            value={tipo}
                            onChange={(event) => setTipo(event.target.value)}
                        >
                            <option value="">Todas las clases</option>
                            {tipos.map((nombre) => (
                                <option key={nombre} value={nombre}>
                                    {nombre}
                                </option>
                            ))}
                        </FormField>
                    </div>
                )}

                {renderList()}
            </div>

            {seleccionado && (
                <ConfirmDialog
                    title="Confirmar reserva"
                    message={`¿Querés reservar ${seleccionado.tipo} el ${formatFecha(seleccionado.fecha)} a las ${seleccionado.horario} hs?`}
                    confirmLabel="Sí, reservar"
                    confirmVariant="primary"
                    loadingText="Reservando..."
                    loading={reservando}
                    onConfirm={handleConfirm}
                    onCancel={() => setSeleccionado(null)}
                />
            )}
        </section>
    );
}
