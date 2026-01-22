import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Cloud, Droplets, ChevronDown } from 'lucide-react';
import {
  calculateDiseaseRisks,
  calculatePestRisks,
  ClimateParams,
} from '../utils/climateRiskRules';
import PlanetMapViewer from './PlanetMapViewer';
import jsPDF from 'jspdf';
import Speech from 'react-speech';

type View = 'Diseases' | 'Pests';

// Add this type at the top (after imports)
type BilingualList = { en: string[]; ur: string[] };

// Prevention strategies for common apple diseases
const diseasePreventionGuide: Record<string, BilingualList> = {
  'Apple Scab': {
    en: [
      'Apply fungicides before rain during spring and early summer',
      'Remove fallen leaves and debris to reduce spore sources',
      'Ensure good canopy air circulation through pruning',
      'Avoid overhead irrigation that increases leaf wetness',
      'Use resistant apple varieties when possible',
    ],
    ur: [
      'بہار اور ابتدائی گرمیوں میں بارش سے پہلے فنگس کش ادویات استعمال کریں',
      'گرے ہوئے پتے اور کچرا ہٹا دیں تاکہ جراثیم کم ہوں',
      'درخت کی مناسب کٹائی کریں تاکہ ہوا کا گزر بہتر ہو',
      'اوپر سے آبپاشی سے گریز کریں جو پتوں کو زیادہ دیر گیلا رکھتی ہے',
      'ممکن ہو تو بیماری سے محفوظ اقسام لگائیں',
    ],
  },
  'Apple Leaf Blotch (Alternaria)': {
    en: [
      'Remove infected leaves and fallen debris promptly',
      'Improve air circulation through canopy management',
      'Apply preventive fungicides during warm, humid periods',
      'Sanitize pruning tools to prevent spread',
      'Maintain balanced nitrogen fertilization',
    ],
    ur: [
      'متاثرہ پتے اور گرے ہوئے کچرے کو فوری طور پر ہٹا دیں',
      'درخت کی چھتری کے انتظام کے ذریعے ہوا کے بہاؤ کو بہتر بنائیں',
      'گرم، مرطوب موسم کے دوران حفاظتی فنگس کش ادویات لگائیں',
      'پھیلاؤ کو روکنے کے لیے کٹائی کے اوزاروں کو جراثیم سے پاک کریں',
      'نائٹروجن کی متوازن کھاد کو برقرار رکھیں',
    ],
  },
  'Powdery Mildew': {
    en: [
      'Apply sulfur or other fungicides during growing season',
      'Ensure adequate air flow by proper pruning',
      'Avoid over-fertilizing with nitrogen',
      'Remove infected leaves and shoots',
      'Plant resistant varieties in new orchards',
    ],
    ur: [
      'گروتھ کے موسم کے دوران سلفر یا دیگر فنگس کش ادویات لگائیں',
      'صحیح کٹائی کے ذریعے ہوا کے بہاؤ کو یقینی بنائیں',
      'نائٹروجن کے ساتھ زیادہ کھاد دینے سے گریز کریں',
      'متاثرہ پتے اور شاخیں ہٹا دیں',
      'نئے باغات میں بیماری سے محفوظ اقسام لگائیں',
    ],
  },
  'Brown Rot': {
    en: [
      'Remove mummified fruit and dead twigs from trees',
      'Apply fungicides during bloom and fruit development',
      'Thin fruits to allow better air circulation',
      'Harvest carefully to avoid fruit wounds',
      'Control insects to prevent fruit entry points',
    ],
    ur: [
      'درختوں سے ممی شدہ پھل اور مردہ ٹہنیاں ہٹا دیں',
      'پھولنے اور پھلوں کی نشوونما کے دوران فنگس کش ادویات لگائیں',
      'ہوا کے بہتر بہاؤ کی اجازت کے لیے پھلوں کو پتلا کریں',
      'پھلوں کے زخموں سے بچنے کے لیے احتیاط سے کٹائی کریں',
      'پھلوں کے داخلے کے مقامات کو روکنے کے لیے کیڑوں پر قابو پائیں',
    ],
  },
  "Bull's‑eye Rot": {
    en: [
      'Remove fruit with lenticels wounds during storage',
      'Maintain good orchard sanitation',
      'Store fruit at optimal humidity (90-95%) and temperature',
      'Apply fungicides to fruit before storage',
      'Ensure proper harvest technique to minimize skin damage',
    ],
    ur: [
      'ذخیرہ اندوزی کے دوران زخموں والے پھلوں کو ہٹا دیں',
      'باغ کی اچھی صفائی کو برقرار رکھیں',
      'پھلوں کو مثالی نمی (90-95%) اور درجہ حرارت پر ذخیرہ کریں',
      'ذخیرہ کرنے سے پہلے پھلوں پر فنگس کش ادویات لگائیں',
      'چمڑی کے نقصان کو کم کرنے کے لیے صحیح کٹائی کی تکنیک کو یقینی بنائیں',
    ],
  },
  'Sooty Blotch': {
    en: [
      'Improve air circulation by pruning lower branches',
      'Apply fungicides mid-summer through fruit development',
      'Reduce humidity through better canopy management',
      'Thin fruit clusters for better exposure',
      'Manage nearby fruit flies to reduce fungal transport',
    ],
    ur: [
      'نیچے کی شاخوں کی کٹائی کرکے ہوا کے بہاؤ کو بہتر بنائیں',
      'اوسط موسم گرما سے لے کر پھلوں کی نشوونما کے دوران فنگس کش ادویات لگائیں',
      'بہتر چھتری کے انتظام کے ذریعے نمی کو کم کریں',
      'بہتر نمائش کے لیے پھلوں کے گچھوں کو پتلا کریں',
      'فنگل ٹرانسپورٹ کو کم کرنے کے لیے قریبی پھلوں کی مکھیوں کا انتظام کریں',
    ],
  },
  Flyspeck: {
    en: [
      'Prune to improve air circulation within canopy',
      'Apply fungicides mid to late summer',
      'Manage humidity levels in the orchard',
      'Remove infected fruit before storage',
      'Sanitize storage facilities',
    ],
    ur: [
      'چھتری کے اندر ہوا کے بہاؤ کو بہتر بنانے کے لیے کٹائی کریں',
      'اوسط سے لے کر آخر موسم گرما تک فنگس کش ادویات لگائیں',
      'باغ میں نمی کی سطح کا انتظام کریں',
      'ذخیرہ کرنے سے پہلے متاثرہ پھلوں کو ہٹا دیں',
      'ذخیرہ کرنے کی سہولیات کو جراثیم سے پاک کریں',
    ],
  },
  'Collar / Root Rot': {
    en: [
      'Improve soil drainage through orchard management',
      'Avoid waterlogging by controlling irrigation',
      'Remove affected trees if disease is severe',
      'Use resistant rootstocks when replanting',
      'Maintain proper tree spacing for air flow',
    ],
    ur: [
      'باغ کے انتظام کے ذریعے مٹی کے نکاسی کے نظام کو بہتر بنائیں',
      'آبپاشی کو کنٹرول کرکے پانی جمع ہونے سے بچیں',
      'اگر بیماری شدید ہو تو متاثرہ درختوں کو ہٹا دیں',
      'دوبارہ لگاتے وقت بیماری سے محفوظ جڑوں کےstocks استعمال کریں',
      'ہوا کے بہاؤ کے لیے درختوں کے درمیان مناسب فاصلہ برقرار رکھیں',
    ],
  },
  'Fireblight': {
    en: [
      'Prune out infected branches 12 inches below canker',
      'Sterilize tools between cuts to prevent spread',
      'Avoid nitrogen over-fertilization',
      'Apply copper or antibiotic sprays at bloom time',
      'Remove branches with active oozing cankers',
    ],
    ur: [
      'متاثرہ شاخوں کو کینکر کے 12 انچ نیچے کاٹ دیں',
      'پھیلاؤ کو روکنے کے لیے کٹائی کے درمیان اوزاروں کو جراثیم سے پاک کریں',
      'نائٹروجن کے زیادہ کھاد دینے سے گریز کریں',
      'پھولنے کے وقت کاپر یا اینٹی بایوٹک اسپرے کریں',
      'فعال رساو والے کینکر والی شاخیں ہٹا دیں',
    ],
  },
};
// Pests
const pestPreventionGuide: Record<string, BilingualList> = {
  'Fruit Fly': {
    en: [
      'Use pheromone or bait traps',
      'Remove fallen and infested fruits',
      'Maintain orchard sanitation',
      'Apply bait sprays when required',
      'Harvest fruits on time',
    ],
    ur: [
      'فیرومون یا چارہ جال استعمال کریں',
      'گرے ہوئے اور متاثرہ پھل ہٹا دیں',
      'باغ کی صفائی برقرار رکھیں',
      'ضرورت کے مطابق چارہ اسپرے کریں',
      'پھل وقت پر توڑیں',
    ],
  },
  'Tent Caterpillar': {
    en: [
      'Remove and destroy egg masses',
      'Prune affected branches early',
      'Use biological control (Bt)',
      'Encourage natural predators',
      'Monitor trees during spring',
    ],
    ur: [
      'انڈوں کے بڑے پیمانے پر ہٹا دیں اور تباہ کریں',
      'متاثرہ شاخوں کی جلد کٹائی کریں',
      'حیاتیاتی کنٹرول (Bt) کا استعمال کریں',
      'قدرتی شکاریوں کو فروغ دیں',
      'بہار کے دوران درختوں کی نگرانی کریں',
    ],
  },
  'Fruit Borer': {
    en: [
      'Remove infested fruits regularly',
      'Use pheromone traps',
      'Apply recommended insecticides',
      'Maintain orchard hygiene',
      'Avoid fruit injuries',
    ],
    ur: [
      'باقاعدگی سے متاثرہ پھل ہٹا دیں',
      'فیرومون کے جال کا استعمال کریں',
      'تجویز کردہ کیڑے مار ادویات لگائیں',
      'باغ کی صفائی ستھرائی برقرار رکھیں',
      'پھلوں کے زخموں سے بچیں',
    ],
  },
  'European Red Mite': {
    en: [
      'Monitor mite population regularly',
      'Avoid excessive pesticide use',
      'Apply miticides when threshold exceeded',
      'Encourage predatory mites',
      'Maintain adequate irrigation',
    ],
    ur: [
      'باقاعدگی سے مائٹ کی آبادی کی نگرانی کریں',
      'کیڑے مار ادویات کے زیادہ استعمال سے گریز کریں',
      'جب حد سے تجاوز کریں تو مائٹیسائڈز لگائیں',
      'شکار کرنے والے مائٹس کو فروغ دیں',
      'کافی آبپاشی کو برقرار رکھیں',
    ],
  },
  'San José Scale': {
    en: [
      'Apply dormant oil sprays',
      'Prune and destroy infested branches',
      'Use systemic insecticides if severe',
      'Monitor crawler stage carefully',
      'Maintain orchard sanitation',
    ],
    ur: [
      'سست تیل کے اسپرے کریں',
      'متاثرہ شاخوں کو کاٹ کر تباہ کریں',
      'اگر شدید ہو تو نظامی کیڑے مار ادویات کا استعمال کریں',
      'کرم کے مرحلے کی احتیاط سے نگرانی کریں',
      'باغ کی صفائی برقرار رکھیں',
    ],
  },
  'Leaf Miner': {
    en: [
      'Remove affected leaves early',
      'Use pheromone traps',
      'Apply selective insecticides',
      'Encourage beneficial insects',
      'Avoid unnecessary spraying',
    ],
    ur: [
      'متاثرہ پتے جلدی ہٹا دیں',
      'فیرومون کے جال کا استعمال کریں',
      'انتخابی کیڑے مار ادویات لگائیں',
      'مفید کیڑوں کو فروغ دیں',
      'غیر ضروری اسپرے سے گریز کریں',
    ],
  },
  'Woolly Apple Aphid': {
    en: [
      'Use resistant rootstocks',
      'Encourage natural predators',
      'Apply insecticidal soap or oil',
      'Avoid excessive nitrogen',
      'Monitor root and shoot colonies',
    ],
    ur: [
      'بیماری سے محفوظ جڑوں کےstocks استعمال کریں',
      'قدرتی شکاریوں کو فروغ دیں',
      'کیڑوں کے مارنے والے صابن یا تیل کا استعمال کریں',
      'زیادہ نائٹروجن سے گریز کریں',
      'جڑوں اور پودوں کے کالونیوں کی نگرانی کریں',
    ],
  },
  'Green Apple Aphid': {
    en: [
      'Monitor young shoots regularly',
      'Encourage lady beetles and lacewings',
      'Use neem oil or soft insecticides',
      'Avoid nitrogen overuse',
      'Maintain plant vigor',
    ],
    ur: [
      'باقاعدگی سے جوان پتیوں کی نگرانی کریں',
      'لکڑی کے بھوکے کیڑوں اور پتنگوں کو فروغ دیں',
      'نیپام کا تیل یا نرم کیڑے مار ادویات کا استعمال کریں',
      'نائٹروجن کے زیادہ استعمال سے گریز کریں',
      'پودوں کی صحت کو برقرار رکھیں',
    ],
  },
};


