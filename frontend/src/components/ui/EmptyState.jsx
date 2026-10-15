import "./StateMessage.css";

export default function EmptyState({ title, children }) {
    return (
        <div className="state-message">
            <p className="state-message__title">{title}</p>
            {children}
        </div>
    );
}
