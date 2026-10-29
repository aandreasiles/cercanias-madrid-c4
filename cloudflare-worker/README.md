# 🛡️ Proxy CORS para Renfe en Cloudflare Workers

Este Worker permite que la aplicación web (desplegada en GitHub Pages) pueda consultar la API en tiempo real de Renfe (`tiempo-real.renfe.com`) sin ser bloqueada por las políticas de CORS del navegador.

## 🚀 Despliegue en 2 minutos (100% Gratuito)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/) e inicia sesión (o crea cuenta gratis).
2. En el menú lateral izquierdo, haz clic en **Workers & Pages** -> **Create application** -> **Create Worker**.
3. Ponle un nombre (ej. `renfe-cercanias-proxy`) y pulsa **Deploy**.
4. Pulsa en **Edit code** y pega el contenido del archivo [`worker.js`](./worker.js).
5. Pulsa en **Deploy** (arriba a la derecha).
6. Copia la URL pública generada (ej. `https://renfe-cercanias-proxy.tu-usuario.workers.dev`).

## ⚙️ Configuración en la Web

1. Abre la web de Cercanías C-4.
2. Haz clic en el icono de **Ajustes** (arriba a la derecha).
3. En el campo **Proxy CORS opcional**, introduce:
   ```text
   https://renfe-cercanias-proxy.tu-usuario.workers.dev/?url={url}
   ```
4. Haz clic en **Guardar cambios**. ¡La web mostrará inmediatamente los datos en directo oficiales con el distintivo verde `En Directo`!
