const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const required = (message) => (value) => (value.trim() ? null : message);

export const loginValidators = {
    email: (value) => (EMAIL.test(value.trim()) ? null : "Ingresá un email válido."),
    contrasenia: (value) => (value ? null : "Ingresá tu contraseña.")
};

export const registroValidators = {
    nombre: required("Ingresá tu nombre."),
    apellido: required("Ingresá tu apellido."),
    email: loginValidators.email,
    telefono: (value) =>
        /^\+?\d{8,15}$/.test(value.replace(/[\s-]/g, ""))
            ? null
            : "Ingresá un teléfono de 8 a 15 dígitos.",
    dni: (value) => (/^\d{7,8}$/.test(value.trim()) ? null : "El DNI debe tener 7 u 8 dígitos, sin puntos."),
    contrasenia: (value) =>
        value.length >= 8 && value.length <= 64 ? null : "La contraseña debe tener entre 8 y 64 caracteres.",
    confirmacion: (value, values) => (value === values.contrasenia ? null : "Las contraseñas no coinciden.")
};
