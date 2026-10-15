import { useEffect, useId, useRef } from "react";
import Button from "./Button.jsx";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loading = false,
    onConfirm,
    onCancel
}) {
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement;

        if (!dialog.open) {
            dialog.showModal();
        }
        cancelRef.current?.focus();

        return () => {
            if (dialog.open) {
                dialog.close();
            }
            if (previouslyFocused?.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, []);

    const handleCancel = (event) => {
        event.preventDefault();
        if (!loading) {
            onCancel();
        }
    };

    const handleBackdropClick = (event) => {
        if (event.target === dialogRef.current) {
            handleCancel(event);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
        >
            <div className="confirm-dialog__body">
                <h2 id={titleId}>{title}</h2>
                <p id={descriptionId}>{message}</p>
                <div className="confirm-dialog__actions">
                    <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        loading={loading}
                        loadingText="Eliminando..."
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
