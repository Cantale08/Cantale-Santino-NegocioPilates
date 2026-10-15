import "./Spinner.css";

export default function Spinner({ inline = false }) {
    return <span className={`spinner${inline ? " spinner--inline" : ""}`} aria-hidden="true" />;
}