// 1. Add recommended treatment maps (copy your lists here)
const diseaseRecommendedTreatment: Record<string, string[]> = {
  'Apple Scab': [
    'Mancozeb 75% WP (2–2.5 g/L) at green tip stage',
    'Myclobutanil / Hexaconazole (1 ml/L) during infection period',
    'Urea 5% spray on fallen leaves (autumn) to reduce spores',
    'Balanced NPK fertilization (avoid excess nitrogen)',
    'Calcium nitrate foliar spray to strengthen leaf tissue',
  ],
  'Apple Leaf Blotch (Alternaria)': [
    'Chlorothalonil (2 g/L) or Mancozeb (2 g/L)',
    'Propiconazole / Difenoconazole during humid weather',
    'Potassium nitrate (1%) foliar spray',
    'Avoid excess nitrogen fertilizers',
    'Apply micronutrients (Zn, B) if deficient',
  ],
  'Powdery Mildew': [
    'Sulfur 80% WP (2 g/L)',
    'Hexaconazole / Penconazole (1 ml/L)',
    'Potassium bicarbonate spray (5 g/L)',
    'Avoid high nitrogen fertilization',
    'Apply calcium-based foliar sprays',
  ],
  'Brown Rot': [
    'Carbendazim (1 g/L) or Tebuconazole (1 ml/L)',
    'Captan spray before harvest',
    'Boron foliar spray (0.2%) at flowering',
    'Balanced NPK nutrition',
    'Remove infected fruits and twigs',
  ],
  "Bull's-eye Rot": [
    'Thiophanate-methyl (1 g/L) pre-harvest',
    'Post-harvest fungicide dip (approved formulations)',
    'Calcium chloride spray (0.3–0.5%)',
    'Avoid fruit bruising during harvest',
    'Proper cold storage sanitation',
  ],
  'Sooty Blotch': [
    'Captan / Chlorothalonil sprays in summer',
    'Potassium nitrate (1%)',
    'Improve orchard aeration',
    'Avoid excessive irrigation',
    'Balanced nutrition program',
  ],
  'Flyspeck': [
    'Mancozeb or Captan sprays',
    'Summer fungicide coverage',
    'Canopy thinning',
    'Avoid prolonged leaf wetness',
    'Calcium sprays for fruit quality',
  ],
  'Collar / Root Rot': [
    'Metalaxyl / Fosetyl-Al soil drench',
    'Improve drainage immediately',
    'Apply Trichoderma-enriched compost',
    'Avoid water stagnation',
    'Use resistant rootstocks',
  ],
  'Necrotic Leaf Blotch (physiological)': [
    'Calcium nitrate (0.5%) foliar spray',
    'Potassium sulfate (1%) spray',
    'Avoid sudden heavy irrigation',
    'Correct nutrient imbalance',
    'Reduce plant stress (heat/water)',
  ],
};

