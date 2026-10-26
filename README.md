# Negocio Pilates

Aplicación web de un centro de Pilates (Shakti Pilates), compuesta por:

- `backend/`: API REST con arquitectura MVC por capas (Entregas 2 y 4).
- `frontend/`: interfaz en React que consume la API (Entregas 3 y 4).

El sistema completo permite que los clientes se registren, inicien sesión, consulten
los horarios disponibles de las clases, reserven un turno y lo cancelen, mientras que el
administrador gestiona las clases y supervisa todos los turnos.

## Funcionalidades (Entrega 4)

| Rol | Operaciones |
| --- | --- |
| Visitante | Ver clases y horarios disponibles, registrarse, iniciar sesión |
| Cliente | Reservar turnos (`/reservar`), consultar y cancelar sus turnos (`/mis-turnos`) |
| Administrador | CRUD de clases (`/admin/clases`), ver y cancelar cualquier turno (`/admin/turnos`) |

Usuario administrador de demostración (se crea al iniciar el backend, en memoria):
`admin@shakti.com` / `admin1234`. Se puede cambiar con las variables `ADMIN_EMAIL` y
`ADMIN_PASSWORD`.

### Flujo sugerido para la demostración

1. Iniciar sesión como administrador y cargar clases en «Gestión de clases».
2. Cerrar sesión, registrarse como cliente (queda con la sesión iniciada).
3. En «Reservar clase», elegir un horario y confirmar la reserva.
4. En «Mis turnos», ver la reserva y cancelarla.
5. Volver a entrar como administrador y ver los turnos en «Gestión de turnos».

### Endpoints de autenticación y turnos

| Método | Ruta | Acceso | Operación |
| --- | --- | --- | --- |
| POST | `/api/auth/registro` | Público | Registrar un cliente (201, devuelve `token` y `usuario`) |
| POST | `/api/auth/login` | Público | Iniciar sesión (devuelve `token` y `usuario`) |
| GET | `/api/auth/perfil` | Autenticado | Datos del usuario de la sesión |
| POST | `/api/auth/logout` | Autenticado | Cerrar la sesión |
| GET | `/api/turnos/disponibilidad?claseId=` | Público | Próximos 14 días de cada clase con sus cupos restantes |
| GET | `/api/turnos/mis-turnos` | Cliente | Turnos del cliente |
| GET | `/api/turnos` | Administrador | Todos los turnos |
| POST | `/api/turnos` | Cliente | Reservar `{ "claseId": 1, "fecha": "2026-10-27" }` (201) |
| PATCH | `/api/turnos/:id/cancelar` | Dueño del turno o administrador | Cancelar un turno |

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`. Las
contraseñas se guardan con hash (scrypt) y las sesiones duran 12 horas. En el CRUD de
clases, `GET` es público y `POST`, `PUT` y `DELETE` requieren rol administrador.

### Reglas de negocio (validadas en el backend)

- Registro: todos los campos son obligatorios; email con formato válido y único; DNI de 7 u 8
  dígitos y único; contraseña de 8 a 64 caracteres; teléfono de 8 a 15 dígitos.
- Credenciales inválidas, sesión ausente/expirada (401) y falta de permisos (403) tienen
  mensajes claros.
- Reservas: la clase debe existir; la fecha debe ser real, coincidir con el día en que se
  dicta la clase, ser futura y estar dentro de los próximos 14 días.
- No se puede reservar dos veces la misma clase y fecha, ni tener dos turnos en el mismo día
  y horario (409).
- No se reserva una clase completa: el cupo se calcula con los turnos reservados (409).
  Cancelar un turno libera el lugar.
- Un turno solo puede cancelarlo su dueño o un administrador, una única vez y antes de que
  empiece la clase.
- No se puede eliminar una clase ni cambiar su día u horario si tiene turnos futuros
  reservados, ni reducir el cupo por debajo de las reservas existentes (409).

## Requisitos y ejecución

- Node.js 22 o superior y npm.

Se necesitan dos terminales, una para cada parte:

```bash
# Terminal 1: API en http://localhost:3000
cd backend
npm ci
npm start

# Terminal 2: interfaz en http://localhost:5173
cd frontend
npm ci
npm run dev
```

La API escucha en `http://localhost:3000`. Se puede configurar otro puerto mediante
`PORT`, por ejemplo `PORT=3001 npm start`. Para reiniciar automáticamente al editar
el código, usar `npm run dev`. El backend acepta solicitudes del frontend (CORS) desde
`localhost:5173` y `localhost:4173`; se pueden indicar otros orígenes separados por
comas con la variable `CORS_ORIGIN`.

