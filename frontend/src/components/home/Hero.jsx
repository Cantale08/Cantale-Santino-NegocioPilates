import Button from "../ui/Button.jsx";
import heroImage from "../../assets/hero.svg";
import "./Hero.css";

export default function Hero() {
    return (
        <section id="inicio" className="hero" aria-labelledby="hero-titulo">
            <div className="container hero__inner">
                <div className="hero__content">
                    <h1 id="hero-titulo">Pilates para moverte mejor y sentirte bien</h1>
                    <p>
                        Clases en un ambiente sereno, con equipos Reformer y el acompañamiento cercano
                        de nuestros instructores. Mejorá tu postura, tu flexibilidad y tu bienestar.
                    </p>
                    <Button to="/#clases" size="lg">
                        Reservar clase
                    </Button>
                </div>
                <img
                    className="hero__image"
                    src={heroImage}
                    alt="Ilustración de un estudio de pilates con una cama Reformer frente a un arco verde"
                    width="600"
                    height="640"
                />
            </div>
        </section>
    );
}
