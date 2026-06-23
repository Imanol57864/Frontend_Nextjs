Correcto: `jsonOk()` y el `route.js` funcionan bien. El problema está en cómo `FilesAgGrid` interpreta esa respuesta.

Hay dos valores `ok` distintos:

- `result.ok`: indica que HTTP respondió correctamente.
- `result.data.ok`: busca una propiedad `ok` dentro del JSON.

Actualmente:

```js
export async function sendCellChange(
  url,
  rowId,
  field,
  newValue,
  isBlocked = (data) => !data.ok
) {
  const result = await postJson(url, { rowId, field, newValue });
  return !isBlocked(result.data, result);
}
```

El backend responde:

```js
{
  message: "",
  data: []
}
```

Por tanto:

```js
data.ok               // undefined
!data.ok              // true
!isBlocked(...)       // false
```

Por eso `ok` en `FilesAgGrid` siempre vale `false`, aunque la petición haya sido exitosa.

Las demás tablas funcionan porque reemplazan el criterio predeterminado:

```js
sendCellChange(
  "/send-table-change/cell",
  rowId,
  field,
  newValue,
  (data, result) => !result.ok || data.IdDuplicate
);
```

La solución consistente es cambiar el valor predeterminado en [`agGridShared.js`](/C:/Users/Usuario/Desktop/IFC_Frontend/components/agGridShared.js:170):

```js
export async function sendCellChange(
  url,
  rowId,
  field,
  newValue,
  isBlocked = (_data, result) => !result.ok
) {
  const result = await postJson(url, { rowId, field, newValue });
  return !isBlocked(result.data, result);
}
```

Así `FilesAgGrid` recibirá `true` con un HTTP exitoso. El `route.js` no necesita cambios.

`isBlocked` es un predicado: responde si la edición debe considerarse rechazada.

El flujo está invertido:

```js
const blocked = isBlocked(result.data, result);
return !blocked;
```

Así:

- `isBlocked(...) === true` → `sendCellChange()` devuelve `false`.
- `isBlocked(...) === false` → devuelve `true`.

Se llama “blocked” porque contempla errores HTTP y rechazos de negocio, como valores duplicados.

Por ejemplo, Catálogo pasa su propia regla:

```js
(data, result) => !result.ok || data.IdDuplicate
```

La edición queda bloqueada cuando:

- La petición HTTP falla: `!result.ok`.
- El backend detecta un duplicado: `data.IdDuplicate`.

Laboratorios agrega otro caso:

```js
(data, result) =>
  !result.ok ||
  data.IdDuplicate ||
  data.resetUI
```

¿Por qué cambiar el valor predeterminado no rompe las demás tablas?

Porque el valor predeterminado sólo se utiliza cuando no se proporciona el cuarto argumento:

```js
isBlocked = (_data, result) => !result.ok
```

- `FilesAgGrid` no proporciona callback, así que utilizará el nuevo valor predeterminado.
- Catálogo y Laboratorios sí proporcionan callbacks, por lo que sus validaciones permanecen exactamente iguales.

Personalmente, considero que `isBlocked` resulta algo ambiguo. Un nombre más claro sería:

```js
isRejected
```

o:

```js
hasError
```

Pero el funcionamiento esperado sería el mismo: determinar si el cambio debe rechazarse antes de que `sendCellChange` devuelva el resultado final.