La interfaz usa `http://localhost:3000/api` como URL de la API. Para cambiarla, copiar
`frontend/.env.example` a `frontend/.env` y modificar `VITE_API_URL`.

## Arquitectura MVC por capas

```text
backend/
  src/
    controllers/   Traducción entre HTTP y los servicios
    services/      Casos de uso, validaciones y reglas de negocio
    repositories/  Acceso a los arrays de almacenamiento
    models/        Entidades del dominio
    routes/        Endpoints y métodos HTTP
    middlewares/   Manejo centralizado de errores y rutas inexistentes
    responses/     Formato común de respuestas HTTP (vista JSON)
    exceptions/    AppError y errores HTTP específicos
    enums/         Messages.js y días permitidos
    utils/         Validaciones reutilizables
    app.js         Configuración y conexión entre capas
    server.js      Inicio del servidor
  test/            Pruebas automatizadas
```

Flujo: ruta → controlador → servicio → repositorio → modelo.
Las excepciones llegan al middleware de errores, que utiliza el formato común
de respuestas. Los controladores no acceden directamente a los arrays.

## CRUD de clases

Las operaciones de escritura requieren sesión de administrador (encabezado `Authorization`).

| Método | Ruta | Operación | Estado exitoso |
| --- | --- | --- | --- |
| GET | `/api/clases` | Listar todas las clases | 200 |
| GET | `/api/clases/:id` | Consultar una clase | 200 |
| POST | `/api/clases` | Crear una clase | 201 |
| PUT | `/api/clases/:id` | Reemplazar todos sus datos editables | 200 |
| DELETE | `/api/clases/:id` | Eliminar una clase y devolverla | 200 |

Para crear o modificar, enviar `Content-Type: application/json` y todos los campos:

```json
{
  "tipo": "Reformer",
  "dia": "lunes",
  "horario": "09:00",
  "cupoMaximo": 8,
  "instructorId": 1
}
```

- `tipo`: texto no vacío; se eliminan espacios al principio y al final.
- `dia`: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado` o `domingo`,
  en minúsculas y sin tildes.
- `horario`: hora válida de 24 horas con formato `HH:mm`.
- `cupoMaximo` e `instructorId`: números enteros positivos y seguros de JavaScript.
- El `id` es autogenerado, no se reutiliza al eliminar registros y no es editable.
- No se aceptan campos adicionales ni clases con los cinco datos idénticos
  a los de otra clase (después de normalizar `tipo`).
- `PUT` requiere todos los campos; no se implementan modificaciones parciales.

El almacenamiento utiliza exclusivamente arrays en memoria. Comienza vacío (salvo el
administrador de demostración) y se pierde al reiniciar el proceso. No se implementa un
CRUD de instructores; `instructorId` es una referencia numérica, sin comprobar existencia.

### Ejemplos con curl

```bash
# Crear (TOKEN se obtiene con POST /api/auth/login como administrador)
curl -i -X POST http://localhost:3000/api/clases \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"tipo":"Reformer","dia":"lunes","horario":"09:00","cupoMaximo":8,"instructorId":1}'

# Listar y consultar por ID
curl http://localhost:3000/api/clases
curl http://localhost:3000/api/clases/1

# Modificar
curl -X PUT http://localhost:3000/api/clases/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"tipo":"Reformer","dia":"martes","horario":"10:00","cupoMaximo":10,"instructorId":1}'

# Eliminar
curl -X DELETE http://localhost:3000/api/clases/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Respuestas y errores centralizados