const pestRecommendedTreatment: Record<string, string[]> = {
  'Fruit Fly': [
    'Protein bait + Spinosad spray',
    'Methyl eugenol traps',
    'Remove fallen fruits regularly',
    'Potassium-rich fertilization',
    'Avoid overripe fruit on trees',
  ],
  'Tent Caterpillar': [
    'Bacillus thuringiensis (Bt) spray',
    'Chlorpyrifos (only if severe)',
    'Manual nest removal',
    'Maintain tree vigor with balanced NPK',
    'Encourage birds and predators',
  ],
  'Fruit Borer': [
    'Emamectin benzoate (0.4 g/L)',
    'Spinosad (0.3 ml/L)',
    'Pheromone traps',
    'Remove infested fruits',
    'Avoid excess nitrogen',
  ],
  'European Red Mite': [
    'Propargite / Fenazaquin spray',
    'Wettable sulfur',
    'Adequate irrigation to reduce stress',
    'Avoid broad-spectrum insecticides',
    'Apply potassium-based fertilizers',
  ],
  'San José Scale': [
    'Dormant oil spray (2–3%)',
    'Chlorpyrifos during crawler stage',
    'Prune heavily infested branches',
    'Apply organic compost',
    'Monitor scale buildup',
  ],
  'Leaf Miner': [
    'Abamectin (0.5 ml/L)',
    'Spinosad spray',
    'Yellow sticky traps',
    'Avoid unnecessary pesticide sprays',
    'Balanced fertilization',
  ],
  'Woolly Apple Aphid': [
    'Imidacloprid soil application',
    'Neem oil spray (3 ml/L)',
    'Use resistant rootstocks',
    'Encourage natural enemies',
    'Avoid excess nitrogen',
  ],
  'Green Apple Aphid': [
    'Imidacloprid / Thiamethoxam',
    'Neem oil or insecticidal soap',
    'Potassium nitrate foliar spray',
    'Encourage lady beetles',
    'Avoid excess nitrogen fertilization',
  ],
};


