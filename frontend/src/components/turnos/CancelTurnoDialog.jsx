import { describirTurno } from "../../utils/turnos.js";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";

export default function CancelTurnoDialog({ turno, loading, onConfirm, onCancel }) {
    return (
        <ConfirmDialog
            title="Cancelar turno"
            message={`¿Seguro que querés cancelar el turno de ${describirTurno(turno)}? El lugar quedará disponible para otras personas.`}
            confirmLabel="Sí, cancelar turno"
            cancelLabel="Volver"
            loadingText="Cancelando..."
            loading={loading}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}
