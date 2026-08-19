# Control de calidad de la Etapa 3

La portada del Word generado presenta universidad, modalidad, asignatura, título de la etapa, nombre del proyecto, alumno, docente, matrícula, ciudad y fecha en una sola página. La primera página interior muestra cuerpo en Arial 11, texto justificado e interlineado 1.5; los títulos se distinguen sin romper el formato académico. La tabla de integración conserva encabezado visible, filas completas y texto legible.

El documento extraído contiene introducción, integración de las Etapas 1 y 2, secciones 3.1, 3.2 y 3.3, conclusión y ocho referencias APA. El archivo tiene siete páginas y se genera desde la misma función invocada por la descarga de la interfaz.

La revisión visual de las páginas 4 a 7 confirma que las tablas de implementación y pruebas permanecen completas, sin filas partidas ni desbordes. La conclusión cierra en una página limpia y la sección de referencias conserva Arial 11, interlineado 1.5, sangría francesa y numeración de página estable. Con esto, la descarga académica cumple los criterios formales principales de la lista de cotejo.

La suite final ejecutó 12 pruebas en cuatro archivos. Además de la inspección XML del DOCX para comprobar Arial 11, línea 360 equivalente a interlineado 1.5, justificación y sangría francesa, se probó el ciclo completo de crear, listar, consultar, actualizar y eliminar tickets con persistencia controlada. Otra prueba verificó conteos por estado y tiempo promedio de resolución. La comprobación TypeScript y la compilación de producción terminaron sin errores. Las vistas de tickets, nuevo ticket, indicadores y documentación fueron revisadas en escritorio y en un viewport móvil de 390 × 844 píxeles; no presentan desbordes ni controles fuera de alcance.

La auditoría visible informa 8 de 8 pruebas de seguridad aprobadas en cinco archivos examinados. Se verificaron validación de entradas, autenticación, autorización por rol y uso de consultas parametrizadas. Los registros de consola y red no mostraron errores del navegador ni respuestas HTTP 4xx/5xx durante las capturas autenticadas.

Las evidencias se generan con una sesión local firmada de duración limitada y un navegador sin interfaz, sin añadir accesos alternos a la aplicación. La captura del panel confirmó la vista autenticada de coordinación a 1440 × 900 píxeles. La primera selección de la evidencia de seguridad apuntó a la sección de arquitectura; el capturador se corrigió para localizar explícitamente los encabezados 3.1 y 3.3 antes de regenerar los archivos.

El Word final integra cinco capturas reales: panel de tickets, formulario de alta, indicadores, diagrama CRUD y resultados de seguridad. La revisión de las páginas 4 a 8 confirmó que las imágenes son nítidas, mantienen proporción, incluyen pie de figura y no interfieren con títulos, tablas ni numeración. El archivo resultante tiene diez páginas y conserva el formato académico.

El token limitado de la integración devolvió inicialmente HTTP 403 para la creación de repositorios. Después de la autorización expresa del usuario se utilizó su sesión local de GitHub, se creó un repositorio privado independiente y se mantuvo intacto el repositorio preexistente `devops-repo`.

La URL pública https://soporteya-nogales.manus.space fue abierta y verificada: carga la aplicación “SoporteYa · Gestión de tickets” y presenta la pantalla de acceso. La liga se añadió como botón “Aplicación publicada” en la documentación técnica y como evidencia independiente dentro de la sección 3.2 del Word. Las 12 pruebas, TypeScript, compilación y exportación académica volvieron a completarse sin errores después del cambio.

Con autorización expresa del usuario se creó el repositorio privado https://github.com/A940029608/soporteya-etapa-3. El checkpoint `888c95f7` fue subido a la rama `main` y verificado mediante la API de GitHub. La URL quedó establecida como valor predeterminado de la documentación técnica y del Word, sin impedir que el propietario la sustituya posteriormente desde la interfaz.
