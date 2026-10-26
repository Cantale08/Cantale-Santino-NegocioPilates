import { useState } from "react";
import CancelTurnoDialog from "../components/turnos/CancelTurnoDialog.jsx";
import TurnosTable from "../components/turnos/TurnosTable.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { cancelarTurno, getMisTurnos } from "../services/turnosService.js";
import { describirTurno, ordenarTurnos } from "../utils/turnos.js";
import "./AdminClasesPage.css";

export default function MisTurnosPage() {
    useDocumentTitle("Mis turnos");
    const { data: turnos, loading, error, reload } = useAsyncData(getMisTurnos);
    const notifications = useNotifications();
    const [turnoToCancel, setTurnoToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const handleConfirmCancel = async () => {
        setCancelling(true);
        try {
            await cancelarTurno(turnoToCancel.id);
            notifications.success(`Cancelaste el turno de ${describirTurno(turnoToCancel)}.`);
        } catch (requestError) {
            notifications.error(requestError.message);
        } finally {
            setCancelling(false);
            setTurnoToCancel(null);
            reload();
        }
    };

    const renderContent = () => {
        if (loading) {
            return <LoadingState label="Cargando tus turnos..." />;
        }
        if (error) {
            return <ErrorState message={error} onRetry={reload} />;
        }
        if (turnos.length === 0) {
            return (
                <EmptyState title="Todavía no reservaste ningún turno">
                    <Button to="/reservar" size="sm">
                        Reservar una clase
                    </Button>
                </EmptyState>
            );
        }
        return <TurnosTable turnos={ordenarTurnos(turnos)} onCancel={setTurnoToCancel} />;
    };

    return (
        <section className="section admin" aria-labelledby="mis-turnos-titulo">
            <div className="container">
                <header className="admin__header">
                    <h1 id="mis-turnos-titulo">Mis turnos</h1>
                    <p>Consultá tus reservas y cancelá las que ya no vas a usar.</p>
                </header>
                {renderContent()}
            </div>

            {turnoToCancel && (
                <CancelTurnoDialog
                    turno={turnoToCancel}
                    loading={cancelling}
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setTurnoToCancel(null)}
                />
            )}
        </section>
    );
}
