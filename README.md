# Negocio Pilates

Aplicación web de un centro de Pilates (Shakti Pilates), compuesta por:

- `backend/`: API REST con arquitectura MVC por capas (Entrega 2).
- `frontend/`: interfaz en React que consume la API (Entrega 3).

La entidad principal es `Clase`, tal como se establece en el análisis del dominio
de la primera entrega. Los modelos originales de clientes, instructores,
administradores y turnos se conservan para futuras funcionalidades.

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

El almacenamiento utiliza exclusivamente arrays en memoria. Comienza vacío y se
pierde al reiniciar el proceso. No se implementan todavía autenticación, reservas,
membresías ni CRUD de instructores; `instructorId` es una referencia numérica,
sin comprobar existencia hasta implementar la gestión de instructores.

### Ejemplos con curl

```bash
# Crear
curl -i -X POST http://localhost:3000/api/clases \
  -H 'Content-Type: application/json' \
  -d '{"tipo":"Reformer","dia":"lunes","horario":"09:00","cupoMaximo":8,"instructorId":1}'

# Listar y consultar por ID
curl http://localhost:3000/api/clases
curl http://localhost:3000/api/clases/1

# Modificar
curl -X PUT http://localhost:3000/api/clases/1 \
  -H 'Content-Type: application/json' \
  -d '{"tipo":"Reformer","dia":"martes","horario":"10:00","cupoMaximo":10,"instructorId":1}'

# Eliminar
curl -X DELETE http://localhost:3000/api/clases/1
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
`AppError` es la clase base de `BadRequestError` (400), `NotFoundError` (404)
y `ConflictError` (409). El middleware también maneja JSON malformado (400),
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
`/admin/clases` con el CRUD completo.

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
    context/       Sistema de notificaciones (NotificationProvider)
    data/          Contenido estático del negocio (textos, enlaces, imágenes)
    hooks/         useClases, useNotifications, useDocumentTitle, useScrollToHash
    pages/         HomePage, AdminClasesPage, NotFoundPage
    services/      apiClient (fetch centralizado) y clasesService
    styles/        Variables y estilos base (cada componente tiene su CSS)
    utils/         Formateo y validaciones de formularios
    App.jsx        Rutas
    main.jsx       Punto de entrada
```

Las peticiones HTTP viven solo en `src/services`. `apiClient.js` configura la URL,
procesa la respuesta `{ success, data | message }`, detecta respuestas incorrectas y
lanza `ApiError` con el mensaje del backend (o uno propio si no hay conexión).
Páginas y hooks usan las funciones de `clasesService.js`.

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
