export default class SesionRepository {
    #sesiones = new Map();

    crear(token, sesion) {
        this.#sesiones.set(token, { ...sesion });
    }

    obtener(token) {
        const sesion = this.#sesiones.get(token);
        return sesion ? { ...sesion } : undefined;
    }

    eliminar(token) {
        this.#sesiones.delete(token);
    }
}
