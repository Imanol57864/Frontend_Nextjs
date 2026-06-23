# Qué significa `apiRef` en los componentes de AG Grid

## Definición breve

`apiRef` es una referencia de React que guarda la API de una instancia de AG Grid.

Su valor útil se encuentra en:

```js
apiRef.current
```

Ese objeto permite controlar la tabla mediante código: cargar filas, aplicar cambios de Realtime, filtrar, refrescar celdas, recorrer registros y destruir la instancia.

No contiene directamente los datos de la tabla. Los datos se conservan por separado en `rowsRef.current`.

## Dónde se crea

Los componentes obtienen `apiRef` mediante el hook compartido `useAgGrid`:

```js
const apiRef = useAgGrid(gridRef, () => ({
  // opciones de AG Grid
}));
```

El hook está definido en `components/agGridShared.js`:

```js
export function useAgGrid(gridRef, optionsFactory, dependencies = []) {
  const apiRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current || apiRef.current) return undefined;

    apiRef.current = createGrid(gridRef.current, optionsFactory());

    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, dependencies);

  return apiRef;
}
```

El ciclo de vida es el siguiente:

1. Antes de crear la tabla, `apiRef.current` vale `null`.
2. `createGrid(...)` crea AG Grid y devuelve su API.
3. La API se guarda en `apiRef.current`.
4. Mientras el componente está montado, otras funciones utilizan esa API.
5. Al desmontar el componente, se ejecuta `destroy()` y la referencia vuelve a `null`.

## Por qué se usa un `ref`

`apiRef` usa `useRef` porque la instancia de AG Grid es un objeto mutable externo a React.

Cambiar `apiRef.current` no provoca un nuevo render. Esto es conveniente porque React solamente necesita renderizar el elemento contenedor; AG Grid administra internamente las filas, celdas, filtros y paginación.

Además, el mismo objeto puede consultarse desde callbacks asíncronos, listeners del DOM y eventos de Supabase Realtime sin quedar atrapado en un valor antiguo de un render previo.

## Diferencia entre las referencias del componente

En estos componentes aparecen varias referencias con responsabilidades distintas:

| Referencia | Contenido | Responsabilidad |
| --- | --- | --- |
| `gridRef` | Elemento `<div>` del DOM | Indica dónde debe montarse AG Grid. |
| `apiRef` | API creada por `createGrid` | Permite controlar la tabla. |
| `rowsRef` | Arreglo de registros actuales | Mantiene una copia de los datos visibles. |
| `realtimeRef` | Suscripción de Supabase | Permite cerrar el canal Realtime. |

La relación principal es:

```text
gridRef.current  -> contenedor HTML
apiRef.current   -> controlador de AG Grid
rowsRef.current  -> datos de la tabla
realtimeRef      -> origen de actualizaciones en vivo
```

## Usos en `CatalogAgGrid.jsx`

### Cargar filas

Después de consultar los análisis, el componente entrega los registros a AG Grid:

```js
rowsRef.current = result.data.data || [];
setRows(apiRef.current, rowsRef.current);
```

`setRows` llama internamente a:

```js
api.setGridOption("rowData", rows);
```

### Aplicar eventos Realtime

Cuando llega un cambio de `catAnalisis`, se pasa la API actual al helper compartido:

```js
applyRealtimeRowEvent({
  api: apiRef.current,
  rowsRef,
  data,
  idField: "id_analisis",
  reload: () => loadAnalisis()
});
```

El helper usa la API para buscar filas y ejecutar transacciones `INSERT`, `UPDATE` o `DELETE` en pantalla.

### Refrescar formatos

Cuando cambia la divisa, los datos base no necesariamente cambian, pero sí su presentación:

```js
apiRef.current?.refreshCells({ force: true });
```

Esto obliga a AG Grid a ejecutar otra vez los formateadores de las celdas.

### Exportar el contenido

Para generar el PDF se entrega la API a `exportPdf`:

```js
exportPdf(apiRef.current);
```

La función recorre las filas filtradas y ordenadas mediante:

```js
api.forEachNodeAfterFilterAndSort(...);
```

## Usos en `LaboratoriesAgGrid.jsx`

El componente utiliza `apiRef.current` para:

- Cargar los laboratorios consultados por la API.
- Aplicar incrementalmente cambios de Supabase Realtime.
- Conectar el buscador rápido con AG Grid.

La función `createRealtimeSubscription` recibe el `ref` completo, no solamente su valor:

```js
createRealtimeSubscription(apiRef, rowsRef, loadLabs);
```

Dentro del callback consulta `apiRef.current`:

```js
api: apiRef.current
```

Esto garantiza que el callback use la instancia vigente cuando llegue el evento, aunque el evento ocurra mucho después de crear la suscripción.

## Usos en `FilesAgGrid.jsx`

En la tabla de archivos, `apiRef.current` se usa principalmente para reemplazar `rowData` después de cada carga:

```js
setRows(apiRef.current, rowsRef.current);
```

Los eventos Realtime de archivos provocan una consulta completa porque las filas incluyen datos derivados, como URL, nombre, tipo y fecha. Por esa razón este componente no aplica transacciones incrementales directamente con `apiRef`.

## Uso en el filtro rápido

Los tres componentes llaman:

```js
useQuickFilter(apiRef);
```

El hook obtiene la API vigente cuando el usuario escribe:

```js
apiRef.current?.setGridOption("quickFilterText", event.target.value);
```

El operador `?.` evita errores si el usuario interactúa cuando la tabla todavía no ha terminado de crearse o ya está desmontándose.

## Regla práctica

Se debe usar:

```js
apiRef.current
```

cuando una función necesita hablar con AG Grid en ese momento.

Se debe pasar el `ref` completo:

```js
someAsyncFunction(apiRef)
```

cuando un callback se ejecutará más adelante y necesita consultar cuál es la instancia vigente.

No debe accederse a métodos de la tabla directamente sobre `apiRef`:

```js
// Incorrecto
apiRef.refreshCells();

// Correcto
apiRef.current?.refreshCells();
```

En resumen, `apiRef` es el puente estable entre el ciclo de vida de React y la API imperativa de AG Grid.
