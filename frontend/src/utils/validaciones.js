import { DIAS } from "./clases.js";

export const EMPTY_CLASE_FORM = Object.freeze({
    tipo: "",
    dia: "",
    horario: "",
    cupoMaximo: "",
    instructorId: ""
});

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function isPositiveInteger(value) {
    const text = String(value).trim();
    return POSITIVE_INTEGER.test(text) && Number.isSafeInteger(Number(text));
}

const validators = {
    tipo: (value) => (value.trim() ? null : "Ingresá el tipo de clase."),
    dia: (value) => (DIAS.some((dia) => dia.value === value) ? null : "Seleccioná un día."),
    horario: (value) => (TIME.test(value) ? null : "Ingresá un horario válido, por ejemplo 09:00."),
    cupoMaximo: (value) =>
        isPositiveInteger(value) ? null : "El cupo debe ser un número entero mayor a 0.",
    instructorId: (value) =>
        isPositiveInteger(value) ? null : "El instructor debe ser un número entero mayor a 0."
};

export function validateField(name, value) {
    return validators[name](value);
}

export function validateClase(values) {
    const errors = {};
    for (const name of Object.keys(validators)) {
        const error = validateField(name, values[name]);
        if (error) {
            errors[name] = error;
        }
    }
    return errors;
}

export function claseToFormValues(clase) {
    return {
        tipo: clase.tipo,
        dia: clase.dia,
        horario: clase.horario,
        cupoMaximo: String(clase.cupoMaximo),
        instructorId: String(clase.instructorId)
    };
}

export function formValuesToPayload(values) {
    return {
        tipo: values.tipo.trim(),
        dia: values.dia,
        horario: values.horario,
        cupoMaximo: Number(values.cupoMaximo),
        instructorId: Number(values.instructorId)
    };
}
