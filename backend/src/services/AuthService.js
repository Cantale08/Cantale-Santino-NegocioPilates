import { randomBytes } from "node:crypto";
import { Messages } from "../enums/Messages.js";
import { Roles } from "../enums/Roles.js";
import { ConflictError, UnauthorizedError } from "../exceptions/AppError.js";
import { hashContrasenia, verificarContrasenia } from "../utils/contrasenias.js";
import { validarLogin, validarRegistro } from "../utils/validacionesAuth.js";

const DURACION_SESION_MS = 12 * 60 * 60 * 1000;

export default class AuthService {
    constructor({ clienteRepository, administradorRepository, sesionRepository, ahora = () => new Date() }) {
        this.clienteRepository = clienteRepository;
        this.administradorRepository = administradorRepository;
        this.sesionRepository = sesionRepository;
        this.ahora = ahora;
    }

    crearAdministrador({ nombre, apellido, email, contrasenia }) {
        return this.administradorRepository.crear({
            nombre, apellido, email: email.toLowerCase(), contrasenia: hashContrasenia(contrasenia)
        });
    }

    registrar(body) {
        const data = validarRegistro(body);
        if (this.#existeEmail(data.email)) {
            throw new ConflictError(Messages.EMAIL_DUPLICADO);
        }
        if (this.clienteRepository.existeDni(data.dni)) {
            throw new ConflictError(Messages.DNI_DUPLICADO);
        }
        const cliente = this.clienteRepository.crear({
            ...data, contrasenia: hashContrasenia(data.contrasenia)
        });
        return this.#iniciarSesion(cliente, Roles.CLIENTE);
    }

    login(body) {
        const { email, contrasenia } = validarLogin(body);
        const cliente = this.clienteRepository.obtenerPorEmail(email);
        const administrador = cliente ? undefined : this.administradorRepository.obtenerPorEmail(email);
        const usuario = cliente ?? administrador;

        if (!usuario || !verificarContrasenia(contrasenia, usuario.contrasenia)) {
            throw new UnauthorizedError(Messages.CREDENCIALES_INVALIDAS);
        }
        return this.#iniciarSesion(usuario, cliente ? Roles.CLIENTE : Roles.ADMINISTRADOR);
    }

    autenticar(token) {
        if (!token) {
            throw new UnauthorizedError(Messages.TOKEN_REQUERIDO);
        }
        const sesion = this.sesionRepository.obtener(token);
        if (!sesion || sesion.expiraEn <= this.ahora().getTime()) {
            this.sesionRepository.eliminar(token);
            throw new UnauthorizedError(Messages.SESION_INVALIDA);
        }
        const repository = sesion.rol === Roles.CLIENTE
            ? this.clienteRepository
            : this.administradorRepository;
        const usuario = repository.obtenerPorId(sesion.usuarioId);
        if (!usuario) {
            throw new UnauthorizedError(Messages.SESION_INVALIDA);
        }
        return this.#aUsuarioPublico(usuario, sesion.rol);
    }

    cerrarSesion(token) {
        this.sesionRepository.eliminar(token);
    }

    #existeEmail(email) {
        return Boolean(
            this.clienteRepository.obtenerPorEmail(email) ||
            this.administradorRepository.obtenerPorEmail(email)
        );
    }

    #iniciarSesion(usuario, rol) {
        const token = randomBytes(32).toString("hex");
        this.sesionRepository.crear(token, {
            usuarioId: usuario.id,
            rol,
            expiraEn: this.ahora().getTime() + DURACION_SESION_MS
        });
        return { token, usuario: this.#aUsuarioPublico(usuario, rol) };
    }

    #aUsuarioPublico({ contrasenia, ...datos }, rol) {
        return { ...datos, rol };
    }
}
