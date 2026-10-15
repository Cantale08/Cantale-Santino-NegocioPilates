import aboutImage from "../../assets/sobre-nosotros.svg";
import SectionHeading from "../ui/SectionHeading.jsx";
import "./AboutSection.css";

export default function AboutSection() {
    return (
        <section
            id="sobre-nosotros"
            tabIndex={-1}
            className="section section--tint"
            aria-labelledby="sobre-nosotros-titulo"
        >
            <div className="container about__inner">
                <img
                    src={aboutImage}
                    alt="Ilustración del interior del estudio, con ventanales en arco, plantas y una cama Reformer"
                    width="640"
                    height="560"
                    loading="lazy"
                />
                <div>
                    <SectionHeading id="sobre-nosotros-titulo" title="Sobre nosotros" />
                    <p>
                        Somos un centro de pilates del barrio de Floresta. Ofrecemos clases orientadas a
                        mejorar la postura, la flexibilidad, la fuerza y el bienestar físico de cada
                        alumno, a su ritmo y con un trato personalizado.
                    </p>
                    <p>
                        Nos importa que vengas a un lugar tranquilo: música suave, voces bajas y una
                        atención amable, donde el profesionalismo y la cordialidad son lo primero.
                    </p>
                </div>
            </div>
        </section>
    );
}
