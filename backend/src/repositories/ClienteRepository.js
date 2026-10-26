import Cliente from "../models/Cliente.js";

export default class ClienteRepository {
    #clientes = [];
    #nextId = 1;

    obtenerPorId(id) {
        const cliente = this.#clientes.find((item) => item.id === id);
        return cliente ? { ...cliente } : undefined;
    }

    obtenerPorEmail(email) {
        const cliente = this.#clientes.find((item) => item.email === email);
        return cliente ? { ...cliente } : undefined;
    }

    existeDni(dni) {
        return this.#clientes.some((cliente) => cliente.dni === dni);
    }

    crear(data) {
        const cliente = new Cliente(
            this.#nextId++, data.nombre, data.apellido, data.email,
            data.contrasenia, data.telefono, data.dni
        );
        this.#clientes.push(cliente);
        return { ...cliente };
    }
}
