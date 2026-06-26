# Auth refresh con Supabase

## Resumen

La autenticacion usa cookies `httpOnly` manuales para guardar los tokens que entrega Supabase:

- `access_token`: JWT de vida corta, usado para autenticar queries y Realtime.
- `refresh_token`: token opaco de Supabase, no es JWT y no debe decodificarse.

El refresh lo ejecuta el cliente oficial `@supabase/supabase-js` mediante:

```js
supabase.auth.setSession({
  access_token,
  refresh_token
});
```

Este patron replica la implementacion previa de `last_src/middleware/auth.js`: el backend recupera los tokens desde cookies, se los entrega a Supabase y Supabase valida o refresca la sesion.

## Flujo de login

`app/api/login/route.js` llama:

```js
supabase.auth.signInWithPassword({ email, password });
```

Luego guarda en cookies:

- `access_token`
- `refresh_token`

El `refresh_token` conserva una duracion de 15 dias.

## Flujo de requests autenticados

La logica comun vive en `lib/authSession.js`.

1. Se leen `access_token` y `refresh_token` desde cookies.
2. Si existen ambos, se llama `supabase.auth.setSession(...)`.
3. Si el `access_token` ya no existe pero el `refresh_token` si, se llama `supabase.auth.refreshSession(...)`.
4. Si Supabase devuelve una sesion valida, se reescriben ambas cookies con los tokens actuales.
5. Las paginas y APIs reciben un cliente Supabase con la sesion ya establecida.

El middleware aplica el mismo flujo para `/main_catalog/:path*` y `/api/:path*`, y tambien reenvia los tokens nuevos al request actual para evitar que una pagina renderizada inmediatamente despues del refresh vea cookies viejas.

## Duracion de tokens

La duracion real del JWT `access_token` la controla Supabase Auth. La cookie `access_token` se dejo intencionalmente con una vida corta para pruebas:

```env
AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS=300
```

Si esa variable no existe, el default actual es 5 minutos.

Esto no significa que la sesion dure 5 minutos: mientras el `refresh_token` siga vivo y sea valido, Supabase puede emitir una sesion nueva.

## Nota sobre refresh tokens

Es normal que el `refresh_token` se vea como una cadena opaca, por ejemplo:

```txt
3v3fevmc44cr...
```

No debe verse como JWT ni tener formato `header.payload.signature`. Solo Supabase Auth puede validarlo y rotarlo.

## Archivos relevantes

- `lib/authSession.js`: validacion, refresh y escritura de cookies.
- `lib/auth.js`: helpers `requirePageUser()` y `requireApiUser()`.
- `middleware.js`: refresh temprano para paginas y APIs protegidas.
- `app/api/login/route.js`: login y escritura inicial de cookies.
- `app/api/logout/route.js`: limpieza de cookies.
