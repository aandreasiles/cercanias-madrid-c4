/**
 * Cloudflare Worker: Proxy CORS para la API de Renfe Cercanías
 * 
 * Permite que clientes web (como GitHub Pages) consulten los endpoints
 * en tiempo real de Renfe evitando las restricciones de CORS del navegador.
 *
 * Gratuito: Cloudflare permite hasta 100.000 peticiones al día sin coste.
 */

export default {
  async fetch(request, env, ctx) {
    // Manejo de pre-flight CORS (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Falta el parámetro ?url= con la URL de Renfe' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    try {
      const parsed = new URL(targetUrl);
      // Validar que solo se hagan peticiones hacia dominios de Renfe por seguridad
      if (!parsed.hostname.endsWith('renfe.com')) {
        return new Response(
          JSON.stringify({ error: 'Solo se permiten peticiones a dominios de renfe.com' }),
          { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const renfeResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://tiempo-real.renfe.com/'
        }
      });

      const body = await renfeResponse.arrayBuffer();
      const responseHeaders = new Headers(renfeResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(body, {
        status: renfeResponse.status,
        statusText: renfeResponse.statusText,
        headers: responseHeaders
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Error al conectar con Renfe', details: err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }
  }
};
