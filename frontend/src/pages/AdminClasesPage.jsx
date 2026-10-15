import { useState } from "react";
import ClaseForm from "../components/clases/ClaseForm.jsx";
import ClasesTable from "../components/clases/ClasesTable.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import { useClases } from "../hooks/useClases.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { formatDia } from "../utils/clases.js";
import "./AdminClasesPage.css";

export default function AdminClasesPage() {
    useDocumentTitle("Gestión de clases");
    const { clases, loading, error, reload, crear, modificar, eliminar } = useClases();
    const notifications = useNotifications();
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [claseToDelete, setClaseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (payload) => {
        setSaving(true);
        try {
            if (editing) {
                await modificar(editing.id, payload);
                notifications.success("La clase se modificó correctamente.");
                setEditing(null);
            } else {
                await crear(payload);
                notifications.success("La clase se creó correctamente.");
            }
            return true;
        } catch (requestError) {
            notifications.error(requestError.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await eliminar(claseToDelete.id);
            notifications.success(`Se eliminó la clase ${claseToDelete.tipo}.`);
            if (editing?.id === claseToDelete.id) {
                setEditing(null);
            }
        } catch (requestError) {
            notifications.error(requestError.message);
            if (requestError.status === 404) {
                reload();
            }
        } finally {
            setDeleting(false);
            setClaseToDelete(null);
        }
    };

    const renderList = () => {
        if (loading) {
            return <LoadingState label="Cargando clases..." />;
        }
        if (error) {
            return <ErrorState message={error} onRetry={reload} />;
        }
        if (clases.length === 0) {
            return (
                <EmptyState title="Todavía no hay clases cargadas">
                    <p>Completá el formulario para crear la primera.</p>
                </EmptyState>
            );
        }
        return (
            <ClasesTable
                clases={clases}
                editingId={editing?.id}
                onEdit={setEditing}
                onDelete={setClaseToDelete}
            />
        );
    };

    return (
        <section className="section admin" aria-labelledby="admin-titulo">
            <div className="container">
                <header className="admin__header">
                    <h1 id="admin-titulo">Gestión de clases</h1>
                    <p>Creá, modificá o eliminá las clases que se muestran en el sitio.</p>
                </header>

                <div className="admin__layout">
                    <ClaseForm
                        key={editing?.id ?? "nueva"}
                        clase={editing}
                        submitting={saving}
                        onSubmit={handleSubmit}
                        onCancel={() => setEditing(null)}
                    />
                    <section aria-labelledby="admin-listado">
                        <h2 id="admin-listado">Clases cargadas</h2>
                        {renderList()}
                    </section>
                </div>
            </div>

            {claseToDelete && (
                <ConfirmDialog
                    title="Eliminar clase"
                    message={`¿Seguro que querés eliminar la clase ${claseToDelete.tipo} del ${formatDia(claseToDelete.dia)} a las ${claseToDelete.horario}? Esta acción no se puede deshacer.`}
                    confirmLabel="Sí, eliminar"
                    loading={deleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setClaseToDelete(null)}
                />
            )}
        </section>
    );
}
