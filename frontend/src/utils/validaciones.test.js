import { describe, expect, it } from "vitest";
import {
    claseToFormValues,
    formValuesToPayload,
    validateClase,
    validateField
} from "./validaciones.js";

const valid = { tipo: "Reformer", dia: "lunes", horario: "09:00", cupoMaximo: "8", instructorId: "1" };

describe("validaciones de clase", () => {
    it("acepta datos válidos", () => {
        expect(validateClase(valid)).toEqual({});
    });

    it("exige todos los campos", () => {
        const errors = validateClase({ tipo: " ", dia: "", horario: "", cupoMaximo: "", instructorId: "" });
        expect(Object.keys(errors)).toEqual(["tipo", "dia", "horario", "cupoMaximo", "instructorId"]);
    });

    it.each(["0", "-1", "1.5", "abc", "01", "9007199254740992"])(
        "rechaza el número %s en cupo e instructor",
        (value) => {
            expect(validateField("cupoMaximo", value)).not.toBeNull();
            expect(validateField("instructorId", value)).not.toBeNull();
        }
    );

    it.each(["24:00", "9:00", "09:60", "mediodía"])("rechaza el horario %s", (value) => {
        expect(validateField("horario", value)).not.toBeNull();
    });

    it.each(["00:00", "23:59"])("acepta el horario límite %s", (value) => {
        expect(validateField("horario", value)).toBeNull();
    });

    it("rechaza días que el backend no admite", () => {
        expect(validateField("dia", "Lunes")).not.toBeNull();
        expect(validateField("dia", "miercoles")).toBeNull();
    });

    it("convierte entre valores del formulario y payload de la API", () => {
        const payload = formValuesToPayload({ ...valid, tipo: "  Reformer  " });
        expect(payload).toEqual({
            tipo: "Reformer",
            dia: "lunes",
            horario: "09:00",
            cupoMaximo: 8,
            instructorId: 1
        });
        expect(claseToFormValues({ id: 4, ...payload })).toEqual(valid);
    });
});