Respuesta exitosa (en una lista, `data` es un array):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "Reformer",
    "dia": "lunes",
    "horario": "09:00",
    "cupoMaximo": 8,
    "instructorId": 1
  }
}
```

Respuesta de error:

```json
{
  "success": false,
  "message": "La clase no existe."
}
```

Los mensajes se centralizan en `backend/src/enums/Messages.js`.
`AppError` es la clase base de `BadRequestError` (400), `UnauthorizedError` (401),
`ForbiddenError` (403), `NotFoundError` (404) y `ConflictError` (409). El middleware también maneja JSON malformado (400),
cuerpos superiores a 100 KB (413), rutas desconocidas (404) y errores inesperados
(500). Los detalles internos solo se registran en el servidor.

## Pruebas

```bash
cd backend
npm test
```

Se utiliza el runner integrado de Node.js, sin dependencias adicionales de pruebas.
Las pruebas ejercitan la API por HTTP en puertos temporales y comprueban el CRUD,
los formatos de respuesta, validaciones, duplicados, errores, CORS y aislamiento del
almacenamiento en memoria.

## Frontend (React)

Construido con Vite y React. Respeta el boceto de `Documentación/disenioPagina.jpeg`:
header con navegación y botón «Reservar clase», hero, beneficios (4 tarjetas),
nuestras clases (texto y 3 tarjetas), sobre nosotros (imagen y texto) y footer de
cuatro columnas (marca, navegación, contacto y redes). Se agregó la pantalla
`/admin/clases` con el CRUD completo y, en la Entrega 4, las pantallas `/login`,
`/registro`, `/reservar`, `/mis-turnos` y `/admin/turnos`.

```text
frontend/
  public/          Favicon
  src/
    assets/        Ilustraciones SVG propias
    components/    Componentes reutilizables
      ui/          Button, FormField, ConfirmDialog, Toast, estados de carga/error/vacío
      layout/      Layout, Header, Footer, Logo
      home/        Secciones de la página de inicio
      clases/      ClaseCard, ClaseForm, ClasesTable
    context/       Notificaciones (NotificationProvider) y sesión (AuthProvider)
    data/          Contenido estático del negocio (textos, enlaces, imágenes)
    hooks/         useClases, useAuth, useAsyncData, useForm, useNotifications, ...
    pages/         Home, Login, Registro, Reservar, MisTurnos, AdminClases, AdminTurnos
    services/      apiClient (fetch centralizado), clases, auth y turnos
    styles/        Variables y estilos base (cada componente tiene su CSS)
    utils/         Formateo y validaciones de formularios
    App.jsx        Rutas
    main.jsx       Punto de entrada
```

Las peticiones HTTP viven solo en `src/services`. `apiClient.js` configura la URL,
procesa la respuesta `{ success, data | message }`, detecta respuestas incorrectas y
lanza `ApiError` con el mensaje del backend (o uno propio si no hay conexión).
Páginas y hooks usan las funciones de `clasesService.js`, `authService.js` y
`turnosService.js`. El token de sesión se guarda en `localStorage` (`tokenStorage.js`) y
`apiClient` lo envía en cada petición; si el backend responde 401, se cierra la sesión.

### Experiencia de usuario

- **Carga:** indicador en el listado y botones que muestran «Guardando…» / «Eliminando…».
- **Notificaciones:** éxitos y errores (incluidos los del backend) se muestran con el
  mismo sistema de notificaciones laterales; no se usa `alert()`.
- **Formularios:** validación por campo y al enviar, con mensajes asociados al campo y
  foco en el primer error. Reproducen las reglas del backend, que sigue validando.
- **Eliminar:** siempre pide confirmación con un diálogo modal (`<dialog>`), cuyo foco
  inicial está en «Cancelar».
- **Estados vacío y de error:** con opción de reintentar si la API no responde.

### Accesibilidad

Estructura semántica (`header`, `nav`, `main`, `footer`, encabezados jerárquicos),
enlace «Saltar al contenido», `label` asociado a cada campo, `aria-invalid` y
`aria-describedby` en errores, notificaciones con `role="status"` / `role="alert"`,
botones semánticos con nombres descriptivos, texto alternativo en las imágenes,
foco visible, menú móvil con `aria-expanded`, tabla con `caption` y encabezados
`scope`, y respeto de `prefers-reduced-motion`.

### Decisiones de diseño respecto del boceto

- Se conservan la paleta (`#F7F3EE`, `#A8B8A5`, `#6F8A6E`) y la estructura del boceto.
  Como `#6F8A6E` sobre el beige solo alcanza un contraste de 3,4:1, el texto y los
  botones usan un verde más oscuro derivado (`#4B654B`, 5,8:1) para cumplir WCAG AA.
- Sitka Display y Angsana New no están disponibles en la web sin licencia y no se
  ven igual en todos los equipos, por lo que se reemplazaron por tipografías
  autoalojadas de estilo similar: Cormorant Garamond (títulos) y Lora (textos largos).
- Las imágenes del boceto son marcadores de posición; se reemplazaron por
  ilustraciones SVG propias en la misma paleta.
- «Reservar clase» lleva a la sección de clases: la reserva de turnos todavía no
  forma parte de la API. La pantalla de gestión se agregó a la navegación.
- La API no tiene CRUD de instructores, por lo que el formulario pide el número del
  instructor.

### Pruebas y compilación

```bash
cd frontend
npm test        # Vitest + Testing Library
npm run build   # Compilación de producción en frontend/dist
```
