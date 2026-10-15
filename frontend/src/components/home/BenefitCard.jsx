import "./BenefitCard.css";

export default function BenefitCard({ titulo, descripcion, imagen, alt }) {
    return (
        <article className="benefit-card">
            <img src={imagen} alt={alt} width="240" height="240" loading="lazy" />
            <h3>{titulo}</h3>
            <p>{descripcion}</p>
        </article>
    );
}
