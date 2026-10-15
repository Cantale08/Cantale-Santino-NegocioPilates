# Negocio Pilates

API para gestionar las clases de un centro de Pilates. La entidad principal es
`Clase`, tal como se establece en el análisis del dominio de la primera entrega.
Los modelos originales de clientes, instructores, administradores y turnos se
conservan para futuras funcionalidades.

## Requisitos y ejecución

- Node.js 22 o superior y npm.

```bash
cd backend
npm ci
npm start
```

La API escucha en `http://localhost:3000`. Se puede configurar otro puerto mediante
`PORT`, por ejemplo `PORT=3001 npm start`. Para reiniciar automáticamente al editar
el código, usar `npm run dev`.

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
los formatos de respuesta, validaciones, duplicados, errores y aislamiento del
almacenamiento en memoria.