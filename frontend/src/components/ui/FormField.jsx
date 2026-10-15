import { useId } from "react";
import "./FormField.css";

export default function FormField({ label, error, hint, as = "input", children, ...props }) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
    const Control = as;

    return (
        <div className={`form-field${error ? " form-field--invalid" : ""}`}>
            <label htmlFor={id}>{label}</label>
            <Control
                id={id}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props}
            >
                {children}
            </Control>
            {hint && (
                <p id={hintId} className="form-field__hint">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="form-field__error">
                    {error}
                </p>
            )}
        </div>
    );
}
