import { BENEFICIOS } from "../../data/contenido.js";
import SectionHeading from "../ui/SectionHeading.jsx";
import BenefitCard from "./BenefitCard.jsx";
import "./BenefitsSection.css";

export default function BenefitsSection() {
    return (
        <section
            id="beneficios"
            tabIndex={-1}
            className="section section--tint"
            aria-labelledby="beneficios-titulo"
        >
            <div className="container">
                <SectionHeading id="beneficios-titulo" title="Beneficios" align="center" />
                <div className="benefits__grid">
                    {BENEFICIOS.map((beneficio) => (
                        <BenefitCard key={beneficio.id} {...beneficio} />
                    ))}
                </div>
            </div>
        </section>
    );
}
