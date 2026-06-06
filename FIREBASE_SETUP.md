# Firebase para La Carzina

## 1. Crear proyecto
1. Entra a Firebase Console.
2. Crea un proyecto para `lacarzina.com`.
3. Activa Firestore Database.
4. Crea una app Web y copia el `firebaseConfig`.

## 2. Pegar configuracion
Edita `firebase-config.js` y pega los valores reales:

```js
window.LC_FIREBASE_CONFIG={
  apiKey:'...',
  authDomain:'...',
  projectId:'...',
  storageBucket:'...',
  messagingSenderId:'...',
  appId:'...'
};
```

El dominio publico ya esta configurado como:

```js
window.LC_DOMAIN='https://lacarzina.com';
```

## 3. Firestore
El sistema usa:

- `clientes/{clienteId}`
- `pedidos/{pedidoId}`
- `comandas/{comandaId}`
- `config/folio_counter`

Al enviar por WhatsApp:

1. Incrementa `config/folio_counter.ultimo` con transaccion.
2. Guarda o actualiza el cliente.
3. Guarda el pedido.
4. Guarda la comanda con `expiresAt` a 30 dias.
5. Agrega al WhatsApp el link `https://lacarzina.com/comanda.html?id=...`.

## 4. Reglas
Usa `firestore.rules` como base inicial.

Para produccion real, lo mas seguro es mover la creacion de pedidos, comandas y folios a Cloud Functions/Admin SDK y dejar el cliente web solo leyendo comandas publicas no vencidas.
