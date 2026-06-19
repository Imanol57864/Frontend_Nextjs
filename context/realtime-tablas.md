# Implementación de realtime para actualización automática de tablas

Este documento describe cómo quedó implementada la actualización automática de tablas usando Supabase Realtime y AG Grid.

## Objetivo

La idea fue que las tablas se mantengan sincronizadas cuando otra sesión crea, edita o elimina datos en Supabase, sin obligar al usuario a recargar manualmente la página.

La implementación se separó en tres piezas:

- Cliente Supabase del navegador: `lib/supabaseBrowser.js`
- Helpers compartidos para AG Grid y realtime: `components/agGridShared.js`
- Normalizadores de payloads de Supabase: `lib/realtimePayloads.js`

## Cliente Supabase del navegador

El archivo `lib/supabaseBrowser.js` expone `getBrowserSupabase()`.

Esta función crea un único cliente Supabase para el navegador usando:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

El cliente se guarda en memoria en `browserClient`, así que todas las tablas reutilizan la misma instancia en lugar de crear una conexión nueva cada vez.

La autenticación del cliente realtime está configurada sin persistencia:

```js
auth: {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false
}
```

Esto evita que el cliente del navegador intente manejar sesión propia; para esta app, realtime solo necesita escuchar cambios públicos autorizados por Supabase.

## Suscripción compartida a cambios de tablas

La función central está en `components/agGridShared.js`:

```js
subscribeToTableChanges({ channelName, table, filter, onPayload })
```

Internamente hace lo siguiente:

1. Obtiene el cliente con `getBrowserSupabase()`.
2. Crea una configuración de cambios para Supabase:

```js
{ event: "*", schema: "public", table }
```

3. Si se recibe un `filter`, lo agrega a la configuración.
4. Crea un canal con `supabase.channel(channelName)`.
5. Escucha eventos `postgres_changes`.
6. Ejecuta `onPayload` cada vez que llega un cambio.
7. Devuelve un objeto con `close()`, que llama `supabase.removeChannel(channel)`.

El cierre explícito del canal es importante porque las tablas son componentes cliente. Cuando el usuario cambia de pantalla, cambia de laboratorio o desmonta un componente, se debe limpiar la suscripción para no dejar listeners activos.

## Normalización de payloads

Supabase entrega payloads con esta forma general:

- `payload.eventType`
- `payload.new`
- `payload.old`

Para no repetir esa lógica en cada tabla, `lib/realtimePayloads.js` convierte esos payloads a eventos simples que entiende AG Grid.

### `tablePayloadEvent`

```js
tablePayloadEvent(payload, idField)
```

Devuelve un objeto uniforme:

```js
{
  type,
  id,
  new_data
}
```

Donde:

- `type` viene de `payload.eventType`.
- `id` se toma de `payload.old[idField]` o `payload.new[idField]`.
- `new_data` es una copia JSON de `payload.new`.

Esta función se usa en tablas donde basta con saber qué fila cambió y cuál es su identificador.

### `analysisPayloadEventForLab`

```js
analysisPayloadEventForLab(payload, labId)
```

Esta función maneja el caso especial de la tabla `catAnalisis`, porque el catálogo de análisis visible depende del laboratorio seleccionado.

El comportamiento es:

- Si el evento es `DELETE`, devuelve el evento como eliminación.
- Si el análisis cambió de laboratorio y antes pertenecía al laboratorio actual, lo convierte en `DELETE` para quitarlo de la tabla visible.
- Si el análisis cambió de laboratorio y ahora pertenece al laboratorio actual, lo convierte en `INSERT` para agregarlo.
- Si el análisis sigue perteneciendo al laboratorio actual, devuelve el evento normal.
- Si no pertenece al laboratorio actual, devuelve `null`.

Así la tabla de análisis solo reacciona a cambios relevantes para el laboratorio seleccionado.

### `filePayloadMatchesAnalysis`

```js
filePayloadMatchesAnalysis(payload, idAnalisis)
```

Esta función decide si un cambio en `Archivo_Analisis` afecta la tabla de archivos del análisis actual.

Compara `payload.old.id_analisis` y `payload.new.id_analisis` contra el `idAnalisis` de la página. Además contempla un caso defensivo para `DELETE`: si Supabase no incluye `old.id_analisis`, devuelve `true` para forzar recarga.

## Aplicación incremental en AG Grid

La función que actualiza filas en pantalla está en `components/agGridShared.js`:

```js
applyRealtimeRowEvent({ api, rowsRef, data, idField, reload })
```

Recibe:

- `api`: la API actual de AG Grid.
- `rowsRef`: referencia React con los datos actuales.
- `data`: evento normalizado.
- `idField`: campo que identifica la fila.
- `reload`: función de recarga completa como respaldo.

El flujo es:

