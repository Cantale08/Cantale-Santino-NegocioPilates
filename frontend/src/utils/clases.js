export const DIAS = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miercoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sabado", label: "Sábado" },
    { value: "domingo", label: "Domingo" }
];

export function formatDia(value) {
    return DIAS.find((dia) => dia.value === value)?.label ?? value;
}

export function formatHorario(horario) {
    return `${horario} hs`;
}

export function formatCupo(cupo) {
    return cupo === 1 ? "1 lugar" : `${cupo} lugares`;
}
