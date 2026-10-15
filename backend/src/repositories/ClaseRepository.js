import Clase from "../models/Clase.js";

export default class ClaseRepository {
    #clases = [];
    #nextId = 1;

    obtenerTodas() {
        return this.#clases.map((clase) => ({ ...clase }));
    }

    obtenerPorId(id) {
        const clase = this.#clases.find((item) => item.id === id);
        return clase ? { ...clase } : undefined;
    }

    existeDuplicada(data, excludedId) {
        return this.#clases.some((clase) =>
            clase.id !== excludedId &&
            Object.keys(data).every((campo) => clase[campo] === data[campo])
        );
    }

    crear(data) {
        const clase = new Clase(
            this.#nextId++, data.tipo, data.dia, data.horario,
            data.cupoMaximo, data.instructorId
        );
        this.#clases.push(clase);
        return { ...clase };
    }

    modificar(id, data) {
        const clase = this.#clases.find((item) => item.id === id);
        if (!clase) {
            return undefined;
        }
        Object.assign(clase, data);
        return { ...clase };
    }

    eliminar(id) {
        const index = this.#clases.findIndex((item) => item.id === id);
        if (index === -1) {
            return undefined;
        }
        const [clase] = this.#clases.splice(index, 1);
        return { ...clase };
    }
}