### INSERT

1. Lee el identificador nuevo desde `data.new_data[idField]`.
2. Si la fila ya existe, aplica `update`.
3. Si no existe, aplica `add` con `addIndex: 0`.
4. Actualiza `rowsRef.current`.
5. Mueve la paginación a la primera página para mostrar la nueva fila.

### UPDATE

1. Valida que exista el identificador entrante.
2. Busca la fila actual con `api.getRowNode(String(data.id))`.
3. Si el id cambió, hace `reload()` porque AG Grid necesita reconstruir el índice de filas.
4. Si el id es estable, aplica `update`.
5. Actualiza `rowsRef.current`.

### DELETE

1. Busca la fila por id.
2. Si existe, aplica `remove`.
3. Filtra `rowsRef.current` para eliminarla también de la referencia local.

### Respaldo con recarga completa

Si falta información crítica, llega un tipo desconocido o ocurre un error, la función ejecuta `reload()`.

Ese respaldo evita dejar la tabla en un estado inconsistente cuando el payload no trae suficiente información.

## Uso en laboratorios

Archivo: `components/LaboratoriesAgGrid.jsx`

La tabla escucha cambios de `catLabos`:

```js
subscribeToTableChanges({
  channelName: "catLabos:laboratories-grid",
  table: "catLabos",
  onPayload: ...
})
```

Cada payload se normaliza con:

```js
tablePayloadEvent(payload, "nombre_lab")
```

Después se aplica con:

```js
applyRealtimeRowEvent({
  idField: "nombre_lab",
  reload: loadLabs
})
```

La tabla usa `nombre_lab` como identificador de fila en AG Grid:

```js
getRowId: (params) => String(params.data.nombre_lab)
```

Por eso, si se cambia el nombre de un laboratorio, el helper puede decidir cuándo aplicar una actualización incremental y cuándo hacer recarga completa.

## Uso en catálogo de análisis

Archivo: `components/CatalogAgGrid.jsx`

Aquí existen dos suscripciones realtime:

- `catAnalisis` para actualizar la tabla de análisis del laboratorio seleccionado.
- `catLabos` para mantener actualizado el selector/lista de laboratorios y la información del laboratorio visible.

### Suscripción de análisis

Cuando se selecciona un laboratorio, se crea una suscripción con:

```js
channelName: `catAnalisis:${labname}`
table: "catAnalisis"
```

El payload se pasa por:

```js
analysisPayloadEventForLab(payload, labname)
```

Si devuelve un evento válido, se aplica a AG Grid con `applyRealtimeRowEvent`, usando `id_analisis` como identificador.

### Suscripción de laboratorios

La suscripción a `catLabos` mantiene sincronizada la interfaz alrededor de la tabla:

- Si se inserta un laboratorio, agrega una opción al selector.
- Si se actualiza, reemplaza la opción.
- Si se elimina, quita la opción.
- Si el laboratorio actual fue eliminado, muestra alerta y recarga la página.
- Si el laboratorio actual cambió de nombre, actualiza el panel, recarga los análisis y recrea la suscripción con el nuevo nombre.

## Uso en archivos

Archivo: `components/FilesAgGrid.jsx`

La tabla de archivos escucha cambios en:

```js
table: "Archivo_Analisis"
channelName: `Archivo_Analisis:${idAnalisis}`
```

En este caso no se aplica actualización incremental. Si el payload corresponde al análisis actual, se llama a:

```js
loadFiles()
```

Se eligió recargar porque los archivos dependen de datos derivados como URL, nombre, tipo y fecha, y una recarga completa mantiene la tabla consistente después de uploads, eliminaciones o cambios de relación.

## Limpieza de suscripciones

Cada componente guarda su suscripción en un `useRef`.

Ejemplos:

- `realtimeRef`
- `analysisRealtimeRef`
- `labRealtimeRef`

En los `useEffect`, el cleanup ejecuta:

```js
realtimeRef.current?.close()
```

También se cierran canales antes de navegar manualmente a otras páginas o antes de crear una nueva suscripción para otro laboratorio.

## Resumen del flujo

1. El componente carga datos iniciales con su función `load...`.
2. Crea una suscripción Supabase Realtime con `subscribeToTableChanges`.
3. Supabase emite eventos `INSERT`, `UPDATE` o `DELETE`.
4. El payload se normaliza en `lib/realtimePayloads.js`.
5. La tabla se actualiza con `applyRealtimeRowEvent` o se recarga completa si el caso lo requiere.
6. Al desmontar o cambiar de contexto, se llama `close()` para remover el canal.

Con este diseño, la lógica realtime queda centralizada y las tablas solo definen qué tabla de Supabase escuchan, cuál es su identificador de fila y cómo recargar si el payload no alcanza para actualizar incrementalmente.
