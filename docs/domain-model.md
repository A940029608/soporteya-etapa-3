# Modelo de dominio de SoporteYa

## Entidades

| Entidad | Propósito | Campos principales |
|---|---|---|
| `users` | Identidad autenticada y nivel de acceso. | `id`, `openId`, `name`, `email`, `role` |
| `tickets` | Expediente vigente de una solicitud de soporte. | `id`, `folio`, `title`, `category`, `priority`, `description`, `status`, `ownerId`, `assigneeId`, `createdAt`, `updatedAt`, `resolvedAt`, `deletedAt` |
| `ticket_history` | Bitácora inmutable de eventos del ticket. | `ticketId`, `actorId`, `action`, `field`, `oldValue`, `newValue`, `createdAt` |
| `ticket_comments` | Conversación trazable asociada a la atención. | `ticketId`, `authorId`, `body`, `createdAt` |

## Vocabulario controlado

| Concepto | Valores válidos |
|---|---|
| Estado | `Abierto`, `En atención`, `Resuelto`, `Cerrado` |
| Prioridad | `Baja`, `Media`, `Alta`, `Urgente` |
| Rol | `colaborador`, `tecnico`, `coordinador` |

## Matriz de autorización

| Acción | Colaborador | Técnico | Coordinador/Admin |
|---|---|---|---|
| Crear ticket | Sí, como propietario | Sí | Sí |
| Consultar ticket | Solo propios | Solo asignados | Todos |
| Editar datos generales | Propios mientras estén abiertos | Asignados | Todos |
| Cambiar estado | No | Asignados | Todos |
| Asignar técnico | No | No | Sí |
| Agregar comentario | Propios | Asignados | Todos |
| Eliminar | Propios mientras estén abiertos | No | Todos |
| Consultar indicadores | No | No | Sí |

## Reglas verificables

El servidor valida todos los datos con esquemas estrictos antes de consultar la base. El folio se genera en el servidor y no es editable. Cada mutación crea una entrada de historial. La eliminación es lógica mediante `deletedAt`; así se conserva la evidencia y los indicadores excluyen los registros eliminados. `resolvedAt` se establece al entrar en `Resuelto` o `Cerrado` y se limpia si el ticket regresa a un estado anterior.
