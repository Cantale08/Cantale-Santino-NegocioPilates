import Administrador from "../models/Administrador.js";

export default class AdministradorRepository {
    #administradores = [];
    #nextId = 1;

    obtenerPorId(id) {
        const administrador = this.#administradores.find((item) => item.id === id);
        return administrador ? { ...administrador } : undefined;
    }

    obtenerPorEmail(email) {
        const administrador = this.#administradores.find((item) => item.email === email);
        return administrador ? { ...administrador } : undefined;
    }

    crear(data) {
        const administrador = new Administrador(
            this.#nextId++, data.nombre, data.apellido, data.email, data.contrasenia
        );
        this.#administradores.push(administrador);
        return { ...administrador };
    }
}
