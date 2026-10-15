import { Link } from "react-router-dom";
import Spinner from "./Spinner.jsx";
import "./Button.css";

export default function Button({
    variant = "primary",
    size = "md",
    to,
    loading = false,
    loadingText,
    disabled = false,
    className = "",
    children,
    type = "button",
    ...props
}) {
    const classes = `button button--${variant} button--${size} ${className}`.trim();

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={loading || disabled}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <Spinner inline />}
            {loading && loadingText ? loadingText : children}
        </button>
    );
}