function normalizeName(name: string): string {
  // Replace all types of dashes with a regular hyphen, remove extra spaces
  return name
    .replace(/[\u2011\u2012\u2013\u2014\u2015]/g, '-') // replace en/em/non-breaking dashes
    .replace(/\s*-\s*/g, '-') // remove spaces around hyphens
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

export default function ClimateRiskPredictor(): JSX.Element {
  const [view, setView] = useState<View>('Diseases');
  const [riskModel, setRiskModel] = useState<'standard' | 'meta'>('standard');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showClimateForm, setShowClimateForm] = useState(false);

 const [viewParams, setViewParams] = useState<any>({
  temperature: 0,
  rh: 0,
  weeklyRainfall: 0,
  leafWetness: 0,
  windSpeed: 0,
  soilMoisture: 0,
  canopyHumidity: 0,
  dustLevel: 'unknown',
  drainage: 'unknown',
  hasStandingWater48h: false,
  hasTempJump10C: false,
  hadDroughtThenHeavyRain: false,
  latitude: 34.1,  // default if map not used yet
  longitude: 74.8,
});

  const [results, setResults] = useState<any[]>([]);
  const [farmHealthScore, setFarmHealthScore] = useState(85);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
      const populateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, []);

 const handleChange = (key: string, value: any) => {
  setViewParams((prev) => ({
    ...prev,
    [key]: typeof value === 'number' ? value : value ?? 0,
  }));
};

  // Calculate Farm Health Score based on climate & disease risks
  const calculateFarmHealth = (climateParams: any, diseaseResults: any[]) => {
    // Climate Score (0-50 points)
    let climateScore = 50;

    // Penalize for adverse climate conditions
    if (climateParams.temperature < 15 || climateParams.temperature > 28) {
      climateScore -= 8; // Non-optimal temperature
    }
    if (climateParams.rh > 85) {
      climateScore -= 10; // High humidity favors diseases
    }
    if (climateParams.weeklyRainfall > 30) {
      climateScore -= 8; // Excessive rainfall
    }
    if (climateParams.leafWetness > 12) {
      climateScore -= 7; // Extended leaf wetness
    }
    if (climateParams.windSpeed < 2) {
      climateScore -= 5; // Poor air circulation
    }
    if (climateParams.hasStandingWater48h) {
      climateScore -= 10;
    }
    if (climateParams.hasTempJump10C) {
      climateScore -= 8;
    }
    if (climateParams.hadDroughtThenHeavyRain) {
      climateScore -= 9;
    }

    climateScore = Math.max(0, climateScore);

    // Disease Risk Score (0-50 points)
    // Based on number of diseases: More diseases = Lower score, Fewer diseases = Higher score
    let diseaseScore = 50;

    if (diseaseResults.length > 0) {
      const highRiskCount = diseaseResults.filter(
        (r) => r.level === 'High'
      ).length;
      const mediumRiskCount = diseaseResults.filter(
        (r) => r.level === 'Medium'
      ).length;
      const lowRiskCount = diseaseResults.filter(
        (r) => r.level === 'Low'
      ).length;

      // Calculate weighted penalty based on disease count and severity
      const highPenalty = highRiskCount * 15;    // 15 points per high-risk disease
      const mediumPenalty = mediumRiskCount * 8; // 8 points per medium-risk disease
      
      // Low-risk only affects score when >= 9
      const lowPenalty = lowRiskCount >= 9 ? lowRiskCount * 3 : 0;

      diseaseScore -= (highPenalty + mediumPenalty + lowPenalty);

      // Bonus for having very few diseases
      const totalDiseases = highRiskCount + mediumRiskCount + lowRiskCount;
      if (totalDiseases <= 2 && highRiskCount === 0) {
        diseaseScore += 10; // Bonus for minimal disease presence
      }
    } else {
      // No diseases = Maximum score
      diseaseScore = 50;
    }

    diseaseScore = Math.max(0, Math.min(50, diseaseScore));

    // Total Farm Health Score (0-100)
    const totalScore = Math.round((climateScore + diseaseScore) / 2);

    setFarmHealthScore(totalScore);
    return totalScore;
  };
