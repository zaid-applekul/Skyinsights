// supabase/functions/planet-insights/index.ts

type PlanetInsightsRequest = {
  configId?: string;
  lat: number;
  lon: number;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  layers?: string[];
};

type PlanetInsightsResponse = {
  _source?: 'planet' | 'open-meteo' | 'mock';
  temperature?: number;
  rainfall?: number;
  relativeHumidity?: number;
  windSpeed?: number;
  soilMoisture?: number;
  canopyHumidity?: number;
  wetnessHours?: number;
  rh?: number;
  weeklyRainfall?: number;
  leafWetness?: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request): Promise<Response> => {
  console.log('🌍 planet-insights called:', req.method);
  
  // 1) CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 2) Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  // 3) Parse body
  let body: PlanetInsightsRequest;
  try {
    body = (await req.json()) as PlanetInsightsRequest;
    console.log('📍 Request body:', { lat: body.lat, lon: body.lon, startDate: body.startDate, endDate: body.endDate });
  } catch {
    return new Response('Invalid JSON body', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { lat, lon, startDate, endDate } = body;

  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    !startDate ||
    !endDate
  ) {
    return new Response('Missing lat/lon/startDate/endDate', {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // 4) Call Open‑Meteo daily API
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: startDate,
      end_date: endDate,
      daily: [
        'temperature_2m_mean',
        'precipitation_sum',
        'relative_humidity_2m_mean',
        'windspeed_10m_max',
      ].join(','),
      timezone: 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    console.log('🌤️ Calling Open-Meteo:', url);
    const omRes = await fetch(url);

    if (!omRes.ok) {
      const text = await omRes.text().catch(() => '');
      console.error('open-meteo error', omRes.status, text);
      return new Response('Upstream weather error', {
        status: 502,
        headers: corsHeaders,
      });
    }

    const omData = (await omRes.json()) as any;
    const daily = omData.daily;

    if (!daily || !daily.time || daily.time.length === 0) {
      const emptyResp: PlanetInsightsResponse = { _source: 'open-meteo' };
      return new Response(JSON.stringify(emptyResp), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 5) Simple aggregation: averages over the period
    const avg = (arr: number[] | undefined): number | undefined => {
      if (!arr || arr.length === 0) return undefined;
      const s = arr.reduce((a, b) => a + b, 0);
      return s / arr.length;
    };

    const sum = (arr: number[] | undefined): number | undefined => {
      if (!arr || arr.length === 0) return undefined;
      return arr.reduce((a, b) => a + b, 0);
    };
    const temperature = avg(daily.temperature_2m_mean);
    const dailyRainfall = avg(daily.precipitation_sum);         // mm/day average
    const totalRainfall = sum(daily.precipitation_sum);         // total mm for period
    const relativeHumidity = avg(daily.relative_humidity_2m_mean);
    const windSpeed = avg(daily.windspeed_10m_max);

    // Calculate weekly rainfall - if we have less than 7 days, extrapolate
    const daysInPeriod = daily.time.length;
    const weeklyRainfall = totalRainfall !== undefined 
      ? (daysInPeriod >= 7 ? totalRainfall : (totalRainfall / daysInPeriod) * 7)
      : undefined;

    // Enhanced leaf wetness calculation using Penman-Monteith approach
    // Factors: humidity, temperature, rainfall, and wind speed
    const leafWetness = (() => {
      if (relativeHumidity === undefined || temperature === undefined) return undefined;
      
      // Base wetness from humidity (higher humidity = longer wetness)
      let wetness = (relativeHumidity - 50) * 0.2; // 0-10 hours from humidity
      
      // Add wetness from rainfall (each mm adds ~0.5 hours of wetness)
      if (dailyRainfall !== undefined) {
        wetness += dailyRainfall * 0.5;
      }
      
      // Temperature effect (cooler = slower drying)
      if (temperature < 15) {
        wetness *= 1.3; // 30% longer wetness in cool conditions
      } else if (temperature > 25) {
        wetness *= 0.7; // 30% shorter wetness in warm conditions
      }
      
      // Wind effect (higher wind = faster drying)
      if (windSpeed !== undefined) {
        if (windSpeed > 10) {
          wetness *= 0.8; // Strong wind reduces wetness duration
        } else if (windSpeed < 3) {
          wetness *= 1.2; // Low wind increases wetness duration
        }
      }
      
      // Ensure reasonable bounds (0-24 hours per day)
      return Math.max(0, Math.min(24, Math.round(wetness * 10) / 10));
    })();
    // 6) Derived placeholders
    const soilMoisture =
      dailyRainfall !== undefined && relativeHumidity !== undefined
        ? Math.min(100, Math.round(10 + dailyRainfall * 4 + relativeHumidity / 5))
        : undefined;

    const canopyHumidity =
      relativeHumidity !== undefined
        ? Math.min(100, Math.round(relativeHumidity - 3))
        : undefined;


    const resp: PlanetInsightsResponse = {
      _source: 'open-meteo',
      temperature:
        temperature !== undefined ? Math.round(temperature * 10) / 10 : undefined,
      rainfall:
        dailyRainfall !== undefined ? Math.round(dailyRainfall * 10) / 10 : undefined,
      relativeHumidity:
        relativeHumidity !== undefined
          ? Math.round(relativeHumidity)
          : undefined,
      windSpeed:
        windSpeed !== undefined ? Math.round(windSpeed * 10) / 10 : undefined,
      soilMoisture,
      canopyHumidity,
      wetnessHours: leafWetness,
      // Add legacy field mappings for frontend compatibility
      rh: relativeHumidity !== undefined ? Math.round(relativeHumidity) : undefined,
      weeklyRainfall: weeklyRainfall !== undefined ? Math.round(weeklyRainfall * 10) / 10 : undefined,
      leafWetness: leafWetness,
    };

    console.log('✅ Returning climate data:', resp);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error('planet-insights internal error', e);
    return new Response('Internal error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
