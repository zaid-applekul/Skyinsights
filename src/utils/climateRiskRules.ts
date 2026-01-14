export type DustLevel = 'unknown' | 'low' | 'medium' | 'high';
export type Drainage = 'unknown' | 'good' | 'poor';

export type Meta = {
  tempMin?: number; tempMax?: number;
  rhMin?: number; rhMax?: number;
  rainMin?: number; rainMax?: number;
  wetMin?: number; wetMax?: number;
  windMin?: number; windMax?: number;
  soilMin?: number; soilMax?: number;
  canopyMin?: number;
  dustLevel?: 'low' | 'medium' | 'high';
  drainage?: 'good' | 'poor';
};

export type ClimateParams = {
  // primary names (new)
  temperature: number; // °C
  relativeHumidity?: number; // %
  rainfall?: number; // mm/week
  wetnessHours?: number; // hours
  windSpeed?: number; // km/h
  soilMoisture?: number; // % (optional)
  canopyHumidity?: number; // % optional
  dustLevel?: DustLevel; // optional
  drainage?: Drainage; // optional
  hasStandingWater48h?: boolean;
  hasTempJump10C?: boolean;
  hadDroughtThenHeavyRain?: boolean;
  mode?: 'standard' | 'meta';
  // legacy names (kept for backward compatibility)
  rh?: number;
  weeklyRainfall?: number;
  leafWetness?: number;
  // ensure windSpeed alias exists
};

type RiskItem = {
  name: string;
  category: 'Disease' | 'Pest';
  score: number;
  level: 'Low' | 'Medium' | 'High';
  matchedFactors: string[];
};

// Per-disease small weights to break ties deterministically
const diseaseWeights: Record<string, number> = {
  'Brown Rot': 1.2,
  "Bull's‑eye Rot": 1.15,
  'Apple Scab': 1.1,
  'Apple Leaf Blotch (Alternaria)': 1.05,
  // default is 1 for anything not listed
};

function applyDiseaseWeight(name: string, rawScore: number): number {
  const w = diseaseWeights[name] ?? 1;
  const weighted = rawScore * w;
  return weighted > 100 ? 100 : weighted;
}

const levelFor = (score: number): RiskItem['level'] => {
  if (score <= 30) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
};

const scoreFromMatches = (matches: string[]) => Math.min(100, matches.length * 20);

function scoreStandardItem(item: { name: string; checks: Array<[string, boolean]> }, _params: ClimateParams) {
  const matched = item.checks.filter(([, ok]) => ok).map(([label]) => label);
  const score = scoreFromMatches(matched);
  return { score, matchedFactors: matched };
}

function scoreFromMeta(name: string, meta: Meta | undefined, params: ClimateParams) {
  let score = 0;
  const matchedFactors: string[] = [];
  if (!meta) return { score, matchedFactors };

  if (meta.tempMin !== undefined && meta.tempMax !== undefined &&
      params.temperature >= meta.tempMin && params.temperature <= meta.tempMax) {
    score += 20; matchedFactors.push(`Temperature ${meta.tempMin}–${meta.tempMax}°C`);
  }

  if (meta.rhMin !== undefined && params.relativeHumidity !== undefined &&
      params.relativeHumidity >= meta.rhMin &&
      (meta.rhMax === undefined || params.relativeHumidity <= meta.rhMax)) {
    score += 20; matchedFactors.push(`RH ${meta.rhMin}${meta.rhMax ? "–" + meta.rhMax : "+"}%`);
  }

  if (meta.rainMin !== undefined && params.rainfall !== undefined &&
      params.rainfall >= meta.rainMin &&
      (meta.rainMax === undefined || params.rainfall <= meta.rainMax)) {
    score += 20; matchedFactors.push("Rainfall in favourable range");
  }

  if (meta.wetMin !== undefined && params.wetnessHours !== undefined &&
      params.wetnessHours >= meta.wetMin &&
      (meta.wetMax === undefined || params.wetnessHours <= meta.wetMax)) {
    score += 20; matchedFactors.push("Leaf/fruit wetness in favourable range");
  }

  if (meta.windMin !== undefined && params.windSpeed !== undefined &&
      params.windSpeed >= meta.windMin &&
      (meta.windMax === undefined || params.windSpeed <= meta.windMax)) {
    score += 20; matchedFactors.push("Wind speed in favourable range");
  }

  if (meta.soilMin !== undefined && params.soilMoisture !== undefined &&
      params.soilMoisture >= meta.soilMin &&
      (meta.soilMax === undefined || params.soilMoisture <= meta.soilMax)) {
    score += 20; matchedFactors.push("Soil moisture in favourable range");
  }

  if (meta.canopyMin !== undefined && params.canopyHumidity !== undefined && params.canopyHumidity >= meta.canopyMin) {
    score += 20; matchedFactors.push(`High canopy humidity (≥${meta.canopyMin}%)`);
  }

  if (meta.dustLevel === 'high' && params.dustLevel === 'high') {
    score += 20; matchedFactors.push('High dust level');
  }

  if (meta.drainage === 'poor' && (params.drainage === 'poor' || params.hasStandingWater48h)) {
    score += 20; matchedFactors.push('Poor drainage / standing water');
  }

  if (name.toLowerCase().startsWith('necrotic leaf blotch')) {
    if (params.hasTempJump10C) { score += 20; matchedFactors.push('Temperature fluctuation >10°C in 24–48 h'); }
    if (params.hadDroughtThenHeavyRain) { score += 20; matchedFactors.push('Drought followed by heavy rain'); }
  }

  if (score > 100) score = 100;
  return { score, matchedFactors };
}

