import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import AboutSection from "../components/home/AboutSection.jsx";
import BenefitsSection from "../components/home/BenefitsSection.jsx";
import ClassesSection from "../components/home/ClassesSection.jsx";
import Hero from "../components/home/Hero.jsx";
import { useClases } from "../hooks/useClases.js";

export default function HomePage() {
    useDocumentTitle();
    const { clases, loading, error, reload } = useClases();

    return (
        <>
            <Hero />
            <BenefitsSection />
            <ClassesSection clases={clases} loading={loading} error={error} onRetry={reload} />
            <AboutSection />
        </>
    );
}
