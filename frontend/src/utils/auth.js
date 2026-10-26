export function destinoPorRol(usuario) {
    return usuario.rol === "administrador" ? "/admin/turnos" : "/reservar";
}
