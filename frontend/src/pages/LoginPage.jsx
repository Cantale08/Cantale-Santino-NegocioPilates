import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useForm } from "../hooks/useForm.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { destinoPorRol } from "../utils/auth.js";
import { loginValidators } from "../utils/validacionesAuth.js";
import "./AuthPage.css";

export default function LoginPage() {
    useDocumentTitle("Iniciar sesión");
    const { usuario, login } = useAuth();
    const notifications = useNotifications();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const { formRef, values, errors, handleChange, handleBlur, validateAll } = useForm(
        { email: "", contrasenia: "" },
        loginValidators
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
            const autenticado = await login({ email: values.email.trim(), contrasenia: values.contrasenia });
            notifications.success(`¡Hola, ${autenticado.nombre}! Iniciaste sesión correctamente.`);
        } catch (requestError) {
            notifications.error(requestError.message);
            setSubmitting(false);
        }
    };

    return (
        <section className="section auth" aria-labelledby="login-titulo">
            <div className="auth__card">
                <h1 id="login-titulo">Iniciar sesión</h1>
                <p className="auth__intro">Ingresá para reservar y administrar tus turnos.</p>
                <form ref={formRef} className="auth__form" noValidate onSubmit={handleSubmit}>
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={values.email}
                        error={errors.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    <FormField
                        label="Contraseña"
                        name="contrasenia"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={values.contrasenia}
                        error={errors.contrasenia}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    <Button type="submit" loading={submitting} loadingText="Ingresando...">
                        Ingresar
                    </Button>
                </form>
                <p className="auth__alt">
                    ¿Todavía no tenés cuenta? <Link to="/registro" state={location.state}>Registrate</Link>
                </p>
            </div>
        </section>
    );
}
