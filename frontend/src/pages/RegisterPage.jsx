import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useForm } from "../hooks/useForm.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { destinoPorRol } from "../utils/auth.js";
import { registroValidators } from "../utils/validacionesAuth.js";
import "./AuthPage.css";

const INITIAL_VALUES = {
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    contrasenia: "",
    confirmacion: ""
};

export default function RegisterPage() {
    useDocumentTitle("Crear cuenta");
    const { usuario, register } = useAuth();
    const notifications = useNotifications();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const { formRef, values, errors, handleChange, handleBlur, validateAll } = useForm(
        INITIAL_VALUES,
        registroValidators
    );

    if (usuario) {
        return <Navigate to={location.state?.from ?? destinoPorRol(usuario)} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateAll()) {
            return;
        }
        setSubmitting(true);
        try {
            const { confirmacion, ...datos } = values;
            const registrado = await register({
                ...datos,
                nombre: datos.nombre.trim(),
                apellido: datos.apellido.trim(),
                email: datos.email.trim()
            });
            notifications.success(`¡Bienvenido/a, ${registrado.nombre}! Tu cuenta fue creada.`);
        } catch (requestError) {
            notifications.error(requestError.message);
            setSubmitting(false);
        }
    };

    const field = (name, label, props = {}) => (
        <FormField
            label={label}
            name={name}
            required
            value={values[name]}
            error={errors[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
        />
    );

    return (
        <section className="section auth" aria-labelledby="registro-titulo">
            <div className="auth__card">
                <h1 id="registro-titulo">Crear cuenta</h1>
                <p className="auth__intro">Registrate para reservar tus clases de Pilates.</p>
                <form ref={formRef} className="auth__form" noValidate onSubmit={handleSubmit}>
                    {field("nombre", "Nombre", { type: "text", autoComplete: "given-name" })}
                    {field("apellido", "Apellido", { type: "text", autoComplete: "family-name" })}
                    {field("email", "Email", { type: "email", autoComplete: "email" })}
                    {field("telefono", "Teléfono", { type: "tel", autoComplete: "tel" })}
                    {field("dni", "DNI", { type: "text", inputMode: "numeric", hint: "Sin puntos ni espacios." })}
                    {field("contrasenia", "Contraseña", {
                        type: "password",
                        autoComplete: "new-password",
                        hint: "Entre 8 y 64 caracteres."
                    })}
                    {field("confirmacion", "Repetir contraseña", {
                        type: "password",
                        autoComplete: "new-password"
                    })}
                    <Button type="submit" loading={submitting} loadingText="Creando cuenta...">
                        Crear cuenta
                    </Button>
                </form>
                <p className="auth__alt">
                    ¿Ya tenés cuenta? <Link to="/login" state={location.state}>Iniciá sesión</Link>
                </p>
            </div>
        </section>
    );
}