// PREDICT BUTTON
// ------------------- HANDLE PREDICT -------------------
const handlePredict = () => {
  console.log('🔵 Live Predict clicked');
  console.log('🧠 Current viewParams:', viewParams);
  console.log('⚙️ Current riskModel:', riskModel);

  const isMeta = riskModel === 'meta';

  // ---- HARD SAFE DEFAULTS (Meta will crash without these) ----
  const safeView = {
    ...viewParams,
    dustLevel: viewParams.dustLevel ?? 'low',
    drainage: viewParams.drainage ?? 'good',
    hasStandingWater48h: !!viewParams.hasStandingWater48h,
    hasTempJump10C: !!viewParams.hasTempJump10C,
    hadDroughtThenHeavyRain: !!viewParams.hadDroughtThenHeavyRain,
  };

  console.log('🛡️ Safe viewParams used:', safeView);

  const paramsForRules: any = {
    temperature: Number(safeView.temperature || 0),
    rh: Number(safeView.rh || 0),
    relativeHumidity: Number(safeView.rh || 0),
    weeklyRainfall: Number(safeView.weeklyRainfall || 0),
    rainfall: Number(safeView.weeklyRainfall || 0),
    leafWetness: Number(safeView.leafWetness || 0),
    wetnessHours: Number(safeView.leafWetness || 0),
    windSpeed: Number(safeView.windSpeed || 0),
    soilMoisture: Number(safeView.soilMoisture || 0),
    canopyHumidity: Number(safeView.canopyHumidity || 0),

    // 🔴 NEVER UNDEFINED FOR META
    dustLevel: safeView.dustLevel,
    drainage: safeView.drainage,
    mode: riskModel,

    // 🔴 Meta expects numeric flags
    hasStandingWater48h: isMeta ? (safeView.hasStandingWater48h ? 1 : 0) : 0,
    hasTempJump10C: isMeta ? (safeView.hasTempJump10C ? 1 : 0) : 0,
    hadDroughtThenHeavyRain: isMeta ? (safeView.hadDroughtThenHeavyRain ? 1 : 0) : 0,
  };

  console.log('🚀 Params sent to engine (Live):', paramsForRules);

  try {
    let res =
      view === 'Diseases'
        ? calculateDiseaseRisks(paramsForRules as ClimateParams)
        : calculatePestRisks(paramsForRules as ClimateParams);

    // Inject recommended treatment
    res = res.map((item: any) => ({
      ...item,
      treatment:
        view === 'Diseases'
          ? (diseaseRecommendedTreatment[item.name]?.[0] ?? item.treatment)
          : (pestRecommendedTreatment[item.name]?.[0] ?? item.treatment),
    }));

    console.log('📊 Engine result:', res);

    const sliced = res.slice(0, 10);
    setResults(sliced);
    calculateFarmHealth(paramsForRules, sliced);
  } catch (err) {
    console.error('❌ META LIVE CRASH PREVENTED', err);
    setResults([]);
  }
};

// ------------------- HANDLE PLANET AUTO-FILL -------------------
const handlePlanetAutoFill = (climate: any) => {
  console.log('🟢 Planet autofill triggered with climate:', climate);
  setIsAutoFilling(true);

  // ---- Weekly rainfall calculation ----
  const weeklyRainfall =
    climate.weeklyRainfall != null
      ? Number(climate.weeklyRainfall)
      : climate.rainfall != null
      ? Number(climate.rainfall) * 7
      : 0;

  console.log('🌧️ Computed weeklyRainfall:', weeklyRainfall);

  // ---- Update UI params (booleans stay booleans) ----
  const updatedParams = {
    temperature: Number(climate.temperature ?? 0),
    rh: Number(climate.rh ?? climate.relativeHumidity ?? 0),
    weeklyRainfall,
    leafWetness: Number(climate.leafWetness ?? climate.wetnessHours ?? 0),
    windSpeed: Number(climate.windSpeed ?? 0),
    soilMoisture: Number(climate.soilMoisture ?? 0),
    canopyHumidity: Number(climate.canopyHumidity ?? 0),

    dustLevel: viewParams.dustLevel ?? 'low',
    drainage: viewParams.drainage ?? 'good',

    // 🔒 advanced flags remain boolean in state
    hasStandingWater48h: !!viewParams.hasStandingWater48h,
    hasTempJump10C: !!viewParams.hasTempJump10C,
    hadDroughtThenHeavyRain: !!viewParams.hadDroughtThenHeavyRain,
  };

  console.log('📦 Updated viewParams from Planet:', updatedParams);
  setViewParams(updatedParams);

  // ---- Auto predict ----
  setTimeout(() => {
    const isMeta = riskModel === 'meta';
    console.log('⚙️ Auto-predict mode:', riskModel);

    const paramsForRules: any = {
      temperature: updatedParams.temperature,
      rh: updatedParams.rh,
      relativeHumidity: updatedParams.rh,
      weeklyRainfall: updatedParams.weeklyRainfall,
      rainfall: updatedParams.weeklyRainfall,
      leafWetness: updatedParams.leafWetness,
      wetnessHours: updatedParams.leafWetness,
      windSpeed: updatedParams.windSpeed,
      soilMoisture: updatedParams.soilMoisture,
      canopyHumidity: updatedParams.canopyHumidity,
      dustLevel: updatedParams.dustLevel,
      drainage: updatedParams.drainage,
      mode: riskModel,

      // 🔴 Meta gets numbers only
      hasStandingWater48h: isMeta ? (updatedParams.hasStandingWater48h ? 1 : 0) : 0,
      hasTempJump10C: isMeta ? (updatedParams.hasTempJump10C ? 1 : 0) : 0,
      hadDroughtThenHeavyRain: isMeta ? (updatedParams.hadDroughtThenHeavyRain ? 1 : 0) : 0,
    };

    console.log('🚀 Params sent to engine (Planet):', paramsForRules);

    try {
      let res =
        view === 'Diseases'
          ? calculateDiseaseRisks(paramsForRules as ClimateParams)
          : calculatePestRisks(paramsForRules as ClimateParams);

      // Inject recommended treatment
      res = res.map((item: any) => ({
        ...item,
        treatment:
          view === 'Diseases'
            ? (diseaseRecommendedTreatment[item.name]?.[0] ?? item.treatment)
            : (pestRecommendedTreatment[item.name]?.[0] ?? item.treatment),
      }));

      console.log('📊 Engine result:', res);

      const sliced = res.slice(0, 10);
      setResults(sliced);
      calculateFarmHealth(paramsForRules, sliced);
    } catch (err) {
      console.error('❌ Planet Meta calculation failed:', err);
      setResults([]);
    }

    setIsAutoFilling(false);
  }, 300);
};

  const topResults = results.slice(0, 3);
  const highRiskCount = results.filter((r) => r.level === 'High').length;
  const mediumRiskCount = results.filter((r) => r.level === 'Medium').length;

  // Determine health status color
  const getHealthColor = () => {
    if (farmHealthScore >= 80) return 'emerald';
    if (farmHealthScore >= 60) return 'yellow';
    if (farmHealthScore >= 40) return 'orange';
    return 'red';
  };

  const getHealthColorClasses = (score: number) => {
    if (score >= 80)
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
      };
    if (score >= 60)
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        bar: 'bg-yellow-500',
      };
    if (score >= 40)
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        bar: 'bg-orange-500',
      };
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      bar: 'bg-red-500',
    };
  };

  const healthColors = getHealthColorClasses(farmHealthScore);

  // Download report as PDF
const handleDownloadReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  let page = 1;

  const logoBase64 =  'iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEtGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTAzPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjYxNzg0ODQyLWYxMWMtNDY1NC05Yzk4LWJjZWZjODcyNzMyNDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5BcHBsZUt1bCAtIDE8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjph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'; // <-- your base64 string here
const logoWidth = 38;
const logoHeight = 38;
doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
y = 50; // move below logo

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('AppleKul Skyinsights', pageWidth / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Prediction Report`, pageWidth / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(11);
  doc.text(`Farm Health Score: ${farmHealthScore}%`, 12, y);
  y += 8;
  doc.setDrawColor(180);
  doc.line(10, y, pageWidth - 10, y);
  y += 6;

  // Filter out zero score results
  const filteredResults = results.filter((res: any) => res.score > 0);

  filteredResults.forEach((res: any, idx: number) => {
    if (y > 250) {
      doc.setFontSize(10);
      doc.text(`Page ${page}`, pageWidth - 20, 290);
      doc.addPage();
      y = 20;
      page += 1;
    }

    // Normalize name for lookup and display
    const normName = normalizeName(res.name);

    // Disease/Pest Name and Risk
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(
      `${idx + 1}. ${normName} (${res.level ? res.level.toUpperCase() : 'UNKNOWN'})`,
      12,
      y
    );
    y += 7;

    // Score
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Score: ${Math.round(res.score)}%`, 14, y);
    y += 7;

    // Recommended Treatments
    const treatmentList =
      view === 'Diseases'
        ? diseaseRecommendedTreatment[normName]
        : pestRecommendedTreatment[normName];
    if (treatmentList && treatmentList.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Recommended Treatments:', 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      treatmentList.forEach((treat: string) => {
        doc.text(`• ${treat}`, 16, y);
        y += 6;
      });
    } else if (res.treatment) {
      doc.text(`Recommended Treatment: ${res.treatment}`, 14, y);
      y += 7;
    }

    // Prevention Guide
    const guide = view === 'Diseases'
      ? diseasePreventionGuide[normName]
      : pestPreventionGuide[normName];
    if (guide && guide.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Prevention Guide:', 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      guide.forEach((tip: string) => {
        doc.text(`• ${tip}`, 16, y);
        y += 6;
      });
    }

    // Separator
    y += 2;
    doc.setDrawColor(220);
    doc.line(12, y, pageWidth - 12, y);
    y += 7;
  });

  // Footer with page number
  doc.setFontSize(10);
  doc.text(`Page ${page}`, pageWidth - 20, 290);

  doc.save('prediction_report.pdf');
};

  // Voice selection: Prefer Hindi, Urdu-India, then Urdu, then default
  const urduVoice =
    voices?.find(
      (v) =>
        (v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().startsWith('ur-in'))) ||
        (v.name && (v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('urdu'))
        )
    ) ||
    voices?.find(
      (v) =>
        (v.lang && v.lang.toLowerCase().startsWith('ur')) ||
        (v.name && v.name.toLowerCase().includes('urdu'))
    ) ||
    voices?.[0];

  // Urdu summary: Use Urdu name and tips if available, else fallback to English
  const getUrduSummary = () => {
    if (!Array.isArray(results) || results.length === 0) return 'کوئی نتیجہ دستیاب نہیں۔';
    return results.slice(0, 3).map((r) => {
      const normName = normalizeName(r.name);

      // Use Urdu name from map, fallback to English if not found
      const urduName =
        view === 'Diseases'
          ? diseaseUrduNames[r.name] || diseasePreventionGuide?.[normName]?.ur?.[0] || r.name
          : pestUrduNames[r.name] || pestPreventionGuide?.[normName]?.ur?.[0] || r.name;

      // Urdu tips if available, else English tips
      const urduTips =
        view === 'Diseases'
          ? diseasePreventionGuide?.[normName]?.ur
          : pestPreventionGuide?.[normName]?.ur;

      const tipsText = urduTips && urduTips.length > 0
        ? urduTips.join('، ')
        : (
          (view === 'Diseases'
            ? diseasePreventionGuide?.[normName]?.en
            : pestPreventionGuide?.[normName]?.en
          )?.slice(0, 2).join('، ') || 'کوئی احتیاطی تدابیر دستیاب نہیں۔'
        );

      return `پیش گوئی شدہ ${view === 'Diseases' ? 'بیماری' : 'کیڑا'}: ${urduName}۔ احتیاطی تدابیر: ${tipsText}`;
    }).join(' ');
  };

  // Handler for speaker icon click
  const handleSpeakUrdu = () => {
    if (!supported) return;
    const text = getUrduSummary();
    speak({
      text,
      voice: urduVoice,
      lang: urduVoice?.lang || 'ur-PK',
      rate: 0.95,
    });
  };

  return (
    <div className="card card-lg h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-200">
        <div className="flex items-center space-x-2">
          
          <span className="text-lg font-semibold text-green-900">
             Dashboard
          </span>
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('Diseases')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              view === 'Diseases'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌿 Diseases
          </button>
          <button
            onClick={() => setView('Pests')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              view === 'Pests'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🐛 Pests
          </button>
        </div>
      </div>

      {/* AUTO-FILL INDICATOR */}
      {isAutoFilling && (
        <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          <span>Loading live climate data from Planet...</span>
        </div>
      )}

      {/* Toggle Button for Climate Form */}
  <div className="mb-3 w-full flex bg-gray-100 rounded-lg p-1 shadow-sm">
  <button
    onClick={() => setShowClimateForm(false)}
    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      !showClimateForm
        ? 'bg-[#06542A] text-white shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    🛰️ Satellite Live
  </button>

  <button
    onClick={() => setShowClimateForm(true)}
    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      showClimateForm
        ? 'bg-[#06542A] text-white shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    🚀 Satellite Live Plus
  </button>
</div>


      {/* 2-column layout - hide left panel unless form is shown */}
      <div className={`grid gap-4 flex-1 overflow-hidden ${showClimateForm ? 'grid-cols-1 lg:grid-cols-[1fr_1.6fr]' : 'grid-cols-1'}`}>
        {/* LEFT PANEL: Climate inputs - only shown if toggled */}
        {showClimateForm && (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2">
          {/* Risk Model */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Risk Model
              </label>
              <select
                value={riskModel}
                onChange={(e) => setRiskModel(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
              >
                <option value="standard">📋 Standard (rule-based)</option>
                <option value="meta">📊 Meta (range-based)</option>
              </select>
            </div>
          </div>

          {/* Climate Parameters */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">
                Climate Parameters
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  🌡️ Temp (°C)
                </label>
                <input
                  type="number"
                  value={viewParams.temperature}
                  onChange={(e) =>
                    handleChange('temperature', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  💧 RH (%)
                </label>
                <input
                  type="number"
                  value={viewParams.rh}
                  onChange={(e) => handleChange('rh', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  🌧️ Weekly Rainfall (mm)
                </label>
                <input
                  type="number"
                  value={viewParams.weeklyRainfall}
                  onChange={(e) =>
                    handleChange('weeklyRainfall', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  🍃 Leaf Wetness (h)
                </label>
                <input
                  type="number"
                  value={viewParams.leafWetness}
                  onChange={(e) =>
                    handleChange('leafWetness', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  💨 Wind Speed (km/h)
                </label>
                <input
                  type="number"
                  value={viewParams.windSpeed}
                  onChange={(e) =>
                    handleChange('windSpeed', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  🌍 Soil Moisture (%)
                  <span className="text-gray-400 font-normal text-[10px] ml-1">
                    opt
                  </span>
                </label>
                <input
                  type="number"
                  value={viewParams.soilMoisture}
                  onChange={(e) =>
                    handleChange('soilMoisture', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ☁️ Canopy Humidity (%)
                  <span className="text-gray-400 font-normal text-[10px] ml-1">
                    opt
                  </span>
                </label>
                <input
                  type="number"
                  value={viewParams.canopyHumidity}
                  onChange={(e) =>
                    handleChange('canopyHumidity', Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* DRILL-DOWN SECTION */}
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-all mt-1"
              >
                <span className="text-xs font-medium text-gray-700">
                  🔧 Advanced Options
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-600 transition-transform ${
                    showAdvancedOptions ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* EXPANDED ADVANCED OPTIONS */}
              {showAdvancedOptions && (
                <div className="mt-2 p-2.5 bg-white border border-blue-200 rounded-lg space-y-2.5">
                  {/* Condition Checkboxes */}
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={viewParams.hasStandingWater48h}
                        onChange={(e) =>
                          handleChange('hasStandingWater48h', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded accent-blue-600"
                      />
                      <span className="text-xs text-gray-700">
                        💧 Standing water &gt;48h
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={viewParams.hasTempJump10C}
                        onChange={(e) =>
                          handleChange('hasTempJump10C', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded accent-blue-600"
                      />
                      <span className="text-xs text-gray-700">
                        🌡️ Temp jump &gt;10°C
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={viewParams.hadDroughtThenHeavyRain}
                        onChange={(e) =>
                          handleChange(
                            'hadDroughtThenHeavyRain',
                            e.target.checked
                          )
                        }
                        className="w-3.5 h-3.5 rounded accent-blue-600"
                      />
                      <span className="text-xs text-gray-700">
                        🌩️ Drought then heavy rain
                      </span>
                    </label>
                  </div>

                  {/* Selects */}
                  <div className="space-y-2 border-t border-gray-200 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ✨ Dust Level
                      </label>
                      <select
                        value={viewParams.dustLevel}
                        onChange={(e) =>
                          handleChange('dustLevel', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="unknown">Unknown</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        🌊 Drainage
                      </label>
                      <select
                        value={viewParams.drainage}
                        onChange={(e) =>
                          handleChange('drainage', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="unknown">Unknown</option>
                        <option value="good">Good</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handlePredict}
                disabled={isAutoFilling}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                🔍 Predict Risk
              </button>
              <button
                onClick={() => {
                  setResults([]);
                  setFarmHealthScore(85);
                }}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* FARM HEALTH SCORE - BELOW BUTTONS */}
          <div
            className={`${healthColors.bg} ${healthColors.border} p-4 rounded-lg border`}
          >
            <div className="text-xs font-semibold text-gray-700 mb-2">
              🌱 Farm Health Score
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${healthColors.text} mb-1`}>
                {farmHealthScore}%
              </div>
              <div className="text-[11px] text-gray-600 mb-3">
                Overall Farm Condition
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${healthColors.bar} transition-all duration-500`}
                  style={{ width: `${farmHealthScore}%` }}
                ></div>
              </div>

              {/* Health status text */}
              <div className={`text-xs font-semibold ${healthColors.text}`}>
                {farmHealthScore >= 80
                  ? '✅ Excellent'
                  : farmHealthScore >= 60
                  ? '⚠️ Good'
                  : farmHealthScore >= 40
                  ? '⚡ Fair'
                  : '🚨 Poor'}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* RIGHT PANEL: Planet Map Viewer - full width unless climate form is shown */}
        <div className="h-full overflow-hidden rounded-lg border border-gray-200">
          <PlanetMapViewer
            initialLat={viewParams.latitude ?? 34.1}
            initialLon={viewParams.longitude ?? 74.8}
            configId="0dc5fcdc-69e2-4789-8511-6b0cc7efbff3"
            onAutoFill={handlePlanetAutoFill}
          />
        </div>
      </div>

      {/* RESULTS SECTION - BOTTOM */}
      {Array.isArray(results) && results.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Speaker Icon */}
          <div className="flex items-center mb-2">
            <Speech
              text={getUrduSummary()}
              voice={
                voices?.find(
                  v =>
                    (v.lang && v.lang.toLowerCase().startsWith('ur')) ||
                    (v.name && v.name.toLowerCase().includes('urdu'))
                )?.name || voices?.[0]?.name || ''
              }
              lang={
                voices?.find(
                  v =>
                    (v.lang && v.lang.toLowerCase().startsWith('ur')) ||
                    (v.name && v.name.toLowerCase().includes('urdu'))
                )?.lang || 'ur-PK'
              }
              rate={0.95}
              pitch={1}
              volume={1}
              textAsButton={true}
              displayText={
                <span className="mr-2 text-green-700 hover:text-green-900 cursor-pointer flex items-center">
                  {/* Speaker SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5L6 9H3v6h3l5 4V5zm7.07 2.93a9 9 0 010 12.73m-2.83-2.83a5 5 0 000-7.07"
                    />
                  </svg>
                  <span className="text-xs text-gray-500 ml-1">نتائج سنیں</span>
                </span>
              }
            />
          </div>
          {/* Risk Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-red-700">{highRiskCount}</div>
              <div className="text-xs text-red-600">High Risk</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-yellow-700">
                {mediumRiskCount}
              </div>
              <div className="text-xs text-yellow-600">Medium Risk</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-green-700">
                {results.filter((r) => r.level === 'Low').length}
              </div>
              <div className="text-xs text-green-600">Low Risk</div>
            </div>
          </div>

          {/* Top Results */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.slice(0, 3).map((r, idx) => {
              const preventionTips =
                view === 'Diseases'
                  ? diseasePreventionGuide?.[r.name]?.en ?? []
                  : pestPreventionGuide?.[r.name]?.en ?? [];

              return (
                <div
                  key={`${r.name}-${idx}`}
                  className="border border-gray-200 rounded-lg p-3 bg-white text-xs"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold text-gray-800">
                      #{idx + 1} {r.name}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.level === 'High'
                          ? 'bg-red-100 text-red-700'
                          : r.level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {r.level}
                    </span>
                  </div>

                  {/* SCORE */}
                  <div className="text-gray-600 mb-1">
                    📊 Score: <b>{Math.round(r.score)}%</b>
                  </div>

                  {/* MATCHED FACTORS */}
                  {Array.isArray(r.matchedFactors) && r.matchedFactors.length > 0 && (
                    <div className="text-[11px] text-gray-500 mb-2">
                      <b>Matched:</b> {r.matchedFactors.join(', ')}
                    </div>
                  )}

                  {/* PREVENTION TIPS */}
                  {preventionTips.length > 0 && (
                    <div className="mt-2 text-[11px] bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="font-medium text-gray-700 mb-1">
                        💡 Prevention Tips
                      </div>

                      {preventionTips.slice(0, 2).map((tip) => (
                        <div key={tip} className="text-gray-600 mb-1 leading-tight">
                          • {tip}
                        </div>
                      ))}

                      {preventionTips.length > 2 && (
                        <div className="text-gray-400 text-[10px] mt-1 pt-1 border-t border-gray-100">
                          +{preventionTips.length - 2} more strategies
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-xs font-medium">
            Select parameters and click &quot;Predict Risk&quot; or use Planet data
          </p>
        </div>
      )}

      {/* Download Report Button */}
      <button
        className="mt-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={handleDownloadReport}
      >
        Download Report (PDF)
      </button>
    </div>
  );
}

const diseaseUrduNames: Record<string, string> = {
  'Apple Scab': 'سیب کی جھلسی',
  'Apple Leaf Blotch (Alternaria)': 'سیب کے پتوں کا دھبہ (الٹرنیریا)',
  'Powdery Mildew': 'سفید پھپھوندی',
  'Brown Rot': 'براؤن روت',
  "Bull's‑eye Rot": 'بلز‑آئی روت',
  'Sooty Blotch': 'کالا دھبہ',
  'Flyspeck': 'چھوٹے کالے دھبے',
  'Collar / Root Rot': 'گردن / جڑوں کا سڑنا',
  'Fireblight': 'فائربلائٹ',
};

const pestUrduNames: Record<string, string> = {
  'Fruit Fly': 'پھل مکھی',
  'Tent Caterpillar': 'ٹینٹ کیٹرپِلر (خیمے والا کیڑا)',
  'Fruit Borer': 'پھل خور کیڑا',
  'European Red Mite': 'یورپی سرخ مائٹ',
  'San José Scale': 'سین جوزے کا پودا چھلکا',
  'Leaf Miner': 'پتہ خور کیڑا',
  'Woolly Apple Aphid': 'اونچی سیب کی افڈ',
  'Green Apple Aphid': 'سبز سیب کی افڈ',
};
