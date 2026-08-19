# Matriz de cumplimiento — Proyecto Integrador Etapa 3

El entregable conserva la continuidad de **SoporteYa** y atiende la estructura y el contenido exigidos en las instrucciones y la lista de cotejo. La única acción externa pendiente es la exportación del código a un repositorio GitHub autorizado; la aplicación ya incluye el campo validado para registrar y mostrar esa URL.

| Criterio | Estado | Evidencia verificable |
|---|---|---|
| Portada con universidad, asignatura, proyecto, alumno, ciudad y fecha | Cumple | Página 1 del Word generado. |
| Introducción breve | Cumple | Sección “Introducción” del Word. |
| Integración de Etapas 1 y 2 | Cumple | Tabla de integración y explicación de continuidad. |
| 3.1 Descripción de funcionalidad y CRUD | Cumple | Tabla CRUD, figura 1, figura 2 y procedimientos `tickets.create/list/detail/update/remove`. |
| Base de datos en la nube | Cumple | Migración aplicada; tablas `tickets`, `ticket_history` y `ticket_comments`. |
| 3.2 Implementación | Cumple | Arquitectura por capas, figuras 3 y 4, código React/tRPC/Drizzle. |
| Capturas del proceso de implementación | Cumple | Formulario, panel e indicadores incrustados en el Word. |
| 3.3 Pruebas de seguridad | Cumple | Auditoría de 8/8 controles, figura 5 y pruebas Vitest. |
| Pruebas estáticas y dinámicas | Cumple | Validación Zod, políticas por rol, UNAUTHORIZED y FORBIDDEN. |
| Acceso a repositorio | Pendiente de autorización externa | La integración rechazó la creación automática con HTTP 403; debe exportarse desde Gestión → Configuración → GitHub o proporcionarse una URL existente. |
| Formato Arial 11, interlineado 1.5 y texto justificado | Cumple | Prueba XML del DOCX y revisión visual de diez páginas. |
| Conclusión | Cumple | Sección “Conclusión” del Word. |
| Referencias APA | Cumple | Ocho referencias con sangría francesa. |
| Ortografía y redacción | Cumple | Revisión integral sin errores detectados. |

## Resultado técnico

La suite final ejecuta **12 pruebas en cuatro archivos**, cubriendo validaciones, autenticación, autorización, CRUD funcional, indicadores y generación/formato del Word. `pnpm check` y `pnpm build` concluyen sin errores. Las vistas principales fueron verificadas en escritorio y móvil.

