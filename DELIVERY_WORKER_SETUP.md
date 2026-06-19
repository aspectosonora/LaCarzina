# Envio por distancia - La Carzina

## 1. Worker que debes crear

Crea un Cloudflare Worker nuevo y pega el contenido de:

`cloudflare-delivery-worker.js`

Ese Worker llama a Google Distance Matrix API desde Cloudflare, por eso la llave de Google Maps no queda en el frontend.

## 2. Endpoint para el frontend

Cuando Cloudflare te de la URL del Worker, pegala en:

`firebase-config.js`

```js
window.LC_DELIVERY_ENDPOINT='https://TU-WORKER.workers.dev';
```

## 3. Secreto de Cloudflare

En el Worker configura este secreto:

`GOOGLE_MAPS_API_KEY`

Valor: tu API key de Google Maps con Distance Matrix API habilitada.

Opcionalmente puedes configurar:

`ORIGIN_ADDRESS`

Valor recomendado:

`Paris #2199 esquina Jesus Garcia, Col. Bellavista, Ciudad Obregon, Sonora, Mexico`

Si no lo configuras, el Worker usa esa direccion por defecto.

## 4. Archivos finales

Para el hosting del sitio sube:

- `index.html`
- `lacarzina.html`
- `comanda.html`
- `firebase-config.js`
- todas las imagenes `.png`
- `firestore.rules` solo como referencia para reglas, no como pagina publica

Para Cloudflare sube o pega:

- `cloudflare-delivery-worker.js`

## 5. Prueba sin romper WhatsApp

1. En `firebase-config.js`, deja temporalmente `window.LC_DELIVERY_ENDPOINT=''`.
2. Haz un pedido con envio a domicilio.
3. Debe aparecer `Por confirmar segun ubicacion`.
4. WhatsApp debe abrir de todos modos.
5. Luego pega el endpoint real del Worker.
6. Prueba una direccion cerca: debe sumar envio al total.
7. Prueba una direccion de mas de 15 km: debe volver a `Por confirmar segun ubicacion`.

El envio no genera puntos: los puntos se calculan solo con el subtotal de productos.
