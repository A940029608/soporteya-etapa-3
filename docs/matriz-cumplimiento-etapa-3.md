# Matriz de cumplimiento — Proyecto Integrador Etapa 3

El entregable conserva la continuidad de **SoporteYa** y atiende la estructura y el contenido exigidos en las instrucciones y la lista de cotejo. El código se encuentra respaldado en un repositorio GitHub privado y la aplicación muestra su URL real dentro de la documentación técnica.

| Criterio | Estado | Evidencia verificable |
|---|---|---|
| Portada con universidad, asignatura, proyecto, alumno, ciudad y fecha | Cumple | Página 1 del Word generado. |
| Introducción breve | Cumple | Sección “Introducción” del Word. |
| Integración de Etapas 1 y 2 | Cumple | Tabla de integración y explicación de continuidad. |
| 3.1 Descripción de funcionalidad y CRUD | Cumple | Tabla CRUD, figura 1, figura 2 y procedimientos `tickets.create/list/detail/update/remove`. |
| Base de datos en la nube | Cumple | Migración aplicada; tablas `tickets`, `ticket_history` y `ticket_comments`. |
| 3.2 Implementación | Cumple | Arquitectura por capas, figuras 3 y 4, código React/tRPC/Drizzle. |
| Capturas del proceso de implementación | Cumple | Formulario, panel e indicadores incrustados en el Word. |
| Acceso público a la aplicación | Cumple | https://soporteya-nogales.manus.space fue verificada y se muestra en la interfaz y el Word. |
| 3.3 Pruebas de seguridad | Cumple | Auditoría de 8/8 controles, figura 5 y pruebas Vitest. |
| Pruebas estáticas y dinámicas | Cumple | Validación Zod, políticas por rol, UNAUTHORIZED y FORBIDDEN. |
| Acceso a repositorio | Cumple | https://github.com/A940029608/soporteya-etapa-3, repositorio privado con rama `main` verificada. |
| Formato Arial 11, interlineado 1.5 y texto justificado | Cumple | Prueba XML del DOCX y revisión visual de diez páginas. |
| Conclusión | Cumple | Sección “Conclusión” del Word. |
| Referencias APA | Cumple | Ocho referencias con sangría francesa. |
| Ortografía y redacción | Cumple | Revisión integral sin errores detectados. |

## Resultado técnico

La suite final ejecuta **12 pruebas en cuatro archivos**, cubriendo validaciones, autenticación, autorización, CRUD funcional, indicadores y generación/formato del Word. `pnpm check` y `pnpm build` concluyen sin errores. Las vistas principales fueron verificadas en escritorio y móvil.
