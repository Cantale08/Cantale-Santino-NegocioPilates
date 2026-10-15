import "./SectionHeading.css";

export default function SectionHeading({ id, title, children, align = "left" }) {
    return (
        <div className={`section-heading section-heading--${align}`}>
            <h2 id={id}>{title}</h2>
            {children && <p>{children}</p>}
        </div>
    );
}
