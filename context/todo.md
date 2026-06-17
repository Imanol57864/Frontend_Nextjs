1. Los cambios de la tabla de analisis si llegan, pero no se actualizan en tiempo real.
2. Crear un analisis lanza un error, es por los nombres de los archivos







## Resuelto en esta pasada

- Compactar patrones repetidos de rutas API con `withApiUser` y helpers compartidos.
- Compactar popups con `PopupShell` y un runtime cliente único (`PopupRuntime`).
- Eliminar scripts públicos legacy reemplazados por componentes reutilizables.
- Crear partial compartido `BackToDashboard` para volver al tablero principal.
- Modernizar estilos Tailwind globales para login, header, cards, tablas, botones y popups.
- Corregir el login roto removiendo padding global y reemplazando el script por `LoginError`.
- Corregir el typo `buttonddFilePopup` en la página de archivos.
- Corregir subida/creación de análisis usando `sanitizeFileName` y `uploadAnalysisFile` compartidos.

## Pendiente funcional para validar manualmente

- Probar creación de análisis con archivos reales y nombres con acentos, espacios y caracteres especiales.
- Probar realtime multiusuario en catálogo, laboratorios y archivos con dos sesiones abiertas.
