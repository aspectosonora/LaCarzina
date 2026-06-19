const RESTAURANT_ADDRESS = 'Paris #2199 esquina Jesus Garcia, Col. Bellavista, Ciudad Obregon, Sonora, Mexico';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, text: 'Metodo no permitido' }, 405);
    }

    try {
      const body = await request.json();
      const destination = String(body.destination || '').trim();
      if (!destination) return json({ ok: false, text: 'Por confirmar segun ubicacion' });
      if (!env.GOOGLE_MAPS_API_KEY) return json(confirmResponse('missing-google-maps-secret'));

      const origin = env.ORIGIN_ADDRESS || RESTAURANT_ADDRESS;
      const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
      url.searchParams.set('origins', origin);
      url.searchParams.set('destinations', destination);
      url.searchParams.set('units', 'metric');
      url.searchParams.set('language', 'es-MX');
      url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);

      const mapsRes = await fetch(url.toString());
      if (!mapsRes.ok) return json(confirmResponse('google-http-' + mapsRes.status));
      const maps = await mapsRes.json();
      const element = maps.rows?.[0]?.elements?.[0];
      if (maps.status && maps.status !== 'OK') {
        return json(confirmResponse(maps.status, maps.error_message));
      }
      if (!element || element.status !== 'OK' || !element.distance?.value) {
        return json(confirmResponse(element?.status || maps.status || 'google-no-distance', maps.error_message));
      }

      const distanceKm = element.distance.value / 1000;
      const base = baseRate(distanceKm);
      if (base === null) {
        return json({
          ok: true,
          overLimit: true,
          distanceKm: roundKm(distanceKm),
          price: null,
          text: 'Por confirmar segun ubicacion'
        });
      }

      const zone = zoneExtra(destination);
      const price = base + zone.extra;
      return json({
        ok: true,
        overLimit: false,
        distanceKm: roundKm(distanceKm),
        base,
        extra: zone.extra,
        zone: zone.name,
        price,
        text: '$' + price
      });
    } catch (err) {
      console.warn('delivery-worker-error', err);
      return json(confirmResponse('worker-error'));
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function confirmResponse(reason, googleError = '') {
  return {
    ok: false,
    reason,
    googleError,
    price: null,
    text: 'Por confirmar segun ubicacion'
  };
}

function roundKm(km) {
  return Math.round(km * 10) / 10;
}

function baseRate(km) {
  if (km <= 4) return 30;
  if (km <= 5) return 35;
  if (km <= 6) return 40;
  if (km <= 7) return 45;
  if (km <= 8) return 50;
  if (km <= 9) return 55;
  if (km <= 9.9) return 60;
  if (km <= 10) return 65;
  if (km <= 11) return 70;
  if (km <= 12) return 75;
  if (km <= 13) return 80;
  if (km <= 14) return 85;
  if (km <= 15) return 90;
  return null;
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function zoneExtra(destination) {
  const text = normalize(destination);
  const zones = [
    ['Villa Bonita', 10, ['villa bonita']],
    ['Esperanza', 10, ['esperanza']],
    ['Cocorit', 15, ['cocorit']],
    ['Lomas Paraiso', 5, ['lomas paraiso']],
    ['Santa Catalina', 5, ['santa catalina']],
    ['Unison', 5, ['unison', 'universidad de sonora']],
    ['Providencia', 5, ['providencia']],
    ['Porton', 15, ['porton']],
    ['Campo 2', 5, ['campo 2']],
    ['Constellation', 5, ['constellation', 'costelletion']],
    ['Beltrones', 10, ['beltrones']],
    ['Amaneceres', 10, ['almaneceres', 'amaneceres']]
  ];
  for (const [name, extra, aliases] of zones) {
    if (aliases.some(alias => text.includes(alias))) return { name, extra };
  }
  return { name: '', extra: 0 };
}
