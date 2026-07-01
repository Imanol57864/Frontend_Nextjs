# Estado areaId e IAM.json

## Objetivo

La aplicacion necesita conocer el `area_id` del usuario autenticado para tomar decisiones de UI usando `lib/IAM.json`.

El estado de `areaId` se usa para mostrar u ocultar controles en componentes React. No debe tratarse como autorizacion final para operaciones sensibles.

## Flujo de sesion

1. `lib/auth.js` lee las cookies `access_token` y `refresh_token` desde `next/headers`.
2. `getSessionContext()` llama a `getSupabaseSession()` en `lib/authSession.js`.
3. `getSupabaseSession()` usa el cliente Supabase del servidor para ejecutar:
   - `supabase.auth.setSession(...)` cuando existe `access_token`.
   - `supabase.auth.refreshSession(...)` cuando necesita refrescar con `refresh_token`.
4. Supabase valida la sesion y devuelve `data.user`.
5. `getSessionContext()` usa `session.user.id` como entrada para `getUserAreaId()`.
6. `getUserAreaId()` consulta la tabla `Area_Usuario`:

```js
supabase
  .from("Area_Usuario")
  .select("area_id")
  .eq("user_id", userId)
  .maybeSingle();
```

7. El `areaId` se agrega al contexto de sesion que devuelven `requirePageUser()` y `requireApiUser()`.

## Origen confiable de userId

El `userId` usado por `getUserAreaId()` no viene del cliente ni de un input del navegador.

Viene de `data.user.id`, que es devuelto por Supabase Auth despues de validar la sesion en `authSession.js`.

Aunque el navegador envie cookies, esas cookies son `httpOnly` y el usuario no puede leerlas ni modificarlas desde JavaScript del cliente. Ademas, el servidor no confia en un `user_id` enviado por formulario, query param o body; siempre toma el usuario desde la sesion validada por Supabase.

## Estado global en cliente

`components/UserAreaContext.jsx` guarda solo el `areaId` en un contexto React:

```jsx
<UserAreaProvider areaId={areaId}>
  {children}
</UserAreaProvider>
```

Las pantallas protegidas reciben `areaId` desde `requirePageUser()` y lo pasan a `PageChrome`, que hidrata el provider para los componentes cliente.

Para leer el area:

```js
const { areaId } = useUserArea();
```

Para evaluar IAM desde UI:

```js
const canCreate = useCanUseIam("analisis", "cud_data");
```

## IAM.json

`lib/IAM.json` permite dos tipos de reglas:

```json
{
  "analisis": {
    "access_view": true,
    "cud_data": [1]
  }
}
```

Interpretacion:

- `true`: permiso siempre permitido.
- `[1, 2, 3]`: permiso permitido solo si el `areaId` del usuario esta en el array.
- cualquier otro valor o permiso inexistente: permiso denegado.

La funcion central es `canUseIam(section, permission, areaId)` en `lib/iam.js`.

## Seguridad

El contexto React no es seguridad real. Un usuario con DevTools podria alterar estado del cliente o ejecutar funciones manualmente en el navegador.

Por eso este mecanismo solo sirve para UX: ocultar botones, columnas o vistas.

Para operaciones criticas, la autorizacion debe validarse tambien en servidor:

```js
const session = await requireApiUser();

if (!canUseIam("analisis", "cud_data", session.areaId)) {
  return NextResponse.json({ message: "No autorizado." }, { status: 403 });
}
```

La defensa mas fuerte debe vivir en Supabase RLS/policies, porque esas reglas protegen la base de datos incluso si alguien llama directamente una API o intenta saltarse la UI.

## Archivos relacionados

- `lib/authSession.js`: valida o refresca la sesion con Supabase Auth.
- `lib/auth.js`: construye el contexto de sesion y agrega `areaId`.
- `lib/userArea.js`: consulta `Area_Usuario`.
- `lib/iam.js`: evalua reglas de `IAM.json`.
- `components/UserAreaContext.jsx`: expone `areaId` y `useCanUseIam()` a componentes cliente.
- `components/PageChrome.jsx`: hidrata el provider en pantallas autenticadas.