export function calculateDiseaseRisks(params: ClimateParams): RiskItem[] {
  // support both legacy and new param names
  const t = params.temperature;
  const rh = params.rh ?? params.relativeHumidity ?? 0;
  const rain = params.weeklyRainfall ?? params.rainfall ?? 0;
  const lw = params.leafWetness ?? params.wetnessHours ?? 0;
  const w = params.windSpeed ?? 0;
  const sm = params.soilMoisture;
  const canopyHumidity = params.canopyHumidity;

  const items: { name: string; checks: Array<[string, boolean]>; meta?: any }[] = [
    [
      'Apple Scab',
      [
        ['Temperature 10–24°C', t >= 10 && t <= 24],
        ['RH >85%', rh > 85],
        ['Rainfall ≥5 mm', rain >= 5],
        ['Leaf wetness 9–12h', lw >= 9 && lw <= 12],
        ['Wind 5–15 km/h', w >= 5 && w <= 15],
        ['High canopy humidity (>=70%)', typeof canopyHumidity === 'number' ? canopyHumidity >= 70 : false]
      ]
    ],
  ].map(([name, checks]) => ({ name: name as string, checks }));

  // Build remaining disease items

  // add meta for Apple Scab per requested numeric fields
  items[0].meta = {
    wetMin: 9,
    wetMax: 12,
    windMin: 5,
    windMax: 15,
    soilMin: 60,
    soilMax: 80
  };
  items.push({
    name: 'Apple Leaf Blotch (Alternaria)',
    checks: [
      ['Temperature 24–30°C', t >= 24 && t <= 30],
      ['RH 80–95%', rh >= 80 && rh <= 95],
      ['Rainfall 15–40 mm/week', rain >= 15 && rain <= 40],
      ['Leaf wetness ≥6h', lw >= 6],
      ['High canopy humidity (>=70%)', typeof canopyHumidity === 'number' ? canopyHumidity >= 70 : false]
    ]
    ,
    meta: {
      wetMin: 6,
      wetMax: 24,
      windMin: 3,
      windMax: 20,
      soilMin: 60,
      soilMax: 80
    }
  });

  items.push({
    name: 'Powdery Mildew',
    checks: [
      ['Temperature 15–25°C', t >= 15 && t <= 25],
      ['RH 60–85%', rh >= 60 && rh <= 85],
      ['Leaf wetness 0–2h', lw >= 0 && lw <= 2],
      ['Wind <6 km/h', w < 6]
    ]
    , meta: { wetMin: 0, wetMax: 2, windMin: 0, windMax: 6, soilMin: 50, soilMax: 70 }
  });

  items.push({
    name: 'Brown Rot',
    checks: [
      ['Temperature 20–30°C', t >= 20 && t <= 30],
      ['RH ≥85%', rh >= 85],
      ['Rainfall ≥10 mm', rain >= 10],
      ['Wetness ≥5h', lw >= 5]
    ]
    , meta: { wetMin: 5, wetMax: 24, windMin: 3, windMax: 20, soilMin: 60, soilMax: 80 }
  });

  items.push({
    name: "Bull's‑eye Rot",
    checks: [
      ['Temperature 15–22°C', t >= 15 && t <= 22],
      ['RH 85–95%', rh >= 85 && rh <= 95],
      ['Rainfall 20–50 mm', rain >= 20 && rain <= 50],
      ['Leaf/Fruit wetness ≥8h', lw >= 8]
    ]
    , meta: { wetMin: 8, wetMax: 24, windMin: 0, windMax: 12, soilMin: 60, soilMax: 80 }
  });

  items.push({
    name: 'Sooty Blotch',
    checks: [
      ['Temperature 20–28°C', t >= 20 && t <= 28],
      ['RH ≥90%', rh >= 90],
      ['Rainfall ≥30 mm/month (approx week>=7)', rain >= 7],
      ['Leaf wetness ≥12h', lw >= 12]
    ]
    , meta: { wetMin: 12, wetMax: 48, windMin: 0, windMax: 15, soilMin: 70, soilMax: 90 }
  });

  items.push({
    name: 'Flyspeck',
    checks: [
      ['Temperature 18–26°C', t >= 18 && t <= 26],
      ['RH 90–98%', rh >= 90 && rh <= 98],
      ['Frequent light rains (>=3 days/week) approximated as rain>=3', rain >= 3],
      ['Leaf wetness ≥15h', lw >= 15]
    ]
    , meta: { wetMin: 15, wetMax: 48, windMin: 0, windMax: 15, soilMin: 70, soilMax: 90 }
  });

  items.push({
    name: 'Collar / Root Rot',
    checks: [
      ['Soil Temp 15–28°C (approx)', t >= 15 && t <= 28],
      ['Soil moisture ≥85%', (sm ?? 0) >= 85],
      ['Rainfall ≥40 mm/week', rain >= 40]
    ]
    , meta: { soilMin: 85, soilMax: 100, rainMin: 40, drainage: 'poor', windMin: 0, windMax: 20 }
  });

  items.push({
    name: 'Necrotic Leaf Blotch (physiological)',
    checks: [
      ['RH <40% OR >90%', rh < 40 || rh > 90],
      ['Soil moisture swing <40% then >80% (approx ignored)', false],
      ['Hot & dry wind >15 km/h', w > 15]
    ]
    , meta: { soilMin: 0, soilMax: 40, windMin: 15, windMax: 100, rainMin: 20, wetMin: 2, wetMax: 24 }
  });

  // add canopy humidity influence to a few moisture-related diseases
  // (added as separate checks above where appropriate)

  const mode = params.mode ?? 'standard';

  const results = items.map(item => {
    const sc = mode === 'meta'
      ? scoreFromMeta(item.name, (item as any).meta as Meta | undefined, params)
      : scoreStandardItem(item, params);
    const weightedScore = applyDiseaseWeight(item.name, sc.score);

    return {
      name: item.name,
      category: 'Disease' as const,
      score: weightedScore,
      level: levelFor(weightedScore),
      matchedFactors: sc.matchedFactors
    };
  }).sort((a, b) => b.score - a.score);

  return results;
}

