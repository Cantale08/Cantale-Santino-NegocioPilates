import Button from "./Button.jsx";
import "./StateMessage.css";

export default function ErrorState({ message, onRetry }) {
    return (
        <div className="state-message state-message--error" role="alert">
            <p className="state-message__title">No pudimos cargar la información</p>
            <p>{message}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}
