# Docker y Puppeteer

## Problema

La generacion de PDF falla en contenedor cuando Puppeteer no encuentra el Chrome/Chromium requerido. El error aparece como 500 en `/api/export-analysis-pdf` porque `puppeteer.launch()` no puede iniciar un navegador.

En la imagen anterior basada en `node:20-alpine`, Puppeteer quedaba instalado, pero el navegador no estaba disponible en runtime. Instalar `chromium` con `apk add` corrige el problema, pero puede aumentar bastante el tiempo de build porque Alpine tiene que descargar e instalar Chromium y sus dependencias.

## Decisión actual

Se cambio el Dockerfile para usar la imagen oficial de Puppeteer:

```dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.43.1
```

Esta imagen ya incluye Node y Chrome preparado para Puppeteer. Por eso se elimino `node:20-alpine` y tambien se elimino la instalacion manual con `apk add chromium`.

Tambien se configura:

```dockerfile
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

`PUPPETEER_SKIP_DOWNLOAD=true` evita que `npm ci` descargue otro Chrome durante la instalacion de dependencias. `PUPPETEER_EXECUTABLE_PATH` hace que la app use el Chrome incluido en la imagen base.

## Por que no mezclar Alpine con la imagen de Puppeteer

No conviene construir dependencias en `node:20-alpine` y ejecutar en una imagen Puppeteer basada en Debian/Ubuntu.

Alpine usa `musl`, mientras que Debian/Ubuntu usa `glibc`. Algunas dependencias nativas de Node, como binarios de Next/SWC u otros paquetes compilados, pueden instalar variantes distintas segun la distribucion. Copiar `node_modules` entre esas bases puede provocar errores en runtime.

Por esa razon, si se usa `ghcr.io/puppeteer/puppeteer`, conviene usarla en todas las etapas relevantes del Dockerfile: `deps`, `builder` y `runner`.

## Alternativa si se quiere conservar node:20-alpine

Si en el futuro se quiere mantener la app en `node:20-alpine`, la opcion mas limpia es separar el navegador en otro contenedor, por ejemplo con Browserless o una imagen dedicada de Chromium.

En ese esquema:

- La app sigue ligera en Alpine.
- Chromium vive en un servicio separado.
- La app usa `puppeteer.connect()` en vez de `puppeteer.launch()`.

Esto agrega complejidad operacional, pero puede ser mejor si se generan muchos PDFs o si se quiere escalar el navegador independientemente de la app.

## Resumen

- Imagen oficial de Puppeteer: solucion simple y estable para este proyecto.
- `node:20-alpine` + `apk add chromium`: funciona, pero puede volver lento el build. Esto último provocó que la build pasara de 300 segundos a 1000 segundos.
- `node:20-alpine` + Browserless/Chromium separado: mejor separación, pero requiere cambios de codigo y otro servicio.