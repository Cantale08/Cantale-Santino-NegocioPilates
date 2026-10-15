import Spinner from "./Spinner.jsx";
import "./StateMessage.css";

export default function LoadingState({ label = "Cargando..." }) {
    return (
        <div className="state-message" role="status">
            <Spinner />
            <p>{label}</p>
        </div>
    );
}
