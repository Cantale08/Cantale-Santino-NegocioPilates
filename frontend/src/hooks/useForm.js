import { useRef, useState } from "react";

// Formularios controlados con validación por campo; `validators` mapea nombre -> (valor, valores) => error | null.
export function useForm(initialValues, validators) {
    const formRef = useRef(null);
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const validateField = (name, value, allValues) => validators[name](value, allValues) ?? undefined;

    const handleChange = (event) => {
        const { name, value } = event.target;
        const next = { ...values, [name]: value };
        setValues(next);
        if (errors[name]) {
            setErrors((current) => ({ ...current, [name]: validateField(name, value, next) }));
        }
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        setErrors((current) => ({ ...current, [name]: validateField(name, value, values) }));
    };

    // Devuelve true si no hay errores; si los hay, los muestra y enfoca el primero.
    const validateAll = () => {
        const found = {};
        for (const name of Object.keys(validators)) {
            const error = validateField(name, values[name], values);
            if (error) {
                found[name] = error;
            }
        }
        setErrors(found);
        const firstInvalid = Object.keys(found)[0];
        if (firstInvalid) {
            formRef.current.elements[firstInvalid].focus();
        }
        return !firstInvalid;
    };

    return { formRef, values, errors, handleChange, handleBlur, validateAll };
}