export function calculatePestRisks(params: ClimateParams): RiskItem[] {
  // support both legacy and new param names
  const t = params.temperature;
  const rh = params.rh ?? params.relativeHumidity ?? 0;
  const rain = params.weeklyRainfall ?? params.rainfall ?? 0;
  const lw = params.leafWetness ?? params.wetnessHours ?? 0;
  const w = params.windSpeed ?? 0;
  const sm = params.soilMoisture;
  const dustLevel = params.dustLevel;
  const canopyHumidity = params.canopyHumidity;
  const drainage = params.drainage;

  const items: { name: string; checks: Array<[string, boolean]>; meta?: any }[] = [];

  items.push({
    name: 'Fruit Fly',
    checks: [
      ['Temperature 22–35°C', t >= 22 && t <= 35],
      ['RH 70–95%', rh >= 70 && rh <= 95],
      ['Rainfall 20–60 mm/week', rain >= 20 && rain <= 60],
      ['Wind <12 km/h', w < 12],
      ['Soil moisture >70%', (sm ?? 0) > 70]
    ]
    , meta: { windMin: 0, windMax: 12, soilMin: 70, soilMax: 100, canopyMin: 70 }
  });

  items.push({
    name: 'Tent Caterpillar',
    checks: [
      ['Temperature 18–30°C', t >= 18 && t <= 30],
      ['RH 45–65%', rh >= 45 && rh <= 65],
      ['Rainfall <20 mm/week', rain < 20],
      ['Wind <10 km/h', w < 10]
    ]
    , meta: { windMin: 0, windMax: 10, wetMin: 2, wetMax: 10, soilMin: 50, soilMax: 70 }
  });

  items.push({
    name: 'Fruit Borer',
    checks: [
      ['Temperature 20–32°C', t >= 20 && t <= 32],
      ['RH 60–80%', rh >= 60 && rh <= 80],
      ['Rainfall 10–30 mm/week', rain >= 10 && rain <= 30],
      ['Wind <10 km/h', w < 10]
    ]
    , meta: { windMin: 0, windMax: 10, wetMin: 4, wetMax: 12, soilMin: 60, soilMax: 80 }
  });

  items.push({
    name: 'European Red Mite',
    checks: [
      ['Temperature 26–38°C', t >= 26 && t <= 38],
      ['RH 30–55%', rh >= 30 && rh <= 55],
      ['Rainfall <10 mm/week', rain < 10],
      ['Wind <8 km/h', w < 8],
      ['Dust level high', dustLevel === 'high']
    ]
    , meta: { windMin: 0, windMax: 8, wetMin: 0, wetMax: 4, soilMin: 40, soilMax: 70, dustLevel: 'high' }
  });

  items.push({
    name: 'San José Scale',
    checks: [
      ['Temperature 22–32°C', t >= 22 && t <= 32],
      ['RH 50–70%', rh >= 50 && rh <= 70],
      ['Rainfall <20 mm/week', rain < 20],
      ['Wind <8 km/h', w < 8],
      ['Soil moisture 60–70% AND drainage good', (sm ?? 0) >= 60 && (sm ?? 0) <= 70 && drainage === 'good']
    ]
    , meta: { windMin: 0, windMax: 8, soilMin: 60, soilMax: 70, wetMin: 0, wetMax: 6 }
  });

  items.push({
    name: 'Leaf Miner',
    checks: [
      ['Temperature 20–30°C', t >= 20 && t <= 30],
      ['RH 40–65%', rh >= 40 && rh <= 65],
      ['Rainfall <15 mm/week', rain < 15],
      ['Wind <6 km/h', w < 6],
      ['Leaf wetness <4h', lw < 4]
    ]
    , meta: { windMin: 0, windMax: 6, wetMin: 0, wetMax: 4, soilMin: 50, soilMax: 70 }
  });

  items.push({
    name: 'Woolly Apple Aphid',
    checks: [
      ['Temperature 15–25°C', t >= 15 && t <= 25],
      ['RH 65–85%', rh >= 65 && rh <= 85],
      ['Rainfall 10–25 mm/week', rain >= 10 && rain <= 25],
      ['Wind <10 km/h', w < 10],
      ['Soil moisture 65–80%', (sm ?? 0) >= 65 && (sm ?? 0) <= 80],
      ['High canopy humidity (>=70%)', typeof canopyHumidity === 'number' ? canopyHumidity >= 70 : false]
    ]
    , meta: { windMin: 0, windMax: 10, wetMin: 2, wetMax: 8, soilMin: 65, soilMax: 80 }
  });

  items.push({
    name: 'Green Apple Aphid',
    checks: [
      ['Temperature 14–24°C', t >= 14 && t <= 24],
      ['RH 55–75%', rh >= 55 && rh <= 75],
      ['Rainfall >20 mm/week', rain > 20],
      ['Wind <8 km/h', w < 8],
      ['High canopy humidity (>=70%)', typeof canopyHumidity === 'number' ? canopyHumidity >= 70 : false]
    ]
    , meta: { windMin: 0, windMax: 8, wetMin: 2, wetMax: 8, soilMin: 60, soilMax: 80 }
  });

  const mode = params.mode ?? 'standard';

  const results = items.map(item => {
    const sc = mode === 'meta'
      ? scoreFromMeta(item.name, item.meta as Meta | undefined, params)
      : scoreStandardItem(item, params);

    return {
      name: item.name,
      category: 'Pest' as const,
      score: sc.score,
      level: levelFor(sc.score),
      matchedFactors: sc.matchedFactors
    };
  }).sort((a, b) => b.score - a.score);

  return results;
}

export default calculateDiseaseRisks;
