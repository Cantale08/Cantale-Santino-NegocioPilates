import { useEffect, useId, useRef, useState } from "react";
import { DIAS } from "../../utils/clases.js";
import {
    EMPTY_CLASE_FORM,
    claseToFormValues,
    formValuesToPayload,
    validateClase,
    validateField
} from "../../utils/validaciones.js";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import "./ClaseForm.css";

export default function ClaseForm({ clase, submitting, onSubmit, onCancel }) {
    const isEditing = Boolean(clase);
    const titleId = useId();
    const formRef = useRef(null);
    const [values, setValues] = useState(() =>
        clase ? claseToFormValues(clase) : { ...EMPTY_CLASE_FORM }
    );
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            formRef.current.elements.tipo.focus();
        }
    }, [isEditing]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        if (errors[name]) {
            setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const foundErrors = validateClase(values);
        setErrors(foundErrors);

        const firstInvalid = Object.keys(foundErrors)[0];
        if (firstInvalid) {
            formRef.current.elements[firstInvalid].focus();
            return;
        }

        const saved = await onSubmit(formValuesToPayload(values));
        if (saved && !isEditing) {
            setValues({ ...EMPTY_CLASE_FORM });
            setErrors({});
            formRef.current?.elements.tipo.focus();
        }
    };

    return (
        <form
            ref={formRef}
            className="clase-form"
            aria-labelledby={titleId}
            noValidate
            onSubmit={handleSubmit}
        >
            <h2 id={titleId}>{isEditing ? `Editar clase N.º ${clase.id}` : "Nueva clase"}</h2>

            <FormField
                label="Tipo de clase"
                name="tipo"
                type="text"
                autoComplete="off"
                required
                value={values.tipo}
                error={errors.tipo}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <FormField
                as="select"
                label="Día"
                name="dia"
                required
                value={values.dia}
                error={errors.dia}
                onChange={handleChange}
                onBlur={handleBlur}
            >
                <option value="">Seleccioná un día</option>
                {DIAS.map((dia) => (
                    <option key={dia.value} value={dia.value}>
                        {dia.label}
                    </option>
                ))}
            </FormField>
            <FormField
                label="Horario"
                name="horario"
                type="time"
                required
                value={values.horario}
                error={errors.horario}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <FormField
                label="Cupo máximo"
                name="cupoMaximo"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                required
                hint="Cantidad máxima de alumnos."
                value={values.cupoMaximo}
                error={errors.cupoMaximo}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <FormField
                label="N.º de instructor"
                name="instructorId"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                required
                hint="Identificador del instructor a cargo."
                value={values.instructorId}
                error={errors.instructorId}
                onChange={handleChange}
                onBlur={handleBlur}
            />

            <div className="clase-form__actions">
                <Button type="submit" loading={submitting} loadingText="Guardando...">
                    {isEditing ? "Guardar cambios" : "Crear clase"}
                </Button>
                {isEditing && (
                    <Button variant="ghost" onClick={onCancel} disabled={submitting}>
                        Cancelar edición
                    </Button>
                )}
            </div>
        </form>
    );
}
